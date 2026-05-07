import { z } from "zod";
import { sanitizeQuestionnaireAnswers } from "@/lib/questionnaires/citation-guard";
import type {
  QuestionnaireAiInput,
  QuestionnaireAiProvider,
} from "@/lib/questionnaires/provider-types";
import {
  QuestionnaireAnswerSchema,
  type QuestionnaireAnswer,
} from "@/lib/questionnaires/types";

const OpenAiQuestionnaireResponseSchema = z.object({
  answers: z.array(QuestionnaireAnswerSchema),
  summary: z.string().default(""),
});

type OpenAiChatCompletionResponse = {
  choices?: {
    message?: {
      content?: string | null;
      refusal?: string | null;
    };
  }[];
  model?: string;
};

export function hasOpenAiConfig() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getOpenAiQuestionnaireModel() {
  return process.env.OPENAI_QUESTIONNAIRE_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
}

export async function answerQuestionnaireWithOpenAi(input: {
  context: QuestionnaireAiInput["context"];
  questions: QuestionnaireAiInput["questions"];
}) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for Questionnaire AI.");
  }

  const model = getOpenAiQuestionnaireModel();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    body: JSON.stringify({
      messages: [
        {
          content: buildSystemPrompt(input.context),
          role: "system",
        },
        {
          content: buildUserPrompt(input.questions),
          role: "user",
        },
      ],
      model,
      response_format: {
        json_schema: {
          name: "questionnaire_answers",
          schema: {
            additionalProperties: false,
            properties: {
              answers: {
                items: {
                  additionalProperties: false,
                  properties: {
                    answer: { type: "string" },
                    confidence: {
                      enum: ["supported", "partial", "no-context"],
                      type: "string",
                    },
                    controlIds: {
                      items: { type: "string" },
                      type: "array",
                    },
                    controlKeys: {
                      items: { type: "string" },
                      type: "array",
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
                    reviewStatus: {
                      enum: ["draft", "approved", "flagged"],
                      type: "string",
                    },
                  },
                  required: [
                    "question",
                    "answer",
                    "confidence",
                    "controlIds",
                    "controlKeys",
                    "evidenceRefs",
                    "legalRefs",
                    "policyRefs",
                    "notes",
                    "reviewStatus",
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
          strict: true,
        },
        type: "json_schema",
      },
      temperature: 0,
    }),
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI questionnaire request failed: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as OpenAiChatCompletionResponse;
  const message = payload.choices?.[0]?.message;

  if (message?.refusal) {
    throw new Error(`OpenAI refused questionnaire generation: ${message.refusal}`);
  }

  if (!message?.content) {
    throw new Error("OpenAI response did not include questionnaire answers.");
  }

  const parsed = OpenAiQuestionnaireResponseSchema.parse(JSON.parse(message.content));

  return {
    answers: sanitizeQuestionnaireAnswers({
      answers: alignAnswers(input.questions, parsed.answers),
      context: input.context,
    }),
    model: payload.model ?? model,
    summary: parsed.summary,
  };
}

function buildSystemPrompt(context: QuestionnaireAiInput["context"]) {
  return [
    "You answer inbound security questionnaires for Splnit.eu customer organisations.",
    "Use only the supplied organisation controls, evidence and policies. Do not invent certifications, tooling, dates or policy names.",
    "Use legal citations only when the exact legalCitationId is present in Reviewed legal citations. Never cite draft or missing laws.",
    "If support is missing, answer conservatively and state what evidence is missing.",
    "Each answer must include one or more controlIds when the question maps to supplied controls. Use only controlId values present in the control context.",
    "Use evidence summaries only; never imply raw evidence was reviewed beyond the supplied summaries.",
    "Every answer is an AI-generated draft requiring human review. Set reviewStatus to draft. Never mark an answer approved.",
    "This is a draft for legal/compliance review, not binding legal advice. Do not state that a customer is legally certified or guaranteed compliant.",
    "Confidence rules: supported = mapped controls have direct evidence or approved policy support; partial = mapped controls exist but support is incomplete, manual, expired, draft, or thin; no-context = no mapped control/evidence/policy support is available. If workspace context is thin for a mapped control, say so explicitly rather than fabricating confidence.",
    "",
    `Organisation: ${context.organisation?.name ?? "Unknown organisation"}`,
    `Plan: ${context.organisation?.plan ?? "unknown"}`,
    "",
    "Active controls:",
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

export const openAiQuestionnaireProvider: QuestionnaireAiProvider = {
  answer: answerQuestionnaireWithOpenAi,
  id: "openai",
  isConfigured: hasOpenAiConfig,
  label: "OpenAI",
};

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
    answer:
      answers[index]?.answer ??
      "No supported answer available from the current compliance data.",
    confidence: answers[index]?.confidence ?? "no-context",
    controlIds: answers[index]?.controlIds ?? [],
    controlKeys: answers[index]?.controlKeys ?? [],
    evidenceRefs: answers[index]?.evidenceRefs ?? [],
    legalRefs: answers[index]?.legalRefs ?? [],
    notes: answers[index]?.notes ?? "No direct supporting evidence was found.",
    policyRefs: answers[index]?.policyRefs ?? [],
    question,
    reviewStatus: "draft",
  }));
}
