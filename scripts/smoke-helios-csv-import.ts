import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { listEvidenceVault } from "@/lib/db/queries/evidence";
import { getWorkspaceProgress } from "@/lib/db/queries/workspaces";
import { controls, evidence, organisations, orgControlStatuses } from "@/lib/db/schema";
import { heliosWorkspace } from "@/lib/workspaces/helios";
import { importHeliosCsvEvidence } from "@/lib/workspaces/helios-csv/importer";
import type { HeliosCsvFileKind } from "@/lib/workspaces/helios-csv/types";
import { seedHeliosControls } from "./seed-helios-controls";

loadEnvConfig(process.cwd());

const clerkOrgId = `org_helios_csv_smoke_${Date.now()}`;
const advisoryLockName = "smoke-helios-csv-import";
const fixtureDir = path.join(process.cwd(), "tests", "fixtures", "helios");
const kinds: HeliosCsvFileKind[] = ["users", "roles", "backups", "integrations"];

async function cleanup() {
  const db = getDb();
  await db.delete(evidence).where(eq(evidence.clerkOrgId, clerkOrgId));
  await db.delete(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
  await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
  const remainingEvidenceRows = await db.select({ id: evidence.id }).from(evidence).where(eq(evidence.clerkOrgId, clerkOrgId));
  const remainingStatusRows = await db.select({ id: orgControlStatuses.id }).from(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
  const remainingOrgRows = await db.select({ id: organisations.id }).from(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
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
    await cleanup();
    await db.insert(organisations).values({
      clerkOrgId,
      country: "CZ",
      locale: "cs-CZ",
      name: "Helios CSV smoke org",
      primaryJurisdiction: "CZ",
    });

    const before = await getWorkspaceProgress(clerkOrgId, heliosWorkspace);
    assert.equal(before.completedControls, 0, "synthetic org starts without Helios evidence coverage");

    const outputs = [];
    for (const kind of kinds) {
      const csv = await readFile(path.join(fixtureDir, `${kind}.csv`), "utf8");
      outputs.push(await importHeliosCsvEvidence({ clerkOrgId, collectedBy: "helios-csv-smoke", kind, csvText: csv }));
    }

    const summary = outputs.reduce(
      (acc, result) => ({
        created: acc.created + result.created.length,
        errors: acc.errors + result.errors.length,
        gaps: acc.gaps + result.gapsCount,
        manual: acc.manual + result.manualReviewCount,
        parsed: acc.parsed + result.parsedRows,
      }),
      { created: 0, errors: 0, gaps: 0, manual: 0, parsed: 0 },
    );
    assert.equal(summary.errors, 0, "fixtures import without skipped row errors");
    assert.ok(summary.created >= 4, "fixtures create multiple evidence rows");
    assert.ok(summary.gaps > 0, "fixtures create gap evidence");
    assert.ok(summary.manual > 0, "fixtures create manual_review evidence");

    const requiredControlKeys = [
      "helios-iam-user-accounts",
      "helios-iam-module-role-hierarchy",
      "helios-backup-sql-agent-jobs",
      "helios-api-mes-scada-integration",
    ];
    const controlRows = await db
      .select({ id: controls.id, key: controls.key })
      .from(controls)
      .where(inArray(controls.key, requiredControlKeys));
    const controlIdByKey = new Map(controlRows.map((row) => [row.key, row.id]));

    const evidenceRows = await db
      .select({
        assessmentResult: evidence.assessmentResult,
        controlKey: controls.key,
        id: evidence.id,
        snapshotData: evidence.snapshotData,
        type: evidence.type,
      })
      .from(evidence)
      .innerJoin(controls, eq(evidence.controlId, controls.id))
      .where(eq(evidence.clerkOrgId, clerkOrgId));

    for (const controlKey of requiredControlKeys) {
      assert.ok(evidenceRows.some((row) => row.controlKey === controlKey), `missing CSV evidence for ${controlKey}`);
      const statusRows = await db
        .select({ lastEvidenceAt: orgControlStatuses.lastEvidenceAt })
        .from(orgControlStatuses)
        .where(
          and(
            eq(orgControlStatuses.clerkOrgId, clerkOrgId),
            eq(orgControlStatuses.controlId, controlIdByKey.get(controlKey) ?? "missing"),
          ),
        );
      assert.ok(statusRows[0]?.lastEvidenceAt, `lastEvidenceAt not set for ${controlKey}`);
    }

    assert.ok(evidenceRows.every((row) => row.type === "helios_csv_import"));
    assert.ok(evidenceRows.every((row) => row.assessmentResult === "manual_review" || row.assessmentResult === "gap"));
    assert.ok(!evidenceRows.some((row) => row.assessmentResult === "pass"));
    assert.ok(
      evidenceRows.every((row) => {
        const snapshot = row.snapshotData as Record<string, unknown> | null;
        return snapshot?.provenance === "customer_reported_csv_template" && snapshot.customerReported === true;
      }),
      "snapshot provenance/customer-reported labels must be present",
    );
    assert.ok(!JSON.stringify(evidenceRows).match(/SuperSecret|password|api_key_value/i), "snapshots must not contain raw secrets");

    const after = await getWorkspaceProgress(clerkOrgId, heliosWorkspace);
    assert.ok(after.completedControls > before.completedControls, "workspace progress coverage increases");

    const vault = await listEvidenceVault(clerkOrgId);
    assert.ok(vault.some((row) => row.type === "helios_csv_import" && row.controlKey.startsWith("helios-")), "vault includes CSV-derived Helios evidence");

    console.log(`smoke:helios-csv-import ok org=${clerkOrgId} parsed=${summary.parsed} created=${summary.created} gaps=${summary.gaps} manual_review=${summary.manual}`);
  } finally {
    cleanupResult = await cleanup();
    console.log(
      `cleanup ${clerkOrgId}: organisations=${cleanupResult.remainingOrgRows}, evidence=${cleanupResult.remainingEvidenceRows}, statuses=${cleanupResult.remainingStatusRows}`,
    );
    await db.execute(sql`select pg_advisory_unlock(hashtext(${advisoryLockName}))`);
  }
}

main().catch((error) => {
  console.error("smoke:helios-csv-import failed");
  console.error(error);
  process.exit(1);
});
