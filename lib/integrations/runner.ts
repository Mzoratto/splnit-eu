import { and, eq } from "drizzle-orm";
import { recordActivationEvent } from "@/lib/activation/events";
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

function getErrorStatusCode(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const maybeError = error as {
    status?: unknown;
    statusCode?: unknown;
    response?: { status?: unknown };
  };
  const status = maybeError.statusCode ?? maybeError.status ?? maybeError.response?.status;
  const numericStatus = Number(status);

  return Number.isInteger(numericStatus) ? numericStatus : null;
}

function describeCollectionError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function buildCollectionErrorResult(error: unknown, provider: string) {
  const statusCode = getErrorStatusCode(error);
  const isMicrosoftPermissionFailure =
    provider === "microsoft365" &&
    (statusCode === 401 || statusCode === 403 || statusCode === 404);
  const isMicrosoftRetryableFailure =
    provider === "microsoft365" &&
    (statusCode === 429 || (statusCode !== null && statusCode >= 500));
  const errorMessage = describeCollectionError(error);

  if (isMicrosoftPermissionFailure) {
    return {
      status: "error" as const,
      resultData: {
        blockedReason: "missing_permission",
        errorMessage,
        graphStatusCode: statusCode,
      },
      failureReason:
        `Cannot read Microsoft 365 evidence. Review Microsoft Graph permissions and upload evidence manually.${errorMessage ? ` Graph error: ${errorMessage}` : ""}`,
    };
  }

  return {
    status: "error" as const,
    resultData: {
      blockedReason: "collection_failed",
      errorMessage,
      graphStatusCode: provider === "microsoft365" ? statusCode : undefined,
    },
    failureReason: isMicrosoftRetryableFailure
      ? `Microsoft 365 evidence collection failed; retry after Microsoft Graph recovers.${errorMessage ? ` Graph error: ${errorMessage}` : ""}`
      : errorMessage,
  };
}

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

        let currentStatus: { lastEvidenceAt: Date | null; status: string | null } | null = null;

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
          currentStatus = currentStatusRows[0] ?? null;
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
            resultData: result.data,
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
          if (currentStatus?.status !== result.status) {
            await recordActivationEvent({
              clerkOrgId,
              entityId: test.controlId,
              entityType: "assessment",
              metadata: {
                controlId: test.controlId,
                nextStatus: result.status,
                previousStatus: currentStatus?.status ?? null,
                source: "automated_evidence",
              },
              name: "AssessmentChanged",
            });
          }
          testsRun += 1;
        } catch (error) {
          errors += 1;
          const now = new Date();
          const errorResult = buildCollectionErrorResult(error, integration.provider);
          const resultData = errorResult.resultData;
          const insertedRuns = await db
            .insert(integrationRuns)
            .values({
              integrationId: integration.id,
              testId: test.id,
              clerkOrgId,
              status: errorResult.status,
              resultData,
              failureReason: errorResult.failureReason,
            })
            .returning({ id: integrationRuns.id });
          const integrationRunId = insertedRuns[0]?.id;
          const shouldCreateErrorEvidence = shouldCollectAutomatedEvidence({
            lastEvidenceAt: null,
            now,
            previousStatus: null,
            resultData,
            resultStatus: errorResult.status,
          });

          if (
            integration.provider === "microsoft365" &&
            integrationRunId &&
            shouldCreateErrorEvidence
          ) {
            await createAutomatedEvidenceForIntegrationRun({
              checkLogic: test.checkLogic,
              clerkOrgId,
              controlId: test.controlId,
              failureReason: errorResult.failureReason,
              integrationRunId,
              passCriteria: test.passCriteria,
              provider: integration.provider,
              resultData,
              status: errorResult.status,
              testName: test.name,
            });
            evidenceCreated += 1;

            await db
              .insert(orgControlStatuses)
              .values({
                clerkOrgId,
                controlId: test.controlId,
                lastEvidenceAt: now,
                lastTestedAt: now,
                status: errorResult.status,
              })
              .onConflictDoUpdate({
                target: [orgControlStatuses.clerkOrgId, orgControlStatuses.controlId],
                set: {
                  lastEvidenceAt: now,
                  lastTestedAt: now,
                  status: errorResult.status,
                  updatedAt: now,
                },
              });
            if (currentStatus?.status !== errorResult.status) {
              await recordActivationEvent({
                clerkOrgId,
                entityId: test.controlId,
                entityType: "assessment",
                metadata: {
                  controlId: test.controlId,
                  nextStatus: errorResult.status,
                  previousStatus: currentStatus?.status ?? null,
                  source: "automated_evidence",
                },
                name: "AssessmentChanged",
              });
            }
          }
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
