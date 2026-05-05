import { writeFile } from "node:fs/promises";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const VALID_FRAMEWORKS = ["nis2", "eu_ai_act", "gdpr", "iso27001"] as const;
const VALID_JURISDICTIONS = ["it", "cz", "eu", "de", "fr", "es", "other"] as const;

type MappingReviewFramework = (typeof VALID_FRAMEWORKS)[number];
type MappingReviewJurisdiction = (typeof VALID_JURISDICTIONS)[number];

type QueueRow = {
  agent_confidence: string | null;
  agent_verdict: string | null;
  article_title: string | null;
  category: string | null;
  citation: string;
  control_description: string | null;
  control_id: string;
  control_title: string;
  created_at: Date;
  framework: string;
  id: string;
  jurisdiction: string;
  language: string;
  mapping_id: string | null;
  regulator: string | null;
  similarity_score: number | null;
  source_filename: string | null;
  source_text: string;
  source_title: string | null;
  source_url: string | null;
  stage2_passes: unknown;
  stage3_checks: unknown;
  status: string;
};

type SummaryRow = {
  agent_confidence: string | null;
  agent_verdict: string | null;
  count: string;
  framework: string;
  jurisdiction: string;
  status: string;
};

type Stage2Pass = {
  confidence?: unknown;
  model?: unknown;
  reasoning?: unknown;
  role?: unknown;
  verdict?: unknown;
};

type Stage2Payload = {
  combined?: {
    confidence?: unknown;
    status?: unknown;
    verdict?: unknown;
  };
  passes?: Stage2Pass[];
};

type Stage3Payload = {
  domainBlacklist?: {
    matches?: unknown;
  };
  overrides?: unknown;
  similarity?: {
    score?: unknown;
    threshold?: unknown;
  };
};

