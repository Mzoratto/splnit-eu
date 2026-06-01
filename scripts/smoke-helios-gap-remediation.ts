import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  controls,
  evidence,
  orgControlStatuses,
  organisations,
  remediationTasks,
} from "@/lib/db/schema";
import { createManualAttestationEvidence } from "@/lib/db/queries/evidence";
import { deriveWorkspaceAttestationAssessmentResult } from "@/lib/workspaces/attestation";
import { upsertHeliosGapRemediationTask } from "@/lib/workspaces/helios/lifecycle";

loadEnvConfig(process.cwd());
assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required.");

const db = getDb();
const runId = `helios_gap_${Date.now()}`;
const clerkOrgId = `${runId}_org`;
const controlKey = "helios-iam-user-accounts";

async function cleanup() {
  await db.delete(remediationTasks).where(eq(remediationTasks.clerkOrgId, clerkOrgId));
  await db.delete(evidence).where(eq(evidence.clerkOrgId, clerkOrgId));
  await db.delete(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
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
  await db
    .insert(controls)
    .values({
      key: controlKey,
      titleCs: "Helios účty uživatelů",
      titleEn: "Helios user accounts",
      testType: "manual",
    })
    .onConflictDoUpdate({
      target: controls.key,
      set: { testType: "manual" },
    });
}

async function main() {
  await cleanup();
  await seed();

  assert.equal(
    deriveWorkspaceAttestationAssessmentResult({ answer: "yes" }, { platformId: "helios" }),
    "manual_review",
    "Helios yes-attestation must not auto-pass.",
  );
  assert.equal(
    deriveWorkspaceAttestationAssessmentResult({ answer: "yes" }, { platformId: "pohoda" }),
    "pass",
    "Non-Helios attestation behavior should remain unchanged.",
  );
  assert.equal(
    deriveWorkspaceAttestationAssessmentResult({ answer: "no" }, { platformId: "helios" }),
    "gap",
  );

  const result = await createManualAttestationEvidence({
    answers: { answer: "no", notes: "Sdílený admin účet nalezen." },
    assessmentResult: "gap",
    clerkOrgId,
    collectedBy: `${runId}_user`,
    controlKey,
    description: "Workspace attestation — platform: helios, layer: iam",
  });

  const firstTask = await upsertHeliosGapRemediationTask({
    assessmentResult: "gap",
    clerkOrgId,
    controlId: result.controlId,
    controlKey,
    evidenceId: result.evidenceId,
  });
  const secondTask = await upsertHeliosGapRemediationTask({
    assessmentResult: "gap",
    clerkOrgId,
    controlId: result.controlId,
    controlKey,
    evidenceId: result.evidenceId,
  });
  assert.ok(firstTask?.id, "gap evidence should create remediation task.");
  assert.equal(secondTask?.id, firstTask.id, "gap task upsert should be idempotent.");

  const tasks = await db
    .select()
    .from(remediationTasks)
    .where(eq(remediationTasks.clerkOrgId, clerkOrgId));
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0]?.sourceType, "workspace_gap");
  assert.equal(tasks[0]?.sourceKey, `helios:gap:${result.evidenceId}`);
  assert.ok(JSON.stringify(tasks[0]?.frameworkRefs).includes("Article 21"));

  await cleanup();
  console.log("Helios gap remediation smoke passed.");
}

main().catch(async (error) => {
  await cleanup().catch(() => undefined);
  console.error(error);
  process.exit(1);
});
