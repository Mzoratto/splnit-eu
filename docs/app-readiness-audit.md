# App Readiness Audit

Last updated: 2026-05-06

Purpose: identify the authenticated app gaps that must be closed before new product features or broader outreach. This is a static route/code audit, not a browser or production database verification run.

## Current Conclusion

Primary workflow readiness is closed for the current outreach decision. A temporary token-gated Vercel production verification route passed on 2026-05-06 against production Neon, live Clerk, the Clerk custom domain, and Vercel Blob, then cleaned up its temporary user, organization, rows, and blobs. Live Clerk Organizations were enabled during this pass with a five-member default limit.

No critical unknowns remain for `dashboard -> controls -> frameworks -> evidence -> policies -> gap report`. Remaining gaps are secondary-surface hardening or product-shaping work, except the separately tracked legal identity closeout and Italian policy-template legal review.

## Scope

Audited authenticated routes under `app/(app)` and shared app shell behavior. Public marketing pages, API route internals, and external vendor-assessment links are out of scope for this pass except where they affect the primary customer workflow.

Readiness statuses:

- `ready`: production-shaped path with real org-scoped data and usable empty states.
- `partial`: useful implementation exists, but known production gaps remain.
- `demo-risk`: route can show fallback/demo/static data that may hide missing production data.
- `blocked`: cannot be considered production-ready until a named external dependency is resolved.

## Cross-Cutting Findings

1. **Auth is centralized.** `app/(app)/layout.tsx` redirects to `/sign-in` when Clerk is configured and no `userId` or `orgId` exists. When Clerk is not configured, app pages render in demo mode.
2. **Demo fallback is common.** Several routes render demo/static data when Clerk or `DATABASE_URL` is unavailable. This is useful for local development but must be obvious in production checks.
3. **Locale is uneven outside the primary flow.** Primary controls/framework/evidence surfaces now use tenant locale or tenant-aware fallbacks for UI and domain labels. Billing now uses localized copy and EUR for `it-IT`/`en-EU`, CZK for `cs-CZ`; remaining locale gaps are on secondary surfaces.
4. **Mutations are generally disabled without real data.** Many pages set `canMutate=false` when using demo data. This is good, but action-level authorization still needs a separate smoke pass.
5. **Primary flow production parity is verified.** Onboarding-equivalent tenant setup, framework enrollment, controls, evidence, policies, report generation, Italian domain labels, Blob persistence/downloadability, and cleanup passed against production runtime secrets and production Neon.

## Primary Workflow Matrix

| Area | Routes | Status | Data Source | Empty/Demo State | Locale | Auth/Permissions | Gaps To Close |
|---|---|---:|---|---|---|---|---|
| App shell | `/(app)/layout` | partial | Clerk org + organisation query + saved Trust Center slug | Demo org name if Clerk disabled | Tenant locale when DB available | Central Clerk redirect when configured | Confirm production never runs with Clerk disabled; header Trust Center link now uses the saved org slug when present and falls back to `/trust/demo` only without a slug. |
| Onboarding | `/onboarding` | partial | `getOnboardingState`, framework/tool libraries | Defaults to CZ/NIS2 when no state | Uses wizard initial locale from org/default | Layout handles auth | Production runtime verification covered equivalent persisted IT tenant setup; browser UX can still be polished separately. |
| Framework index | `/frameworks` | demo-risk | Static `FRAMEWORK_LIBRARY` | Always renders all frameworks | Uses tenant locale when DB/auth is available | Layout handles auth | Does not reflect tenant enrolled frameworks or plan limits. |
| Framework setup | `/frameworks/[frameworkSlug]/setup` | partial | Needs separate runtime review | Unknown from this pass | Expected localized copy | Layout handles auth | Audit setup actions and persistence before relying on it for onboarding. |
| Framework detail/report | `/frameworks/[frameworkSlug]` | partial | `getFrameworkDetail`; falls back to library mappings | Fallback controls when no DB/detail | Mostly localized framework copy | Layout handles auth | Fallback exposes control-level mappings even without enrolled org data; report generation blocked by `BLOB_READ_WRITE_TOKEN` and org framework row. |
| Controls index | `/controls` | demo-risk | Static `CONTROL_LIBRARY` | Always renders library controls | Uses tenant locale with locale-keyed control labels | Layout handles auth | Not org-scoped; not status-aware. |
| Control detail | `/controls/[controlId]` | partial | `getControlDetailByKey`; falls back to static control | Forms disabled without DB detail | Uses tenant locale with locale-keyed control labels | Layout handles auth; actions need separate review | Evidence upload blocked without Blob token; verify action-level org checks. |
| Evidence vault | `/evidence` | partial | `listEvidenceVault` | Empty list when no DB/session/error | Tenant/request locale with localized control/framework labels | Layout handles auth | Production runtime verification covered evidence persistence, Italian labels, and private Blob downloadability. |
| Policies index | `/policies` | partial | `listPoliciesForOrg`, resolved templates/source docs | Templates render even with no generated policies | Uses jurisdiction context | Layout handles auth | Italian policy templates are still `draft`; IT tenants intentionally resolve customer-usable families to reviewed EU English fallback until legal review promotes them. Generation blocked by Blob token. |
| Policy detail | `/policies/[type]` | partial | Resolved template + org policies | Template renders with no generated versions | Uses jurisdiction context | Layout handles auth | Italian policy templates are still `draft`; detail uses reviewed EU English fallback for IT until legal review promotion. Verify source document fallback behavior before customer demos. |
| Gap/report output | `/frameworks/[frameworkSlug]`, policy APIs | partial | Generated artifact/blob routes | Buttons disabled without env/org rows | Mixed | Layout/API auth must be checked | Production runtime verification generated and downloaded policy and NIS2 gap report PDFs with real org data. |

