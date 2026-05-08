# App Readiness Audit

Last updated: 2026-05-09

Purpose: identify the authenticated app gaps that must be closed before new product features or broader outreach. This started as a static route/code audit and now records the production verification results that close or defer each readiness item.

## Current Conclusion

Primary workflow readiness is closed for the current outreach decision. A temporary token-gated Vercel production verification route passed on 2026-05-06 against production Neon, live Clerk, the Clerk custom domain, and Vercel Blob, then cleaned up its temporary user, organization, rows, and blobs. Live Clerk Organizations were enabled during this pass with a five-member default limit.

No critical unknowns remain for `dashboard -> controls -> frameworks -> evidence -> policies -> gap report`. Remaining gaps are secondary-surface hardening or product-shaping work, except the separately tracked legal identity closeout and Italian policy-template legal review.

## Latest Production Verification

SEO production deploy `db6d9c9` was verified on 2026-05-09 at `https://splnit.eu`. The Vercel production deployment was `https://splnit-5i83kjddv-marcos-projects-84c3348d.vercel.app`, aliased to `https://splnit.eu`.

Verified public/SEO checks on 2026-05-09:

- `/`: HTTP 200, canonical present, four hreflang alternates, no `noindex`.
- `/it`: HTTP 200, canonical present, four hreflang alternates, no `noindex`.
- `/nastroje/nis2-scope`: HTTP 200, canonical present, four hreflang alternates, no `noindex`; browser render passed with zero console errors.
- `/sitemap.xml`: HTTP 200, contains `https://splnit.eu/nastroje/nis2-scope`, blog URLs, and `x-default` hreflang entries.
- `/robots.txt`: HTTP 200, disallows `/sign-in`, `/sign-up`, `/dashboard`, `/evidence`, `/questionnaires`, and `/vendor-assessment/`.
- `/sign-in`: HTTP 200, `noindex` present.
- `/api/health`: HTTP 200, `ok=true`.

Authenticated route smoke status on 2026-05-09:

- `/evidence` redirected to `/sign-in?redirect_url=.../evidence`; Clerk sign-in rendered with zero browser console errors.
- `/questionnaires` redirected to `/sign-in?redirect_url=.../questionnaires`; Clerk sign-in rendered with zero browser console errors.
- This verifies protected-route enforcement and sign-in rendering only. It does **not** verify authenticated tenant rendering for `/evidence`, `/questionnaires`, or the questionnaire workbench/save flow because the browser session was signed out and no production test tenant credentials/session were available.

Production alias `https://splnit.eu` was verified on 2026-05-06 after DNS propagation for Clerk custom domains. The committed app state was deployed to production as `dpl_2rFBHsXEwR9VkBCoHQ2axmqs74Wt`; temporary verification-route deployments `dpl_HVJHFxVoSUAxrJtyNuoq3MyTJUcx` and `dpl_4Q2zgonQsfb5EynVeXMHo77yrUeW` were used only to run checks inside Vercel with production runtime secrets.

Production health/readiness checks passed:

- `/api/health`: `ok=true`, `databaseConfigured=true`
- `/api/readiness`: `ok=true`, required checks `7/7` configured, recommended checks `2/10` configured

Citation checks passed through the temporary token-gated route:

```json
{
  "automatedEvidenceRows": 0,
  "invalidAutomatedEvidenceRows": 0,
  "missingReviewedLinks": 0,
  "ok": true,
  "promotedDraftRows": 0
}
```

Authenticated production browser verification passed against `https://splnit.eu` with zero browser console errors:

```json
{
  "baseUrl": "https://splnit.eu",
  "browserConsoleErrors": 0,
  "ok": true,
  "evidenceRows": 1,
  "frameworkSlugs": ["gdpr", "nis2"],
  "generatedArtifacts": 1,
  "policies": 2,
  "statusRows": 25
}
```

The temporary route created and cleaned up a Clerk user, Clerk organization, production database rows, generated artifacts, and evidence blobs. The route files are not committed, and the temporary `READINESS_VERIFICATION_TOKEN` production env var was removed after the pass.