function getArg(name: string) {
  const inlineValue = process.argv.find((arg) => arg.startsWith(`${name}=`));

  if (inlineValue) {
    return inlineValue.slice(name.length + 1) || null;
  }

  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function requireEnum<T extends readonly string[]>(
  value: string | null,
  validValues: T,
  name: string,
): T[number] {
  if (value && validValues.includes(value)) {
    return value as T[number];
  }

  throw new Error(
    `${name} must be one of ${validValues.join(", ")}. Received: ${value ?? "(missing)"}`,
  );
}

function parseLimit(value: string | null) {
  if (!value) {
    return 500;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5000) {
    throw new Error("--limit must be an integer between 1 and 5000.");
  }

  return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asStage2(value: unknown): Stage2Payload {
  return isRecord(value) ? (value as Stage2Payload) : {};
}

function asStage3(value: unknown): Stage3Payload {
  return isRecord(value) ? (value as Stage3Payload) : {};
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function oneLine(value: string | null | undefined) {
  return (value ?? "")
    .replace(/\s+/g, " ")
    .replace(/\|/g, "\\|")
    .trim();
}

function truncate(value: string, maxLength: number) {
  const normalized = oneLine(value);
  return normalized.length <= maxLength
    ? normalized
    : `${normalized.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
}

function formatPercent(value: number | null) {
  return value == null ? "n/a" : value.toFixed(3);
}

function formatAgent(row: QueueRow) {
  return [row.agent_verdict, row.agent_confidence].filter(Boolean).join(" / ") || "unclassified";
}

function formatStage3(row: QueueRow) {
  const stage3 = asStage3(row.stage3_checks);
  const overrides = asStringArray(stage3.overrides);
  const blacklistMatches = isRecord(stage3.domainBlacklist)
    ? asStringArray(stage3.domainBlacklist.matches)
    : [];
  const parts = [
    overrides.length > 0 ? `overrides: ${overrides.join(", ")}` : null,
    blacklistMatches.length > 0 ? `blacklist: ${blacklistMatches.join(", ")}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join("; ") : "passed/no overrides";
}

function formatPassSummary(row: QueueRow) {
  const stage2 = asStage2(row.stage2_passes);
  const passes = Array.isArray(stage2.passes) ? stage2.passes : [];

  if (passes.length === 0) {
    return "No Stage 2 passes recorded.";
  }

  return passes
    .map((pass) => {
      const role = typeof pass.role === "string" ? pass.role : "pass";
      const verdict = typeof pass.verdict === "string" ? pass.verdict : "unknown";
      const confidence =
        typeof pass.confidence === "string" ? pass.confidence : "unknown";
      const model = typeof pass.model === "string" ? ` (${pass.model})` : "";
      return `${role}: ${verdict}/${confidence}${model}`;
    })
    .join("; ");
}

function formatPassDetails(row: QueueRow) {
  const stage2 = asStage2(row.stage2_passes);
  const passes = Array.isArray(stage2.passes) ? stage2.passes : [];

  if (passes.length === 0) {
    return "_No Stage 2 pass details recorded._";
  }

  return passes
    .map((pass) => {
      const role = typeof pass.role === "string" ? pass.role : "pass";
      const verdict = typeof pass.verdict === "string" ? pass.verdict : "unknown";
      const confidence =
        typeof pass.confidence === "string" ? pass.confidence : "unknown";
      const reasoning =
        typeof pass.reasoning === "string"
          ? pass.reasoning.trim()
          : "No reasoning recorded.";

      return `- ${role} (${verdict}/${confidence}): ${reasoning}`;
    })
    .join("\n");
}

function summarizeRows(rows: QueueRow[]) {
  const byStatus = new Map<string, number>();
  const byDecision = new Map<string, number>();
  const byOverride = new Map<string, number>();
  const bySource = new Map<string, { count: number; title: string; url: string | null }>();

  for (const row of rows) {
    byStatus.set(row.status, (byStatus.get(row.status) ?? 0) + 1);
    byDecision.set(formatAgent(row), (byDecision.get(formatAgent(row)) ?? 0) + 1);

    const sourceKey = row.source_filename ?? "unknown source";
    const source = bySource.get(sourceKey) ?? {
      count: 0,
      title: row.source_title ?? "Unknown source",
      url: row.source_url,
    };
    source.count += 1;
    bySource.set(sourceKey, source);

    for (const override of asStringArray(asStage3(row.stage3_checks).overrides)) {
      byOverride.set(override, (byOverride.get(override) ?? 0) + 1);
    }
  }

  return {
    byDecision,
    byOverride,
    bySource,
    byStatus,
    total: rows.length,
  };
}

function renderMarkdown(input: {
  framework: MappingReviewFramework;
  jurisdiction: MappingReviewJurisdiction;
  rows: QueueRow[];
}) {
  const summary = summarizeRows(input.rows);
  const sourceRows = Array.from(summary.bySource).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const generatedAt = new Date().toISOString();

  const lines = [
    `# ${input.framework.toUpperCase()} ${input.jurisdiction.toUpperCase()} Agent Review Package`,
    "",
    `Generated: ${generatedAt}`,
    "",
    "Purpose: Stage 2 and Stage 3 agent review has already run. This package is for a human reviewer to make the final mapping decision. It does not promote any row.",
    "",
    "Source rule: official-source verification is separate. The reviewer should answer only whether the cited section genuinely supports the mapped control.",
    "",
    "Allowed human decisions:",
    "",
    "- `approved`: mapping correctly supports the control; promote.",
    "- `wrong_article`: citation points to the wrong section; reject and re-research.",
    "- `too_broad`: related but does not directly support this control; reject.",
    "- `needs_research`: reviewer cannot decide; defer.",
    "",
    "## Summary",
    "",
    `- Total rows: ${summary.total}`,
    ...Array.from(summary.byStatus)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([status, count]) => `- status ${status}: ${count}`),
    "",
    "Agent decision buckets:",
    "",
    ...Array.from(summary.byDecision)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([decision, count]) => `- ${decision}: ${count}`),
    "",
    "Stage 3 overrides:",
    "",
    ...(summary.byOverride.size === 0
      ? ["- none"]
      : Array.from(summary.byOverride)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([override, count]) => `- ${override}: ${count}`)),
    "",
    "## Sources",
    "",
    ...sourceRows.map(([filename, source]) => {
      const url = source.url ? ` · ${source.url}` : "";
      return `- ${filename}: ${source.count} rows · ${source.title}${url}`;
    }),
    "",
    "## Review Rows",
    "",
    "| Queue ID | Mapping ID | Control | Category | Citation | Similarity | Agent | Stage 3 | Human decision | Human note |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...input.rows.map((row) =>
      [
        oneLine(row.id),
        oneLine(row.mapping_id),
        `${oneLine(row.control_id)} - ${oneLine(row.control_title)}`,
        oneLine(row.category),
        oneLine(row.citation),
        formatPercent(row.similarity_score),
        formatAgent(row),
        oneLine(formatStage3(row)),
        "",
        "",
      ].join(" | "),
    ).map((row) => `| ${row} |`),
    "",
    "## Agent Reasoning",
    "",
    ...input.rows.flatMap((row, index) => [
      `### ${index + 1}. ${row.control_id} · ${row.citation}`,
      "",
      `- Queue ID: \`${row.id}\``,
      `- Mapping ID: \`${row.mapping_id ?? "n/a"}\``,
      `- Status: \`${row.status}\``,
      `- Regulator: ${oneLine(row.regulator) || "n/a"}`,
      `- Similarity: ${formatPercent(row.similarity_score)}`,
      `- Stage 2: ${formatPassSummary(row)}`,
      `- Stage 3: ${formatStage3(row)}`,
      `- Source: ${oneLine(row.source_filename)}${row.source_url ? ` · ${row.source_url}` : ""}`,
      `- Source excerpt: ${truncate(row.source_text, 360)}`,
      "",
      formatPassDetails(row),
      "",
    ]),
  ];

  return lines.join("\n");
}

