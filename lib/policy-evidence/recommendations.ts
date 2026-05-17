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

const POLICY_EVIDENCE_RECOMMENDATIONS: Readonly<Record<string, PolicyEvidenceRecommendation>> = {
  ctrl_mfa_all_users: {
    controlKey: "ctrl_mfa_all_users",
    evidenceAction:
      "Add an identity-provider MFA export or screenshot showing active users, MFA state, exceptions, owner, and review date.",
    humanReviewAction:
      "After reviewing the evidence and policy support, update the control status manually.",
    policyAction:
      "Use the security policy to document the MFA rule and exception handling. A policy supports the review, but it does not prove the control by itself.",
    policyHref: "/policies/security_policy",
    policyType: "security_policy",
    summary:
      "Prepare the MFA control for buyer/security review by connecting supporting evidence, policy context, and a human-reviewed status.",
    title: "Recommended next action",
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
