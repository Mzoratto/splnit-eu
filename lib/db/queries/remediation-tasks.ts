import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  remediationTasks,
  type RemediationTaskSeverity,
  type RemediationTaskSourceType,
  type RemediationTaskStatus,
} from "@/lib/db/schema";

export type UpsertRemediationTaskInput = {
  clerkOrgId: string;
  controlId: string;
  controlKey: string;
  description?: string | null;
  dueDate?: string | null;
  frameworkRefs?: Record<string, unknown>[];
  metadata?: Record<string, unknown>;
  severity?: RemediationTaskSeverity;
  sourceKey: string;
  sourceType: RemediationTaskSourceType;
  status?: Extract<RemediationTaskStatus, "open" | "in_progress">;
  title: string;
};

export async function upsertRemediationTask(input: UpsertRemediationTaskInput) {
  const db = getDb();
  const now = new Date();
  const [task] = await db
    .insert(remediationTasks)
    .values({
      clerkOrgId: input.clerkOrgId,
      controlId: input.controlId,
      controlKey: input.controlKey,
      description: input.description ?? null,
      dueDate: input.dueDate ?? null,
      frameworkRefs: input.frameworkRefs ?? [],
      metadata: input.metadata ?? {},
      severity: input.severity ?? "medium",
      sourceKey: input.sourceKey,
      sourceType: input.sourceType,
      status: input.status ?? "open",
      title: input.title,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [
        remediationTasks.clerkOrgId,
        remediationTasks.controlId,
        remediationTasks.sourceType,
        remediationTasks.sourceKey,
      ],
      set: {
        controlKey: input.controlKey,
        description: input.description ?? null,
        dueDate: input.dueDate ?? null,
        frameworkRefs: input.frameworkRefs ?? [],
        metadata: input.metadata ?? {},
        severity: input.severity ?? "medium",
        status: input.status ?? "open",
        title: input.title,
        updatedAt: now,
      },
    })
    .returning();

  if (!task) {
    throw new Error("Failed to upsert remediation task.");
  }

  return task;
}

export async function listOpenRemediationTasksForOrg(clerkOrgId: string) {
  const db = getDb();

  return db
    .select()
    .from(remediationTasks)
    .where(
      and(
        eq(remediationTasks.clerkOrgId, clerkOrgId),
        eq(remediationTasks.status, "open"),
      ),
    )
    .orderBy(desc(remediationTasks.updatedAt));
}

export async function updateRemediationTaskStatus(input: {
  clerkOrgId: string;
  status: Extract<RemediationTaskStatus, "resolved" | "dismissed" | "in_progress" | "open">;
  taskId: string;
}) {
  const db = getDb();
  const [task] = await db
    .update(remediationTasks)
    .set({
      status: input.status,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(remediationTasks.clerkOrgId, input.clerkOrgId),
        eq(remediationTasks.id, input.taskId),
      ),
    )
    .returning();

  if (!task) {
    throw new Error("Remediation task not found.");
  }

  return task;
}
