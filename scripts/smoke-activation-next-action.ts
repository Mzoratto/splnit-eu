import assert from "node:assert/strict";
import { deriveActivationNextAction, type ActivationNextAction } from "../lib/activation/next-action";

const topPriorityControl = {
  evidenceCount: 0,
  href: "/controls/ctrl_mfa_all_users",
  key: "ctrl_mfa_all_users",
  status: "fail",
  title: "MFA for all users",
};

function assertUiSurfaceContract(action: ActivationNextAction) {
  assert.ok(action.stage, `${action.stage} should expose a stage for dashboard/modal/controls routing`);
  assert.ok(action.title.length > 0, `${action.stage} should expose a title for dashboard/modal/controls copy`);
  assert.ok(action.description.length > 0, `${action.stage} should expose a description for dashboard/modal/controls copy`);
  assert.ok(action.href.startsWith("/"), `${action.stage} should expose an app-local href`);

  if (
    action.stage === "upload_first_evidence" ||
    action.stage === "review_first_gap" ||
    action.stage === "active_monitoring"
  ) {
    assert.equal(
      action.topPriorityControlKey,
      topPriorityControl.key,
      `${action.stage} should keep the first priority control available for manual-upload/status CTAs`,
    );
  }
}

const fixtures: Record<string, ActivationNextAction> = {
  complete_intake: deriveActivationNextAction({ hasIntakeProfile: false }),
  open_recommended_workspace: deriveActivationNextAction({
    hasIntakeProfile: true,
    priorityControls: [topPriorityControl],
    selectedTools: ["microsoft-copilot"],
    workspaceRecommendations: [{ platformKey: "helios", label: "Helios", reason: "Helios workspace" }],
  }),
  connect_recommended_integration: deriveActivationNextAction({
    hasIntakeProfile: true,
    integrations: [{ provider: "microsoft365", status: "available" }],
    priorityControls: [topPriorityControl],
    selectedTools: ["microsoft-copilot"],
  }),
  upload_first_evidence: deriveActivationNextAction({
    hasIntakeProfile: true,
    integrations: [],
    priorityControls: [topPriorityControl],
    selectedTools: ["google-workspace"],
  }),
  review_first_gap: deriveActivationNextAction({
    hasIntakeProfile: true,
    integrations: [{ provider: "microsoft365", status: "connected" }],
    priorityControls: [{ ...topPriorityControl, evidenceCount: 1, status: "manual_review" }],
    selectedTools: ["microsoft-copilot"],
  }),
  active_monitoring: deriveActivationNextAction({
    hasIntakeProfile: true,
    integrations: [{ provider: "microsoft365", status: "connected" }],
    priorityControls: [{ ...topPriorityControl, evidenceCount: 1, status: "pass" }],
    selectedTools: ["microsoft-copilot"],
  }),
  review_ranked_gaps: deriveActivationNextAction({
    hasIntakeProfile: true,
    integrations: [],
    priorityControls: [],
    selectedTools: [],
  }),
};

assert.deepEqual(Object.values(fixtures).map((action) => action.stage), [
  "complete_intake",
  "open_recommended_workspace",
  "connect_recommended_integration",
  "upload_first_evidence",
  "review_first_gap",
  "active_monitoring",
  "review_ranked_gaps",
]);

for (const action of Object.values(fixtures)) {
  assertUiSurfaceContract(action);
}

assert.equal(fixtures.complete_intake.href, "/onboarding");
assert.equal(fixtures.complete_intake.recommendation, null);

assert.equal(fixtures.open_recommended_workspace.href, "/workspaces/helios");
assert.equal(fixtures.open_recommended_workspace.recommendation?.kind, "workspace");

assert.equal(fixtures.connect_recommended_integration.href, "/integrations/microsoft365");
assert.equal(fixtures.connect_recommended_integration.recommendation?.providerKey, "microsoft365");
assert.equal(fixtures.connect_recommended_integration.topPriorityControlKey, topPriorityControl.key);

assert.equal(fixtures.upload_first_evidence.href, "/controls/ctrl_mfa_all_users");
assert.equal(fixtures.upload_first_evidence.recommendation?.supported, false);
assert.equal(fixtures.upload_first_evidence.recommendation?.planned, true);

assert.equal(fixtures.review_first_gap.href, "/controls/ctrl_mfa_all_users");
assert.equal(fixtures.active_monitoring.href, "/controls?scope=priority");
assert.equal(fixtures.review_ranked_gaps.href, "/controls?scope=priority");
assert.equal(fixtures.review_ranked_gaps.topPriorityControlKey, null);

console.log("Activation next-action smoke passed for all 7 UI stages.");