## Scope

Audited authenticated routes under `app/(app)` and shared app shell behavior. Public marketing pages, API route internals, and external vendor-assessment links are out of scope for this pass except where they affect the primary customer workflow.

Readiness statuses:

- `ready`: production-shaped path with real org-scoped data and usable empty states.
- `partial`: useful implementation exists, but known production gaps remain.
- `demo-risk`: route can show fallback/demo/static data that may hide missing production data.
- `blocked`: cannot be considered production-ready until a named external dependency is resolved.

## Cross-Cutting Findings

1. **Auth is centralized.** `app/(app)/layout.tsx` redirects to `/sign-in` when Clerk is configured and no `userId` or `orgId` exists. When Clerk is not configured, the app shell can render locally, but buyer-visible fake data is separately gated.
2. **Demo fallback is being contained.** Buyer-visible fallback data on dashboard, risks, incidents, framework detail, vendors, and Trust Center admin is now gated behind `ENABLE_LOCAL_DEMO_DATA=true` outside production. Without that local-only flag, missing workspace data renders an explicit unavailable or empty state instead of fabricated records.
3. **Locale is uneven outside the primary flow.** Primary controls/framework/evidence surfaces now use tenant locale or tenant-aware fallbacks for UI and domain labels. Billing now uses localized copy and EUR for `it-IT`/`en-EU`, CZK for `cs-CZ`; remaining locale gaps are on secondary surfaces.
4. **Action-level org boundaries are smoked.** `npm run smoke:org-boundaries` passed on 2026-05-06, covering control status isolation, evidence/policy download ownership lookups, vendor assessment/questionnaire ownership, incident report/status ownership, access review decision/completion ownership, and audit-log export org filtering.
5. **Primary flow production parity is verified.** Onboarding-equivalent tenant setup, framework enrollment, controls, evidence, policies, report generation, Italian domain labels, Blob persistence/downloadability, and cleanup passed against production runtime secrets and production Neon.

## Primary Workflow Matrix

| Area | Routes | Status | Data Source | Empty/Demo State | Locale | Auth/Permissions | Gaps To Close |
|---|---|---:|---|---|---|---|---|
| App shell | `/(app)/layout` | partial | Clerk org + organisation query + saved Trust Center slug | Demo org name if Clerk disabled | Tenant locale when DB available | Central Clerk redirect when configured | Confirm production never runs with Clerk disabled; header Trust Center link now uses the saved org slug when present and falls back to `/trust/demo` only without a slug. |
| Onboarding | `/onboarding` | partial | `getOnboardingState`, framework/tool libraries | Defaults to CZ/NIS2 when no state | Uses wizard initial locale from org/default | Layout handles auth | Production runtime verification covered equivalent persisted IT tenant setup; browser UX can still be polished separately. |
| Framework index | `/frameworks` | partial | `org_frameworks` plus `FRAMEWORK_LIBRARY` available-to-enroll section | Empty enrolled state when no framework is active | Uses tenant/request locale | Layout handles auth | Plan-limit messaging still needs product decision; setup flow still needs separate runtime review. |
| Framework setup | `/frameworks/[frameworkSlug]/setup` | partial | Needs separate runtime review | Unknown from this pass | Expected localized copy | Layout handles auth | Audit setup actions and persistence before relying on it for onboarding. |
| Framework detail/report | `/frameworks/[frameworkSlug]` | partial | `getFrameworkDetail`; local-only library fallback | No fallback controls unless `ENABLE_LOCAL_DEMO_DATA=true` outside production | Mostly localized framework copy | Layout handles auth | Report generation blocked by `BLOB_READ_WRITE_TOKEN` and org framework row; org-awareness work should add a stronger non-enrolled state. |
| Controls index | `/controls` | partial | Enrolled framework mappings + `org_control_statuses`; library shown separately | Empty in-scope state when no framework is active | Uses tenant/request locale with locale-keyed control labels | Layout handles auth | Control status smoke confirms org B updates the shared global control key without changing org A's status row. |
| Control detail | `/controls/[controlId]` | partial | `getControlDetailByKey`; falls back to static control | Forms disabled without DB detail | Uses tenant locale with locale-keyed control labels | Layout handles auth; download/action lookups are org-scoped | Evidence upload still needs Blob token for runtime use; org-boundary smoke covers download ownership lookup and control-status isolation. |
| Evidence vault | `/evidence` | partial | `listEvidenceVault` | Empty list when no DB/session/error | Tenant/request locale with localized control/framework labels | Layout handles auth | Production runtime verification covered evidence persistence, Italian labels, and private Blob downloadability. |
| Policies index | `/policies` | partial | `listPoliciesForOrg`, resolved templates/source docs | Templates render even with no generated policies | Uses jurisdiction context | Layout handles auth | Italian policy templates are still `draft`; IT tenants intentionally resolve customer-usable families to reviewed EU English fallback until legal review promotes them. Generation blocked by Blob token. |
| Policy detail | `/policies/[type]` | partial | Resolved template + org policies | Template renders with no generated versions | Uses jurisdiction context | Layout handles auth | Italian policy templates are still `draft`; detail uses reviewed EU English fallback for IT until legal review promotion. Verify source document fallback behavior before customer demos. |
| Gap/report output | `/frameworks/[frameworkSlug]`, policy APIs | partial | Generated artifact/blob routes | Buttons disabled without env/org rows | Mixed | Layout/API auth must be checked | Production runtime verification generated and downloaded policy and NIS2 gap report PDFs with real org data. |

