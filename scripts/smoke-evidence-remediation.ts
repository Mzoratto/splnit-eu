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

const connectorTaskCopyForbiddenPatterns = [
  /\bcompliant\b/i,
  /\bcertified\b/i,
  /\bauditor-ready\b/i,
  /\blegal proof\b/i,
  /\bsatisfies Article\b/i,
  /\bready for audit\b/i,
  /\bcompliance status\b/i,
  /\bspln(?:ě|e)n(?:í|i|o|ou|á|a|ý|y|é|e)?\b/i,
  /\bv souladu\b/i,
  /\bprávn(?:í|i) důkaz\b/i,
  /\bconforme\b/i,
  /\bcertificat/i,
  /\bprova legale\b/i,
] as const;

const connectorBlockedCopyForbiddenPatterns = [
  /\b(?:failed|failure|errored|error)\b/i,
  /\b(?:selhal|selhala|selhání|selhani|neuspěl|neuspela|neúspěch|neuspech)\b/i,
  /\b(?:fallito|fallita|fallimento|errore)\b/i,
] as const;

function assertConnectorTaskCopySafe(
  task: Awaited<ReturnType<typeof listTasks>>[number],
  label: string,
) {
  const text = `${task.title}\n${task.description ?? ""}`;

  for (const pattern of connectorTaskCopyForbiddenPatterns) {
    assert.doesNotMatch(text, pattern, `${label} must not inflate remediation copy into proof/compliance posture.`);
  }

  if (task.sourceType === "connector_blocked") {
    for (const pattern of connectorBlockedCopyForbiddenPatterns) {
      assert.doesNotMatch(text, pattern, `${label} must say blocked/needs attention, not failed/error.`);
    }
  }
}

async function assertConnectorStatusCreatesGap(input: {
  checkLogic: string;
  controlId: string;
  evidenceId: string;
  failureReason: string;
  status: "warning" | "manual_review";
  testName: string;
}) {
  const result = await syncConnectorRemediationForEvidence({
    checkLogic: input.checkLogic,
    clerkOrgId,
    controlId: input.controlId,
    controlKey,
    evidenceId: input.evidenceId,
    failureReason: input.failureReason,
    passCriteria: "Connector result must be reviewed before treating the control as ready.",
    provider: "github",
    resultData: { status: input.status },
    status: input.status,
    testName: input.testName,
  });

  assert.equal(result.action, "upserted", `${input.status} connector result must create a remediation task.`);
  assert.equal(result.sourceType, "connector_gap", `${input.status} connector result must map to connector_gap.`);

  const [task] = (await listTasks()).filter((row) => row.id === result.taskId);
  assert.ok(task, `${input.status} connector gap task should exist.`);
  assert.equal(task.sourceType, "connector_gap");
  assertConnectorTaskCopySafe(task, `${input.status} connector gap remediation task`);
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
  assertConnectorTaskCopySafe(tasks[0]!, "connector_gap remediation task");

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
  const blockedTasks = tasks.filter((task) => task.sourceType === "connector_blocked");
  assert.equal(blockedTasks.length, 1);
  assertConnectorTaskCopySafe(blockedTasks[0]!, "connector_blocked remediation task");

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

  await assertConnectorStatusCreatesGap({
    checkLogic: "repo_secret_scanning_warning",
    controlId,
    evidenceId: "evidence-warning-a",
    failureReason: "Secret scanning needs review before this can be treated as ready.",
    status: "warning",
    testName: "GitHub secret scanning warning",
  });
  await assertConnectorStatusCreatesGap({
    checkLogic: "repo_dependency_manual_review",
    controlId,
    evidenceId: "evidence-manual-review-a",
    failureReason: "Dependency alert status requires human review.",
    status: "manual_review",
    testName: "GitHub dependency review",
  });

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
