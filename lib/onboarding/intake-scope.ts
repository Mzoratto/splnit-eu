import { CONTROL_LIBRARY, type FrameworkSlug } from "@/lib/controls/library";
import { INTAKE_PROFILE_VERSION } from "@/lib/onboarding/intake-questions";

export type BusinessModel =
  | "professional_services"
  | "saas"
  | "physical_operations"
  | "regulated_service";

export type IntakeSector =
  | "professional_services"
  | "technology"
  | "manufacturing"
  | "healthcare"
  | "other";

export type EmployeeBand = "1_9" | "10_49" | "50_249" | "250_plus";
export type PersonalDataScope = "none" | "employees_only" | "customers_and_employees";
export type ThirdPartyProcessorUse = "none" | "few" | "many";
export type AiSystemUse = "none" | "internal_productivity" | "customer_or_patient_facing";
export type AccountingPlatform = "pohoda" | "money_s3" | "helios" | "other" | "none";

export type IntakeAnswers = {
  accountingPlatform?: AccountingPlatform;
  businessModel: BusinessModel;
  employeeBand: EmployeeBand;
  handlesPersonalData: PersonalDataScope;
  handlesSensitiveData: boolean;
  hasCriticalOperations: boolean;
  hasProductionSoftware: boolean;
  hasPublicApp: boolean;
  sector: IntakeSector;
  usesAiSystems: AiSystemUse;
  usesCloudHosting: boolean;
  usesHighRiskAi: boolean;
  usesThirdPartyProcessors: ThirdPartyProcessorUse;
};

export type IntakeRationaleCategory =
  | "ai_governance"
  | "baseline_security"
  | "business_continuity"
  | "cloud_security"
  | "critical_operations"
  | "data_protection"
  | "framework_selection"
  | "software_delivery"
  | "supplier_risk";

export type DerivedScopeControlStatus = "applicable" | "not_applicable" | "out_of_scope";

export type WorkspaceRecommendation = {
  platformKey: string;
  label: string;
  reason: string;
};

export type DerivedScopeControl = {
  category: IntakeRationaleCategory;
  controlKey: string;
  rationale: string;
  recommendedInitialStatus: "unknown" | "manual_review" | "fail";
  scopeStatus: DerivedScopeControlStatus;
};

export type IntakeDerivedScope = {
  applicableControlKeys: string[];
  controls: DerivedScopeControl[];
  failControlKeys: string[];
  manualReviewControlKeys: string[];
  notApplicableControlKeys: string[];
  outOfScopeControlKeys: string[];
  priorityControlKeys: string[];
  rationaleCategories: Record<string, IntakeRationaleCategory>;
  rationales: Record<string, string>;
  selectedFrameworks: FrameworkSlug[];
  version: number;
  workspaceRecommendations: WorkspaceRecommendation[];
};

export type DeriveIntakeScopeInput = {
  answers: IntakeAnswers;
  selectedFrameworks: FrameworkSlug[];
  selectedTools?: string[];
};

type ControlDraft = {
  category: IntakeRationaleCategory;
  controlKey: string;
  priority: boolean;
  rationale: string;
  recommendedInitialStatus: "unknown" | "manual_review" | "fail";
  scopeStatus: DerivedScopeControlStatus;
};

const BASELINE_CONTROLS = [
  "ctrl_mfa_all_users",
  "ctrl_security_training_annual",
  "ctrl_incident_plan_documented",
  "ctrl_backup_tested",
  "ctrl_asset_inventory",
] as const;

const CONTROL_KEYS = new Set(CONTROL_LIBRARY.map((control) => control.key));

