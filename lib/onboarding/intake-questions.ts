import type { FrameworkSlug } from "@/lib/controls/library";

export const INTAKE_PROFILE_VERSION = 1;

export const INTAKE_QUESTION_KEYS = [
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
] as const;

export type IntakeQuestionKey = (typeof INTAKE_QUESTION_KEYS)[number];

export type IntakeOption = {
  label: string;
  value: string;
};

export type IntakeQuestion = {
  helpText: string;
  key: IntakeQuestionKey;
  label: string;
  options?: readonly IntakeOption[];
  required: boolean;
  type: "boolean" | "single_choice";
};

export const BUSINESS_MODEL_OPTIONS = [
  { value: "professional_services", label: "Professional services" },
  { value: "saas", label: "SaaS or online product" },
  { value: "physical_operations", label: "Physical operations" },
  { value: "regulated_service", label: "Regulated or essential service" },
] as const satisfies readonly IntakeOption[];

export const SECTOR_OPTIONS = [
  { value: "professional_services", label: "Professional services" },
  { value: "technology", label: "Technology / software" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "healthcare", label: "Healthcare / sensitive care" },
  { value: "other", label: "Other SME" },
] as const satisfies readonly IntakeOption[];

export const EMPLOYEE_BAND_OPTIONS = [
  { value: "1_9", label: "1-9" },
  { value: "10_49", label: "10-49" },
  { value: "50_249", label: "50-249" },
  { value: "250_plus", label: "250+" },
] as const satisfies readonly IntakeOption[];

export const PERSONAL_DATA_OPTIONS = [
  { value: "none", label: "No personal data beyond business contacts" },
  { value: "employees_only", label: "Employees / contractors only" },
  { value: "customers_and_employees", label: "Customers and employees" },
] as const satisfies readonly IntakeOption[];

export const PROCESSOR_USAGE_OPTIONS = [
  { value: "none", label: "No material processors" },
  { value: "few", label: "A few processors / vendors" },
  { value: "many", label: "Many processors or critical vendors" },
] as const satisfies readonly IntakeOption[];

export const AI_USAGE_OPTIONS = [
  { value: "none", label: "No AI systems" },
  { value: "internal_productivity", label: "Internal productivity AI only" },
  { value: "customer_or_patient_facing", label: "Customer, patient, or decision-support AI" },
] as const satisfies readonly IntakeOption[];

export const INTAKE_QUESTIONS = [
  {
    key: "businessModel",
    label: "Which business model best fits this organisation?",
    helpText: "Used only for readiness scoping; it is not a legal classification.",
    required: true,
    type: "single_choice",
    options: BUSINESS_MODEL_OPTIONS,
  },
  {
    key: "sector",
    label: "Which sector is closest?",
    helpText: "Conservative sector signal for priority controls.",
    required: true,
    type: "single_choice",
    options: SECTOR_OPTIONS,
  },
  {
    key: "employeeBand",
    label: "How many people work in the organisation?",
    helpText: "Broad band only; no exact headcount is needed.",
    required: true,
    type: "single_choice",
    options: EMPLOYEE_BAND_OPTIONS,
  },
  {
    key: "handlesPersonalData",
    label: "What personal data does the organisation handle?",
    helpText: "This drives GDPR readiness tasks and privacy evidence priorities.",
    required: true,
    type: "single_choice",
    options: PERSONAL_DATA_OPTIONS,
  },
  {
    key: "handlesSensitiveData",
    label: "Does it handle sensitive, health, financial, or high-risk data?",
    helpText: "A yes answer adds conservative privacy and encryption review tasks.",
    required: true,
    type: "boolean",
  },
  {
    key: "usesCloudHosting",
    label: "Does it use cloud hosting or object storage for business systems?",
    helpText: "Cloud use adds logging, encryption, and root-account controls.",
    required: true,
    type: "boolean",
  },
  {
    key: "hasPublicApp",
    label: "Does it operate a public app, portal, API, or customer-facing system?",
    helpText: "Public exposure adds vulnerability and testing priorities.",
    required: true,
    type: "boolean",
  },
  {
    key: "hasProductionSoftware",
    label: "Does it build or deploy production software?",
    helpText: "Software delivery adds code review, dependency, and change controls.",
    required: true,
    type: "boolean",
  },
  {
    key: "hasCriticalOperations",
    label: "Would downtime materially disrupt customers, patients, or production?",
    helpText: "Critical operations add continuity, recovery, and segmentation priorities.",
    required: true,
    type: "boolean",
  },
  {
    key: "usesThirdPartyProcessors",
    label: "How much does it rely on external processors or critical vendors?",
    helpText: "Vendor reliance drives supplier review and contract controls.",
    required: true,
    type: "single_choice",
    options: PROCESSOR_USAGE_OPTIONS,
  },
  {
    key: "usesAiSystems",
    label: "How are AI systems used?",
    helpText: "AI answers scope governance tasks; AI does not decide legal applicability.",
    required: true,
    type: "single_choice",
    options: AI_USAGE_OPTIONS,
  },
  {
    key: "usesHighRiskAi",
    label: "Could any AI use affect people in health, employment, credit, education, or access to services?",
    helpText: "A yes answer adds manual review tasks for possible high-risk AI use.",
    required: true,
    type: "boolean",
  },
] as const satisfies readonly IntakeQuestion[];

export const DEFAULT_INTAKE_FRAMEWORKS: FrameworkSlug[] = [
  "nis2",
  "gdpr",
  "iso27001",
];
