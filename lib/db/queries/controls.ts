import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { frameworkControls, orgControlStatuses } from "@/lib/db/schema";

export async function listOrgControlStatusesForFramework(
  clerkOrgId: string,
  frameworkId: string,
) {
  const db = getDb();
  const mappings = await db
    .select({ controlId: frameworkControls.controlId })
    .from(frameworkControls)
    .where(eq(frameworkControls.frameworkId, frameworkId));

  if (mappings.length === 0) {
    return [];
  }

  return db
    .select()
    .from(orgControlStatuses)
    .where(
      and(
        eq(orgControlStatuses.clerkOrgId, clerkOrgId),
        inArray(
          orgControlStatuses.controlId,
          mappings.map((mapping) => mapping.controlId),
        ),
      ),
    );
}
