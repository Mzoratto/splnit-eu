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
import { getAdapter } from "./registry";

export async function runTestsForOrg(clerkOrgId: string) {
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

  for (const integration of connected) {
    const adapter = getAdapter(integration.provider);
    if (!adapter) {
      continue;
    }

    const relevantTests = await db
      .select()
      .from(tests)
      .where(eq(tests.integrationType, integration.provider));

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
      } catch (error) {
        await db.insert(integrationRuns).values({
          integrationId: integration.id,
          testId: test.id,
          clerkOrgId,
          status: "error",
          failureReason: error instanceof Error ? error.message : String(error),
        });
      }
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
}
