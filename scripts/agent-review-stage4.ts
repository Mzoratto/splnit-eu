import { loadEnvConfig } from "@next/env";
import { Pool, type PoolClient } from "pg";

loadEnvConfig(process.cwd());

const VALID_FRAMEWORKS = ["nis2", "eu_ai_act", "gdpr", "iso27001"] as const;
const VALID_JURISDICTIONS = ["it", "cz", "eu", "de", "fr", "es", "other"] as const;

type MappingReviewFramework = (typeof VALID_FRAMEWORKS)[number];
type MappingReviewJurisdiction = (typeof VALID_JURISDICTIONS)[number];

type PromotionCandidate = {
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
};

type PromotionResult = {
  alreadyReviewed: boolean;
  mappingId: string;
  queueId: string;
};

type Stage3Checks = {
  finalStatus?: unknown;
  overrides?: unknown;
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

function asStage3Checks(value: unknown): Stage3Checks {
  return isRecord(value) ? (value as Stage3Checks) : {};
}

function getStage3Overrides(value: unknown) {
  const overrides = asStage3Checks(value).overrides;
  return Array.isArray(overrides)
    ? overrides.filter((item): item is string => typeof item === "string")
    : [];
}

function assertPromotable(candidate: PromotionCandidate) {
  if (candidate.article_review_status !== "reviewed") {
    throw new Error(
      `Queue ${candidate.id} cannot be promoted because article source is ${candidate.article_review_status}.`,
    );
  }

  const stage3 = asStage3Checks(candidate.stage3_checks);
  const overrides = getStage3Overrides(candidate.stage3_checks);

  if (stage3.finalStatus !== "agent_decided") {
    throw new Error(
      `Queue ${candidate.id} cannot be promoted because Stage 3 finalStatus is ${String(stage3.finalStatus)}.`,
    );
  }

  if (overrides.length > 0) {
    throw new Error(
      `Queue ${candidate.id} cannot be promoted because Stage 3 has overrides: ${overrides.join(", ")}.`,
    );
  }
}

async function listPromotionCandidates(
  pool: Pool,
  input: {
    framework: MappingReviewFramework;
    jurisdiction: MappingReviewJurisdiction;
    limit: number;
  },
) {
  const result = await pool.query<PromotionCandidate>(
    `
      SELECT
        mrq.id::text,
        mrq.framework,
        mrq.jurisdiction,
        mrq.language,
        mrq.mapping_id::text,
        mrq.stage2_passes,
        mrq.stage3_checks,
        fca.confidence,
        a.review_status AS article_review_status,
        sd.filename AS source_filename
      FROM mapping_review_queue mrq
      JOIN framework_control_articles fca ON fca.id = mrq.mapping_id
      JOIN articles a ON a.id = fca.article_id
      JOIN source_documents sd ON sd.id = a.source_document_id
      WHERE mrq.framework = $1
        AND mrq.jurisdiction = $2
        AND mrq.status = 'agent_decided'
        AND mrq.agent_verdict = 'approved'
      ORDER BY mrq.created_at, mrq.id
      LIMIT $3
    `,
    [input.framework, input.jurisdiction, input.limit],
  );

  return result.rows;
}

async function promoteCandidate(
  client: PoolClient,
  candidate: PromotionCandidate,
): Promise<PromotionResult> {
  assertPromotable(candidate);

  const alreadyReviewed = candidate.confidence === "reviewed";

  await client.query(
    `
      UPDATE framework_control_articles
      SET confidence = 'reviewed'
      WHERE id = $1::uuid
    `,
    [candidate.mapping_id],
  );

  await client.query(
    `
      UPDATE mapping_review_queue
      SET status = 'promoted', updated_at = NOW()
      WHERE id = $1::uuid
    `,
    [candidate.id],
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
        'agent_auto_approved',
        $6::jsonb,
        $7::jsonb
      )
    `,
    [
      candidate.id,
      candidate.mapping_id,
      candidate.framework,
      candidate.jurisdiction,
      candidate.language,
      JSON.stringify(candidate.stage2_passes ?? {}),
      JSON.stringify(candidate.stage3_checks ?? {}),
    ],
  );

  return {
    alreadyReviewed,
    mappingId: candidate.mapping_id,
    queueId: candidate.id,
  };
}

async function applyPromotions(pool: Pool, candidates: PromotionCandidate[]) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const results: PromotionResult[] = [];

    for (const candidate of candidates) {
      results.push(await promoteCandidate(client, candidate));
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
  const limit = parseLimit(getArg("--limit"));
  const shouldApply = process.argv.includes("--apply");
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Stage 4 promotion.");
  }

  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const candidates = await listPromotionCandidates(pool, {
      framework,
      jurisdiction,
      limit,
    });
    const candidateSummary = candidates.map((candidate) => {
      const stage3 = asStage3Checks(candidate.stage3_checks);
      return {
        articleReviewStatus: candidate.article_review_status,
        currentConfidence: candidate.confidence,
        mappingId: candidate.mapping_id,
        queueId: candidate.id,
        source: candidate.source_filename,
        stage3FinalStatus: stage3.finalStatus ?? null,
        stage3Overrides: getStage3Overrides(candidate.stage3_checks),
      };
    });

    if (!shouldApply) {
      console.log(
        JSON.stringify(
          {
            apply: false,
            candidates: candidateSummary,
            candidateCount: candidates.length,
            framework,
            jurisdiction,
            promotedCount: 0,
          },
          null,
          2,
        ),
      );
      return;
    }

    const results = await applyPromotions(pool, candidates);

    console.log(
      JSON.stringify(
        {
          apply: true,
          candidates: candidateSummary,
          candidateCount: candidates.length,
          framework,
          jurisdiction,
          promotedCount: results.filter((result) => !result.alreadyReviewed).length,
          results,
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
