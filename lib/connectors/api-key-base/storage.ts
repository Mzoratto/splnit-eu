import { and, eq } from "drizzle-orm";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { getDb } from "@/lib/db";
import { integrations } from "@/lib/db/schema";
import type {
  ConnectorCredentialInput,
  ConnectorPlatform,
  HealthCheckResult,
  StoredConnectorCredential,
} from "./types";

type IntegrationConfig = Record<string, unknown>;

function clean(value: string) {
  return value.trim();
}

function getConsumerKeyEnc(config: IntegrationConfig) {
  const value = config.consumerKeyEnc;
  return typeof value === "string" && value.trim() ? value : null;
}

function getServiceName(config: IntegrationConfig) {
  const value = config.serviceName;
  return typeof value === "string" && value.trim() ? value : null;
}

export function encryptedValuesForCredential(
  credential: ConnectorCredentialInput,
  clerkOrgId: string,
) {
  if (credential.platform === "hetzner") {
    return {
      accessTokenEnc: encryptSecret(clean(credential.apiKey), clerkOrgId),
      config: {
        credentialType: "api_key",
        tokenType: "api_key",
      },
      refreshTokenEnc: null,
      tokenExpiresAt: null,
    };
  }

  return {
    accessTokenEnc: encryptSecret(clean(credential.appKey), clerkOrgId),
    config: {
      consumerKeyEnc: encryptSecret(clean(credential.consumerKey), clerkOrgId),
      credentialType: "ovhcloud_three_part",
      serviceName: credential.serviceName?.trim() || null,
      tokenType: "api_key",
    },
    refreshTokenEnc: encryptSecret(clean(credential.appSecret), clerkOrgId),
    tokenExpiresAt: null,
  };
}

export async function saveConnectorCredential(input: {
  clerkOrgId: string;
  credential: ConnectorCredentialInput;
  status?: HealthCheckResult;
}) {
  const db = getDb();
  const encrypted = encryptedValuesForCredential(input.credential, input.clerkOrgId);
  const status = input.status ?? "connected";

  const rows = await db
    .insert(integrations)
    .values({
      accessTokenEnc: encrypted.accessTokenEnc,
      clerkOrgId: input.clerkOrgId,
      config: encrypted.config,
      lastErrorMsg: status === "connected" ? null : status,
      provider: input.credential.platform,
      refreshTokenEnc: encrypted.refreshTokenEnc,
      status,
      tokenExpiresAt: encrypted.tokenExpiresAt,
    })
    .onConflictDoUpdate({
      target: [integrations.clerkOrgId, integrations.provider],
      set: {
        accessTokenEnc: encrypted.accessTokenEnc,
        config: encrypted.config,
        lastErrorMsg: status === "connected" ? null : status,
        refreshTokenEnc: encrypted.refreshTokenEnc,
        status,
        tokenExpiresAt: encrypted.tokenExpiresAt,
      },
    })
    .returning({ id: integrations.id, provider: integrations.provider });

  const integration = rows[0];

  if (!integration) {
    throw new Error("Failed to save connector credential.");
  }

  return integration;
}

export async function getStoredConnectorCredential(input: {
  clerkOrgId: string;
  platform: ConnectorPlatform;
}): Promise<StoredConnectorCredential | null> {
  const db = getDb();
  const rows = await db
    .select({
      accessTokenEnc: integrations.accessTokenEnc,
      config: integrations.config,
      refreshTokenEnc: integrations.refreshTokenEnc,
    })
    .from(integrations)
    .where(
      and(
        eq(integrations.clerkOrgId, input.clerkOrgId),
        eq(integrations.provider, input.platform),
      ),
    )
    .limit(1);
  const row = rows[0] ?? null;

  if (!row?.accessTokenEnc) {
    return null;
  }

  if (input.platform === "hetzner") {
    return {
      apiKey: decryptSecret(row.accessTokenEnc, input.clerkOrgId),
      platform: "hetzner",
    };
  }

  const config = (row.config ?? {}) as IntegrationConfig;
  const consumerKeyEnc = getConsumerKeyEnc(config);

  if (!row.refreshTokenEnc || !consumerKeyEnc) {
    return null;
  }

  return {
    appKey: decryptSecret(row.accessTokenEnc, input.clerkOrgId),
    appSecret: decryptSecret(row.refreshTokenEnc, input.clerkOrgId),
    consumerKey: decryptSecret(consumerKeyEnc, input.clerkOrgId),
    platform: "ovhcloud",
    serviceName: getServiceName(config),
  };
}

export async function updateConnectorStoredStatus(input: {
  clerkOrgId: string;
  errorMessage?: string | null;
  platform: ConnectorPlatform;
  status: HealthCheckResult;
}) {
  const db = getDb();

  await db
    .update(integrations)
    .set({
      lastErrorMsg: input.status === "connected" ? null : input.errorMessage ?? input.status,
      status: input.status,
    })
    .where(
      and(
        eq(integrations.clerkOrgId, input.clerkOrgId),
        eq(integrations.provider, input.platform),
      ),
    );
}
