import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  accessReviewItems,
  accessReviews,
  auditLogs,
  consultantClients,
  controls,
  evidence,
  incidents,
  orgControlStatuses,
  organisations,
  policies,
  riskItems,
  vendorAssessments,
  vendors,
} from "@/lib/db/schema";
import {
  completeAccessReview,
  createAccessReview,
  getAccessReviewDetail,
  updateAccessReviewItemDecision,
} from "@/lib/db/queries/access-reviews";
import { listAuditLogPage } from "@/lib/db/queries/audit-logs";
import {
  getConsultantClientDetail,
  linkConsultantClient,
  updateConsultantClientBranding,
} from "@/lib/db/queries/consultant-clients";
import { updateControlStatus } from "@/lib/db/queries/controls";
import { getEvidenceForOrg } from "@/lib/db/queries/evidence";
import {
  createIncident,
  getIncidentForOrg,
  markIncidentReported,
  updateIncidentStatus,
} from "@/lib/db/queries/incidents";
import { getPolicyForOrg } from "@/lib/db/queries/policies";
import {
  createRiskItem,
  listRiskItemsForOrg,
} from "@/lib/db/queries/risks";
import {
  createVendor,
  createVendorQuestionnaire,
  getVendorDetail,
  saveVendorAssessment,
} from "@/lib/db/queries/vendors";

loadEnvConfig(process.cwd());

assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required.");

const runId = `org_boundary_${Date.now()}`;
const orgA = `${runId}_a`;
const orgB = `${runId}_b`;
const userB = `${runId}_user_b`;

async function cleanup() {
  const db = getDb();
  const orgIds = [orgA, orgB];

  await db.delete(accessReviewItems).where(eq(accessReviewItems.clerkOrgId, orgA));
  await db.delete(accessReviewItems).where(eq(accessReviewItems.clerkOrgId, orgB));
  await db.delete(accessReviews).where(eq(accessReviews.clerkOrgId, orgA));
  await db.delete(accessReviews).where(eq(accessReviews.clerkOrgId, orgB));
  await db.delete(vendorAssessments).where(eq(vendorAssessments.clerkOrgId, orgA));
  await db.delete(vendorAssessments).where(eq(vendorAssessments.clerkOrgId, orgB));
  await db
    .delete(consultantClients)
    .where(eq(consultantClients.consultantOrgId, orgA));
  await db
    .delete(consultantClients)
    .where(eq(consultantClients.consultantOrgId, orgB));
  await db.delete(vendors).where(eq(vendors.clerkOrgId, orgA));
  await db.delete(vendors).where(eq(vendors.clerkOrgId, orgB));
  await db.delete(incidents).where(eq(incidents.clerkOrgId, orgA));
  await db.delete(incidents).where(eq(incidents.clerkOrgId, orgB));
  await db.delete(policies).where(eq(policies.clerkOrgId, orgA));
  await db.delete(policies).where(eq(policies.clerkOrgId, orgB));
  await db.delete(riskItems).where(eq(riskItems.clerkOrgId, orgA));
  await db.delete(riskItems).where(eq(riskItems.clerkOrgId, orgB));
  await db.delete(evidence).where(eq(evidence.clerkOrgId, orgA));
  await db.delete(evidence).where(eq(evidence.clerkOrgId, orgB));
  await db.delete(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, orgA));
  await db.delete(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, orgB));

  for (const clerkOrgId of orgIds) {
    await db
      .delete(organisations)
      .where(eq(organisations.clerkOrgId, clerkOrgId));
  }
}

async function seedOrganisations() {
  const db = getDb();

  await db.insert(organisations).values([
    {
      clerkOrgId: orgA,
      country: "IT",
      locale: "it-IT",
      name: "Org Boundary Smoke A",
      primaryJurisdiction: "IT",
    },
    {
      clerkOrgId: orgB,
      country: "IT",
      locale: "it-IT",
      name: "Org Boundary Smoke B",
      primaryJurisdiction: "IT",
    },
  ]);
}

async function getSmokeControl() {
  const db = getDb();
  const [control] = await db
    .select({ id: controls.id, key: controls.key })
    .from(controls)
    .where(eq(controls.key, "ctrl_mfa_all_users"))
    .limit(1);

  assert.ok(control, "Smoke control ctrl_mfa_all_users must exist.");
  return control;
}

