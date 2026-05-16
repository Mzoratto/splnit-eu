import { CZ_POLICY_TEMPLATES } from "@/lib/policies/policy-template-data/cz";
import { EU_POLICY_TEMPLATES } from "@/lib/policies/policy-template-data/eu";
import { IT_POLICY_TEMPLATES } from "@/lib/policies/policy-template-data/it";
import type { PolicyTemplate } from "@/lib/policies/policy-template-types";

export { POLICY_TEMPLATE_TYPES, isPolicyTemplateType } from "@/lib/policies/policy-template-types";
export type {
  DraftPolicyTemplateFamily,
  PolicyTemplate,
  PolicyTemplateFamily,
  PolicyTemplateType,
} from "@/lib/policies/policy-template-types";

export const POLICY_TEMPLATES: PolicyTemplate[] = [
  ...CZ_POLICY_TEMPLATES,
  ...EU_POLICY_TEMPLATES,
  ...IT_POLICY_TEMPLATES,
];
