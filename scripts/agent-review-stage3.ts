import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const VALID_FRAMEWORKS = ["nis2", "eu_ai_act", "gdpr", "iso27001"] as const;
const VALID_JURISDICTIONS = ["it", "cz", "eu", "de", "fr", "es", "other"] as const;

type MappingReviewFramework = (typeof VALID_FRAMEWORKS)[number];
type MappingReviewJurisdiction = (typeof VALID_JURISDICTIONS)[number];
type ReviewStatus = "agent_decided" | "needs_human";
type ReviewVerdict = "approved" | "wrong_article" | "too_broad" | "needs_research";
type ReviewConfidence = "high" | "medium" | "low";

type QueueRow = {
  agent_confidence: ReviewConfidence | null;
  agent_verdict: ReviewVerdict | null;
  category: string | null;
  citation: string;
  control_id: string;
  control_title: string;
  framework: MappingReviewFramework;
  id: string;
  jurisdiction: MappingReviewJurisdiction;
  similarity_score: number | null;
  source_text: string;
  status: ReviewStatus;
};

type AdversarialResult = {
  confidence: ReviewConfidence;
  reasoning: string;
  verdict: ReviewVerdict;
};

type OpenAIChatResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
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
    return 200;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 1000) {
    throw new Error("--limit must be an integer between 1 and 1000.");
  }

  return parsed;
}

function getSimilarityThreshold(jurisdiction: MappingReviewJurisdiction) {
  if (jurisdiction === "cz") return 0.6;
  if (jurisdiction === "de" || jurisdiction === "fr" || jurisdiction === "es") {
    return 0.65;
  }
  return 0.4;
}

function checkCitationFormat(row: QueueRow) {
  const rules: Record<MappingReviewFramework, RegExp> = {
    eu_ai_act: /(Regulation \(EU\) 2024\/1689|EU AI Act).*(Art\.|Article|Annex)\s*[IVX\d]+/i,
    gdpr: /(Regulation \(EU\) 2016\/679|GDPR).*(Art\.|Article|Recital)\s*\d+/i,
    iso27001: /ISO\/IEC 2700[12]:2022|A\.\d+\.\d+(\.\d+)?/i,
    nis2:
      row.jurisdiction === "it"
        ? /D\.Lgs\.\s*138\/2024,\s*Art\.\s*\d+/i
        : row.jurisdiction === "cz"
          ? /(Zákon|Vyhláška).*(§|č\.)\s*\d+|§\s*\d+/i
          : /(Directive \(EU\) 2022\/2555|NIS2).*(Article|Art\.)\s*\d+/i,
  };
  const pattern = rules[row.framework];

  return {
    passed: pattern.test(row.citation),
    pattern: String(pattern),
  };
}

function getDomainBlacklistMatches(row: QueueRow) {
  const matches: string[] = [];
  const controlId = row.control_id.toLowerCase();

  if (row.framework === "nis2") {
    if (controlId.includes("incident") || controlId.includes("72h")) {
      matches.push("nis2_incident_response_or_regulatory_deadline");
    }

    if (/crypt|encrypt|secrets?/.test(controlId)) {
      matches.push("nis2_cryptography");
    }
  }

  if (row.framework === "gdpr") {
    if (/special|article_9|transfer|breach|automated_decision/.test(controlId)) {
      matches.push("gdpr_sensitive_domain");
    }
  }

  if (row.framework === "eu_ai_act") {
    if (/high_risk|prohibited|foundation/.test(controlId)) {
      matches.push("ai_act_sensitive_domain");
    }
  }

  if (row.framework === "iso27001") {
    if (/threat_intelligence|information_deletion|privacy|pii/.test(controlId)) {
      matches.push("iso27001_sensitive_domain");
    }
  }

  return matches;
}

function isAdversarialCandidate(row: QueueRow) {
  return row.status === "agent_decided" && row.agent_verdict === "approved";
}

function pickAdversarialSample(rows: QueueRow[]) {
  const candidates = rows.filter(isAdversarialCandidate);
  const sampleSize = candidates.length === 0 ? 0 : Math.max(1, Math.ceil(candidates.length * 0.05));

  return new Set(
    candidates
      .sort((a, b) => a.id.localeCompare(b.id))
      .slice(0, sampleSize)
      .map((row) => row.id),
  );
}

function buildStage3Checks(input: {
  adversarialResult: AdversarialResult | null;
  row: QueueRow;
  shouldRunAdversarial: boolean;
}) {
  const threshold = getSimilarityThreshold(input.row.jurisdiction);
  const citationFormat = checkCitationFormat(input.row);
  const blacklistMatches = getDomainBlacklistMatches(input.row);
  const similarity = {
    passed:
      input.row.agent_verdict !== "approved" ||
      input.row.similarity_score == null ||
      input.row.similarity_score >= threshold,
    score: input.row.similarity_score,
    threshold,
  };
  let finalStatus = input.row.status;
  const overrides: string[] = [];

  if (!similarity.passed) {
    finalStatus = "needs_human";
    overrides.push("similarity_below_threshold");
  }

  if (!citationFormat.passed) {
    finalStatus = "needs_human";
    overrides.push("citation_format_failed");
  }

  if (blacklistMatches.length > 0) {
    finalStatus = "needs_human";
    overrides.push("domain_blacklist");
  }

  if (
    input.adversarialResult &&
    input.adversarialResult.verdict !== input.row.agent_verdict
  ) {
    finalStatus = "needs_human";
    overrides.push("adversarial_disagreement");
  }

  return {
    adversarial: {
      result: input.adversarialResult,
      run: input.shouldRunAdversarial,
    },
    citationFormat,
    domainBlacklist: {
      matches: blacklistMatches,
      passed: blacklistMatches.length === 0,
    },
    finalStatus,
    originalStatus: input.row.status,
    overrides,
    similarity,
  };
}