async function assertControlStatusBoundary(controlKey: string) {
  const db = getDb();

  await updateControlStatus({
    clerkOrgId: orgA,
    controlKey,
    notes: "org boundary smoke A",
    status: "fail",
  });
  await updateControlStatus({
    clerkOrgId: orgB,
    controlKey,
    notes: "org boundary smoke B",
    status: "pass",
  });

  const [orgAStatus] = await db
    .select({ status: orgControlStatuses.status })
    .from(orgControlStatuses)
    .innerJoin(controls, eq(orgControlStatuses.controlId, controls.id))
    .where(
      and(
        eq(orgControlStatuses.clerkOrgId, orgA),
        eq(controls.key, controlKey),
      ),
    )
    .limit(1);

  assert.equal(orgAStatus?.status, "fail");
}

async function assertEvidenceBoundary(controlId: string) {
  const db = getDb();
  const [row] = await db
    .insert(evidence)
    .values({
      blobUrl: "https://example.com/org-boundary-evidence.txt",
      clerkOrgId: orgA,
      controlId,
      description: "Org boundary evidence",
      source: "manual" as const,
      type: "text/plain",
    })
    .returning({ id: evidence.id });

  assert.ok(row?.id, "Evidence row should be inserted.");
  assert.equal(
    await getEvidenceForOrg({ clerkOrgId: orgB, evidenceId: row.id }),
    null,
  );
}

async function assertPolicyBoundary() {
  const db = getDb();
  const [row] = await db
    .insert(policies)
    .values({
      blobUrl: "https://example.com/org-boundary-policy.pdf",
      clerkOrgId: orgA,
      content: { runId },
      status: "active",
      titleCs: "Org boundary policy",
      type: "org_boundary_policy",
    })
    .returning({ id: policies.id });

  assert.ok(row?.id, "Policy row should be inserted.");
  assert.equal(
    await getPolicyForOrg({ clerkOrgId: orgB, policyId: row.id }),
    null,
  );
}

async function assertVendorBoundary() {
  const db = getDb();
  const vendor = await createVendor({
    category: "security",
    clerkOrgId: orgA,
    name: "Org Boundary Vendor",
    website: "https://example.com",
  });

  assert.equal(
    await getVendorDetail({ clerkOrgId: orgB, vendorId: vendor.id }),
    null,
  );
  await assert.rejects(
    () =>
      saveVendorAssessment({
        answers: { security_owner: "yes" },
        assessedBy: userB,
        clerkOrgId: orgB,
        vendorId: vendor.id,
      }),
    /Vendor not found/,
  );
  await assert.rejects(
    () =>
      createVendorQuestionnaire({
        clerkOrgId: orgB,
        vendorEmail: "vendor@example.com",
        vendorId: vendor.id,
      }),
    /Vendor not found/,
  );

  const assessmentRows = await db
    .select({ id: vendorAssessments.id })
    .from(vendorAssessments)
    .where(eq(vendorAssessments.vendorId, vendor.id));

  assert.equal(assessmentRows.length, 0);
}

async function assertRiskBoundary() {
  await createRiskItem({
    category: "security",
    clerkOrgId: orgA,
    description: "Org boundary risk A",
    dueDate: null,
    impact: 4,
    likelihood: 3,
    owner: "Risk Owner A",
    title: "Org boundary risk A",
  });
  await createRiskItem({
    category: "security",
    clerkOrgId: orgB,
    description: "Org boundary risk B",
    dueDate: null,
    impact: 2,
    likelihood: 2,
    owner: "Risk Owner B",
    title: "Org boundary risk B",
  });

  const orgARisks = await listRiskItemsForOrg(orgA);
  const orgBRisks = await listRiskItemsForOrg(orgB);

  assert.equal(
    orgARisks.some((risk) => risk.title === "Org boundary risk A"),
    true,
  );
  assert.equal(
    orgARisks.some((risk) => risk.title === "Org boundary risk B"),
    false,
  );
  assert.equal(
    orgBRisks.some((risk) => risk.title === "Org boundary risk B"),
    true,
  );
  assert.equal(
    orgBRisks.some((risk) => risk.title === "Org boundary risk A"),
    false,
  );
}

