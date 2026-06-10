import { and, desc, eq, inArray } from "drizzle-orm";
import { createEvidenceState } from "@/lib/activation/evidence-state";
import type { EvidenceAssessmentResult } from "@/lib/activation/evidence-state";
import { getDb } from "@/lib/db";
import {
  controls,
  evidence,
  orgControlStatuses,
  vendors,
  vendorAssessments,
} from "@/lib/db/schema";
import {
  createManualEvidence,
  manualEvidenceStatusPropagationEnabled,
  recalculateFrameworkScoresForControl,
} from "@/lib/db/queries/evidence";

export const VENDOR_SECURITY_ASSESSMENT_CONTROL_KEY =
  "ctrl_vendor_security_assessment";
export const VENDOR_ASSESSMENT_COVERAGE_EVIDENCE_TYPE =
  "vendor_assessment_coverage";

const ASSESSABLE_RISK_TIERS = ["critical", "high"] as const;
const ASSESSED_ASSESSMENT_STATUSES = ["completed", "submitted"] as const;

type CoverageStatus = Extract<EvidenceAssessmentResult, "manual_review" | "pass">;

export type VendorAssessmentCoverageResult = {
  assessableVendorCount: number;
  assessedVendorCount: number;
  controlId: string | null;
  evidenceId: string | null;
  reason: "missing_control" | "no_vendors" | "no_assessable_vendors" | null;
  status: CoverageStatus | "untouched";
  summary: string | null;
};

type VendorCoverageRow = {
  id: string;
  name: string;
  nextReviewAt: string | Date | null;
  riskTier: string | null;
};

function dateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function normalizeReviewDate(value: string | Date | null) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  return new Date(`${value}T00:00:00.000Z`);
}

function isReviewFresh(nextReviewAt: string | Date | null, now: Date) {
  const reviewDate = normalizeReviewDate(nextReviewAt);
  return reviewDate !== null && reviewDate.getTime() > now.getTime();
}

function buildCoverageSummary(input: {
  assessedVendorCount: number;
  assessableVendorCount: number;
}) {
  return `Bezpečnostní hodnocení dodavatelů: ${input.assessedVendorCount} z ${input.assessableVendorCount} kritických/vysokých dodavatelů hodnoceno.`;
}

async function getVendorSecurityControlId() {
  const db = getDb();
  const [control] = await db
    .select({ id: controls.id })
    .from(controls)
    .where(eq(controls.key, VENDOR_SECURITY_ASSESSMENT_CONTROL_KEY))
    .limit(1);

  return control?.id ?? null;
}

async function upsertCoverageControlStatus(input: {
  clerkOrgId: string;
  controlId: string;
  now: Date;
  status: CoverageStatus;
  summary: string;
}) {
  const shouldPropagateStatus = manualEvidenceStatusPropagationEnabled();
  const controlStatus = shouldPropagateStatus ? input.status : "unknown";
  const db = getDb();

  await db
    .insert(orgControlStatuses)
    .values({
      clerkOrgId: input.clerkOrgId,
      controlId: input.controlId,
      lastEvidenceAt: input.now,
      notes: input.summary,
      status: controlStatus,
      updatedAt: input.now,
    })
    .onConflictDoUpdate({
      target: [orgControlStatuses.clerkOrgId, orgControlStatuses.controlId],
      set: {
        lastEvidenceAt: input.now,
        notes: input.summary,
        status: controlStatus,
        updatedAt: input.now,
      },
    });

  if (shouldPropagateStatus) {
    await recalculateFrameworkScoresForControl({
      clerkOrgId: input.clerkOrgId,
      controlId: input.controlId,
    });
  }
}

async function upsertCoverageEvidence(input: {
  assessableVendors: VendorCoverageRow[];
  assessedVendorIds: Set<string>;
  clerkOrgId: string;
  controlId: string;
  now: Date;
  status: CoverageStatus;
  summary: string;
}) {
  const db = getDb();
  const evidenceState = createEvidenceState({
    assessment_result: input.status,
    collected_at: input.now,
    collection_status: "collected",
    source: "connector",
  });
  const snapshotData = {
    assessableRiskTiers: ASSESSABLE_RISK_TIERS,
    assessedAssessmentStatuses: ASSESSED_ASSESSMENT_STATUSES,
    assessedVendorCount: input.assessedVendorIds.size,
    assessableVendorCount: input.assessableVendors.length,
    generatedAt: input.now.toISOString(),
    freshnessRule: "vendors.nextReviewAt > generatedAt",
    vendors: input.assessableVendors.map((vendor) => ({
      assessed: input.assessedVendorIds.has(vendor.id),
      id: vendor.id,
      name: vendor.name,
      nextReviewAt:
        vendor.nextReviewAt instanceof Date
          ? dateOnly(vendor.nextReviewAt)
          : vendor.nextReviewAt,
      riskTier: vendor.riskTier,
    })),
  };
  const [existing] = await db
    .select({ id: evidence.id })
    .from(evidence)
    .where(
      and(
        eq(evidence.clerkOrgId, input.clerkOrgId),
        eq(evidence.controlId, input.controlId),
        eq(evidence.type, VENDOR_ASSESSMENT_COVERAGE_EVIDENCE_TYPE),
      ),
    )
    .orderBy(desc(evidence.collectedAt))
    .limit(1);

  let evidenceId = existing?.id ?? null;

  if (!evidenceId) {
    const created = await createManualEvidence({
      assessmentResult: input.status,
      blobUrl: null,
      clerkOrgId: input.clerkOrgId,
      collectedBy: "system",
      controlKey: VENDOR_SECURITY_ASSESSMENT_CONTROL_KEY,
      description: input.summary,
      expiresAt: null,
      fileType: VENDOR_ASSESSMENT_COVERAGE_EVIDENCE_TYPE,
      snapshotData,
      source: "connector",
    });
    evidenceId = created.evidenceId;
  }

  await db
    .update(evidence)
    .set({
      assessmentResult: evidenceState.assessment_result,
      blockedReason: evidenceState.blocked_reason,
      collectedAt: evidenceState.collected_at,
      collectedBy: "system",
      collectionStatus: evidenceState.collection_status,
      confidence: evidenceState.confidence,
      description: input.summary,
      snapshotData,
      source: evidenceState.source,
    })
    .where(eq(evidence.id, evidenceId));

  await upsertCoverageControlStatus({
    clerkOrgId: input.clerkOrgId,
    controlId: input.controlId,
    now: input.now,
    status: input.status,
    summary: input.summary,
  });

  return evidenceId;
}

