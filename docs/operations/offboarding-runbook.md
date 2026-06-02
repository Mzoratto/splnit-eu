# Customer Export and Offboarding Runbook

Last updated: 2026-06-02

Status: engineering runbook for counsel and business-owner review. This is not a final contractual deletion procedure until counsel confirms the DPA and retention schedule.

## Purpose

This runbook describes how Splnit.eu can return or delete customer workspace data at termination. It supports the DPA requirement that customer data is returned or deleted after service end, subject to legal retention and documented instructions.

Regulatory anchor:

- EDPB controller-processor contract FAQ: https://www.edpb.europa.eu/sme-data-protection-guide/faq-frequently-asked-questions/answer/what-should-be-included-controller_en
- EDPB transparency guidance: https://www.edpb.europa.eu/sme-data-protection-guide/faq-frequently-asked-questions/answer/what-information-should-i_en

## Scope

Covered:

- customer workspace records in Neon;
- uploaded evidence and generated PDFs in Vercel Blob;
- generated policy, risk, vendor, access-review, audit-log, and ISO package exports;
- connected integration tokens and configuration;
- Clerk organisation and membership records synced into the application database.

Not covered without a separate vendor-dashboard step:

- Stripe invoices, payments, disputes, and statutory billing records;
- Clerk, Vercel, Neon, Inngest, Resend, Loops, Sentry, Upstash, PostHog, OpenAI, and backup/log retention outside the application database;
- legal hold, disputes, security investigations, or accounting retention.

## Intake

1. Create an internal ticket for the customer request.
2. Confirm requester authority against the Clerk organisation owner/admin list or signed customer contact.
3. Record the requested action: export only, delete only, export then delete, or legal-hold review.
4. Confirm target date, export delivery channel, and whether any data must be excluded.
5. Confirm with counsel/accounting whether billing, tax, dispute, security, or legal-hold records must be retained.

## Export Package

Before deletion, collect the exports that apply to the customer workspace:

| Data | Route or source | Format | Notes |
| --- | --- | --- | --- |
| Full workspace export | `/api/exports/workspace` | JSON | Authenticated and scoped to active Clerk organisation. Excludes encrypted integration tokens and direct Blob URLs; includes authenticated download paths for private files. |
| Workspace archive | `/api/exports/workspace/archive` | ZIP | Authenticated and scoped to active Clerk organisation. Bundles `workspace-export.json`, `evidence-metadata.csv`, private evidence files, generated policy/gap-report PDFs, and `export-manifest.json` with included or missing file records. |
| Audit log | `/api/audit-log/export` | CSV | Authenticated and scoped to active Clerk organisation. Supports `action`, `entityType`, UTC `from`/`to`, `limit` up to 5000, and cursor pagination through the `X-Audit-Log-Next-Cursor` response header. |
| Audit-log SOP | `docs/operations/audit-log-export-sop.md` | Procedure | Use for large customers or any export where the first CSV page returns `X-Audit-Log-Truncated: true`. |
| Access reviews | `/api/access-reviews/[reviewId]/export` | CSV | Export each access review that must be returned. |
| ISO 27001 package | `/api/frameworks/iso27001/certification-package` | ZIP | Includes Statement of Applicability, policies metadata, evidence metadata, and passing controls. |
| Risk register | `/api/risks/register-report` | PDF | Authenticated and scoped to active Clerk organisation. |
| Vendor supply-chain report | `/api/vendors/supply-chain-report` | PDF | Authenticated and scoped to active Clerk organisation. |
| Generated policies and gap reports | `/api/policies/[policyId]/download` | PDF | Authenticated and scoped to active Clerk organisation. |
| Evidence files | `/api/evidence/[evidenceId]/download` | Original Blob content type | Authenticated and scoped to active Clerk organisation. |
| Evidence metadata | `/api/exports/evidence-metadata` | CSV | Authenticated and scoped to active Clerk organisation. Spreadsheet-native inventory without direct Blob URLs. |
| Questionnaire answers | `/api/questionnaires/export/pdf` and `/api/questionnaires/export/xlsx` | PDF/XLSX | Export is payload-based from the current questionnaire result, not a workspace-wide stored archive. |

Current export follow-ups:

- Workspace archive generation is implemented; load-test it against the largest expected customer workspaces before enterprise rollout.
- Vendor-dashboard records, provider logs, backups, and billing records still require the residual vendor tasks below.

## Deletion Sequence

Use this order for a normal export-then-delete request:

