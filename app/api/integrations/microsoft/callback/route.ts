import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { recordActivationEvent } from "@/lib/activation/events";
import { createEvidenceState } from "@/lib/activation/evidence-state";
import { encryptSecret } from "@/lib/crypto";
import { getDb } from "@/lib/db";
import { createAuditLog } from "@/lib/db/queries/audit-logs";
import { upsertIntegrationConnection } from "@/lib/db/queries/integrations";
import { runPostConnectDiscovery } from "@/lib/discovery/post-connect";
import { controls, evidence } from "@/lib/db/schema";
import { enqueueIntegrationFirstRun } from "@/lib/integrations/first-run-enqueue";
import { exchangeMicrosoftCode } from "@/lib/integrations/microsoft365/oauth";
import { MICROSOFT365_TEST_DEFINITIONS } from "@/lib/integrations/microsoft365/test-definitions";
import { verifyOAuthState } from "@/lib/integrations/oauth-state";

const MICROSOFT365_CONNECTION_EVIDENCE_TYPE = "microsoft365_connection";

function hasClerkConfig() {
  return (
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY)
  );
}

async function createPendingMicrosoftEvidence(input: {
  clerkOrgId: string;
  integrationId: string;
}) {
  const db = getDb();
  const controlKeys = MICROSOFT365_TEST_DEFINITIONS.map(
    (definition) => definition.controlKey,
  );
  const controlRows = await db
    .select({ id: controls.id, key: controls.key })
    .from(controls)
    .where(inArray(controls.key, controlKeys));

  if (controlRows.length === 0) {
    return;
  }

  const existingRows = await db
    .select({ controlId: evidence.controlId })
    .from(evidence)
    .where(
      and(
        eq(evidence.clerkOrgId, input.clerkOrgId),
        inArray(
          evidence.controlId,
          controlRows.map((control) => control.id),
        ),
        eq(evidence.type, MICROSOFT365_CONNECTION_EVIDENCE_TYPE),
        eq(evidence.source, "connector"),
      ),
    );
  const existingControlIds = new Set(existingRows.map((row) => row.controlId));
  const pendingState = createEvidenceState({
    assessment_result: "unknown",
    blocked_reason: null,
    collected_at: null,
    collection_status: "pending",
    confidence: "high",
    source: "connector",
  });
  const definitionsByControlKey = new Map<
    string,
    (typeof MICROSOFT365_TEST_DEFINITIONS)[number]
  >(
    MICROSOFT365_TEST_DEFINITIONS.map((definition) => [definition.controlKey, definition]),
  );
  const pendingRows = controlRows
    .filter((control) => !existingControlIds.has(control.id))
    .map((control) => {
      const definition = definitionsByControlKey.get(control.key);

      return {
        assessmentResult: pendingState.assessment_result,
        blockedReason: pendingState.blocked_reason,
        clerkOrgId: input.clerkOrgId,
        collectedAt: pendingState.collected_at,
        collectedBy: "system:microsoft365-oauth-callback",
        collectionStatus: pendingState.collection_status,
        confidence: pendingState.confidence,
        controlId: control.id,
        description: "Microsoft 365 connector authorised; automated evidence collection is pending.",
        snapshotData: {
          checkLogic: definition?.checkLogic ?? null,
          integrationId: input.integrationId,
          provider: "microsoft365",
          sourceEvent: "oauth_callback",
        },
        source: pendingState.source,
        type: MICROSOFT365_CONNECTION_EVIDENCE_TYPE,
      };
    });

  if (pendingRows.length > 0) {
    await db.insert(evidence).values(pendingRows);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  if (!hasClerkConfig()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const session = await auth();

  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!verifyOAuthState(state, { clerkOrgId: session.orgId, provider: "microsoft365" })) {
    return NextResponse.json(
      { error: "OAuth state does not match the active organisation." },
      { status: 403 },
    );
  }

  const redirectUri = `${url.origin}/api/integrations/microsoft/callback`;
  const token = await exchangeMicrosoftCode(code, redirectUri);
  const tokenExpiresAt = new Date(Date.now() + token.expires_in * 1000);

  const integration = await upsertIntegrationConnection({
    accessTokenEnc: encryptSecret(token.access_token, session.orgId),
    clerkOrgId: session.orgId,
    config: {
      redirectUri,
      tokenType: "oauth2",
    },
    provider: "microsoft365",
    refreshTokenEnc: encryptSecret(token.refresh_token, session.orgId),
    tokenExpiresAt,
  });
  await createAuditLog({
    action: "integration.connected",
    clerkOrgId: session.orgId,
    entityId: integration.id,
    entityType: "integration",
    metadata: {
      provider: "microsoft365",
      tokenType: "oauth2",
    },
  });
  await recordActivationEvent({
    clerkOrgId: session.orgId,
    clerkUserId: session.userId,
    entityId: integration.id,
    entityType: "connector",
    metadata: {
      provider: "microsoft365",
      tokenType: "oauth2",
    },
    name: "ConnectorOAuthCompleted",
  });
  await createPendingMicrosoftEvidence({
    clerkOrgId: session.orgId,
    integrationId: integration.id,
  });
  const firstRun = await enqueueIntegrationFirstRun({
    clerkOrgId: session.orgId,
    integrationId: integration.id,
    provider: "microsoft365",
  });
  await createAuditLog({
    action: firstRun.enqueued
      ? "integration.first_run_queued"
      : "integration.first_run_queue_skipped",
    clerkOrgId: session.orgId,
    entityId: integration.id,
    entityType: "integration",
    metadata: {
      lockEnabled: firstRun.lockEnabled,
      provider: "microsoft365",
    },
  });
  if (firstRun.enqueued) {
    await recordActivationEvent({
      clerkOrgId: session.orgId,
      entityId: integration.id,
      entityType: "connector",
      metadata: {
        lockEnabled: firstRun.lockEnabled,
        provider: "microsoft365",
        trigger: "oauth_callback_first_run",
      },
      name: "EvidenceCollectionQueued",
    });
  }
  try {
    await runPostConnectDiscovery({
      clerkOrgId: session.orgId,
      integrationId: integration.id,
      provider: "microsoft365",
      userId: session.userId,
    });
  } catch {
    // Discovery is best-effort after OAuth; never fail the connector redirect.
  }

  return NextResponse.redirect(new URL("/integrations/microsoft365", url.origin));
}
