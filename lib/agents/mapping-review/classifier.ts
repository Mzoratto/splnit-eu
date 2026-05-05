export const REVIEW_VERDICTS = [
  "approved",
  "wrong_article",
  "too_broad",
  "needs_research",
] as const;

export const REVIEW_CONFIDENCES = ["high", "medium", "low"] as const;

export type ReviewVerdict = (typeof REVIEW_VERDICTS)[number];
export type ReviewConfidence = (typeof REVIEW_CONFIDENCES)[number];
export type ReviewPassRole = "skeptic" | "advocate" | "auditor";

export type MappingReviewQueueItem = {
  citation: string;
  controlDescription: string | null;
  controlId: string;
  controlTitle: string;
  framework: "nis2" | "eu_ai_act" | "gdpr" | "iso27001";
  id: string;
  jurisdiction: "it" | "cz" | "eu" | "de" | "fr" | "es" | "other";
  language: "it" | "cs" | "en" | "de" | "fr" | "es";
  regulator: string | null;
  similarityScore: number | null;
  sourceText: string;
};

export type ReviewPassResult = {
  confidence: ReviewConfidence;
  model: string;
  reasoning: string;
  role: ReviewPassRole;
  verdict: ReviewVerdict;
};

export type CombinedReviewDecision = {
  confidence: ReviewConfidence;
  status: "agent_decided" | "needs_human";
  verdict: ReviewVerdict;
};

type OpenAIChatResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

const PASS_CONFIG: Record<ReviewPassRole, { model: string; framing: string }> = {
  advocate: {
    framing: "Find the strongest defensible justification for accepting this mapping.",
    model: "gpt-4o-mini",
  },
  auditor: {
    framing:
      "Decide whether a compliance auditor in the target jurisdiction would accept this citation for this control.",
    model: "gpt-4o",
  },
  skeptic: {
    framing: "Find any reason to reject this mapping.",
    model: "gpt-4o-mini",
  },
};

export async function classifyMappingRow(input: {
  apiKey: string;
  item: MappingReviewQueueItem;
}) {
  const roles: ReviewPassRole[] = ["skeptic", "advocate", "auditor"];
  const passes: ReviewPassResult[] = [];

  for (const role of roles) {
    passes.push(
      await runReviewPass({
        apiKey: input.apiKey,
        item: input.item,
        role,
      }),
    );
  }

  return {
    combined: combineReviewPasses(passes, input.item),
    passes,
  };
}

export function combineReviewPasses(
  passes: ReviewPassResult[],
  item: Pick<MappingReviewQueueItem, "jurisdiction" | "similarityScore">,
): CombinedReviewDecision {
  if (passes.some((pass) => pass.verdict === "needs_research")) {
    return {
      confidence: "low",
      status: "needs_human",
      verdict: "needs_research",
    };
  }

  const verdictCounts = countBy(passes.map((pass) => pass.verdict));
  const [topVerdict, topCount] = Object.entries(verdictCounts).sort(
    (a, b) => b[1] - a[1],
  )[0] as [ReviewVerdict, number];

  if (topCount === 3) {
    const confidence = "high";
    const status =
      topVerdict === "approved" && failsJurisdictionThreshold(item)
        ? "needs_human"
        : "agent_decided";

    return {
      confidence,
      status,
      verdict: topVerdict,
    };
  }

  if (topCount === 2) {
    return {
      confidence: "medium",
      status: "needs_human",
      verdict: topVerdict,
    };
  }

  return {
    confidence: "low",
    status: "needs_human",
    verdict: "needs_research",
  };
}

function failsJurisdictionThreshold(
  item: Pick<MappingReviewQueueItem, "jurisdiction" | "similarityScore">,
) {
  const threshold = item.jurisdiction === "cz" ? 0.6 : 0.4;

  return item.similarityScore != null && item.similarityScore < threshold;
}

