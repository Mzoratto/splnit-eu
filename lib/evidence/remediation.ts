import {
  getRemediationTaskBySource,
  updateRemediationTaskStatus,
  upsertRemediationTask,
} from "@/lib/db/queries/remediation-tasks";
import type {
  RemediationTaskSeverity,
  RemediationTaskSourceType,
} from "@/lib/db/schema";
import type { TestStatus } from "@/lib/integrations/types";

const CONNECTOR_REMEDIATION_DUE_DAYS = 14;
const CONNECTOR_BLOCKED_DUE_DAYS = 7;

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizeSourcePart(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9_.:-]+/g, "_");
}

export function getConnectorRemediationSourceKey(input: {
  checkLogic: string;
  provider: string;
}) {
  return `connector:${normalizeSourcePart(input.provider)}:${normalizeSourcePart(input.checkLogic)}`;
}

export function getManualEvidenceReviewDueSourceKey(evidenceId: string) {
  return `manual-evidence-review:${evidenceId}`;
}

type ConnectorRemediationInput = {
  checkLogic: string;
  clerkOrgId: string;
  controlId: string;
  controlKey: string;
  evidenceId: string;
  failureReason?: string | null;
  passCriteria: string | null;
  provider: string;
  resultData: Record<string, unknown>;
  status: TestStatus;
  testName: string;
};

type ConnectorRemediationResult =
  | {
      action: "ignored";
      reason: "not_applicable";
      tasksResolved: 0;
    }
  | {
      action: "resolved";
      tasksResolved: number;
    }
  | {
      action: "upserted";
      sourceKey: string;
      sourceType: Extract<RemediationTaskSourceType, "connector_gap" | "connector_blocked">;
      taskId: string;
    };

function getConnectorFindingSourceType(
  status: TestStatus,
): Extract<RemediationTaskSourceType, "connector_gap" | "connector_blocked"> | null {
  switch (status) {
    case "fail":
    case "warning":
    case "manual_review":
      return "connector_gap";
    case "error":
      return "connector_blocked";
    default:
      return null;
  }
}

function getConnectorFindingSeverity(input: {
  resultData: Record<string, unknown>;
  sourceType: Extract<RemediationTaskSourceType, "connector_gap" | "connector_blocked">;
  status: TestStatus;
}): RemediationTaskSeverity {
  if (input.status === "fail") {
    return "high";
  }

  if (
    input.sourceType === "connector_blocked" &&
    input.resultData.blockedReason === "missing_permission"
  ) {
    return "high";
  }

  return "medium";
}

function connectorTaskTitle(input: {
  provider: string;
  sourceType: Extract<RemediationTaskSourceType, "connector_gap" | "connector_blocked">;
  testName: string;
}) {
  if (input.sourceType === "connector_blocked") {
    return `${input.provider} connector needs attention — ${input.testName}`;
  }

  return `${input.provider} connector found a gap — ${input.testName}`;
}

function connectorTaskDescription(input: ConnectorRemediationInput & {
  sourceType: Extract<RemediationTaskSourceType, "connector_gap" | "connector_blocked">;
}) {
  const passCriteria = input.passCriteria
    ? `\n\nExpected: ${input.passCriteria}`
    : "";
  const failureReason = input.failureReason
    ? `\n\nFinding: ${input.failureReason}`
    : "";

  if (input.sourceType === "connector_blocked") {
    const blockedReason =
      typeof input.resultData.blockedReason === "string"
        ? input.resultData.blockedReason
        : "collection_failed";
    return `Connector evidence collection is blocked (${blockedReason}). Restore access or upload reviewed evidence before relying on this control.${failureReason}${passCriteria}`;
  }

  return `Connector evidence indicates this control is not ready. Review the finding, remediate it, or document a human-attested exception before treating it as ready.${failureReason}${passCriteria}`;
}

