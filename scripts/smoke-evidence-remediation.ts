import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { and, eq } from "drizzle-orm";
import { createManualEvidence } from "@/lib/db/queries/evidence";
import { updateRemediationTaskStatus } from "@/lib/db/queries/remediation-tasks";
import { getDb } from "@/lib/db";
import {
  controls,
  evidence,
  orgControlStatuses,
  organisations,
  remediationTasks,
} from "@/lib/db/schema";
import {
  getConnectorRemediationSourceKey,
  syncConnectorRemediationForEvidence,
  upsertManualEvidenceReviewDueTask,
} from "@/lib/evidence/remediation";

loadEnvConfig(process.cwd());
assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required.");

const db = getDb();
const runId = `evidence_remediation_${Date.now()}`;
const clerkOrgId = `${runId}_org`;
const controlKey = `${runId}_control`;

async function cleanup() {
  await db.delete(remediationTasks).where(eq(remediationTasks.clerkOrgId, clerkOrgId));
  await db.delete(evidence).where(eq(evidence.clerkOrgId, clerkOrgId));
  await db.delete(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
  await db.delete(controls).where(eq(controls.key, controlKey));
  await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
}

async function seed() {
  await db.insert(organisations).values({
    clerkOrgId,
    country: "CZ",
    locale: "cs-CZ",
    name: runId,
    primaryJurisdiction: "CZ",
  });

  const [control] = await db
    .insert(controls)
    .values({
      key: controlKey,
      titleCs: "Evidence remediation smoke",
      titleEn: "Evidence remediation smoke",
      testType: "integration",
    })
    .returning({ id: controls.id });
  assert.ok(control?.id, "control should be inserted.");

  return control.id;
}

async function listTasks() {
  return db
    .select()
    .from(remediationTasks)
    .where(eq(remediationTasks.clerkOrgId, clerkOrgId));
}

async function main() {
  await cleanup();
  const controlId = await seed();
  const sourceKey = getConnectorRemediationSourceKey({
    checkLogic: "repo_branch_protection",
    provider: "github",
  });
  assert.equal(sourceKey, "connector:github:repo_branch_protection");

  const firstGap = await syncConnectorRemediationForEvidence({
    checkLogic: "repo_branch_protection",
    clerkOrgId,
    controlId,
    controlKey,
    evidenceId: "evidence-gap-a",
    failureReason: "Branch protection is disabled.",
    passCriteria: "Default branch requires pull request review.",
    provider: "github",
    resultData: { protected: false },
    status: "fail",
    testName: "GitHub branch protection",
  });
  assert.equal(firstGap.action, "upserted");
  assert.equal(firstGap.sourceType, "connector_gap");

  let tasks = await listTasks();
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0]?.sourceType, "connector_gap");
  assert.equal(tasks[0]?.sourceKey, sourceKey);
  assert.equal(tasks[0]?.status, "open");

  await db
    .update(remediationTasks)
    .set({ dueDate: "2026-01-15" })
    .where(eq(remediationTasks.id, tasks[0]!.id));
  const repeatedOpenGap = await syncConnectorRemediationForEvidence({
    checkLogic: "repo_branch_protection",
    clerkOrgId,
    controlId,
    controlKey,
    evidenceId: "evidence-gap-open-rerun",
    failureReason: "Branch protection remains disabled.",
    passCriteria: "Default branch requires pull request review.",
    provider: "github",
    resultData: { protected: false, rerun: "open" },
    status: "fail",
    testName: "GitHub branch protection",
  });
  assert.equal(repeatedOpenGap.action, "upserted");
  tasks = await listTasks();
  assert.equal(tasks.length, 1);
  assert.equal(
    tasks[0]?.dueDate,
    "2026-01-15",
    "repeated open connector findings must preserve their existing due date.",
  );

  await updateRemediationTaskStatus({
    clerkOrgId,
    status: "resolved",
    taskId: tasks[0]!.id,
  });

  const reopenedGap = await syncConnectorRemediationForEvidence({
    checkLogic: "repo_branch_protection",
    clerkOrgId,
    controlId,
    controlKey,
    evidenceId: "evidence-gap-b",
    failureReason: "Branch protection is still disabled.",
    passCriteria: "Default branch requires pull request review.",
    provider: "github",
    resultData: { protected: false, rerun: true },
    status: "fail",
    testName: "GitHub branch protection",
  });
  assert.equal(reopenedGap.action, "upserted");
  assert.equal(reopenedGap.taskId, tasks[0]!.id, "same finding should reuse the unique task row.");

  tasks = await listTasks();
  assert.equal(tasks.length, 1, "rerun should not create duplicate connector gap tasks.");
  assert.equal(tasks[0]?.status, "open", "rerun of the finding should reopen a resolved task.");
  assert.equal(tasks[0]?.metadata?.evidenceId, "evidence-gap-b");

  const resolvedGap = await syncConnectorRemediationForEvidence({
    checkLogic: "repo_branch_protection",
    clerkOrgId,
    controlId,
    controlKey,
    evidenceId: "evidence-pass-a",
    passCriteria: "Default branch requires pull request review.",
    provider: "github",
    resultData: { protected: true },
    status: "pass",
    testName: "GitHub branch protection",
  });
  assert.equal(resolvedGap.action, "resolved");
  assert.equal(resolvedGap.tasksResolved, 1, "pass must explicitly resolve the existing connector task.");

  tasks = await listTasks();
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0]?.status, "resolved");

  const blocked = await syncConnectorRemediationForEvidence({
    checkLogic: "repo_branch_protection",
    clerkOrgId,
    controlId,
    controlKey,
    evidenceId: "evidence-blocked-a",
    failureReason: "Missing GitHub repository permission.",
    passCriteria: "Default branch requires pull request review.",
    provider: "github",
    resultData: { blockedReason: "missing_permission" },
    status: "error",
    testName: "GitHub branch protection",
  });
  assert.equal(blocked.action, "upserted");
  assert.equal(blocked.sourceType, "connector_blocked");

  tasks = await listTasks();
  assert.equal(tasks.filter((task) => task.sourceType === "connector_blocked").length, 1);

  const resolvedBlocked = await syncConnectorRemediationForEvidence({
    checkLogic: "repo_branch_protection",
    clerkOrgId,
    controlId,
    controlKey,
    evidenceId: "evidence-pass-b",
    passCriteria: "Default branch requires pull request review.",
    provider: "github",
    resultData: { protected: true },
    status: "pass",
    testName: "GitHub branch protection",
  });
  if (resolvedBlocked.action !== "resolved") {
    throw new Error("Passing connector evidence should resolve the blocked remediation task.");
  }
  assert.equal(resolvedBlocked.tasksResolved, 1, "pass should also resolve connector_blocked tasks.");

  const manualEvidence = await createManualEvidence({
    assessmentResult: "manual_review",
    blobUrl: null,
    clerkOrgId,
    collectedBy: `${runId}_user`,
    controlKey,
    description: "Fresh manual upload should not create a review-due task.",
    expiresAt: null,
    fileType: "manual_upload",
  });

  const uploadTasks = await db
    .select()
    .from(remediationTasks)
    .where(
      and(
        eq(remediationTasks.clerkOrgId, clerkOrgId),
        eq(remediationTasks.sourceType, "manual_evidence_review_due"),
      ),
    );
  assert.equal(uploadTasks.length, 0, "manual upload path must not create review-due tasks immediately.");

  const reviewDue = await upsertManualEvidenceReviewDueTask({
    clerkOrgId,
    collectedAt: new Date("2025-12-01T12:00:00.000Z"),
    controlId: manualEvidence.controlId,
    controlKey,
    dueDate: "2026-06-01",
    evidenceId: manualEvidence.evidenceId,
    evidenceType: "manual_upload",
    reason: "recertification_window_elapsed",
  });
  assert.equal(reviewDue.action, "upserted");

  const reviewDueTasks = await db
    .select()
    .from(remediationTasks)
    .where(
      and(
        eq(remediationTasks.clerkOrgId, clerkOrgId),
        eq(remediationTasks.sourceType, "manual_evidence_review_due"),
      ),
    );
  assert.equal(reviewDueTasks.length, 1);
  assert.equal(reviewDueTasks[0]?.sourceKey, `manual-evidence-review:${manualEvidence.evidenceId}`);
  assert.equal(reviewDueTasks[0]?.status, "open");

  await cleanup();
  console.log("Evidence remediation smoke passed.");
}

main().catch(async (error) => {
  await cleanup().catch(() => undefined);
  console.error(error);
  process.exit(1);
});