export async function recalculateVendorAssessmentControl(
  clerkOrgId: string,
  now = new Date(),
): Promise<VendorAssessmentCoverageResult> {
  const db = getDb();
  const vendorRows = await db
    .select({
      id: vendors.id,
      name: vendors.name,
      nextReviewAt: vendors.nextReviewAt,
      riskTier: vendors.riskTier,
    })
    .from(vendors)
    .where(eq(vendors.clerkOrgId, clerkOrgId));
  const assessableVendors = vendorRows.filter((vendor) =>
    ASSESSABLE_RISK_TIERS.includes(
      vendor.riskTier as (typeof ASSESSABLE_RISK_TIERS)[number],
    ),
  );

  if (vendorRows.length === 0 || assessableVendors.length === 0) {
    return {
      assessableVendorCount: assessableVendors.length,
      assessedVendorCount: 0,
      controlId: null,
      evidenceId: null,
      reason: vendorRows.length === 0 ? "no_vendors" : "no_assessable_vendors",
      status: "untouched",
      summary: null,
    };
  }

  const assessmentRows = await db
    .select({
      assessedAt: vendorAssessments.assessedAt,
      status: vendorAssessments.status,
      vendorId: vendorAssessments.vendorId,
    })
    .from(vendorAssessments)
    .where(
      and(
        eq(vendorAssessments.clerkOrgId, clerkOrgId),
        inArray(
          vendorAssessments.vendorId,
          assessableVendors.map((vendor) => vendor.id),
        ),
      ),
    )
    .orderBy(desc(vendorAssessments.assessedAt), desc(vendorAssessments.id));
  const latestAssessmentByVendorId = new Map<
    string,
    (typeof assessmentRows)[number]
  >();

  for (const assessment of assessmentRows) {
    if (!latestAssessmentByVendorId.has(assessment.vendorId)) {
      latestAssessmentByVendorId.set(assessment.vendorId, assessment);
    }
  }

  const assessedVendorIds = new Set<string>();
  for (const vendor of assessableVendors) {
    const latestAssessment = latestAssessmentByVendorId.get(vendor.id);
    const hasCompletedAssessment =
      latestAssessment !== undefined &&
      ASSESSED_ASSESSMENT_STATUSES.includes(
        latestAssessment.status as (typeof ASSESSED_ASSESSMENT_STATUSES)[number],
      );

    if (hasCompletedAssessment && isReviewFresh(vendor.nextReviewAt, now)) {
      assessedVendorIds.add(vendor.id);
    }
  }

  const summary = buildCoverageSummary({
    assessedVendorCount: assessedVendorIds.size,
    assessableVendorCount: assessableVendors.length,
  });
  const status: CoverageStatus =
    assessedVendorIds.size === assessableVendors.length ? "pass" : "manual_review";
  const controlId = await getVendorSecurityControlId();
  if (!controlId) {
    return {
      assessableVendorCount: assessableVendors.length,
      assessedVendorCount: assessedVendorIds.size,
      controlId: null,
      evidenceId: null,
      reason: "missing_control",
      status: "untouched",
      summary,
    };
  }

  const evidenceId = await upsertCoverageEvidence({
    assessableVendors,
    assessedVendorIds,
    clerkOrgId,
    controlId,
    now,
    status,
    summary,
  });

  return {
    assessableVendorCount: assessableVendors.length,
    assessedVendorCount: assessedVendorIds.size,
    controlId,
    evidenceId,
    reason: null,
    status,
    summary,
  };
}

export async function recalculateVendorAssessmentControlsForAllOrgs(
  now = new Date(),
) {
  const db = getDb();
  const orgRows = await db
    .select({ clerkOrgId: vendors.clerkOrgId })
    .from(vendors)
    .where(inArray(vendors.riskTier, ASSESSABLE_RISK_TIERS));
  const clerkOrgIds = [...new Set(orgRows.map((row) => row.clerkOrgId))];
  let updatedControls = 0;

  for (const clerkOrgId of clerkOrgIds) {
    const result = await recalculateVendorAssessmentControl(clerkOrgId, now);
    if (result.status !== "untouched") {
      updatedControls += 1;
    }
  }

  return {
    scannedOrgs: clerkOrgIds.length,
    updatedControls,
  };
}
