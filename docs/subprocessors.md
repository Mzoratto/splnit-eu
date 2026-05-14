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
- public vendor DPA/security/retention URL checks on 2026-05-14; HTTP status was verified where curl access was available

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
| Core platform | Vercel | Required production subprocessor | counsel check | Production deployment is Ready; observed Node/serverless functions are in `iad1`. No custom function region is configured in repo. Vercel Web Analytics and Speed Insights are consent-gated; a controlled production browser check with accepted consent observed Vercel Web Analytics `/view` and Speed Insights `/vitals` POSTs returning HTTP 200, so treat both as enabled and receiving production test data. Confirm Vercel account-level retention/export details before public analytics wording. |
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
| AI provider | OpenAI | Enabled production questionnaire AI processor | owner + counsel check | Vercel Production env metadata has `OPENAI_API_KEY`; live readiness reports questionnaires configured; env metadata also has `QUESTIONNAIRE_AI_ENABLED`. Code review confirms OpenAI-only provider support, explicit feature/config gates, context sanitization, draft default, and reviewer approval flow. Confirm OpenAI DPA/data-processing terms, model/data-retention controls, training/use-of-inputs settings, transfer mechanism, customer opt-in notice, and human-review wording before broad customer use. |
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
- Browser analytics check: with consent accepted, a controlled production Playwright check observed Vercel Web Analytics and Speed Insights scripts loading from Vercel-proxied production paths, Vercel Analytics `/view` POSTs returning HTTP 200, and Speed Insights `/vitals` POSTs returning HTTP 200. Treat Web Analytics and Speed Insights as enabled and receiving production test data, while keeping account-level retention/export settings for counsel confirmation.

Unconfirmed after this pass:

- Neon separate backup location/retention commitment beyond API-exposed `history_retention_seconds=86400`, and whether that setting is the complete PITR/restore window for the production plan.
- Vercel account-level log, Web Analytics, and Speed Insights retention/export settings; live collection endpoints are now confirmed, but account-specific retention still needs dashboard/docs/counsel confirmation.
- OpenAI account data-retention controls, DPA/data-processing terms, training/use-of-inputs settings, transfer mechanism, support/log retention, and final customer opt-in/human-review wording.

## Vendor Evidence Links - 2026-05-14

These links are evidence for counsel review, not legal approval. Public URL availability can change; counsel/business owner still needs to confirm the contracting entity, account plan, signed terms, transfer mechanism, and any account-specific data-retention settings.

