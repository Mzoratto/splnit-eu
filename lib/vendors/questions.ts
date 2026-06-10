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

export const VENDOR_ANSWER_VALUES = [
  "yes",
  "partial",
  "no",
  "not_applicable",
] as const;

export type VendorAnswerValue = (typeof VENDOR_ANSWER_VALUES)[number];
export type VendorQuestionId = (typeof VENDOR_ASSESSMENT_QUESTIONS)[number]["id"];
export type VendorAssessmentAnswers = Record<VendorQuestionId, VendorAnswerValue>;

const vendorAnswerValues = new Set<string>(VENDOR_ANSWER_VALUES);

export type VendorAnswerValidationResult =
  | {
      answers: VendorAssessmentAnswers;
      ok: true;
    }
  | {
      invalidQuestionIds: string[];
      missingQuestionIds: string[];
      ok: false;
    };

export function validateVendorAssessmentAnswers(
  answers: Record<string, unknown>,
): VendorAnswerValidationResult {
  const normalized = {} as VendorAssessmentAnswers;
  const missingQuestionIds: string[] = [];
  const invalidQuestionIds: string[] = [];

  for (const question of VENDOR_ASSESSMENT_QUESTIONS) {
    const value = answers[question.id];

    if (typeof value !== "string" || value.trim() === "") {
      missingQuestionIds.push(question.id);
      continue;
    }

    if (!vendorAnswerValues.has(value)) {
      invalidQuestionIds.push(question.id);
      continue;
    }

    normalized[question.id] = value as VendorAnswerValue;
  }

  if (missingQuestionIds.length || invalidQuestionIds.length) {
    return {
      invalidQuestionIds,
      missingQuestionIds,
      ok: false,
    };
  }

  return {
    answers: normalized,
    ok: true,
  };
}

export function requireVendorAssessmentAnswers(
  answers: Record<string, unknown>,
): VendorAssessmentAnswers {
  const result = validateVendorAssessmentAnswers(answers);

  if (!result.ok) {
    const details = [
      result.missingQuestionIds.length
        ? `missing: ${result.missingQuestionIds.join(", ")}`
        : null,
      result.invalidQuestionIds.length
        ? `invalid: ${result.invalidQuestionIds.join(", ")}`
        : null,
    ]
      .filter(Boolean)
      .join("; ");

    throw new Error(`Vendor assessment answers require explicit valid choices (${details}).`);
  }

  return result.answers;
}

export function scoreVendorAnswers(answers: Record<string, unknown>) {
  const normalized = requireVendorAssessmentAnswers(answers);
  let applicableTotal = 0;
  const score = VENDOR_ASSESSMENT_QUESTIONS.reduce((sum, question) => {
    const answer = normalized[question.id];

    if (answer === "not_applicable") {
      return sum;
    }

    applicableTotal += 2;
    const rawPoints = answer === "yes" ? 2 : answer === "partial" ? 1 : 0;
    const points =
      "reverseScore" in question && question.reverseScore
        ? 2 - rawPoints
        : rawPoints;

    return sum + points;
  }, 0);

  if (applicableTotal === 0) {
    return null;
  }

  return Math.round((score / applicableTotal) * 100);
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
