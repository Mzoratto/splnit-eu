import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { organisations } from "@/lib/db/schema";

export async function getOrganisationByClerkOrgId(clerkOrgId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(organisations)
    .where(eq(organisations.clerkOrgId, clerkOrgId))
    .limit(1);

  return rows[0] ?? null;
}
