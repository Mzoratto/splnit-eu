import type { getQuestionnaireComplianceContext } from "@/lib/db/queries/questionnaires";
import type { QuestionnaireAnswer } from "@/lib/questionnaires/types";

export type QuestionnaireContext = Awaited<
  ReturnType<typeof getQuestionnaireComplianceContext>
>;

export type QuestionnaireAiProviderId = "anthropic";

export type QuestionnaireAiInput = {
  context: QuestionnaireContext;
  questions: string[];
};

export type QuestionnaireAiOutput = {
  answers: QuestionnaireAnswer[];
  model: string;
  summary: string;
};

export type QuestionnaireAiProvider = {
  answer(input: QuestionnaireAiInput): Promise<QuestionnaireAiOutput>;
  id: QuestionnaireAiProviderId;
  isConfigured(): boolean;
  label: string;
};
