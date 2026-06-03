import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { applyIntakeScopeToDashboardPriorityControls } from "@/lib/dashboard/priority-controls";
import {
  controls,
  frameworks,
  integrations,
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
  lastEvidenceAt: Date | null;
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
  workspaceRecommendations: Array<{
    label: string;
    platformKey: string;
    reason: string;
  }>;
};

export async function getDashboardData(clerkOrgId: string) {
  const db = getDb();
  const [
    organisationRows,
    frameworkScores,
    priorityControls,
    activationControls,
    statusRows,
    intakeRows,
    integrationRows,
    updates,
  ] = await Promise.all([
      db
        .select({
          clerkOrgId: organisations.clerkOrgId,
          dic: organisations.dic,
          ico: organisations.ico,
          locale: organisations.locale,
          primaryJurisdiction: organisations.primaryJurisdiction,
          sidlo: organisations.sidlo,
          toolInventory: organisations.toolInventory,
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
          lastEvidenceAt: orgControlStatuses.lastEvidenceAt,
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
        .select({
          category: controls.category,
          key: controls.key,
          isIntakePriority: sql<boolean>`false`,
          intakeRationale: sql<string | null>`null`,
          lastEvidenceAt: orgControlStatuses.lastEvidenceAt,
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
              "pass",
              "unknown",
              "warning",
            ]),
          ),
        ),
      db
        .select({ status: orgControlStatuses.status })
        .from(orgControlStatuses)
        .where(eq(orgControlStatuses.clerkOrgId, clerkOrgId))
        .limit(500),
      db
        .select({
          answers: orgIntakeProfiles.answers,
          completedAt: orgIntakeProfiles.completedAt,
          derivedScope: orgIntakeProfiles.derivedScope,
        })
        .from(orgIntakeProfiles)
        .where(eq(orgIntakeProfiles.clerkOrgId, clerkOrgId))
        .limit(1),
      db
        .select({
          provider: integrations.provider,
          status: integrations.status,
        })
        .from(integrations)
        .where(eq(integrations.clerkOrgId, clerkOrgId)),
      listRelevantRegulationUpdates(clerkOrgId, 2),
    ]);
  const derivedScope = intakeRows[0]?.derivedScope ?? null;
  const scopeSummary = buildIntakeScopeSummary(derivedScope);
  const scopedPriorityControls = applyIntakeScopeToDashboardPriorityControls(
    priorityControls,
    scopeSummary,
  );
  const scopedActivationControls = applyIntakeScopeToDashboardPriorityControls(
    activationControls,
    scopeSummary,
  );

  return {
    accountingPlatform: getAccountingPlatform(intakeRows[0]?.answers),
    activationPriorityControls: scopedActivationControls,
    frameworkScores,
    hasIntakeProfile: Boolean(intakeRows[0]?.completedAt || derivedScope),
    integrations: integrationRows,
    intakeScopeSummary: scopeSummary,
    organisationExportIdentity: organisationRows[0]
      ? {
          clerkOrgId: organisationRows[0].clerkOrgId,
          dic: organisationRows[0].dic,
          ico: organisationRows[0].ico,
          sidlo: organisationRows[0].sidlo,
        }
      : null,
    organisationJurisdiction: organisationRows[0]?.primaryJurisdiction ?? null,
    organisationLocale: organisationRows[0]?.locale ?? null,
    organisationToolInventory: Array.isArray(organisationRows[0]?.toolInventory)
      ? organisationRows[0].toolInventory.filter((tool): tool is string => typeof tool === "string")
      : [],
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
    workspaceRecommendations?: unknown;
  };

  return {
    applicableControlKeys: stringArray(scope.applicableControlKeys),
    failControlKeys: stringArray(scope.failControlKeys),
    manualReviewControlKeys: stringArray(scope.manualReviewControlKeys),
    notApplicableControlKeys: stringArray(scope.notApplicableControlKeys),
    outOfScopeControlKeys: stringArray(scope.outOfScopeControlKeys),
    priorityControlKeys: stringArray(scope.priorityControlKeys),
    rationales: stringRecord(scope.rationales),
    workspaceRecommendations: workspaceRecommendations(scope.workspaceRecommendations),
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
    workspaceRecommendations: [],
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

function workspaceRecommendations(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const candidate = item as Record<string, unknown>;
    if (
      typeof candidate.platformKey !== "string" ||
      typeof candidate.label !== "string" ||
      typeof candidate.reason !== "string"
    ) {
      return [];
    }

    return [{
      label: candidate.label,
      platformKey: candidate.platformKey,
      reason: candidate.reason,
    }];
  });
}

function getAccountingPlatform(answers: unknown) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return null;
  }

  const value = (answers as Record<string, unknown>).accountingPlatform;

  return typeof value === "string" ? value : null;
}
