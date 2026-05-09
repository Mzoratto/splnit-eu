import type { QuestionnaireAnswer, QuestionnaireResult } from "@/lib/questionnaires/types";

export type QuestionnaireAnswerReviewStatus = QuestionnaireAnswer["reviewStatus"];

export type QuestionnaireAnswerReviewPatch = {
  answer?: string;
  answerIndex: number;
  notes?: string;
  reviewStatus: QuestionnaireAnswerReviewStatus;
};

export function applyQuestionnaireAnswerReview(
  result: QuestionnaireResult,
  patch: QuestionnaireAnswerReviewPatch,
): QuestionnaireResult {
  if (!Number.isInteger(patch.answerIndex) || patch.answerIndex < 0) {
    throw new Error("Questionnaire answer index must be a non-negative integer.");
  }

  if (patch.answerIndex >= result.answers.length) {
    throw new Error("Questionnaire answer index is out of range.");
  }

  if (patch.answer !== undefined && patch.answer.trim().length === 0) {
    throw new Error("Questionnaire answer text cannot be empty.");
  }

  if (patch.notes !== undefined && patch.notes.length > 4_000) {
    throw new Error("Questionnaire review notes cannot exceed 4000 characters.");
  }

  return {
    ...result,
    answers: result.answers.map((answer, index) => {
      if (index !== patch.answerIndex) {
        return answer;
      }

      return {
        ...answer,
        answer: patch.answer?.trim() ?? answer.answer,
        notes: patch.notes?.trim() ?? answer.notes,
        reviewStatus: patch.reviewStatus,
      };
    }),
  };
}
