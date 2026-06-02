import * as assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function assertIncludes(source: string, needle: string, label: string) {
  assert.ok(source.includes(needle), `${label}: missing ${needle}`);
}

function assertNotMatches(source: string, pattern: RegExp, label: string) {
  assert.ok(!pattern.test(source), `${label}: forbidden pattern ${pattern}`);
}

function assertMatches(source: string, pattern: RegExp, label: string) {
  assert.ok(pattern.test(source), `${label}: missing pattern ${pattern}`);
}

const disclosureDocPath = "docs/legal/trust-center-public-disclosure.md";
assert.ok(existsSync(disclosureDocPath), "T4-F aggregate-only Trust Center disclosure decision must be documented.");

const disclosureDoc = read(disclosureDocPath);
const publicModel = read("lib/trust-center/public-model.ts");
const publicCopy = read("lib/trust-center/public-copy.ts");
const publicApi = read("app/api/trust/[orgSlug]/route.ts");
const publicUi = read("components/trust-center/public-trust-ui.tsx");
const vendorQueries = read("lib/db/queries/vendors.ts");
const vendorAssessmentAction = read("app/vendor-assessment/[token]/actions.ts");
const vendorRiskPdf = read("lib/pdf/vendor-risk-report.tsx");
const exportSmoke = read("scripts/smoke-export-endpoints-source.ts");
const planMatrix = read("docs/product/plan-entitlement-matrix.md");
const laneReport = read("docs/audits/entire-codebase-lane-06-legal-claims-proof.md");

for (const [needle, label] of [
  ["aggregate-only public Trust Center model", "documents the accepted aggregate model"],
  ["category/framework-level aggregate counts/scores", "documents the allowed public aggregate fields"],
  ["must not expose individual control IDs", "documents forbidden control IDs"],
  ["evidence filenames", "documents forbidden filenames"],
  ["test timing details", "documents forbidden timing details"],
  ["separate product/security decision", "documents future disclosure expansion gate"],
] as const) {
  assertIncludes(disclosureDoc, needle, label);
}

const publicTrustSurface = [publicModel, publicCopy, publicApi, publicUi].join("\n");
assertNotMatches(
  publicTrustSurface,
  /Compliant since|Compliant od|Compliant dal|GDPR compliant/i,
  "public Trust Center must not use compliant-since/GDPR-compliant wording",
);
assertMatches(
  publicTrustSurface,
  /Readiness evidence since|Evidence připravenosti od|Evidenza di preparazione dal/,
  "public Trust Center should use bounded readiness-evidence wording",
);

for (const aggregateField of ["totalControls", "verified", "inProgress", "notApplicable", "score"] as const) {
  assertIncludes(
    publicApi,
    `${aggregateField}:`,
    "public Trust Center API intentionally keeps aggregate counts/scores",
  );
}
assertNotMatches(
  publicApi,
  /controlId|controlKey|evidence(File|Filename|Name)|blobUrl|fileName|lastTestedAt|nextTestAt|ranAt|testResult/i,
  "public Trust Center API must not disclose individual controls, evidence filenames, or test timing details",
);
assertIncludes(
  publicModel,
  "lastTestedAt: null",
  "public Trust Center model suppresses exact last-test timing",
);
assertIncludes(
  publicModel,
  "nextTestAt: null",
  "public Trust Center model suppresses exact next-test timing",
);
assertIncludes(
  publicModel,
  "showLiveIndicator: false",
  "public Trust Center model suppresses live test detail",
);
assertNotMatches(
  [publicUi, read("app/(marketing)/trust/[orgSlug]/page.tsx"), read("app/(marketing)/trust/[orgSlug]/frameworks/[frameworkSlug]/page.tsx")].join("\n"),
  /formatDateTime\((?:trustCenter\.)?(?:lastTestedAt|nextTestAt|lastAssessedAt|framework\.lastAssessedAt|data\.framework\.lastAssessedAt)/,
  "public Trust Center UI/pages must not render exact test or assessment timing details",
);
assertNotMatches(
  publicUi,
  /copy\.liveIndicator\.last|lastTestedAt[:,]|lastAssessedAt[:,]/,
  "public Trust Center UI must not keep dormant exact timing props/display paths",
);

assertIncludes(
  vendorQueries,
  "assessedBy: \"vendor_reported_manual_review\"",
  "vendor token submissions retain vendor-reported/manual-review provenance",
);
assertNotMatches(
  [vendorQueries, vendorAssessmentAction].join("\n"),
  /orgControlStatuses|assessmentResult:\s*["']pass["']|status:\s*["']pass["']|createManualEvidence|evidence\)/,
  "vendor-submitted proof must not create automatic passing control evidence",
);
assertMatches(
  vendorRiskPdf,
  /vendor-reported[\s\S]*manual review/i,
  "vendor report must label vendor-submitted proof as vendor-reported/manual-review",
);

for (const [needle, label] of [
  ["incident report exports", "incident PDF routes source-smoked"],
  ["access review CSV export", "access-review CSV source-smoked"],
  ["policy download", "policy download source-smoked"],
  ["evidence download", "evidence download source-smoked"],
  ["ISO 27001 package", "ISO package source-smoked"],
  ["smart document XLSX", "smart document XLSX source-smoked"],
  ["evidence metadata export", "evidence metadata CSV source-smoked"],
  ["workspace JSON export", "workspace JSON source-smoked"],
] as const) {
  assertIncludes(exportSmoke, needle, label);
  assertIncludes(planMatrix, needle, `${label} documented in entitlement matrix`);
}

assertIncludes(laneReport, "T4-F closeout", "lane 06 report records T4-F closeout");
assertIncludes(laneReport, "APPROVED aggregate-only", "lane 06 report records aggregate-only approval");

console.log("T4-F legal/public proof smoke passed.");
