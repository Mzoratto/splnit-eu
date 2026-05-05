import assert from "node:assert/strict";
import { sanitizeQuestionnaireAnswers } from "@/lib/questionnaires/citation-guard";
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
    evidenceRefs: ["evidence-reviewed-mfa", "made-up-evidence"],
    legalRefs: ["nis2:EU:Article 21", "nis2:CZ:409-draft"],
    notes: "",
    policyRefs: ["policy-incident-response", "made-up-policy"],
    question: "Do you enforce MFA?",
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
      evidenceRefs: ["made-up-evidence"],
      legalRefs: ["nis2:CZ:409-draft"],
      notes: "",
      policyRefs: ["made-up-policy"],
      question: "Unsupported?",
    },
  ],
  context,
});

assert.equal(unsupportedOnly.confidence, "low");

console.log("Questionnaire citation guard smoke passed.");