async function listRows(
  pool: Pool,
  input: {
    framework: MappingReviewFramework;
    jurisdiction: MappingReviewJurisdiction;
    limit: number;
  },
) {
  const result = await pool.query<QueueRow>(
    `
      SELECT
        mrq.id::text,
        mrq.mapping_id::text,
        mrq.framework,
        mrq.jurisdiction,
        mrq.language,
        mrq.control_id,
        mrq.control_title,
        mrq.control_description,
        mrq.source_text,
        mrq.citation,
        mrq.regulator,
        mrq.similarity_score,
        mrq.agent_verdict,
        mrq.agent_confidence,
        mrq.stage2_passes,
        mrq.stage3_checks,
        mrq.status,
        mrq.created_at,
        c.category,
        a.title AS article_title,
        sd.filename AS source_filename,
        sd.title AS source_title,
        sd.url AS source_url
      FROM mapping_review_queue mrq
      LEFT JOIN framework_control_articles fca ON fca.id = mrq.mapping_id
      LEFT JOIN articles a ON a.id = fca.article_id
      LEFT JOIN source_documents sd ON sd.id = a.source_document_id
      LEFT JOIN controls c ON c.key = mrq.control_id
      WHERE mrq.framework = $1
        AND mrq.jurisdiction = $2
      ORDER BY
        CASE mrq.status
          WHEN 'agent_decided' THEN 1
          WHEN 'needs_human' THEN 2
          WHEN 'unclassified' THEN 3
          WHEN 'rejected' THEN 4
          WHEN 'promoted' THEN 5
          ELSE 6
        END,
        mrq.agent_verdict NULLS LAST,
        mrq.agent_confidence NULLS LAST,
        mrq.similarity_score NULLS FIRST,
        mrq.control_id,
        mrq.id
      LIMIT $3
    `,
    [input.framework, input.jurisdiction, input.limit],
  );

  return result.rows;
}

async function listSummaryRows(pool: Pool) {
  const result = await pool.query<SummaryRow>(
    `
      SELECT
        framework,
        jurisdiction,
        status,
        agent_verdict,
        agent_confidence,
        COUNT(*)::text AS count
      FROM mapping_review_queue
      GROUP BY framework, jurisdiction, status, agent_verdict, agent_confidence
      ORDER BY framework, jurisdiction, status, agent_verdict, agent_confidence
    `,
  );

  return result.rows;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for agent review reporting.");
  }

  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    if (process.argv.includes("--all")) {
      const rows = await listSummaryRows(pool);
      console.log(JSON.stringify(rows, null, 2));
      return;
    }

    const framework = requireEnum(
      getArg("--framework"),
      VALID_FRAMEWORKS,
      "--framework",
    );
    const jurisdiction =
      framework === "iso27001"
        ? "eu"
        : requireEnum(getArg("--jurisdiction"), VALID_JURISDICTIONS, "--jurisdiction");
    const limit = parseLimit(getArg("--limit"));
    const outputPath = getArg("--output");
    const rows = await listRows(pool, { framework, jurisdiction, limit });
    const summary = summarizeRows(rows);

    if (outputPath) {
      await writeFile(outputPath, renderMarkdown({ framework, jurisdiction, rows }));
      console.log(
        `Wrote ${rows.length} ${framework}/${jurisdiction} agent review rows to ${outputPath}.`,
      );
    } else {
      console.log(
        JSON.stringify(
          {
            byDecision: Object.fromEntries(summary.byDecision),
            byOverride: Object.fromEntries(summary.byOverride),
            byStatus: Object.fromEntries(summary.byStatus),
            total: summary.total,
          },
          null,
          2,
        ),
      );
      console.log("Use --output <path> to write the Markdown reviewer package.");
    }
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
