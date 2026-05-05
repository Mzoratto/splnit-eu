import assert from "node:assert/strict";
import {
  buildQuestionnaireArtifactContent,
  buildQuestionnaireArtifactTitle,
  QUESTIONNAIRE_ARTIFACT_KIND,
} from "@/lib/questionnaires/artifacts";
import { QuestionnaireResultSchema } from "@/lib/questionnaires/types";

const parsed = QuestionnaireResultSchema.parse({
  answers: [
    {
      answer: "MFA is enforced.",
      confidence: "high",
      evidenceRefs: ["evidence-1"],
      legalRefs: ["nis2:EU:Article 21"],
      notes: "",
      policyRefs: ["policy-1"],
      question: "Do you enforce MFA?",
    },
  ],
  generatedAt: "2026-05-05T10:00:00.000Z",
  model: "fallback:no-supported-context",
  organisationName: "Example",
  questionCount: 1,
  summary: "Generated answer summary.",
});

assert.equal(parsed.artifactId, null);
assert.equal(
  buildQuestionnaireArtifactTitle(parsed),
  "Questionnaire answers - 2026-05-05",
);

const content = buildQuestionnaireArtifactContent(parsed);
assert.equal(content.resultType, QUESTIONNAIRE_ARTIFACT_KIND);
assert.equal(content.schemaVersion, 1);
assert.deepEqual(content.result.answers[0]?.legalRefs, ["nis2:EU:Article 21"]);

console.log("Questionnaire artifact smoke passed.");
