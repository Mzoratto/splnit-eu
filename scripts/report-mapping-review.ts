import { writeFile } from "node:fs/promises";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for mapping review reporting.");
}

const JURISDICTION_LABELS: Record<string, string> = {
  cz: "Czech",
  eu: "EU",
  it: "Italian",
};

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
  mapping_id: string;
  source_filename: string;
  source_title: string;
  source_url: string | null;
  title_en: string;
};

function getArg(name: string) {
  const inlineValue = process.argv.find((arg) => arg.startsWith(`${name}=`));

  if (inlineValue) {
    return inlineValue.slice(name.length + 1) || null;
  }

  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function requiredArg(name: string) {
  const value = getArg(name);

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
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

function renderMarkdown(input: {
  framework: string;
  jurisdiction: string;
  rows: MappingReviewRow[];
}) {
  const generatedAt = new Date().toISOString();
  const summary = summarizeRows(input.rows);
  const reviewRows = input.rows.filter((row) => row.confidence !== "reviewed");
  const jurisdictionLabel =
    JURISDICTION_LABELS[input.jurisdiction.toLowerCase()] ??
    input.jurisdiction.toUpperCase();
  const sourceRows = Array.from(
    new Map(
      input.rows.map((row) => [
        row.source_filename,
        {
          count: summary.bySource.get(row.source_filename) ?? 0,
          title: row.source_title,
          url: row.source_url,
        },
      ]),
    ),
  ).sort(([a], [b]) => a.localeCompare(b));

  const sourceColumnLabel =
    input.jurisdiction.toLowerCase() === "it" ? "Italian source" : "Source";
  const articleColumnLabel =
    input.jurisdiction.toLowerCase() === "it" ? "Italian article" : "Article";

  const lines = [
    `# ${jurisdictionLabel} ${input.framework.toUpperCase()} Mapping Review Queue`,
    "",
    `Generated: ${generatedAt}`,
    "",
    "Purpose: official source text is available, but control-to-article mapping confidence must remain draft until a compliance/legal reviewer checks the mapping.",
    "",
    "Reviewer question: does this source section genuinely support this specific control mapping?",
    "",
    "Decision values:",
    "",
    "- `approved`: mapping correctly supports the control; promote.",
    "- `wrong_article`: citation points to the wrong section; reject and re-research.",
    "- `too_broad`: related but does not directly support this control; reject.",
    "- `needs_research`: reviewer cannot decide; defer.",
    "",
    "Do not edit the Mapping ID column. The promotion script uses it as the exact database key.",
    "",
    "## Summary",
    "",
    `- Total official ${jurisdictionLabel} mapping links: ${summary.total}`,
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
    "## Draft Mapping Links",
    "",
    `| Mapping ID | Control | EU ref | ${sourceColumnLabel} | ${articleColumnLabel} | Mapping note | Evidence requirement | Reviewer decision | Reviewer note |`,
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...reviewRows.map((row) => {
      const cells = [
        oneLine(row.mapping_id),
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
  ];

  return lines.join("\n");
}

async function listMappingRows(
  pool: Pool,
  input: {
    framework: string;
    jurisdiction: string;
  },
) {
  const result = await pool.query<MappingReviewRow>(
    `
    SELECT
      fca.id::text AS mapping_id,
      a.article_key,
      a.citation AS article_citation,
      a.title AS article_title,
      c.category,
      c.key AS control_key,
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
    WHERE f.slug = $1
      AND lower(a.jurisdiction) = lower($2)
      AND a.review_status = 'reviewed'
    ORDER BY
      c.key,
      fc.article_ref,
      sd.filename,
      a.article_key
  `,
    [input.framework, input.jurisdiction],
  );

  return result.rows;
}

async function main() {
  const framework = requiredArg("--framework");
  const jurisdiction = requiredArg("--jurisdiction");
  const outputPath = getArg("--output");
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const rows = await listMappingRows(pool, { framework, jurisdiction });
    const summary = summarizeRows(rows);
    const markdown = renderMarkdown({ framework, jurisdiction, rows });

    if (outputPath) {
      await writeFile(outputPath, markdown);
      console.log(
        `Wrote ${rows.length} ${framework}/${jurisdiction} mapping review rows to ${outputPath}.`,
      );
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
