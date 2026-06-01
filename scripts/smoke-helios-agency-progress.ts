import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import { loadEnvConfig } from "@next/env";
import { eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { createManualAttestationEvidence } from "@/lib/db/queries/evidence";
import { requireManagedClient } from "@/lib/db/queries/agencies";
import { getWorkspaceProgress } from "@/lib/db/queries/workspaces";
import {
  agencies,
  agencyClientOrgs,
  agencyConsultants,
  evidence,
  organisations,
  orgControlStatuses,
  profiles,
} from "@/lib/db/schema";
import { heliosWorkspace } from "@/lib/workspaces/helios";
import { seedHeliosControls } from "./seed-helios-controls";

loadEnvConfig(process.cwd());

assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required for Helios agency progress smoke.");

const db = getDb();
const runId = `helios_agency_progress_${randomUUID()}`;
const agencyOrgId = `${runId}_agency`;
const clientOrgId = `${runId}_client`;
const consultantUserId = `${runId}_consultant`;
let agencyId: string | null = null;

async function cleanup() {
  await db.delete(evidence).where(eq(evidence.clerkOrgId, clientOrgId));
  await db.delete(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, clientOrgId));

  if (agencyId) {
    await db.delete(agencyClientOrgs).where(eq(agencyClientOrgs.agencyId, agencyId));
    await db.delete(agencyConsultants).where(eq(agencyConsultants.agencyId, agencyId));
    await db.delete(agencies).where(eq(agencies.id, agencyId));
  }

  for (const clerkOrgId of [agencyOrgId, clientOrgId]) {
    await db.delete(profiles).where(eq(profiles.clerkOrgId, clerkOrgId));
    await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
  }

  const [remainingAgencyOrgs, remainingClientOrgs, remainingEvidence, remainingStatuses] =
    await Promise.all([
      db.select({ clerkOrgId: organisations.clerkOrgId }).from(organisations).where(eq(organisations.clerkOrgId, agencyOrgId)),
      db.select({ clerkOrgId: organisations.clerkOrgId }).from(organisations).where(eq(organisations.clerkOrgId, clientOrgId)),
      db.select({ id: evidence.id }).from(evidence).where(eq(evidence.clerkOrgId, clientOrgId)),
      db.select({ id: orgControlStatuses.id }).from(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, clientOrgId)),
    ]);

  return {
    organisations: remainingAgencyOrgs.length + remainingClientOrgs.length,
    evidence: remainingEvidence.length,
    statuses: remainingStatuses.length,
  };
}

async function main() {
  let cleanupResult: Awaited<ReturnType<typeof cleanup>> | null = null;

  await db.execute(sql`select pg_advisory_lock(hashtext('smoke:helios-agency-progress'))`);
  try {
    await cleanup();
    await seedHeliosControls();

    await db.insert(organisations).values([
      {
        clerkOrgId: agencyOrgId,
        country: "CZ",
        locale: "cs-CZ",
        name: `${runId} Agency`,
        primaryJurisdiction: "CZ",
      },
      {
        clerkOrgId: clientOrgId,
        country: "CZ",
        locale: "cs-CZ",
        name: `${runId} Client`,
        primaryJurisdiction: "CZ",
        sector: "manufacturing",
      },
    ]);

    await db.insert(profiles).values({
      clerkOrgId: agencyOrgId,
      clerkUserId: consultantUserId,
      email: `${runId}@example.com`,
      fullName: "Helios Agency Progress Smoke",
      role: "admin",
    });

    const [agency] = await db
      .insert(agencies)
      .values({
        clerkOrgId: agencyOrgId,
        name: runId,
      })
      .returning({ id: agencies.id });
    assert.ok(agency?.id, "Agency row should be inserted.");
    agencyId = agency.id;

    await db.insert(agencyConsultants).values({
      agencyId,
      clerkUserId: consultantUserId,
      email: `${runId}@example.com`,
      role: "admin",
      status: "active",
    });
    await db.insert(agencyClientOrgs).values({ agencyId, orgId: clientOrgId });

    const managedClient = await requireManagedClient({ agencyId, orgId: clientOrgId });
    assert.equal(managedClient.client.clerkOrgId, clientOrgId);

    const created = await createManualAttestationEvidence({
      answers: { done: true, notes: "Agency progress smoke Helios IAM attestation." },
      assessmentResult: "manual_review",
      clerkOrgId: clientOrgId,
      collectedBy: consultantUserId,
      controlKey: "helios-iam-user-accounts",
      description: "Helios agency progress smoke attestation",
    });
    assert.ok(created.evidenceId, "Helios evidence should be inserted.");
    assert.ok(created.controlId, "Helios control id should be returned.");

    const progress = await getWorkspaceProgress(clientOrgId, heliosWorkspace);
    const iamControl = progress.layers
      .flatMap((layer) => layer.controls)
      .find((control) => control.controlKey === "helios-iam-user-accounts");

    assert.equal(progress.platformId, "helios");
    assert.ok(progress.completedControls > 0, "Helios completed controls should be > 0.");
    assert.ok(progress.overallCompletionPct > 0, "Helios progress percentage should be > 0.");
    assert.equal(iamControl?.hasEvidence, true);
    assert.equal(iamControl?.evidenceId, created.evidenceId);

    console.log("helios agency progress smoke passed");
    console.log(`  agency: ${agencyId}`);
    console.log(`  client org: ${clientOrgId}`);
    console.log(`  platform: ${progress.platformId}`);
    console.log(`  completed controls: ${progress.completedControls}`);
    console.log(`  overall completion: ${progress.overallCompletionPct}%`);
  } finally {
    cleanupResult = await cleanup();
    await db.execute(sql`select pg_advisory_unlock(hashtext('smoke:helios-agency-progress'))`);
    console.log(
      `cleanup ${clientOrgId}: organisations=${cleanupResult.organisations}, evidence=${cleanupResult.evidence}, statuses=${cleanupResult.statuses}`,
    );
  }
}

main().catch((error) => {
  console.error("helios agency progress smoke failed");
  console.error(error);
  process.exit(1);
});
