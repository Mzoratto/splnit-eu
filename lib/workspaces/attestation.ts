export type WorkspaceAttestationAssessmentResult = "pass" | "gap" | "manual_review";

export function deriveWorkspaceAttestationAssessmentResult(
  answers: Record<string, unknown>,
  options: { platformId?: string } = {},
): WorkspaceAttestationAssessmentResult {
  const rawResult = deriveRawWorkspaceAttestationAssessmentResult(answers);

  if (options.platformId === "helios" && rawResult === "pass") {
    return "manual_review";
  }

  return rawResult;
}

function deriveRawWorkspaceAttestationAssessmentResult(
  answers: Record<string, unknown>,
): WorkspaceAttestationAssessmentResult {
  if (isDesignatedPersonTrainingGap(answers)) {
    return "gap";
  }

  const values = Object.values(answers);

  if (values.length === 0) {
    return "manual_review";
  }

  const failing = values.some(
    (value) =>
      value === false ||
      (typeof value === "string" &&
        (value.toLowerCase() === "fail" || value.toLowerCase() === "no")),
  );

  if (failing) {
    return "gap";
  }

  const passing = values.some(
    (value) =>
      value === true ||
      (typeof value === "string" &&
        (value.toLowerCase() === "pass" || value.toLowerCase() === "yes")),
  );

  return passing ? "pass" : "manual_review";
}

export function isDesignatedPersonTrainingGap(
  answers: Record<string, unknown>,
  now = new Date(),
): boolean {
  if (answers.skoleni_absolvovano === false) {
    return true;
  }

  const trainingDate = answers.skoleni_datum;
  if (typeof trainingDate !== "string" || !trainingDate.trim()) {
    return false;
  }

  const parsed = new Date(`${trainingDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  return parsed < twelveMonthsAgo;
}
