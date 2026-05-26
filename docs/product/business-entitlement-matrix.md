# Business Entitlement Matrix

Last updated: 2026-05-18

Purpose: internal truth source for sales, onboarding, and buyer-readiness conversations about the Business plan. This is not public marketing copy. It records what can be claimed, what is implemented, what is production-smoked, and what must stay qualified until proven for a specific customer environment.

## Claim boundaries

Use this document before answering: "What is actually available in Business?"

Safe summary:

> Business is available as an early-access plan. The core compliance workspace, Trust Center, vendor risk workflows, questionnaire assistance, evidence/report exports, risk register, incident workspace, access review workspace, and selected integrations are available. Integration breadth, framework depth, real provider data collection, seat enforcement, custom domains, and enterprise support items must be confirmed during onboarding before being treated as active for a customer environment.

Do not claim:

- "10 integrations are live" unless each named provider has been connected and verified for that customer.
- "5 regulations are fully automated" or equivalent. Business supports up to five framework/regulatory workstreams, but coverage depth varies.
- "All access reviews are complete automatically" without real connected identity/provider data.
- "Custom domain is self-serve and working" unless a domain has been configured and verified.
- "SSO/SAML is included"; current public comparison marks it optional.
- "Priority support has a formal SLA" unless a separate agreement defines it.

## Canonical plan source

Runtime plan source: `lib/stripe/plans.ts`

Business runtime limits/features:

- Frameworks: 5
- Integrations: 10
- Users: 25
- Vendors: 50
- Policies: 999
- Features: `trust_center`, `vendor_risk`, `access_reviews`, `incident_log`, `risk_register`, `questionnaire_ai`

Public marketing source: `messages/*`, especially pricing card/comparison copy.

Previously risky public wording was softened on 2026-05-18 in `messages/*` and `lib/marketing/pricing.ts`:

- Business card now says "Up to 5 framework workstreams" instead of "5 regulations" in English, with equivalent Italian/Czech softening.
- Business card now says "Selected integrations, up to 10 sources" instead of "10 integrations" in English, with equivalent Italian/Czech softening.
- Business card now says "Access review workspace" instead of the broader "Access reviews" in English, with equivalent Italian/Czech softening.
- Business card now says "Priority founder/email support" instead of the broader "Priority support" in English, with equivalent Italian/Czech softening.
- Pricing comparison now marks Azure and Google Workspace as `soon` for Business instead of checked/live.

Still apply these sales boundaries:

- "Up to 5 framework workstreams" does not mean all five have equal automation depth.
- "Selected integrations, up to 10 sources" does not mean 10 live providers are available today.
- "Access review workspace" still needs provider-backed verification for a specific customer environment.
- "Priority founder/email support" does not imply a formal SLA unless separately agreed.

## Entitlement matrix

Status vocabulary:

- Working: implemented and reasonable to demo/use with the stated caveats.
- Working, not production-smoked: implemented, but no current production smoke proof found for the full flow.
- Production-smoked: covered by `npm run smoke:production-tenant-readiness` or a referenced production proof doc.
- Partial / selected-provider only: some surfaces work, but the broad claim would overstate current coverage.
- Planned / optional: not generally available as included self-serve Business functionality.
- Do not claim: should not be sold as active functionality.