| Vendor | DPA / data-processing terms | Security evidence | Retention / region / subprocessor evidence | Evidence status |
| --- | --- | --- | --- | --- |
| Vercel / Vercel Blob | https://vercel.com/legal/dpa | https://vercel.com/security and Blob security docs: https://vercel.com/docs/vercel-blob/security | Privacy: https://vercel.com/legal/privacy-policy; Web Analytics docs: https://vercel.com/docs/analytics; Web Analytics privacy: https://vercel.com/docs/analytics/privacy-policy; Speed Insights docs: https://vercel.com/docs/speed-insights; Speed Insights privacy: https://vercel.com/docs/speed-insights/privacy-policy; runtime logs: https://vercel.com/docs/logs/runtime; Blob docs: https://vercel.com/docs/vercel-blob, private storage: https://vercel.com/docs/vercel-blob/private-storage, deletion SDK docs: https://vercel.com/docs/vercel-blob/using-blob-sdk#deleting-blobs | Public DPA/security/analytics/speed/log/Blob docs reachable. Live production collection endpoints returned HTTP 200 after accepted consent. Still needs account-level confirmation for runtime log retention, analytics retention/export windows, and whether Blob backup/replication is covered by the same Vercel terms. |
| Neon | Public DPA URL was not found/reachable during this pass; use Neon Trust Center/account legal terms for DPA acceptance: https://trust.neon.com | https://neon.com/security | Subprocessors: https://neon.com/subprocessors; regions: https://neon.com/docs/introduction/regions; restore/branching: https://neon.com/docs/introduction/branch-restore; backups: https://neon.com/docs/manage/backups | Security/subprocessor/backup docs reachable. DPA still requires Trust Center/account confirmation. API confirms production region and `history_retention_seconds=86400`, but counsel should verify whether separate backup/PITR commitments apply. |
| OpenAI | Public URLs to verify in browser/account: https://openai.com/policies/business-terms/ and https://openai.com/policies/data-processing-addendum/ | Public URL to verify in browser/account: https://openai.com/security/ | Public URLs to verify in browser/account: https://openai.com/policies/api-data-usage-policies/ and https://openai.com/enterprise-privacy/ | URLs are the right evidence targets, but curl returned 403 from this environment again on 2026-05-14. Owner/counsel must verify in browser/account and confirm API data retention, training/use-of-inputs settings, support/log retention, subprocessors, and transfer mechanism before approval. |
| Clerk | https://clerk.com/legal/dpa | https://clerk.com/docs/guides/secure/restricting-access | Privacy: https://clerk.com/legal/privacy; subprocessors: https://clerk.com/legal/subprocessors | Public DPA/privacy/subprocessor docs reachable. Still needs account/product confirmation for processing locations, session/log retention, deletion behavior, and transfer mechanism. |
| Stripe | https://stripe.com/legal/dpa and Services Agreement: https://stripe.com/legal/ssa | https://stripe.com/docs/security/stripe | Privacy: https://stripe.com/privacy; service providers/subprocessors: https://stripe.com/legal/service-providers | Public DPA/security/privacy/service-provider docs reachable. Still needs counsel confirmation of controller/processor role split, tax/invoice retention, and Czech/EU contracting terms. |
| Resend | https://resend.com/legal/dpa | https://resend.com/security | Privacy: https://resend.com/legal/privacy-policy; subprocessors: https://resend.com/legal/subprocessors | Public DPA/security/privacy/subprocessor docs reachable. Still needs production account confirmation for sending region, event/log retention, suppression/bounce retention, and transfer mechanism. |
| Inngest | Public DPA URL was not found/reachable during this pass; request signed/account DPA or legal terms from Inngest if needed. | https://www.inngest.com/security and security docs: https://www.inngest.com/docs/learn/security | Privacy: https://www.inngest.com/privacy | Security/privacy docs reachable. Public DPA and event-retention docs were not found/reachable, so keep `owner check` until account/legal terms and event retention are confirmed. |

## Product Subprocessors

These vendors process Splnit-controlled production service data when the corresponding feature is configured. Items marked optional must not be described publicly as always-on.

