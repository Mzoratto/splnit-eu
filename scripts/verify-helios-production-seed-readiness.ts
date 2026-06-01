import assert from "node:assert/strict";

import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

import { heliosWorkspace } from "@/lib/workspaces/helios";

loadEnvConfig(process.cwd());

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl || databaseUrl === '""' || databaseUrl === "''") {
    throw new Error("DATABASE_URL is required for Helios seed readiness verification.");
  }

  const parsed = new URL(databaseUrl);
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("DATABASE_URL must be a postgres/postgresql URL.");
  }

  return { databaseUrl, parsed };
}

function redactTargetMetadata(parsed: URL) {
  return {
    protocol: parsed.protocol.replace(/:$/, ""),
    host: parsed.hostname || "unknown",
    portPresent: Boolean(parsed.port),
    databasePresent: parsed.pathname.length > 1,
    sslMode: parsed.searchParams.get("sslmode") ?? "unspecified",
  };
}

function findDuplicates(values: readonly string[]) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))].sort();
}

async function main() {
  const expectedKeys: string[] = heliosWorkspace.layers
    .flatMap((layer) => layer.controls.map((control) => control.controlKey))
    .sort();
  assert.equal(expectedKeys.length, 19, "Expected Helios canonical control key count changed");
  assert.deepEqual(findDuplicates(expectedKeys), [], "Duplicate expected Helios canonical control keys");

  const { databaseUrl, parsed } = getDatabaseUrl();
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });
  const client = await pool.connect();

  try {
    await client.query("begin transaction read only");

    const targetResult = await client.query<{ current_database: string; current_user: string; server_version_num: string }>(
      "select current_database(), current_user, current_setting('server_version_num') as server_version_num",
    );

    const controlsResult = await client.query<{ key: string }>(
      "select key from controls where key like 'helios-%' order by key",
    );

    const mappingsResult = await client.query<{ control_key: string; article_ref: string | null }>(
      `select c.key as control_key, fc.article_ref
         from framework_controls fc
         join controls c on c.id = fc.control_id
         join frameworks f on f.id = fc.framework_id
        where c.key like 'helios-%' and f.slug = 'nis2'
        order by c.key, fc.article_ref nulls first`,
    );

    const duplicateControlKeysResult = await client.query<{ key: string; count: string }>(
      "select key, count(*) from controls where key like 'helios-%' group by key having count(*) > 1 order by key",
    );

    const duplicateMappingsResult = await client.query<{ control_key: string; article_ref: string | null; count: string }>(
      `select c.key as control_key, fc.article_ref, count(*)
         from framework_controls fc
         join controls c on c.id = fc.control_id
         join frameworks f on f.id = fc.framework_id
        where c.key like 'helios-%' and f.slug = 'nis2'
        group by c.key, fc.article_ref
       having count(*) > 1
        order by c.key, fc.article_ref nulls first`,
    );

    await client.query("commit");

    const actualKeys = controlsResult.rows.map((row) => row.key).sort();
    const mappedKeys = mappingsResult.rows.map((row) => row.control_key).sort();
    const missingExpectedControls = expectedKeys.filter((key) => !actualKeys.includes(key));
    const unexpectedHeliosControls = actualKeys.filter((key) => !expectedKeys.includes(key));
    const controlsMissingNis2Mappings = expectedKeys.filter((key) => !mappedKeys.includes(key));
    const duplicateHeliosControlKeys = duplicateControlKeysResult.rows.map((row) => row.key);
    const duplicateHeliosFrameworkMappings = duplicateMappingsResult.rows.map(
      (row) => `${row.control_key}:${row.article_ref ?? "<null>"}`,
    );

    const targetRow = targetResult.rows[0];
    const summary = {
      target: redactTargetMetadata(parsed),
      databaseNamePresent: Boolean(targetRow?.current_database),
      userPresent: Boolean(targetRow?.current_user),
      serverVersionNumPresent: Boolean(targetRow?.server_version_num),
      expectedHeliosControls: expectedKeys.length,
      actualHeliosControls: actualKeys.length,
      nis2HeliosMappings: mappingsResult.rows.length,
      missingExpectedControls: missingExpectedControls.length,
      unexpectedHeliosControls: unexpectedHeliosControls.length,
      duplicateHeliosControlKeys: duplicateHeliosControlKeys.length,
      duplicateHeliosFrameworkMappings: duplicateHeliosFrameworkMappings.length,
      controlsMissingNis2Mappings: controlsMissingNis2Mappings.length,
    };

    console.log("Helios production seed readiness verifier (read-only) completed.");
    console.log(JSON.stringify(summary, null, 2));

    const failures = [
      missingExpectedControls.length > 0 ? `missing expected controls: ${missingExpectedControls.join(", ")}` : null,
      unexpectedHeliosControls.length > 0 ? `unexpected Helios controls: ${unexpectedHeliosControls.join(", ")}` : null,
      duplicateHeliosControlKeys.length > 0 ? `duplicate Helios control keys: ${duplicateHeliosControlKeys.join(", ")}` : null,
      controlsMissingNis2Mappings.length > 0
        ? `controls missing NIS2 mappings: ${controlsMissingNis2Mappings.join(", ")}`
        : null,
      mappingsResult.rows.length !== expectedKeys.length
        ? `expected ${expectedKeys.length} NIS2 Helios mappings, found ${mappingsResult.rows.length}`
        : null,
      duplicateHeliosFrameworkMappings.length > 0
        ? `duplicate NIS2 Helios framework mappings: ${duplicateHeliosFrameworkMappings.join(", ")}`
        : null,
    ].filter(Boolean);

    assert.deepEqual(failures, [], failures.join("\n"));
    console.log("Helios production seed readiness passed.");
  } catch (error) {
    try {
      await client.query("rollback");
    } catch {
      // Ignore rollback errors after commit or connection failure.
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Helios production seed readiness verification failed:");
  console.error(error);
  process.exit(1);
});
