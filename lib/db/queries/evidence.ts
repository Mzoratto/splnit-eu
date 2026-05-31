import { and, desc, eq, inArray } from "drizzle-orm";
import { createEvidenceState } from "@/lib/activation/evidence-state";
import type { EvidenceAssessmentResult } from "@/lib/activation/evidence-state";
import { getDb } from "@/lib/db";
import {
  controls,
  evidence,
  frameworkControls,
  frameworks,
  orgControlStatuses,
} from "@/lib/db/schema";

export type EvidenceMetadataExportRow = {
  assessmentResult: string;
  blockedReason: string | null;
  collectedAt: Date | null;
  collectedBy: string | null;
  collectionStatus: string;
  confidence: string;
  controlId: string;
  controlKey: string;
  controlTitle: string;
  description: string | null;
  downloadPath: string | null;
  evidenceId: string;
  frameworks: { frameworkName: string; frameworkSlug: string }[];
  hasFile: boolean;
  source: string | null;
  status: string | null;
  type: string;
};

export type EvidenceArchiveFile = {
  blobUrl: string;
  collectedAt: Date | null;
  controlKey: string;
  controlTitle: string;
  description: string | null;
  evidenceId: string;
  source: string | null;
  type: string;
};

export async function listEvidenceForControl(clerkOrgId: string, controlId: string) {
  const db = getDb();

  return db
    .select()
    .from(evidence)
    .where(and(eq(evidence.clerkOrgId, clerkOrgId), eq(evidence.controlId, controlId)))
    .orderBy(desc(evidence.collectedAt));
}

export async function createManualEvidence(input: {
  blobUrl?: string | null;
  clerkOrgId: string;
  collectedBy: string;
  controlKey: string;
  description: string | null;
  assessmentResult?: EvidenceAssessmentResult;
  expiresAt: string | null;
  fileType: string;
  snapshotData?: Record<string, unknown> | null;
}) {
  const db = getDb();

  if (input.fileType === "helios_csv_import" && input.assessmentResult === "pass") {
    throw new Error("Helios CSV import evidence cannot be assessed as pass.");
  }

  const manualEvidenceState = createEvidenceState({
    assessment_result: "manual_review",
    collected_at: new Date(),
    collection_status: "collected",
    source: "manual",
  });
  if (input.assessmentResult && input.assessmentResult !== "manual_review") {
    manualEvidenceState.assessment_result = input.assessmentResult;
  }
  const controlRows = await db
    .select({ id: controls.id })
    .from(controls)
    .where(eq(controls.key, input.controlKey))
    .limit(1);
  const control = controlRows[0] ?? null;

  if (!control) {
    throw new Error(`Unknown control: ${input.controlKey}`);
  }

  const insertedRows = await db
    .insert(evidence)
    .values({
      assessmentResult: manualEvidenceState.assessment_result,
      blockedReason: manualEvidenceState.blocked_reason,
      blobUrl: input.blobUrl ?? null,
      clerkOrgId: input.clerkOrgId,
      collectedAt: manualEvidenceState.collected_at,
      collectedBy: input.collectedBy,
      collectionStatus: manualEvidenceState.collection_status,
      confidence: manualEvidenceState.confidence,
      controlId: control.id,
      description: input.description,
      snapshotData: input.snapshotData ?? null,
      source: manualEvidenceState.source,
      type: input.fileType,
    })
    .returning({ id: evidence.id });
  const evidenceId = insertedRows[0]?.id;

  if (!evidenceId) {
    throw new Error("Failed to create evidence record.");
  }

  await db
    .insert(orgControlStatuses)
    .values({
      clerkOrgId: input.clerkOrgId,
      controlId: control.id,
      lastEvidenceAt: new Date(),
      status: "unknown",
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [orgControlStatuses.clerkOrgId, orgControlStatuses.controlId],
      set: {
        lastEvidenceAt: new Date(),
        updatedAt: new Date(),
      },
    });

  return {
    controlId: control.id,
    evidenceId,
  };
}

