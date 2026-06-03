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
    description: "Initial connector gap task.",
    dueDate: "2026-06-30",
    frameworkRefs: [{ frameworkId: "zokb", reference: "§ 7" }],
    metadata: { connectorId: "helios", findingId: "evidence-a", staleDays: 12 },
    severity: "medium",
    sourceKey: "helios:connector-gap:evidence-a",
    sourceType: "connector_gap",
    title: "Helios connector gap needs review",
  });

  const second = await upsertRemediationTask({
    clerkOrgId,
    controlId,
    controlKey,
    description: "Updated connector gap task.",
    dueDate: "2026-07-01",
    frameworkRefs: [{ frameworkId: "zokb", reference: "§ 7" }],
    metadata: { connectorId: "helios", findingId: "evidence-a", staleDays: 13 },
    severity: "high",
    sourceKey: "helios:connector-gap:evidence-a",
    sourceType: "connector_gap",
    title: "Helios connector gap is current",
  });

  assert.equal(second.id, first.id, "same source key should update the existing task.");
  assert.equal(second.title, "Helios connector gap is current");
  assert.equal(second.severity, "high");
  assert.equal(second.status, "open", "re-seen connector gaps should stay open.");

  const duplicateRows = await db
    .select({ id: remediationTasks.id, status: remediationTasks.status })
    .from(remediationTasks)
    .where(
      and(
        eq(remediationTasks.clerkOrgId, clerkOrgId),
        eq(remediationTasks.controlId, controlId),
        eq(remediationTasks.sourceType, "connector_gap"),
        eq(remediationTasks.sourceKey, "helios:connector-gap:evidence-a"),
      ),
    );
  assert.equal(duplicateRows.length, 1, "upsert should not create duplicates.");

  const openTasks = await listOpenRemediationTasksForOrg(clerkOrgId);
  assert.equal(openTasks.length, 1);

  const resolved = await updateRemediationTaskStatus({
    clerkOrgId,
    status: "resolved",
    taskId: first.id,
  });
  assert.equal(resolved.status, "resolved");
  assert.equal((await listOpenRemediationTasksForOrg(clerkOrgId)).length, 0);

  const resolvedRows = await db
    .select({ id: remediationTasks.id, status: remediationTasks.status })
    .from(remediationTasks)
    .where(
      and(
        eq(remediationTasks.clerkOrgId, clerkOrgId),
        eq(remediationTasks.controlId, controlId),
        eq(remediationTasks.sourceType, "connector_gap"),
        eq(remediationTasks.sourceKey, "helios:connector-gap:evidence-a"),
      ),
    );
  assert.deepEqual(
    resolvedRows.map((row) => row.status),
    ["resolved"],
    "connector passes should resolve and retain the source task row, not delete it.",
  );

  const reopened = await upsertRemediationTask({
    clerkOrgId,
    controlId,
    controlKey,
    description: "Connector gap returned after a later run.",
    dueDate: "2026-07-02",
    frameworkRefs: [{ frameworkId: "zokb", reference: "§ 7" }],
    metadata: { connectorId: "helios", findingId: "evidence-a", staleDays: 14 },
    severity: "high",
    sourceKey: "helios:connector-gap:evidence-a",
    sourceType: "connector_gap",
    title: "Helios connector gap reopened",
  });
  assert.equal(reopened.id, first.id, "re-seen resolved connector gap should reuse the source row.");
  assert.equal(reopened.status, "open", "re-seen resolved connector gap should reset to open.");
  assert.equal(reopened.title, "Helios connector gap reopened");

  await cleanup();
  console.log("Remediation task smoke passed.");
}

main().catch(async (error) => {
  await cleanup().catch(() => undefined);
  console.error(error);
  process.exit(1);
});
