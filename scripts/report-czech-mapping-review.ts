import { writeFile } from "node:fs/promises";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for Czech mapping review reporting.");
}

type MappingReviewRow = {
  article_citation: string;
  article_key: string;
  article_title: string | null;
  category: string | null;
  citation_note: string | null;
  confidence: string;
  control_key: string;
  evidence_requirements: string | null;
  framework_article_ref: string | null;
  localized_title: string | null;
  source_filename: string;
  source_title: string;
  source_url: string | null;
  title_cs: string;
  title_en: string;
};

function getArg(name: string) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function oneLine(value: string | null | undefined) {
  return (value ?? "")
    .replace(/\s+/g, " ")
    .replace(/\|/g, "\\|")
    .trim();
}

function summarizeRows(rows: MappingReviewRow[]) {
  const byConfidence = new Map<string, number>();
  const bySource = new Map<string, number>();

  for (const row of rows) {
    byConfidence.set(row.confidence, (byConfidence.get(row.confidence) ?? 0) + 1);
    bySource.set(row.source_filename, (bySource.get(row.source_filename) ?? 0) + 1);
  }

  return {
    byConfidence,
    bySource,
    total: rows.length,
  };
}

function renderMarkdown(rows: MappingReviewRow[]) {
  const generatedAt = new Date().toISOString();
  const summary = summarizeRows(rows);
  const draftRows = rows.filter((row) => row.confidence !== "reviewed");
  const sourceRows = Array.from(
    new Map(
      rows.map((row) => [
        row.source_filename,
        {
          count: summary.bySource.get(row.source_filename) ?? 0,
          title: row.source_title,
          url: row.source_url,
        },
      ]),
    ),
  ).sort(([a], [b]) => a.localeCompare(b));

  const lines = [
    "# Czech NIS2 Mapping Review Queue",
    "",
    `Generated: ${generatedAt}`,
    "",
    "Purpose: reviewed e-Sbírka source text is available, but Czech control-to-article mapping confidence must remain draft until a compliance/legal reviewer checks the mapping.",
    "",
    "## Summary",
    "",
    `- Total official Czech mapping links: ${summary.total}`,
    ...Array.from(summary.byConfidence)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([confidence, count]) => `- ${confidence}: ${count}`),
    "",
    "## Sources",
    "",
    ...sourceRows.map(([source, data]) => {
      const url = data.url ? ` · ${data.url}` : "";
      return `- ${source}: ${data.count} links · ${data.title}${url}`;
    }),
    "",
    "## Reviewer Workflow",
    "",
    "For each draft link:",
    "",
    "1. Read the control title, EU reference, Czech source, and evidence requirement.",
    "2. Check the official Czech article text in e-Sbírka.",
    "3. Mark the reviewer decision as `approved`, `wrong_article`, `too_broad`, or `needs_research`.",
    "4. Add a short reviewer note when the decision is anything other than `approved`.",
    "5. Promote the database link to `reviewed` only for rows marked `approved`.",
    "",
    "## Draft Mapping Links",
    "",
    "| Control | EU ref | Czech source | Czech article | Mapping note | Evidence requirement | Reviewer decision | Reviewer note |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...draftRows.map((row) => {
      const cells = [
        `${oneLine(row.control_key)} - ${oneLine(row.title_en)}`,
        oneLine(row.framework_article_ref),
        oneLine(row.source_filename),
        `${oneLine(row.article_citation)}${row.article_title ? ` - ${oneLine(row.article_title)}` : ""}`,
        oneLine(row.citation_note),
        oneLine(row.evidence_requirements),
        "",
        "",
      ];

      return `| ${cells.join(" | ")} |`;
    }),
    "",
    "## Review Rule",
    "",
    "Promote `framework_control_articles.confidence` to `reviewed` only after the reviewer confirms that the Czech law/decree article genuinely supports the specific control mapping. Source text verification alone is not enough.",
    "",
  ];

  return lines.join("\n");
}

async function listCzechMappingRows(pool: Pool) {
  const result = await pool.query<MappingReviewRow>(`
    SELECT
      a.article_key,
      a.citation AS article_citation,
      a.title AS article_title,
      c.category,
      c.key AS control_key,
      c.title_cs,
      c.title_en,
      fc.article_ref AS framework_article_ref,
      fc.evidence_requirements,
      fc.localized_title,
      fca.citation_note,
      fca.confidence,
      sd.filename AS source_filename,
      sd.title AS source_title,
      sd.url AS source_url
    FROM framework_control_articles fca
    JOIN articles a ON a.id = fca.article_id
    JOIN source_documents sd ON sd.id = a.source_document_id
    JOIN framework_controls fc ON fc.id = fca.framework_control_id
    JOIN frameworks f ON f.id = fc.framework_id
    JOIN controls c ON c.id = fc.control_id
    WHERE f.slug = 'nis2'
      AND a.review_status = 'reviewed'
      AND sd.filename IN (
        'cz/esbirka_sb_2025_264_pzz.pdf',
        'cz/esbirka_sb_2025_409_pzz.pdf',
        'cz/esbirka_sb_2025_410_pzz.pdf'
      )
    ORDER BY
      c.key,
      fc.article_ref,
      sd.filename,
      a.article_key
  `);

  return result.rows;
}

async function main() {
  const outputPath = getArg("--output");
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const rows = await listCzechMappingRows(pool);
    const summary = summarizeRows(rows);
    const markdown = renderMarkdown(rows);

    if (outputPath) {
      await writeFile(outputPath, markdown);
      console.log(`Wrote ${rows.length} Czech mapping review rows to ${outputPath}.`);
    } else {
      console.log(
        JSON.stringify(
          {
            byConfidence: Object.fromEntries(summary.byConfidence),
            bySource: Object.fromEntries(summary.bySource),
            total: summary.total,
          },
          null,
          2,
        ),
      );
      console.log("Use --output <path> to write the full Markdown review queue.");
    }
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
