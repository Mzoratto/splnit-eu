import { z } from "zod";

export const QuestionnaireAnswerSchema = z.object({
  answer: z.string().min(1),
  confidence: z.enum(["high", "medium", "low"]),
  evidenceRefs: z.array(z.string()).default([]),
  notes: z.string().default(""),
  policyRefs: z.array(z.string()).default([]),
  question: z.string().min(1),
});

export const QuestionnaireResultSchema = z.object({
  answers: z.array(QuestionnaireAnswerSchema),
  generatedAt: z.string(),
  model: z.string(),
  organisationName: z.string(),
  questionCount: z.number().int().nonnegative(),
  summary: z.string(),
});

export type QuestionnaireAnswer = z.infer<typeof QuestionnaireAnswerSchema>;
export type QuestionnaireResult = z.infer<typeof QuestionnaireResultSchema>;
