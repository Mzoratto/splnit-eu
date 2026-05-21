import { and, asc, eq } from "drizzle-orm";
import { recordActivationEvent } from "@/lib/activation/events";
import { createEvidenceState } from "@/lib/activation/evidence-state";
import type { EvidenceBlockedReason } from "@/lib/activation/evidence-state";
import { getDb } from "@/lib/db";
import {
  articles,
  evidence,
  frameworkControlArticles,
  frameworkControls,
  frameworks,
  sourceDocuments,
} from "@/lib/db/schema";
import type { TestStatus } from "./types";

const AUTOMATED_EVIDENCE_REFRESH_MS = 24 * 60 * 60 * 1000;

type CitationCandidate = {
  articleId: string;
  articleKey: string;
  citation: string;
  citationNote: string | null;
  confidence: string;
  frameworkSlug: string;
  jurisdiction: string;
  locale: string;
  reviewStatus: string;
  sourceDocumentId: string;
  sourceTitle: string;
  sourceUrl: string | null;
};

type ReviewedCitation = Omit<CitationCandidate, "reviewStatus"> & {
  reviewStatus: "reviewed";
};

export type AutomatedEvidenceSnapshot = {
  checkLogic: string;
  citationStatus: "reviewed_citations_available" | "no_reviewed_citations";
  failureReason: string | null;
  passCriteria: string | null;
  provider: string;
  resultData: Record<string, unknown>;
  reviewedCitations: ReviewedCitation[];
  status: TestStatus;
  testName: string;
};

export function shouldCollectAutomatedEvidence(input: {
  lastEvidenceAt: Date | null;
  now: Date;
  previousStatus: string | null;
  resultData?: Record<string, unknown>;
  resultStatus: TestStatus;
}) {
  if (input.resultStatus === "error") {
    return input.resultData?.blockedReason === "missing_permission";
  }

  if (!input.lastEvidenceAt) {
    return true;
  }

  if (input.previousStatus && input.previousStatus !== input.resultStatus) {
    return true;
  }

  return (
    input.now.getTime() - input.lastEvidenceAt.getTime() >=
    AUTOMATED_EVIDENCE_REFRESH_MS
  );
}

export function buildAutomatedEvidenceSnapshot(input: {
  checkLogic: string;
  citations: CitationCandidate[];
  failureReason?: string;
  passCriteria: string | null;
  provider: string;
  resultData: Record<string, unknown>;
  status: TestStatus;
  testName: string;
}): AutomatedEvidenceSnapshot {
  const reviewedCitations = input.citations
    .filter((citation): citation is ReviewedCitation =>
      citation.reviewStatus === "reviewed",
    )
    .sort((a, b) => {
      const frameworkOrder = a.frameworkSlug.localeCompare(b.frameworkSlug);

      if (frameworkOrder !== 0) {
        return frameworkOrder;
      }

      return a.articleKey.localeCompare(b.articleKey);
    });

  return {
    checkLogic: input.checkLogic,
    citationStatus:
      reviewedCitations.length > 0
        ? "reviewed_citations_available"
        : "no_reviewed_citations",
    failureReason: input.failureReason ?? null,
    passCriteria: input.passCriteria,
    provider: input.provider,
    resultData: input.resultData,
    reviewedCitations,
    status: input.status,
    testName: input.testName,
  };
}

export function getEvidenceStateForTestResult(input: {
  resultData: Record<string, unknown>;
  status: TestStatus;
}) {
  const blockedReason = input.resultData.blockedReason;
  const explicitBlockedReason =
    typeof blockedReason === "string" ? blockedReason as EvidenceBlockedReason : null;

  switch (input.status) {
    case "pass":
      return createEvidenceState({
        assessment_result: "pass",
        collected_at: new Date(),
        collection_status: "collected",
        source: "connector",
      });
    case "fail":
      return createEvidenceState({
        assessment_result: "gap",
        collected_at: new Date(),
        collection_status: "collected",
        source: "connector",
      });
    case "warning":
      return createEvidenceState({
        assessment_result: "warning",
        collected_at: new Date(),
        collection_status: "collected",
        source: "connector",
      });
    case "manual_review":
      return createEvidenceState({
        assessment_result: "manual_review",
        blocked_reason: explicitBlockedReason ?? "needs_manual_upload",
        collection_status: "blocked",
        source: "connector",
      });
    case "not_applicable":
      return createEvidenceState({
        assessment_result: "not_applicable",
        blocked_reason: "not_applicable",
        collection_status: "blocked",
        source: "connector",
      });
    case "error":
    default:
      if (explicitBlockedReason === "missing_permission") {
        return createEvidenceState({
          assessment_result: "unknown",
          blocked_reason: "missing_permission",
          collection_status: "blocked",
          source: "connector",
        });
      }

      return createEvidenceState({
        assessment_result: "unknown",
        blocked_reason: explicitBlockedReason ?? "collection_failed",
        collection_status: "failed",
        source: "connector",
      });
  }
}

