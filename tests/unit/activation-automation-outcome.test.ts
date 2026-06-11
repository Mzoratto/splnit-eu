import { describe, expect, it } from "vitest";
import {
  deriveActivationAutomationOutcome,
  isAutomationBlockedPermissionState,
  type ActivationAutomationEvidenceInput,
  type ActivationAutomationTaskInput,
} from "@/lib/activation/automation-outcome";

const NOW = new Date("2026-06-11T12:00:00.000Z");

function buildEvidence(
  overrides: Partial<ActivationAutomationEvidenceInput> = {},
): ActivationAutomationEvidenceInput {
  return {
    assessmentResult: "pass",
    blockedReason: null,
    collectedAt: NOW,
    collectionStatus: "collected",
    confidence: "high",
    controlKey: "ac-1",
    controlTitle: "Access control",
    evidenceId: "ev-1",
    source: "connector",
    ...overrides,
  };
}

function buildTask(
  overrides: Partial<ActivationAutomationTaskInput> = {},
): ActivationAutomationTaskInput {
  return {
    controlKey: "ac-1",
    description: null,
    dueDate: null,
    severity: "high",
    sourceType: "connector_blocked",
    status: "open",
    taskId: "task-1",
    title: "Connector needs attention",
    updatedAt: NOW,
    ...overrides,
  };
}

describe("deriveActivationAutomationOutcome", () => {
  it("returns null when there is no evidence and no tasks", () => {
    expect(
      deriveActivationAutomationOutcome({ controlKeys: ["ac-1"], evidence: [] }),
    ).toBeNull();
  });

  it("uses the latest evidence for the first control with any evidence", () => {
    const outcome = deriveActivationAutomationOutcome({
      controlKeys: ["ac-1", "ac-2"],
      evidence: [buildEvidence()],
    });

    expect(outcome?.kind).toBe("collected");
    expect(outcome?.evidenceId).toBe("ev-1");
    expect(outcome?.sourceLabel).toBe("evidence");
  });

  it("maps pending and queued statuses to queued, blocked and failed to blocked", () => {
    expect(
      deriveActivationAutomationOutcome({
        controlKeys: ["ac-1"],
        evidence: [buildEvidence({ collectionStatus: "pending" })],
      })?.kind,
    ).toBe("queued");
    expect(
      deriveActivationAutomationOutcome({
        controlKeys: ["ac-1"],
        evidence: [buildEvidence({ collectionStatus: "failed" })],
      })?.kind,
    ).toBe("blocked");
  });

  it("surfaces the last confirmed assessment from evidence history", () => {
    const outcome = deriveActivationAutomationOutcome({
      controlKeys: ["ac-1"],
      evidence: [
        buildEvidence({
          assessmentResult: "unknown",
          collectionStatus: "blocked",
          evidenceId: "ev-2",
        }),
        buildEvidence({ assessmentResult: "unknown", evidenceId: "ev-1b" }),
        buildEvidence({ assessmentResult: "gap", evidenceId: "ev-1a" }),
      ],
    });

    expect(outcome?.lastKnownAssessmentResult).toBe("gap");
  });

  it("falls back to an active connector_blocked remediation task", () => {
    const outcome = deriveActivationAutomationOutcome({
      controlKeys: ["ac-1"],
      evidence: [],
      remediationTasks: [buildTask()],
    });

    expect(outcome?.kind).toBe("blocked");
    expect(outcome?.sourceLabel).toBe("remediation_task");
    expect(outcome?.task?.taskId).toBe("task-1");
  });

  it("ignores resolved tasks and non connector_blocked sources", () => {
    expect(
      deriveActivationAutomationOutcome({
        controlKeys: ["ac-1"],
        evidence: [],
        remediationTasks: [buildTask({ status: "resolved" })],
      }),
    ).toBeNull();
    expect(
      deriveActivationAutomationOutcome({
        controlKeys: ["ac-1"],
        evidence: [],
        remediationTasks: [buildTask({ sourceType: "connector_gap" })],
      }),
    ).toBeNull();
  });
});

describe("isAutomationBlockedPermissionState", () => {
  it("matches blocked outcomes with permission-shaped reasons", () => {
    expect(
      isAutomationBlockedPermissionState({
        blockedReason: "missing_permission",
        kind: "blocked",
      }),
    ).toBe(true);
    expect(
      isAutomationBlockedPermissionState({
        blockedReason: "not_connected",
        kind: "blocked",
      }),
    ).toBe(true);
  });

  it("rejects non-blocked outcomes and other reasons", () => {
    expect(
      isAutomationBlockedPermissionState({
        blockedReason: "missing_permission",
        kind: "collected",
      }),
    ).toBe(false);
    expect(
      isAutomationBlockedPermissionState({
        blockedReason: "collection_failed",
        kind: "blocked",
      }),
    ).toBe(false);
    expect(isAutomationBlockedPermissionState(null)).toBe(false);
  });
});