| Vendor | Product use | Classification | Current app status | Likely data categories | Region / transfer status | DPA/security source status | Legal status before launch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vercel | Hosting, serverless runtime, CDN/edge delivery, deployment logs, Vercel Web Analytics, and Speed Insights. | Required for hosting; analytics/speed are active only after optional cookie consent. | Production deployment is Ready. `vercel inspect` observed Node/serverless functions in `iad1`; no custom function region is configured in `vercel.json` or `next.config.ts`. Analytics packages are present and cookie-gated. A controlled production browser check with accepted consent observed Web Analytics `/view` and Speed Insights `/vitals` POSTs returning HTTP 200. | Request metadata, IP/device metadata, runtime/deployment logs. Analytics/speed data is collected only when the user accepts optional analytics cookies. | Function region observed as `iad1`; Vercel docs linked above cover analytics/speed/log evidence, but account-level retention/export settings still need confirmation. | Evidence links attached above: Vercel DPA, security, privacy, Web Analytics, Speed Insights, runtime logs, and Blob docs. Account-specific log/analytics retention still unverified. | `counsel check`: hosting/runtime and analytics/speed receiving-data facts are concrete enough for counsel review, but account-specific retention/export settings and legal acceptance still need confirmation. |
| Neon | Serverless Postgres database. | Required production subprocessor. | Required through `DATABASE_URL`; Vercel Production has Neon/Postgres env metadata and `NEON_PROJECT_ID`. Redacted production host metadata confirms Neon, pooler host, region `eu-central-1`. Neon API confirms branch `production` (`br-flat-cake-al58sdkr`) is primary/default/ready and project metadata exposes `history_retention_seconds=86400`. | Most application records: organisations, profiles, controls, evidence metadata, policies, vendors, incidents, risks, audit logs, access reviews, Trust Center data. | Production host/API region observed as `eu-central-1` / `aws-eu-central-1`; API-exposed history retention is 86400 seconds. Separate backup location/retention and exact PITR plan commitment still need Neon documentation/dashboard confirmation. | Evidence links attached above: Neon security, subprocessors, regions, restore, and backup docs. Public DPA URL not found; use Neon Trust Center/account terms. | `counsel check`: production branch and API retention metadata are confirmed; DPA acceptance plus separate backup/PITR interpretation still need approval. |
| Clerk | Authentication, organisations, sessions, webhook sync. | Required production subprocessor. | Required by readiness checks for production auth. | User identity, email, names, organisation IDs, role/membership data, auth/session metadata. | Processing/log/session locations unknown in this register. | Evidence links attached above: Clerk DPA, privacy, subprocessors, and security guide. | `owner check`: confirm processing locations, session/log retention, deletion behavior, and transfer mechanism from Clerk account/docs before moving to counsel-only review. |
| Stripe | Paid billing, Checkout, customer portal, webhooks. | Required for paid plans; Stripe may be independent controller for some payment activity. | Required by production readiness for billing; source paths exist for Checkout/portal/webhooks. | Customer and billing metadata, subscription status, Stripe customer IDs, invoice/payment metadata. Splnit should not store raw card data. | Region/transfer and legal role split require Stripe account/legal review. | Evidence links attached above: Stripe DPA, Services Agreement, security docs, privacy, and service providers. | `owner + counsel check`: confirm controller/processor role split, tax/invoice retention, refunds/cancellation wording, Czech/EU contracting terms, and transfer mechanism. |
| Inngest | Background job delivery for scheduled tests, evidence reminders, policy reminders, regulation sync. | Required production subprocessor. | Required through `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`. | Job metadata, organisation IDs, provider names, event payloads needed to run background tasks. | Region, event retention, and transfer mechanism unknown in this register. | Evidence links attached above: Inngest security, security docs, and privacy. Public DPA/event-retention docs were not found/reachable. | `owner check`: confirm DPA/account terms, event payload limits, processing locations, event retention, and transfer mechanism. |
| Vercel Blob | Private file/object storage for uploaded evidence and generated policy/gap-report PDFs. | Enabled production file store. | `BLOB_READ_WRITE_TOKEN` is present in Vercel Production; `vercel blob get-store` shows Blob store `splnit-eu` Active, private, region `fra1`, 0 files/0B at check time. Code deletes known Blob objects on org deletion and failed post-upload database saves. | Uploaded evidence files, generated policies, generated reports, file URLs/metadata when users create them. | Store region observed as `fra1`; backup/replication/log behavior still needs Vercel documentation. | Evidence links attached above under Vercel / Vercel Blob: Vercel DPA, security, Blob security, private storage, and deletion SDK docs. | `counsel check`: enabled and region/private status confirmed; DPA coverage is linked, but backup/replication and deletion guarantees still need account/docs review. |
| Resend | Transactional email for reminders, vendor questionnaires, and notifications. | Required/recommended for transactional email. | Enabled by `RESEND_API_KEY` and `RESEND_FROM`; production smoke history has proven controlled mailbox delivery. | Recipient emails, message content, delivery metadata, suppression/bounce metadata. | Sending region, event/log retention, and transfer mechanism unknown in this register. | Evidence links attached above: Resend DPA, security, privacy, and subprocessors. | `owner check`: confirm sending region, event/log retention, suppression/bounce retention, and transfer mechanism from production account/docs before moving to counsel-only review. |
| Loops | Newsletter, marketing list, regulation digest transactional templates. | Not production at check time. | `LOOPS_API_KEY` and `LOOPS_NEWSLETTER_LIST_ID` are absent from Vercel Production/readiness. Digest code exists but is not configured for production use. | None in current production unless enabled later. | Not applicable until enabled. | Not applicable until enabled. | `not production`: do not include as active processing unless production env is added and consent/unsubscribe/DPA/region facts are approved. |
| Upstash Redis | Integration run locks and questionnaire rate limiting. | Not production at check time. | `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are absent from Vercel Production/readiness. Redis client code exists but is not configured. | None in current production unless enabled later. | Not applicable until enabled. | Not applicable until enabled. | `not production`: if enabled later, confirm DPA, database region, key TTLs, and transfer mechanism. |
| Sentry | Error monitoring and source-map support. | Not production at check time. | Sentry DSN/source-map env variables are absent from Vercel Production/readiness. Sentry code/config exists, but production runtime is not configured to send events. | None in current production unless enabled later. | Not applicable until enabled. | Not applicable until enabled. | `not production`: do not include as active processing unless DSN/env is added and PII scrubbing, region, retention, source-map access, DPA, and transfer mechanism are approved. |
| PostHog | Product analytics and pricing CTA feature flag. | Not production at check time. | `NEXT_PUBLIC_POSTHOG_KEY` is absent from Vercel Production. Code is consent-gated and host defaults to `https://eu.posthog.com` only in `.env.example`, not verified production. | None in current production unless enabled later. | Not applicable until enabled. | Not applicable until enabled. | `not production`: public pages should not imply active PostHog processing unless production env is added and legal facts are approved. |
| OpenAI | Questionnaire answer drafting from customer compliance context. | Enabled production AI processor; restrict to controlled/approved customer use until terms/notice are approved. | Vercel Production env metadata includes `OPENAI_API_KEY` and `QUESTIONNAIRE_AI_ENABLED`; live `/api/readiness` reports questionnaires configured. Provider code supports OpenAI only and requires both the feature flag and configured key. Prior production smoke proved one controlled live generation/review path with model `gpt-4.1-mini-2025-04-14`. | Security questionnaire questions, organisation name/plan, control summaries, evidence summaries/metadata, active policy metadata, reviewed citation metadata, and generated answers. Raw uploaded evidence files are not sent by the current prompt builder. Secrets, credentials, special-category personal data, and unnecessary personal data should not be sent. | Provider data retention, region/transfer mechanism, training/use-of-inputs setting, and support/log retention unknown in this register. | Evidence target links attached above: OpenAI business terms, DPA, security, API data usage, and enterprise privacy. This environment received HTTP 403 for those public URLs, so owner/counsel must verify in browser/account. | `owner + counsel check`: production enablement and code gates are confirmed, but DPA/data terms, account data-retention/training controls, transfer mechanism, customer opt-in notice, and human-review wording still need approval before broad customer use. |
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
- Have business owner/counsel accept or replace the attached public evidence links; Neon DPA, Inngest DPA/event retention, OpenAI account verification, and account-specific retention settings remain unresolved.
- Confirm enabled-but-not-yet-approved production vendors: Vercel hosting/logs, Neon/Postgres, Vercel Blob, Resend, Inngest, Clerk, Stripe, and OpenAI.
- Confirm disabled/not-production vendors remain absent from public active-subprocessor wording unless enabled later: Loops, Upstash Redis, Sentry, PostHog, Anthropic, Cloudflare, BetterStack, and external backup storage.
- Confirm Neon DPA/security evidence and interpret the API-exposed `history_retention_seconds=86400` against Neon dashboard/docs; branch `production`, project region `aws-eu-central-1`, and corrected project access are now confirmed.
- Confirm Vercel account-level runtime log, Web Analytics, and Speed Insights retention/export settings; live consent-gated collection endpoints now return HTTP 200, but retention/export terms still need dashboard/docs/counsel confirmation.
- Align `.env.example` with the active questionnaire provider strategy: provider code supports OpenAI, while `.env.example` still contains Anthropic variables for a non-production candidate.
- If a vendor is disabled in production, confirm whether it should remain in `/soukromi`, `/cookies`, and `/dpa` as "if enabled" language or be removed.
- Confirm whether customer-uploaded evidence may include special categories of personal data and whether extra restrictions are needed.
