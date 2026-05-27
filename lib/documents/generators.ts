import writeXlsxFile, { type Cell, type Sheet } from "write-excel-file/node";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import { mapControlStatus, mapVendorRiskTier, mapVendorStatus } from "./status-map";
import type {
  GapAnalysisRow,
  OrgDocumentMetadata,
  SoAData,
  VendorReportRow,
} from "./queries";

type SpreadsheetValue = string | number | boolean | Date | null | undefined;
type SpreadsheetRow = SpreadsheetValue[];
type SpreadsheetSheet = {
  name: string;
  rows: SpreadsheetRow[];
};

const HEADER_STYLE = {
  alignVertical: "center" as const,
  backgroundColor: "#1F4E78",
  fontWeight: "bold" as const,
  textColor: "#FFFFFF",
  wrap: true,
};

const ALT_ROW_STYLE = {
  backgroundColor: "#F3F6FA",
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${String(date.getDate()).padStart(2, "0")}.${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}.${date.getFullYear()}`;
}

function columnWidths(rows: SpreadsheetRow[]) {
  return rows[0]?.map((_, columnIndex) => ({
    width: Math.min(
      Math.max(
        ...rows.map((row) => String(row[columnIndex] ?? "").length),
        10,
      ) + 2,
      60,
    ),
  }));
}

function styledRows(rows: SpreadsheetRow[]): Cell[][] {
  return rows.map((row, rowIndex) =>
    row.map((value) => {
      const cellValue = value ?? "";

      if (rowIndex === 0) {
        return { value: cellValue, ...HEADER_STYLE };
      }

      if (rowIndex % 2 !== 0) {
        return { value: cellValue, ...ALT_ROW_STYLE };
      }

      return cellValue;
    }),
  );
}

function buildSheet(sheet: SpreadsheetSheet): Sheet<Buffer> {
  return {
    columns: columnWidths(sheet.rows),
    data: styledRows(sheet.rows),
    sheet: sheet.name,
    stickyRowsCount: 1,
  };
}

function workbookBuffer(sheets: SpreadsheetSheet[]) {
  return writeXlsxFile(sheets.map(buildSheet)).toBuffer();
}

function getFrameworkName(frameworkSlug: string) {
  return FRAMEWORK_LIBRARY.find((framework) => framework.slug === frameworkSlug)?.nameCs ??
    frameworkSlug;
}

function responsiblePerson(meta: OrgDocumentMetadata) {
  const person = meta.responsiblePerson;

  if (!person) {
    return "";
  }

  return [person.fullName, person.email].filter(Boolean).join(" / ");
}

function countControls(rows: GapAnalysisRow[]) {
  return rows.reduce(
    (counts, row) => {
      if (row.status === "pass") {
        counts.done += 1;
      } else if (
        row.status === "in_progress" ||
        row.status === "manual_review" ||
        row.status === "warning"
      ) {
        counts.partial += 1;
      } else if (row.status === "not_applicable") {
        counts.notApplicable += 1;
      } else {
        counts.missing += 1;
      }

      return counts;
    },
    { done: 0, missing: 0, notApplicable: 0, partial: 0 },
  );
}

function metadataRows(meta: OrgDocumentMetadata, frameworkName: string, rows: GapAnalysisRow[]) {
  const counts = countControls(rows);

  return [
    ["Pole", "Hodnota"],
    ["Organizace", meta.name],
    ["IČO", meta.ico ?? ""],
    ["DIČ", meta.dic ?? ""],
    ["Sídlo", meta.sidlo ?? ""],
    ["Sektor", meta.sector ?? ""],
    ["Země", meta.country ?? ""],
    ["Počet zaměstnanců", meta.employeeCount ?? ""],
    ["Odpovědná osoba", responsiblePerson(meta)],
    ["Framework", frameworkName],
    ["Datum generování", formatDate(new Date())],
    ["Kontroly celkem", rows.length],
    ["Zavedeno", counts.done],
    ["Částečně", counts.partial],
    ["Chybí", counts.missing],
    ["N/A", counts.notApplicable],
  ];
}

export async function generateGapAnalysisXLSX(input: {
  frameworkSlug: string;
  meta: OrgDocumentMetadata;
  rows: GapAnalysisRow[];
}) {
  const frameworkName = getFrameworkName(input.frameworkSlug);

  return workbookBuffer([
    {
      name: "Metadata",
      rows: metadataRows(input.meta, frameworkName, input.rows),
    },
    {
      name: "GAP analýza",
      rows: [
        [
          "#",
          "Kategorie",
          "Kontrola",
          "Aktuální stav",
          "Poznámky",
          "Odpovědná osoba",
          "Datum ověření",
        ],
        ...input.rows.map((row, index) => [
          index + 1,
          row.category ?? "",
          `${row.controlKey} — ${row.title}`,
          mapControlStatus(row.status),
          row.notes,
          row.assignedTo || input.meta.responsiblePerson?.fullName || "",
          formatDate(row.lastTestedAt),
        ]),
      ],
    },
  ]);
}

export async function generateSoAXLSX(input: {
  data: SoAData;
  meta: OrgDocumentMetadata;
}) {
  const rows = input.data.controls;
  const metadata = metadataRows(input.meta, "ISO 27001", rows);

  metadata.push(["Stav frameworku", input.data.framework?.status ?? ""]);
  metadata.push(["Skóre frameworku", input.data.framework?.score ?? ""]);

  return workbookBuffer([
    {
      name: "Metadata",
      rows: metadata,
    },
    {
      name: "Prohlášení o aplikovatelnosti",
      rows: [
        [
          "ID",
          "Název kontroly",
          "Téma",
          "Aplikujeme?",
          "Zdůvodnění",
          "Stav implementace",
          "Vlastník",
          "Poznámky",
        ],
        ...rows.map((row) => [
          row.controlKey,
          row.title,
          row.category ?? "",
          row.status === "not_applicable" ? "Ne" : "Ano",
          row.status === "not_applicable" ? row.notes : "",
          mapControlStatus(row.status),
          row.assignedTo || input.meta.responsiblePerson?.fullName || "",
          row.notes,
        ]),
      ],
    },
  ]);
}

export async function generateVendorReportXLSX(input: {
  meta: OrgDocumentMetadata;
  rows: VendorReportRow[];
}) {
  const riskCounts = input.rows.reduce(
    (counts, row) => {
      if (row.riskTier === "critical") {
        counts.critical += 1;
      } else if (row.riskTier === "high") {
        counts.high += 1;
      } else if (row.riskTier === "medium") {
        counts.medium += 1;
      } else if (row.riskTier === "low") {
        counts.low += 1;
      }

      return counts;
    },
    { critical: 0, high: 0, low: 0, medium: 0 },
  );

  return workbookBuffer([
    {
      name: "Metadata",
      rows: [
        ["Pole", "Hodnota"],
        ["Organizace", input.meta.name],
        ["Datum generování", formatDate(new Date())],
        ["Dodavatelé celkem", input.rows.length],
        ["Kritické riziko", riskCounts.critical],
        ["Vysoké riziko", riskCounts.high],
        ["Střední riziko", riskCounts.medium],
        ["Nízké riziko", riskCounts.low],
      ],
    },
    {
      name: "Přehled dodavatelů",
      rows: [
        [
          "#",
          "Název",
          "Kategorie",
          "Riziková úroveň",
          "Stav",
          "Skóre hodnocení",
          "Datum hodnocení",
          "Příští přezkum",
        ],
        ...input.rows.map((row, index) => [
          index + 1,
          row.name,
          row.category ?? "",
          mapVendorRiskTier(row.riskTier),
          mapVendorStatus(row.status),
          row.latestAssessment?.score == null
            ? "Nehodnoceno"
            : `${row.latestAssessment.score}/100`,
          formatDate(row.latestAssessment?.assessedAt ?? row.lastAssessedAt),
          formatDate(row.nextReviewAt),
        ]),
      ],
    },
  ]);
}
