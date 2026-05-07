import assert from "node:assert/strict";
import { sanitizeQuestionnaireAnswers } from "@/lib/questionnaires/citation-guard";
import {
  buildUnsupportedQuestionnaireAnswers,
  hasQuestionnaireSupportContext,
} from "@/lib/questionnaires/fallback";
import type { QuestionnaireAnswer } from "@/lib/questionnaires/types";

type SanitizeInput = Parameters<typeof sanitizeQuestionnaireAnswers>[0];

const context = {
  controls: [],
  evidence: [{ evidenceId: "evidence-reviewed-mfa" }],
  legalCitations: [{ legalCitationId: "nis2:EU:Article 21" }],
  organisation: null,
  policies: [{ policyId: "policy-incident-response" }],
} as SanitizeInput["context"];

const answers: QuestionnaireAnswer[] = [
  {
    answer: "MFA is enforced for supported users.",
    confidence: "high",
    controlIds: [],
    controlKeys: [],
    evidenceRefs: ["evidence-reviewed-mfa", "made-up-evidence"],
    legalRefs: ["nis2:EU:Article 21", "nis2:CZ:409-draft"],
    notes: "",
    policyRefs: ["policy-incident-response", "made-up-policy"],
    question: "Do you enforce MFA?",
    reviewStatus: "draft",
  },
];

const [sanitized] = sanitizeQuestionnaireAnswers({ answers, context });

assert.deepEqual(sanitized.evidenceRefs, ["evidence-reviewed-mfa"]);
assert.deepEqual(sanitized.legalRefs, ["nis2:EU:Article 21"]);
assert.deepEqual(sanitized.policyRefs, ["policy-incident-response"]);
assert.match(sanitized.notes, /unsupported reference/);

const [noReviewedLegalCitation] = sanitizeQuestionnaireAnswers({
  answers,
  context: { ...context, legalCitations: [] },
});

assert.deepEqual(noReviewedLegalCitation.legalRefs, []);
assert.match(noReviewedLegalCitation.notes, /unsupported reference/);

const [unsupportedOnly] = sanitizeQuestionnaireAnswers({
  answers: [
    {
      answer: "Unsupported answer.",
      confidence: "high",
      controlIds: [],
      controlKeys: [],
      evidenceRefs: ["made-up-evidence"],
      legalRefs: ["nis2:CZ:409-draft"],
      notes: "",
      policyRefs: ["made-up-policy"],
      question: "Unsupported?",
      reviewStatus: "draft",
    },
  ],
  context,
});

assert.equal(unsupportedOnly.confidence, "no-context");

assert.equal(hasQuestionnaireSupportContext({ ...context, controls: [] }), true);
assert.equal(
  hasQuestionnaireSupportContext({
    controls: [],
    evidence: [],
    legalCitations: [],
    policies: [],
  }),
  false,
);

const unsupportedFallback = buildUnsupportedQuestionnaireAnswers({
  copy: {
    answer: "No supported answer.",
    notes: "Add context first.",
    summary: "No context.",
  },
  questions: ["Do you enforce MFA?", "Do you have an incident process?"],
});

assert.equal(unsupportedFallback.model, "fallback:no-supported-context");
assert.equal(unsupportedFallback.summary, "No context.");
assert.equal(unsupportedFallback.answers.length, 2);
assert.equal(unsupportedFallback.answers[0]?.confidence, "no-context");
assert.deepEqual(unsupportedFallback.answers[0]?.legalRefs, []);

console.log("Questionnaire citation guard smoke passed.");
