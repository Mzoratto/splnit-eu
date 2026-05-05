import type { QuestionnaireAnswer } from "@/lib/questionnaires/types";

export type QuestionnaireReferenceContext = {
  evidence: { evidenceId: string }[];
  legalCitations: { legalCitationId: string }[];
  policies: { policyId: string }[];
};

export function sanitizeQuestionnaireAnswers(input: {
  answers: QuestionnaireAnswer[];
  context: QuestionnaireReferenceContext;
}) {
  const allowedEvidenceRefs = new Set(
    input.context.evidence.map((item) => item.evidenceId),
  );
  const allowedLegalRefs = new Set(
    input.context.legalCitations.map((item) => item.legalCitationId),
  );
  const allowedPolicyRefs = new Set(
    input.context.policies.map((item) => item.policyId),
  );

  return input.answers.map((answer) => {
    const evidenceRefs = answer.evidenceRefs.filter((ref) =>
      allowedEvidenceRefs.has(ref),
    );
    const legalRefs = answer.legalRefs.filter((ref) => allowedLegalRefs.has(ref));
    const policyRefs = answer.policyRefs.filter((ref) => allowedPolicyRefs.has(ref));
    const removedCount =
      answer.evidenceRefs.length -
      evidenceRefs.length +
      answer.legalRefs.length -
      legalRefs.length +
      answer.policyRefs.length -
      policyRefs.length;

    return {
      ...answer,
      confidence:
        removedCount > 0 &&
        evidenceRefs.length === 0 &&
        legalRefs.length === 0 &&
        policyRefs.length === 0
          ? "low"
          : answer.confidence,
      evidenceRefs,
      legalRefs,
      notes:
        removedCount > 0
          ? appendNote(
              answer.notes,
              `${removedCount} unsupported reference(s) were removed because they were not present in the reviewed questionnaire context.`,
            )
          : answer.notes,
      policyRefs,
    };
  });
}

function appendNote(note: string, addition: string) {
  if (!note) {
    return addition;
  }

  return `${note} ${addition}`;
}
