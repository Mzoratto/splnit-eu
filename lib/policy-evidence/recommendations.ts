import type { PolicyTemplateType } from "../policies/policy-template-types";

export type PolicyEvidenceRecommendation = {
  controlKey: string;
  evidenceAction: string;
  humanReviewAction: string;
  policyAction: string;
  policyHref: string;
  policyType: PolicyTemplateType;
  summary: string;
  title: string;
};

const SECURITY_POLICY_HREF = "/policies/security_policy";
const SECURITY_POLICY_TYPE = "security_policy";
const RECOMMENDATION_TITLE = "Recommended next action";
const HUMAN_REVIEW_ACTION =
  "After reviewing the evidence and policy support, update the control status manually.";

const POLICY_EVIDENCE_RECOMMENDATIONS: Readonly<Record<string, PolicyEvidenceRecommendation>> = {
  ctrl_backup_tested: {
    controlKey: "ctrl_backup_tested",
    evidenceAction:
      "Add a backup job report and restore-test record showing tested scope, result, date, owner, and follow-up actions for failed tests.",
    humanReviewAction: HUMAN_REVIEW_ACTION,
    policyAction:
      "Use the security policy to document backup ownership, restore-test cadence, exception handling, and follow-up expectations. A policy supports the review, but it does not prove the control by itself.",
    policyHref: SECURITY_POLICY_HREF,
    policyType: SECURITY_POLICY_TYPE,
    summary:
      "Prepare the backup-testing control for buyer/security review by connecting restore-test evidence, policy context, and a human-reviewed status.",
    title: RECOMMENDATION_TITLE,
  },
  ctrl_mfa_all_users: {
    controlKey: "ctrl_mfa_all_users",
    evidenceAction:
      "Add an identity-provider MFA export or screenshot showing active users, MFA state, exceptions, owner, and review date.",
    humanReviewAction: HUMAN_REVIEW_ACTION,
    policyAction:
      "Use the security policy to document the MFA rule and exception handling. A policy supports the review, but it does not prove the control by itself.",
    policyHref: SECURITY_POLICY_HREF,
    policyType: SECURITY_POLICY_TYPE,
    summary:
      "Prepare the MFA control for buyer/security review by connecting supporting evidence, policy context, and a human-reviewed status.",
    title: RECOMMENDATION_TITLE,
  },
};

export function getPolicyEvidenceRecommendation(
  controlKey: string,
): PolicyEvidenceRecommendation | null {
  return POLICY_EVIDENCE_RECOMMENDATIONS[controlKey] ?? null;
}

export function listPolicyEvidenceRecommendations(): PolicyEvidenceRecommendation[] {
  return Object.values(POLICY_EVIDENCE_RECOMMENDATIONS);
}
