export const VENDOR_ASSESSMENT_QUESTIONS = [
  {
    id: "security_owner",
  },
  {
    id: "iso_certification",
  },
  {
    id: "data_processing",
    reverseScore: true,
  },
  {
    id: "subprocessors",
  },
  {
    id: "incident_notice",
  },
  {
    id: "access_control",
  },
  {
    id: "encryption",
  },
  {
    id: "backup_recovery",
  },
  {
    id: "vulnerability_management",
  },
  {
    id: "business_continuity",
  },
  {
    id: "data_location",
  },
  {
    id: "termination",
  },
] as const;

export const VENDOR_ANSWER_VALUES = ["yes", "partial", "no"] as const;

export type VendorAnswerValue = (typeof VENDOR_ANSWER_VALUES)[number];

export function scoreVendorAnswers(answers: Record<string, unknown>) {
  const total = VENDOR_ASSESSMENT_QUESTIONS.length * 2;
  const score = VENDOR_ASSESSMENT_QUESTIONS.reduce((sum, question) => {
    const answer = answers[question.id];
    const rawPoints = answer === "yes" ? 2 : answer === "partial" ? 1 : 0;
    const points =
      "reverseScore" in question && question.reverseScore
        ? 2 - rawPoints
        : rawPoints;

    return sum + points;
  }, 0);

  return Math.round((score / total) * 100);
}

export function getVendorRiskTier(score: number) {
  if (score >= 85) {
    return "low";
  }

  if (score >= 65) {
    return "medium";
  }

  if (score >= 45) {
    return "high";
  }

  return "critical";
}