async function assertIncidentBoundary() {
  const incident = await createIncident({
    affectsCriticalSystems: true,
    affectsPersonalData: true,
    clerkOrgId: orgA,
    description: "Org boundary incident",
    detectedAt: new Date(),
    severity: "high",
    title: "Org boundary incident",
  });

  assert.ok(incident?.id, "Incident should be inserted.");
  assert.equal(
    await getIncidentForOrg({ clerkOrgId: orgB, incidentId: incident.id }),
    null,
  );

  await assert.rejects(
    () =>
      updateIncidentStatus({
        clerkOrgId: orgB,
        incidentId: incident.id,
        status: "resolved",
      }),
    /Incident not found/,
  );
  await assert.rejects(
    () =>
      markIncidentReported({
        clerkOrgId: orgB,
        incidentId: incident.id,
        track: "cybersecurity",
      }),
    /Incident not found/,
  );

  const unchanged = await getIncidentForOrg({
    clerkOrgId: orgA,
    incidentId: incident.id,
  });

  assert.equal(unchanged?.status, "open");
  assert.equal(unchanged?.reportedToNukib, false);
}

async function assertAccessReviewBoundary() {
  const review = await createAccessReview({
    clerkOrgId: orgA,
    dueDate: "2026-12-31",
    items: [
      {
        accessLevel: "admin",
        resource: "GitHub",
        userEmail: "access@example.com",
        userName: "Access User",
      },
    ],
    name: "Org boundary access review",
    provider: "github",
  });

  assert.ok(review?.id, "Access review should be inserted.");
  const detail = await getAccessReviewDetail({
    clerkOrgId: orgA,
    reviewId: review.id,
  });
  const item = detail?.items[0];

  assert.ok(item, "Access review item should be inserted.");
  assert.equal(
    await getAccessReviewDetail({ clerkOrgId: orgB, reviewId: review.id }),
    null,
  );

  await assert.rejects(
    () =>
      updateAccessReviewItemDecision({
        clerkOrgId: orgB,
        decidedBy: userB,
        decision: "revoke",
        itemId: item.id,
        reviewId: review.id,
      }),
    /Access review item not found/,
  );
  await assert.rejects(
    () =>
      completeAccessReview({
        clerkOrgId: orgB,
        reviewId: review.id,
      }),
    /Access review not found/,
  );

  const unchanged = await getAccessReviewDetail({
    clerkOrgId: orgA,
    reviewId: review.id,
  });

  assert.equal(unchanged?.review.status, "in_progress");
  assert.equal(unchanged?.items[0]?.decision, null);
}

async function assertAuditLogBoundary() {
  const db = getDb();
  const [existingAuditRow] = await db
    .select({ id: auditLogs.id })
    .from(auditLogs)
    .limit(1);

  const orgBPage = await listAuditLogPage({
    clerkOrgId: orgB,
    limit: 100,
  });

  if (!existingAuditRow) {
    assert.equal(orgBPage.rows.length, 0);
    return;
  }

  assert.equal(orgBPage.rows.some((row) => row.id === existingAuditRow.id), false);
}

async function assertConsultantClientBoundary() {
  await linkConsultantClient({
    accessLevel: "manage",
    clientOrgId: orgB,
    consultantOrgId: orgA,
    inviteEmail: "client@example.com",
  });

  const allowedDetail = await getConsultantClientDetail({
    clientOrgId: orgB,
    consultantOrgId: orgA,
  });

  assert.ok(allowedDetail, "Consultant client relationship should be visible.");
  assert.equal(
    await getConsultantClientDetail({
      clientOrgId: orgB,
      consultantOrgId: orgB,
    }),
    null,
  );
  await assert.rejects(
    () =>
      updateConsultantClientBranding({
        accentColor: "#111111",
        clientOrgId: orgB,
        consultantOrgId: orgB,
      }),
    /Consultant client relationship not found/,
  );

  const unchangedDetail = await getConsultantClientDetail({
    clientOrgId: orgB,
    consultantOrgId: orgA,
  });

  assert.equal(unchangedDetail?.relationship.whiteLabelAccentColor, null);
}

async function main() {
  await cleanup();
  await seedOrganisations();

  try {
    const control = await getSmokeControl();

    await assertControlStatusBoundary(control.key);
    await assertEvidenceBoundary(control.id);
    await assertPolicyBoundary();
    await assertVendorBoundary();
    await assertRiskBoundary();
    await assertIncidentBoundary();
    await assertAccessReviewBoundary();
    await assertAuditLogBoundary();
    await assertConsultantClientBoundary();
  } finally {
    await cleanup();
  }
}

main()
  .then(() => {
    console.log("Org-boundary smoke passed.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
