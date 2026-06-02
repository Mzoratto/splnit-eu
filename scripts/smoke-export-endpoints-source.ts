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
const incidentReportRoutes = [
  read("app/api/incidents/[incidentId]/data-protection-report/route.ts"),
  read("app/api/incidents/[incidentId]/cybersecurity-report/route.ts"),
  read("app/api/incidents/[incidentId]/uoou-report/route.ts"),
  read("app/api/incidents/[incidentId]/nukib-report/route.ts"),
];
const incidentReportHandler = read("lib/incidents/report-route.ts");
const accessReviewExportRoute = read("app/api/access-reviews/[reviewId]/export/route.ts");
const policyDownloadRoute = read("app/api/policies/[policyId]/download/route.ts");
const evidenceDownloadRoute = read("app/api/evidence/[evidenceId]/download/route.ts");
const isoPackageRoute = read("app/api/frameworks/iso27001/certification-package/route.ts");
const smartDocumentRoute = read("app/api/documents/generate/[type]/route.ts");
const evidenceMetadataRoute = read("app/api/exports/evidence-metadata/route.ts");
const workspaceJsonRoute = read("app/api/exports/workspace/route.ts");
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

// T4-F expanded buyer-proof source coverage. These checks intentionally stay source-only:
// no production Blob reads, production DB access, or live authenticated session is required.
for (const source of incidentReportRoutes) {
  assertIncludes(source, "handleIncidentReportRequest", "incident report exports delegate to shared private handler");
}
assertMatches(incidentReportHandler, /if \(!session\.userId \|\| !session\.orgId\)/, "incident report exports require user and organisation session");
assertIncludes(incidentReportHandler, "getIncidentForOrg({ clerkOrgId: session.orgId, incidentId })", "incident report exports fetch only active-org incidents");
assertIncludes(incidentReportHandler, "withPrivateNoStore", "incident report exports use private no-store headers");
assertIncludes(incidentReportHandler, '"Content-Type": "application/pdf"', "incident report exports return PDF content type");

assertMatches(accessReviewExportRoute, /if \(!session\.userId \|\| !session\.orgId\)/, "access review CSV export requires user and organisation session");
assertIncludes(accessReviewExportRoute, "clerkOrgId: session.orgId", "access review CSV export is org-scoped");
assertIncludes(accessReviewExportRoute, "withPrivateNoStore", "access review CSV export uses private no-store headers");
assertIncludes(accessReviewExportRoute, '"Content-Type": "text/csv; charset=utf-8"', "access review CSV export returns CSV content type");

for (const [label, source, scopedCall] of [
  ["policy download", policyDownloadRoute, "clerkOrgId: session.orgId"],
  ["evidence download", evidenceDownloadRoute, "clerkOrgId: session.orgId"],
] as const) {
  assertMatches(source, /if \(!session\.userId \|\| !session\.orgId\)/, `${label} requires user and organisation session`);
  assertIncludes(source, scopedCall, `${label} is org-scoped`);
  assertIncludes(source, "withPrivateNoStore", `${label} uses private no-store headers`);
  assertIncludes(source, "Content-Disposition", `${label} returns attachment disposition`);
}

assertMatches(isoPackageRoute, /if \(!session\.userId \|\| !session\.orgId\)/, "ISO 27001 package requires user and organisation session");
assertIncludes(isoPackageRoute, "getIso27001CertificationPackage(session.orgId)", "ISO 27001 package is org-scoped");
assertIncludes(isoPackageRoute, "withPrivateNoStore", "ISO 27001 package uses private no-store headers");
assertIncludes(isoPackageRoute, '"Content-Type": "application/zip"', "ISO 27001 package returns ZIP content type");
assertIncludes(isoPackageRoute, "certification-bodies", "ISO 27001 package includes certification-body reference data without claiming certification");

assertMatches(smartDocumentRoute, /if \(!session\.userId \|\| !session\.orgId\)/, "smart document XLSX requires user and organisation session");
assertIncludes(smartDocumentRoute, "getOrgDocumentMetadata(session.orgId)", "smart document XLSX uses active-org metadata");
assertIncludes(smartDocumentRoute, "getGapAnalysisData(session.orgId", "smart document XLSX gap analysis is org-scoped");
assertIncludes(smartDocumentRoute, "getSoAData(session.orgId)", "smart document XLSX SoA is org-scoped");
assertIncludes(smartDocumentRoute, "getVendorReportData(session.orgId)", "smart document XLSX vendor report is org-scoped");
assertIncludes(smartDocumentRoute, "withPrivateNoStore", "smart document XLSX uses private no-store headers");
assertIncludes(smartDocumentRoute, "SPREADSHEET_CONTENT_TYPE", "smart document XLSX returns spreadsheet content type");

assertMatches(evidenceMetadataRoute, /if \(!session\.userId \|\| !session\.orgId\)/, "evidence metadata export requires user and organisation session");
assertIncludes(evidenceMetadataRoute, "listEvidenceMetadataForExport(session.orgId)", "evidence metadata export is org-scoped");
assertIncludes(evidenceMetadataRoute, "withPrivateNoStore", "evidence metadata export uses private no-store headers");
assertIncludes(evidenceMetadataRoute, '"Content-Type": "text/csv; charset=utf-8"', "evidence metadata export returns CSV content type");

assertMatches(workspaceJsonRoute, /if \(!session\.userId \|\| !session\.orgId\)/, "workspace JSON export requires user and organisation session");
assertIncludes(workspaceJsonRoute, "getWorkspaceExport(session.orgId)", "workspace JSON export is org-scoped");
assertIncludes(workspaceJsonRoute, "withPrivateNoStore", "workspace JSON export uses private no-store headers");
assertIncludes(workspaceJsonRoute, '"Content-Type": "application/json; charset=utf-8"', "workspace JSON export returns JSON content type");

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
