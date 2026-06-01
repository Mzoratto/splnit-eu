import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { loadEnvConfig } from "@next/env";
import { and, eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  controls,
  evidence,
  organisations,
  orgControlStatuses,
} from "@/lib/db/schema";
import {
  createManualAttestationEvidence,
  listEvidenceVault,
} from "@/lib/db/queries/evidence";
import { getWorkspaceProgress } from "@/lib/db/queries/workspaces";
import { heliosWorkspace } from "@/lib/workspaces/helios";
import { seedHeliosControls } from "./seed-helios-controls";

loadEnvConfig(process.cwd());

const clerkOrgId = `org_smoke_helios_attestation_${randomUUID()}`;
const controlKey = "helios-iam-user-accounts";
const advisoryLockName = "smoke:helios-live-attestation";
const answers = {
  accountOwnership: "individual_accounts",
  sharedAccountsProhibited: true,
  lastUserReviewDate: "2026-01-15",
  reviewerRole: "security_owner",
};
const assessmentResult = "manual_review" as const;

async function cleanup() {
  const db = getDb();
  await db.delete(evidence).where(eq(evidence.clerkOrgId, clerkOrgId));
  await db
    .delete(orgControlStatuses)
    .where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
  await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));

  const remainingOrgRows = await db
    .select({ clerkOrgId: organisations.clerkOrgId })
    .from(organisations)
    .where(eq(organisations.clerkOrgId, clerkOrgId));
  const remainingEvidenceRows = await db
    .select({ id: evidence.id })
    .from(evidence)
    .where(eq(evidence.clerkOrgId, clerkOrgId));
  const remainingStatusRows = await db
    .select({ id: orgControlStatuses.id })
    .from(orgControlStatuses)
    .where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));

  return {
    remainingEvidenceRows: remainingEvidenceRows.length,
    remainingOrgRows: remainingOrgRows.length,
    remainingStatusRows: remainingStatusRows.length,
  };
}

async function main() {
  const db = getDb();
  let cleanupResult: Awaited<ReturnType<typeof cleanup>> | null = null;

  await db.execute(sql`select pg_advisory_lock(hashtext(${advisoryLockName}))`);
  try {
    await seedHeliosControls();
    await db.insert(organisations).values({
      clerkOrgId,
      name: "Helios live attestation smoke org",
      country: "CZ",
      primaryJurisdiction: "CZ",
      locale: "cs-CZ",
    });

    const [control] = await db
      .select({
        id: controls.id,
        key: controls.key,
        isAutomated: controls.isAutomated,
        testType: controls.testType,
      })
      .from(controls)
      .where(eq(controls.key, controlKey))
      .limit(1);

    assert(control, `${controlKey} must exist after targeted Helios seed`);
    assert.equal(control.key, controlKey);
    assert.equal(control.isAutomated, false, "Helios IAM control must remain manual");

    const progressBefore = await getWorkspaceProgress(clerkOrgId, heliosWorkspace);
    const iamLayerBefore = progressBefore.layers.find((layer) => layer.layerId === "iam");
    const controlBefore = iamLayerBefore?.controls.find(
      (entry) => entry.controlKey === controlKey,
    );

    assert(iamLayerBefore, "IAM layer must be present in Helios workspace progress");
    assert(controlBefore, "selected IAM control must be present before evidence");
    assert.equal(progressBefore.completedControls, 0);
    assert.equal(controlBefore.hasEvidence, false);

    const result = await createManualAttestationEvidence({
      answers,
      assessmentResult,
      clerkOrgId,
      collectedBy: "helios-live-attestation-smoke",
      controlKey,
      description: "Live manual attestation smoke row for Helios IAM accounts",
    });

    const [joinedEvidence] = await db
      .select({
        assessmentResult: evidence.assessmentResult,
        collectionStatus: evidence.collectionStatus,
        controlKey: controls.key,
        source: evidence.source,
        snapshotData: evidence.snapshotData,
        type: evidence.type,
      })
      .from(evidence)
      .innerJoin(controls, eq(evidence.controlId, controls.id))
      .where(
        and(
          eq(evidence.clerkOrgId, clerkOrgId),
          eq(evidence.id, result.evidenceId),
        ),
      )
      .limit(1);

    assert(joinedEvidence, "manual attestation evidence row must exist");
    assert.equal(joinedEvidence.controlKey, controlKey);
    assert.equal(joinedEvidence.type, "attestation_answers");
    assert.equal(joinedEvidence.source, "manual");
    assert.equal(joinedEvidence.collectionStatus, "collected");
    assert.equal(joinedEvidence.assessmentResult, assessmentResult);
    assert.deepEqual(
      (joinedEvidence.snapshotData as { attestationAnswers?: unknown })?.attestationAnswers,
      answers,
    );

    const [statusRow] = await db
      .select({
        controlId: orgControlStatuses.controlId,
        lastEvidenceAt: orgControlStatuses.lastEvidenceAt,
      })
      .from(orgControlStatuses)
      .where(
        and(
          eq(orgControlStatuses.clerkOrgId, clerkOrgId),
          eq(orgControlStatuses.controlId, result.controlId),
        ),
      )
      .limit(1);

    assert(statusRow, "org control status row must exist after attestation");
    assert(statusRow.lastEvidenceAt, "org control status must have lastEvidenceAt");

    const progressAfter = await getWorkspaceProgress(clerkOrgId, heliosWorkspace);
    const iamLayerAfter = progressAfter.layers.find((layer) => layer.layerId === "iam");
    const controlAfter = iamLayerAfter?.controls.find(
      (entry) => entry.controlKey === controlKey,
    );

    assert(iamLayerAfter, "IAM layer must be present after evidence");
    assert(controlAfter, "selected IAM control must be present after evidence");
    assert(progressAfter.completedControls >= 1);
    assert.equal(controlAfter.hasEvidence, true);
    assert.equal(controlAfter.evidenceId, result.evidenceId);
    assert.equal(controlAfter.assessmentResult, assessmentResult);

    const vaultRows = await listEvidenceVault(clerkOrgId);
    const vaultRow = vaultRows.find((row) => row.evidenceId === result.evidenceId);

    assert(vaultRow, "manual attestation evidence must appear in evidence vault");
    assert.equal(vaultRow.controlKey, controlKey);
    assert.equal(vaultRow.type, "attestation_answers");
    assert.equal(vaultRow.source, "manual");
    assert.equal(vaultRow.collectionStatus, "collected");
    assert.equal(vaultRow.assessmentResult, assessmentResult);

    console.log("helios live attestation smoke passed");
    console.log(`  org: ${clerkOrgId}`);
    console.log(`  control: ${joinedEvidence.controlKey}`);
    console.log(`  evidence type: ${joinedEvidence.type}`);
    console.log(`  source: ${joinedEvidence.source}`);
    console.log(`  assessment result: ${joinedEvidence.assessmentResult}`);
    console.log(`  workspace completed controls before: ${progressBefore.completedControls}`);
    console.log(`  workspace completed controls after: ${progressAfter.completedControls}`);
    console.log(`  IAM control has evidence: ${controlAfter.hasEvidence}`);
  } finally {
    cleanupResult = await cleanup();
    await db.execute(sql`select pg_advisory_unlock(hashtext(${advisoryLockName}))`);
    console.log(
      `cleanup ${clerkOrgId}: organisations=${cleanupResult.remainingOrgRows}, evidence=${cleanupResult.remainingEvidenceRows}, statuses=${cleanupResult.remainingStatusRows}`,
    );
  }
}

main().catch((error) => {
  console.error("helios live attestation smoke failed");
  console.error(error);
  process.exit(1);
});
