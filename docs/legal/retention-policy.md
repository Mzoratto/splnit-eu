# Retention Policy Draft

Last updated: 2026-05-01

Status: engineering draft for counsel and business-owner review. This file proposes operational retention rules; it is not a final legal schedule.

## Purpose

This schedule closes the open legal-review item "final retention schedule for account data, logs, evidence, policies, uploaded files, billing data, and backups" enough for counsel to review concrete facts.

Regulatory anchors:

- EDPB transparency guidance says privacy information should include the retention period or criteria used to determine it: https://www.edpb.europa.eu/sme-data-protection-guide/faq-frequently-asked-questions/answer/what-information-should-i_en
- EDPB controller-processor contract FAQ includes deletion or return of personal data after the service ends: https://www.edpb.europa.eu/sme-data-protection-guide/faq-frequently-asked-questions/answer/what-should-be-included-controller_en

## Current Enforcement in Code

- Clerk `organization.deleted` calls `deleteOrganisationFromClerk()` and deletes the `organisations` row.
- Most organisation-scoped tables use database cascades from `organisations.clerk_org_id`.
- `org_control_statuses` and `trust_center_requests` are explicitly deleted because they store `clerk_org_id` without a cascade foreign key.
- `profiles` are deleted on Clerk membership/user deletion.
- Integration disconnect deletes the `integrations` row and resets related control statuses.
- `evidence.expires_at` and `policies.expires_at` currently drive reminders/review UX, not automatic hard deletion.
- Vercel Blob object URLs are stored for evidence and generated policy/report files. Organisation deletion now deletes known Blob objects before deleting the organisation record; failed database saves after upload try to delete the just-uploaded object.
- Backup/PITR retention is not defined in code and must be configured in vendor dashboards.

## Proposed Schedule

| Data set | Examples | Proposed retention | Current enforcement | Decision needed before launch |
| --- | --- | --- | --- | --- |
| Website cookie preference | `cc-cookie-consent` browser cookie. | 180 days, then ask again. | Implemented in `lib/privacy/cookie-consent.ts`. | Counsel to confirm 180-day consent lifetime for Czech/EU audience. |
| Optional analytics | Vercel Web Analytics, Speed Insights, PostHog feature flag. | Keep only according to vendor analytics retention and only after consent or another confirmed legal basis. | Vercel analytics and PostHog are gated by accepted optional cookie consent. | Confirm whether PostHog is enabled in production and document vendor retention. |
| Marketing/newsletter leads | Newsletter email, list membership, unsubscribe/suppression metadata. | Until unsubscribe, withdrawal, stale-lead cleanup, or legal need for suppression records. | Loops integration is environment-dependent. | Counsel/business owner to set stale-lead cleanup interval and suppression retention. |
| Customer account and organisation profile | Organisation name, company ID, sector, employee count, plan, user profile, roles. | Contract term plus export/offboarding window, then delete unless legal retention applies. | `/api/exports/workspace` returns organisation-scoped app data; `/api/exports/workspace/archive` bundles JSON, evidence metadata, and Blob-backed files; Clerk org/user webhooks delete core DB rows; confirm backups separately. | Confirm export/offboarding window and backup purge window. |
| Billing records | Stripe customer/subscription IDs, plan state, invoices/payment metadata in Stripe. | Keep for statutory accounting, tax, chargeback, and dispute periods. | Stripe stores billing records; Splnit stores Stripe IDs and plan metadata. | Counsel/accountant to define exact Czech accounting/tax period and customer-facing wording. |
| Compliance workspace data | Framework enrolment, control statuses, vendor assessments, risks, incidents, access reviews, Trust Center settings. | Contract term plus export/offboarding window, then delete unless legal hold or customer instruction says otherwise. | Mostly cascade-deleted with organisation deletion. | Confirm whether customer can choose longer in-product retention by plan. |
| Evidence and uploaded files | Evidence metadata, uploaded documents, generated PDFs, gap reports, policy documents. | Customer-controlled during contract; delete or return after service end unless legal hold applies. | Org deletion deletes known Blob objects before DB deletion; failed DB saves after upload try to delete the just-uploaded object. | Add per-record delete/export workflows if customers need granular deletion before workspace termination. |
| Audit logs and security events | `audit_logs`, integration runs, application/security logs, Sentry events. | Long enough for incident investigation and compliance proof, short enough for minimisation. | DB audit logs cascade on organisation deletion; Sentry/vendor logs depend on dashboard settings. | Counsel/security owner to set exact periods for app audit logs, runtime logs, and Sentry. |
| Integration tokens and connected-system metadata | Microsoft refresh tokens, GitHub installation ID, AWS role/config, test results. | Tokens until disconnect or account deletion; test results according to compliance workspace retention. | Tokens are deleted when integration row is deleted; tokens are encrypted at rest. | Confirm disconnect semantics and whether evidence snapshots survive integration disconnect. |
| Questionnaire AI prompts/outputs | Pasted/uploaded questionnaire questions, organisation name/plan, control summaries, evidence summaries/metadata, policy metadata, reviewed citation metadata sent to OpenAI when enabled; generated draft answers stored in Splnit. Raw uploaded evidence files, secrets, credentials, and special-category personal data should not be sent. | Keep generated answers as customer workspace data until customer deletion/export/offboarding; provider prompt/log retention depends on OpenAI account terms/settings and must be confirmed before broad customer use. | App stores outputs as generated artifacts; provider calls require `QUESTIONNAIRE_AI_ENABLED=true` and `OPENAI_API_KEY`. Provider code supports OpenAI only. Answers default to draft and UI copy blocks PDF/XLSX export until all answers are approved. | Confirm OpenAI DPA/data-retention controls, training/use-of-inputs setting, support/log retention, transfer mechanism, and customer opt-in/review wording. |
| Trust Center access requests | Requester email, company, NDA status, expiry. | Until request expires plus security/audit review window. | Request expiry exists; table lacks an organisation foreign-key cascade in schema. | Add explicit cleanup or FK migration before production Trust Center access requests. |
| Backups and disaster recovery | Neon PITR, exports/snapshots, possible S3 backup bucket. | Short operational recovery window plus legally required backups only where needed. | Dashboard/vendor configuration, not enforced in repo. | Define PITR/export retention, encryption, region, restore-test cadence, and purge process. |
| Legal hold and disputes | Records needed for claims, abuse, investigations, or unpaid invoices. | Hold while legally necessary, then delete or minimise. | No dedicated legal-hold feature. | Counsel to decide whether manual legal-hold process is enough for launch. |

## Engineering Follow-Ups

- Add regression coverage for organisation deletion cleanup or replace explicit cleanup with cascade foreign keys in a future schema migration.
- Add per-record Blob deletion if evidence, policy, or generated-report delete buttons are introduced.
- Define dashboard retention for Vercel logs, Neon PITR, Sentry events, PostHog events, Resend logs, Loops subscribers, Inngest events, and Upstash Redis keys.
- Decide whether `expires_at` means "review again" or "delete after this date" for each record type; the current product uses it as review/expiry metadata.
- Use `docs/operations/offboarding-runbook.md` as the manual export/offboarding runbook and load-test the workspace archive route before large customer workspaces rely on it.

## Counsel Questions

- Is Splnit acting as processor for all customer workspace data, or controller for specific compliance/security logs?
- What exact statutory periods apply to invoices, tax records, payment disputes, and accounting records for the final legal entity?
- Are special categories of personal data likely in uploaded compliance evidence, HR/training records, incidents, or vendor questionnaires?
- What customer notification period is required before permanent deletion after termination?
