import type { QuestionnaireReferenceContext } from "@/lib/questionnaires/citation-guard";
import type { QuestionnaireAnswer } from "@/lib/questionnaires/types";

export type QuestionnaireSupportContext = QuestionnaireReferenceContext & {
  controls: unknown[];
};

export type QuestionnaireUnsupportedCopy = {
  answer: string;
  notes: string;
  summary: string;
};

export function hasQuestionnaireSupportContext(
  context: QuestionnaireSupportContext,
) {
  return (
    context.controls.length > 0 ||
    context.evidence.length > 0 ||
    context.legalCitations.length > 0 ||
    context.policies.length > 0
  );
}

export function buildUnsupportedQuestionnaireAnswers(input: {
  copy: QuestionnaireUnsupportedCopy;
  questions: string[];
}): { answers: QuestionnaireAnswer[]; model: string; summary: string } {
  return {
    answers: input.questions.map((question) => ({
      answer: input.copy.answer,
      confidence: "no-context",
      controlIds: [],
      controlKeys: [],
      evidenceRefs: [],
      legalRefs: [],
      notes: input.copy.notes,
      policyRefs: [],
      question,
      reviewStatus: "draft",
    })),
    model: "fallback:no-supported-context",
    summary: input.copy.summary,
  };
}
