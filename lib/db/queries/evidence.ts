import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { evidence } from "@/lib/db/schema";

export async function listEvidenceForControl(clerkOrgId: string, controlId: string) {
  const db = getDb();

  return db
    .select()
    .from(evidence)
    .where(and(eq(evidence.clerkOrgId, clerkOrgId), eq(evidence.controlId, controlId)))
    .orderBy(desc(evidence.collectedAt));
}
