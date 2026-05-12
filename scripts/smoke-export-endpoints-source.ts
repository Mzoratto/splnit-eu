import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function assertIncludes(source: string, needle: string, label: string) {
  assert.ok(source.includes(needle), `${label}: missing ${needle}`);
}

function assertMatches(source: string, pattern: RegExp, label: string) {
  assert.ok(pattern.test(source), `${label}: pattern ${pattern} not found`);
}

const auditRoute = read("app/api/audit-log/export/route.ts");
const auditQueries = read("lib/db/queries/audit-logs.ts");
const vendorReportRoute = read("app/api/vendors/supply-chain-report/route.ts");
const riskReportRoute = read("app/api/risks/register-report/route.ts");
const workspaceArchiveRoute = read("app/api/exports/workspace/archive/route.ts");
const productionReadinessSmoke = read("scripts/smoke-production-tenant-readiness.ts");
const securitySpec = read("tests/e2e/security.spec.ts");

assertIncludes(
  auditRoute,
  "MAX_AUDIT_LOG_EXPORT_LIMIT",
  "audit export imports max limit",
);
assertIncludes(
  auditQueries,
  "export const MAX_AUDIT_LOG_EXPORT_LIMIT = 5000;",
  "audit export max limit is capped",
);
assertMatches(
  auditRoute,
  /limit\s*>\s*MAX_AUDIT_LOG_EXPORT_LIMIT/,
  "audit export rejects over-limit requests",
);
assertIncludes(
  auditQueries,
  "eq(auditLogs.clerkOrgId, input.clerkOrgId)",
  "audit log query is org-scoped",
);
assertMatches(
  auditQueries,
  /\.limit\(limit \+ 1\)/,
  "audit log query fetches one extra row for pagination",
);
assertIncludes(
  auditRoute,
  "X-Audit-Log-Next-Cursor",
  "audit export emits next cursor header",
);
assertIncludes(
  auditRoute,
  "X-Audit-Log-Truncated",
  "audit export emits truncation header",
);
assertIncludes(
  auditRoute,
  "withPrivateNoStore",
  "audit export uses private no-store headers",
);
assertMatches(
  auditRoute,
  /if \(!session\.userId \|\| !session\.orgId\)/,
  "audit export requires user and organisation session",
);

for (const [label, source, scopedCall] of [
  [
    "vendor report export",
    vendorReportRoute,
    "listVendorsForOrg(session.orgId)",
  ],
  ["risk report export", riskReportRoute, "listRiskItemsForOrg(session.orgId)"],
] as const) {
  assertIncludes(source, "withPrivateNoStore", `${label} uses private no-store headers`);
  assertIncludes(source, "privateJson({ error: \"Unauthorized\" }, { status: 401 })", `${label} returns private 401`);
  assertMatches(source, /if \(!session\.userId \|\| !session\.orgId\)/, `${label} requires user and organisation session`);
  assertIncludes(source, scopedCall, `${label} fetches only active organisation rows`);
}

assertIncludes(
  workspaceArchiveRoute,
  "getWorkspaceExport(session.orgId)",
  "workspace archive fetches only active organisation export data",
);
assertIncludes(
  workspaceArchiveRoute,
  "listEvidenceArchiveFiles(session.orgId)",
  "workspace archive evidence files are org-scoped",
);
assertIncludes(
  workspaceArchiveRoute,
  "listPolicyArchiveFiles(session.orgId)",
  "workspace archive policy files are org-scoped",
);
assertIncludes(
  workspaceArchiveRoute,
  "withPrivateNoStore",
  "workspace archive uses private no-store headers",
);
assertIncludes(
  workspaceArchiveRoute,
  "privateJson({ error: \"Unauthorized\" }, { status: 401 })",
  "workspace archive returns private 401",
);
assertMatches(
  workspaceArchiveRoute,
  /if \(!session\.userId \|\| !session\.orgId\)/,
  "workspace archive requires user and organisation session",
);

for (const [needle, label] of [
  ["auditExportAuthRejected", "production smoke reports audit export auth proof"],
  ["auditExportCrossTenantIsolated", "production smoke reports audit export cross-tenant proof"],
  ["auditExportNextCursorPresent", "production smoke reports audit pagination proof"],
  ["vendorReportDownloaded", "production smoke reports vendor report download proof"],
  ["riskReportDownloaded", "production smoke reports risk report download proof"],
  ["workspaceArchiveDownloaded", "production smoke reports workspace archive download proof"],
  ["workspaceArchiveNoCrossTenantLeakage", "production smoke reports workspace archive cross-tenant proof"],
] as const) {
  assertIncludes(productionReadinessSmoke, needle, label);
}

assertIncludes(
  securitySpec,
  "requires authentication for audit log export filters",
  "security e2e covers unauthenticated audit export",
);
assertIncludes(
  securitySpec,
  "requires authentication for vendor, risk, and incident report exports",
  "security e2e covers unauthenticated report exports",
);

console.log("Export endpoint source smoke passed.");
