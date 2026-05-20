import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type {
  EvidenceAssessmentResult,
  EvidenceBlockedReason,
  EvidenceCollectionStatus,
  EvidenceConfidence,
} from "@/lib/activation/evidence-state";
import { recalculateFrameworkScore } from "@/lib/controls/scorer";
import { getDb } from "@/lib/db";
import {
  controls,
  evidence,
  frameworkControls,
  frameworks,
  orgControlStatuses,
  orgFrameworks,
  orgIntakeProfiles,
  tests,
} from "@/lib/db/schema";

type IntakeScopeSummary = {
  applicableControlKeys: string[];
  notApplicableControlKeys: string[];
  outOfScopeControlKeys: string[];
  priorityControlKeys: string[];
  rationales: Record<string, string>;
};

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

export async function listOrgControlsForIndex(clerkOrgId: string) {
  const db = getDb();
  const [rows, intakeRows] = await Promise.all([
    db
      .select({
        category: controls.category,
        controlId: controls.id,
        descriptionCs: controls.descriptionCs,
        frameworkNameCs: frameworks.nameCs,
        frameworkNameEn: frameworks.nameEn,
        frameworkSlug: frameworks.slug,
        isAutomated: controls.isAutomated,
        key: controls.key,
        status: orgControlStatuses.status,
        titleCs: controls.titleCs,
        titleEn: controls.titleEn,
        updatedAt: orgControlStatuses.updatedAt,
      })
      .from(orgFrameworks)
      .innerJoin(
        frameworkControls,
        eq(orgFrameworks.frameworkId, frameworkControls.frameworkId),
      )
      .innerJoin(controls, eq(frameworkControls.controlId, controls.id))
      .innerJoin(frameworks, eq(frameworkControls.frameworkId, frameworks.id))
      .leftJoin(
        orgControlStatuses,
        and(
          eq(orgControlStatuses.clerkOrgId, clerkOrgId),
          eq(orgControlStatuses.controlId, controls.id),
        ),
      )
      .where(eq(orgFrameworks.clerkOrgId, clerkOrgId))
      .orderBy(controls.key),
    db
      .select({ derivedScope: orgIntakeProfiles.derivedScope })
      .from(orgIntakeProfiles)
      .where(eq(orgIntakeProfiles.clerkOrgId, clerkOrgId))
      .limit(1),
  ]);
  const intakeScope = buildIntakeScopeSummary(intakeRows[0]?.derivedScope ?? null);

  const controlMap = new Map<
    string,
    {
      category: string | null;
      descriptionCs: string | null;
      frameworks: {
        nameCs: string;
        nameEn: string;
        slug: string;
      }[];
      intakeRationale: string | null;
      isIntakePriority: boolean;
      isAutomated: boolean;
      key: string;
      latestEvidenceAssessmentResult: EvidenceAssessmentResult | null;
      latestEvidenceBlockedReason: EvidenceBlockedReason | null;
      latestEvidenceCollectionStatus: EvidenceCollectionStatus | null;
      latestEvidenceConfidence: EvidenceConfidence | null;
      latestEvidenceCollectedAt: Date | null;
      lastKnownAssessmentResult: EvidenceAssessmentResult | null;
      scopeStatus: "applicable" | "not_applicable" | "out_of_scope" | null;
      status: string | null;
      titleCs: string;
      titleEn: string;
      updatedAt: Date | null;
    }
  >();

  for (const row of rows) {
    const existing = controlMap.get(row.controlId);

    if (existing) {
      if (!existing.frameworks.some((framework) => framework.slug === row.frameworkSlug)) {
        existing.frameworks.push({
          nameCs: row.frameworkNameCs,
          nameEn: row.frameworkNameEn,
          slug: row.frameworkSlug,
        });
      }

      continue;
    }

    controlMap.set(row.controlId, {
      category: row.category,
      descriptionCs: row.descriptionCs,
      frameworks: [
        {
          nameCs: row.frameworkNameCs,
          nameEn: row.frameworkNameEn,
          slug: row.frameworkSlug,
        },
      ],
      intakeRationale: intakeScope.rationales[row.key] ?? null,
      isIntakePriority: intakeScope.priorityControlKeys.includes(row.key),
      isAutomated: row.isAutomated,
      key: row.key,
      latestEvidenceAssessmentResult: null,
      latestEvidenceBlockedReason: null,
      latestEvidenceCollectionStatus: null,
      latestEvidenceConfidence: null,
      latestEvidenceCollectedAt: null,
      lastKnownAssessmentResult: null,
      scopeStatus: intakeScope.applicableControlKeys.includes(row.key)
        ? "applicable"
        : intakeScope.notApplicableControlKeys.includes(row.key)
          ? "not_applicable"
          : intakeScope.outOfScopeControlKeys.includes(row.key)
            ? "out_of_scope"
            : null,
      status: row.status,
      titleCs: row.titleCs,
      titleEn: row.titleEn,
      updatedAt: row.updatedAt,
    });
  }

  const controlIds = [...controlMap.keys()];

  if (controlIds.length > 0) {
    const evidenceRows = await db
      .select({
        assessmentResult: evidence.assessmentResult,
        blockedReason: evidence.blockedReason,
        collectedAt: evidence.collectedAt,
        collectionStatus: evidence.collectionStatus,
        confidence: evidence.confidence,
        controlId: evidence.controlId,
      })
      .from(evidence)
      .where(
        and(
          eq(evidence.clerkOrgId, clerkOrgId),
          inArray(evidence.controlId, controlIds),
        ),
      )
      .orderBy(desc(evidence.collectedAt));

    const controlIdsWithLatestEvidence = new Set<string>();

    for (const row of evidenceRows) {
      const existing = controlMap.get(row.controlId);

      if (!existing) {
        continue;
      }

      if (!controlIdsWithLatestEvidence.has(row.controlId)) {
        existing.latestEvidenceAssessmentResult = row.assessmentResult;
        existing.latestEvidenceBlockedReason = row.blockedReason ?? null;
        existing.latestEvidenceCollectionStatus = row.collectionStatus;
        existing.latestEvidenceConfidence = row.confidence;
        existing.latestEvidenceCollectedAt = row.collectedAt ?? null;
        controlIdsWithLatestEvidence.add(row.controlId);
        continue;
      }

      if (
        existing.latestEvidenceCollectionStatus === "blocked" &&
        !existing.lastKnownAssessmentResult &&
        isConfirmedEvidenceAssessment(row.assessmentResult)
      ) {
        existing.lastKnownAssessmentResult = row.assessmentResult;
      }
    }
  }

  return [...controlMap.values()];
}

