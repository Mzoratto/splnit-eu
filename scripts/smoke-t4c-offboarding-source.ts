import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { deleteBlobUrlsAudited } from "../lib/blob/cleanup";

const root = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function assertIncludes(source: string, needle: string, label: string) {
  assert.ok(source.includes(needle), `${label}: missing ${needle}`);
}

function parseClerkOrgTables(schema: string) {
  const tablePattern = /export const (\w+) = pgTable\(\s*["']([^"']+)["']([\s\S]*?)(?=\nexport const \w+ = pgTable\(|\nexport type )/g;
  const tables: { exportName: string; tableName: string; source: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = tablePattern.exec(schema))) {
    const [, exportName, tableName, tableSource] = match;
    if (tableSource.includes("clerk_org_id") || tableSource.includes("clerkOrgId")) {
      tables.push({ exportName, tableName, source: tableSource });
    }
  }

  return tables;
}

function parseBlobColumns(schema: string) {
  const tablePattern = /export const (\w+) = pgTable\(\s*["']([^"']+)["']([\s\S]*?)(?=\nexport const \w+ = pgTable\(|\nexport type )/g;
  const columns: { exportName: string; tableName: string; property: string; column: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = tablePattern.exec(schema))) {
    const [, exportName, tableName, tableSource] = match;
    const columnPattern = /(\w*(?:[Bb]lob|[Ll]ogo)\w*)\s*:\s*text\(\s*["']([^"']*(?:blob|logo)[^"']*)["']\s*\)/g;
    let columnMatch: RegExpExecArray | null;
    while ((columnMatch = columnPattern.exec(tableSource))) {
      columns.push({
        exportName,
        tableName,
        property: columnMatch[1],
        column: columnMatch[2],
      });
    }
  }

  return columns;
}

async function assertAuditedBlobCleanupBehavior() {
  const deletedBatches: string[][] = [];
  const previousToken = process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.BLOB_READ_WRITE_TOKEN;

  const result = await deleteBlobUrlsAudited(
    ["https://blob.example/a", "https://blob.example/a", null, " https://blob.example/b "],
    {
      requireToken: false,
      deleteFn: async (urls) => {
        deletedBatches.push(urls);
      },
    },
  );

  assert.deepEqual(deletedBatches, [["https://blob.example/a", "https://blob.example/b"]]);
  assert.equal(result.requested, 2, "audited Blob cleanup should dedupe URL requests");
  assert.deepEqual(result.deleted, ["https://blob.example/a", "https://blob.example/b"]);
  assert.deepEqual(result.failed, []);
  assert.deepEqual(result.skipped, []);

  const skipped = await deleteBlobUrlsAudited(["https://blob.example/no-token"]);
  assert.equal(skipped.deleted.length, 0);
  assert.equal(skipped.skipped.length, 1, "missing token should be reported as skipped, not hidden");

  const failed = await deleteBlobUrlsAudited(["https://blob.example/fail"], {
    requireToken: false,
    deleteFn: async () => {
      throw new Error("mock delete failure");
    },
  });
  assert.equal(failed.failed.length, 1, "mock delete failure should be returned for audit/retry");

  if (previousToken === undefined) {
    delete process.env.BLOB_READ_WRITE_TOKEN;
  } else {
    process.env.BLOB_READ_WRITE_TOKEN = previousToken;
  }
}

async function main() {
  const packageJson = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
  const schema = read("lib/db/schema.ts");
  const sync = read("lib/clerk/sync.ts");
  const cleanup = read("lib/blob/cleanup.ts");
  const offboarding = read("lib/offboarding/org-deletion.ts");
  const retentionPolicy = read("docs/legal/retention-policy.md");
  const runbook = read("docs/operations/offboarding-runbook.md");
  const auditSop = read("docs/operations/audit-log-export-sop.md");

  assert.equal(
    packageJson.scripts["smoke:t4c-offboarding-source"],
    "tsx scripts/smoke-t4c-offboarding-source.ts",
    "package.json must expose the T4-C source smoke",
  );

  const clerkOrgTables = parseClerkOrgTables(schema).map((table) => table.tableName).sort();
  assert.ok(clerkOrgTables.length > 10, "source smoke must enumerate clerk_org_id tables");
  assertIncludes(offboarding, "ORG_DELETION_COVERAGE", "offboarding coverage inventory exists");
  for (const tableName of clerkOrgTables) {
    assertIncludes(offboarding, tableName, `offboarding coverage includes ${tableName}`);
  }

  assertIncludes(offboarding, "audit_logs", "audit logs are explicitly listed as a retention exception");
  assertIncludes(offboarding, "retention_exception", "retention exceptions are distinct from deletion failures");
  assertIncludes(offboarding, "eraseEvidenceForOrg", "granular evidence right-to-erasure path exists");
  assertIncludes(offboarding, "evidence.erased", "granular evidence erasure is audit logged");
  assertIncludes(offboarding, "eq(evidence.clerkOrgId, input.clerkOrgId)", "granular evidence erasure is org-scoped");
  assertIncludes(offboarding, "deleteBlobUrlsAudited", "granular erasure uses audited Blob cleanup");
  assertIncludes(offboarding, "blobUrlCollectionCompleted", "org deletion must track whether Blob URL collection completed");
  assertIncludes(offboarding, "delete_blocked_blob_url_collection_failed", "org deletion must not delete the root organisation when Blob URL collection fails");
  assertIncludes(offboarding, "blob_cleanup_failed", "granular erasure must block evidence row deletion when Blob cleanup fails");
  assertIncludes(offboarding, "audit_log_failed", "granular erasure must keep the evidence row when retained audit logging fails");
  const rootDeleteIndex = offboarding.indexOf("db.delete(organisations)");
  const collectionBlockIndex = offboarding.indexOf("delete_blocked_blob_url_collection_failed");
  assert.ok(collectionBlockIndex >= 0 && collectionBlockIndex < rootDeleteIndex, "Blob URL collection failure guard must run before root organisation deletion");
  const evidenceDeleteIndex = offboarding.indexOf("db\n    .delete(evidence)");
  const blobFailureGuardIndex = offboarding.indexOf("blob_cleanup_failed");
  const auditInsertIndex = offboarding.indexOf("db.insert(auditLogs)");
  assert.ok(blobFailureGuardIndex >= 0 && blobFailureGuardIndex < evidenceDeleteIndex, "Blob cleanup failure guard must run before evidence row deletion");
  assert.ok(auditInsertIndex >= 0 && auditInsertIndex < evidenceDeleteIndex, "retained erasure audit log must be written before evidence row deletion");
  assertIncludes(retentionPolicy, "retained on organisation deletion", "retention policy matches retained audit-log schema behavior");
  assertIncludes(retentionPolicy, "exact retention period must be set before paid launch", "retention policy keeps paid-launch retention-period decision open");
  assertIncludes(runbook, "Audit logs are retained", "runbook calls out retained audit logs");
  assertIncludes(auditSop, "retained after organisation deletion", "audit SOP calls out retained audit logs");

  const blobColumns = parseBlobColumns(schema).map(
    (column) => `${column.tableName}.${column.column}`,
  ).sort();
  assert.ok(blobColumns.length >= 2, "source smoke must enumerate Blob/logo URL columns");
  assertIncludes(offboarding, "BLOB_URL_COVERAGE", "blob URL coverage inventory exists");
  for (const blobColumn of blobColumns) {
    assertIncludes(offboarding, blobColumn, `blob URL coverage includes ${blobColumn}`);
  }

  assertIncludes(cleanup, "deleteBlobUrlsAudited", "Blob cleanup exposes auditable idempotent helper");
  assertIncludes(cleanup, "deleteFn", "Blob cleanup supports injected delete function for local tests");
  assertIncludes(cleanup, "failed", "Blob cleanup returns per-URL failures instead of throwing first");
  assertIncludes(cleanup, "skipped", "Blob cleanup reports skipped/no-token URLs for auditability");

  assertIncludes(sync, "deleteOrganisationForOffboarding", "Clerk deletion uses offboarding service");
  assertIncludes(sync, "console.warn", "Clerk deletion logs cleanup failures for webhook retry/ops audit");
  assertIncludes(runbook, "Webhook failure and retry behavior", "runbook documents webhook failure/retry behavior");
  assertIncludes(runbook, "retry", "runbook documents retry handling");

  await assertAuditedBlobCleanupBehavior();

  console.log("T4-C offboarding source smoke passed.");
}

void main();
