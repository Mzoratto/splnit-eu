import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { integrationRuns, integrations, tests } from "@/lib/db/schema";

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
  accessTokenEnc: string;
  clerkOrgId: string;
  config?: Record<string, unknown>;
  provider: string;
  refreshTokenEnc: string;
  tokenExpiresAt: Date;
}) {
  const db = getDb();

  await db
    .insert(integrations)
    .values({
      accessTokenEnc: input.accessTokenEnc,
      clerkOrgId: input.clerkOrgId,
      config: input.config ?? {},
      provider: input.provider,
      refreshTokenEnc: input.refreshTokenEnc,
      status: "connected",
      tokenExpiresAt: input.tokenExpiresAt,
    })
    .onConflictDoUpdate({
      target: [integrations.clerkOrgId, integrations.provider],
      set: {
        accessTokenEnc: input.accessTokenEnc,
        config: input.config ?? {},
        lastErrorMsg: null,
        provider: input.provider,
        refreshTokenEnc: input.refreshTokenEnc,
        status: "connected",
        tokenExpiresAt: input.tokenExpiresAt,
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