export async function createManualAttestationEvidence(input: {
  answers: Record<string, unknown>;
  assessmentResult?: EvidenceAssessmentResult;
  clerkOrgId: string;
  collectedBy: string;
  controlKey: string;
  description: string | null;
  expiresAt?: string | null;
}) {
  return createManualEvidence({
    assessmentResult: input.assessmentResult,
    blobUrl: null,
    clerkOrgId: input.clerkOrgId,
    collectedBy: input.collectedBy,
    controlKey: input.controlKey,
    description: input.description,
    expiresAt: input.expiresAt ?? null,
    fileType: "attestation_answers",
    snapshotData: {
      attestationAnswers: input.answers,
    },
  });
}

export async function createHeliosCsvImportEvidence(input: {
  assessmentResult: EvidenceAssessmentResult;
  clerkOrgId: string;
  collectedBy: string;
  controlKey: string;
  description: string | null;
  rows: Record<string, unknown>[];
  templateVersion?: string | null;
}) {
  if (input.assessmentResult !== "manual_review" && input.assessmentResult !== "gap") {
    throw new Error("Helios CSV import evidence must be manual_review or gap.");
  }

  return createManualEvidence({
    assessmentResult: input.assessmentResult,
    blobUrl: null,
    clerkOrgId: input.clerkOrgId,
    collectedBy: input.collectedBy,
    controlKey: input.controlKey,
    description: input.description,
    expiresAt: null,
    fileType: "helios_csv_import",
    snapshotData: {
      provenance: "customer_reported_csv_template",
      rows: input.rows,
      templateVersion: input.templateVersion ?? null,
    },
  });
}