| Feature | Public claim | App route/API | Persistence | Auth scoped | Production smoke | Client-facing status |
|---|---|---|---|---|---|---|
| 5 frameworks / regulations | Business pricing card says "5 regulations"; comparison shows NIS2, GDPR, EU AI Act, ISO 27001, CSRD lite, DORA soon. Runtime limit is 5 frameworks. | `/frameworks`, `/frameworks/[frameworkSlug]`, `/controls`, `/controls/[controlId]`, onboarding/intake surfaces. | Framework/control/org profile data persists in DB; intake-based prioritization depends on `org_intake_profiles`. | App routes are under authenticated app middleware. | Intake prioritization production review exists in `docs/reviews/intake-prioritization-human-review.md`; generic all-five-depth proof is not complete. | Partial. Say "up to 5 framework/regulatory workstreams; coverage depth varies by framework." |
| 10 integrations | Business pricing card says "10 integrations"; runtime limit is 10 integrations. | `/integrations`, `/integrations/microsoft365`, `/integrations/github`, `/integrations/aws`, `/integrations/[provider]`; callbacks under `/api/integrations/*/callback`. | Integration records/runs/tests persist via integrations DB queries. | App pages and provider callbacks are authenticated/scoped where applicable. | Production smoke renders integration pages for Microsoft 365, GitHub, and AWS; not proof of 10 real providers. | Partial / selected-provider only. Say "supports up to 10 integrations; available providers confirmed during onboarding." |
| Microsoft 365 | Listed in comparison and app integration hub. | `/integrations/microsoft365`, `/api/integrations/microsoft/callback`. | Integration detail, token metadata, tests/runs persist. | Authenticated org context and Microsoft callback handling. | Page render is production-smoked. Real customer OAuth/evidence collection is not proven by the generic smoke. | Working for selected-provider onboarding; verify against customer tenant before claiming active evidence coverage. |
| GitHub | Listed in comparison and app integration hub. | `/integrations/github`, `/api/integrations/github/callback`. | Integration detail, token metadata, tests/runs persist. | Authenticated org context and callback handling. | Page render is production-smoked. Real customer OAuth/evidence collection is not proven by the generic smoke. | Working for selected-provider onboarding; verify against customer org/repo permissions. |
| AWS | Listed in comparison and app integration hub. | `/integrations/aws`. | Integration/test data model exists; provider page exists. | Authenticated app route. | Page render is production-smoked. Real AWS account connection/evidence collection is not proven by the generic smoke. | Partial. Demo the surface; qualify real account automation until configured and verified. |
| Google Workspace | Listed in comparison; app hub marks planned. | `/integrations/google-workspace` via planned provider fallback; `/api/integrations/google/callback` exists. | Callback route/code exists, but app hub marks provider planned. | Auth/auth callback present where implemented. | Not production-smoked as live provider; planned page may render through generic provider route. | Planned / not claimable as live Business integration. |
| Azure | Listed in comparison. | No live Azure app page found in current integration hub. | No current live provider persistence proof found. | Not established. | Not production-smoked. | Do not claim as live. Treat as roadmap/available by custom onboarding only if actually implemented. |
| Regulatory feed | Listed as "Regulatory feed" / NUKIB feed. | Cron/regulation sync exists at `/api/cron/regulation-sync`; regulation pages/source imports exist. | Source documents/framework data persist in DB. | Cron route should be protected by cron auth/secret; app display is authenticated where private. | Cron configuration/runtime sync not proven by tenant readiness smoke. | Partial. Say regulatory content/feed support exists where imported; do not imply continuous monitored coverage without cron proof. |
| Automated checks | Comparison says selected for Starter/Business. | `/api/cron/run-tests`; integration test definitions for selected providers. | Test runs/results persist in DB. | Cron protected; app pages scoped by org. | Security e2e covers cron auth behavior; production tenant smoke does not prove recurring provider checks. | Partial / selected checks only. |
| Automated evidence | Comparison says included. | `/evidence`, `/api/evidence/[evidenceId]/download`, integration evidence flows where implemented. | Evidence records/files persist. | Authenticated app and scoped download routes. | Evidence page and workspace archive are production-smoked; generic automated collection across providers is not fully proven. | Working for evidence vault/export; qualify automated provider collection by connected system. |
| Failure alerts | Comparison says included. | Notification/reminder/cron surfaces exist; exact alert route coverage varies. | Reminder/audit/notification data where implemented. | App/cron scoped. | Not fully proven by production tenant readiness smoke. | Working, not production-smoked. Keep claim modest: alerts/reminders where configured. |
| Scheduler | Comparison says included. | Vercel cron routes: `/api/cron/evidence-expiry`, `/api/cron/policy-review-reminders`, `/api/cron/access-review-reminders`, `/api/cron/run-tests`, `/api/cron/regulation-sync`. | Scheduled jobs affect evidence/policy/access-review/test data. | Cron routes should be secret/cron protected; app views auth-scoped. | Security e2e checks configured crons; production tenant smoke does not prove recurring execution. | Partial. Scheduler exists; recurring production behavior needs cron execution proof. |
| Policy templates | Comparison says unlimited for Business; runtime policies limit 999. | `/policies`, `/policies/[type]`, `/api/policies/[policyId]/download`. | Generated policies persist. | Authenticated app and scoped download. | Policy page is not listed in current tenant readiness rendered routes; export archive includes policy/evidence surfaces indirectly. | Working, not fully production-smoked. Qualify as template/generation workspace, not legal-final documents. |
| PDF generation | Comparison says included. | `/api/vendors/supply-chain-report`, `/api/risks/register-report`, `/api/policies/[policyId]/download`, incident report APIs, questionnaire export APIs. | PDFs generated from scoped DB data. | Authenticated/private no-store report routes. | Vendor and risk PDFs are production-smoked; incident/policy/questionnaire PDF flows are not all production-smoked. | Working for vendor/risk reports; other PDFs need targeted proof before sales reliance. |
| Training templates | Comparison says included. | Policy/template content may include training resources; no dedicated training-template app surface confirmed in this audit. | Not confirmed. | Not confirmed. | Not production-smoked. | Do not claim as a mature standalone module. Say training materials/templates are available where included in resource packs, if verified. |
| Auditor export | Comparison says included. | `/api/audit-log/export`, `/api/exports/workspace/archive`, `/api/exports/evidence-metadata`, `/api/exports/workspace`. | Audit/evidence/workspace export data generated from DB. | Authenticated and scoped; private/no-store where applicable. | Production-smoked for audit CSV and workspace ZIP; see `docs/audits/export-endpoint-audit.md`. | Working for current buyer-facing export paths; do not claim generic vendor/risk/incident CSV endpoints. |
| Trust Center public page | Pricing card says Trust Center; comparison says public page. | `/trust-center`, public trust access via `/trust/[orgSlug]` and `/api/trust/[orgSlug]`. | Trust center settings and requests persist. | Admin/config app route auth-scoped; public page intentionally public/access-token based. | Approved public Trust Center access URL is production-smoked. | Working. Keep public content category-level; no sensitive control/evidence implementation details. |
| Trust Center access request workflow | Comparison says document access request workflow. | Trust Center request/create/approve query flows; public approved access URL. | Trust center requests persist. | Admin approval scoped to org; approved public access URL used for buyer. | Production-smoked: request seeded and approved URL renders. | Working. |
| Custom subdomain | Comparison says included. | Trust center settings include `subdomain`; public access uses org slug/subdomain-style identifier. | Trust center subdomain/slug persists. | Admin config scoped. | Production smoke seeds a trust slug and approved URL renders. | Working as configured slug/subdomain identifier; avoid implying DNS custom-domain setup. |
| Custom domain | Comparison marks optional. | No self-serve custom-domain route/proof found. | Not established. | Not established. | Not production-smoked. | Optional / do not claim as included working self-serve. |
| 25 users | Business pricing card and comparison say 25 users; runtime limit users=25. | Clerk org/team/settings surfaces; `/team`. | Clerk org membership plus organisation plan fields. | Clerk-auth scoped. | Tenant readiness smoke authenticates one user/org; no 25-seat enforcement proof. | Contractual early-access limit. Do not claim automated seat enforcement until tested. |
| Roles/permissions | Comparison says included. | Clerk role/org membership surfaces; app-level protected routes. | Clerk membership/roles; any app role data where implemented. | Authenticated routes; route-level org scoping. | No full role-permission matrix smoke found. | Partial. Say roles/permissions are supported at workspace level where configured; verify sensitive-action restrictions. |
| SSO/SAML optional | Comparison marks optional. | Clerk may support SSO/SAML externally; no app self-serve SSO setup flow found. | External/Clerk dependent. | External/Clerk dependent. | Not production-smoked. | Optional enterprise setup only; do not include by default. |
| Email support | Comparison says included for Starter/Business. | Operational support channel, not app feature. | Support inbox/process outside app. | Not applicable. | Not production-smoked. | Working as operational promise if monitored; define response expectations manually. |
| Priority email | Business comparison says included. | Operational support channel, not app feature. | Support inbox/process outside app. | Not applicable. | Not production-smoked. | Working only as early-access founder/priority email support; no SLA unless separately agreed. |
| Vendor risk | Business pricing card says vendor risk module; runtime feature `vendor_risk`; vendors limit 50. | `/vendors`, `/vendors/[vendorId]`, `/vendor-assessment/[token]`, `/api/vendors/supply-chain-report`. | Vendors, vendor assessments, answers, status, risk tier persist. | App routes scoped by org; tokenized vendor assessment public flow scoped by signed token. | Production-smoked: vendors routes, vendor token render, submission persistence, status/risk propagation, vendor PDF. | Working. |
| Access reviews | Business pricing card says access reviews; runtime feature `access_reviews`. | `/team/access-reviews`, `/api/access-reviews/[reviewId]/export`, cron reminder route. | Access reviews persist via `lib/db/queries/access-reviews.ts`. | Authenticated app route and scoped export route. | Page is not currently in tenant readiness rendered routes; cron schedule is e2e-checked. | Working, not production-smoked end-to-end. Say access review workspace; verify provider-backed data. |
| Incident log | Business pricing card says incident log; runtime feature `incident_log`. | `/incidents`, incident report APIs under `/api/incidents/[incidentId]/*-report`. | Incidents persist via `lib/db/queries/incidents.ts`. | Authenticated app route; report routes use `getIncidentForOrg(session.orgId, incidentId)`. | Security e2e checks unauthenticated report rejection; production tenant smoke does not cover create/update/export flow. | Working, not production-smoked end-to-end. Legal/reporting output requires review before filing claims. |
| Risk register | Runtime feature `risk_register`; report/export marketed through documents/auditor export. | `/risks`, `/api/risks/register-report`. | Risk items persist. | Authenticated app and report route scoped by org. | Production-smoked: risk PDF download, workspace archive includes current-org risk and excludes cross-org markers. | Working for current risk register/report path; large-volume report behavior remains qualified. |
| Questionnaire AI | Runtime feature `questionnaire_ai`; questionnaire page copy says Business/Consultant unlimited. | `/questionnaires`, questionnaire export APIs. | Generated artifacts and reviewed answers persist. | Authenticated app route scoped by org. | Production-smoked with live OpenAI when `SMOKE_LIVE_OPENAI_QUESTIONNAIRE=true`; see `docs/ops/questionnaire-ai.md`. | Working when production env is configured. Keep as draft assistance requiring human review. |

