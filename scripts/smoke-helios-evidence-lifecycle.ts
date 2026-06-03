import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  auditLogs,
  controls,
  evidence,
  orgControlStatuses,
  organisations,
  remediationTasks,
} from "@/lib/db/schema";
import { processHeliosWorkspaceEvidenceLifecycle } from "@/lib/workspaces/helios/lifecycle";

loadEnvConfig(process.cwd());
assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required.");

const db = getDb();
const runId = `helios_lifecycle_${Date.now()}`;
const clerkOrgId = `${runId}_org`;
const now = new Date("2026-06-01T12:00:00.000Z");

async function getOrCreateControl(controlKey: string) {
  await db
    .insert(controls)
    .values({
      key: controlKey,
      titleCs: controlKey,
      titleEn: controlKey,
      testType: "manual",
    })
    .onConflictDoUpdate({
      target: controls.key,
      set: {
        testType: "manual",
      },
    });

  const [control] = await db
    .select({ id: controls.id })
    .from(controls)
    .where(eq(controls.key, controlKey))
    .limit(1);
  assert.ok(control?.id, `control ${controlKey} should exist.`);
  return control.id;
}

async function cleanup() {
  await db.delete(remediationTasks).where(eq(remediationTasks.clerkOrgId, clerkOrgId));
  await db.delete(evidence).where(eq(evidence.clerkOrgId, clerkOrgId));
  await db.delete(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
  await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
}

async function seedEvidence(input: {
  assessmentResult: "manual_review" | "gap" | "pass";
  collectedAt: Date;
  controlKey: string;
  status: "manual_review" | "gap" | "pass" | "unknown";
}) {
  const controlId = await getOrCreateControl(input.controlKey);
  const [row] = await db
    .insert(evidence)
    .values({
      assessmentResult: input.assessmentResult,
      clerkOrgId,
      collectedAt: input.collectedAt,
      collectedBy: `${runId}_user`,
      collectionStatus: "collected",
      confidence: "medium",
      controlId,
      description: "Workspace attestation — platform: helios, layer: iam",
      snapshotData: { attestationAnswers: { answer: "yes" }, platformId: "helios" },
      source: "manual",
      type: "attestation_answers",
    })
    .returning({ id: evidence.id });
  assert.ok(row?.id, "evidence should be inserted.");

  await db.insert(orgControlStatuses).values({
    clerkOrgId,
    controlId,
    lastEvidenceAt: input.collectedAt,
    status: input.status,
  });

  return { controlId, evidenceId: row.id };
}

async function main() {
  await cleanup();
  await db.insert(organisations).values({
    clerkOrgId,
    country: "CZ",
    locale: "cs-CZ",
    name: runId,
    primaryJurisdiction: "CZ",
  });

  const stalePass = await seedEvidence({
    assessmentResult: "pass",
    collectedAt: new Date("2025-12-01T12:00:00.000Z"),
    controlKey: "helios-iam-user-accounts",
    status: "pass",
  });
  const staleGap = await seedEvidence({
    assessmentResult: "gap",
    collectedAt: new Date("2025-12-01T12:00:00.000Z"),
    controlKey: "helios-backup-sql-agent-jobs",
    status: "gap",
  });
  await seedEvidence({
    assessmentResult: "manual_review",
    collectedAt: new Date("2026-05-25T12:00:00.000Z"),
    controlKey: "helios-iam-offboarding",
    status: "manual_review",
  });

  const firstRun = await processHeliosWorkspaceEvidenceLifecycle(now);
  const secondRun = await processHeliosWorkspaceEvidenceLifecycle(now);

  assert.equal(firstRun.scannedEvidence, 3);
  assert.equal(firstRun.staleEvidence, 2);
  assert.equal(firstRun.downgradedControls, 1);
  assert.equal(secondRun.staleEvidence, 2);

  const tasks = await db
    .select()
    .from(remediationTasks)
    .where(eq(remediationTasks.clerkOrgId, clerkOrgId));
  assert.equal(tasks.length, 2, "stale processing should be idempotent across reruns.");
  assert.ok(
    tasks.every((task) => task.sourceType === "manual_evidence_review_due"),
    "stale manual workspace evidence should create review-due tasks, not upload-time tasks.",
  );
  assert.ok(
    tasks.some((task) => task.sourceKey === `manual-evidence-review:${stalePass.evidenceId}`),
    "stale pass evidence should get a manual review-due task.",
  );
  assert.ok(
    tasks.some((task) => task.sourceKey === `manual-evidence-review:${staleGap.evidenceId}`),
    "stale gap evidence should get a manual review-due task.",
  );

  const [passStatus] = await db
    .select({ status: orgControlStatuses.status })
    .from(orgControlStatuses)
    .where(
      and(
        eq(orgControlStatuses.clerkOrgId, clerkOrgId),
        eq(orgControlStatuses.controlId, stalePass.controlId),
      ),
    );
  assert.equal(passStatus?.status, "manual_review", "stale pass should downgrade to review.");

  const [gapStatus] = await db
    .select({ status: orgControlStatuses.status })
    .from(orgControlStatuses)
    .where(
      and(
        eq(orgControlStatuses.clerkOrgId, clerkOrgId),
        eq(orgControlStatuses.controlId, staleGap.controlId),
      ),
    );
  assert.equal(gapStatus?.status, "gap", "stale gap should remain a gap.");

  const auditRows = await db
    .select({ id: auditLogs.id })
    .from(auditLogs)
    .where(eq(auditLogs.clerkOrgId, clerkOrgId));
  assert.equal(auditRows.length, 2, "rerun should not duplicate stale audit logs.");

  await cleanup();
  console.log("Helios evidence lifecycle smoke passed.");
}

main().catch(async (error) => {
  await cleanup().catch(() => undefined);
  console.error(error);
  process.exit(1);
});