async function runReviewPass(input: {
  apiKey: string;
  item: MappingReviewQueueItem;
  role: ReviewPassRole;
}): Promise<ReviewPassResult> {
  const config = PASS_CONFIG[input.role];
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    body: JSON.stringify({
      messages: [
        {
          content: buildSystemPrompt(input.role, config.framing, input.item),
          role: "system",
        },
        {
          content: buildUserPrompt(input.item),
          role: "user",
        },
      ],
      model: config.model,
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
    throw new Error(`OpenAI review pass failed: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as OpenAIChatResponse;
  const content = payload.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    throw new Error("OpenAI review pass returned no message content.");
  }

  const parsed = parsePassPayload(content);

  return {
    ...parsed,
    model: config.model,
    role: input.role,
  };
}

function buildSystemPrompt(
  role: ReviewPassRole,
  framing: string,
  item: MappingReviewQueueItem,
) {
  return [
    `You are the ${role} pass in an offline compliance mapping review pipeline.`,
    framing,
    getFrameworkContext(item),
    "Read source text in its native language. Do not translate first.",
    "Write reasoning in English for consistent audit logs.",
    "Preserve citation numbering and legal references exactly as provided.",
    "Do not validate whether the source is official. That verification is already complete.",
    "Answer one question only: does this regulatory section genuinely support this specific control mapping?",
    "Return only valid JSON with keys: verdict, confidence, reasoning.",
    "Allowed verdicts: approved, wrong_article, too_broad, needs_research.",
    "Allowed confidence values: high, medium, low.",
  ].join("\n");
}

function buildUserPrompt(item: MappingReviewQueueItem) {
  return JSON.stringify(
    {
      citation: item.citation,
      control: {
        description: item.controlDescription,
        id: item.controlId,
        title: item.controlTitle,
      },
      framework: item.framework,
      jurisdiction: item.jurisdiction,
      language: item.language,
      regulator: item.regulator,
      similarityScore: item.similarityScore,
      sourceText: item.sourceText,
    },
    null,
    2,
  );
}

function getFrameworkContext(item: MappingReviewQueueItem) {
  if (item.framework === "gdpr") {
    return `Framework context: GDPR Regulation (EU) 2016/679. Supervisory authority: ${item.regulator ?? "applicable authority"}. Auditor expectations focus on Article 5 principles, Article 32 security measures, and Articles 33-34 breach notifications.`;
  }

  if (item.framework === "eu_ai_act") {
    return `Framework context: EU AI Act Regulation (EU) 2024/1689. Regulator: ${item.regulator ?? "applicable authority"}. Auditor expectations vary by AI system risk classification and Annex III high-risk categories.`;
  }

  if (item.framework === "iso27001") {
    return "Framework context: ISO/IEC 27001:2022 Annex A controls. There is no jurisdictional overlay. Auditor expectations focus on the specific control objective and implementation guidance.";
  }

  return `Framework context: NIS2 Directive (EU) 2022/2555 as transposed in ${item.jurisdiction.toUpperCase()}. Controlling authority: ${item.regulator ?? "applicable authority"}. Auditor expectations focus on cybersecurity risk-management measures and incident reporting.`;
}

function parsePassPayload(content: string) {
  let payload: unknown;

  try {
    payload = JSON.parse(content);
  } catch (error) {
    throw new Error(`OpenAI review pass returned invalid JSON: ${(error as Error).message}`);
  }

  if (!isRecord(payload)) {
    throw new Error("OpenAI review pass JSON is not an object.");
  }

  const verdict = payload.verdict;
  const confidence = payload.confidence;
  const reasoning = payload.reasoning;

  if (!REVIEW_VERDICTS.includes(verdict as ReviewVerdict)) {
    throw new Error(`Invalid review verdict: ${String(verdict)}`);
  }

  if (!REVIEW_CONFIDENCES.includes(confidence as ReviewConfidence)) {
    throw new Error(`Invalid review confidence: ${String(confidence)}`);
  }

  if (typeof reasoning !== "string" || reasoning.trim().length === 0) {
    throw new Error("Review reasoning must be a non-empty string.");
  }

  return {
    confidence: confidence as ReviewConfidence,
    reasoning: reasoning.trim(),
    verdict: verdict as ReviewVerdict,
  };
}

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<T, number>>(
    (counts, value) => {
      counts[value] = (counts[value] ?? 0) + 1;
      return counts;
    },
    {} as Record<T, number>,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
