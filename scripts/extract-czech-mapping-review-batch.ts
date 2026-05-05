import { readFile, writeFile } from "node:fs/promises";

const DEFAULT_INPUT_PATH = "docs/legal-reviews/czech-nis2-mapping-review.md";
const DEFAULT_OUTPUT_PATH = "docs/legal-reviews/czech-nis2-batch-1-review.md";

const REVIEW_BATCHES = {
  batch1: {
    controlKeys: [
      "ctrl_mfa_all_users",
      "ctrl_privileged_access_reviewed",
      "ctrl_conditional_access",
      "ctrl_incident_72h_notification",
      "ctrl_logging_monitoring",
      "ctrl_backup_tested",
    ],
    description:
      "Highest-value Czech NIS2 rows: identity/access, incident notification, logging, and backup.",
    title: "Czech NIS2 Mapping Review - Batch 1",
  },
} as const;

type BatchName = keyof typeof REVIEW_BATCHES;

type ReviewRow = {
  cells: string[];
  controlKey: string;
  decision: string;
  line: string;
};

function getArg(name: string) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function getBatchName(): BatchName {
  const raw = getArg("--batch") ?? "batch1";

  if (raw in REVIEW_BATCHES) {
    return raw as BatchName;
  }

  throw new Error(`Unknown Czech mapping review batch: ${raw}`);
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

function parseRows(markdown: string) {
  const rows: ReviewRow[] = [];

  for (const line of markdown.split("\n")) {
    if (!/^_?\| [0-9a-f-]{36} \|/.test(line)) {
      const cells = splitMarkdownRow(line);

      if (!cells || cells.length !== 9 || !/^[0-9a-f-]{36}$/.test(cells[0])) {
        continue;
      }
    }

    const cells = splitMarkdownRow(line);

    if (!cells || cells.length !== 9) {
      continue;
    }

    const controlKey = cells[1]?.split(" - ")[0]?.trim() ?? "";

    if (!controlKey) {
      continue;
    }

    rows.push({
      cells,
      controlKey,
      decision: cells[7]?.trim().toLowerCase() ?? "",
      line,
    });
  }

  return rows;
}

function countDecisions(rows: ReviewRow[]) {
  return rows.reduce<Record<string, number>>(
    (counts, row) => {
      const key = row.decision || "unreviewed";
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    },
    {},
  );
}

function renderBatch(input: {
  batch: (typeof REVIEW_BATCHES)[BatchName];
  batchName: BatchName;
  inputPath: string;
  rows: ReviewRow[];
}) {
  const generatedAt = new Date().toISOString();
  const decisionCounts = countDecisions(input.rows);
  const progress = [
    `- Total rows: ${input.rows.length}`,
    ...Object.entries(decisionCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([decision, count]) => `- ${decision}: ${count}`),
  ];

  return [
    `# ${input.batch.title}`,
    "",
    `Generated: ${generatedAt}`,
    `Source: ${input.inputPath}`,
    `Batch key: ${input.batchName}`,
    "",
    input.batch.description,
    "",
    "Reviewer question: does this Czech section genuinely support this specific control mapping?",
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
    "## Batch Progress",
    "",
    ...progress,
    "",
    "## Included Control Keys",
    "",
    ...input.batch.controlKeys.map((key) => `- ${key}`),
    "",
    "## Review Rows",
    "",
    "| Mapping ID | Control | EU ref | Czech source | Czech article | Mapping note | Evidence requirement | Reviewer decision | Reviewer note |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...input.rows.map((row) => row.line),
    "",
  ].join("\n");
}

async function main() {
  const batchName = getBatchName();
  const batch = REVIEW_BATCHES[batchName];
  const inputPath = getArg("--input") ?? DEFAULT_INPUT_PATH;
  const outputPath = getArg("--output") ?? DEFAULT_OUTPUT_PATH;
  const markdown = await readFile(inputPath, "utf8");
  const controlKeys: readonly string[] = batch.controlKeys;
  const rows = parseRows(markdown).filter((row) =>
    controlKeys.includes(row.controlKey),
  );

  if (rows.length < 30 || rows.length > 40) {
    throw new Error(
      `${batchName} should contain 30-40 rows, but extracted ${rows.length}.`,
    );
  }

  await writeFile(
    outputPath,
    renderBatch({
      batch,
      batchName,
      inputPath,
      rows,
    }),
  );

  console.log(`Wrote ${rows.length} rows to ${outputPath}.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
