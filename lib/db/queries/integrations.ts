import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  integrationRuns,
  integrations,
  orgControlStatuses,
  tests,
} from "@/lib/db/schema";

export async function listConnectedIntegrations(clerkOrgId: string) {
  const db = getDb();

  return db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.clerkOrgId, clerkOrgId),
        eq(integrations.status, "connected"),
      ),
    );
}

export async function listActiveIntegrationTargets() {
  const db = getDb();

  return db
    .select({
      clerkOrgId: integrations.clerkOrgId,
      provider: integrations.provider,
    })
    .from(integrations)
    .where(eq(integrations.status, "connected"));
}

export async function upsertIntegrationConnection(input: {
  accessTokenEnc?: string | null;
  clerkOrgId: string;
  config?: Record<string, unknown>;
  provider: string;
  refreshTokenEnc?: string | null;
  tokenExpiresAt?: Date | null;
}) {
  const db = getDb();

  await db
    .insert(integrations)
    .values({
      accessTokenEnc: input.accessTokenEnc ?? null,
      clerkOrgId: input.clerkOrgId,
      config: input.config ?? {},
      provider: input.provider,
      refreshTokenEnc: input.refreshTokenEnc ?? null,
      status: "connected",
      tokenExpiresAt: input.tokenExpiresAt ?? null,
    })
    .onConflictDoUpdate({
      target: [integrations.clerkOrgId, integrations.provider],
      set: {
        accessTokenEnc: input.accessTokenEnc ?? null,
        config: input.config ?? {},
        lastErrorMsg: null,
        provider: input.provider,
        refreshTokenEnc: input.refreshTokenEnc ?? null,
        status: "connected",
        tokenExpiresAt: input.tokenExpiresAt ?? null,
      },
    });
}

export async function getIntegrationDetail(input: {
  clerkOrgId: string;
  provider: string;
}) {
  const db = getDb();
  const integrationRows = await db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.clerkOrgId, input.clerkOrgId),
        eq(integrations.provider, input.provider),
      ),
    )
    .limit(1);
  const integration = integrationRows[0] ?? null;

  if (!integration) {
    return {
      integration: null,
      runs: [],
      tests: [],
    };
  }

  const [runRows, testRows] = await Promise.all([
    db
      .select({
        failureReason: integrationRuns.failureReason,
        ranAt: integrationRuns.ranAt,
        resultData: integrationRuns.resultData,
        status: integrationRuns.status,
        testName: tests.name,
      })
      .from(integrationRuns)
      .innerJoin(tests, eq(integrationRuns.testId, tests.id))
      .where(eq(integrationRuns.integrationId, integration.id))
      .orderBy(desc(integrationRuns.ranAt))
      .limit(24),
    db
      .select()
      .from(tests)
      .where(eq(tests.integrationType, input.provider))
      .orderBy(tests.name),
  ]);

  return {
    integration,
    runs: runRows,
    tests: testRows,
  };
}

export async function getIntegrationsHubData(clerkOrgId: string) {
  const db = getDb();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [integrationRows, testRows, runRows] = await Promise.all([
    db
      .select()
      .from(integrations)
      .where(eq(integrations.clerkOrgId, clerkOrgId)),
    db
      .select({
        id: tests.id,
        provider: tests.integrationType,
      })
      .from(tests)
      .where(eq(tests.isActive, true)),
    db
      .select({
        provider: integrations.provider,
        ranAt: integrationRuns.ranAt,
        status: integrationRuns.status,
      })
      .from(integrationRuns)
      .innerJoin(integrations, eq(integrationRuns.integrationId, integrations.id))
      .where(
        and(
          eq(integrationRuns.clerkOrgId, clerkOrgId),
          gte(integrationRuns.ranAt, since),
        ),
      ),
  ]);

  return {
    integrations: integrationRows,
    runs: runRows,
    tests: testRows,
  };
}

export async function disconnectIntegrationConnection(input: {
  clerkOrgId: string;
  provider: string;
}) {
  const db = getDb();
  const integrationRows = await db
    .select({ id: integrations.id })
    .from(integrations)
    .where(
      and(
        eq(integrations.clerkOrgId, input.clerkOrgId),
        eq(integrations.provider, input.provider),
      ),
    )
    .limit(1);
  const integration = integrationRows[0] ?? null;

  if (!integration) {
    return {
      disconnected: false,
      resetControls: 0,
    };
  }

  const affectedControls = await db
    .select({ controlId: tests.controlId })
    .from(tests)
    .where(eq(tests.integrationType, input.provider));
  const controlIds = Array.from(
    new Set(affectedControls.map((row) => row.controlId)),
  );

  await db.delete(integrations).where(eq(integrations.id, integration.id));

  if (controlIds.length > 0) {
    await db
      .update(orgControlStatuses)
      .set({
        lastTestedAt: null,
        status: "unknown",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(orgControlStatuses.clerkOrgId, input.clerkOrgId),
          inArray(orgControlStatuses.controlId, controlIds),
        ),
      );
  }

  return {
    disconnected: true,
    resetControls: controlIds.length,
  };
}
