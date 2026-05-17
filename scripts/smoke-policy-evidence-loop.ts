import assert from "node:assert/strict";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RecommendedActionCard } from "../components/policy-evidence/recommended-action-card";
import { applyIntakeScopeToDashboardPriorityControls } from "../lib/dashboard/priority-controls";
import {
  getPolicyEvidenceRecommendation,
} from "../lib/policy-evidence/recommendations";
import {
  derivePolicyEvidenceProofStatus,
} from "../lib/policy-evidence/status";

const recommendation = getPolicyEvidenceRecommendation("ctrl_mfa_all_users");

assert.ok(recommendation, "ctrl_mfa_all_users should have a policy-to-evidence recommendation.");
assert.equal(recommendation.controlKey, "ctrl_mfa_all_users");
assert.equal(recommendation.policyType, "security_policy");
assert.equal(recommendation.policyHref, "/policies/security_policy");
assert.match(recommendation.evidenceAction, /MFA/i);
assert.match(recommendation.evidenceAction, /active users/i);
assert.match(recommendation.policyAction, /does not prove the control by itself/i);
assert.equal(getPolicyEvidenceRecommendation("ctrl_backup_tested"), null);
assert.equal(getPolicyEvidenceRecommendation("unknown_control"), null);

const renderedCard = renderToStaticMarkup(
  React.createElement(RecommendedActionCard, {
    proofStatus: {
      label: "No supporting evidence yet.",
      state: "no_supporting_evidence",
    },
    recommendation,
  }),
);
assert.match(renderedCard, /Recommended next action/);
assert.match(renderedCard, /Supporting evidence/);
assert.match(renderedCard, /Policy support/);
assert.match(renderedCard, /href="\/policies\/security_policy"/);
assert.match(renderedCard, /href="#evidence-upload"/);
assert.match(renderedCard, /href="#status-review"/);
assert.doesNotMatch(renderedCard, /compliant|certified|auditor-ready|legal proof/i);

const dashboardPriorityControls = applyIntakeScopeToDashboardPriorityControls(
  [
    {
      category: "access",
      intakeRationale: null,
      isIntakePriority: false,
      key: "ctrl_backup_tested",
      scopeStatus: null,
      status: "manual_review",
      title: "Backup testing",
      titleCs: "Backup testing",
      titleEn: "Backup testing",
    },
    {
      category: "access",
      intakeRationale: null,
      isIntakePriority: false,
      key: "ctrl_mfa_all_users",
      scopeStatus: null,
      status: "fail",
      title: "MFA for all users",
      titleCs: "MFA for all users",
      titleEn: "MFA for all users",
    },
    {
      category: "ai",
      intakeRationale: null,
      isIntakePriority: false,
      key: "ctrl_ai_high_risk_provider_verification",
      scopeStatus: null,
      status: "unknown",
      title: "High-risk AI provider verification",
      titleCs: "High-risk AI provider verification",
      titleEn: "High-risk AI provider verification",
    },
  ],
  {
    applicableControlKeys: ["ctrl_mfa_all_users", "ctrl_backup_tested"],
    notApplicableControlKeys: ["ctrl_ai_high_risk_provider_verification"],
    outOfScopeControlKeys: [],
    priorityControlKeys: ["ctrl_mfa_all_users"],
    rationales: {
      ctrl_mfa_all_users: "Reason from intake: customer-facing SaaS.",
    },
  },
);
assert.deepEqual(
  dashboardPriorityControls.map((control) => control.key),
  ["ctrl_mfa_all_users", "ctrl_backup_tested"],
);
assert.equal(dashboardPriorityControls[0]?.isIntakePriority, true);
assert.equal(
  dashboardPriorityControls[0]?.intakeRationale,
  "Reason from intake: customer-facing SaaS.",
);
assert.equal(dashboardPriorityControls[0]?.scopeStatus, "applicable");

assert.deepEqual(
  derivePolicyEvidenceProofStatus({
    controlStatus: "unknown",
    evidence: [],
  }),
  {
    label: "No supporting evidence yet.",
    state: "no_supporting_evidence",
  },
);

assert.deepEqual(
  derivePolicyEvidenceProofStatus({
    controlStatus: "unknown",
    evidence: [{ expiresAt: null }],
  }),
  {
    label: "Evidence added — needs review.",
    state: "draft_or_uploaded_evidence",
  },
);

assert.deepEqual(
  derivePolicyEvidenceProofStatus({
    controlStatus: "manual_review",
    evidence: [{ expiresAt: "2099-01-01" }],
  }),
  {
    label: "Evidence added — needs review.",
    state: "draft_or_uploaded_evidence",
  },
);

assert.deepEqual(
  derivePolicyEvidenceProofStatus({
    controlStatus: "pass",
    evidence: [{ expiresAt: "2099-01-01" }],
  }),
  {
    label: "Reviewed as passing with supporting evidence.",
    state: "reviewed_pass",
  },
);

assert.deepEqual(
  derivePolicyEvidenceProofStatus({
    controlStatus: "pass",
    evidence: [],
  }),
  {
    label: "Gap still open.",
    state: "reviewed_issue",
  },
);

assert.deepEqual(
  derivePolicyEvidenceProofStatus({
    controlStatus: "fail",
    evidence: [{ expiresAt: "2099-01-01" }],
  }),
  {
    label: "Gap still open.",
    state: "reviewed_issue",
  },
);

assert.deepEqual(
  derivePolicyEvidenceProofStatus({
    controlStatus: "manual_review",
    evidence: [{ expiresAt: "2000-01-01" }],
    now: new Date("2026-05-18T00:00:00.000Z"),
  }),
  {
    label: "Gap still open.",
    state: "reviewed_issue",
  },
);

assert.deepEqual(
  derivePolicyEvidenceProofStatus({
    controlStatus: "not_applicable",
    evidence: [{ expiresAt: "2099-01-01" }],
  }),
  {
    label: "Out of scope or not applicable based on intake/review.",
    state: "not_applicable",
  },
);

assert.deepEqual(
  derivePolicyEvidenceProofStatus({
    controlStatus: "pass",
    evidence: [{ expiresAt: "2099-01-01" }],
    scopeStatus: "out_of_scope",
  }),
  {
    label: "Out of scope or not applicable based on intake/review.",
    state: "not_applicable",
  },
);

console.log("Policy-to-evidence loop smoke test passed.");
