import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  frameworkControls,
  orgControlStatuses,
  orgFrameworks,
} from "@/lib/db/schema";

/**
 * Canonical control score weighting: manual_review and warning count as
 * half-compliant. Used by the persisted framework scorer, the dashboard
 * fallback score, and the framework detail fallback — keep in sync via
 * calculateWeightedControlScore, do not reimplement.
 */
const PASSING_WEIGHT: Record<string, number> = {
  manual_review: 0.5,
  pass: 1,
  warning: 0.5,
};

const EXCLUDED_STATUSES = new Set(["not_applicable", "out_of_scope"]);

export function calculateWeightedControlScore(
  statuses: Array<string | null | undefined>,
  options: { emptyScore?: number } = {},
): number {
  const applicable = statuses.filter(
    (status) => !EXCLUDED_STATUSES.has(status ?? "unknown"),
  );

  if (applicable.length === 0) {
    return options.emptyScore ?? 100;
  }

  const weightedPassing = applicable.reduce(
    (total, status) => total + (PASSING_WEIGHT[status ?? "unknown"] ?? 0),
    0,
  );

  return Math.round((weightedPassing / applicable.length) * 100);
}

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

  const score = calculateWeightedControlScore(
    mappings.map((mapping) => statusMap.get(mapping.controlId) ?? "unknown"),
  );

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
