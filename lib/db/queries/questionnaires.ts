import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  articles,
  controls,
  evidence,
  frameworkControlArticles,
  frameworkControls,
  frameworks,
  orgControlStatuses,
  policies,
  sourceDocuments,
} from "@/lib/db/schema";
import { getOrganisationByClerkOrgId } from "./organisations";

export async function getQuestionnaireComplianceContext(clerkOrgId: string) {
  const db = getDb();
  const organisation = await getOrganisationByClerkOrgId(clerkOrgId);
  const [controlRows, evidenceRows, policyRows, legalCitationRows] =
    await Promise.all([
      db
        .select({
          controlId: controls.id,
          controlKey: controls.key,
          description: controls.descriptionCs,
          isAutomated: controls.isAutomated,
          lastEvidenceAt: orgControlStatuses.lastEvidenceAt,
          notes: orgControlStatuses.notes,
          status: orgControlStatuses.status,
          title: controls.titleCs,
          updatedAt: orgControlStatuses.updatedAt,
        })
        .from(orgControlStatuses)
        .innerJoin(controls, eq(orgControlStatuses.controlId, controls.id))
        .where(eq(orgControlStatuses.clerkOrgId, clerkOrgId))
        .orderBy(desc(orgControlStatuses.updatedAt))
        .limit(150),
      db
        .select({
          collectedAt: evidence.collectedAt,
          controlId: controls.id,
          controlKey: controls.key,
          controlTitle: controls.titleCs,
          description: evidence.description,
          evidenceId: evidence.id,
          expiresAt: evidence.expiresAt,
          integrationRunId: evidence.integrationRunId,
          source: evidence.source,
          status: evidence.status,
          type: evidence.type,
        })
        .from(evidence)
        .innerJoin(controls, eq(evidence.controlId, controls.id))
        .where(eq(evidence.clerkOrgId, clerkOrgId))
        .orderBy(desc(evidence.collectedAt))
        .limit(150),
      db
        .select({
          expiresAt: policies.expiresAt,
          policyId: policies.id,
          reviewedAt: policies.reviewedAt,
          status: policies.status,
          title: policies.titleCs,
          type: policies.type,
        })
        .from(policies)
        .where(eq(policies.clerkOrgId, clerkOrgId))
        .orderBy(desc(policies.createdAt))
        .limit(80),
      db
        .selectDistinct({
          articleId: articles.id,
          articleKey: articles.articleKey,
          citation: articles.citation,
          frameworkName: frameworks.nameEn,
          frameworkSlug: frameworks.slug,
          jurisdiction: articles.jurisdiction,
          legalCitationId: sql<string>`concat(
            ${frameworks.slug},
            ':',
            ${articles.jurisdiction},
            ':',
            ${articles.articleKey}
          )`,
          locale: articles.locale,
          officialText: articles.officialText,
          sourceDocumentId: sourceDocuments.id,
          sourceTitle: sourceDocuments.title,
          sourceUrl: sourceDocuments.url,
        })
        .from(orgControlStatuses)
        .innerJoin(controls, eq(orgControlStatuses.controlId, controls.id))
        .innerJoin(frameworkControls, eq(frameworkControls.controlId, controls.id))
        .innerJoin(
          frameworkControlArticles,
          eq(frameworkControlArticles.frameworkControlId, frameworkControls.id),
        )
        .innerJoin(articles, eq(articles.id, frameworkControlArticles.articleId))
        .innerJoin(frameworks, eq(frameworks.id, articles.frameworkId))
        .innerJoin(
          sourceDocuments,
          eq(sourceDocuments.id, articles.sourceDocumentId),
        )
        .where(
          and(
            eq(orgControlStatuses.clerkOrgId, clerkOrgId),
            inArray(orgControlStatuses.status, ["pass", "not_applicable"]),
            eq(articles.reviewStatus, "reviewed"),
            eq(frameworkControlArticles.confidence, "reviewed"),
          ),
        )
        .orderBy(
          asc(frameworks.slug),
          asc(articles.jurisdiction),
          asc(articles.articleKey),
        )
        .limit(80),
    ]);

  return {
    controls: controlRows,
    evidence: evidenceRows,
    legalCitations: legalCitationRows,
    organisation,
    policies: policyRows,
  };
}