export async function getEvidenceForOrg(input: {
  clerkOrgId: string;
  evidenceId: string;
}) {
  const db = getDb();
  const rows = await db
    .select()
    .from(evidence)
    .where(
      and(
        eq(evidence.clerkOrgId, input.clerkOrgId),
        eq(evidence.id, input.evidenceId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function listEvidenceVault(clerkOrgId: string) {
  const db = getDb();
  const evidenceRows = await db
    .select({
      blobUrl: evidence.blobUrl,
      collectedAt: evidence.collectedAt,
      collectedBy: evidence.collectedBy,
      controlId: evidence.controlId,
      controlKey: controls.key,
      controlTitle: controls.titleCs,
      controlTitleCs: controls.titleCs,
      controlTitleEn: controls.titleEn,
      description: evidence.description,
      evidenceId: evidence.id,
      assessmentResult: evidence.assessmentResult,
      blockedReason: evidence.blockedReason,
      collectionStatus: evidence.collectionStatus,
      confidence: evidence.confidence,
      snapshotData: evidence.snapshotData,
      source: evidence.source,
      status: orgControlStatuses.status,
      type: evidence.type,
    })
    .from(evidence)
    .innerJoin(controls, eq(evidence.controlId, controls.id))
    .leftJoin(
      orgControlStatuses,
      and(
        eq(orgControlStatuses.clerkOrgId, evidence.clerkOrgId),
        eq(orgControlStatuses.controlId, evidence.controlId),
      ),
    )
    .where(eq(evidence.clerkOrgId, clerkOrgId))
    .orderBy(desc(evidence.collectedAt))
    .limit(200);
  const controlIds = Array.from(
    new Set(evidenceRows.map((row) => row.controlId)),
  );
  const mappingRows =
    controlIds.length > 0
      ? await db
          .select({
            controlId: frameworkControls.controlId,
            frameworkName: frameworks.nameCs,
            frameworkNameCs: frameworks.nameCs,
            frameworkNameEn: frameworks.nameEn,
            frameworkSlug: frameworks.slug,
          })
          .from(frameworkControls)
          .innerJoin(frameworks, eq(frameworkControls.frameworkId, frameworks.id))
          .where(inArray(frameworkControls.controlId, controlIds))
      : [];
  const frameworksByControl = new Map<
    string,
    {
      frameworkName: string;
      frameworkNameCs: string;
      frameworkNameEn: string;
      frameworkSlug: string;
    }[]
  >();

  for (const row of mappingRows) {
    const existing = frameworksByControl.get(row.controlId) ?? [];
    existing.push({
      frameworkName: row.frameworkName,
      frameworkNameCs: row.frameworkNameCs,
      frameworkNameEn: row.frameworkNameEn,
      frameworkSlug: row.frameworkSlug,
    });
    frameworksByControl.set(row.controlId, existing);
  }

  return evidenceRows.map((row) => ({
    ...row,
    frameworks: frameworksByControl.get(row.controlId) ?? [],
  }));
}

export async function listEvidenceMetadataForExport(
  clerkOrgId: string,
): Promise<EvidenceMetadataExportRow[]> {
  const db = getDb();
  const evidenceRows = await db
    .select({
      blobUrl: evidence.blobUrl,
      collectedAt: evidence.collectedAt,
      collectedBy: evidence.collectedBy,
      controlId: evidence.controlId,
      controlKey: controls.key,
      controlTitle: controls.titleCs,
      description: evidence.description,
      evidenceId: evidence.id,
      assessmentResult: evidence.assessmentResult,
      blockedReason: evidence.blockedReason,
      collectionStatus: evidence.collectionStatus,
      confidence: evidence.confidence,
      snapshotData: evidence.snapshotData,
      source: evidence.source,
      status: orgControlStatuses.status,
      type: evidence.type,
    })
    .from(evidence)
    .innerJoin(controls, eq(evidence.controlId, controls.id))
    .leftJoin(
      orgControlStatuses,
      and(
        eq(orgControlStatuses.clerkOrgId, evidence.clerkOrgId),
        eq(orgControlStatuses.controlId, evidence.controlId),
      ),
    )
    .where(eq(evidence.clerkOrgId, clerkOrgId))
    .orderBy(desc(evidence.collectedAt));
  const controlIds = Array.from(
    new Set(evidenceRows.map((row) => row.controlId)),
  );
  const mappingRows =
    controlIds.length > 0
      ? await db
          .select({
            controlId: frameworkControls.controlId,
            frameworkName: frameworks.nameCs,
            frameworkSlug: frameworks.slug,
          })
          .from(frameworkControls)
          .innerJoin(frameworks, eq(frameworkControls.frameworkId, frameworks.id))
          .where(inArray(frameworkControls.controlId, controlIds))
      : [];
  const frameworksByControl = new Map<
    string,
    { frameworkName: string; frameworkSlug: string }[]
  >();

  for (const row of mappingRows) {
    const existing = frameworksByControl.get(row.controlId) ?? [];
    existing.push({
      frameworkName: row.frameworkName,
      frameworkSlug: row.frameworkSlug,
    });
    frameworksByControl.set(row.controlId, existing);
  }

  return evidenceRows.map((row) => ({
    assessmentResult: row.assessmentResult,
    blockedReason: row.blockedReason,
    collectedAt: row.collectedAt,
    collectedBy: row.collectedBy,
    collectionStatus: row.collectionStatus,
    confidence: row.confidence,
    controlId: row.controlId,
    controlKey: row.controlKey,
    controlTitle: row.controlTitle,
    description: row.description,
    downloadPath: row.blobUrl ? `/api/evidence/${row.evidenceId}/download` : null,
    evidenceId: row.evidenceId,
    frameworks: frameworksByControl.get(row.controlId) ?? [],
    hasFile: Boolean(row.blobUrl),
    source: row.source,
    status: row.status,
    type: row.type,
  }));
}

export async function listEvidenceArchiveFiles(
  clerkOrgId: string,
): Promise<EvidenceArchiveFile[]> {
  const db = getDb();
  const rows = await db
    .select({
      blobUrl: evidence.blobUrl,
      collectedAt: evidence.collectedAt,
      controlKey: controls.key,
      controlTitle: controls.titleCs,
      description: evidence.description,
      evidenceId: evidence.id,
      source: evidence.source,
      type: evidence.type,
    })
    .from(evidence)
    .innerJoin(controls, eq(evidence.controlId, controls.id))
    .where(eq(evidence.clerkOrgId, clerkOrgId))
    .orderBy(desc(evidence.collectedAt));

  return rows.flatMap((row) =>
    row.blobUrl
      ? [
          {
            blobUrl: row.blobUrl,
            collectedAt: row.collectedAt,
            controlKey: row.controlKey,
            controlTitle: row.controlTitle,
            description: row.description,
            evidenceId: row.evidenceId,
            source: row.source,
            type: row.type,
          },
        ]
      : [],
  );
}

export type EvidenceExpiryAlert = {
  controlTitle: string;
  evidenceId: string;
  expiresAt: string;
  locale: string;
  organisationName: string;
  recipients: string[];
};

export async function listExpiringEvidenceAlerts(
  targetDates: string[],
): Promise<EvidenceExpiryAlert[]> {
  if (targetDates.length === 0) {
    return [];
  }
  return [];
}
