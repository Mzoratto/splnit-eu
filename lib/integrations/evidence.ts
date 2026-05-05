import { and, asc, eq } from "drizzle-orm";
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
  resultStatus: TestStatus;
}) {
  if (input.resultStatus === "error") {
    return false;
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

  await db.insert(evidence).values({
    clerkOrgId: input.clerkOrgId,
    collectedBy: "system:integration-runner",
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
    source: `integration:${input.provider}`,
    type: "automated_snapshot",
  });
}
