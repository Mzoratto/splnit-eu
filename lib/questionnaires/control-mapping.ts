export type QuestionnaireContextControl = {
  controlId: string;
  controlKey: string;
  description: string | null;
  isAutomated: boolean;
  lastEvidenceAt: Date | null;
  notes: string | null;
  status: string;
  title: string;
  updatedAt: Date | null;
};

export type QuestionnaireControlMapping = {
  controlIds: string[];
  controlKeys: string[];
  question: string;
};

export type QuestionnaireAnswerConfidence = "supported" | "partial" | "no-context";

const CONTROL_KEYWORDS: Record<string, string[]> = {
  access: ["access", "privilege", "privileged", "account", "user", "identity", "login", "role", "guest"],
  asset: ["asset", "inventory", "system", "device", "endpoint"],
  backup: ["backup", "restore", "restoration", "recovery", "continuity", "disaster"],
  change: ["change", "approval", "configuration", "baseline"],
  data: ["data", "privacy", "personal", "classification", "retention"],
  encryption: ["encrypt", "encrypted", "encryption", "keys", "at rest", "in transit"],
  incident: ["incident", "breach", "72", "notification", "response", "escalation"],
  logging: ["log", "logs", "logging", "monitor", "monitoring", "alert", "alerts", "siem"],
  mfa: ["mfa", "multi-factor", "multifactor", "2fa", "two-factor", "authentication"],
  patch: ["patch", "patching", "vulnerability", "vulnerabilities", "cve"],
  policy: ["policy", "procedure", "standard", "documented", "approved"],
  supplier: ["supplier", "vendor", "third party", "third-party", "supply chain", "subprocessor"],
  training: ["training", "awareness", "employee", "employees", "staff"],
};

const CONTROL_KEY_HINTS: Record<string, string[]> = {
  ctrl_asset_inventory: CONTROL_KEYWORDS.asset,
  ctrl_backup_tested: CONTROL_KEYWORDS.backup,
  ctrl_business_continuity_plan: CONTROL_KEYWORDS.backup,
  ctrl_change_management: CONTROL_KEYWORDS.change,
  ctrl_data_classification: CONTROL_KEYWORDS.data,
  ctrl_data_encrypted_at_rest: CONTROL_KEYWORDS.encryption,
  ctrl_device_encryption: CONTROL_KEYWORDS.encryption,
  ctrl_disaster_recovery_test: CONTROL_KEYWORDS.backup,
  ctrl_guest_access_controlled: CONTROL_KEYWORDS.access,
  ctrl_incident_72h_notification: CONTROL_KEYWORDS.incident,
  ctrl_incident_plan_documented: CONTROL_KEYWORDS.incident,
  ctrl_logging_monitoring: CONTROL_KEYWORDS.logging,
  ctrl_mfa_all_users: CONTROL_KEYWORDS.mfa,
  ctrl_password_policy: [...CONTROL_KEYWORDS.access, "password"],
  ctrl_patch_management: CONTROL_KEYWORDS.patch,
  ctrl_privileged_access_reviewed: CONTROL_KEYWORDS.access,
  ctrl_security_event_alerting: CONTROL_KEYWORDS.logging,
  ctrl_security_training_annual: CONTROL_KEYWORDS.training,
  ctrl_supplier_contract_security: CONTROL_KEYWORDS.supplier,
  ctrl_vendor_security_assessment: CONTROL_KEYWORDS.supplier,
  ctrl_vulnerability_management: CONTROL_KEYWORDS.patch,
};

export function buildQuestionnaireControlMapping(input: {
  controls: QuestionnaireContextControl[];
  questions: string[];
}): QuestionnaireControlMapping[] {
  return input.questions.map((question) => {
    const scored = input.controls
      .map((control) => ({
        control,
        score: scoreQuestionControlMatch(question, control),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return {
      controlIds: scored.map((item) => item.control.controlId),
      controlKeys: scored.map((item) => item.control.controlKey),
      question,
    };
  });
}

export function getQuestionnaireAnswerConfidence(input: {
  evidenceCount: number;
  mappedControlCount: number;
  policyCount: number;
}): QuestionnaireAnswerConfidence {
  if (input.mappedControlCount === 0) {
    return "no-context";
  }

  if (input.evidenceCount > 0) {
    return "supported";
  }

  if (input.policyCount > 0) {
    return "partial";
  }

  return "no-context";
}

function scoreQuestionControlMatch(
  question: string,
  control: QuestionnaireContextControl,
) {
  const haystack = normalizeText([
    question,
  ].join(" "));
  const controlText = normalizeText([
    control.controlKey,
    control.title,
    control.description,
    control.notes,
  ].filter(Boolean).join(" "));
  const titleTokens = tokenize(control.title);
  const keyTokens = tokenize(control.controlKey.replace(/^ctrl_/, ""));
  const hints = CONTROL_KEY_HINTS[control.controlKey] ?? [];
  let score = 0;

  for (const token of [...titleTokens, ...keyTokens]) {
    if (token.length >= 4 && haystack.includes(token)) {
      score += 2;
    }
  }

  for (const hint of hints) {
    if (haystack.includes(normalizeText(hint))) {
      score += 3;
    }
  }

  for (const group of Object.values(CONTROL_KEYWORDS)) {
    const questionMatches = group.filter((keyword) => haystack.includes(normalizeText(keyword))).length;
    const controlMatches = group.filter((keyword) => controlText.includes(normalizeText(keyword))).length;
    if (questionMatches > 0 && controlMatches > 0) {
      score += Math.min(questionMatches, controlMatches);
    }
  }

  return score;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, " ").replace(/\s+/g, " ").trim();
}

function tokenize(value: string) {
  return normalizeText(value).split(" ").filter(Boolean);
}
