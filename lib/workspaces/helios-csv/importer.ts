import { createManualEvidence } from "@/lib/db/queries/evidence";
import { mapHeliosCsvRecords } from "@/lib/workspaces/helios-csv/mapping";
import { parseHeliosCsv } from "@/lib/workspaces/helios-csv/parser";
import type {
  HeliosCsvFileKind,
  HeliosCsvImportResult,
} from "@/lib/workspaces/helios-csv/types";

export async function importHeliosCsvEvidence(input: {
  clerkOrgId: string;
  collectedBy: string;
  csvText: string;
  kind: HeliosCsvFileKind;
}): Promise<HeliosCsvImportResult> {
  const parsed = parseHeliosCsv(input.kind, input.csvText);
  if (!parsed.ok) {
    return {
      created: [],
      errors: parsed.errors,
      gapsCount: 0,
      manualReviewCount: 0,
      parsedRows: parsed.records.length,
      skippedRows: Math.max(parsed.rowCount - parsed.records.length, 0),
      sourceFileKind: input.kind,
    };
  }

  const candidates = mapHeliosCsvRecords(parsed.records);
  const created: { controlKey: string; evidenceId: string }[] = [];
  let gapsCount = 0;
  let manualReviewCount = 0;

  for (const candidate of candidates) {
    if (candidate.assessmentResult === "gap") gapsCount += 1;
    if (candidate.assessmentResult === "manual_review") manualReviewCount += 1;
    const result = await createManualEvidence({
      assessmentResult: candidate.assessmentResult,
      blobUrl: null,
      clerkOrgId: input.clerkOrgId,
      collectedBy: input.collectedBy,
      controlKey: candidate.controlKey,
      description: candidate.description,
      expiresAt: null,
      fileType: candidate.evidenceType,
      snapshotData: {
        ...candidate.snapshotData,
        evidenceType: candidate.evidenceType,
        provenance: candidate.provenance,
        templateVersion: "splnit-helios-csv-v1",
      },
    });
    created.push({ controlKey: candidate.controlKey, evidenceId: result.evidenceId });
  }

  return {
    created,
    errors: parsed.errors,
    gapsCount,
    manualReviewCount,
    parsedRows: parsed.records.length,
    skippedRows: Math.max(parsed.rowCount - parsed.records.length, 0),
    sourceFileKind: input.kind,
  };
}