async function resolveConnectorTasks(input: ConnectorRemediationInput) {
  const sourceKey = getConnectorRemediationSourceKey(input);
  let tasksResolved = 0;

  for (const sourceType of ["connector_gap", "connector_blocked"] as const) {
    const task = await getRemediationTaskBySource({
      clerkOrgId: input.clerkOrgId,
      controlId: input.controlId,
      sourceKey,
      sourceType,
    });

    if (task && task.status !== "resolved") {
      await updateRemediationTaskStatus({
        clerkOrgId: input.clerkOrgId,
        status: "resolved",
        taskId: task.id,
      });
      tasksResolved += 1;
    }
  }

  return tasksResolved;
}

export async function syncConnectorRemediationForEvidence(
  input: ConnectorRemediationInput,
): Promise<ConnectorRemediationResult> {
  if (input.status === "pass") {
    return {
      action: "resolved",
      tasksResolved: await resolveConnectorTasks(input),
    };
  }

  if (input.status === "not_applicable") {
    return {
      action: "ignored",
      reason: "not_applicable",
      tasksResolved: 0,
    };
  }

  const sourceType = getConnectorFindingSourceType(input.status);
  if (!sourceType) {
    return {
      action: "ignored",
      reason: "not_applicable",
      tasksResolved: 0,
    };
  }

  const now = new Date();
  const sourceKey = getConnectorRemediationSourceKey(input);
  const existingTask = await getRemediationTaskBySource({
    clerkOrgId: input.clerkOrgId,
    controlId: input.controlId,
    sourceKey,
    sourceType,
  });
  const nextDueDate = dateOnly(
    addDays(
      now,
      sourceType === "connector_blocked"
        ? CONNECTOR_BLOCKED_DUE_DAYS
        : CONNECTOR_REMEDIATION_DUE_DAYS,
    ),
  );
  const dueDate =
    existingTask &&
    (existingTask.status === "open" || existingTask.status === "in_progress") &&
    existingTask.dueDate
      ? existingTask.dueDate
      : nextDueDate;
  const task = await upsertRemediationTask({
    clerkOrgId: input.clerkOrgId,
    controlId: input.controlId,
    controlKey: input.controlKey,
    description: connectorTaskDescription({ ...input, sourceType }),
    dueDate,
    frameworkRefs: [],
    metadata: {
      checkLogic: input.checkLogic,
      evidenceId: input.evidenceId,
      failureReason: input.failureReason ?? null,
      passCriteria: input.passCriteria,
      provider: input.provider,
      resultData: input.resultData,
      status: input.status,
      testName: input.testName,
    },
    severity: getConnectorFindingSeverity({
      resultData: input.resultData,
      sourceType,
      status: input.status,
    }),
    sourceKey,
    sourceType,
    title: connectorTaskTitle({
      provider: input.provider,
      sourceType,
      testName: input.testName,
    }),
  });

  return {
    action: "upserted",
    sourceKey: task.sourceKey,
    sourceType,
    taskId: task.id,
  };
}

type ManualEvidenceReviewDueInput = {
  clerkOrgId: string;
  collectedAt: Date | null;
  controlId: string;
  controlKey: string;
  dueDate: string;
  evidenceId: string;
  evidenceType: string;
  reason: "recertification_window_elapsed" | "required_human_review";
};

export async function upsertManualEvidenceReviewDueTask(
  input: ManualEvidenceReviewDueInput,
) {
  const task = await upsertRemediationTask({
    clerkOrgId: input.clerkOrgId,
    controlId: input.controlId,
    controlKey: input.controlKey,
    description: `Manual evidence requires human review before this control can be treated as current. Reason: ${input.reason}.`,
    dueDate: input.dueDate,
    frameworkRefs: [],
    metadata: {
      collectedAt: input.collectedAt?.toISOString() ?? null,
      evidenceId: input.evidenceId,
      evidenceType: input.evidenceType,
      reason: input.reason,
    },
    severity: "medium",
    sourceKey: getManualEvidenceReviewDueSourceKey(input.evidenceId),
    sourceType: "manual_evidence_review_due",
    title: `Manual evidence review due — ${input.controlKey}`,
  });

  return {
    action: "upserted" as const,
    sourceKey: task.sourceKey,
    sourceType: "manual_evidence_review_due" as const,
    taskId: task.id,
  };
}