## Latest verification record

2026-05-18 verification completed:

- `npm run check:production-migration-drift` passed.
  - Expected migrations: 18
  - Production applied migrations: 18
  - Latest expected/applied migration: `0017_wakeful_thunderbolt`
  - Missing expected migrations: none
  - Extra applied migrations: 0
- Production `org_intake_profiles` table exists.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.
- `SMOKE_LIVE_OPENAI_QUESTIONNAIRE=true npm run smoke:production-tenant-readiness` passed against `https://splnit.eu`.
  - Rendered routes: `/dashboard`, `/evidence`, `/integrations`, `/integrations/microsoft365`, `/integrations/github`, `/integrations/aws`, `/trust-center`, `/vendors`, one seeded `/vendors/[vendorId]`, `/questionnaires`.
  - Live questionnaire generation/review persisted with model `gpt-4.1-mini-2025-04-14`.
  - Trust Center request approved.
  - Vendor assessment token rendered, submission persisted, vendor status propagated to `assessed`, risk tier `low`.
  - Vendor and risk PDF reports downloaded.
  - Audit export auth rejection, cursor pagination, over-limit rejection, and cross-tenant isolation passed.
  - Workspace archive downloaded and excluded seeded cross-tenant markers.
  - Browser console errors: 0; page errors: 0.
  - Temporary smoke org and cross-org cleanup completed; audit logs intentionally retained.
  - Email send was attempted and delivery state was `sent`; controlled mailbox receipt should still be checked separately when email delivery proof is buyer-critical.

