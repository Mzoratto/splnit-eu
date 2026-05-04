import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  controls,
  frameworks,
  organisations,
  orgControlStatuses,
  orgFrameworks,
} from "@/lib/db/schema";
import { listRelevantRegulationUpdates } from "@/lib/db/queries/regulation-updates";

export type DashboardFrameworkScore = {
  slug: string;
  name: string;
  regulator: string | null;
  score: number | null;
  status: string;
};

export type DashboardControl = {
  key: string;
  titleCs: string;
  titleEn: string;
  title: string;
  category: string | null;
  status: string;
};

export type DashboardRegulationUpdate = {
  id: string;
  isRead: boolean;
  title: string;
  summary: string | null;
  severity: string;
  source: string;
  sourceUrl: string | null;
  publishedAt: Date;
  frameworkName: string | null;
};

export async function getDashboardData(clerkOrgId: string) {
  const db = getDb();
  const [organisationRows, frameworkScores, priorityControls, statusRows, updates] =
    await Promise.all([
      db
        .select({ locale: organisations.locale })
        .from(organisations)
        .where(eq(organisations.clerkOrgId, clerkOrgId))
        .limit(1),
      db
        .select({
          name: frameworks.nameCs,
          regulator: frameworks.regulator,
          score: orgFrameworks.score,
          slug: frameworks.slug,
          status: orgFrameworks.status,
        })
        .from(orgFrameworks)
        .innerJoin(frameworks, eq(orgFrameworks.frameworkId, frameworks.id))
        .where(eq(orgFrameworks.clerkOrgId, clerkOrgId)),
      db
        .select({
          category: controls.category,
          key: controls.key,
          status: orgControlStatuses.status,
          title: controls.titleCs,
          titleCs: controls.titleCs,
          titleEn: controls.titleEn,
        })
        .from(orgControlStatuses)
        .innerJoin(controls, eq(orgControlStatuses.controlId, controls.id))
        .where(
          and(
            eq(orgControlStatuses.clerkOrgId, clerkOrgId),
            inArray(orgControlStatuses.status, [
              "fail",
              "manual_review",
              "unknown",
            ]),
          ),
        )
        .limit(5),
      db
        .select({ status: orgControlStatuses.status })
        .from(orgControlStatuses)
        .where(eq(orgControlStatuses.clerkOrgId, clerkOrgId))
        .limit(500),
      listRelevantRegulationUpdates(clerkOrgId, 5),
    ]);

  return {
    frameworkScores,
    organisationLocale: organisationRows[0]?.locale ?? null,
    priorityControls,
    statusRows,
    updates,
  };
}
