import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  controls,
  frameworks,
  organisations,
  orgControlStatuses,
  orgFrameworks,
  orgIntakeProfiles,
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
  intakeRationale: string | null;
  isIntakePriority: boolean;
  scopeStatus: "applicable" | "not_applicable" | "out_of_scope" | null;
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

type IntakeScopeSummary = {
  applicableControlKeys: string[];
  failControlKeys: string[];
  manualReviewControlKeys: string[];
  notApplicableControlKeys: string[];
  outOfScopeControlKeys: string[];
  priorityControlKeys: string[];
  rationales: Record<string, string>;
};

export async function getDashboardData(clerkOrgId: string) {
  const db = getDb();
  const [organisationRows, frameworkScores, priorityControls, statusRows, intakeRows, updates] =
    await Promise.all([
      db
        .select({
          locale: organisations.locale,
          primaryJurisdiction: organisations.primaryJurisdiction,
        })
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
          isIntakePriority: sql<boolean>`false`,
          intakeRationale: sql<string | null>`null`,
          scopeStatus: sql<"applicable" | "not_applicable" | "out_of_scope" | null>`null`,
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
        ),
      db
        .select({ status: orgControlStatuses.status })
        .from(orgControlStatuses)
        .where(eq(orgControlStatuses.clerkOrgId, clerkOrgId))
        .limit(500),
      db
        .select({ derivedScope: orgIntakeProfiles.derivedScope })
        .from(orgIntakeProfiles)
        .where(eq(orgIntakeProfiles.clerkOrgId, clerkOrgId))
        .limit(1),
      listRelevantRegulationUpdates(clerkOrgId, 5),
    ]);
  const derivedScope = intakeRows[0]?.derivedScope ?? null;
  const scopeSummary = buildIntakeScopeSummary(derivedScope);
  const scopedPriorityControls = priorityControls
    .map((control) => ({
      ...control,
      intakeRationale: scopeSummary.rationales[control.key] ?? null,
      isIntakePriority: scopeSummary.priorityControlKeys.includes(control.key),
      scopeStatus: scopeSummary.applicableControlKeys.includes(control.key)
        ? "applicable" as const
        : scopeSummary.notApplicableControlKeys.includes(control.key)
          ? "not_applicable" as const
          : scopeSummary.outOfScopeControlKeys.includes(control.key)
            ? "out_of_scope" as const
            : null,
    }))
    .sort((a, b) => Number(b.isIntakePriority) - Number(a.isIntakePriority));

  return {
    frameworkScores,
    intakeScopeSummary: scopeSummary,
    organisationJurisdiction: organisationRows[0]?.primaryJurisdiction ?? null,
    organisationLocale: organisationRows[0]?.locale ?? null,
    priorityControls: scopedPriorityControls,
    statusRows,
    updates,
  };
}

function buildIntakeScopeSummary(derivedScope: unknown): IntakeScopeSummary {
  if (!derivedScope || typeof derivedScope !== "object") {
    return emptyIntakeScopeSummary();
  }

  const scope = derivedScope as {
    applicableControlKeys?: unknown;
    failControlKeys?: unknown;
    manualReviewControlKeys?: unknown;
    notApplicableControlKeys?: unknown;
    outOfScopeControlKeys?: unknown;
    priorityControlKeys?: unknown;
    rationales?: unknown;
  };

  return {
    applicableControlKeys: stringArray(scope.applicableControlKeys),
    failControlKeys: stringArray(scope.failControlKeys),
    manualReviewControlKeys: stringArray(scope.manualReviewControlKeys),
    notApplicableControlKeys: stringArray(scope.notApplicableControlKeys),
    outOfScopeControlKeys: stringArray(scope.outOfScopeControlKeys),
    priorityControlKeys: stringArray(scope.priorityControlKeys),
    rationales: stringRecord(scope.rationales),
  };
}

function emptyIntakeScopeSummary(): IntakeScopeSummary {
  return {
    applicableControlKeys: [],
    failControlKeys: [],
    manualReviewControlKeys: [],
    notApplicableControlKeys: [],
    outOfScopeControlKeys: [],
    priorityControlKeys: [],
    rationales: {},
  };
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function stringRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as Record<string, string>;
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}
