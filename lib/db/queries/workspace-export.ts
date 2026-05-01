import { desc, eq, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  accessReviewItems,
  accessReviews,
  auditLogs,
  consultantClients,
  controls,
  evidence,
  frameworks,
  incidents,
  integrationRuns,
  integrations,
  organisations,
  orgControlStatuses,
  orgFrameworks,
  policies,
  policyControls,
  profiles,
  regulationUpdateReads,
  regulationUpdates,
  riskItems,
  tests,
  trustCenterRequests,
  trustCenters,
  vendorAssessments,
  vendors,
} from "@/lib/db/schema";

function redactIntegration(row: typeof integrations.$inferSelect) {
  const { accessTokenEnc, refreshTokenEnc, ...safeRow } = row;

  return {
    ...safeRow,
    hasAccessToken: Boolean(accessTokenEnc),
    hasRefreshToken: Boolean(refreshTokenEnc),
  };
}

function redactEvidence(row: typeof evidence.$inferSelect) {
  const { blobUrl, ...safeRow } = row;

  return {
    ...safeRow,
    downloadPath: blobUrl ? `/api/evidence/${row.id}/download` : null,
    hasFile: Boolean(blobUrl),
  };
}

function redactPolicy(row: typeof policies.$inferSelect) {
  const { blobUrl, ...safeRow } = row;

  return {
    ...safeRow,
    downloadPath: blobUrl ? `/api/policies/${row.id}/download` : null,
    hasFile: Boolean(blobUrl),
  };
}

