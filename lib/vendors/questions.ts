export type VendorQuestionDefinition = {
  id: string;
  /**
   * Czech legal citation shown next to the question. § -level citations are
   * only used where the mapping is backed by the imported NÚKIB overview of
   * security measures (lib/compliance/nukib); otherwise cite the decree.
   */
  legalReference?: string;
  reverseScore?: boolean;
};

export const VENDOR_QUESTIONNAIRE_TEMPLATES = [
  "basic",
  "nis2_lower",
  "nis2_higher",
] as const;

export type VendorQuestionnaireTemplate =
  (typeof VENDOR_QUESTIONNAIRE_TEMPLATES)[number];

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

/**
 * One question per security-measure area of vyhláška č. 410/2025 Sb.
 * (§ 3–§ 14, lower-obligations regime). Section titles verified against the
 * imported NÚKIB "přehled bezpečnostních opatření" baseline.
 */
const NIS2_LOWER_QUESTIONS: readonly VendorQuestionDefinition[] = [
  { id: "nis2_isms", legalReference: "§ 3 vyhl. č. 410/2025 Sb." },
  { id: "nis2_management", legalReference: "§ 4 vyhl. č. 410/2025 Sb." },
  { id: "nis2_hr_security", legalReference: "§ 5 vyhl. č. 410/2025 Sb." },
  { id: "nis2_continuity", legalReference: "§ 6 vyhl. č. 410/2025 Sb." },
  { id: "nis2_access_control", legalReference: "§ 7 vyhl. č. 410/2025 Sb." },
  { id: "nis2_identity_mfa", legalReference: "§ 8 vyhl. č. 410/2025 Sb." },
  { id: "nis2_detection_logging", legalReference: "§ 9 vyhl. č. 410/2025 Sb." },
  { id: "nis2_incident_response", legalReference: "§ 10 vyhl. č. 410/2025 Sb." },
  { id: "nis2_network_security", legalReference: "§ 11 vyhl. č. 410/2025 Sb." },
  { id: "nis2_application_security", legalReference: "§ 12 vyhl. č. 410/2025 Sb." },
  { id: "nis2_cryptography", legalReference: "§ 13 vyhl. č. 410/2025 Sb." },
  { id: "nis2_incident_impact", legalReference: "§ 14 vyhl. č. 410/2025 Sb." },
];

/**
 * Deeper ISMS questions for suppliers of higher-regime customers. The
 * higher-regime decree (vyhláška č. 409/2025 Sb.) is cited at decree level
 * because the § -level mapping has not been verified against the primary
 * text yet — do not add § numbers here without that verification.
 */
const NIS2_HIGHER_EXTRA_QUESTIONS: readonly VendorQuestionDefinition[] = [
  { id: "nis2_security_policy", legalReference: "vyhl. č. 409/2025 Sb." },
  { id: "nis2_risk_management", legalReference: "vyhl. č. 409/2025 Sb." },
  { id: "nis2_asset_management", legalReference: "vyhl. č. 409/2025 Sb." },
  { id: "nis2_supplier_chain", legalReference: "vyhl. č. 409/2025 Sb." },
  { id: "nis2_change_management", legalReference: "vyhl. č. 409/2025 Sb." },
  { id: "nis2_vulnerability_disclosure", legalReference: "vyhl. č. 409/2025 Sb." },
  { id: "nis2_pentest", legalReference: "vyhl. č. 409/2025 Sb." },
  { id: "nis2_physical_security", legalReference: "vyhl. č. 409/2025 Sb." },
  { id: "nis2_secure_development", legalReference: "vyhl. č. 409/2025 Sb." },
  { id: "nis2_audit_certification", legalReference: "vyhl. č. 409/2025 Sb." },
  { id: "nis2_privileged_access", legalReference: "vyhl. č. 409/2025 Sb." },
  { id: "nis2_data_segregation", legalReference: "vyhl. č. 409/2025 Sb." },
  { id: "nis2_recovery_objectives", legalReference: "vyhl. č. 409/2025 Sb." },
  { id: "nis2_monitoring", legalReference: "vyhl. č. 409/2025 Sb." },
  { id: "nis2_subprocessor_notice", legalReference: "vyhl. č. 409/2025 Sb." },
  { id: "nis2_data_location" },
  { id: "nis2_exit_strategy" },
  { id: "nis2_incident_history", reverseScore: true },
];

const QUESTION_SETS: Record<
  VendorQuestionnaireTemplate,
  readonly VendorQuestionDefinition[]
> = {
  basic: VENDOR_ASSESSMENT_QUESTIONS,
  nis2_higher: [...NIS2_LOWER_QUESTIONS, ...NIS2_HIGHER_EXTRA_QUESTIONS],
  nis2_lower: NIS2_LOWER_QUESTIONS,
};

export function getVendorQuestionSet(
  template: VendorQuestionnaireTemplate,
): readonly VendorQuestionDefinition[] {
  return QUESTION_SETS[template];
}

export function getAllVendorQuestionIds(): readonly string[] {
  const ids = new Set<string>();

  for (const questions of Object.values(QUESTION_SETS)) {
    for (const question of questions) {
      ids.add(question.id);
    }
  }

  return [...ids];
}

export function normalizeVendorQuestionnaireTemplate(
  value: string | null | undefined,
): VendorQuestionnaireTemplate {
  return (VENDOR_QUESTIONNAIRE_TEMPLATES as readonly string[]).includes(value ?? "")
    ? (value as VendorQuestionnaireTemplate)
    : "basic";
}

/**
 * Picks the questionnaire template for an organisation based on its Czech
 * obligations regime; organisations without a determined regime keep the
 * generic baseline questionnaire.
 */
export function getVendorTemplateForRegime(
  rezimPovinnosti: string | null | undefined,
): VendorQuestionnaireTemplate {
  if (rezimPovinnosti === "vyssi") {
    return "nis2_higher";
  }

  if (rezimPovinnosti === "nizsi") {
    return "nis2_lower";
  }

  return "basic";
}

export const VENDOR_ANSWER_VALUES = [
  "yes",
  "partial",
  "no",
  "not_applicable",
] as const;

export type VendorAnswerValue = (typeof VENDOR_ANSWER_VALUES)[number];
export type VendorQuestionId = (typeof VENDOR_ASSESSMENT_QUESTIONS)[number]["id"];
export type VendorAssessmentAnswers = Record<string, VendorAnswerValue>;

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
  template: VendorQuestionnaireTemplate = "basic",
): VendorAnswerValidationResult {
  const normalized: VendorAssessmentAnswers = {};
  const missingQuestionIds: string[] = [];
  const invalidQuestionIds: string[] = [];

  for (const question of getVendorQuestionSet(template)) {
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
  template: VendorQuestionnaireTemplate = "basic",
): VendorAssessmentAnswers {
  const result = validateVendorAssessmentAnswers(answers, template);

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

export function scoreVendorAnswers(
  answers: Record<string, unknown>,
  template: VendorQuestionnaireTemplate = "basic",
) {
  const normalized = requireVendorAssessmentAnswers(answers, template);
  let applicableTotal = 0;
  const score = getVendorQuestionSet(template).reduce((sum, question) => {
    const answer = normalized[question.id];

    if (answer === "not_applicable") {
      return sum;
    }

    applicableTotal += 2;
    const rawPoints = answer === "yes" ? 2 : answer === "partial" ? 1 : 0;
    const points = question.reverseScore ? 2 - rawPoints : rawPoints;

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
