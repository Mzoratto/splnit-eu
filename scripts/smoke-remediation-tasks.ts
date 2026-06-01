import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { controls, organisations, remediationTasks } from "@/lib/db/schema";
import {
  listOpenRemediationTasksForOrg,
  updateRemediationTaskStatus,
  upsertRemediationTask,
} from "@/lib/db/queries/remediation-tasks";

loadEnvConfig(process.cwd());

assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required.");

const db = getDb();
const runId = `remediation_smoke_${Date.now()}`;
const clerkOrgId = `${runId}_org`;
const controlKey = `${runId}_control`;

async function cleanup() {
  await db.delete(remediationTasks).where(eq(remediationTasks.clerkOrgId, clerkOrgId));
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
      titleCs: "Smoke kontrola",
      titleEn: "Smoke control",
      testType: "manual",
    })
    .returning({ id: controls.id });

  assert.ok(control?.id, "control should be inserted.");
  return control.id;
}

async function main() {
  await cleanup();
  const controlId = await seed();

  const first = await upsertRemediationTask({
    clerkOrgId,
    controlId,
    controlKey,
    description: "Initial stale evidence task.",
    dueDate: "2026-06-30",
    frameworkRefs: [{ frameworkId: "zokb", reference: "§ 7" }],
    metadata: { evidenceId: "evidence-a", staleDays: 12 },
    severity: "medium",
    sourceKey: "helios:stale:evidence-a",
    sourceType: "workspace_evidence_stale",
    title: "Helios evidence needs review",
  });

  const second = await upsertRemediationTask({
    clerkOrgId,
    controlId,
    controlKey,
    description: "Updated stale evidence task.",
    dueDate: "2026-07-01",
    frameworkRefs: [{ frameworkId: "zokb", reference: "§ 7" }],
    metadata: { evidenceId: "evidence-a", staleDays: 13 },
    severity: "high",
    sourceKey: "helios:stale:evidence-a",
    sourceType: "workspace_evidence_stale",
    title: "Helios evidence is stale",
  });

  assert.equal(second.id, first.id, "same source key should update the existing task.");
  assert.equal(second.title, "Helios evidence is stale");
  assert.equal(second.severity, "high");

  const duplicateRows = await db
    .select({ id: remediationTasks.id })
    .from(remediationTasks)
    .where(
      and(
        eq(remediationTasks.clerkOrgId, clerkOrgId),
        eq(remediationTasks.controlId, controlId),
        eq(remediationTasks.sourceType, "workspace_evidence_stale"),
        eq(remediationTasks.sourceKey, "helios:stale:evidence-a"),
      ),
    );
  assert.equal(duplicateRows.length, 1, "upsert should not create duplicates.");

  const openTasks = await listOpenRemediationTasksForOrg(clerkOrgId);
  assert.equal(openTasks.length, 1);

  await updateRemediationTaskStatus({
    clerkOrgId,
    status: "resolved",
    taskId: first.id,
  });
  assert.equal((await listOpenRemediationTasksForOrg(clerkOrgId)).length, 0);

  await cleanup();
  console.log("Remediation task smoke passed.");
}

main().catch(async (error) => {
  await cleanup().catch(() => undefined);
  console.error(error);
  process.exit(1);
});
