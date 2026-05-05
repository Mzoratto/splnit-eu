import type { QuestionnaireResult } from "@/lib/questionnaires/types";

export const QUESTIONNAIRE_ARTIFACT_KIND = "questionnaire_answers";

export function buildQuestionnaireArtifactTitle(result: QuestionnaireResult) {
  return `Questionnaire answers - ${result.generatedAt.slice(0, 10)}`;
}

export function buildQuestionnaireArtifactContent(result: QuestionnaireResult) {
  return {
    result,
    resultType: QUESTIONNAIRE_ARTIFACT_KIND,
    schemaVersion: 1,
  };
}
