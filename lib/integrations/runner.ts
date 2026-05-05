import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  integrationRuns,
  integrations,
  orgControlStatuses,
  orgFrameworks,
  tests,
} from "@/lib/db/schema";
import { recalculateFrameworkScore } from "@/lib/controls/scorer";
import {
  createAutomatedEvidenceForIntegrationRun,
  shouldCollectAutomatedEvidence,
} from "./evidence";
import { acquireIntegrationRunLock } from "./locks";
import { getAdapter } from "./registry";

type RunTestsOptions = {
  provider?: string;
};

type ProviderRunSummary = {
  evidenceCreated: number;
  errors: number;
  integrationId: string;
  lockEnabled: boolean;
  provider: string;
  skipped: boolean;
  testsRun: number;
};

export async function runTestsForOrg(
  clerkOrgId: string,
  options: RunTestsOptions = {},
) {
  const db = getDb();
  const connected = await db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.clerkOrgId, clerkOrgId),
        eq(integrations.status, "connected"),
      ),
    );
  const summaries: ProviderRunSummary[] = [];

  for (const integration of connected) {
    if (options.provider && integration.provider !== options.provider) {
      continue;
    }

    const adapter = getAdapter(integration.provider);
    if (!adapter) {
      summaries.push({
        evidenceCreated: 0,
        errors: 0,
        integrationId: integration.id,
        lockEnabled: false,
        provider: integration.provider,
        skipped: true,
        testsRun: 0,
      });
      continue;
    }

    const lock = await acquireIntegrationRunLock({
      clerkOrgId,
      provider: integration.provider,
    });

    if (!lock.acquired) {
      summaries.push({
        evidenceCreated: 0,
        errors: 0,
        integrationId: integration.id,
        lockEnabled: lock.enabled,
        provider: integration.provider,
        skipped: true,
        testsRun: 0,
      });
      continue;
    }

    const relevantTests = await db
      .select()
      .from(tests)
      .where(eq(tests.integrationType, integration.provider));
    let testsRun = 0;
    let errors = 0;
    let evidenceCreated = 0;

    try {
      for (const test of relevantTests) {
        const now = new Date();

        try {
          const currentStatusRows = await db
            .select({
              lastEvidenceAt: orgControlStatuses.lastEvidenceAt,
              status: orgControlStatuses.status,
            })
            .from(orgControlStatuses)
            .where(
              and(
                eq(orgControlStatuses.clerkOrgId, clerkOrgId),
                eq(orgControlStatuses.controlId, test.controlId),
              ),
            )
            .limit(1);
          const currentStatus = currentStatusRows[0] ?? null;
          const result = await adapter.runTest(test.checkLogic, integration);

          const insertedRuns = await db
            .insert(integrationRuns)
            .values({
              integrationId: integration.id,
              testId: test.id,
              clerkOrgId,
              status: result.status,
              resultData: result.data,
              failureReason: result.failureReason,
            })
            .returning({ id: integrationRuns.id });
          const integrationRunId = insertedRuns[0]?.id;

          if (!integrationRunId) {
            throw new Error("Failed to create integration run.");
          }

          const shouldCreateEvidence = shouldCollectAutomatedEvidence({
            lastEvidenceAt: currentStatus?.lastEvidenceAt ?? null,
            now,
            previousStatus: currentStatus?.status ?? null,
            resultStatus: result.status,
          });

          if (shouldCreateEvidence) {
            await createAutomatedEvidenceForIntegrationRun({
              checkLogic: test.checkLogic,
              clerkOrgId,
              controlId: test.controlId,
              failureReason: result.failureReason,
              integrationRunId,
              passCriteria: test.passCriteria,
              provider: integration.provider,
              resultData: result.data,
              status: result.status,
              testName: test.name,
            });
            evidenceCreated += 1;
          }

          const statusValues = shouldCreateEvidence
            ? {
                clerkOrgId,
                controlId: test.controlId,
                lastEvidenceAt: now,
                lastTestedAt: now,
                status: result.status,
              }
            : {
                clerkOrgId,
                controlId: test.controlId,
                lastTestedAt: now,
                status: result.status,
              };
          const statusUpdate = shouldCreateEvidence
            ? {
                lastEvidenceAt: now,
                lastTestedAt: now,
                status: result.status,
                updatedAt: now,
              }
            : {
                lastTestedAt: now,
                status: result.status,
                updatedAt: now,
              };

          await db
            .insert(orgControlStatuses)
            .values(statusValues)
            .onConflictDoUpdate({
              target: [orgControlStatuses.clerkOrgId, orgControlStatuses.controlId],
              set: statusUpdate,
            });
          testsRun += 1;
        } catch (error) {
          errors += 1;
          await db.insert(integrationRuns).values({
            integrationId: integration.id,
            testId: test.id,
            clerkOrgId,
            status: "error",
            failureReason: error instanceof Error ? error.message : String(error),
          });
        }
      }

      await db
        .update(integrations)
        .set({
          lastErrorMsg: errors > 0 ? `${errors} test(s) failed to execute` : null,
          lastSyncedAt: new Date(),
        })
        .where(eq(integrations.id, integration.id));

      summaries.push({
        evidenceCreated,
        errors,
        integrationId: integration.id,
        lockEnabled: lock.enabled,
        provider: integration.provider,
        skipped: false,
        testsRun,
      });
    } finally {
      await lock.release();
    }
  }

  const enrolledFrameworks = await db
    .select({ frameworkId: orgFrameworks.frameworkId })
    .from(orgFrameworks)
    .where(eq(orgFrameworks.clerkOrgId, clerkOrgId));

  await Promise.all(
    enrolledFrameworks.map((framework) =>
      recalculateFrameworkScore(clerkOrgId, framework.frameworkId),
    ),
  );

  return {
    clerkOrgId,
    providers: summaries,
    recalculatedFrameworks: enrolledFrameworks.length,
  };
}
