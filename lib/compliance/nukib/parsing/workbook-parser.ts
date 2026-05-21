import { inflateRawSync } from "node:zlib";

import { XMLParser } from "fast-xml-parser";

import { parseDeadline } from "@/lib/compliance/nukib/parsing/deadline-parser";
import type {
  NukibBaselineControl,
  NukibComplianceState,
  NukibControlTier,
  NukibPriority,
} from "@/lib/compliance/nukib/types";

const EXPECTED_SHEET_NAMES = [
  "Přehled bezpečnostních opatření",
  "Legenda",
] as const;

type XmlRecord = Record<string, unknown>;

interface WorkbookSheet {
  name: string;
  path: string;
}

interface LegendaEnums {
  states: Set<string>;
  priorities: Set<string>;
}

interface SheetRow {
  sourceRow: number;
  cells: Record<string, string>;
}

export class NukibWorkbookParseError extends Error {
  readonly sheetName?: string;
  readonly sourceRow?: number;
  readonly detectedSheets?: string[];

  constructor(
    message: string,
    options: {
      sheetName?: string;
      sourceRow?: number;
      detectedSheets?: string[];
    } = {},
  ) {
    super(message);
    this.name = "NukibWorkbookParseError";
    this.sheetName = options.sheetName;
    this.sourceRow = options.sourceRow;
    this.detectedSheets = options.detectedSheets;
  }
}

const parser = new XMLParser({
  attributeNamePrefix: "",
  ignoreAttributes: false,
  preserveOrder: false,
  textNodeName: "#text",
  trimValues: false,
});

