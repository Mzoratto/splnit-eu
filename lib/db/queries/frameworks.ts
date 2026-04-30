import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { frameworks, orgFrameworks } from "@/lib/db/schema";

export async function listOrgFrameworks(clerkOrgId: string) {
  const db = getDb();

  return db
    .select({
      framework: frameworks,
      score: orgFrameworks.score,
      status: orgFrameworks.status,
      enrolledAt: orgFrameworks.enrolledAt,
    })
    .from(orgFrameworks)
    .innerJoin(frameworks, eq(orgFrameworks.frameworkId, frameworks.id))
    .where(eq(orgFrameworks.clerkOrgId, clerkOrgId));
}
