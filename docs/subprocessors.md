# Subprocessor Register

Last updated: 2026-05-01

Status: engineering draft for counsel review. This is not a signed DPA annex until each legal status item is closed.

## Purpose

This register turns the open legal-review item "exact subprocessors, processing locations, transfer mechanisms, and links to vendor DPAs" into a concrete launch checklist.

Sources checked in the repo:

- `.env.example`
- `lib/readiness.ts`
- `package.json`
- `app/(marketing)/soukromi/page.tsx`
- `app/(marketing)/dpa/page.tsx`
- `components/cookie-consent.tsx`
- `components/marketing/pricing-cta.tsx`

Regulatory anchors:

- EDPB transparency guidance: https://www.edpb.europa.eu/sme-data-protection-guide/faq-frequently-asked-questions/answer/what-information-should-i_en
- EDPB controller-processor contract FAQ: https://www.edpb.europa.eu/sme-data-protection-guide/faq-frequently-asked-questions/answer/what-should-be-included-controller_en
- EDPB record of processing FAQ: https://www.edpb.europa.eu/sme-data-protection-guide/faq-frequently-asked-questions/answer/do-i-need-record-processing_en

## Approval Rule

A vendor is launch-approved only when the business owner or counsel has attached:

- final vendor legal entity and contracting party;
- DPA or equivalent data-processing terms;
- security terms or security documentation;
- production processing region and backup/log region;
- transfer mechanism for any processing outside the EU/EEA;
- whether the vendor is required, optional, disabled, or customer-selected;
- internal owner for renewals and subprocessor-change notices.

## Product Subprocessors

| Vendor | Product use | Current app status | Likely data categories | Legal status before launch |
| --- | --- | --- | --- | --- |
| Vercel | Hosting, serverless runtime, CDN/edge delivery, deployment logs, optional Web Analytics and Speed Insights, optional private Vercel Blob storage. | Required for hosting; Blob and analytics are environment-dependent. | Request metadata, IP/device metadata, app logs, aggregate analytics after consent, uploaded/generated files if Blob is enabled. | Confirm Vercel DPA, project regions, edge/log handling, Blob region, analytics retention, and transfer mechanism. |
| Neon | Serverless Postgres database. | Required through `DATABASE_URL`. | Most application records: organisations, profiles, controls, evidence metadata, policies, vendors, incidents, risks, audit logs, access reviews, trust center data. | Confirm Neon DPA, production branch region, PITR/backups region, export process, and transfer mechanism. |
| Clerk | Authentication, organisations, sessions, webhook sync. | Required for production auth. | User identity, email, names, organisation IDs, role/membership data, auth/session metadata. | Confirm Clerk DPA, processing locations, session/log retention, deletion behavior, and transfer mechanism. |
| Stripe | Paid billing, Checkout, customer portal, webhooks. | Required for paid plans/readiness. | Customer and billing metadata, subscription status, Stripe customer IDs, invoice/payment metadata. Splnit should not store raw card data. | Confirm Stripe DPA, controller/processor role split for payment processing, tax/invoice retention, and transfer mechanism. |
| Inngest | Background job delivery for scheduled tests, evidence reminders, policy reminders, regulation sync. | Required through `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`. | Job metadata, organisation IDs, provider names, event payloads needed to run background tasks. | Confirm DPA, event payload limits, processing locations, event retention, and transfer mechanism. |
| Vercel Blob | Private file/object storage for uploaded evidence and generated policy/gap-report PDFs. | Recommended; enabled by `BLOB_READ_WRITE_TOKEN`. | Uploaded evidence files, generated policies, generated reports, file URLs/metadata. | Confirm DPA coverage through Vercel, object region, private access settings, deletion API behavior, and backup/replication retention. |
| Resend | Transactional email for reminders and notifications. | Recommended; enabled by `RESEND_API_KEY` and `RESEND_FROM`. | Recipient emails, message content, delivery metadata. | Confirm DPA, sending region, event/log retention, suppression handling, and transfer mechanism. |
| Loops | Newsletter, marketing list, regulation digest transactional templates. | Recommended for marketing; enabled by `LOOPS_API_KEY`. | Subscriber email, list membership, email preferences, digest delivery metadata. | Confirm DPA, consent/unsubscribe process, processing locations, and transfer mechanism. |
| Upstash Redis | Integration run locks and questionnaire rate limiting. | Recommended; enabled by Upstash REST URL/token. | Lock keys, rate-limit keys, request or organisation identifiers depending on feature. | Confirm DPA, database region, key TTLs, and transfer mechanism. |
| Sentry | Error monitoring and source-map support. | Recommended; enabled by Sentry DSNs/tokens. | Error traces, stack traces, browser/runtime metadata, potentially request metadata if captured. | Confirm DPA, PII scrubbing, region, retention, source-map access, and transfer mechanism. |
| PostHog | Product analytics and pricing CTA feature flag. | Optional; enabled by `NEXT_PUBLIC_POSTHOG_KEY` and now gated by optional analytics consent. | Visitor identifier, feature flag evaluation, pricing CTA interaction context. Autocapture and pageview capture are disabled in current code. | Confirm whether production uses PostHog, EU host, DPA, retention, consent basis, and transfer mechanism. |
| Anthropic | Questionnaire answer drafting from customer compliance context. | Recommended for questionnaire AI; enabled by `ANTHROPIC_API_KEY`. | Security questionnaire prompts, organisation context, controls, policies, evidence references, generated answers. | Confirm DPA/data terms, model/data retention controls, region/transfer mechanism, and whether customer approval is required before use. |

