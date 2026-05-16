export type PolicyTemplateType =
  | "ai_policy"
  | "security_policy"
  | "gdpr_privacy_notice"
  | "training_log"
  | "record_of_use"
  | "incident_response";

export type DraftPolicyTemplateFamily =
  | "record_of_processing"
  | "dpia"
  | "data_processing_agreement"
  | "subprocessor_list"
  | "asset_inventory"
  | "risk_assessment"
  | "acceptable_use"
  | "vendor_questionnaire"
  | "business_continuity"
  | "access_control";

export type PolicyTemplateFamily =
  | PolicyTemplateType
  | DraftPolicyTemplateFamily;

export const POLICY_TEMPLATE_TYPES = [
  "ai_policy",
  "security_policy",
  "gdpr_privacy_notice",
  "training_log",
  "record_of_use",
  "incident_response",
] as const satisfies readonly PolicyTemplateType[];

export function isPolicyTemplateType(value: string): value is PolicyTemplateType {
  return POLICY_TEMPLATE_TYPES.includes(value as PolicyTemplateType);
}

export type PolicyTemplate = {
  type: PolicyTemplateFamily;
  templateFamily: PolicyTemplateFamily;
  jurisdiction: "CZ" | "EU" | "IT";
  locale: "cs-CZ" | "en-EU" | "it-IT";
  reviewStatus?: "draft" | "reviewed";
  titleCs: string;
  description: string;
  sourceDocument: string;
  controlKeys: string[];
  sections: {
    title: string;
    fields?: string[];
    body?: string;
  }[];
};
