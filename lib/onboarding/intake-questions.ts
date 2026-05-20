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
  "accountingPlatform",
] as const;

export type IntakeQuestionKey = (typeof INTAKE_QUESTION_KEYS)[number];

export type IntakeOption = {
  value: string;
};

export type IntakeQuestion = {
  key: IntakeQuestionKey;
  options?: readonly IntakeOption[];
  required: boolean;
  type: "boolean" | "single_choice";
};

export const BUSINESS_MODEL_OPTIONS = [
  { value: "professional_services" },
  { value: "saas" },
  { value: "physical_operations" },
  { value: "regulated_service" },
] as const satisfies readonly IntakeOption[];

export const SECTOR_OPTIONS = [
  { value: "professional_services" },
  { value: "technology" },
  { value: "manufacturing" },
  { value: "healthcare" },
  { value: "other" },
] as const satisfies readonly IntakeOption[];

export const EMPLOYEE_BAND_OPTIONS = [
  { value: "1_9" },
  { value: "10_49" },
  { value: "50_249" },
  { value: "250_plus" },
] as const satisfies readonly IntakeOption[];

export const PERSONAL_DATA_OPTIONS = [
  { value: "none" },
  { value: "employees_only" },
  { value: "customers_and_employees" },
] as const satisfies readonly IntakeOption[];

export const PROCESSOR_USAGE_OPTIONS = [
  { value: "none" },
  { value: "few" },
  { value: "many" },
] as const satisfies readonly IntakeOption[];

export const AI_USAGE_OPTIONS = [
  { value: "none" },
  { value: "internal_productivity" },
  { value: "customer_or_patient_facing" },
] as const satisfies readonly IntakeOption[];

export const ACCOUNTING_PLATFORM_OPTIONS = [
  { value: "pohoda" },
  { value: "money_s3" },
  { value: "helios" },
  { value: "other" },
  { value: "none" },
] as const satisfies readonly IntakeOption[];

export const INTAKE_QUESTIONS = [
  {
    key: "businessModel",
    required: true,
    type: "single_choice",
    options: BUSINESS_MODEL_OPTIONS,
  },
  {
    key: "sector",
    required: true,
    type: "single_choice",
    options: SECTOR_OPTIONS,
  },
  {
    key: "employeeBand",
    required: true,
    type: "single_choice",
    options: EMPLOYEE_BAND_OPTIONS,
  },
  {
    key: "handlesPersonalData",
    required: true,
    type: "single_choice",
    options: PERSONAL_DATA_OPTIONS,
  },
  {
    key: "handlesSensitiveData",
    required: true,
    type: "boolean",
  },
  {
    key: "usesCloudHosting",
    required: true,
    type: "boolean",
  },
  {
    key: "hasPublicApp",
    required: true,
    type: "boolean",
  },
  {
    key: "hasProductionSoftware",
    required: true,
    type: "boolean",
  },
  {
    key: "hasCriticalOperations",
    required: true,
    type: "boolean",
  },
  {
    key: "usesThirdPartyProcessors",
    required: true,
    type: "single_choice",
    options: PROCESSOR_USAGE_OPTIONS,
  },
  {
    key: "usesAiSystems",
    required: true,
    type: "single_choice",
    options: AI_USAGE_OPTIONS,
  },
  {
    key: "usesHighRiskAi",
    required: true,
    type: "boolean",
  },
  {
    key: "accountingPlatform",
    required: false,
    type: "single_choice",
    options: ACCOUNTING_PLATFORM_OPTIONS,
  },
] as const satisfies readonly IntakeQuestion[];

export const DEFAULT_INTAKE_FRAMEWORKS: FrameworkSlug[] = [
  "nis2",
  "gdpr",
  "iso27001",
];
