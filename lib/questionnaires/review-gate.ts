import type { QuestionnaireResult } from "@/lib/questionnaires/types";

export type QuestionnaireExportBlockedAnswer = {
  index: number;
  question: string;
  reviewStatus: "draft" | "flagged" | "approved";
};

export type QuestionnaireExportEligibility =
  | {
      allowed: true;
      blockedAnswers: [];
      reason: null;
    }
  | {
      allowed: false;
      blockedAnswers: QuestionnaireExportBlockedAnswer[];
      reason: string;
    };

export const QUESTIONNAIRE_EXPORT_REVIEW_REQUIRED_MESSAGE =
  "Only approved questionnaire answers can be exported. Draft or flagged AI-generated answers require human review first.";

export function getQuestionnaireExportEligibility(
  result: QuestionnaireResult,
): QuestionnaireExportEligibility {
  const blockedAnswers = result.answers.flatMap((answer, index) => {
    if (answer.reviewStatus === "approved") {
      return [];
    }

    return [
      {
        index,
        question: answer.question,
        reviewStatus: answer.reviewStatus,
      },
    ];
  });

  if (blockedAnswers.length === 0) {
    return {
      allowed: true,
      blockedAnswers: [],
      reason: null,
    };
  }

  return {
    allowed: false,
    blockedAnswers,
    reason: QUESTIONNAIRE_EXPORT_REVIEW_REQUIRED_MESSAGE,
  };
}