## Customer-Selected Connected Systems

These systems are connected by the customer to run compliance checks. They should be documented in the DPA/data-processing map, but counsel must confirm whether each is treated as a customer system, an independent third party, or a Splnit subprocessor for a specific workflow.

| System | App use | Data passing through Splnit | Launch status |
| --- | --- | --- | --- |
| Microsoft 365 / Microsoft Graph | MFA, Conditional Access, privileged roles, guests, training, sensitivity-label checks. | OAuth tokens encrypted in Splnit, tenant/user/security metadata, test results. | Implemented; confirm Microsoft app permissions, data minimisation, and customer instructions. |
| GitHub | Organisation 2FA, branch protection, secret scanning, dependency alerts, code scanning checks. | GitHub App installation ID, repository metadata, security-check results. | Implemented; confirm GitHub App permissions and customer instructions. |
| AWS | SecurityAudit role checks for CloudTrail, S3 encryption, IAM MFA, root MFA, VPC Flow Logs. | AWS account ID/role config, cloud security metadata, test results. | Implemented; confirm role permissions and customer instructions. |
| Google Workspace | Planned future integration. | No production OAuth processing in this release. | Planned; do not include as active processing until implemented and reviewed. |

## Planned Or Dashboard-Only Vendors

These are mentioned in launch operations but are not fully represented by runtime code/env checks yet.

| Vendor | Intended use | Required decision |
| --- | --- | --- |
| Cloudflare | DNS/WAF/rate limiting for production domain. | Confirm whether request metadata/IPs are processed and whether Cloudflare appears in public legal pages. |
| BetterStack | Uptime checks and status page. | Confirm monitored URLs, incident subscriber data, DPA, and whether status subscribers are collected. |
| AWS S3 or equivalent backup bucket | Database exports/snapshots if configured outside Neon. | Confirm exact account, region, retention, encryption, and DPA/transfer basis. |

## Launch Blockers

- Replace every open production fact in this file with a verified value or a deliberate "not used in production" decision.
- Store vendor DPA/security links in the legal evidence folder or vendor register before launch.
- If a vendor is disabled in production, confirm whether it should remain in `/soukromi`, `/cookies`, and `/dpa` as "if enabled" language or be removed.
- Confirm whether customer-uploaded evidence may include special categories of personal data and whether extra restrictions are needed.
