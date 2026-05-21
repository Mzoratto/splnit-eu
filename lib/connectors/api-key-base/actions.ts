"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { recordActivationEvent } from "@/lib/activation/events";
import { createAuditLog } from "@/lib/db/queries/audit-logs";
import { disconnectIntegrationConnection } from "@/lib/db/queries/integrations";
import { acquireIntegrationRunLock } from "@/lib/integrations/locks";
import { checkConnectorCredentialHealth } from "./health";
import { saveConnectorCredential } from "./storage";
import type {
  ConnectorActionResult,
  ConnectorCredentialInput,
  ConnectorPlatform,
} from "./types";

const hetznerCredentialSchema = z.object({
  apiKey: z.string().min(1).max(4096),
  platform: z.literal("hetzner"),
});

const ovhcloudCredentialSchema = z.object({
  appKey: z.string().min(1).max(4096),
  appSecret: z.string().min(1).max(4096),
  consumerKey: z.string().min(1).max(4096),
  platform: z.literal("ovhcloud"),
  serviceName: z.string().max(200).optional().nullable(),
});

const connectorCredentialSchema = z.discriminatedUnion("platform", [
  hetznerCredentialSchema,
  ovhcloudCredentialSchema,
]);

const platformSchema = z.enum(["hetzner", "ovhcloud"]);

function requireActiveOrganisation(session: Awaited<ReturnType<typeof auth>>) {
  if (!session.userId || !session.orgId) {
    throw new Error("Active Clerk organisation is required.");
  }

  return {
    clerkOrgId: session.orgId,
    userId: session.userId,
  };
}

function revalidateConnectorPaths(platform: ConnectorPlatform) {
  revalidatePath("/dashboard");
  revalidatePath("/controls");
  revalidatePath("/integrations");
  revalidatePath(`/integrations/${platform}`);
  revalidatePath("/settings/audit-log");
}

async function validateAndStoreCredential(input: {
  action: "connect" | "rotate";
  credential: ConnectorCredentialInput;
  clerkOrgId: string;
  userId: string;
}): Promise<ConnectorActionResult> {
  // Reuses lock pattern from lib/integrations/locks.ts acquireIntegrationRunLock.
  // Do not reimplement: this keeps API-key connector mutations per-org/provider idempotent.
  const lock = await acquireIntegrationRunLock({
    clerkOrgId: input.clerkOrgId,
    provider: input.credential.platform,
  });

  if (!lock.acquired) {
    return {
      error: "unreachable",
      ok: false,
    };
  }

  try {
    const health = await checkConnectorCredentialHealth({
      credentials: input.credential,
      platform: input.credential.platform,
    });

    if (health !== "connected") {
      await createAuditLog({
        action: `integration.${input.action}_failed`,
        clerkOrgId: input.clerkOrgId,
        clerkUserId: input.userId,
        entityId: input.credential.platform,
        entityType: "integration",
        metadata: {
          provider: input.credential.platform,
          reason: health,
          tokenType: "api_key",
        },
      });

      return {
        error: health,
        ok: false,
      };
    }

    const integration = await saveConnectorCredential({
      clerkOrgId: input.clerkOrgId,
      credential: input.credential,
      status: health,
    });

    await createAuditLog({
      action: input.action === "connect"
        ? "integration.connected"
        : "integration.rotated",
      clerkOrgId: input.clerkOrgId,
      clerkUserId: input.userId,
      entityId: integration.id,
      entityType: "integration",
      metadata: {
        provider: input.credential.platform,
        tokenType: "api_key",
      },
    });

    await recordActivationEvent({
      clerkOrgId: input.clerkOrgId,
      clerkUserId: input.userId,
      entityId: integration.id,
      entityType: "connector",
      metadata: {
        provider: input.credential.platform,
        tokenType: "api_key",
      },
      name: "ConnectorOAuthCompleted",
    });

    revalidateConnectorPaths(input.credential.platform);

    return {
      ok: true,
      status: "connected",
    };
  } finally {
    await lock.release();
  }
}

export async function connectApiKeyConnectorAction(
  input: ConnectorCredentialInput,
): Promise<ConnectorActionResult> {
  const credential = connectorCredentialSchema.parse(input);
  const session = requireActiveOrganisation(await auth());

  return validateAndStoreCredential({
    action: "connect",
    clerkOrgId: session.clerkOrgId,
    credential,
    userId: session.userId,
  });
}

export async function rotateApiKeyConnectorAction(
  input: ConnectorCredentialInput,
): Promise<ConnectorActionResult> {
  const credential = connectorCredentialSchema.parse(input);
  const session = requireActiveOrganisation(await auth());

  return validateAndStoreCredential({
    action: "rotate",
    clerkOrgId: session.clerkOrgId,
    credential,
    userId: session.userId,
  });
}

export async function disconnectApiKeyConnectorAction(platform: ConnectorPlatform) {
  const parsedPlatform = platformSchema.parse(platform);
  const session = requireActiveOrganisation(await auth());
  const result = await disconnectIntegrationConnection({
    clerkOrgId: session.clerkOrgId,
    provider: parsedPlatform,
  });

  if (result.disconnected) {
    await createAuditLog({
      action: "integration.disconnected",
      clerkOrgId: session.clerkOrgId,
      clerkUserId: session.userId,
      entityId: result.integrationId ?? parsedPlatform,
      entityType: "integration",
      metadata: {
        provider: parsedPlatform,
        resetControls: result.resetControls,
        tokenType: "api_key",
      },
    });
  }

  revalidateConnectorPaths(parsedPlatform);

  return result;
}
