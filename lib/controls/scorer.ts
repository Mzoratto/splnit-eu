import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  frameworkControls,
  orgControlStatuses,
  orgFrameworks,
} from "@/lib/db/schema";

const PASSING_WEIGHT: Record<string, number> = {
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

  const weightedPassing = mappings.reduce((total, mapping) => {
    const status = statusMap.get(mapping.controlId) ?? "unknown";
    return total + (PASSING_WEIGHT[status] ?? 0);
  }, 0);

  const score = Math.round((weightedPassing / mappings.length) * 100);

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