async function listRowsForCrosscheck(
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
        mrq.framework,
        mrq.jurisdiction,
        mrq.control_id,
        mrq.control_title,
        mrq.source_text,
        mrq.citation,
        mrq.similarity_score,
        mrq.agent_verdict,
        mrq.agent_confidence,
        mrq.status,
        c.category
      FROM mapping_review_queue mrq
      LEFT JOIN controls c ON c.key = mrq.control_id
      WHERE mrq.framework = $1
        AND mrq.jurisdiction = $2
        AND mrq.status IN ('agent_decided', 'needs_human')
      ORDER BY mrq.created_at, mrq.id
      LIMIT $3
    `,
    [input.framework, input.jurisdiction, input.limit],
  );

  return result.rows;
}

async function runAdversarialPass(input: {
  apiKey: string;
  row: QueueRow;
}): Promise<AdversarialResult> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    body: JSON.stringify({
      messages: [
        {
          content: [
            "You are the adversarial spot-check pass in an offline compliance mapping review pipeline.",
            "Apply maximum skepticism. Look for any reason the citation does not directly support this control.",
            "Read source text in its native language. Write reasoning in English.",
            "Do not validate whether the source is official. That verification is already complete.",
            "Return only valid JSON with keys: verdict, confidence, reasoning.",
            "Allowed verdicts: approved, wrong_article, too_broad, needs_research.",
            "Allowed confidence values: high, medium, low.",
          ].join("\n"),
          role: "system",
        },
        {
          content: JSON.stringify(
            {
              citation: input.row.citation,
              control: {
                id: input.row.control_id,
                title: input.row.control_title,
              },
              framework: input.row.framework,
              jurisdiction: input.row.jurisdiction,
              previousAgentVerdict: input.row.agent_verdict,
              similarityScore: input.row.similarity_score,
              sourceText: input.row.source_text,
            },
            null,
            2,
          ),
          role: "user",
        },
      ],
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI adversarial pass failed: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as OpenAIChatResponse;
  const content = payload.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    throw new Error("OpenAI adversarial pass returned no message content.");
  }

  return parseAdversarialPayload(content);
}

function parseAdversarialPayload(content: string): AdversarialResult {
  const payload = JSON.parse(content) as Partial<AdversarialResult>;

  if (
    payload.verdict !== "approved" &&
    payload.verdict !== "wrong_article" &&
    payload.verdict !== "too_broad" &&
    payload.verdict !== "needs_research"
  ) {
    throw new Error(`Invalid adversarial verdict: ${String(payload.verdict)}`);
  }

  if (
    payload.confidence !== "high" &&
    payload.confidence !== "medium" &&
    payload.confidence !== "low"
  ) {
    throw new Error(`Invalid adversarial confidence: ${String(payload.confidence)}`);
  }

  if (typeof payload.reasoning !== "string") {
    throw new Error("Invalid adversarial reasoning.");
  }

  return {
    confidence: payload.confidence,
    reasoning: payload.reasoning,
    verdict: payload.verdict,
  };
}

async function persistStage3Checks(
  pool: Pool,
  input: {
    checks: ReturnType<typeof buildStage3Checks>;
    rowId: string;
  },
) {
  await pool.query(
    `
      UPDATE mapping_review_queue
      SET
        status = $2,
        stage3_checks = $3::jsonb,
        updated_at = NOW()
      WHERE id = $1::uuid
    `,
    [input.rowId, input.checks.finalStatus, JSON.stringify(input.checks)],
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
  const limit = parseLimit(getArg("--limit"));
  const shouldApply = process.argv.includes("--apply");
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const openaiApiKey = process.env.OPENAI_API_KEY?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Stage 3 cross-check.");
  }

  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const rows = await listRowsForCrosscheck(pool, {
      framework,
      jurisdiction,
      limit,
    });
    const adversarialSample = pickAdversarialSample(rows);

    if (shouldApply && adversarialSample.size > 0 && !openaiApiKey) {
      throw new Error("OPENAI_API_KEY is required for Stage 3 adversarial checks.");
    }

    const results = [];

    for (const row of rows) {
      const shouldRunAdversarial = adversarialSample.has(row.id);
      const adversarialResult =
        shouldApply && shouldRunAdversarial && openaiApiKey
          ? await runAdversarialPass({ apiKey: openaiApiKey, row })
          : null;
      const checks = buildStage3Checks({
        adversarialResult,
        row,
        shouldRunAdversarial,
      });

      if (shouldApply) {
        await persistStage3Checks(pool, { checks, rowId: row.id });
      }

      results.push({
        agentVerdict: row.agent_verdict,
        controlId: row.control_id,
        finalStatus: checks.finalStatus,
        id: row.id,
        originalStatus: row.status,
        overrides: checks.overrides,
      });
    }

    console.log(
      JSON.stringify(
        {
          adversarialSampleSize: adversarialSample.size,
          apply: shouldApply,
          crossCheckedRows: rows.length,
          framework,
          jurisdiction,
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
