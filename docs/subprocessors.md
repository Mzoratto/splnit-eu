# Subprocessor Register

Last updated: 2026-05-14

Status: engineering closeout register for business-owner and counsel review. This is not a signed DPA annex until each vendor status is moved to `approved` and final production facts are verified.

## Purpose

This register turns the open legal-review item "exact subprocessors, processing locations, transfer mechanisms, and links to vendor DPAs" into a concrete launch checklist.

This file is the internal factual source for counsel. Do not copy the full matrix into public legal pages. Public legal pages should use a shorter customer-readable list after counsel/business-owner approval.

Sources checked in the repo:

- `.env.example`
- `lib/readiness.ts`
- `package.json`
- `lib/legal/legal-page-copy.ts`
- `docs/data-processing-map.md`
- `docs/retention-policy.md`
- `docs/questionnaire-flow-audit.md`
- integration code under `lib/integrations/`
- email, billing, Redis, Blob, Sentry, and questionnaire provider clients
- Vercel Production env metadata and redacted env presence checks on 2026-05-14
- live `https://splnit.eu/api/readiness` status on 2026-05-14
- `vercel inspect https://splnit.eu` production deployment output on 2026-05-14
- `vercel blob list-stores` / `vercel blob get-store` output on 2026-05-14

Regulatory anchors:

- EDPB transparency guidance: https://www.edpb.europa.eu/sme-data-protection-guide/faq-frequently-asked-questions/answer/what-information-should-i_en
- EDPB controller-processor contract FAQ: https://www.edpb.europa.eu/sme-data-protection-guide/faq-frequently-asked-questions/answer/what-should-be-included-controller_en
- EDPB record of processing FAQ: https://www.edpb.europa.eu/sme-data-protection-guide/faq-frequently-asked-questions/answer/do-i-need-record-processing_en

## Approval Rule

A vendor is launch-approved only when the business owner or counsel has attached or accepted:

- final vendor legal entity and contracting party;
- DPA or equivalent data-processing terms;
- security terms or security documentation;
- production processing/storage region and backup/log/support-access region;
- transfer mechanism for any processing outside the EU/EEA;
- whether the vendor is required, optional, disabled, or customer-selected;
- retention or log-retention information for production data;
- internal owner for renewals and subprocessor-change notices.

Use these statuses:

- `approved` - business owner/counsel has accepted the vendor facts for launch.
- `owner check` - factual/product decision needed before counsel can finalize.
- `counsel check` - facts are known enough for legal review, but legal position is not approved.
- `optional/off by default` - do not list as always-on public processing unless production enables it.
- `customer-connected` - customer chooses/connects this system; counsel must confirm role classification.
- `not production` - do not include as active production processing.

## Closeout Summary