## Production proof requirements before relying on Business in production

Before saying a Business tenant is production-ready, run or record:

1. Migration state
   - `npm run check:production-migration-drift`
   - Confirm the production DB has `org_intake_profiles` if intake-based controls/index behavior is in scope.
   - Assume Vercel does not automatically apply Drizzle migrations unless deployment evidence proves otherwise.
   - Only run `npm run db:migrate` with production `DATABASE_URL` during a planned deploy/migration window.

2. Production tenant readiness smoke
   - `SMOKE_LIVE_OPENAI_QUESTIONNAIRE=true npm run smoke:production-tenant-readiness`
   - Confirm output includes route rendering, live questionnaire generation/review, Trust Center access, vendor assessment, vendor/risk PDFs, audit export, workspace archive, no browser console/page errors, and cleanup status.
   - If `SMOKE_VENDOR_ASSESSMENT_RECIPIENT` is set, check the controlled mailbox receipt path separately.

3. Manual buyer-demo checklist
   - Login works.
   - Active org is correct.
   - Dashboard loads.
   - Onboarding/intake works.
   - Copy review: "Priority gaps based on your intake", "Out of scope / not applicable", "Reason from intake".
   - Controls index defaults to in-scope only.
   - Out-of-scope/not-applicable controls appear only behind the explicit filter.
   - Evidence create/upload and download path works.
   - Policy generation/download works for the selected template.
   - Trust Center publish/request/approve flow works.
   - Vendor questionnaire send/open/submit flow works.
   - Questionnaire AI generation/review works.
   - Access review page works with at least one provider-backed dataset if access reviews are part of the buyer demo.
   - Incident log create/edit/view/report path works if incident management is part of the buyer demo.
   - Risk register create/update/report path works.
   - Workspace export works.
   - Mobile sanity check passes for dashboard, controls, vendors, Trust Center, questionnaires, and any page shown in the demo.

## Current next actions

- Keep public pricing wording aligned with this matrix; do not reintroduce unqualified "5 regulations", "10 integrations", or checked Azure/Google Workspace claims until implementation/proof changes.
- Add targeted production smoke coverage for `/team/access-reviews`, `/incidents`, `/policies`, policy download, incident report download, and provider-backed integration execution when those are buyer-critical.
- Add explicit seat-limit and role-permission verification before describing Business seats/roles as automated enforcement.
- Keep custom domain and SSO/SAML as optional/non-default until a documented setup path exists.