## Secondary App Surface Matrix

| Area | Routes | Status | Data Source | Empty/Demo State | Locale | Auth/Permissions | Gaps To Close |
|---|---|---:|---|---|---|---|---|
| Dashboard | `/dashboard` | partial | `getDashboardData`; local-only fallback scores/updates | No fabricated fallback unless `ENABLE_LOCAL_DEMO_DATA=true` outside production | Mostly localized | Layout handles auth | Verify regulation update read action and no draft citations leak. |
| Integrations hub | `/integrations` | partial | `getIntegrationsHubData`; provider config | Provider cards without DB; Google Workspace is disabled as coming soon | Localized descriptions | Layout handles auth | Planned Google Workspace detail route exists with a coming-soon state; provider status labels are English technical labels by design. |
| Integration detail | `/integrations/microsoft365`, `/github`, `/aws`, `/[provider]` | partial | Integration connection rows + static test definitions | Unsupported Google route returns planned state; unsupported manual run providers reject | Expected localized | Layout handles auth; OAuth callbacks require active Clerk org to match OAuth state | Production OAuth credentials, disconnect behavior, and provider test-run results still need provider-configured runtime smoke. |
| Vendors | `/vendors` | partial | `listVendorsForOrg`; local-only demo cloud provider fallback | Empty/unavailable state unless `ENABLE_LOCAL_DEMO_DATA=true` outside production | Localized page copy | Layout handles auth; mutations disabled without live data | Category option values are raw English values; export endpoint auth still needs separate secondary-surface pass. |
| Vendor detail | `/vendors/[vendorId]` | partial | `getVendorDetail`; demo only for `demo-cloud` | Demo detail read-only | Localized page copy | Org-scoped query; assessment/questionnaire writes now reject mismatched vendor ownership | Email questionnaire deliverability still needs production email smoke. |
| Risks | `/risks` | partial | `listRiskItemsForOrg`; local-only common SME risks fallback | Empty/unavailable state unless `ENABLE_LOCAL_DEMO_DATA=true` outside production | Localized | Mutations disabled without live data | Export endpoint auth needs smoke test. |
| Incidents | `/incidents` | partial | `listIncidentsForOrg`, `getIncidentForOrg`; local-only demo incident fallback | Empty/unavailable state unless `ENABLE_LOCAL_DEMO_DATA=true` outside production | Localized | Mutations disabled without live data; status/report writes reject mismatched incident ownership | Incident notification outputs need jurisdiction-specific smoke tests before customer use. |
| Questionnaires | `/questionnaires` | partial | Compliance context + generated artifacts | Demo metrics if no DB; AI disabled unless configured | Localized page copy | Layout handles auth; action sanitizes AI references against reviewed context before persistence | Provider-configured runtime generation and evidence-save flow still need smoke tests. |
| Team hub | `/team` | partial | Static module cards | Role assignments/training are explicit coming-soon cards, not self-links | Localized | Layout handles auth | Role assignments and training log remain product gaps, but are no longer presented as active modules. |
| Access reviews | `/team/access-reviews` | partial | `listAccessReviewsForOrg`, `getAccessReviewDetail`; demo review fallback | Read-only demo access review | Localized | Mutations disabled in demo; decision/completion writes reject mismatched review ownership | Export UX remains secondary-surface scope. |
| Clients | `/clients` | partial | Consultant client query; demo clients fallback | Locked/demo cards for non-consultant/no DB | Localized | Plan-gated for consultant | Demo clients are useful but can confuse readiness; linking clients requires real org IDs. |
| Client detail | `/clients/[clientOrgId]` | partial | Consultant client detail; demo only for demo IDs | Demo read-only | Localized | Plan-gated for consultant; visibility and branding mutation are org-boundary smoked | Demo clients are still secondary-surface shaping work for non-consultant/no-DB modes. |
| Trust Center admin | `/trust-center` | partial | `getTrustCenterSettings`; local-only fallback demo frameworks | Empty/unavailable state unless `ENABLE_LOCAL_DEMO_DATA=true` outside production | Localized | Layout handles auth | Public URL no longer defaults to `/trust/demo`; ensure saved slug, visibility toggles, and framework detail flags match public route behavior. |
| Organisation settings | `/settings/organisation` | partial | Organisation query; fallback demo org | Demo read-only | Uses stored locale | Layout handles auth | Country list includes DE even though no German marketing strategy; verify OSVČ/legal identifier labels by jurisdiction. |
| Billing settings | `/settings/billing` | partial | Organisation + Stripe env | No demo list, buttons disabled without Stripe | Localized; EUR for EN/IT, CZK for CS | Layout handles auth | Missing-config page and local webhook entitlement smoke are verified in `docs/billing-stripe-runtime-audit.md`; real Stripe checkout/portal/test-card flow still needs Stripe test keys and authenticated org smoke. |
| Audit log | `/settings/audit-log` | partial | `listAuditLogs` | Empty list when no DB/session/error | Localized | Layout handles auth; export query is org-scoped and smoked | Pagination/limit behavior still needs secondary-surface verification. |

