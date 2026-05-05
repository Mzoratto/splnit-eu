# Data Processing Map

Last updated: 2026-05-01

Status: engineering draft for counsel review. This is a working record of processing activities, not a final Article 30 record.

## Purpose

This map gives counsel a concrete view of Splnit.eu processing operations, roles, data categories, recipients, retention criteria, and open launch decisions.

Regulatory anchor:

- EDPB record of processing FAQ lists purpose, data categories, recipients, transfers, storage period, and security measures as core record fields: https://www.edpb.europa.eu/sme-data-protection-guide/faq-frequently-asked-questions/answer/do-i-need-record-processing_en

## Processing Operations

| Operation | Role | Purposes | Data subjects and categories | Recipients/systems | Retention criteria | Open decisions |
| --- | --- | --- | --- | --- | --- | --- |
| Public website and cookie preferences | Controller | Site delivery, language/cookie preference, optional analytics. | Visitors: IP/device/request metadata, cookie choice, analytics events after consent. | Vercel, Vercel Analytics/Speed Insights, PostHog if enabled. | Cookie choice currently 180 days; analytics per vendor setting. | Confirm analytics vendors enabled in production and cookie-consent lifetime. |
| Account, auth, and organisation setup | Controller for account/admin operation; processor where customer manages workspace users for its own purposes. | Account access, organisation workspace, role/membership sync, security. | Customer admins/users: name, email, organisation ID, role, locale, session/auth metadata. | Clerk, Neon, Vercel. | Contract term plus export/offboarding and legal periods. | Confirm legal role split and DPO/contact wording. |
| Compliance workspace | Usually processor for customer-entered compliance records; controller for Splnit operational metadata where needed. | Framework tracking, control status, evidence tracking, policies, vendors, risks, incidents, Trust Center. | Customer employees/admins, vendors, contacts, incident subjects, audited users; compliance records and documents. | Neon, Vercel, Vercel Blob if enabled, Resend for notifications. | Customer-controlled during contract; delete/return after termination unless legal basis for retention. | Confirm special-category data controls and deletion/export period. |
| Uploaded evidence and generated documents | Processor for customer content. | Store evidence, generate policies, gap reports, certification packages. | People appearing in documents or metadata; uploaded files and generated PDFs. | Vercel Blob, Neon, Vercel. | Customer-controlled; delete/return after service end or legal hold. | Add granular per-record deletion if needed before workspace termination. |
| Automated integration checks | Processor on customer instructions. | Read connected-system security posture and produce compliance test results. | Customer tenant users/admins, repository/cloud account metadata, access/security configuration. | Microsoft Graph, GitHub API, AWS APIs, Neon, Inngest, Upstash locks if enabled. | Tokens until disconnect/account deletion; results according to workspace retention. | Confirm OAuth/App/IAM scopes, customer instructions, and whether snapshots survive disconnect. |
| Billing and subscription management | Controller for billing/admin records; Stripe may have independent controller obligations for payments. | Plan management, Checkout, invoices, customer portal, payment disputes. | Customer billing contacts and admins; billing metadata, customer IDs, invoices/payment metadata. | Stripe, Neon, Clerk. | Statutory accounting/tax/dispute period. | Accountant/counsel to define exact legal period and liability/payment wording. |
| Transactional email | Controller or processor depending on notification context. | Evidence expiry, policy review, access review, Trust Center, vendor/regulation notifications. | Customer users, invitees, vendor contacts; email address, message content, delivery metadata. | Resend, Neon. | As long as needed for delivery logs, audit, and customer workspace. | Confirm email log retention and suppression handling. |
| Marketing and regulation digest | Controller. | Newsletter, lead communication, regulation digest campaigns. | Prospects/customers: email, subscription/list metadata, communication preferences. | Loops, Vercel, Neon where applicable. | Until unsubscribe/withdrawal, stale cleanup, or suppression/legal need. | Confirm consent basis, stale-lead cleanup, and unsubscribe evidence retention. |
| Questionnaire AI | Processor for customer-provided questionnaire context; controller for service operation logs where applicable. | Draft answers grounded in customer controls, policies, evidence references, and reviewed legal citations. | Customer organisation context, policies, evidence references, reviewed citation IDs, questionnaire contact data if included. | Configured AI provider (`QUESTIONNAIRE_AI_PROVIDER`; Anthropic only today), Neon, Vercel. | Generated answers are stored as generated artifacts; vendor prompt retention per provider terms/settings. | Confirm Anthropic data terms, opt-in wording, and whether sensitive evidence can be sent before enabling AI for customers. |
| Security, audit, and observability | Controller for Splnit security operation; may include processor records for customer activity. | Abuse prevention, error diagnosis, audit history, incident investigation. | Users/admins/visitors; audit actions, IDs, timestamps, request/error metadata. | Neon, Vercel logs, Sentry if enabled, Upstash if enabled. | Security/audit period to be defined; minimise after investigation/legal need. | Set exact app audit-log, runtime-log, Sentry, and Redis retention. |
| Backups and disaster recovery | Same role as the backed-up data. | Restore service after outage or corruption. | Same as production data. | Neon PITR, possible S3/export storage. | Recovery window to be defined; purge after backup expiry. | Confirm backup region, encryption, access control, restore tests, and deletion timing. |
| Support and legal requests | Controller unless acting on customer instructions for workspace data. | Customer support, data subject requests, DPA/subprocessor notices, legal claims. | Customers, users, requesters; contact details, issue content, request history. | Email provider, internal tools, legal/accounting providers. | As needed for request handling, claims, and legal obligations. | Confirm support tooling and legal-provider list before launch. |

## Security Measures Currently Reflected in the App

- Organisation-scoped data model.
- Clerk-based auth for protected routes in production.
- Encrypted integration tokens via `ENCRYPTION_KEY`.
- Provider allow-list for cron-triggered integration runs.
- Audit logs for key compliance actions.
- Optional Redis locks for integration runs and rate limiting.
- Cookie-gated optional analytics.
- Private Blob access for evidence, generated policies, and gap reports, with authenticated downloads through app routes.
- Blob cleanup during organisation deletion and failed post-upload database saves.
- Authenticated workspace JSON/ZIP export and evidence metadata CSV that redact encrypted integration tokens and direct Blob URLs.
- Readiness endpoint to detect missing production env groups.

## Launch Decisions to Close

- Final legal entity details and DPO status.
- Final controller/processor role matrix by operation.
- Exact subprocessor list, locations, transfer mechanisms, and vendor DPA links.
- Exact retention schedule and deletion/export process, using `docs/offboarding-runbook.md` as the current operational draft.
- Production analytics decision: Vercel analytics only, PostHog, both, or neither.
- Customer-facing DPA wording for audit, deletion/return, subprocessor changes, incident notification, and liability/SLA/payment terms.
