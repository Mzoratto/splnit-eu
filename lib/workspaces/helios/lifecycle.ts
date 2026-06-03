import { and, desc, eq, inArray } from "drizzle-orm";
import { computeEvidenceFreshness, type EvidenceFreshness } from "@/lib/activation/evidence-state";
import { getDb } from "@/lib/db";
import { auditLogs, controls, evidence, orgControlStatuses } from "@/lib/db/schema";
import {
  getRemediationTaskBySource,
  upsertRemediationTask,
} from "@/lib/db/queries/remediation-tasks";
import {
  getManualEvidenceReviewDueSourceKey,
  upsertManualEvidenceReviewDueTask,
} from "@/lib/evidence/remediation";
import { heliosWorkspace } from "@/lib/workspaces/helios";
import type { WorkspaceControl } from "@/lib/workspaces/types";

const DAY_MS = 86_400_000;
const GENERAL_HELIOS_TTL_DAYS = 90;

const HELIOS_TTL_DAYS_BY_CONTROL_KEY: Record<string, number> = {
  "helios-iam-user-accounts": 90,
  "helios-iam-inactive-session-audit": 90,
  "helios-iam-offboarding": 90,
  "helios-backup-sql-agent-jobs": 90,
  "helios-backup-encryption": 180,
  "helios-backup-offsite-immutable": 180,
  "helios-backup-restoration-test": 365,
};

export type HeliosEvidenceFreshness = EvidenceFreshness & {
  staleDays: number | null;
};