export function deriveIntakeScope(input: DeriveIntakeScopeInput): IntakeDerivedScope {
  const selectedFrameworks = unique(input.selectedFrameworks);
  const selectedTools = input.selectedTools ?? [];
  const drafts = new Map<string, ControlDraft>();

  const add = (
    controlKey: string,
    category: IntakeRationaleCategory,
    rationale: string,
    options?: {
      priority?: boolean;
      status?: "unknown" | "manual_review" | "fail";
    },
  ) => {
    if (!CONTROL_KEYS.has(controlKey) || !isMappedToSelectedFramework(controlKey, selectedFrameworks)) {
      return;
    }

    const existing = drafts.get(controlKey);
    const priority = options?.priority ?? false;
    const status = options?.status ?? "unknown";

    if (!existing) {
      drafts.set(controlKey, {
        category,
        controlKey,
        priority,
        rationale,
        recommendedInitialStatus: status,
        scopeStatus: "applicable",
      });
      return;
    }

    drafts.set(controlKey, {
      ...existing,
      priority: existing.priority || priority,
      recommendedInitialStatus: strongestStatus(existing.recommendedInitialStatus, status),
      rationale: mergeRationales(existing.rationale, rationale),
    });
  };

  for (const controlKey of BASELINE_CONTROLS) {
    add(
      controlKey,
      "baseline_security",
      "Baseline readiness control for selected security and privacy frameworks.",
      { priority: isPriorityBaselineControl(controlKey), status: "fail" },
    );
  }

  add("ctrl_privileged_access_reviewed", "baseline_security", "Privileged access review is a conservative baseline for SME readiness.", { priority: true, status: "manual_review" });
  add("ctrl_guest_access_controlled", "baseline_security", "External and guest access needs review when collaboration tools or processors are in scope.");

  if (input.answers.handlesPersonalData !== "none") {
    add("ctrl_data_processing_inventory", "data_protection", "The organisation handles personal data, so processing records should be established.", { priority: true, status: "manual_review" });
    add("ctrl_privacy_notice_current", "data_protection", "The organisation handles personal data, so privacy notices should be current.", { priority: true, status: "manual_review" });
    add("ctrl_dsr_process", "data_protection", "The organisation handles personal data, so data subject request handling should be defined.", { status: "manual_review" });
    add("ctrl_data_retention_schedule", "data_protection", "Personal data handling requires retention rules and deletion responsibilities.", { status: "manual_review" });
    add("ctrl_incident_72h_notification", "data_protection", "Personal data breaches may trigger statutory notification timelines.", { priority: input.answers.handlesSensitiveData, status: "manual_review" });
  }

  if (input.answers.handlesSensitiveData || input.answers.sector === "healthcare") {
    add("ctrl_dpia_process", "data_protection", "Sensitive data or healthcare context requires manual DPIA screening.", { priority: true, status: "manual_review" });
    add("ctrl_data_encrypted_at_rest", "data_protection", "Sensitive data should be protected with encryption at rest.", { priority: true, status: "fail" });
    add("ctrl_data_classification", "data_protection", "Sensitive data requires classification before evidence collection can be trusted.", { priority: true, status: "manual_review" });
    add("ctrl_cryptography_policy", "data_protection", "Sensitive data handling requires documented cryptography expectations.", { status: "manual_review" });
  }

  if (input.answers.usesThirdPartyProcessors !== "none" || selectedTools.length > 0) {
    add("ctrl_vendor_security_assessment", "supplier_risk", "Third-party processors or business tools are in use, so supplier risk review applies.", { priority: input.answers.usesThirdPartyProcessors === "many", status: "manual_review" });
    add("ctrl_supplier_contract_security", "supplier_risk", "Processor and supplier contracts should contain security and data-protection requirements.", { priority: input.answers.usesThirdPartyProcessors === "many", status: "manual_review" });
  }

  if (input.answers.usesThirdPartyProcessors === "many") {
    add("ctrl_supplier_monitoring", "supplier_risk", "Many or critical vendors require ongoing review, not just purchase-time assessment.", { status: "manual_review" });
  }

  if (input.answers.usesCloudHosting) {
    add("ctrl_cloudtrail_enabled", "cloud_security", "Cloud hosting requires audit logging for administrator and security events.", { priority: true, status: "fail" });
    add("ctrl_s3_encryption", "cloud_security", "Cloud storage with business or personal data should enforce encryption and block public access.", { priority: true, status: "fail" });
    add("ctrl_root_account_mfa", "cloud_security", "Cloud root or break-glass accounts should have MFA and monitoring.", { priority: true, status: "fail" });
    add("ctrl_secure_configuration_baseline", "cloud_security", "Cloud services should start from documented secure configuration baselines.", { status: "manual_review" });
  }

  if (input.answers.hasPublicApp || input.answers.hasProductionSoftware) {
    add("ctrl_code_review_required", "software_delivery", "Production software changes need review before release.", { priority: input.answers.hasProductionSoftware, status: "manual_review" });
    add("ctrl_dependency_vulnerability_monitoring", "software_delivery", "Software delivery introduces dependency vulnerability risk.", { priority: true, status: "fail" });
    add("ctrl_change_management", "software_delivery", "Production changes should have ownership, approval, and rollback expectations.", { status: "manual_review" });
    add("ctrl_secure_development_policy", "software_delivery", "Software delivery should be governed by secure development rules.", { status: "manual_review" });
  }

  if (input.answers.hasPublicApp) {
    add("ctrl_penetration_test_annual", "software_delivery", "Public apps, portals, and APIs need periodic external security testing.", { priority: true, status: "manual_review" });
    add("ctrl_vulnerability_management", "software_delivery", "Public exposure requires tracked vulnerability remediation.", { priority: true, status: "manual_review" });
  }

  if (input.answers.hasCriticalOperations || input.answers.businessModel === "physical_operations") {
    add("ctrl_business_continuity_plan", "critical_operations", "Critical operations require a documented continuity plan.", { priority: true, status: "manual_review" });
    add("ctrl_disaster_recovery_test", "critical_operations", "Critical operations need tested recovery procedures.", { priority: true, status: "manual_review" });
    add("ctrl_network_segmentation", "critical_operations", "Critical operations should be separated by network segment and access rules.", { priority: true, status: "manual_review" });
    add("ctrl_endpoint_protection", "critical_operations", "Critical operations depend on protected managed endpoints.", { priority: true, status: "fail" });
    add("ctrl_patch_management", "critical_operations", "Critical operations require tracked security patching.", { priority: true, status: "fail" });
  }

  if (input.answers.businessModel === "physical_operations" || input.answers.sector === "manufacturing") {
    add("ctrl_physical_access_control", "critical_operations", "Physical operations and manufacturing need basic workplace and facility access controls.", { status: "manual_review" });
    add("ctrl_media_disposal", "data_protection", "Physical devices and media should be securely disposed when retired.");
  }

  if (input.answers.usesCloudHosting || input.answers.hasPublicApp || input.answers.hasCriticalOperations) {
    add("ctrl_logging_monitoring", "cloud_security", "Cloud, public, or critical systems need centralized security logging.", { priority: true, status: "fail" });
    add("ctrl_security_event_alerting", "cloud_security", "Security events should generate alerts for responsible owners.", { priority: true, status: "fail" });
  }

  if (input.answers.usesAiSystems !== "none") {
    add("ctrl_ai_system_inventory", "ai_governance", "AI systems are used, so an AI inventory is needed for readiness tracking.", { priority: selectedFrameworks.includes("ai-act"), status: "manual_review" });
    add("ctrl_ai_literacy_training", "ai_governance", "Staff using AI systems need AI literacy training.", { status: "manual_review" });
    add("ctrl_ai_prohibited_practices_review", "ai_governance", "AI use should be checked for prohibited-practice exposure.", { status: "manual_review" });
  }

  if (input.answers.usesHighRiskAi || input.answers.usesAiSystems === "customer_or_patient_facing") {
    add("ctrl_ai_high_risk_provider_verification", "ai_governance", "Possible high-risk or people-impacting AI use requires provider compliance verification.", { priority: true, status: "manual_review" });
    add("ctrl_ai_human_oversight", "ai_governance", "Possible high-risk AI use requires human oversight review.", { priority: true, status: "manual_review" });
    add("ctrl_ai_log_retention", "ai_governance", "Possible high-risk AI use requires log-retention review.", { status: "manual_review" });
    add("ctrl_ai_individual_notice", "ai_governance", "People affected by AI-assisted decisions may need notice.", { status: "manual_review" });
  }

  // Derive workspace recommendations from accounting platform selection.
  const workspaceRecommendations: WorkspaceRecommendation[] = deriveWorkspaceRecommendations(input.answers);

  const controls = [...drafts.values()]
    .filter((draft) => isMappedToSelectedFramework(draft.controlKey, selectedFrameworks))
    .sort(compareControlDrafts)
    .map((draft) => ({ ...draft }));

  const applicableControlKeys = controls.map((control) => control.controlKey);
  const notApplicableControlKeys = deriveNotApplicableControlKeys(input.answers, selectedFrameworks, applicableControlKeys);
  const outOfScopeControlKeys = deriveOutOfScopeControlKeys(selectedFrameworks, applicableControlKeys, notApplicableControlKeys);
  const rationales = Object.fromEntries(controls.map((control) => [control.controlKey, control.rationale]));
  const rationaleCategories = Object.fromEntries(controls.map((control) => [control.controlKey, control.category]));

  for (const controlKey of notApplicableControlKeys) {
    rationales[controlKey] = getNotApplicableRationale(controlKey, input.answers);
    rationaleCategories[controlKey] = "ai_governance";
  }

  for (const controlKey of outOfScopeControlKeys) {
    rationales[controlKey] = "Control is not mapped to the frameworks selected for this first readiness scope.";
    rationaleCategories[controlKey] = "framework_selection";
  }

  return {
    applicableControlKeys,
    controls,
    failControlKeys: controls
      .filter((control) => control.recommendedInitialStatus === "fail")
      .map((control) => control.controlKey),
    manualReviewControlKeys: controls
      .filter((control) => control.recommendedInitialStatus === "manual_review")
      .map((control) => control.controlKey),
    notApplicableControlKeys,
    outOfScopeControlKeys,
    priorityControlKeys: controls.filter((control) => control.priority).map((control) => control.controlKey),
    rationaleCategories,
    rationales,
    selectedFrameworks,
    version: INTAKE_PROFILE_VERSION,
    workspaceRecommendations,
  };
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function deriveWorkspaceRecommendations(answers: IntakeAnswers): WorkspaceRecommendation[] {
  const recommendations: WorkspaceRecommendation[] = [];

  if (answers.accountingPlatform === "pohoda") {
    recommendations.push({
      platformKey: "pohoda",
      label: "Pohoda",
      reason: "Používáte Pohoda — doporučujeme propojit účetní data se sadou NIS2 kontrol specifických pro Pohoda (zálohování dat, přístup k mServeru, API credentials).",
    });
  }

  if (answers.accountingPlatform === "money_s3") {
    recommendations.push({
      platformKey: "money_s3",
      label: "Money S3 / S4 (Seyfor)",
      reason: "Používáte Money S3 / S4 — doporučujeme projít sadou NIS2/ZoKB kontrol specifických pro Money S3 (zálohy databáze, přístupy, SQL Server konfigurace, API connectivity).",
    });
  }

  if (answers.accountingPlatform === "helios") {
    recommendations.push({
      platformKey: "helios",
      label: "Helios (Asseco)",
      reason: "Používáte Helios — doporučujeme projít sadou NIS2/ZoKB kontrol specifických pro Helios (SQL Server zálohy, přístupy, MES/SCADA integrace, EDI zabezpečení).",
    });
  }

  return recommendations;
}

function isMappedToSelectedFramework(controlKey: string, selectedFrameworks: readonly FrameworkSlug[]) {
  if (selectedFrameworks.length === 0) {
    return false;
  }

  const control = CONTROL_LIBRARY.find((entry) => entry.key === controlKey);
  if (!control) {
    return false;
  }

  return control.frameworkMappings.some((mapping) => selectedFrameworks.includes(mapping.frameworkSlug));
}

function isPriorityBaselineControl(controlKey: string) {
  return ["ctrl_mfa_all_users", "ctrl_incident_plan_documented", "ctrl_backup_tested"].includes(controlKey);
}

function strongestStatus(
  current: "unknown" | "manual_review" | "fail",
  next: "unknown" | "manual_review" | "fail",
) {
  const rank = { unknown: 0, manual_review: 1, fail: 2 };
  return rank[next] > rank[current] ? next : current;
}

function mergeRationales(current: string, next: string) {
  if (current === next || current.includes(next)) {
    return current;
  }

  return `${current} ${next}`;
}

function compareControlDrafts(a: ControlDraft, b: ControlDraft) {
  if (a.priority !== b.priority) {
    return a.priority ? -1 : 1;
  }

  return a.controlKey.localeCompare(b.controlKey);
}

function deriveNotApplicableControlKeys(
  answers: IntakeAnswers,
  selectedFrameworks: readonly FrameworkSlug[],
  applicableControlKeys: readonly string[],
) {
  const keys: string[] = [];
  const aiControlKeys = [
    "ctrl_ai_system_inventory",
    "ctrl_ai_literacy_training",
    "ctrl_ai_prohibited_practices_review",
    "ctrl_ai_high_risk_provider_verification",
    "ctrl_ai_human_oversight",
    "ctrl_ai_log_retention",
    "ctrl_ai_individual_notice",
    "ctrl_ai_content_labeling",
  ];

  for (const key of aiControlKeys) {
    if (
      applicableControlKeys.includes(key) ||
      !isMappedToSelectedFramework(key, selectedFrameworks)
    ) {
      continue;
    }

    if (answers.usesAiSystems === "none" || isHighRiskAiOnlyControl(key)) {
      keys.push(key);
    }
  }

  return unique(keys).sort();
}

function isHighRiskAiOnlyControl(controlKey: string) {
  return [
    "ctrl_ai_high_risk_provider_verification",
    "ctrl_ai_human_oversight",
    "ctrl_ai_log_retention",
    "ctrl_ai_individual_notice",
  ].includes(controlKey);
}

function deriveOutOfScopeControlKeys(
  selectedFrameworks: readonly FrameworkSlug[],
  applicableControlKeys: readonly string[],
  notApplicableControlKeys: readonly string[],
) {
  const scoped = new Set([...applicableControlKeys, ...notApplicableControlKeys]);

  return CONTROL_LIBRARY.filter((control) => {
    if (scoped.has(control.key)) {
      return false;
    }

    return control.frameworkMappings.some((mapping) => selectedFrameworks.includes(mapping.frameworkSlug));
  })
    .map((control) => control.key)
    .sort();
}

function getNotApplicableRationale(controlKey: string, answers: IntakeAnswers) {
  if (isHighRiskAiOnlyControl(controlKey)) {
    return answers.usesHighRiskAi
      ? "Possible high-risk AI was not selected for this control's selected framework scope."
      : "No high-risk or people-impacting AI use was identified in the intake.";
  }

  return "No AI system use was identified in the intake.";
}