async function listReviewedCitationsForControl(
  controlId: string,
): Promise<ReviewedCitation[]> {
  const db = getDb();
  const rows = await db
    .select({
      articleId: articles.id,
      articleKey: articles.articleKey,
      citation: articles.citation,
      citationNote: frameworkControlArticles.citationNote,
      confidence: frameworkControlArticles.confidence,
      frameworkSlug: frameworks.slug,
      jurisdiction: articles.jurisdiction,
      locale: articles.locale,
      reviewStatus: articles.reviewStatus,
      sourceDocumentId: sourceDocuments.id,
      sourceTitle: sourceDocuments.title,
      sourceUrl: sourceDocuments.url,
    })
    .from(frameworkControls)
    .innerJoin(
      frameworkControlArticles,
      eq(frameworkControlArticles.frameworkControlId, frameworkControls.id),
    )
    .innerJoin(articles, eq(articles.id, frameworkControlArticles.articleId))
    .innerJoin(frameworks, eq(frameworks.id, articles.frameworkId))
    .innerJoin(sourceDocuments, eq(sourceDocuments.id, articles.sourceDocumentId))
    .where(
      and(
        eq(frameworkControls.controlId, controlId),
        eq(articles.reviewStatus, "reviewed"),
        eq(frameworkControlArticles.confidence, "reviewed"),
      ),
    )
    .orderBy(asc(frameworks.slug), asc(articles.articleKey));

  return rows.map((row) => ({
    ...row,
    reviewStatus: "reviewed" as const,
  }));
}

export async function createAutomatedEvidenceForIntegrationRun(input: {
  checkLogic: string;
  clerkOrgId: string;
  controlId: string;
  failureReason?: string;
  integrationRunId: string;
  passCriteria: string | null;
  provider: string;
  resultData: Record<string, unknown>;
  status: TestStatus;
  testName: string;
}) {
  const db = getDb();
  const reviewedCitations = await listReviewedCitationsForControl(input.controlId);
  const evidenceState = getEvidenceStateForTestResult({
    resultData: input.resultData,
    status: input.status,
  });

  const insertedRows = await db.insert(evidence).values({
    assessmentResult: evidenceState.assessment_result,
    blockedReason: evidenceState.blocked_reason,
    clerkOrgId: input.clerkOrgId,
    collectedAt: evidenceState.collected_at,
    collectedBy: "system:integration-runner",
    collectionStatus: evidenceState.collection_status,
    confidence: evidenceState.confidence,
    controlId: input.controlId,
    description: `${input.provider} automated check: ${input.testName} (${input.status}).`,
    integrationRunId: input.integrationRunId,
    snapshotData: buildAutomatedEvidenceSnapshot({
      checkLogic: input.checkLogic,
      citations: reviewedCitations,
      failureReason: input.failureReason,
      passCriteria: input.passCriteria,
      provider: input.provider,
      resultData: input.resultData,
      status: input.status,
      testName: input.testName,
    }),
    source: evidenceState.source,
    type: "automated_snapshot",
  }).returning({ id: evidence.id });
  const evidenceId = insertedRows[0]?.id;

  if (!evidenceId) {
    throw new Error("Failed to create automated evidence record.");
  }

  if (evidenceState.collection_status === "collected") {
    await recordActivationEvent({
      clerkOrgId: input.clerkOrgId,
      entityId: evidenceId,
      entityType: "evidence",
      metadata: {
        assessmentResult: evidenceState.assessment_result,
        collectionStatus: evidenceState.collection_status,
        controlId: input.controlId,
        provider: input.provider,
        source: "connector",
        testName: input.testName,
      },
      name: "EvidenceCollected",
    });
  } else if (evidenceState.collection_status === "blocked" || evidenceState.collection_status === "failed") {
    await recordActivationEvent({
      clerkOrgId: input.clerkOrgId,
      entityId: evidenceId,
      entityType: "evidence",
      metadata: {
        blockedReason: evidenceState.blocked_reason ?? "collection_failed",
        collectionStatus: evidenceState.collection_status,
        controlId: input.controlId,
        provider: input.provider,
        source: "connector",
        testName: input.testName,
      },
      name: "EvidenceBlocked",
    });
  }

  return { evidenceId };
}
