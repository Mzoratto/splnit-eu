import type {
  EvidenceAssessmentResult,
  EvidenceBlockedReason,
  EvidenceCollectionStatus,
  EvidenceConfidence,
  EvidenceSource,
} from "@/lib/activation/evidence-state";
import type {
  RemediationTaskSeverity,
  RemediationTaskSourceType,
  RemediationTaskStatus,
} from "@/lib/db/schema";

export type ActivationAutomationOutcomeKind =
  | "queued"
  | "running"
  | "blocked"
  | "collected";

export type ActivationAutomationEvidenceInput = {
  assessmentResult: EvidenceAssessmentResult | null;
  blockedReason: EvidenceBlockedReason | string | null;
  collectedAt: Date | null;
  collectionStatus: EvidenceCollectionStatus | "queued" | "running" | string | null;
  confidence: EvidenceConfidence | null;
  controlKey: string;
  controlTitle: string | null;
  evidenceId: string;
  source: EvidenceSource | string | null;
};

export type ActivationAutomationTaskInput = {
  controlKey: string;
  description: string | null;
  dueDate: string | null;
  severity: RemediationTaskSeverity;
  sourceType: RemediationTaskSourceType;
  status: RemediationTaskStatus;
  taskId: string;
  title: string;
  updatedAt: Date | null;
};

export type ActivationAutomationOutcome = {
  assessmentResult: EvidenceAssessmentResult | null;
  blockedReason: EvidenceBlockedReason | string | null;
  collectedAt: Date | null;
  collectionStatus: EvidenceCollectionStatus | "queued" | "running";
  confidence: EvidenceConfidence | null;
  controlKey: string;
  controlTitle: string | null;
  evidenceId: string | null;
  kind: ActivationAutomationOutcomeKind;
  lastKnownAssessmentResult: EvidenceAssessmentResult | null;
  source: EvidenceSource | string | null;
  sourceLabel: "evidence" | "remediation_task";
  task: ActivationAutomationTaskInput | null;
};

export type DeriveActivationAutomationOutcomeInput = {
  controlKeys: readonly string[];
  evidence: readonly ActivationAutomationEvidenceInput[];
  remediationTasks?: readonly ActivationAutomationTaskInput[];
};

const ACTIVE_TASK_STATUSES: ReadonlySet<RemediationTaskStatus> = new Set([
  "open",
  "in_progress",
]);

function isConfirmedAssessment(
  value: EvidenceAssessmentResult | null,
): value is "pass" | "gap" {
  return value === "pass" || value === "gap";
}

function normalizeCollectionStatus(
  value: ActivationAutomationEvidenceInput["collectionStatus"],
): ActivationAutomationOutcomeKind {
  if (value === "running") {
    return "running";
  }

  if (value === "pending" || value === "queued") {
    return "queued";
  }

  if (value === "blocked" || value === "failed") {
    return "blocked";
  }

  return "collected";
}

function toStatusInput(kind: ActivationAutomationOutcomeKind) {
  if (kind === "queued") {
    return "queued" as const;
  }

  if (kind === "running") {
    return "running" as const;
  }

  if (kind === "blocked") {
    return "blocked" as const;
  }

  return "collected" as const;
}

function taskToOutcome(task: ActivationAutomationTaskInput): ActivationAutomationOutcome | null {
  if (!ACTIVE_TASK_STATUSES.has(task.status)) {
    return null;
  }

  if (task.sourceType !== "connector_blocked") {
    return null;
  }

  return {
    assessmentResult: "unknown",
    blockedReason: "collection_failed",
    collectedAt: null,
    collectionStatus: "blocked",
    confidence: "low",
    controlKey: task.controlKey,
    controlTitle: null,
    evidenceId: null,
    kind: "blocked",
    lastKnownAssessmentResult: null,
    source: "connector",
    sourceLabel: "remediation_task",
    task,
  };
}

export function deriveActivationAutomationOutcome(
  input: DeriveActivationAutomationOutcomeInput,
): ActivationAutomationOutcome | null {
  const evidenceByControlKey = new Map<string, ActivationAutomationEvidenceInput[]>();
  const tasksByControlKey = new Map<string, ActivationAutomationTaskInput[]>();

  for (const row of input.evidence) {
    const existing = evidenceByControlKey.get(row.controlKey) ?? [];
    existing.push(row);
    evidenceByControlKey.set(row.controlKey, existing);
  }

  for (const task of input.remediationTasks ?? []) {
    const existing = tasksByControlKey.get(task.controlKey) ?? [];
    existing.push(task);
    tasksByControlKey.set(task.controlKey, existing);
  }

  for (const controlKey of input.controlKeys) {
    const evidenceRows = evidenceByControlKey.get(controlKey) ?? [];
    const latestEvidence = evidenceRows[0];

    if (latestEvidence) {
      const kind = normalizeCollectionStatus(latestEvidence.collectionStatus);
      const previousConfirmedEvidence = evidenceRows
        .slice(1)
        .find((row) => isConfirmedAssessment(row.assessmentResult));

      return {
        assessmentResult: latestEvidence.assessmentResult,
        blockedReason: latestEvidence.blockedReason,
        collectedAt: latestEvidence.collectedAt,
        collectionStatus: toStatusInput(kind),
        confidence: latestEvidence.confidence,
        controlKey: latestEvidence.controlKey,
        controlTitle: latestEvidence.controlTitle,
        evidenceId: latestEvidence.evidenceId,
        kind,
        lastKnownAssessmentResult: previousConfirmedEvidence?.assessmentResult ?? null,
        source: latestEvidence.source,
        sourceLabel: "evidence",
        task: null,
      };
    }

    const taskOutcome = (tasksByControlKey.get(controlKey) ?? [])
      .map(taskToOutcome)
      .find((outcome): outcome is ActivationAutomationOutcome => Boolean(outcome));

    if (taskOutcome) {
      return taskOutcome;
    }
  }

  return null;
}

export function isAutomationBlockedPermissionState(
  outcome: Pick<ActivationAutomationOutcome, "blockedReason" | "kind"> | null | undefined,
) {
  if (!outcome || outcome.kind !== "blocked") {
    return false;
  }

  return outcome.blockedReason === "missing_permission" ||
    outcome.blockedReason === "insufficient_scope" ||
    outcome.blockedReason === "invalid_key" ||
    outcome.blockedReason === "not_connected";
}
