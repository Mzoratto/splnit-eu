import { readFile } from "node:fs/promises";
import { loadEnvConfig } from "@next/env";
import { Pool, type PoolClient } from "pg";

loadEnvConfig(process.cwd());

const VALID_FRAMEWORKS = ["nis2", "eu_ai_act", "gdpr", "iso27001"] as const;
const VALID_JURISDICTIONS = ["it", "cz", "eu", "de", "fr", "es", "other"] as const;
const VALID_DECISIONS = [
  "approved",
  "wrong_article",
  "too_broad",
  "needs_research",
] as const;

type MappingReviewFramework = (typeof VALID_FRAMEWORKS)[number];
type MappingReviewJurisdiction = (typeof VALID_JURISDICTIONS)[number];
type HumanDecision = (typeof VALID_DECISIONS)[number];

type ReviewDecision = {
  decision: HumanDecision;
  lineNumber: number;
  mappingId: string;
  note: string;
  queueId: string;
};

type ReviewQueueRow = {
  article_review_status: string;
  confidence: string;
  framework: MappingReviewFramework;
  id: string;
  jurisdiction: MappingReviewJurisdiction;
  language: string;
  mapping_id: string;
  source_filename: string | null;
  stage2_passes: unknown;
  stage3_checks: unknown;
  status: string;
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

function normaliseHeader(value: string) {
  return value.trim().toLowerCase();
}

function parseReviewDecisions(markdown: string) {
  const decisions: ReviewDecision[] = [];
  const seenQueueIds = new Set<string>();
  let headerIndexes: {
    decision: number;
    mappingId: number;
    note: number;
    queueId: number;
  } | null = null;

  markdown.split("\n").forEach((line, index) => {
    if (line.startsWith("## ") && headerIndexes) {
      headerIndexes = null;
      return;
    }

    const cells = splitMarkdownRow(line);

    if (!cells) {
      return;
    }

    const normalisedCells = cells.map(normaliseHeader);

    if (normalisedCells.includes("queue id")) {
      const queueId = normalisedCells.indexOf("queue id");
      const mappingId = normalisedCells.indexOf("mapping id");
      const decision = normalisedCells.indexOf("human decision");
      const note = normalisedCells.indexOf("human note");

      if ([queueId, mappingId, decision, note].some((cellIndex) => cellIndex === -1)) {
        throw new Error(
          `Malformed review table header at line ${index + 1}: expected Queue ID, Mapping ID, Human decision, and Human note columns.`,
        );
      }

      headerIndexes = {
        decision,
        mappingId,
        note,
        queueId,
      };
      return;
    }

    if (!headerIndexes || normalisedCells.every((cell) => /^-+$/.test(cell))) {
      return;
    }

    const queueId = cells[headerIndexes.queueId]?.trim();
    const mappingId = cells[headerIndexes.mappingId]?.trim();
    const decision = cells[headerIndexes.decision]?.trim().toLowerCase();
    const note = cells[headerIndexes.note]?.trim() ?? "";

    if (!decision) {
      return;
    }

    if (!VALID_DECISIONS.includes(decision as HumanDecision)) {
      throw new Error(
        `Invalid human decision at line ${index + 1}: ${decision}.`,
      );
    }

    if (!queueId || !mappingId) {
      throw new Error(
        `Malformed review row at line ${index + 1}: queue ID and mapping ID are required when a human decision is present.`,
      );
    }

    if (seenQueueIds.has(queueId)) {
      throw new Error(
        `Duplicate human decision for queue ${queueId} at line ${index + 1}.`,
      );
    }

    seenQueueIds.add(queueId);

    decisions.push({
      decision: decision as HumanDecision,
      lineNumber: index + 1,
      mappingId,
      note,
      queueId,
    });
  });

  return decisions;
}

async function loadQueueRows(pool: Pool, queueIds: string[]) {
  const result = await pool.query<ReviewQueueRow>(
    `
      SELECT
        mrq.id::text,
        mrq.framework,
        mrq.jurisdiction,
        mrq.language,
        mrq.mapping_id::text,
        mrq.stage2_passes,
        mrq.stage3_checks,
        mrq.status,
        fca.confidence,
        a.review_status AS article_review_status,
        sd.filename AS source_filename
      FROM mapping_review_queue mrq
      JOIN framework_control_articles fca ON fca.id = mrq.mapping_id
      JOIN articles a ON a.id = fca.article_id
      JOIN source_documents sd ON sd.id = a.source_document_id
      WHERE mrq.id = ANY($1::uuid[])
    `,
    [queueIds],
  );

  return result.rows;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildHumanReviewChecks(
  stage3Checks: unknown,
  decision: ReviewDecision,
) {
  return {
    ...(isRecord(stage3Checks) ? stage3Checks : {}),
    humanReview: {
      decision: decision.decision,
      lineNumber: decision.lineNumber,
      note: decision.note,
    },
  };
}

function assertDecisionRows(
  decisions: ReviewDecision[],
  rows: ReviewQueueRow[],
  input: {
    framework: MappingReviewFramework;
    jurisdiction: MappingReviewJurisdiction;
  },
) {
  const rowByQueueId = new Map(rows.map((row) => [row.id, row]));
  const errors: string[] = [];

  for (const decision of decisions) {
    const row = rowByQueueId.get(decision.queueId);

    if (!row) {
      errors.push(
        `Line ${decision.lineNumber}: queue ${decision.queueId} was not found.`,
      );
      continue;
    }

    if (row.mapping_id !== decision.mappingId) {
      errors.push(
        `Line ${decision.lineNumber}: queue ${decision.queueId} points to mapping ${row.mapping_id}, not ${decision.mappingId}.`,
      );
    }

    if (row.framework !== input.framework || row.jurisdiction !== input.jurisdiction) {
      errors.push(
        `Line ${decision.lineNumber}: queue ${decision.queueId} is ${row.framework}/${row.jurisdiction}, not ${input.framework}/${input.jurisdiction}.`,
      );
    }

    if (decision.decision === "approved") {
      if (row.article_review_status !== "reviewed") {
        errors.push(
          `Line ${decision.lineNumber}: queue ${decision.queueId} cannot be approved because article source is ${row.article_review_status}.`,
        );
      }

      if (row.status === "rejected") {
        errors.push(
          `Line ${decision.lineNumber}: queue ${decision.queueId} is already rejected and cannot be promoted without a fresh queue row.`,
        );
      }
    }

    if (decision.decision !== "approved" && row.status === "promoted") {
      errors.push(
        `Line ${decision.lineNumber}: queue ${decision.queueId} is already promoted and cannot be changed to ${decision.decision}.`,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
}

function summariseDecisions(decisions: ReviewDecision[], rows: ReviewQueueRow[]) {
  const rowByQueueId = new Map(rows.map((row) => [row.id, row]));
  const summary = {
    approved: 0,
    needsResearch: 0,
    promoteCandidates: 0,
    rejectCandidates: 0,
    tooBroad: 0,
    wrongArticle: 0,
  };

  for (const decision of decisions) {
    const row = rowByQueueId.get(decision.queueId);

    if (decision.decision === "approved") {
      summary.approved += 1;
      if (row && (row.confidence !== "reviewed" || row.status !== "promoted")) {
        summary.promoteCandidates += 1;
      }
    }

    if (decision.decision === "wrong_article") {
      summary.wrongArticle += 1;
      if (row?.status !== "rejected") summary.rejectCandidates += 1;
    }

    if (decision.decision === "too_broad") {
      summary.tooBroad += 1;
      if (row?.status !== "rejected") summary.rejectCandidates += 1;
    }

    if (decision.decision === "needs_research") {
      summary.needsResearch += 1;
    }
  }

  return summary;
}

async function applyHumanDecisions(
  pool: Pool,
  decisions: ReviewDecision[],
  rows: ReviewQueueRow[],
) {
  const client = await pool.connect();
  const rowByQueueId = new Map(rows.map((row) => [row.id, row]));
  const results: Array<{
    decision: HumanDecision;
    mappingId: string;
    queueId: string;
    status: "promoted" | "rejected" | "needs_human" | "already_promoted";
  }> = [];

  try {
    await client.query("BEGIN");

    for (const decision of decisions) {
      const row = rowByQueueId.get(decision.queueId);

      if (!row) {
        throw new Error(`Missing row for queue ${decision.queueId}.`);
      }

      if (decision.decision === "approved") {
        if (row.confidence === "reviewed" && row.status === "promoted") {
          results.push({
            decision: decision.decision,
            mappingId: row.mapping_id,
            queueId: row.id,
            status: "already_promoted",
          });
          continue;
        }

        await promoteHumanApprovedRow(client, row, decision);
        results.push({
          decision: decision.decision,
          mappingId: row.mapping_id,
          queueId: row.id,
          status: "promoted",
        });
        continue;
      }

      if (decision.decision === "wrong_article" || decision.decision === "too_broad") {
        await client.query(
          `
            UPDATE mapping_review_queue
            SET status = 'rejected',
                updated_at = NOW()
            WHERE id = $1::uuid
          `,
          [row.id],
        );
        results.push({
          decision: decision.decision,
          mappingId: row.mapping_id,
          queueId: row.id,
          status: "rejected",
        });
        continue;
      }

      await client.query(
        `
          UPDATE mapping_review_queue
          SET status = 'needs_human',
              updated_at = NOW()
          WHERE id = $1::uuid
        `,
        [row.id],
      );
      results.push({
        decision: decision.decision,
        mappingId: row.mapping_id,
        queueId: row.id,
        status: "needs_human",
      });
    }

    await client.query("COMMIT");
    return results;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function promoteHumanApprovedRow(
  client: PoolClient,
  row: ReviewQueueRow,
  decision: ReviewDecision,
) {
  const stage3Checks = buildHumanReviewChecks(row.stage3_checks, decision);

  await client.query(
    `
      UPDATE framework_control_articles
      SET confidence = 'reviewed'
      WHERE id = $1::uuid
    `,
    [row.mapping_id],
  );

  await client.query(
    `
      UPDATE mapping_review_queue
      SET status = 'promoted',
          updated_at = NOW()
      WHERE id = $1::uuid
    `,
    [row.id],
  );

  await client.query(
    `
      INSERT INTO mapping_promotion_audit (
        queue_id,
        mapping_id,
        framework,
        jurisdiction,
        language,
        decision_source,
        stage2_passes,
        stage3_checks
      )
      VALUES (
        $1::uuid,
        $2::uuid,
        $3,
        $4,
        $5,
        'human_approved',
        $6::jsonb,
        $7::jsonb
      )
    `,
    [
      row.id,
      row.mapping_id,
      row.framework,
      row.jurisdiction,
      row.language,
      JSON.stringify(row.stage2_passes ?? {}),
      JSON.stringify(stage3Checks),
    ],
  );
}

async function main() {
  const framework = requireEnum(
    getArg("--framework"),
    VALID_FRAMEWORKS,
    "--framework",
  );
  const jurisdiction =
    framework === "iso27001"
      ? "eu"
      : requireEnum(getArg("--jurisdiction"), VALID_JURISDICTIONS, "--jurisdiction");
  const inputPath = getArg("--input");
  const shouldApply = process.argv.includes("--apply");
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!inputPath) {
    throw new Error("--input is required.");
  }

  if (!databaseUrl || databaseUrl === '""' || databaseUrl === "''") {
    throw new Error("DATABASE_URL is required to apply human mapping decisions.");
  }

  const markdown = await readFile(inputPath, "utf8");
  const decisions = parseReviewDecisions(markdown);
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const rows =
      decisions.length > 0
        ? await loadQueueRows(
            pool,
            decisions.map((decision) => decision.queueId),
          )
        : [];

    assertDecisionRows(decisions, rows, { framework, jurisdiction });

    const summary = summariseDecisions(decisions, rows);

    if (!shouldApply) {
      console.log(
        JSON.stringify(
          {
            apply: false,
            decisionCount: decisions.length,
            framework,
            input: inputPath,
            jurisdiction,
            summary,
          },
          null,
          2,
        ),
      );
      return;
    }

    const results = await applyHumanDecisions(pool, decisions, rows);

    console.log(
      JSON.stringify(
        {
          apply: true,
          decisionCount: decisions.length,
          framework,
          input: inputPath,
          jurisdiction,
          results,
          summary,
        },
        null,
        2,
      ),
    );
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
