import assert from "node:assert/strict";

import { loadEnvConfig } from "@next/env";
import { and, count, eq, inArray, sql } from "drizzle-orm";

import { HELIOS_CANONICAL_CONTROL_KEYS, HELIOS_CONTROL_SEEDS, assertHeliosCanonicalControlSeeds } from "@/lib/workspaces/control-seeds";
import { getDb } from "@/lib/db";
import { controls, frameworkControls, frameworks } from "@/lib/db/schema";
import { seedHeliosControls } from "./seed-helios-controls";

loadEnvConfig(process.cwd());

async function getNis2FrameworkId() {
  const db = getDb();
  const [row] = await db
    .select({ id: frameworks.id })
    .from(frameworks)
    .where(eq(frameworks.slug, "nis2"));

  assert.ok(row, "NIS2 framework row must exist after targeted Helios seed");
  return row.id;
}

async function snapshot(nis2FrameworkId: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: controls.id,
      key: controls.key,
      requiresEvidence: controls.requiresEvidence,
      isAutomated: controls.isAutomated,
      testType: controls.testType,
    })
    .from(controls)
    .where(inArray(controls.key, [...HELIOS_CANONICAL_CONTROL_KEYS]));

  const mappingRows = await db
    .select({ controlId: frameworkControls.controlId, articleRef: frameworkControls.articleRef })
    .from(frameworkControls)
    .innerJoin(controls, eq(frameworkControls.controlId, controls.id))
    .where(
      and(
        eq(frameworkControls.frameworkId, nis2FrameworkId),
        inArray(controls.key, [...HELIOS_CANONICAL_CONTROL_KEYS]),
      ),
    );

  const duplicateMappingRows = await db
    .select({
      controlId: frameworkControls.controlId,
      articleRef: frameworkControls.articleRef,
      total: count(),
    })
    .from(frameworkControls)
    .innerJoin(controls, eq(frameworkControls.controlId, controls.id))
    .where(
      and(
        eq(frameworkControls.frameworkId, nis2FrameworkId),
        inArray(controls.key, [...HELIOS_CANONICAL_CONTROL_KEYS]),
      ),
    )
    .groupBy(frameworkControls.controlId, frameworkControls.articleRef)
    .having(sql`count(*) > 1`);

  return { rows, mappingRows, duplicateMappingRows };
}

function assertSnapshot(label: string, data: Awaited<ReturnType<typeof snapshot>>) {
  assert.equal(data.rows.length, 19, `${label}: expected exactly 19 Helios controls`);

  const keys = data.rows.map((row) => row.key).sort();
  assert.deepEqual(keys, [...HELIOS_CANONICAL_CONTROL_KEYS].sort(), `${label}: Helios control keys mismatch`);

  for (const row of data.rows) {
    assert.equal(row.requiresEvidence, true, `${label}: ${row.key} requiresEvidence must be true`);
    assert.equal(row.isAutomated, false, `${label}: ${row.key} isAutomated must be false`);
    assert.equal(row.testType, "manual", `${label}: ${row.key} testType must be manual`);
  }

  const mappedControlIds = new Set(data.mappingRows.map((row) => row.controlId));
  assert.equal(mappedControlIds.size, 19, `${label}: every Helios control needs a NIS2 framework_controls row`);
  assert.equal(data.duplicateMappingRows.length, 0, `${label}: duplicate NIS2 framework_controls mappings found`);
}

async function main() {
  assertHeliosCanonicalControlSeeds(HELIOS_CONTROL_SEEDS);

  assert.throws(
    () => assertHeliosCanonicalControlSeeds(HELIOS_CONTROL_SEEDS.slice(1)),
    /missing current Helios workspace control keys/i,
    "immutable key guard must catch missing current config keys",
  );

  await seedHeliosControls();
  const nis2FrameworkId = await getNis2FrameworkId();
  const first = await snapshot(nis2FrameworkId);
  assertSnapshot("first seed", first);

  await seedHeliosControls();
  const second = await snapshot(nis2FrameworkId);
  assertSnapshot("second seed", second);

  assert.equal(second.rows.length, first.rows.length, "repeated seed must not duplicate Helios controls");
  assert.equal(
    second.mappingRows.length,
    first.mappingRows.length,
    "repeated seed must not duplicate Helios NIS2 mappings",
  );

  console.log("Helios control seeding smoke passed.");
  console.log(`  canonical keys: ${HELIOS_CANONICAL_CONTROL_KEYS.length}`);
  console.log(`  controls present: ${second.rows.length}`);
  console.log(`  NIS2 mappings present: ${second.mappingRows.length}`);
  console.log("  idempotency: verified across two targeted seed runs");
  console.log("  immutable key guard: verified missing-key failure");
}

main().catch((error) => {
  console.error("Helios control seeding smoke failed:");
  console.error(error);
  process.exit(1);
});