| Category | Vendor/system | Launch classification | Current status | Next closeout action |
| --- | --- | --- | --- | --- |
| Core platform | Vercel | Required production subprocessor | counsel check | Production deployment is Ready; observed Node/serverless functions are in `iad1`. No custom function region is configured in repo. Vercel Web Analytics/Speed Insights code is consent-gated, but no Vercel analytics/speed request was observed after accepting cookies in a live browser check; confirm dashboard setting before public analytics wording. Attach Vercel DPA/security/log-retention evidence. |
| Core platform | Neon | Required production subprocessor | counsel check | Production database host is Neon and reports `eu-central-1` with pooler host metadata. Neon API confirms project access, production branch `production` (`br-flat-cake-al58sdkr`) is primary/default/ready, platform `aws`, region `aws-eu-central-1`, and `history_retention_seconds=86400`. Confirm whether this history retention is the complete PITR/backup commitment, whether any separate backup location/retention applies, DPA acceptance, and transfer mechanism before approval. |
| Core platform | Clerk | Required production subprocessor | owner check | Confirm DPA, processing/log/session retention, deletion behavior, and transfer mechanism. |
| Core platform | Stripe | Required for paid plans; not raw card storage | owner + counsel check | Confirm payment role split, DPA/Stripe Services Agreement status, invoice/tax retention, and public refund/cancellation wording. |
| Core platform | Inngest | Required production subprocessor for background jobs | owner check | Confirm event payload minimisation, event retention, region, DPA, and transfer mechanism. |
| Core platform | Vercel Blob | Enabled production file store for evidence/document storage | counsel check | Production Blob store `splnit-eu` is Active, private, region `fra1`, currently 0 files/0B at check time. Confirm Vercel Blob DPA coverage, object deletion guarantees, backup/replication behavior, and whether empty current store is expected before launch. |
| Communication | Resend | Required/recommended for transactional email | owner check | Confirm production sending domain, DPA, log/suppression retention, processing region, and transfer mechanism. |
| Communication | Loops | Not enabled in Vercel Production at check time | not production | `LOOPS_API_KEY` and `LOOPS_NEWSLETTER_LIST_ID` were absent from Vercel Production/readiness. Do not list Loops as active production processing unless enabled later; if enabled, document consent basis, unsubscribe/suppression retention, DPA, and region. |
| Runtime support | Upstash Redis | Not enabled in Vercel Production at check time | not production | `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` were absent from Vercel Production/readiness. Integration locks/rate limits must use fallback behavior or remain non-Redis until this is enabled and reviewed. |
| Observability | Sentry | Not enabled in Vercel Production at check time | not production | Sentry DSN and source-map variables were absent from Vercel Production/readiness. Do not list Sentry as active production processing unless enabled later; if enabled, confirm EU/US region, PII scrubbing, event retention, source-map access, DPA, and transfer mechanism. |
| Analytics | PostHog | Not enabled in Vercel Production at check time | not production | `NEXT_PUBLIC_POSTHOG_KEY` was absent from Vercel Production. Code remains consent-gated if enabled later; public wording should say PostHog is not active unless production env is added and legal facts are approved. |
| AI provider | OpenAI | Enabled production questionnaire AI processor | owner + counsel check | Vercel Production env metadata has `OPENAI_API_KEY`; live readiness reports questionnaires configured; env metadata also has `QUESTIONNAIRE_AI_ENABLED`. Confirm DPA/data-processing terms, model/data-retention controls, transfer mechanism, customer opt-in/review wording, and deploy timing before broad customer use. |
| AI provider | Anthropic | Not currently supported by questionnaire provider code | not production | `.env.example` still mentions Anthropic, but `lib/questionnaires/provider.ts` currently registers OpenAI only. Remove/align before treating Anthropic as a production subprocessor. |
| Customer-connected | Microsoft 365 / Microsoft Graph | Customer-connected system | customer-connected | Confirm OAuth scopes, customer instruction wording, token storage/deletion, and whether Microsoft is a customer system rather than Splnit subprocessor. |
| Customer-connected | GitHub | Customer-connected system | customer-connected | Confirm GitHub App permissions, customer instruction wording, metadata minimisation, and classification. |
| Customer-connected | AWS customer account | Customer-connected system | customer-connected | Confirm role/permission model, whether Splnit-owned AWS keys are used in production, customer instruction wording, and classification. |
| Planned/dashboard | Cloudflare | DNS/WAF/dashboard-only unless configured in production traffic path | not production until verified | Confirm whether production traffic flows through Cloudflare and whether IP/request metadata is processed. |
| Planned/dashboard | BetterStack | Uptime/status monitoring only if configured | not production until verified | Confirm monitored URLs, subscriber data, DPA, region, and whether incident subscribers are collected. |
| Backup/export | AWS S3 or equivalent backup bucket | Not production unless an external backup process exists | not production until verified | Confirm exact backup/export storage, region, encryption, retention, and DPA before listing publicly. |

## Production Verification Snapshot - 2026-05-14

Non-secret production checks completed:

- Vercel deployment: `vercel inspect https://splnit.eu` returned target `production`, status `Ready`, created 2026-05-12; observed Node/serverless output items are in `iad1`.
- Vercel project config: repo has no custom function-region setting in `vercel.json` or `next.config.ts`.
- Vercel Blob: `vercel blob list-stores` / `get-store` show store `splnit-eu`, status Active, access Private, region `fra1`, size 0B, files 0 at check time.
- Neon/Postgres: Vercel Production env metadata includes Neon/Postgres variables and `NEON_PROJECT_ID`; redacted host metadata from a safe env pull confirms a Neon pooler host in `eu-central-1`. Neon API access using the corrected project ID confirms branch `production` (`br-flat-cake-al58sdkr`) is primary/default/ready, platform `aws`, region `aws-eu-central-1`, and `history_retention_seconds=86400`.
- Live readiness endpoint: `/api/readiness` reports `blob=configured`, `questionnaires=configured`, `redis=missing`, `marketing=missing`, `observability=missing`, and `sentrySourceMaps=missing`.
- Vercel Production env metadata: `OPENAI_API_KEY` and `QUESTIONNAIRE_AI_ENABLED` are present; `NEXT_PUBLIC_POSTHOG_KEY`, Sentry DSN/source-map variables, Loops variables, and Upstash variables are absent.
- Browser analytics check: after accepting the cookie banner on `https://splnit.eu/`, no Vercel Analytics, Speed Insights, PostHog, or Sentry network request was observed. Treat Vercel Web Analytics/Speed Insights as not proven active until the Vercel dashboard confirms it.

