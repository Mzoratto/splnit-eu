import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { controls, orgControlStatuses } from "@/lib/db/schema";

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
