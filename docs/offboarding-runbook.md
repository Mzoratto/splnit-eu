# Customer Export and Offboarding Runbook

Last updated: 2026-05-01

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
- Clerk, Vercel, Neon, Inngest, Resend, Loops, Sentry, Upstash, PostHog, Anthropic, and backup/log retention outside the application database;
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
| Audit-log SOP | `docs/audit-log-export-sop.md` | Procedure | Use for large customers or any export where the first CSV page returns `X-Audit-Log-Truncated: true`. |
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
6. Confirm `deleteOrganisationFromClerk()` deleted known Vercel Blob objects for evidence, generated policies, and generated gap reports before deleting the organisation row.
7. Confirm organisation-scoped database rows were removed by cascade or explicit cleanup.
8. Record residual vendor retention items that remain outside app control.

Do not run ad hoc production SQL deletes unless the Clerk/webhook path is unavailable and the incident owner approves a documented fallback.

## Post-Deletion Checks

Check the following after deletion:

- the organisation no longer exists in the app database;
- `profiles` rows for that `clerk_org_id` are gone;
- `org_control_statuses` and `trust_center_requests` rows for that `clerk_org_id` are gone;
- evidence and policy Blob URLs collected before deletion no longer resolve through Vercel Blob;
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
- Anthropic: confirm prompt/data retention settings and opt-in treatment.

## Launch Follow-Ups

- Load-test `/api/exports/workspace/archive` with representative Blob volume before large customers are onboarded.
- Add an internal offboarding checklist in the support system once the final vendor stack is confirmed.
