import assert from "node:assert/strict";
import { deriveActivationNextAction } from "../lib/activation/next-action";

const topPriorityControl = {
  evidenceCount: 0,
  href: "/controls/ctrl_mfa_all_users",
  key: "ctrl_mfa_all_users",
  status: "fail",
  title: "MFA for all users",
};

assert.equal(
  deriveActivationNextAction({ hasIntakeProfile: false }).stage,
  "complete_intake",
);

const erpAction = deriveActivationNextAction({
  hasIntakeProfile: true,
  priorityControls: [topPriorityControl],
  selectedTools: ["microsoft-copilot"],
  workspaceRecommendations: [{ platformKey: "helios", label: "Helios", reason: "Helios workspace" }],
});
assert.equal(erpAction.stage, "open_recommended_workspace");
assert.equal(erpAction.href, "/workspaces/helios");
assert.equal(erpAction.recommendation?.kind, "workspace");

const connectorAction = deriveActivationNextAction({
  hasIntakeProfile: true,
  integrations: [{ provider: "microsoft365", status: "available" }],
  priorityControls: [topPriorityControl],
  selectedTools: ["microsoft-copilot"],
});
assert.equal(connectorAction.stage, "connect_recommended_integration");
assert.equal(connectorAction.href, "/integrations/microsoft365");

const manualFallbackAction = deriveActivationNextAction({
  hasIntakeProfile: true,
  integrations: [],
  priorityControls: [topPriorityControl],
  selectedTools: ["chatgpt"],
});
assert.equal(manualFallbackAction.stage, "upload_first_evidence");
assert.equal(manualFallbackAction.href, "/controls/ctrl_mfa_all_users");

const reviewAction = deriveActivationNextAction({
  hasIntakeProfile: true,
  integrations: [{ provider: "microsoft365", status: "connected" }],
  priorityControls: [{ ...topPriorityControl, evidenceCount: 1, status: "manual_review" }],
  selectedTools: ["microsoft-copilot"],
});
assert.equal(reviewAction.stage, "review_first_gap");
assert.equal(reviewAction.href, "/controls/ctrl_mfa_all_users");

const activeAction = deriveActivationNextAction({
  hasIntakeProfile: true,
  integrations: [{ provider: "microsoft365", status: "connected" }],
  priorityControls: [{ ...topPriorityControl, evidenceCount: 1, status: "pass" }],
  selectedTools: ["microsoft-copilot"],
});
assert.equal(activeAction.stage, "active_monitoring");
assert.equal(activeAction.href, "/controls?scope=priority");

console.log("Activation next-action smoke passed.");