Unconfirmed after this pass:

- Neon separate backup location/retention commitment beyond API-exposed `history_retention_seconds=86400`, and whether that setting is the complete PITR/restore window for the production plan.
- Vercel log retention/storage location and Vercel Web Analytics/Speed Insights dashboard status.
- OpenAI account data-retention controls, DPA/data-processing terms, and transfer mechanism.

## Product Subprocessors

These vendors process Splnit-controlled production service data when the corresponding feature is configured. Items marked optional must not be described publicly as always-on.

| Vendor | Product use | Classification | Current app status | Likely data categories | Region / transfer status | DPA/security source status | Legal status before launch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vercel | Hosting, serverless runtime, CDN/edge delivery, deployment logs, optional Web Analytics and Speed Insights. | Required for hosting; analytics not proven active. | Production deployment is Ready. `vercel inspect` observed Node/serverless functions in `iad1`; no custom function region is configured in `vercel.json` or `next.config.ts`. Analytics packages are present and cookie-gated, but a live browser check after accepting cookies observed no Vercel analytics/speed network request. | Request metadata, IP/device metadata, runtime/deployment logs. Analytics data only if Vercel Web Analytics/Speed Insights is actually enabled and firing. | Function region observed as `iad1`; edge/CDN and log storage/retention details still need Vercel DPA/security documentation. | DPA/security links not attached in repo. | `counsel check`: hosting/runtime facts are concrete enough for counsel review, but analytics dashboard status, log retention, and DPA/security evidence still need attachment. |
| Neon | Serverless Postgres database. | Required production subprocessor. | Required through `DATABASE_URL`; Vercel Production has Neon/Postgres env metadata and `NEON_PROJECT_ID`. Redacted production host metadata confirms Neon, pooler host, region `eu-central-1`. Neon API confirms branch `production` (`br-flat-cake-al58sdkr`) is primary/default/ready and project metadata exposes `history_retention_seconds=86400`. | Most application records: organisations, profiles, controls, evidence metadata, policies, vendors, incidents, risks, audit logs, access reviews, Trust Center data. | Production host/API region observed as `eu-central-1` / `aws-eu-central-1`; API-exposed history retention is 86400 seconds. Separate backup location/retention and exact PITR plan commitment still need Neon documentation/dashboard confirmation. | DPA/security links not attached in repo. | `counsel check`: production branch and API retention metadata are confirmed; DPA/security evidence plus separate backup/PITR interpretation still need approval. |
| Clerk | Authentication, organisations, sessions, webhook sync. | Required production subprocessor. | Required by readiness checks for production auth. | User identity, email, names, organisation IDs, role/membership data, auth/session metadata. | Processing/log/session locations unknown in this register. | DPA/security links not attached in repo. | `owner check`: confirm DPA, processing locations, session/log retention, deletion behavior, and transfer mechanism. |
| Stripe | Paid billing, Checkout, customer portal, webhooks. | Required for paid plans; Stripe may be independent controller for some payment activity. | Required by production readiness for billing; source paths exist for Checkout/portal/webhooks. | Customer and billing metadata, subscription status, Stripe customer IDs, invoice/payment metadata. Splnit should not store raw card data. | Region/transfer and legal role split require Stripe account/legal review. | DPA/payment terms links not attached in repo. | `owner + counsel check`: confirm DPA/terms, controller/processor role split, tax/invoice retention, refunds/cancellation wording, and transfer mechanism. |
| Inngest | Background job delivery for scheduled tests, evidence reminders, policy reminders, regulation sync. | Required production subprocessor. | Required through `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`. | Job metadata, organisation IDs, provider names, event payloads needed to run background tasks. | Region, event retention, and transfer mechanism unknown in this register. | DPA/security links not attached in repo. | `owner check`: confirm DPA, event payload limits, processing locations, event retention, and transfer mechanism. |
| Vercel Blob | Private file/object storage for uploaded evidence and generated policy/gap-report PDFs. | Enabled production file store. | `BLOB_READ_WRITE_TOKEN` is present in Vercel Production; `vercel blob get-store` shows Blob store `splnit-eu` Active, private, region `fra1`, 0 files/0B at check time. Code deletes known Blob objects on org deletion and failed post-upload database saves. | Uploaded evidence files, generated policies, generated reports, file URLs/metadata when users create them. | Store region observed as `fra1`; backup/replication/log behavior still needs Vercel documentation. | Confirm whether covered under Vercel DPA/security terms and attach evidence. | `counsel check`: enabled and region/private status confirmed; DPA coverage, backup/replication, and deletion guarantees still need review. |
| Resend | Transactional email for reminders, vendor questionnaires, and notifications. | Required/recommended for transactional email. | Enabled by `RESEND_API_KEY` and `RESEND_FROM`; production smoke history has proven controlled mailbox delivery. | Recipient emails, message content, delivery metadata, suppression/bounce metadata. | Sending region, event/log retention, and transfer mechanism unknown in this register. | DPA/security links not attached in repo. | `owner check`: confirm DPA, sending region, event/log retention, suppression handling, and transfer mechanism. |
| Loops | Newsletter, marketing list, regulation digest transactional templates. | Not production at check time. | `LOOPS_API_KEY` and `LOOPS_NEWSLETTER_LIST_ID` are absent from Vercel Production/readiness. Digest code exists but is not configured for production use. | None in current production unless enabled later. | Not applicable until enabled. | Not applicable until enabled. | `not production`: do not include as active processing unless production env is added and consent/unsubscribe/DPA/region facts are approved. |
| Upstash Redis | Integration run locks and questionnaire rate limiting. | Not production at check time. | `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are absent from Vercel Production/readiness. Redis client code exists but is not configured. | None in current production unless enabled later. | Not applicable until enabled. | Not applicable until enabled. | `not production`: if enabled later, confirm DPA, database region, key TTLs, and transfer mechanism. |
| Sentry | Error monitoring and source-map support. | Not production at check time. | Sentry DSN/source-map env variables are absent from Vercel Production/readiness. Sentry code/config exists, but production runtime is not configured to send events. | None in current production unless enabled later. | Not applicable until enabled. | Not applicable until enabled. | `not production`: do not include as active processing unless DSN/env is added and PII scrubbing, region, retention, source-map access, DPA, and transfer mechanism are approved. |
| PostHog | Product analytics and pricing CTA feature flag. | Not production at check time. | `NEXT_PUBLIC_POSTHOG_KEY` is absent from Vercel Production. Code is consent-gated and host defaults to `https://eu.posthog.com` only in `.env.example`, not verified production. | None in current production unless enabled later. | Not applicable until enabled. | Not applicable until enabled. | `not production`: public pages should not imply active PostHog processing unless production env is added and legal facts are approved. |
| OpenAI | Questionnaire answer drafting from customer compliance context. | Enabled production AI processor. | Vercel Production env metadata includes `OPENAI_API_KEY` and `QUESTIONNAIRE_AI_ENABLED`; live `/api/readiness` reports questionnaires configured. Provider code supports OpenAI only. | Security questionnaire prompts, organisation context, controls, policies, evidence references, reviewed citation IDs, generated answers when live generation is used. | Provider data retention, region/transfer mechanism, and account data-control settings unknown in this register. | DPA/data-processing terms not attached in repo. | `owner + counsel check`: production enablement is confirmed, but DPA/data terms, model/data retention controls, transfer mechanism, and customer opt-in/review wording still need approval before broad customer use. |
| Anthropic | Questionnaire AI provider candidate. | Not production in current code. | `.env.example` mentions Anthropic, but provider code currently supports OpenAI only. | None unless code/config is changed. | Not applicable until supported/enabled. | Not applicable until supported/enabled. | `not production`: align `.env.example`, docs, and code before listing Anthropic as active. |

