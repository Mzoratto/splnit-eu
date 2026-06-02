import { deleteBlobUrlsAudited } from "@/lib/blob/cleanup";
import type { AuditedBlobDeleteResult, BlobDeleteFn } from "@/lib/blob/cleanup";
import { getDb } from "@/lib/db";
import {
  agencies,
  agencyBranding,
  auditLogs,
  consultantClients,
  evidence,
  organisations,
  orgControlStatuses,
  policies,
  trustCenterRequests,
  trustCenters,
} from "@/lib/db/schema";
import { and, eq, or } from "drizzle-orm";

export const ORG_DELETION_COVERAGE = [
  { table: "access_review_items", mode: "cascade_via_access_reviews", status: "delete" },
  { table: "access_reviews", mode: "organisation_fk_cascade", status: "delete" },
  { table: "agencies", mode: "clerk_org_id_set_null", status: "retention_exception" },
  { table: "agency_branding", mode: "retained_via_agencies_retention_exception", status: "retention_exception" },
  { table: "agency_consultants", mode: "retained_via_agencies_retention_exception", status: "retention_exception" },
  { table: "agency_consultant_invites", mode: "retained_via_agencies_retention_exception", status: "retention_exception" },
  { table: "agency_client_invites", mode: "accepted_org_id_set_null", status: "retention_exception" },
  { table: "agency_client_orgs", mode: "organisation_fk_cascade", status: "delete" },
  { table: "audit_logs", mode: "no_fk_0016_retained", status: "retention_exception" },
  { table: "consultant_clients", mode: "organisation_fk_cascade", status: "delete" },
  { table: "control_comments", mode: "organisation_fk_cascade", status: "delete" },
  { table: "employee_training_records", mode: "organisation_fk_cascade", status: "delete" },
  { table: "evidence", mode: "organisation_fk_cascade_after_blob_collection", status: "delete" },
  { table: "feature_flags", mode: "organisation_fk_cascade", status: "delete" },
  { table: "generated_artifacts", mode: "organisation_fk_cascade", status: "delete" },
  { table: "incidents", mode: "organisation_fk_cascade", status: "delete" },
  { table: "integration_runs", mode: "integration_fk_cascade_and_org_id_denormalized", status: "delete" },
  { table: "integrations", mode: "organisation_fk_cascade", status: "delete" },
  { table: "org_control_statuses", mode: "explicit_delete_no_fk", status: "delete" },
  { table: "org_frameworks", mode: "organisation_fk_cascade", status: "delete" },
  { table: "org_intake_profiles", mode: "organisation_fk_cascade", status: "delete" },
  { table: "organisations", mode: "root_delete", status: "delete" },
  { table: "policies", mode: "organisation_fk_cascade_after_blob_collection", status: "delete" },
  { table: "profiles", mode: "organisation_fk_cascade", status: "delete" },
  { table: "regulation_update_reads", mode: "organisation_fk_cascade", status: "delete" },
  { table: "remediation_tasks", mode: "organisation_fk_cascade", status: "delete" },
  { table: "reminder_log", mode: "retention_exception_no_fk", status: "retention_exception" },
  { table: "risk_items", mode: "organisation_fk_cascade", status: "delete" },
  { table: "subscriptions", mode: "billing_retention_exception_no_fk", status: "retention_exception" },
  { table: "trust_center_requests", mode: "explicit_delete_no_fk", status: "delete" },
  { table: "trust_centers", mode: "organisation_fk_cascade_after_blob_collection", status: "delete" },
  { table: "vendor_assessments", mode: "vendor_fk_cascade_and_org_id_denormalized", status: "delete" },
  { table: "vendors", mode: "organisation_fk_cascade", status: "delete" },
] as const;

export const BLOB_URL_COVERAGE = [
  { column: "agency_branding.logo_alt_text", mode: "non_blob_metadata", collected: false },
  { column: "agency_branding.logo_url", mode: "agency_branding_join", collected: true },
  { column: "consultant_clients.white_label_logo_url", mode: "consultant_or_client_org", collected: true },
  { column: "evidence.blob_url", mode: "direct_clerk_org_id", collected: true },
  { column: "organisations.branding_logo_url", mode: "direct_clerk_org_id", collected: true },
  { column: "policies.blob_url", mode: "direct_clerk_org_id", collected: true },
  { column: "trust_centers.logo_url", mode: "direct_clerk_org_id", collected: true },
] as const;

