import assert from "node:assert/strict";
import { getQuestionnaireExportEligibility } from "../lib/questionnaires/review-gate";
import type { QuestionnaireResult } from "../lib/questionnaires/types";

const baseResult = {
  artifactId: "artifact-1",
  generatedAt: "2026-05-09T00:00:00.000Z",
  model: "test-model",
  organisationName: "Example Org",
  questionCount: 2,
  summary: "Draft answers requiring review.",
} satisfies Omit<QuestionnaireResult, "answers">;

const approvedResult: QuestionnaireResult = {
  ...baseResult,
  answers: [
    {
      answer: "MFA is enforced for all users.",
      confidence: "supported",
      controlIds: ["control-1"],
      controlKeys: ["ctrl_mfa_all_users"],
      evidenceRefs: ["evidence-1"],
      legalRefs: [],
      notes: "Reviewed by compliance owner.",
      policyRefs: ["policy-1"],
      question: "Do you enforce MFA?",
      reviewStatus: "approved",
    },
    {
      answer: "Backups are tested quarterly.",
      confidence: "partial",
      controlIds: ["control-2"],
      controlKeys: ["ctrl_backup_tested"],
      evidenceRefs: [],
      legalRefs: [],
      notes: "Approved with partial confidence.",
      policyRefs: ["policy-2"],
      question: "Do you test backups?",
      reviewStatus: "approved",
    },
  ],
};

const approvedEligibility = getQuestionnaireExportEligibility(approvedResult);
assert.equal(approvedEligibility.allowed, true);
assert.deepEqual(approvedEligibility.blockedAnswers, []);

const draftResult: QuestionnaireResult = {
  ...approvedResult,
  answers: [
    {
      ...approvedResult.answers[0]!,
      reviewStatus: "draft",
    },
    approvedResult.answers[1]!,
  ],
};

const draftEligibility = getQuestionnaireExportEligibility(draftResult);
assert.equal(draftEligibility.allowed, false);
assert.deepEqual(draftEligibility.blockedAnswers, [
  {
    index: 0,
    question: "Do you enforce MFA?",
    reviewStatus: "draft",
  },
]);
assert.match(
  draftEligibility.reason,
  /Only approved questionnaire answers can be exported/i,
);

const flaggedResult: QuestionnaireResult = {
  ...approvedResult,
  answers: [
    approvedResult.answers[0]!,
    {
      ...approvedResult.answers[1]!,
      reviewStatus: "flagged",
    },
  ],
};

const flaggedEligibility = getQuestionnaireExportEligibility(flaggedResult);
assert.equal(flaggedEligibility.allowed, false);
assert.deepEqual(flaggedEligibility.blockedAnswers, [
  {
    index: 1,
    question: "Do you test backups?",
    reviewStatus: "flagged",
  },
]);

console.log("Questionnaire review gate smoke passed.");
