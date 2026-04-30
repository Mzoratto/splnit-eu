import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  controls,
  evidence,
  orgControlStatuses,
  policies,
} from "@/lib/db/schema";
import { getOrganisationByClerkOrgId } from "./organisations";

export async function getQuestionnaireComplianceContext(clerkOrgId: string) {
  const db = getDb();
  const organisation = await getOrganisationByClerkOrgId(clerkOrgId);
  const [controlRows, evidenceRows, policyRows] = await Promise.all([
    db
      .select({
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
      .where(
        and(
          eq(orgControlStatuses.clerkOrgId, clerkOrgId),
          inArray(orgControlStatuses.status, ["pass", "not_applicable"]),
        ),
      )
      .orderBy(desc(orgControlStatuses.updatedAt))
      .limit(150),
    db
      .select({
        collectedAt: evidence.collectedAt,
        controlKey: controls.key,
        controlTitle: controls.titleCs,
        description: evidence.description,
        evidenceId: evidence.id,
        integrationRunId: evidence.integrationRunId,
        source: evidence.source,
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
  ]);

  return {
    controls: controlRows,
    evidence: evidenceRows,
    organisation,
    policies: policyRows,
  };
}
