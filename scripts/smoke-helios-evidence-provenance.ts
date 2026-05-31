import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { loadEnvConfig } from "@next/env";
import { eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  evidence,
  organisations,
  orgControlStatuses,
} from "@/lib/db/schema";
import {
  createHeliosCsvImportEvidence,
  createManualAttestationEvidence,
  getEvidenceForOrg,
  listEvidenceVault,
} from "@/lib/db/queries/evidence";
import { getWorkspaceProgress } from "@/lib/db/queries/workspaces";
import { heliosWorkspace } from "@/lib/workspaces/helios";
import { seedHeliosControls } from "./seed-helios-controls";

loadEnvConfig(process.cwd());

const clerkOrgId = `org_smoke_helios_provenance_${randomUUID()}`;
const manualControlKey = "helios-iam-user-accounts";
const csvControlKey = "helios-api-tls-enforcement";

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

  await db.execute(sql`select pg_advisory_lock(hashtext('smoke:helios-evidence-provenance'))`);
  try {
    await seedHeliosControls();
    await db.insert(organisations).values({
      clerkOrgId,
      name: "Helios provenance smoke org",
      country: "CZ",
      primaryJurisdiction: "CZ",
      locale: "cs-CZ",
    });

    const manualResult = await createManualAttestationEvidence({
      answers: {
        accountOwnership: "individual_accounts",
        sharedAccountsProhibited: true,
      },
      clerkOrgId,
      collectedBy: "helios-provenance-smoke",
      controlKey: manualControlKey,
      description: "Manual attestation smoke row",
    });

    const csvResult = await createHeliosCsvImportEvidence({
      assessmentResult: "manual_review",
      clerkOrgId,
      collectedBy: "helios-provenance-smoke",
      controlKey: csvControlKey,
      description: "CSV-derived Helios smoke row",
      rows: [
        {
          controlKey: csvControlKey,
          answer: "TLS 1.2+ is reported by customer template",
        },
      ],
      templateVersion: "smoke-v1",
    });

    const manualEvidence = await getEvidenceForOrg({
      clerkOrgId,
      evidenceId: manualResult.evidenceId,
    });
    const csvEvidence = await getEvidenceForOrg({
      clerkOrgId,
      evidenceId: csvResult.evidenceId,
    });

    assert(manualEvidence, "manual evidence row must exist");
    assert(csvEvidence, "CSV evidence row must exist");
    assert.equal(manualEvidence.type, "attestation_answers");
    assert.equal(csvEvidence.type, "helios_csv_import");
    assert.match(csvEvidence.assessmentResult, /^(manual_review|gap)$/);
    assert.notEqual(csvEvidence.assessmentResult, "pass");
    assert.equal(
      csvEvidence.snapshotData?.provenance,
      "customer_reported_csv_template",
    );

    const vaultRows = await listEvidenceVault(clerkOrgId);
    const manualVaultRow = vaultRows.find(
      (row) => row.evidenceId === manualResult.evidenceId,
    );
    const csvVaultRow = vaultRows.find(
      (row) => row.evidenceId === csvResult.evidenceId,
    );

    assert(manualVaultRow, "manual evidence must be visible in evidence vault");
    assert(csvVaultRow, "CSV evidence must be visible in evidence vault");
    assert.equal(manualVaultRow.type, "attestation_answers");
    assert.equal(csvVaultRow.type, "helios_csv_import");
    assert.equal(
      csvVaultRow.snapshotData?.provenance,
      "customer_reported_csv_template",
    );

    const progress = await getWorkspaceProgress(clerkOrgId, heliosWorkspace);
    const progressControls = progress.layers.flatMap((layer) => layer.controls);
    const manualProgress = progressControls.find(
      (control) => control.controlKey === manualControlKey,
    );
    const csvProgress = progressControls.find(
      (control) => control.controlKey === csvControlKey,
    );

    assert(manualProgress, "manual control must be present in workspace progress");
    assert(csvProgress, "CSV control must be present in workspace progress");
    assert.equal(manualProgress.hasEvidence, true);
    assert.equal(csvProgress.hasEvidence, true);
    assert(progress.completedControls >= 2);

    console.log("helios evidence provenance smoke passed");
    console.log(`  org: ${clerkOrgId}`);
    console.log(`  manual evidence type: ${manualEvidence.type}`);
    console.log(`  csv evidence type: ${csvEvidence.type}`);
    console.log(`  csv provenance: ${csvEvidence.snapshotData?.provenance}`);
    console.log(`  workspace completed controls: ${progress.completedControls}`);
  } finally {
    cleanupResult = await cleanup();
    await db.execute(sql`select pg_advisory_unlock(hashtext('smoke:helios-evidence-provenance'))`);
    console.log(
      `cleanup ${clerkOrgId}: organisations=${cleanupResult.remainingOrgRows}, evidence=${cleanupResult.remainingEvidenceRows}, statuses=${cleanupResult.remainingStatusRows}`,
    );
  }
}

main().catch((error) => {
  console.error("helios evidence provenance smoke failed");
  console.error(error);
  process.exit(1);
});