export type OrgDeletionFailure = {
  step: string;
  error: string;
};

export type OrgDeletionResult = {
  clerkOrgId: string;
  blobCleanup: AuditedBlobDeleteResult;
  retained: { table: string; reason: string }[];
  deletedRootOrganisation: boolean;
  failures: OrgDeletionFailure[];
};

export type ErasureResult = {
  clerkOrgId: string;
  entityType: "evidence";
  entityId: string;
  deleted: boolean;
  blobCleanup: AuditedBlobDeleteResult;
  failures: OrgDeletionFailure[];
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function collectOrgBlobUrlsForDeletion(clerkOrgId: string) {
  const db = getDb();
  const [organisationRows, evidenceBlobRows, policyBlobRows, trustCenterRows, consultantClientRows, agencyRows] =
    await Promise.all([
      db
        .select({ blobUrl: organisations.brandingLogoUrl })
        .from(organisations)
        .where(eq(organisations.clerkOrgId, clerkOrgId)),
      db
        .select({ blobUrl: evidence.blobUrl })
        .from(evidence)
        .where(eq(evidence.clerkOrgId, clerkOrgId)),
      db
        .select({ blobUrl: policies.blobUrl })
        .from(policies)
        .where(eq(policies.clerkOrgId, clerkOrgId)),
      db
        .select({ blobUrl: trustCenters.logoUrl })
        .from(trustCenters)
        .where(eq(trustCenters.clerkOrgId, clerkOrgId)),
      db
        .select({ blobUrl: consultantClients.whiteLabelLogoUrl })
        .from(consultantClients)
        .where(
          or(
            eq(consultantClients.consultantOrgId, clerkOrgId),
            eq(consultantClients.clientOrgId, clerkOrgId),
          ),
        ),
      db
        .select({ id: agencies.id })
        .from(agencies)
        .where(eq(agencies.clerkOrgId, clerkOrgId)),
    ]);

  const agencyBrandingRows = agencyRows.length
    ? await Promise.all(
        agencyRows.map((agency) =>
          db
            .select({ blobUrl: agencyBranding.logoUrl })
            .from(agencyBranding)
            .where(eq(agencyBranding.agencyId, agency.id)),
        ),
      )
    : [];

  return [
    ...organisationRows.map((row) => row.blobUrl),
    ...evidenceBlobRows.map((row) => row.blobUrl),
    ...policyBlobRows.map((row) => row.blobUrl),
    ...trustCenterRows.map((row) => row.blobUrl),
    ...consultantClientRows.map((row) => row.blobUrl),
    ...agencyBrandingRows.flat().map((row) => row.blobUrl),
  ];
}

export async function deleteOrganisationForOffboarding(
  clerkOrgId: string,
  options: { deleteFn?: BlobDeleteFn } = {},
): Promise<OrgDeletionResult> {
  const db = getDb();
  const failures: OrgDeletionFailure[] = [];
  const retained = [
    {
      table: "audit_logs",
      reason:
        "retention_exception: retained on organisation deletion for legal/security/compliance basis; exact retention period before paid launch.",
    },
  ];

  let blobUrls: (string | null | undefined)[] = [];
  let blobUrlCollectionCompleted = false;
  try {
    blobUrls = await collectOrgBlobUrlsForDeletion(clerkOrgId);
    blobUrlCollectionCompleted = true;
  } catch (error) {
    failures.push({ step: "collect_blob_urls", error: errorMessage(error) });
  }

  if (!blobUrlCollectionCompleted) {
    failures.push({
      step: "delete_blocked_blob_url_collection_failed",
      error:
        "Organisation root deletion blocked because Blob URL collection failed; retry webhook/offboarding after fixing collection so Blob URLs are not lost through cascading row deletion.",
    });

    return {
      clerkOrgId,
      blobCleanup: { requested: 0, deleted: [], skipped: [], failed: [] },
      retained,
      deletedRootOrganisation: false,
      failures,
    };
  }

  const blobCleanup = await deleteBlobUrlsAudited(blobUrls, {
    deleteFn: options.deleteFn,
    requireToken: false,
  });

  for (const skipped of blobCleanup.skipped) {
    failures.push({ step: `blob_skipped:${skipped.url}`, error: skipped.reason });
  }
  for (const failed of blobCleanup.failed) {
    failures.push({ step: `blob_failed:${failed.url}`, error: failed.error });
  }

  try {
    await db.delete(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
  } catch (error) {
    failures.push({ step: "delete_org_control_statuses", error: errorMessage(error) });
  }

  try {
    await db.delete(trustCenterRequests).where(eq(trustCenterRequests.clerkOrgId, clerkOrgId));
  } catch (error) {
    failures.push({ step: "delete_trust_center_requests", error: errorMessage(error) });
  }

  let deletedRootOrganisation = false;
  try {
    await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
    deletedRootOrganisation = true;
  } catch (error) {
    failures.push({ step: "delete_organisation", error: errorMessage(error) });
  }

  // Keep this source reference so retention is auditable and never collapsed into a delete failure.
  void auditLogs;

  return {
    clerkOrgId,
    blobCleanup,
    retained,
    deletedRootOrganisation,
    failures,
  };
}

export async function eraseEvidenceForOrg(
  input: {
    clerkOrgId: string;
    evidenceId: string;
    actorUserId?: string | null;
    reason?: string | null;
  },
  options: { deleteFn?: BlobDeleteFn } = {},
): Promise<ErasureResult> {
  const db = getDb();
  const failures: OrgDeletionFailure[] = [];
  const rows = await db
    .select({ blobUrl: evidence.blobUrl })
    .from(evidence)
    .where(and(eq(evidence.clerkOrgId, input.clerkOrgId), eq(evidence.id, input.evidenceId)))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return {
      clerkOrgId: input.clerkOrgId,
      entityType: "evidence",
      entityId: input.evidenceId,
      deleted: false,
      blobCleanup: { requested: 0, deleted: [], skipped: [], failed: [] },
      failures,
    };
  }

  const blobCleanup = await deleteBlobUrlsAudited([row.blobUrl], {
    deleteFn: options.deleteFn,
    requireToken: false,
  });

  for (const skipped of blobCleanup.skipped) {
    failures.push({ step: `blob_skipped:${skipped.url}`, error: skipped.reason });
  }
  for (const failed of blobCleanup.failed) {
    failures.push({ step: `blob_failed:${failed.url}`, error: failed.error });
  }

  if (blobCleanup.skipped.length > 0 || blobCleanup.failed.length > 0) {
    failures.push({
      step: "blob_cleanup_failed",
      error:
        "Evidence row deletion blocked because Blob cleanup did not complete; retry erasure after fixing Blob deletion so the Blob URL remains durable in the evidence row.",
    });

    return {
      clerkOrgId: input.clerkOrgId,
      entityType: "evidence",
      entityId: input.evidenceId,
      deleted: false,
      blobCleanup,
      failures,
    };
  }

  try {
    await db.insert(auditLogs).values({
      clerkOrgId: input.clerkOrgId,
      clerkUserId: input.actorUserId ?? null,
      action: "evidence.erased",
      entityType: "evidence",
      entityId: input.evidenceId,
      metadata: {
        reason: input.reason ?? "right_to_erasure",
        blobCleanup: {
          requested: blobCleanup.requested,
          deleted: blobCleanup.deleted.length,
          skipped: blobCleanup.skipped.length,
          failed: blobCleanup.failed.length,
        },
      },
    });
  } catch (error) {
    failures.push({ step: "audit_log_failed", error: errorMessage(error) });

    return {
      clerkOrgId: input.clerkOrgId,
      entityType: "evidence",
      entityId: input.evidenceId,
      deleted: false,
      blobCleanup,
      failures,
    };
  }

  await db
    .delete(evidence)
    .where(and(eq(evidence.clerkOrgId, input.clerkOrgId), eq(evidence.id, input.evidenceId)));

  return {
    clerkOrgId: input.clerkOrgId,
    entityType: "evidence",
    entityId: input.evidenceId,
    deleted: true,
    blobCleanup,
    failures,
  };
}