export async function getWorkspaceExport(clerkOrgId: string) {
  const db = getDb();
  const organisationRows = await db
    .select()
    .from(organisations)
    .where(eq(organisations.clerkOrgId, clerkOrgId))
    .limit(1);
  const organisation = organisationRows[0] ?? null;

  if (!organisation) {
    return null;
  }

  const [
    profileRows,
    orgFrameworkRows,
    controlStatusRows,
    integrationRows,
    integrationRunRows,
    evidenceRows,
    policyRows,
    policyControlRows,
    vendorRows,
    vendorAssessmentRows,
    incidentRows,
    riskRows,
    trustCenterRows,
    consultantClientRows,
    trustCenterRequestRows,
    accessReviewRows,
    accessReviewItemRows,
    regulationReadRows,
    auditLogRows,
  ] = await Promise.all([
    db
      .select()
      .from(profiles)
      .where(eq(profiles.clerkOrgId, clerkOrgId))
      .orderBy(profiles.createdAt),
    db
      .select({
        enrolledAt: orgFrameworks.enrolledAt,
        frameworkId: orgFrameworks.frameworkId,
        frameworkName: frameworks.nameCs,
        frameworkSlug: frameworks.slug,
        id: orgFrameworks.id,
        score: orgFrameworks.score,
        status: orgFrameworks.status,
        targetDate: orgFrameworks.targetDate,
      })
      .from(orgFrameworks)
      .innerJoin(frameworks, eq(orgFrameworks.frameworkId, frameworks.id))
      .where(eq(orgFrameworks.clerkOrgId, clerkOrgId))
      .orderBy(frameworks.slug),
    db
      .select({
        assignedTo: orgControlStatuses.assignedTo,
        controlId: orgControlStatuses.controlId,
        controlKey: controls.key,
        controlTitle: controls.titleCs,
        id: orgControlStatuses.id,
        lastEvidenceAt: orgControlStatuses.lastEvidenceAt,
        lastTestedAt: orgControlStatuses.lastTestedAt,
        notes: orgControlStatuses.notes,
        status: orgControlStatuses.status,
        updatedAt: orgControlStatuses.updatedAt,
      })
      .from(orgControlStatuses)
      .innerJoin(controls, eq(orgControlStatuses.controlId, controls.id))
      .where(eq(orgControlStatuses.clerkOrgId, clerkOrgId))
      .orderBy(controls.key),
    db
      .select()
      .from(integrations)
      .where(eq(integrations.clerkOrgId, clerkOrgId))
      .orderBy(integrations.provider),
    db
      .select({
        failureReason: integrationRuns.failureReason,
        id: integrationRuns.id,
        integrationId: integrationRuns.integrationId,
        provider: integrations.provider,
        ranAt: integrationRuns.ranAt,
        resultData: integrationRuns.resultData,
        status: integrationRuns.status,
        testId: integrationRuns.testId,
        testName: tests.name,
      })
      .from(integrationRuns)
      .leftJoin(integrations, eq(integrationRuns.integrationId, integrations.id))
      .leftJoin(tests, eq(integrationRuns.testId, tests.id))
      .where(eq(integrationRuns.clerkOrgId, clerkOrgId))
      .orderBy(desc(integrationRuns.ranAt)),
    db
      .select()
      .from(evidence)
      .where(eq(evidence.clerkOrgId, clerkOrgId))
      .orderBy(desc(evidence.collectedAt)),
    db
      .select()
      .from(policies)
      .where(eq(policies.clerkOrgId, clerkOrgId))
      .orderBy(desc(policies.createdAt)),
    db
      .select({
        controlId: policyControls.controlId,
        controlKey: controls.key,
        controlTitle: controls.titleCs,
        policyId: policyControls.policyId,
      })
      .from(policyControls)
      .innerJoin(policies, eq(policyControls.policyId, policies.id))
      .innerJoin(controls, eq(policyControls.controlId, controls.id))
      .where(eq(policies.clerkOrgId, clerkOrgId))
      .orderBy(controls.key),
    db
      .select()
      .from(vendors)
      .where(eq(vendors.clerkOrgId, clerkOrgId))
      .orderBy(vendors.createdAt),
    db
      .select()
      .from(vendorAssessments)
      .where(eq(vendorAssessments.clerkOrgId, clerkOrgId))
      .orderBy(desc(vendorAssessments.assessedAt)),
    db
      .select()
      .from(incidents)
      .where(eq(incidents.clerkOrgId, clerkOrgId))
      .orderBy(desc(incidents.detectedAt)),
    db
      .select()
      .from(riskItems)
      .where(eq(riskItems.clerkOrgId, clerkOrgId))
      .orderBy(desc(riskItems.createdAt)),
    db
      .select()
      .from(trustCenters)
      .where(eq(trustCenters.clerkOrgId, clerkOrgId))
      .limit(1),
    db
      .select()
      .from(consultantClients)
      .where(
        or(
          eq(consultantClients.consultantOrgId, clerkOrgId),
          eq(consultantClients.clientOrgId, clerkOrgId),
        ),
      )
      .orderBy(desc(consultantClients.updatedAt)),
    db
      .select()
      .from(trustCenterRequests)
      .where(eq(trustCenterRequests.clerkOrgId, clerkOrgId))
      .orderBy(desc(trustCenterRequests.createdAt)),
    db
      .select()
      .from(accessReviews)
      .where(eq(accessReviews.clerkOrgId, clerkOrgId))
      .orderBy(desc(accessReviews.createdAt)),
    db
      .select()
      .from(accessReviewItems)
      .where(eq(accessReviewItems.clerkOrgId, clerkOrgId))
      .orderBy(accessReviewItems.userName),
    db
      .select({
        externalId: regulationUpdates.externalId,
        readAt: regulationUpdateReads.readAt,
        severity: regulationUpdates.severity,
        source: regulationUpdates.source,
        sourceUrl: regulationUpdates.sourceUrl,
        title: regulationUpdates.title,
        updateId: regulationUpdateReads.updateId,
      })
      .from(regulationUpdateReads)
      .innerJoin(
        regulationUpdates,
        eq(regulationUpdateReads.updateId, regulationUpdates.id),
      )
      .where(eq(regulationUpdateReads.clerkOrgId, clerkOrgId))
      .orderBy(desc(regulationUpdateReads.readAt)),
    db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.clerkOrgId, clerkOrgId))
      .orderBy(desc(auditLogs.createdAt)),
  ]);

  return {
    auditLogs: auditLogRows,
    consultantClients: consultantClientRows,
    controls: {
      statuses: controlStatusRows,
    },
    evidence: evidenceRows.map(redactEvidence),
    exportedAt: new Date().toISOString(),
    exportVersion: 1,
    frameworks: {
      enrolled: orgFrameworkRows,
    },
    incidents: incidentRows,
    integrations: {
      connections: integrationRows.map(redactIntegration),
      runs: integrationRunRows,
    },
    organisation,
    policies: {
      controls: policyControlRows,
      documents: policyRows.map(redactPolicy),
    },
    profiles: profileRows,
    redactions: [
      "integrations.accessTokenEnc",
      "integrations.refreshTokenEnc",
      "evidence.blobUrl",
      "policies.blobUrl",
    ],
    regulationUpdates: {
      reads: regulationReadRows,
    },
    risks: riskRows,
    trustCenter: {
      requests: trustCenterRequestRows,
      settings: trustCenterRows[0] ?? null,
    },
    vendors: {
      assessments: vendorAssessmentRows,
      items: vendorRows,
    },
    accessReviews: {
      items: accessReviewItemRows,
      reviews: accessReviewRows,
    },
  };
}