## Secondary App Surface Matrix

| Area | Routes | Status | Data Source | Empty/Demo State | Locale | Auth/Permissions | Gaps To Close |
|---|---|---:|---|---|---|---|---|
| Dashboard | `/dashboard` | partial | `getDashboardData`; fallback scores/updates | Demo updates and scores on missing DB | Mostly localized | Layout handles auth | Fallback can mask missing production data; verify regulation update read action and no draft citations leak. |
| Integrations hub | `/integrations` | partial | `getIntegrationsHubData`; provider config | Provider cards without DB; Google Workspace is disabled as coming soon | Localized descriptions | Layout handles auth | Planned Google Workspace detail route exists with a coming-soon state; provider status labels are English technical labels by design. |
| Integration detail | `/integrations/microsoft365`, `/github`, `/aws`, `/[provider]` | partial | Needs separate runtime review | Unknown from this pass | Expected localized | Layout handles auth | Verify OAuth callback, disconnect, test run status, and unsupported provider behavior. |
| Vendors | `/vendors` | partial | `listVendorsForOrg`; demo cloud provider fallback | Demo vendor row when DB missing | Localized page copy | Layout handles auth; mutations disabled in demo | Category option values are raw English values; export endpoint auth needs smoke test. |
| Vendor detail | `/vendors/[vendorId]` | partial | `getVendorDetail`; demo only for `demo-cloud` | Demo detail read-only | Localized page copy | Org-scoped query | Email questionnaire/send action needs authorization and deliverability check. |
| Risks | `/risks` | demo-risk | `listRiskItemsForOrg`; common SME risks fallback | Demo risk register when DB missing | Localized | Mutations disabled in demo | Common risks can look real; production readiness needs a clear demo indicator or no fallback in prod. |
| Incidents | `/incidents` | demo-risk | `listIncidentsForOrg`, `getIncidentForOrg`; demo incident fallback | Demo active incident when DB missing | Localized | Mutations disabled in demo | Incident notification outputs need jurisdiction-specific smoke tests before customer use. |
| Questionnaires | `/questionnaires` | partial | Compliance context + generated artifacts | Demo metrics if no DB; AI disabled unless configured | Localized page copy | Layout handles auth | Customer-facing AI must cite reviewed sources only; OpenAI config and evidence-save flow need smoke tests. |
| Team hub | `/team` | demo-risk | Static module cards | Role assignments/training cards loop back to `/team` | Localized | Layout handles auth | Role assignments and training log are not real modules yet; hide or mark as coming soon if public beta. |
| Access reviews | `/team/access-reviews` | partial | `listAccessReviewsForOrg`, `getAccessReviewDetail`; demo review fallback | Read-only demo access review | Localized | Mutations disabled in demo | Export and decision actions need org-boundary smoke tests. |
| Clients | `/clients` | partial | Consultant client query; demo clients fallback | Locked/demo cards for non-consultant/no DB | Localized | Plan-gated for consultant | Demo clients are useful but can confuse readiness; linking clients requires real org IDs. |
| Client detail | `/clients/[clientOrgId]` | partial | Consultant client detail; demo only for demo IDs | Demo read-only | Localized | Plan-gated for consultant | Branding mutation and client visibility need org-boundary tests. |
| Trust Center admin | `/trust-center` | partial | `getTrustCenterSettings`; fallback demo frameworks | Settings disabled without DB | Localized except hardcoded eyebrow | Layout handles auth | Public URL defaults to `/trust/demo`; ensure saved slug, visibility toggles, and framework detail flags match public route behavior. |
| Organisation settings | `/settings/organisation` | partial | Organisation query; fallback demo org | Demo read-only | Uses stored locale | Layout handles auth | Country list includes DE even though no German marketing strategy; verify OSVČ/legal identifier labels by jurisdiction. |
| Billing settings | `/settings/billing` | partial | Organisation + Stripe env | No demo list, buttons disabled without Stripe | Localized; EUR for EN/IT, CZK for CS | Layout handles auth | Portal/checkout actions still need production Stripe smoke test. |
| Audit log | `/settings/audit-log` | partial | `listAuditLogs` | Empty list when no DB/session/error | Localized | Layout handles auth | Export route needs org-boundary and pagination/limit verification. |

## Immediate Fix Queue

1. **Remove misleading production fallbacks from readiness-critical pages or add explicit demo-mode banners.** Highest risk pages: dashboard, risks, incidents, framework detail, vendors, Trust Center admin.
2. **Make framework/controls pages org-aware.** Index pages should distinguish available library content from enrolled tenant scope and control status.
3. **Run action-level authorization smoke tests.** Prioritize control status update, evidence upload/download, policy generation/download, vendor assessment, incident reports, access review decisions, audit export.
4. **Primary-flow verification follow-up.** Browser-level UX regression coverage remains useful, but the production runtime verification has cleared the critical outreach readiness unknown.

## Verification Needed Next

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Browser check at desktop and 375px mobile for the primary flow.
- Database check against production target: migrations, organisations, frameworks, controls, source documents, review queue, generated artifacts.
- Citation safety checks: `npm run smoke:draft-extraction-sources`, `npm run smoke:reviewed-article-links`, `npm run smoke:automated-evidence-citations`.
