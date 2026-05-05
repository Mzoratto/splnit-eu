import { readFile } from "node:fs/promises";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const DEFAULT_REVIEW_PATH = "docs/legal-reviews/czech-nis2-mapping-review.md";
const VALID_DECISIONS = new Set([
  "approved",
  "wrong_article",
  "too_broad",
  "needs_research",
]);
const OFFICIAL_CZECH_SOURCE_FILENAMES = new Set([
  "cz/esbirka_sb_2025_264_pzz.pdf",
  "cz/esbirka_sb_2025_409_pzz.pdf",
  "cz/esbirka_sb_2025_410_pzz.pdf",
]);

type ReviewedRow = {
  confidence: string;
  id: string;
  review_status: string;
  source_filename: string;
};

type ReviewDecision = {
  decision: string;
  lineNumber: number;
  mappingId: string;
  note: string;
};

function getArg(name: string) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function splitMarkdownRow(line: string) {
  const trimmed = line.trim();

  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    return null;
  }

  const cells: string[] = [];
  let current = "";

  for (let index = 1; index < trimmed.length - 1; index += 1) {
    const char = trimmed[index];
    const next = trimmed[index + 1];

    if (char === "\\" && next === "|") {
      current += "|";
      index += 1;
      continue;
    }

    if (char === "|") {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseReviewDecisions(markdown: string) {
  const decisions: ReviewDecision[] = [];
  let inMappingTable = false;

  markdown.split("\n").forEach((line, index) => {
    if (line.startsWith("| Mapping ID |")) {
      inMappingTable = true;
      return;
    }

    if (!inMappingTable || line.startsWith("| ---")) {
      return;
    }

    if (line.startsWith("## ")) {
      inMappingTable = false;
      return;
    }

    if (!line.trim()) {
      return;
    }

    const cells = splitMarkdownRow(line);

    if (!cells) {
      return;
    }

    if (cells.length !== 9) {
      throw new Error(
        `Malformed review row at line ${index + 1}: expected 9 columns, got ${cells.length}.`,
      );
    }

    const decision = cells[7].trim().toLowerCase();

    if (!decision) {
      return;
    }

    if (!VALID_DECISIONS.has(decision)) {
      throw new Error(
        `Invalid reviewer decision at line ${index + 1}: ${decision}.`,
      );
    }

    decisions.push({
      decision,
      lineNumber: index + 1,
      mappingId: cells[0].trim(),
      note: cells[8].trim(),
    });
  });

  return decisions;
}

async function loadReviewedRows(pool: Pool, mappingIds: string[]) {
  const result = await pool.query<ReviewedRow>(
    `
      SELECT
        fca.id::text,
        fca.confidence,
        a.review_status,
        sd.filename AS source_filename
      FROM framework_control_articles fca
      JOIN articles a ON a.id = fca.article_id
      JOIN source_documents sd ON sd.id = a.source_document_id
      WHERE fca.id = ANY($1::uuid[])
    `,
    [mappingIds],
  );

  return result.rows;
}

async function promoteReviewedRows(pool: Pool, mappingIds: string[]) {
  const result = await pool.query<{ id: string }>(
    `
      UPDATE framework_control_articles
      SET confidence = 'reviewed'
      WHERE id = ANY($1::uuid[])
        AND confidence <> 'reviewed'
      RETURNING id::text
    `,
    [mappingIds],
  );

  return result.rows.map((row) => row.id);
}

async function main() {
  const inputPath = getArg("--input") ?? DEFAULT_REVIEW_PATH;
  const shouldApply = process.argv.includes("--apply");
  const markdown = await readFile(inputPath, "utf8");
  const decisions = parseReviewDecisions(markdown);
  const approvedMappingIds = decisions
    .filter((row) => row.decision === "approved")
    .map((row) => row.mappingId);

  if (approvedMappingIds.length === 0) {
    console.log(`No approved Czech mapping rows found in ${inputPath}.`);
    return;
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to validate approved mapping rows.");
  }

  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const rows = await loadReviewedRows(pool, approvedMappingIds);
    const rowById = new Map(rows.map((row) => [row.id, row]));
    const missingRows = approvedMappingIds.filter((id) => !rowById.has(id));
    const unsafeRows = rows.filter(
      (row) =>
        row.review_status !== "reviewed" ||
        !OFFICIAL_CZECH_SOURCE_FILENAMES.has(row.source_filename),
    );

    if (missingRows.length > 0) {
      throw new Error(
        `Approved mapping IDs not found in database: ${missingRows.join(", ")}`,
      );
    }

    if (unsafeRows.length > 0) {
      throw new Error(
        `Approved mapping rows include non-reviewed or non-official source rows: ${JSON.stringify(unsafeRows, null, 2)}`,
      );
    }

    const notYetReviewed = rows.filter((row) => row.confidence !== "reviewed");

    if (!shouldApply) {
      console.log(
        `Dry run: ${approvedMappingIds.length} approved rows found; ${notYetReviewed.length} would be promoted. Re-run with --apply to update the database.`,
      );
      return;
    }

    const promotedIds = await promoteReviewedRows(pool, approvedMappingIds);
    console.log(`Promoted ${promotedIds.length} Czech mapping rows to reviewed.`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
