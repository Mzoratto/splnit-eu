import assert from "node:assert/strict";
import {
  buildAutomatedEvidenceSnapshot,
  shouldCollectAutomatedEvidence,
} from "../lib/integrations/evidence";

const now = new Date("2026-05-05T12:00:00.000Z");
const recent = new Date("2026-05-05T11:00:00.000Z");
const stale = new Date("2026-05-04T11:00:00.000Z");

assert.equal(
  shouldCollectAutomatedEvidence({
    lastEvidenceAt: null,
    now,
    previousStatus: null,
    resultStatus: "pass",
  }),
  true,
  "first successful automated result should create evidence",
);

assert.equal(
  shouldCollectAutomatedEvidence({
    lastEvidenceAt: recent,
    now,
    previousStatus: "pass",
    resultStatus: "fail",
  }),
  true,
  "status changes should create evidence immediately",
);

assert.equal(
  shouldCollectAutomatedEvidence({
    lastEvidenceAt: recent,
    now,
    previousStatus: "pass",
    resultStatus: "pass",
  }),
  false,
  "unchanged recent automated results should not create duplicate evidence",
);

assert.equal(
  shouldCollectAutomatedEvidence({
    lastEvidenceAt: stale,
    now,
    previousStatus: "pass",
    resultStatus: "pass",
  }),
  true,
  "unchanged automated results should refresh evidence after 24 hours",
);

assert.equal(
  shouldCollectAutomatedEvidence({
    lastEvidenceAt: null,
    now,
    previousStatus: null,
    resultStatus: "error",
  }),
  false,
  "integration execution errors are not control evidence",
);

const snapshot = buildAutomatedEvidenceSnapshot({
  checkLogic: "check_mfa_enabled",
  citations: [
    {
      articleId: "article-reviewed",
      articleKey: "Article 21",
      citation: "Directive (EU) 2022/2555, Article 21",
      citationNote: "Risk-management measures",
      confidence: "reviewed",
      frameworkSlug: "nis2",
      jurisdiction: "EU",
      locale: "en-EU",
      reviewStatus: "reviewed",
      sourceDocumentId: "source-reviewed",
      sourceTitle: "Directive (EU) 2022/2555",
      sourceUrl: "https://eur-lex.europa.eu/eli/dir/2022/2555/oj/eng",
    },
    {
      articleId: "article-draft",
      articleKey: "ZKB section 16",
      citation: "Zakon c. 264/2025 Sb. section 16",
      citationNote: "Draft extraction aid",
      confidence: "draft",
      frameworkSlug: "nis2",
      jurisdiction: "CZ",
      locale: "cs-CZ",
      reviewStatus: "draft",
      sourceDocumentId: "source-draft",
      sourceTitle: "Zakony pro lidi extraction PDF",
      sourceUrl: null,
    },
  ],
  failureReason: undefined,
  passCriteria: "All active users have at least one MFA method.",
  provider: "microsoft365",
  resultData: { totalUsers: 8, mfaEnabled: 8 },
  status: "pass",
  testName: "Microsoft 365 MFA enabled",
});

assert.deepEqual(
  snapshot.reviewedCitations.map((citation) => citation.articleId),
  ["article-reviewed"],
  "automated evidence snapshots must only include reviewed legal citations",
);
assert.equal(snapshot.citationStatus, "reviewed_citations_available");

const unsupportedSnapshot = buildAutomatedEvidenceSnapshot({
  checkLogic: "check_mfa_enabled",
  citations: [],
  failureReason: undefined,
  passCriteria: "All active users have at least one MFA method.",
  provider: "microsoft365",
  resultData: { totalUsers: 8, mfaEnabled: 8 },
  status: "pass",
  testName: "Microsoft 365 MFA enabled",
});

assert.equal(
  unsupportedSnapshot.citationStatus,
  "no_reviewed_citations",
  "snapshots with no reviewed article support must say so explicitly",
);

console.log("Integration evidence policy smoke test passed.");