## Immediate Fix Queue

1. **Authenticated production tenant smoke.** Sign in with a real production test tenant and verify `/evidence`, `/questionnaires`, and the questionnaire workbench/save flow render without browser console errors. Current 2026-05-09 smoke only proves signed-out redirects and Clerk sign-in rendering.
2. **Secondary-surface hardening.** Continue with provider-configured integration runtime smokes, questionnaire provider runtime/evidence-save checks, and audit export pagination/limit checks.
3. **Outreach decision prep.** Treat the primary workflow as previously verified for outreach planning, while keeping authenticated questionnaire workbench, Italian policy-template promotion, and legal identity closeout out of demo claims until completed.

## Verification Needed Next

- Authenticated production tenant smoke for `/evidence`, `/questionnaires`, and the questionnaire workbench/save flow. The 2026-05-09 browser pass only verified signed-out redirects to Clerk sign-in with zero console errors.
- Provider-configured integration runtime smokes for Microsoft 365, GitHub, and AWS when production credentials are available.
- Questionnaire provider runtime generation and evidence-save smoke; current status is documented in `docs/questionnaire-flow-audit.md`.
- Audit/vendor/risk/incident export status is documented in `docs/export-endpoint-audit.md`; remaining work is authenticated real-tenant export smokes and large audit-page verification.
- Legal review and promotion decision for Italian policy templates.
- Legal identity/public legal-page closeout when the real operator details are supplied.
