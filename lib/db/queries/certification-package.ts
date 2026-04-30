import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  controls,
  evidence,
  frameworkControls,
  frameworks,
  organisations,
  orgControlStatuses,
  policies,
} from "@/lib/db/schema";

export async function getIso27001CertificationPackage(clerkOrgId: string) {
  const db = getDb();
  const frameworkRows = await db
    .select()
    .from(frameworks)
    .where(eq(frameworks.slug, "iso27001"))
    .limit(1);
  const framework = frameworkRows[0] ?? null;

  if (!framework) {
    throw new Error("ISO 27001 framework is not seeded.");
  }

  const [organisationRows, soaRows, policyRows] = await Promise.all([
    db
      .select()
      .from(organisations)
      .where(eq(organisations.clerkOrgId, clerkOrgId))
      .limit(1),
    db
      .select({
        articleRef: frameworkControls.articleRef,
        category: controls.category,
        controlId: controls.id,
        controlKey: controls.key,
        description: controls.descriptionCs,
        evidenceAt: orgControlStatuses.lastEvidenceAt,
        isAutomated: controls.isAutomated,
        requirementLevel: frameworkControls.requirementLevel,
        status: orgControlStatuses.status,
        title: controls.titleCs,
        updatedAt: orgControlStatuses.updatedAt,
      })
      .from(frameworkControls)
      .innerJoin(controls, eq(frameworkControls.controlId, controls.id))
      .leftJoin(
        orgControlStatuses,
        and(
          eq(orgControlStatuses.controlId, controls.id),
          eq(orgControlStatuses.clerkOrgId, clerkOrgId),
        ),
      )
      .where(eq(frameworkControls.frameworkId, framework.id))
      .orderBy(frameworkControls.sortOrder),
    db
      .select({
        blobUrl: policies.blobUrl,
        createdAt: policies.createdAt,
        expiresAt: policies.expiresAt,
        id: policies.id,
        reviewedAt: policies.reviewedAt,
        status: policies.status,
        title: policies.titleCs,
        type: policies.type,
      })
      .from(policies)
      .where(eq(policies.clerkOrgId, clerkOrgId))
      .orderBy(desc(policies.createdAt)),
  ]);
  const passingControlIds = Array.from(
    new Set(
      soaRows
        .filter((row) => row.status === "pass")
        .map((row) => row.controlId),
    ),
  );
  const evidenceRows =
    passingControlIds.length > 0
      ? await db
          .select({
            blobUrl: evidence.blobUrl,
            collectedAt: evidence.collectedAt,
            collectedBy: evidence.collectedBy,
            controlId: evidence.controlId,
            description: evidence.description,
            expiresAt: evidence.expiresAt,
            id: evidence.id,
            source: evidence.source,
            type: evidence.type,
          })
          .from(evidence)
          .where(
            and(
              eq(evidence.clerkOrgId, clerkOrgId),
              inArray(evidence.controlId, passingControlIds),
            ),
          )
          .orderBy(desc(evidence.collectedAt))
      : [];

  return {
    evidence: evidenceRows,
    framework,
    organisation: organisationRows[0] ?? null,
    policies: policyRows,
    statementOfApplicability: soaRows,
  };
}
