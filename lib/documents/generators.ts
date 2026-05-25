import * as XLSX from "xlsx";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import { mapControlStatus, mapVendorRiskTier, mapVendorStatus } from "./status-map";
import type {
  GapAnalysisRow,
  OrgDocumentMetadata,
  SoAData,
  VendorReportRow,
} from "./queries";

type Workbook = XLSX.WorkBook;
type Worksheet = XLSX.WorkSheet & {
  "!cols"?: Array<{ wch: number }>;
  "!freeze"?: { xSplit?: number; ySplit?: number };
  "!views"?: Array<{ state: "frozen"; xSplit?: number; ySplit?: number }>;
};

const HEADER_STYLE = {
  alignment: { vertical: "center", wrapText: true },
  fill: { fgColor: { rgb: "1F4E78" }, patternType: "solid" },
  font: { bold: true, color: { rgb: "FFFFFF" } },
};

const ALT_ROW_STYLE = {
  fill: { fgColor: { rgb: "F3F6FA" }, patternType: "solid" },
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

function appendRows(workbook: Workbook, sheetName: string, rows: unknown[][]) {
  const worksheet = XLSX.utils.aoa_to_sheet(rows) as Worksheet;
  const range = XLSX.utils.decode_range(worksheet["!ref"] ?? "A1:A1");

  for (let column = range.s.c; column <= range.e.c; column += 1) {
    const headerCell = worksheet[XLSX.utils.encode_cell({ c: column, r: 0 })];

    if (headerCell) {
      headerCell.s = HEADER_STYLE;
    }
  }

  for (let row = 1; row <= range.e.r; row += 1) {
    if (row % 2 !== 0) {
      for (let column = range.s.c; column <= range.e.c; column += 1) {
        const cell = worksheet[XLSX.utils.encode_cell({ c: column, r: row })];

        if (cell) {
          cell.s = ALT_ROW_STYLE;
        }
      }
    }
  }

  worksheet["!cols"] = rows[0]?.map((_, columnIndex) => ({
    wch: Math.min(
      Math.max(
        ...rows.map((row) => String(row[columnIndex] ?? "").length),
        10,
      ) + 2,
      60,
    ),
  }));
  worksheet["!freeze"] = { ySplit: 1 };
  worksheet["!views"] = [{ state: "frozen", ySplit: 1 }];
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
}

function workbookBuffer(workbook: Workbook) {
  return XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  }) as Buffer;
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

export function generateGapAnalysisXLSX(input: {
  frameworkSlug: string;
  meta: OrgDocumentMetadata;
  rows: GapAnalysisRow[];
}) {
  const workbook = XLSX.utils.book_new();
  const frameworkName = getFrameworkName(input.frameworkSlug);

  appendRows(workbook, "Metadata", metadataRows(input.meta, frameworkName, input.rows));
  appendRows(workbook, "GAP analýza", [
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
  ]);

  return workbookBuffer(workbook);
}

export function generateSoAXLSX(input: {
  data: SoAData;
  meta: OrgDocumentMetadata;
}) {
  const workbook = XLSX.utils.book_new();
  const rows = input.data.controls;
  const metadata = metadataRows(input.meta, "ISO 27001", rows);

  metadata.push(["Stav frameworku", input.data.framework?.status ?? ""]);
  metadata.push(["Skóre frameworku", input.data.framework?.score ?? ""]);
  appendRows(workbook, "Metadata", metadata);
  appendRows(workbook, "Prohlášení o aplikovatelnosti", [
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
  ]);

  return workbookBuffer(workbook);
}

export function generateVendorReportXLSX(input: {
  meta: OrgDocumentMetadata;
  rows: VendorReportRow[];
}) {
  const workbook = XLSX.utils.book_new();
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

  appendRows(workbook, "Metadata", [
    ["Pole", "Hodnota"],
    ["Organizace", input.meta.name],
    ["Datum generování", formatDate(new Date())],
    ["Dodavatelé celkem", input.rows.length],
    ["Kritické riziko", riskCounts.critical],
    ["Vysoké riziko", riskCounts.high],
    ["Střední riziko", riskCounts.medium],
    ["Nízké riziko", riskCounts.low],
  ]);
  appendRows(workbook, "Přehled dodavatelů", [
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
  ]);

  return workbookBuffer(workbook);
}
