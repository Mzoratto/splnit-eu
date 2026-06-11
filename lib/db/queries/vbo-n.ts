import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { controls, orgControlStatuses } from "@/lib/db/schema";
import { getVboVedeniData } from "@/lib/db/queries/vbo-vedeni";
import { computeVboNRecordOverrides } from "@/lib/regulations/vbo-n/records";

/**
 * Org control statuses keyed by control key — input for the VBO-N coverage
 * computation. Controls without a status row are omitted (the coverage
 * service treats them as not passing).
 */
export async function getOrgStatusesByControlKey(
  clerkOrgId: string,
): Promise<Record<string, string>> {
  const db = getDb();
  const rows = await db
    .select({ key: controls.key, status: orgControlStatuses.status })
    .from(orgControlStatuses)
    .innerJoin(controls, eq(orgControlStatuses.controlId, controls.id))
    .where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));

  return Object.fromEntries(rows.map((row) => [row.key, row.status]));
}

/**
 * Record-rule overrides for N-4-xx derived from the Vrcholné vedení module
 * (task A3) — feeds computeVboNCoverage's recordOverrides input.
 */
export async function getVboNRecordOverrides(
  clerkOrgId: string,
): Promise<Record<string, boolean>> {
  const data = await getVboVedeniData(clerkOrgId);

  return computeVboNRecordOverrides({
    recovery: {
      approvedOn: data.approval?.approvedOn ?? null,
      priorityCount: data.priorities.length,
    },
    responsiblePersons: data.responsiblePersons,
    trainings: data.trainings,
  });
}
