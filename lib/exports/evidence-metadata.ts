import type { EvidenceMetadataExportRow } from "@/lib/db/queries/evidence";

function escapeCsvValue(value: unknown) {
  const text =
    value instanceof Date
      ? value.toISOString()
      : Array.isArray(value)
        ? value.join("; ")
        : String(value ?? "");

  return `"${text.replace(/"/g, '""')}"`;
}

export function renderEvidenceMetadataCsv(rows: EvidenceMetadataExportRow[]) {
  const header = [
    "evidence_id",
    "control_key",
    "control_title",
    "status",
    "assessment_result",
    "collection_status",
    "confidence",
    "blocked_reason",
    "frameworks",
    "type",
    "source",
    "description",
    "collected_by",
    "collected_at",
    "has_file",
    "download_path",
  ];
  const body = rows.map((row) =>
    [
      row.evidenceId,
      row.controlKey,
      row.controlTitle,
      row.status,
      row.assessmentResult,
      row.collectionStatus,
      row.confidence,
      row.blockedReason,
      row.frameworks.map((framework) => framework.frameworkSlug),
      row.type,
      row.source,
      row.description,
      row.collectedBy,
      row.collectedAt,
      row.hasFile,
      row.downloadPath,
    ]
      .map(escapeCsvValue)
      .join(","),
  );

  return [header.join(","), ...body].join("\n");
}
