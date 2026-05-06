import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { frameworks, orgFrameworks } from "@/lib/db/schema";

export async function listOrgFrameworksForIndex(clerkOrgId: string) {
  const db = getDb();

  return db
    .select({
      enrolledAt: orgFrameworks.enrolledAt,
      id: frameworks.id,
      nameCs: frameworks.nameCs,
      nameEn: frameworks.nameEn,
      regulator: frameworks.regulator,
      score: orgFrameworks.score,
      slug: frameworks.slug,
      status: orgFrameworks.status,
      targetDate: orgFrameworks.targetDate,
    })
    .from(orgFrameworks)
    .innerJoin(frameworks, eq(orgFrameworks.frameworkId, frameworks.id))
    .where(eq(orgFrameworks.clerkOrgId, clerkOrgId))
    .orderBy(frameworks.nameCs);
}
