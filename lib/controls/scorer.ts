import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  frameworkControls,
  orgControlStatuses,
  orgFrameworks,
} from "@/lib/db/schema";

const PASSING_WEIGHT: Record<string, number> = {
  manual_review: 0.5,
  pass: 1,
  warning: 0.5,
};

export async function recalculateFrameworkScore(
  clerkOrgId: string,
  frameworkId: string,
): Promise<number> {
  const db = getDb();
  const mappings = await db
    .select({ controlId: frameworkControls.controlId })
    .from(frameworkControls)
    .where(eq(frameworkControls.frameworkId, frameworkId));

  if (mappings.length === 0) {
    return 0;
  }

  const controlIds = mappings.map((mapping) => mapping.controlId);
  const statuses = await db
    .select()
    .from(orgControlStatuses)
    .where(
      and(
        eq(orgControlStatuses.clerkOrgId, clerkOrgId),
        inArray(orgControlStatuses.controlId, controlIds),
      ),
    );

  const statusMap = new Map(
    statuses.map((status) => [status.controlId, status.status] as const),
  );

  const applicableMappings = mappings.filter(
    (mapping) => statusMap.get(mapping.controlId) !== "not_applicable",
  );

  if (applicableMappings.length === 0) {
    await db
      .update(orgFrameworks)
      .set({ score: 100 })
      .where(
        and(
          eq(orgFrameworks.clerkOrgId, clerkOrgId),
          eq(orgFrameworks.frameworkId, frameworkId),
        ),
      );

    return 100;
  }

  const weightedPassing = applicableMappings.reduce((total, mapping) => {
    const status = statusMap.get(mapping.controlId) ?? "unknown";
    return total + (PASSING_WEIGHT[status] ?? 0);
  }, 0);

  const score = Math.round((weightedPassing / applicableMappings.length) * 100);

  await db
    .update(orgFrameworks)
    .set({ score })
    .where(
      and(
        eq(orgFrameworks.clerkOrgId, clerkOrgId),
        eq(orgFrameworks.frameworkId, frameworkId),
      ),
    );

  return score;
}