1. Complete the export package and record checksums or filenames in the ticket.
2. Confirm customer receipt or approved delivery according to the support process.
3. Disconnect customer integrations where possible from the application UI or admin process.
4. Trigger Clerk organisation deletion only after export and legal-hold checks are complete.
5. Verify the Clerk webhook processed `organization.deleted`.
6. Confirm `deleteOrganisationFromClerk()` ran `deleteOrganisationForOffboarding()` and attempted idempotent cleanup for known Vercel Blob objects: evidence files, generated policies/gap reports, workspace branding logo, Trust Center logo, consultant/client white-label logo, and agency branding logo where present.
7. Confirm organisation-scoped database rows were removed by cascade or explicit cleanup.
8. Audit logs are retained after organisation deletion as a documented legal/security/compliance retention exception. Do not treat retained `audit_logs` rows as deletion failures; export them before deletion when the customer request includes audit history. The exact retention period must be set before paid launch.
9. Record residual vendor retention items that remain outside app control.

Do not run ad hoc production SQL deletes unless the Clerk/webhook path is unavailable and the incident owner approves a documented fallback.

## Granular right-to-erasure handling

- For a request that targets a single uploaded evidence record before full workspace termination, use the org-scoped `eraseEvidenceForOrg()` service path from an approved admin/support process. It selects the record by both `clerk_org_id` and `evidence_id`, attempts audited Blob cleanup for the associated file URL, deletes the evidence row, and writes a retained `audit_logs` entry with action `evidence.erased`.
- Treat retained audit logs as the legal/security/compliance exception, not as customer workspace content that cascades with the evidence row.
- Wider per-record erasure for generated policies, vendor submissions, incidents, and access-review rows still needs product/legal design before customer-facing launch.

## Webhook failure and retry behavior

- Clerk retries failed webhooks according to Clerk delivery behavior; use the Clerk webhook delivery log as the source of truth for whether `organization.deleted` was delivered and retried.
- `deleteOrganisationFromClerk()` now separates cleanup outcomes: retained data exceptions, Blob cleanup failures/skips, explicit DB cleanup failures, and root organisation deletion failure.
- Blob cleanup is idempotent and URL-deduplicated. Missing Blob objects or repeated deletion attempts should not require ad hoc SQL. If Blob deletion fails or is skipped, the handler logs a warning with the failed URLs and continues to delete the app organisation row when database deletion is otherwise possible.
- The webhook should return failure only when the root app organisation row cannot be deleted. In that case, allow Clerk retry or manually replay the webhook in a non-destructive, ticketed incident process.
- If Blob cleanup failures remain after the organisation row is deleted, record the warning payload in the offboarding ticket and perform a separately approved Blob cleanup using only the collected URLs. Do not list or delete production Blob objects by prefix without explicit approval.
- If the webhook cannot be replayed, run only the approved offboarding service or documented fallback from an incident ticket. Do not invent table-specific production deletes during support handling.

## Post-Deletion Checks

Check the following after deletion:

- the organisation no longer exists in the app database;
- `profiles` rows for that `clerk_org_id` are gone;
- `org_control_statuses` and `trust_center_requests` rows for that `clerk_org_id` are gone;
- audit logs for that `clerk_org_id` may still exist and are retained under the documented exception;
- evidence, policy/report, and branding Blob URLs collected before deletion no longer resolve through Vercel Blob, or any remaining cleanup failures are recorded with URL and error details in the ticket;
- protected app routes no longer expose the deleted workspace;
- residual vendor-dashboard tasks are tracked in the offboarding ticket.

## Residual Vendor Tasks

These require dashboard or vendor-side confirmation:

- Stripe: retain or remove customer records according to accounting, tax, dispute, and Stripe requirements.
- Clerk: confirm organisation/user retention and session/log handling.
- Neon: confirm PITR and backup purge windows.
- Vercel: confirm deployment/runtime log retention and Blob deletion behavior.
- Inngest: confirm event retention for deleted organisation payloads.
- Resend and Loops: confirm email delivery logs, subscriber records, suppressions, and unsubscribe records.
- Sentry: confirm issue/event retention and PII scrubbing.
- Upstash: confirm Redis key TTLs and region retention.
- PostHog: confirm analytics retention or disable production use.
- OpenAI: confirm prompt/data retention, training/use-of-inputs settings, subprocessors/transfer mechanism, and customer opt-in/human-review treatment.

## Launch Follow-Ups

- Load-test `/api/exports/workspace/archive` with representative Blob volume before large customers are onboarded.
- Add an internal offboarding checklist in the support system once the final vendor stack is confirmed.
