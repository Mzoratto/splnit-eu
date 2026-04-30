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
import { acquireIntegrationRunLock } from "./locks";
import { getAdapter } from "./registry";

type RunTestsOptions = {
  provider?: string;
};

type ProviderRunSummary = {
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

    try {
      for (const test of relevantTests) {
        const now = new Date();

        try {
          const result = await adapter.runTest(test.checkLogic, integration);

          await db.insert(integrationRuns).values({
            integrationId: integration.id,
            testId: test.id,
            clerkOrgId,
            status: result.status,
            resultData: result.data,
            failureReason: result.failureReason,
          });

          await db
            .insert(orgControlStatuses)
            .values({
              clerkOrgId,
              controlId: test.controlId,
              status: result.status,
              lastTestedAt: now,
            })
            .onConflictDoUpdate({
              target: [orgControlStatuses.clerkOrgId, orgControlStatuses.controlId],
              set: {
                status: result.status,
                lastTestedAt: now,
                updatedAt: now,
              },
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
