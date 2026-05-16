#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "dotenv";
import pg from "pg";

const { Client } = pg;
const projectDir = process.cwd();
const envPath = process.env.CLEANUP_ENV_FILE
  ? resolve(projectDir, process.env.CLEANUP_ENV_FILE)
  : resolve(projectDir, ".env.local");

if (existsSync(envPath)) {
  const parsed = parse(readFileSync(envPath));
  for (const [key, value] of Object.entries(parsed)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const databaseUrl = process.env.DATABASE_URL?.trim()
  || process.env.POSTGRES_URL?.trim()
  || process.env.DATABASE_URL_UNPOOLED?.trim()
  || process.env.POSTGRES_URL_NON_POOLING?.trim();
assert.ok(databaseUrl, "DATABASE_URL, POSTGRES_URL, DATABASE_URL_UNPOOLED, or POSTGRES_URL_NON_POOLING is required.");
assert.ok(!databaseUrl.includes("localhost"), "Refusing to run against localhost; this cleanup is for production smoke residue only.");

const deleteMode = process.env.CONFIRM_HISTORICAL_SMOKE_CLEANUP === "delete-smoke-orgs";
const expectedCount = process.env.EXPECTED_SMOKE_ORG_COUNT ? Number.parseInt(process.env.EXPECTED_SMOKE_ORG_COUNT, 10) : null;
const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

const smokeWhereSql = `
  (
    name LIKE 'Splnit Production Readiness Smoke %'
    OR clerk_org_id LIKE 'org_export_cross_%'
  )
`;

const countSql = `
  WITH smoke_orgs AS (
    SELECT clerk_org_id, name, created_at
    FROM organisations
    WHERE ${smokeWhereSql}
  )
  SELECT
    (SELECT count(*)::int FROM smoke_orgs) AS organisations,
    (SELECT count(*)::int FROM profiles WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs)) AS profiles,
    (SELECT count(*)::int FROM org_frameworks WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs)) AS org_frameworks,
    (SELECT count(*)::int FROM org_control_statuses WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs)) AS org_control_statuses,
    (SELECT count(*)::int FROM evidence WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs)) AS evidence,
    (SELECT count(*)::int FROM generated_artifacts WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs)) AS generated_artifacts,
    (SELECT count(*)::int FROM policies WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs)) AS policies,
    (SELECT count(*)::int FROM vendors WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs)) AS vendors,
    (SELECT count(*)::int FROM vendor_assessments WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs)) AS vendor_assessments,
    (SELECT count(*)::int FROM risk_items WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs)) AS risk_items,
    (SELECT count(*)::int FROM trust_centers WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs)) AS trust_centers,
    (SELECT count(*)::int FROM trust_center_requests WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs)) AS trust_center_requests,
    (SELECT count(*)::int FROM audit_logs WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs)) AS audit_logs
`;

const sampleSql = `
  SELECT clerk_org_id, name, created_at
  FROM organisations
  WHERE ${smokeWhereSql}
  ORDER BY created_at NULLS FIRST, clerk_org_id
`;

const auditLogCountByOrgIdsSql = `
  SELECT count(*)::int AS audit_logs
  FROM audit_logs
  WHERE clerk_org_id = ANY($1::text[])
`;

const deleteSql = `
  WITH smoke_orgs AS (
    SELECT clerk_org_id
    FROM organisations
    WHERE ${smokeWhereSql}
  ),
  deleted_trust_center_requests AS (
    DELETE FROM trust_center_requests WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs) RETURNING 1
  ),
  deleted_trust_centers AS (
    DELETE FROM trust_centers WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs) RETURNING 1
  ),
  deleted_vendor_assessments AS (
    DELETE FROM vendor_assessments WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs) RETURNING 1
  ),
  deleted_vendors AS (
    DELETE FROM vendors WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs) RETURNING 1
  ),
  deleted_risk_items AS (
    DELETE FROM risk_items WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs) RETURNING 1
  ),
  deleted_evidence AS (
    DELETE FROM evidence WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs) RETURNING 1
  ),
  deleted_generated_artifacts AS (
    DELETE FROM generated_artifacts WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs) RETURNING 1
  ),
  deleted_policies AS (
    DELETE FROM policies WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs) RETURNING 1
  ),
  deleted_org_control_statuses AS (
    DELETE FROM org_control_statuses WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs) RETURNING 1
  ),
  deleted_org_frameworks AS (
    DELETE FROM org_frameworks WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs) RETURNING 1
  ),
  deleted_profiles AS (
    DELETE FROM profiles WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs) RETURNING 1
  ),
  deleted_organisations AS (
    DELETE FROM organisations WHERE clerk_org_id IN (SELECT clerk_org_id FROM smoke_orgs) RETURNING 1
  )
  SELECT
    (SELECT count(*)::int FROM deleted_trust_center_requests) AS trust_center_requests,
    (SELECT count(*)::int FROM deleted_trust_centers) AS trust_centers,
    (SELECT count(*)::int FROM deleted_vendor_assessments) AS vendor_assessments,
    (SELECT count(*)::int FROM deleted_vendors) AS vendors,
    (SELECT count(*)::int FROM deleted_risk_items) AS risk_items,
    (SELECT count(*)::int FROM deleted_evidence) AS evidence,
    (SELECT count(*)::int FROM deleted_generated_artifacts) AS generated_artifacts,
    (SELECT count(*)::int FROM deleted_policies) AS policies,
    (SELECT count(*)::int FROM deleted_org_control_statuses) AS org_control_statuses,
    (SELECT count(*)::int FROM deleted_org_frameworks) AS org_frameworks,
    (SELECT count(*)::int FROM deleted_profiles) AS profiles,
    (SELECT count(*)::int FROM deleted_organisations) AS organisations
`;

function output(payload) {
  console.log(JSON.stringify(payload, null, 2));
}

await client.connect();
try {
  const before = (await client.query(countSql)).rows[0];
  const matches = (await client.query(sampleSql)).rows;
  const matchedClerkOrgIds = matches.map((match) => match.clerk_org_id);
  const auditLogsBefore = matchedClerkOrgIds.length > 0
    ? (await client.query(auditLogCountByOrgIdsSql, [matchedClerkOrgIds])).rows[0].audit_logs
    : 0;

  if (expectedCount !== null && before.organisations !== expectedCount) {
    output({
      ok: false,
      mode: deleteMode ? "delete" : "dry-run",
      reason: "expected_count_mismatch",
      expectedSmokeOrgCount: expectedCount,
      actualSmokeOrgCount: before.organisations,
      before,
      matches,
    });
    process.exitCode = 1;
  } else if (!deleteMode) {
    output({
      ok: true,
      mode: "dry-run",
      deletionExecuted: false,
      reviewRequired: "Set CONFIRM_HISTORICAL_SMOKE_CLEANUP=delete-smoke-orgs after reviewing this scoped output.",
      before,
      matches,
      auditLogsBefore,
      auditLogRetentionNote: "Dry-run only: audit logs are counted by the reviewed clerk_org_id list. The audit_logs FK to organisations must be absent before deleting orgs with retained audit logs.",
    });
  } else {
    await client.query("BEGIN");
    const deleted = (await client.query(deleteSql)).rows[0];
    const after = (await client.query(countSql)).rows[0];
    const auditLogsAfter = matchedClerkOrgIds.length > 0
      ? (await client.query(auditLogCountByOrgIdsSql, [matchedClerkOrgIds])).rows[0].audit_logs
      : 0;
    await client.query("COMMIT");
    output({
      ok: after.organisations === 0,
      mode: "delete",
      deletionExecuted: true,
      before,
      deleted,
      after,
      auditLogsBefore,
      auditLogsAfter,
      cleanupSmokeOrgDeleted: after.organisations === 0,
      cleanupAuditLogsRetained: Number(auditLogsAfter) === Number(auditLogsBefore),
      auditLogRetentionNote: "Audit logs are retained by clerk_org_id string after removing the audit_logs FK to organisations.",
    });
  }
} catch (error) {
  try {
    await client.query("ROLLBACK");
  } catch {
    // no active transaction or rollback failed; surface the original error below
  }
  throw error;
} finally {
  await client.end();
}