export function parseNukibWorkbook(
  buffer: Buffer | Uint8Array,
): NukibBaselineControl[] {
  const entries = readZipEntries(buffer);
  const sheets = readWorkbookSheets(entries);
  const detectedSheetNames = sheets.map((sheet) => sheet.name);
  const missingSheets = EXPECTED_SHEET_NAMES.filter(
    (name) => !detectedSheetNames.includes(name),
  );

  if (missingSheets.length > 0 || detectedSheetNames.length !== EXPECTED_SHEET_NAMES.length) {
    throw new NukibWorkbookParseError(
      `NÚKIB workbook sheet mismatch. Expected sheets: ${EXPECTED_SHEET_NAMES.join(
        ", ",
      )}. Detected sheets: ${detectedSheetNames.join(", ") || "(none)"}.`,
      { detectedSheets: detectedSheetNames },
    );
  }

  const sharedStrings = readSharedStrings(entries);
  const legendaSheet = findSheet(sheets, "Legenda");
  const mainSheet = findSheet(sheets, "Přehled bezpečnostních opatření");
  const legendaRows = readSheetRows(entries, legendaSheet, sharedStrings);
  const enums = extractLegendaEnums(legendaRows);
  const mainRows = readSheetRows(entries, mainSheet, sharedStrings);

  return mainRows.flatMap((row) => {
    try {
      const control = rowToBaselineControl(row, enums);
      return control ? [control] : [];
    } catch (error) {
      if (error instanceof NukibWorkbookParseError) {
        throw error;
      }

      throw new NukibWorkbookParseError(
        `Failed to parse NÚKIB workbook row ${row.sourceRow}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        {
          sheetName: mainSheet.name,
          sourceRow: row.sourceRow,
        },
      );
    }
  });
}

function readZipEntries(buffer: Buffer | Uint8Array): Map<string, Buffer> {
  const data = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const eocdOffset = findEndOfCentralDirectory(data);
  const totalEntries = data.readUInt16LE(eocdOffset + 10);
  const centralDirectoryOffset = data.readUInt32LE(eocdOffset + 16);
  const entries = new Map<string, Buffer>();
  let offset = centralDirectoryOffset;

  for (let index = 0; index < totalEntries; index += 1) {
    const signature = data.readUInt32LE(offset);
    if (signature !== 0x02014b50) {
      throw new NukibWorkbookParseError(
        `Invalid ZIP central directory at offset ${offset}.`,
      );
    }

    const compressionMethod = data.readUInt16LE(offset + 10);
    const compressedSize = data.readUInt32LE(offset + 20);
    const fileNameLength = data.readUInt16LE(offset + 28);
    const extraFieldLength = data.readUInt16LE(offset + 30);
    const fileCommentLength = data.readUInt16LE(offset + 32);
    const localHeaderOffset = data.readUInt32LE(offset + 42);
    const fileName = data
      .subarray(offset + 46, offset + 46 + fileNameLength)
      .toString("utf8");

    const localSignature = data.readUInt32LE(localHeaderOffset);
    if (localSignature !== 0x04034b50) {
      throw new NukibWorkbookParseError(
        `Invalid ZIP local file header for ${fileName}.`,
      );
    }

    const localFileNameLength = data.readUInt16LE(localHeaderOffset + 26);
    const localExtraFieldLength = data.readUInt16LE(localHeaderOffset + 28);
    const fileDataOffset =
      localHeaderOffset + 30 + localFileNameLength + localExtraFieldLength;
    const compressed = data.subarray(
      fileDataOffset,
      fileDataOffset + compressedSize,
    );

    if (compressionMethod === 0) {
      entries.set(fileName, Buffer.from(compressed));
    } else if (compressionMethod === 8) {
      entries.set(fileName, inflateRawSync(compressed));
    } else {
      throw new NukibWorkbookParseError(
        `Unsupported ZIP compression method ${compressionMethod} for ${fileName}.`,
      );
    }

    offset += 46 + fileNameLength + extraFieldLength + fileCommentLength;
  }

  return entries;
}

function findEndOfCentralDirectory(data: Buffer): number {
  for (let offset = data.length - 22; offset >= 0; offset -= 1) {
    if (data.readUInt32LE(offset) === 0x06054b50) {
      return offset;
    }
  }

  throw new NukibWorkbookParseError("Invalid XLSX ZIP: missing EOCD record.");
}

function readWorkbookSheets(entries: Map<string, Buffer>): WorkbookSheet[] {
  const workbookXml = getRequiredEntry(entries, "xl/workbook.xml");
  const relationshipsXml = getRequiredEntry(entries, "xl/_rels/workbook.xml.rels");
  const workbook = parser.parse(workbookXml.toString("utf8"));
  const relationships = parser.parse(relationshipsXml.toString("utf8"));
  const relationshipById = new Map<string, string>();

  for (const relationship of asArray<XmlRecord>(
    prop(prop(relationships, "Relationships"), "Relationship"),
  )) {
    const id = stringProp(relationship, "Id");
    const target = stringProp(relationship, "Target");
    if (id && target) {
      relationshipById.set(id, normalizeWorkbookTarget(target));
    }
  }

  return asArray<XmlRecord>(
    prop(prop(prop(workbook, "workbook"), "sheets"), "sheet"),
  ).map((sheet) => {
    const name = stringProp(sheet, "name");
    const relationshipId = stringProp(sheet, "r:id");
    const path = relationshipId ? relationshipById.get(relationshipId) : undefined;

    if (!name || !path) {
      throw new NukibWorkbookParseError(
        "Invalid workbook.xml: sheet name or relationship target is missing.",
      );
    }

    return { name, path };
  });
}

function normalizeWorkbookTarget(target: string): string {
  const withoutLeadingSlash = target.replace(/^\/+/, "");
  if (withoutLeadingSlash.startsWith("xl/")) {
    return withoutLeadingSlash;
  }

  return `xl/${withoutLeadingSlash}`;
}

function readSharedStrings(entries: Map<string, Buffer>): string[] {
  const sharedStringsXml = getRequiredEntry(entries, "xl/sharedStrings.xml");
  const sharedStrings = parser.parse(sharedStringsXml.toString("utf8"));

  return asArray<XmlRecord>(prop(prop(sharedStrings, "sst"), "si")).map(
    sharedStringToText,
  );
}

function readSheetRows(
  entries: Map<string, Buffer>,
  sheet: WorkbookSheet,
  sharedStrings: string[],
): SheetRow[] {
  const sheetXml = getRequiredEntry(entries, sheet.path);
  const sheetDocument = parser.parse(sheetXml.toString("utf8"));

  return asArray<XmlRecord>(
    prop(prop(prop(sheetDocument, "worksheet"), "sheetData"), "row"),
  ).map((row) => {
    const cells: Record<string, string> = {};
    const sheetRow: SheetRow = {
      sourceRow: Number(stringProp(row, "r") || 0),
      cells,
    };

    for (const cell of asArray<XmlRecord>(prop(row, "c"))) {
      const ref = stringProp(cell, "r");
      if (!ref) {
        continue;
      }

      const column = ref.replace(/\d+$/, "");
      cells[column] = cellToText(cell, sharedStrings);
    }

    return sheetRow;
  });
}

function extractLegendaEnums(rows: SheetRow[]): LegendaEnums {
  const states = new Set<string>();
  const priorities = new Set<string>();

  for (const row of rows) {
    const value = normalizeInlineText(row.cells.A ?? "");

    if (row.sourceRow >= 2 && row.sourceRow <= 5 && value) {
      states.add(value);
    }

    if (row.sourceRow >= 34 && row.sourceRow <= 39 && value) {
      priorities.add(value);
    }
  }

  return { states, priorities };
}

function rowToBaselineControl(
  row: SheetRow,
  enums: LegendaEnums,
): NukibBaselineControl | null {
  const paragraph = normalizeInlineText(row.cells.A ?? "");
  const paragraphTitle = normalizeInlineText(row.cells.B ?? "");
  const subsection = normalizeInlineText(row.cells.C ?? "");
  const letter = normalizeInlineText(row.cells.D ?? "");
  const nestedPoint = normalizeInlineText(row.cells.E ?? "");
  const text = normalizeInlineText(row.cells.F ?? "");
  const stateRaw = normalizeInlineText(row.cells.G ?? "");
  const implementationDescription = normalizeInlineText(row.cells.H ?? "");
  const deadlineRaw = normalizeInlineText(row.cells.I ?? "");
  const priorityRaw = normalizeInlineText(row.cells.J ?? "");
  const ownersRaw = normalizeMultilineText(row.cells.K ?? "");

  if (!paragraph || !text) {
    return null;
  }

  if (!stateRaw && !implementationDescription && !deadlineRaw && !priorityRaw && !ownersRaw) {
    return null;
  }

  if (stateRaw && !enums.states.has(stateRaw)) {
    console.warn(
      `Unknown NÚKIB state "${stateRaw}" in row ${row.sourceRow}; treating as planned.`,
    );
  }

  if (priorityRaw && !enums.priorities.has(priorityRaw)) {
    console.warn(
      `Unknown NÚKIB priority "${priorityRaw}" in row ${row.sourceRow}; treating as unset.`,
    );
  }

  const exactReference = buildExactReference({
    paragraph,
    subsection,
    letter,
    nestedPoint,
  });
  const defaultState = mapComplianceState(stateRaw);
  const notImplementedJustification =
    defaultState === "not_implemented" || defaultState === "not_applicable"
      ? implementationDescription || undefined
      : undefined;

  return {
    paragraph,
    odstavec: subsection ? `odst. ${subsection}` : undefined,
    pismeno: letter ? `písm. ${letter})` : undefined,
    exactReference,
    title: paragraphTitle || paragraph,
    text,
    // TODO: The official XLSX has no explicit implementation-level column;
    // infer from the paragraph ranges defined in the NÚKIB lower-regime spec.
    tier: inferTierFromParagraph(paragraph),
    priority: mapPriority(priorityRaw),
    deadline: parseDeadline(deadlineRaw),
    owners: splitOwners(ownersRaw),
    defaultState,
    implementationDescription: implementationDescription || undefined,
    notImplementedJustification,
    frameworkMappings: [
      {
        frameworkId: "zokb",
        reference: exactReference,
        title: paragraphTitle || undefined,
      },
    ],
    archived: false,
    sourceRow: row.sourceRow,
  };
}

function buildExactReference({
  paragraph,
  subsection,
  letter,
  nestedPoint,
}: {
  paragraph: string;
  subsection: string;
  letter: string;
  nestedPoint: string;
}): string {
  return [
    paragraph,
    subsection ? `odst. ${subsection}` : "",
    letter ? `písm. ${letter})` : "",
    nestedPoint ? `bod ${nestedPoint}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function inferTierFromParagraph(paragraph: string): NukibControlTier {
  const paragraphNumber = Number(paragraph.match(/§\s*(\d+)/)?.[1]);

  if ([3, 4, 5, 6, 10].includes(paragraphNumber)) {
    return "mandatory_minimum";
  }

  return "assessable";
}

function mapComplianceState(value: string): NukibComplianceState {
  switch (value) {
    case "Zavedeno":
      return "implemented";
    case "V procesu":
      return "planned";
    case "Nezavedeno":
      return "not_implemented";
    case "Nerelevantní":
      return "not_applicable";
    default:
      return "planned";
  }
}

function mapPriority(value: string): NukibPriority {
  switch (value) {
    case "Kritická":
    case "Vysoká":
      return "high";
    case "Střední":
      return "medium";
    case "Nízká":
      return "low";
    default:
      return "unset";
  }
}

function splitOwners(value: string): string[] {
  return value
    .split(/[,/\n]+/g)
    .map((owner) => owner.trim())
    .filter(Boolean);
}

function findSheet(sheets: WorkbookSheet[], name: string): WorkbookSheet {
  const sheet = sheets.find((candidate) => candidate.name === name);
  if (!sheet) {
    throw new NukibWorkbookParseError(`Missing workbook sheet "${name}".`, {
      detectedSheets: sheets.map((candidate) => candidate.name),
    });
  }

  return sheet;
}

function getRequiredEntry(entries: Map<string, Buffer>, path: string): Buffer {
  const entry = entries.get(path);
  if (!entry) {
    throw new NukibWorkbookParseError(`Missing XLSX entry ${path}.`);
  }

  return entry;
}

function cellToText(cell: XmlRecord, sharedStrings: string[]): string {
  const type = stringProp(cell, "t");
  const value = prop(cell, "v");

  if (type === "s") {
    const index = Number(textFromNode(value));
    return Number.isFinite(index) ? sharedStrings[index] ?? "" : "";
  }

  if (type === "inlineStr") {
    return sharedStringToText(prop(cell, "is"));
  }

  return textFromNode(value);
}

function sharedStringToText(value: unknown): string {
  const record = asRecord(value);
  if (!record) {
    return "";
  }

  const plainText = prop(record, "t");
  if (plainText !== undefined) {
    return textFromNode(plainText);
  }

  return asArray<XmlRecord>(prop(record, "r"))
    .map((run) => textFromNode(prop(run, "t")))
    .join("");
}

function normalizeInlineText(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeMultilineText(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .trim();
}

function textFromNode(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  const record = asRecord(value);
  if (!record) {
    return "";
  }

  const text = prop(record, "#text");
  if (typeof text === "string" || typeof text === "number") {
    return String(text);
  }

  return "";
}

function stringProp(record: unknown, key: string): string | undefined {
  const value = prop(record, key);
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return undefined;
}

function prop(record: unknown, key: string): unknown {
  return asRecord(record)?.[key];
}

function asRecord(value: unknown): XmlRecord | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return value as XmlRecord;
}

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value === undefined || value === null) {
    return [];
  }

  return [value as T];
}