## Customer-Selected Connected Systems

These systems are connected by the customer to run compliance checks. They should be documented in the DPA/data-processing map, but they are not automatically Splnit subprocessors. Counsel must confirm whether each is treated as a customer system, an independent third party, or a Splnit subprocessor for a specific workflow.

| System | App use | Classification | Data passing through Splnit | Current app status | Closeout action |
| --- | --- | --- | --- | --- | --- |
| Microsoft 365 / Microsoft Graph | MFA, Conditional Access, privileged roles, guests, training, sensitivity-label checks. | Customer-connected system. | OAuth tokens encrypted in Splnit, tenant/user/security metadata, test results. | Implemented; readiness treats Microsoft 365 config as recommended. | Confirm OAuth scopes, customer instructions, token retention/deletion, and whether Microsoft appears only as customer-selected integration in public wording. |
| GitHub | Organisation 2FA, branch protection, secret scanning, dependency alerts, code scanning checks. | Customer-connected system. | GitHub App installation ID, repository metadata, security-check results. | Implemented; readiness treats GitHub config as recommended. | Confirm GitHub App permissions, customer instructions, installation-token handling, and public wording. |
| AWS customer account | SecurityAudit role checks for CloudTrail, S3 encryption, IAM MFA, root MFA, VPC Flow Logs. | Customer-connected system unless Splnit-owned AWS infrastructure is used. | AWS account ID/role config, cloud security metadata, test results. | Implemented; `.env.example` includes AWS SDK credentials/region and connect account ID. | Confirm whether production uses Splnit-owned AWS credentials, customer role assumptions, customer instructions, and public wording. |
| Google Workspace | Planned future integration. | Not production. | No production OAuth processing in this release. | Planned only. | Do not include as active processing until implemented and reviewed. |