function isConfirmedEvidenceAssessment(
  value: EvidenceAssessmentResult | null,
): value is "pass" | "gap" {
  return value === "pass" || value === "gap";
}

function buildIntakeScopeSummary(derivedScope: unknown): IntakeScopeSummary {
  if (!derivedScope || typeof derivedScope !== "object") {
    return emptyIntakeScopeSummary();
  }

  const scope = derivedScope as {
    applicableControlKeys?: unknown;
    notApplicableControlKeys?: unknown;
    outOfScopeControlKeys?: unknown;
    priorityControlKeys?: unknown;
    rationales?: unknown;
  };

  return {
    applicableControlKeys: stringArray(scope.applicableControlKeys),
    notApplicableControlKeys: stringArray(scope.notApplicableControlKeys),
    outOfScopeControlKeys: stringArray(scope.outOfScopeControlKeys),
    priorityControlKeys: stringArray(scope.priorityControlKeys),
    rationales: stringRecord(scope.rationales),
  };
}

function emptyIntakeScopeSummary(): IntakeScopeSummary {
  return {
    applicableControlKeys: [],
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

export async function getControlDetailByKey(input: {
  clerkOrgId: string;
  controlKey: string;
}) {
  const db = getDb();
  const controlRows = await db
    .select()
    .from(controls)
    .where(eq(controls.key, input.controlKey))
    .limit(1);
  const control = controlRows[0] ?? null;

  if (!control) {
    return null;
  }

  const statusRows = await db
    .select()
    .from(orgControlStatuses)
    .where(
      and(
        eq(orgControlStatuses.clerkOrgId, input.clerkOrgId),
        eq(orgControlStatuses.controlId, control.id),
      ),
    )
    .limit(1);
  const frameworkRows = await db
    .select({
      articleRef: frameworkControls.articleRef,
      evidenceRequirements: frameworkControls.evidenceRequirements,
      frameworkId: frameworks.id,
      frameworkName: frameworks.nameCs,
      frameworkSlug: frameworks.slug,
      localizedDescription: frameworkControls.localizedDescription,
      localizedTitle: frameworkControls.localizedTitle,
      regulatorGuidance: frameworkControls.regulatorGuidance,
      requirementLevel: frameworkControls.requirementLevel,
    })
    .from(frameworkControls)
    .innerJoin(frameworks, eq(frameworkControls.frameworkId, frameworks.id))
    .where(eq(frameworkControls.controlId, control.id));
  const testRows = await db
    .select()
    .from(tests)
    .where(eq(tests.controlId, control.id));
  const evidenceRows = await db
    .select()
    .from(evidence)
    .where(
      and(
        eq(evidence.clerkOrgId, input.clerkOrgId),
        eq(evidence.controlId, control.id),
      ),
    )
    .orderBy(sql`${evidence.collectedAt} desc`);

  return {
    control,
    evidence: evidenceRows,
    frameworks: frameworkRows,
    status: statusRows[0] ?? null,
    tests: testRows,
  };
}

export async function updateControlStatus(input: {
  clerkOrgId: string;
  controlKey: string;
  notes: string | null;
  status: string;
}) {
  const db = getDb();
  const controlRows = await db
    .select({ id: controls.id })
    .from(controls)
    .where(eq(controls.key, input.controlKey))
    .limit(1);
  const control = controlRows[0] ?? null;

  if (!control) {
    throw new Error(`Unknown control: ${input.controlKey}`);
  }

  await db
    .insert(orgControlStatuses)
    .values({
      clerkOrgId: input.clerkOrgId,
      controlId: control.id,
      notes: input.notes,
      status: input.status,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [orgControlStatuses.clerkOrgId, orgControlStatuses.controlId],
      set: {
        notes: sql`excluded.notes`,
        status: sql`excluded.status`,
        updatedAt: new Date(),
      },
    });

  const frameworkRows = await db
    .select({ frameworkId: frameworkControls.frameworkId })
    .from(frameworkControls)
    .where(eq(frameworkControls.controlId, control.id));

  await Promise.all(
    frameworkRows.map((row) =>
      recalculateFrameworkScore(input.clerkOrgId, row.frameworkId),
    ),
  );

  return {
    controlId: control.id,
    recalculatedFrameworks: frameworkRows.length,
  };
}
