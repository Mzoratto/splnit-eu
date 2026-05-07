import { z } from "zod";

export const QuestionnaireAnswerSchema = z.object({
  answer: z.string().min(1),
  confidence: z.enum(["supported", "partial", "no-context", "high", "medium", "low"]),
  controlIds: z.array(z.string()).default([]),
  controlKeys: z.array(z.string()).default([]),
  evidenceRefs: z.array(z.string()).default([]),
  legalRefs: z.array(z.string()).default([]),
  notes: z.string().default(""),
  policyRefs: z.array(z.string()).default([]),
  question: z.string().min(1),
  reviewStatus: z
    .enum(["draft", "approved", "flagged"])
    .default("draft"),
});

export const QuestionnaireResultSchema = z.object({
  answers: z.array(QuestionnaireAnswerSchema),
  artifactId: z.string().nullable().default(null),
  generatedAt: z.string(),
  model: z.string(),
  organisationName: z.string(),
  questionCount: z.number().int().nonnegative(),
  summary: z.string(),
});

export type QuestionnaireAnswer = z.infer<typeof QuestionnaireAnswerSchema>;
export type QuestionnaireResult = z.infer<typeof QuestionnaireResultSchema>;
