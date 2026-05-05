import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import {
  classifyMappingRow,
  type MappingReviewQueueItem,
} from "../lib/agents/mapping-review/classifier";

loadEnvConfig(process.cwd());

const VALID_FRAMEWORKS = ["nis2", "eu_ai_act", "gdpr", "iso27001"] as const;
const VALID_JURISDICTIONS = ["it", "cz", "eu", "de", "fr", "es", "other"] as const;

type MappingReviewFramework = (typeof VALID_FRAMEWORKS)[number];
type MappingReviewJurisdiction = (typeof VALID_JURISDICTIONS)[number];

type QueueRow = {
  citation: string;
  control_description: string | null;
  control_id: string;
  control_title: string;
  framework: MappingReviewQueueItem["framework"];
  id: string;
  jurisdiction: MappingReviewQueueItem["jurisdiction"];
  language: MappingReviewQueueItem["language"];
  regulator: string | null;
  similarity_score: number | null;
  source_text: string;
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
    return 5;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 200) {
    throw new Error("--limit must be an integer between 1 and 200.");
  }

  return parsed;
}

async function listRowsForClassification(
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
        id::text,
        framework,
        jurisdiction,
        language,
        control_id,
        control_title,
        control_description,
        source_text,
        citation,
        regulator,
        similarity_score
      FROM mapping_review_queue
      WHERE framework = $1
        AND jurisdiction = $2
        AND status = 'unclassified'
      ORDER BY similarity_score NULLS FIRST, created_at, id
      LIMIT $3
    `,
    [input.framework, input.jurisdiction, input.limit],
  );

  return result.rows.map(toQueueItem);
}

async function persistDecision(
  pool: Pool,
  input: Awaited<ReturnType<typeof classifyMappingRow>> & {
    item: MappingReviewQueueItem;
  },
) {
  await pool.query(
    `
      UPDATE mapping_review_queue
      SET
        agent_verdict = $2,
        agent_confidence = $3,
        stage2_passes = $4::jsonb,
        status = $5,
        classified_at = NOW(),
        updated_at = NOW()
      WHERE id = $1::uuid
    `,
    [
      input.item.id,
      input.combined.verdict,
      input.combined.confidence,
      JSON.stringify({
        combined: input.combined,
        passes: input.passes,
      }),
      input.combined.status,
    ],
  );
}

function toQueueItem(row: QueueRow): MappingReviewQueueItem {
  return {
    citation: row.citation,
    controlDescription: row.control_description,
    controlId: row.control_id,
    controlTitle: row.control_title,
    framework: row.framework,
    id: row.id,
    jurisdiction: row.jurisdiction,
    language: row.language,
    regulator: row.regulator,
    similarityScore: row.similarity_score == null ? null : Number(row.similarity_score),
    sourceText: row.source_text,
  };
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
  const openaiApiKey = process.env.OPENAI_API_KEY?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Stage 2 classification.");
  }

  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY is required for Stage 2 classification.");
  }

  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const rows = await listRowsForClassification(pool, {
      framework,
      jurisdiction,
      limit,
    });
    const results = [];

    for (const item of rows) {
      const result = await classifyMappingRow({
        apiKey: openaiApiKey,
        item,
      });

      if (shouldApply) {
        await persistDecision(pool, { ...result, item });
      }

      results.push({
        confidence: result.combined.confidence,
        controlId: item.controlId,
        id: item.id,
        similarityScore: item.similarityScore,
        status: result.combined.status,
        verdict: result.combined.verdict,
      });
    }

    console.log(
      JSON.stringify(
        {
          apply: shouldApply,
          classifiedRows: results.length,
          framework,
          jurisdiction,
          limit,
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
