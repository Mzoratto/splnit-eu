import { describe, expect, it } from "vitest";
import {
  buildAutomatedEvidenceSnapshot,
  getEvidenceStateForTestResult,
  shouldCollectAutomatedEvidence,
} from "@/lib/integrations/evidence";

const NOW = new Date("2026-06-11T12:00:00.000Z");
const ONE_HOUR_AGO = new Date(NOW.getTime() - 60 * 60 * 1000);
const TWO_DAYS_AGO = new Date(NOW.getTime() - 48 * 60 * 60 * 1000);

describe("shouldCollectAutomatedEvidence", () => {
  it("collects when no previous evidence exists", () => {
    expect(
      shouldCollectAutomatedEvidence({
        lastEvidenceAt: null,
        now: NOW,
        previousStatus: null,
        resultStatus: "pass",
      }),
    ).toBe(true);
  });

  it("collects when the status changed", () => {
    expect(
      shouldCollectAutomatedEvidence({
        lastEvidenceAt: ONE_HOUR_AGO,
        now: NOW,
        previousStatus: "pass",
        resultStatus: "fail",
      }),
    ).toBe(true);
  });

  it("skips recollection inside the 24h refresh window for an unchanged status", () => {
    expect(
      shouldCollectAutomatedEvidence({
        lastEvidenceAt: ONE_HOUR_AGO,
        now: NOW,
        previousStatus: "pass",
        resultStatus: "pass",
      }),
    ).toBe(false);
  });

  it("recollects once the refresh window elapses", () => {
    expect(
      shouldCollectAutomatedEvidence({
        lastEvidenceAt: TWO_DAYS_AGO,
        now: NOW,
        previousStatus: "pass",
        resultStatus: "pass",
      }),
    ).toBe(true);
  });

  it("skips error results without a known blocked reason", () => {
    expect(
      shouldCollectAutomatedEvidence({
        lastEvidenceAt: null,
        now: NOW,
        previousStatus: null,
        resultData: {},
        resultStatus: "error",
      }),
    ).toBe(false);
  });

  it("collects missing_permission errors even without allowErrorEvidence", () => {
    expect(
      shouldCollectAutomatedEvidence({
        lastEvidenceAt: null,
        now: NOW,
        previousStatus: null,
        resultData: { blockedReason: "missing_permission" },
        resultStatus: "error",
      }),
    ).toBe(true);
  });

  it("collects other blocked errors only when allowErrorEvidence is set", () => {
    const input = {
      lastEvidenceAt: null,
      now: NOW,
      previousStatus: null,
      resultData: { blockedReason: "collection_failed" },
      resultStatus: "error" as const,
    };

    expect(shouldCollectAutomatedEvidence(input)).toBe(false);
    expect(
      shouldCollectAutomatedEvidence({ ...input, allowErrorEvidence: true }),
    ).toBe(true);
  });
});

describe("getEvidenceStateForTestResult", () => {
  it("maps pass to collected/pass", () => {
    const state = getEvidenceStateForTestResult({ resultData: {}, status: "pass" });

    expect(state.assessment_result).toBe("pass");
    expect(state.collection_status).toBe("collected");
    expect(state.source).toBe("connector");
    expect(state.collected_at).toBeInstanceOf(Date);
  });

  it("maps fail to collected/gap", () => {
    const state = getEvidenceStateForTestResult({ resultData: {}, status: "fail" });

    expect(state.assessment_result).toBe("gap");
    expect(state.collection_status).toBe("collected");
  });

  it("maps manual_review to blocked with needs_manual_upload by default", () => {
    const state = getEvidenceStateForTestResult({
      resultData: {},
      status: "manual_review",
    });

    expect(state.collection_status).toBe("blocked");
    expect(state.blocked_reason).toBe("needs_manual_upload");
  });

  it("maps missing_permission errors to blocked, other errors to failed", () => {
    const blocked = getEvidenceStateForTestResult({
      resultData: { blockedReason: "missing_permission" },
      status: "error",
    });
    const failed = getEvidenceStateForTestResult({ resultData: {}, status: "error" });

    expect(blocked.collection_status).toBe("blocked");
    expect(blocked.blocked_reason).toBe("missing_permission");
    expect(failed.collection_status).toBe("failed");
    expect(failed.blocked_reason).toBe("collection_failed");
  });
});

describe("buildAutomatedEvidenceSnapshot", () => {
  const baseCitation = {
    articleId: "a1",
    articleKey: "art-1",
    citation: "Article 1",
    citationNote: null,
    confidence: "reviewed",
    frameworkSlug: "nis2",
    jurisdiction: "cz",
    locale: "cs-CZ",
    sourceDocumentId: "doc-1",
    sourceTitle: "Act 264/2025",
    sourceUrl: null,
  };

  it("keeps only reviewed citations and flags availability", () => {
    const snapshot = buildAutomatedEvidenceSnapshot({
      checkLogic: "check",
      citations: [
        { ...baseCitation, reviewStatus: "reviewed" },
        { ...baseCitation, articleId: "a2", reviewStatus: "draft" },
      ],
      passCriteria: null,
      provider: "microsoft365",
      resultData: {},
      status: "pass",
      testName: "MFA enforced",
    });

    expect(snapshot.reviewedCitations).toHaveLength(1);
    expect(snapshot.citationStatus).toBe("reviewed_citations_available");
  });

  it("reports no_reviewed_citations when nothing is reviewed", () => {
    const snapshot = buildAutomatedEvidenceSnapshot({
      checkLogic: "check",
      citations: [{ ...baseCitation, reviewStatus: "draft" }],
      passCriteria: null,
      provider: "microsoft365",
      resultData: {},
      status: "pass",
      testName: "MFA enforced",
    });

    expect(snapshot.reviewedCitations).toHaveLength(0);
    expect(snapshot.citationStatus).toBe("no_reviewed_citations");
  });

  it("sorts reviewed citations by framework slug, then article key", () => {
    const snapshot = buildAutomatedEvidenceSnapshot({
      checkLogic: "check",
      citations: [
        { ...baseCitation, articleKey: "b", frameworkSlug: "nis2", reviewStatus: "reviewed" },
        { ...baseCitation, articleKey: "a", frameworkSlug: "nis2", reviewStatus: "reviewed" },
        { ...baseCitation, articleKey: "z", frameworkSlug: "gdpr", reviewStatus: "reviewed" },
      ],
      passCriteria: null,
      provider: "microsoft365",
      resultData: {},
      status: "pass",
      testName: "MFA enforced",
    });

    expect(
      snapshot.reviewedCitations.map((c) => `${c.frameworkSlug}:${c.articleKey}`),
    ).toEqual(["gdpr:z", "nis2:a", "nis2:b"]);
  });
});
