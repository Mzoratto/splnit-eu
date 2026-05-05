import { z } from "zod";
import type { getQuestionnaireComplianceContext } from "@/lib/db/queries/questionnaires";
import { sanitizeQuestionnaireAnswers } from "@/lib/questionnaires/citation-guard";
import {
  QuestionnaireAnswerSchema,
  type QuestionnaireAnswer,
} from "@/lib/questionnaires/types";

type QuestionnaireContext = Awaited<
  ReturnType<typeof getQuestionnaireComplianceContext>
>;

const ClaudeToolInputSchema = z.object({
  answers: z.array(QuestionnaireAnswerSchema),
  summary: z.string().default(""),
});

type AnthropicMessageResponse = {
  content?: {
    input?: unknown;
    name?: string;
    text?: string;
    type: string;
  }[];
  model?: string;
};

export function hasClaudeConfig() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getClaudeModel() {
  return process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";
}

export async function answerQuestionnaireWithClaude(input: {
  context: QuestionnaireContext;
  questions: string[];
}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is required for Questionnaire AI.");
  }

  const model = getClaudeModel();
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    body: JSON.stringify({
      max_tokens: 5000,
      messages: [
        {
          content: buildUserPrompt(input.questions),
          role: "user",
        },
      ],
      model,
      system: buildSystemPrompt(input.context),
      temperature: 0,
      tool_choice: { name: "answer_questionnaire", type: "tool" },
      tools: [
        {
          description:
            "Return security questionnaire answers grounded in the provided compliance context.",
          input_schema: {
            additionalProperties: false,
            properties: {
              answers: {
                items: {
                  additionalProperties: false,
                  properties: {
                    answer: { type: "string" },
                    confidence: {
                      enum: ["high", "medium", "low"],
                      type: "string",
                    },
                    evidenceRefs: {
                      items: { type: "string" },
                      type: "array",
                    },
                    legalRefs: {
                      items: { type: "string" },
                      type: "array",
                    },
                    notes: { type: "string" },
                    policyRefs: {
                      items: { type: "string" },
                      type: "array",
                    },
                    question: { type: "string" },
                  },
                  required: [
                    "question",
                    "answer",
                    "confidence",
                    "evidenceRefs",
                    "legalRefs",
                    "policyRefs",
                    "notes",
                  ],
                  type: "object",
                },
                type: "array",
              },
              summary: { type: "string" },
            },
            required: ["answers", "summary"],
            type: "object",
          },
          name: "answer_questionnaire",
        },
      ],
    }),
    headers: {
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Claude API request failed: ${response.status}`);
  }

  const message = (await response.json()) as AnthropicMessageResponse;
  const toolUse = message.content?.find(
    (block) => block.type === "tool_use" && block.name === "answer_questionnaire",
  );

  if (toolUse?.input) {
    const parsed = ClaudeToolInputSchema.parse(toolUse.input);
    return {
      answers: sanitizeQuestionnaireAnswers({
        answers: alignAnswers(input.questions, parsed.answers),
        context: input.context,
      }),
      model: message.model ?? model,
      summary: parsed.summary,
    };
  }

  const text = message.content?.find((block) => block.type === "text")?.text;

  if (text) {
    const parsed = ClaudeToolInputSchema.parse(JSON.parse(text));
    return {
      answers: sanitizeQuestionnaireAnswers({
        answers: alignAnswers(input.questions, parsed.answers),
        context: input.context,
      }),
      model: message.model ?? model,
      summary: parsed.summary,
    };
  }

  throw new Error("Claude response did not include questionnaire answers.");
}

function buildSystemPrompt(context: QuestionnaireContext) {
  return [
    "You answer inbound security questionnaires for Splnit.eu customer organisations.",
    "Use only the supplied organisation controls, evidence and policies. Do not invent certifications, tooling, dates or policy names.",
    "Use legal citations only when the exact legalCitationId is present in Reviewed legal citations. Never cite draft or missing laws.",
    "If support is missing, answer conservatively and state what evidence is missing.",
    "This is a draft for legal/compliance review, not binding legal advice. Do not state that a customer is legally certified or guaranteed compliant.",
    "Confidence rules: high = automated evidence or direct evidence supports the answer; medium = passing manual control or active policy supports it; low = no direct support.",
    "",
    `Organisation: ${context.organisation?.name ?? "Unknown organisation"}`,
    `Plan: ${context.organisation?.plan ?? "unknown"}`,
    "",
    "Passing controls:",
    JSON.stringify(context.controls, null, 2),
    "",
    "Evidence:",
    JSON.stringify(
      context.evidence.map((item) => ({
        ...item,
        automated: Boolean(item.integrationRunId),
      })),
      null,
      2,
    ),
    "",
    "Policies:",
    JSON.stringify(context.policies, null, 2),
    "",
    "Reviewed legal citations:",
    JSON.stringify(context.legalCitations, null, 2),
  ].join("\n");
}

function buildUserPrompt(questions: string[]) {
  return [
    "Answer these security questionnaire questions. Return one answer for each input question in the same order.",
    ...questions.map((question, index) => `${index + 1}. ${question}`),
  ].join("\n");
}

function alignAnswers(
  questions: string[],
  answers: QuestionnaireAnswer[],
): QuestionnaireAnswer[] {
  return questions.map((question, index) => ({
    answer: answers[index]?.answer ?? "No supported answer available from the current compliance data.",
    confidence: answers[index]?.confidence ?? "low",
    evidenceRefs: answers[index]?.evidenceRefs ?? [],
    legalRefs: answers[index]?.legalRefs ?? [],
    notes: answers[index]?.notes ?? "No direct supporting evidence was found.",
    policyRefs: answers[index]?.policyRefs ?? [],
    question,
  }));
}
