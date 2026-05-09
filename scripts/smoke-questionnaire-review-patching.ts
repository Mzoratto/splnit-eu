import assert from "node:assert/strict";
import { applyQuestionnaireAnswerReview } from "../lib/questionnaires/review";
import type { QuestionnaireResult } from "../lib/questionnaires/types";

const result: QuestionnaireResult = {
  answers: [
    {
      answer: "MFA appears to be enabled.",
      confidence: "partial",
      controlIds: ["control-1"],
      controlKeys: ["ctrl_mfa"],
      evidenceRefs: ["evidence-1"],
      legalRefs: [],
      notes: "AI-generated draft requiring human review.",
      policyRefs: ["policy-1"],
      question: "Do you enforce MFA?",
      reviewStatus: "draft",
    },
    {
      answer: "No supported answer available.",
      confidence: "no-context",
      controlIds: [],
      controlKeys: [],
      evidenceRefs: [],
      legalRefs: [],
      notes: "No mapped control was available.",
      policyRefs: [],
      question: "Do you test backups?",
      reviewStatus: "draft",
    },
  ],
  artifactId: "artifact-1",
  generatedAt: "2026-05-09T00:00:00.000Z",
  model: "test-model",
  organisationName: "Example Org",
  questionCount: 2,
  summary: "Generated answers.",
};

const approved = applyQuestionnaireAnswerReview(result, {
  answer: "MFA is enforced for all users through the identity provider.",
  answerIndex: 0,
  notes: "Approved after checking policy-1 and evidence-1.",
  reviewStatus: "approved",
});

assert.equal(approved.answers[0]?.reviewStatus, "approved");
assert.equal(
  approved.answers[0]?.answer,
  "MFA is enforced for all users through the identity provider.",
);
assert.equal(approved.answers[0]?.notes, "Approved after checking policy-1 and evidence-1.");
assert.equal(result.answers[0]?.reviewStatus, "draft", "patching must not mutate input result");
assert.equal(approved.answers[1]?.reviewStatus, "draft", "other answers are preserved");

const flagged = applyQuestionnaireAnswerReview(result, {
  answerIndex: 1,
  notes: "Needs rework: no current restore-test evidence found.",
  reviewStatus: "flagged",
});

assert.equal(flagged.answers[1]?.reviewStatus, "flagged");
assert.equal(flagged.answers[1]?.answer, "No supported answer available.");
assert.equal(flagged.answers[1]?.notes, "Needs rework: no current restore-test evidence found.");

assert.throws(
  () =>
    applyQuestionnaireAnswerReview(result, {
      answerIndex: 9,
      reviewStatus: "approved",
    }),
  /answer index/i,
);

assert.throws(
  () =>
    applyQuestionnaireAnswerReview(result, {
      answer: "   ",
      answerIndex: 0,
      reviewStatus: "approved",
    }),
  /answer text/i,
);

console.log("Questionnaire review patching smoke passed.");
