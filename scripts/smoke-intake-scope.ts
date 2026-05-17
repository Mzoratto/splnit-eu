import assert from "node:assert/strict";
import {
  deriveIntakeScope,
  type IntakeAnswers,
} from "../lib/onboarding/intake-scope";
import { INTAKE_QUESTIONS } from "../lib/onboarding/intake-questions";

function assertIncludes(
  actual: readonly string[],
  expected: readonly string[],
  message: string,
) {
  for (const key of expected) {
    assert.ok(actual.includes(key), `${message}: missing ${key}`);
  }
}

function assertExcludes(
  actual: readonly string[],
  excluded: readonly string[],
  message: string,
) {
  for (const key of excluded) {
    assert.ok(!actual.includes(key), `${message}: should not include ${key}`);
  }
}

assert.equal(INTAKE_QUESTIONS.length, 12);
assert.deepEqual(
  INTAKE_QUESTIONS.map((question) => question.key),
  [
    "businessModel",
    "sector",
    "employeeBand",
    "handlesPersonalData",
    "handlesSensitiveData",
    "usesCloudHosting",
    "hasPublicApp",
    "hasProductionSoftware",
    "hasCriticalOperations",
    "usesThirdPartyProcessors",
    "usesAiSystems",
    "usesHighRiskAi",
  ],
);

const tinyProfessionalServices: IntakeAnswers = {
  businessModel: "professional_services",
  sector: "professional_services",
  employeeBand: "1_9",
  handlesPersonalData: "employees_only",
  handlesSensitiveData: false,
  usesCloudHosting: false,
  hasPublicApp: false,
  hasProductionSoftware: false,
  hasCriticalOperations: false,
  usesThirdPartyProcessors: "few",
  usesAiSystems: "none",
  usesHighRiskAi: false,
};

const tinyScope = deriveIntakeScope({
  answers: tinyProfessionalServices,
  selectedFrameworks: ["gdpr", "iso27001"],
  selectedTools: ["deepl"],
});
assertIncludes(
  tinyScope.applicableControlKeys,
  [
    "ctrl_mfa_all_users",
    "ctrl_security_training_annual",
    "ctrl_data_processing_inventory",
    "ctrl_privacy_notice_current",
    "ctrl_dsr_process",
  ],
  "tiny professional-services SME",
);
assertIncludes(
  tinyScope.notApplicableControlKeys,
  ["ctrl_ai_high_risk_provider_verification", "ctrl_ai_human_oversight"],
  "tiny professional-services SME",
);
assertExcludes(
  tinyScope.priorityControlKeys,
  ["ctrl_cloudtrail_enabled", "ctrl_s3_encryption", "ctrl_network_segmentation"],
  "tiny professional-services SME",
);
assert.match(tinyScope.rationales.ctrl_data_processing_inventory, /personal data/i);

const saas: IntakeAnswers = {
  businessModel: "saas",
  sector: "technology",
  employeeBand: "10_49",
  handlesPersonalData: "customers_and_employees",
  handlesSensitiveData: false,
  usesCloudHosting: true,
  hasPublicApp: true,
  hasProductionSoftware: true,
  hasCriticalOperations: false,
  usesThirdPartyProcessors: "many",
  usesAiSystems: "internal_productivity",
  usesHighRiskAi: false,
};
const saasScope = deriveIntakeScope({
  answers: saas,
  selectedFrameworks: ["nis2", "gdpr", "iso27001", "ai-act"],
  selectedTools: ["github-copilot", "hubspot", "intercom"],
});
assertIncludes(
  saasScope.applicableControlKeys,
  [
    "ctrl_cloudtrail_enabled",
    "ctrl_s3_encryption",
    "ctrl_code_review_required",
    "ctrl_dependency_vulnerability_monitoring",
    "ctrl_penetration_test_annual",
    "ctrl_supplier_contract_security",
    "ctrl_ai_system_inventory",
    "ctrl_ai_literacy_training",
  ],
  "cloud SaaS",
);
assertIncludes(saasScope.priorityControlKeys, ["ctrl_mfa_all_users", "ctrl_backup_tested", "ctrl_logging_monitoring"], "cloud SaaS");
assertIncludes(saasScope.notApplicableControlKeys, ["ctrl_ai_high_risk_provider_verification"], "cloud SaaS");
assert.match(saasScope.rationales.ctrl_cloudtrail_enabled, /cloud/i);

const manufacturing: IntakeAnswers = {
  businessModel: "physical_operations",
  sector: "manufacturing",
  employeeBand: "50_249",
  handlesPersonalData: "employees_only",
  handlesSensitiveData: false,
  usesCloudHosting: false,
  hasPublicApp: false,
  hasProductionSoftware: false,
  hasCriticalOperations: true,
  usesThirdPartyProcessors: "few",
  usesAiSystems: "none",
  usesHighRiskAi: false,
};
const manufacturingScope = deriveIntakeScope({
  answers: manufacturing,
  selectedFrameworks: ["nis2", "iso27001"],
  selectedTools: [],
});
assertIncludes(
  manufacturingScope.applicableControlKeys,
  [
    "ctrl_business_continuity_plan",
    "ctrl_disaster_recovery_test",
    "ctrl_network_segmentation",
    "ctrl_physical_access_control",
    "ctrl_endpoint_protection",
    "ctrl_patch_management",
  ],
  "manufacturing SME",
);
assert.match(manufacturingScope.rationales.ctrl_network_segmentation, /critical operations/i);

const healthcare: IntakeAnswers = {
  businessModel: "regulated_service",
  sector: "healthcare",
  employeeBand: "10_49",
  handlesPersonalData: "customers_and_employees",
  handlesSensitiveData: true,
  usesCloudHosting: true,
  hasPublicApp: false,
  hasProductionSoftware: false,
  hasCriticalOperations: true,
  usesThirdPartyProcessors: "many",
  usesAiSystems: "customer_or_patient_facing",
  usesHighRiskAi: true,
};
const healthcareScope = deriveIntakeScope({
  answers: healthcare,
  selectedFrameworks: ["nis2", "gdpr", "iso27001", "ai-act"],
  selectedTools: ["microsoft-copilot", "salesforce"],
});
assertIncludes(
  healthcareScope.applicableControlKeys,
  [
    "ctrl_dpia_process",
    "ctrl_data_encrypted_at_rest",
    "ctrl_data_classification",
    "ctrl_incident_72h_notification",
    "ctrl_ai_high_risk_provider_verification",
    "ctrl_ai_human_oversight",
    "ctrl_ai_log_retention",
    "ctrl_ai_individual_notice",
  ],
  "healthcare/sensitive-data SME",
);
assertIncludes(healthcareScope.manualReviewControlKeys, ["ctrl_dpia_process", "ctrl_ai_high_risk_provider_verification"], "healthcare/sensitive-data SME");
assert.match(healthcareScope.rationales.ctrl_dpia_process, /sensitive data/i);
assert.equal(healthcareScope.version, 1);

console.log("Intake scope smoke passed.");