export type HeliosEvidenceLifecycleResult = {
  downgradedControls: number;
  scannedEvidence: number;
  staleEvidence: number;
  tasksUpserted: number;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function heliosControls() {
  return heliosWorkspace.layers.flatMap((layer) =>
    layer.controls.map((control) => ({
      control,
      layerId: layer.id,
    })),
  );
}

const heliosControlByKey = new Map<string, WorkspaceControl>(
  heliosControls().map(({ control }) => [control.controlKey, control]),
);

export function getHeliosEvidenceTtlDays(controlKey: string) {
  return HELIOS_TTL_DAYS_BY_CONTROL_KEY[controlKey] ?? GENERAL_HELIOS_TTL_DAYS;
}

export function getHeliosEvidenceFreshness(input: {
  collectedAt: Date | null;
  controlKey: string;
  now?: Date;
}): HeliosEvidenceFreshness {
  const ttlMs = getHeliosEvidenceTtlDays(input.controlKey) * DAY_MS;
  const freshness = computeEvidenceFreshness({
    collected_at: input.collectedAt,
    now: input.now,
    ttl_ms: ttlMs,
  });
  const now = input.now ?? new Date();
  const staleDays =
    freshness.status === "stale" && freshness.expires_at
      ? Math.max(0, Math.floor((now.getTime() - freshness.expires_at.getTime()) / DAY_MS))
      : null;

  return {
    ...freshness,
    staleDays,
  };
}

function frameworkRefsForControl(control: WorkspaceControl) {
  return [
    {
      frameworkId: "nis2",
      reference: control.nis2ArticleRef,
    },
    ...(control.zobkSectionRef
      ? [
          {
            frameworkId: "zokb",
            reference: control.zobkSectionRef,
          },
        ]
      : []),
    ...(control.frameworkMappings ?? []).map((mapping) => ({
      frameworkId: mapping.frameworkId,
      reference: mapping.reference,
      title: mapping.title,
    })),
  ];
}

function isHeliosWorkspaceEvidence(row: {
  description: string | null;
  snapshotData: Record<string, unknown> | null;
  source: string;
  type: string;
}) {
  if (row.type === "helios_csv_import") {
    return true;
  }

  if (row.description?.toLowerCase().includes("platform: helios")) {
    return true;
  }

  return row.snapshotData?.platformId === "helios";
}

export async function upsertHeliosGapRemediationTask(input: {
  assessmentResult: string;
  clerkOrgId: string;
  controlId: string;
  controlKey: string;
  evidenceId: string;
}) {
  if (input.assessmentResult !== "gap") {
    return null;
  }

  const control = heliosControlByKey.get(input.controlKey);
  if (!control) {
    return null;
  }

  return upsertRemediationTask({
    clerkOrgId: input.clerkOrgId,
    controlId: input.controlId,
    controlKey: input.controlKey,
    description: `${control.guidance}\n\nEvidence is customer-provided and requires remediation or documented exception before the control can be treated as ready.`,
    dueDate: dateOnly(addDays(new Date(), 30)),
    frameworkRefs: frameworkRefsForControl(control),
    metadata: {
      evidenceId: input.evidenceId,
      platformId: "helios",
      provenance: "manual_workspace_evidence",
    },
    severity: control.nukibPriority === "high" ? "high" : "medium",
    sourceKey: `helios:gap:${input.evidenceId}`,
    sourceType: "workspace_gap",
    title: `Helios gap requires remediation — ${control.controlKey}`,
  });
}

export async function processHeliosWorkspaceEvidenceLifecycle(
  now = new Date(),
): Promise<HeliosEvidenceLifecycleResult> {
  const db = getDb();
  const controlKeys = [...heliosControlByKey.keys()];
  const rows = await db
    .select({
      assessmentResult: evidence.assessmentResult,
      clerkOrgId: evidence.clerkOrgId,
      collectedAt: evidence.collectedAt,
      collectionStatus: evidence.collectionStatus,
      controlId: evidence.controlId,
      controlKey: controls.key,
      description: evidence.description,
      evidenceId: evidence.id,
      snapshotData: evidence.snapshotData,
      source: evidence.source,
      status: orgControlStatuses.status,
      type: evidence.type,
    })
    .from(evidence)
    .innerJoin(controls, eq(evidence.controlId, controls.id))
    .leftJoin(
      orgControlStatuses,
      and(
        eq(orgControlStatuses.clerkOrgId, evidence.clerkOrgId),
        eq(orgControlStatuses.controlId, evidence.controlId),
      ),
    )
    .where(inArray(controls.key, controlKeys))
    .orderBy(desc(evidence.collectedAt));

  const latestByOrgControl = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    if (!isHeliosWorkspaceEvidence(row)) {
      continue;
    }

    const key = `${row.clerkOrgId}:${row.controlId}`;
    if (!latestByOrgControl.has(key)) {
      latestByOrgControl.set(key, row);
    }
  }

  let downgradedControls = 0;
  let staleEvidence = 0;
  let tasksUpserted = 0;

  for (const row of latestByOrgControl.values()) {
    const control = heliosControlByKey.get(row.controlKey);
    if (!control) {
      continue;
    }

    const freshness = getHeliosEvidenceFreshness({
      collectedAt: row.collectedAt,
      controlKey: row.controlKey,
      now,
    });

    if (freshness.status !== "stale") {
      continue;
    }

    staleEvidence += 1;
    const isManualReviewEvidence =
      row.source === "manual" ||
      row.type === "attestation_answers" ||
      row.type === "helios_csv_import";
    const sourceType = isManualReviewEvidence
      ? "manual_evidence_review_due"
      : "workspace_evidence_stale";
    const sourceKey = isManualReviewEvidence
      ? getManualEvidenceReviewDueSourceKey(row.evidenceId)
      : `helios:stale:${row.evidenceId}`;
    const existingTask = await getRemediationTaskBySource({
      clerkOrgId: row.clerkOrgId,
      controlId: row.controlId,
      sourceKey,
      sourceType,
    });
    let taskId: string;
    if (isManualReviewEvidence) {
      const task = await upsertManualEvidenceReviewDueTask({
        clerkOrgId: row.clerkOrgId,
        collectedAt: row.collectedAt,
        controlId: row.controlId,
        controlKey: row.controlKey,
        dueDate: dateOnly(now),
        evidenceId: row.evidenceId,
        evidenceType: row.type,
        reason: "recertification_window_elapsed",
      });
      taskId = task.taskId;
    } else {
      const task = await upsertRemediationTask({
        clerkOrgId: row.clerkOrgId,
        controlId: row.controlId,
        controlKey: row.controlKey,
        description: `Latest Helios workspace evidence was collected on ${row.collectedAt?.toISOString().slice(0, 10) ?? "an unknown date"}. Re-attest this control or upload updated customer-reported evidence before relying on it.`,
        dueDate: dateOnly(now),
        frameworkRefs: frameworkRefsForControl(control),
        metadata: {
          collectedAt: row.collectedAt?.toISOString() ?? null,
          evidenceId: row.evidenceId,
          evidenceType: row.type,
          expiresAt: freshness.expires_at?.toISOString() ?? null,
          platformId: "helios",
          provenance: row.source === "imported" ? "customer_reported_import" : "manual_attestation",
          staleDays: freshness.staleDays,
          ttlDays: getHeliosEvidenceTtlDays(row.controlKey),
        },
        severity: control.nukibPriority === "high" ? "high" : "medium",
        sourceKey,
        sourceType: "workspace_evidence_stale",
        title: `Helios evidence is stale — ${row.controlKey}`,
      });
      taskId = task.id;
    }
    tasksUpserted += 1;

    if (row.status === "pass" || row.status === "manual_review") {
      await db
        .update(orgControlStatuses)
        .set({
          status: "manual_review",
          updatedAt: now,
        })
        .where(
          and(
            eq(orgControlStatuses.clerkOrgId, row.clerkOrgId),
            eq(orgControlStatuses.controlId, row.controlId),
          ),
        );
      downgradedControls += row.status === "pass" ? 1 : 0;
    }

    if (!existingTask) {
      await db.insert(auditLogs).values({
        action: "workspace.evidence_stale_checked",
        clerkOrgId: row.clerkOrgId,
        clerkUserId: null,
        entityId: row.evidenceId,
        entityType: "evidence",
        metadata: {
          controlKey: row.controlKey,
          platformId: "helios",
          staleDays: freshness.staleDays,
          taskId,
        },
      });
    }
  }

  return {
    downgradedControls,
    scannedEvidence: latestByOrgControl.size,
    staleEvidence,
    tasksUpserted,
  };
}