## Planned Or Dashboard-Only Vendors

These vendors are mentioned in launch operations or may exist outside runtime code, but they must not be treated as active production subprocessors until verified.

| Vendor | Intended use | Status | Required decision |
| --- | --- | --- | --- |
| Cloudflare | DNS/WAF/rate limiting for production domain. | `not production until verified` | Confirm whether production request traffic passes through Cloudflare and whether IP/request metadata is processed. If DNS-only, decide whether it belongs in the public DPA at all. |
| BetterStack | Uptime checks and status page. | `not production until verified` | Confirm monitored URLs, incident subscriber data, DPA, region, retention, and whether status subscribers are collected. |
| AWS S3 or equivalent backup bucket | Database exports/snapshots if configured outside Neon. | `not production until verified` | Confirm exact account, region, retention, encryption, DPA/transfer basis, and whether this is active or only a contingency plan. |

## Public Legal Page Update Rule

Do not update `/soukromi`, `/cookies`, `/dpa`, or customer-facing Terms from this register until the relevant rows are approved.

When approved, public pages should expose only:

- vendor name;
- purpose/category;
- high-level data categories;
- whether the vendor is required or optional;
- processing/transfer summary;
- customer objection/contact route for material subprocessor changes.

Public pages should not expose internal env names, exact token names, internal retention dashboards, private architecture details, or speculative vendors that are not production-enabled.

## Launch Blockers

- Replace every `owner check`, `owner + counsel check`, and `optional/off by default` row with a verified value or deliberate `not production` decision before final legal publication.
- Store vendor DPA/security links in this register or a legal evidence folder before launch.
- Confirm enabled-but-not-yet-approved production vendors: Vercel hosting/logs, Neon/Postgres, Vercel Blob, Resend, Inngest, Clerk, Stripe, and OpenAI.
- Confirm disabled/not-production vendors remain absent from public active-subprocessor wording unless enabled later: Loops, Upstash Redis, Sentry, PostHog, Anthropic, Cloudflare, BetterStack, and external backup storage.
- Confirm Neon DPA/security evidence and interpret the API-exposed `history_retention_seconds=86400` against Neon dashboard/docs; branch `production`, project region `aws-eu-central-1`, and corrected project access are now confirmed.
- Confirm Vercel Web Analytics/Speed Insights dashboard status; code is consent-gated, but no analytics/speed request was observed after accepting cookies in a live browser check.
- Align the questionnaire AI documentation: current provider code supports OpenAI, while `.env.example` still contains Anthropic variables.
- If a vendor is disabled in production, confirm whether it should remain in `/soukromi`, `/cookies`, and `/dpa` as "if enabled" language or be removed.
- Confirm whether customer-uploaded evidence may include special categories of personal data and whether extra restrictions are needed.
