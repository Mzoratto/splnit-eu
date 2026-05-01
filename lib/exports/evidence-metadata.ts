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
    "frameworks",
    "type",
    "source",
    "description",
    "collected_by",
    "collected_at",
    "expires_at",
    "has_file",
    "download_path",
  ];
  const body = rows.map((row) =>
    [
      row.evidenceId,
      row.controlKey,
      row.controlTitle,
      row.status,
      row.frameworks.map((framework) => framework.frameworkSlug),
      row.type,
      row.source,
      row.description,
      row.collectedBy,
      row.collectedAt,
      row.expiresAt,
      row.hasFile,
      row.downloadPath,
    ]
      .map(escapeCsvValue)
      .join(","),
  );

  return [header.join(","), ...body].join("\n");
}
