# Plan entitlement matrix

Last updated: 2026-06-02

Runtime source: `lib/stripe/plans.ts`

This is the current internal plan and entitlement alignment source for Splnit.eu. It mirrors the runtime Free/SME/Agency model only. Business, Starter, and Consultant are legacy aliases only, not public plan names. Do not use this document to change runtime offers; if runtime pricing or limits change, update `lib/stripe/plans.ts` first and then update this matrix and the T4-E source smoke.

## Runtime plan limits

| Plan | Runtime key | Price | Runtime limits |
| --- | --- | --- | --- |
| Free | `free` | 0 Kč | clients=0; frameworks=1; integrations=1; users=1 |
| SME | `sme` | 490 Kč/měsíc | clients=1; frameworks=999; integrations=999; users=25 |
| Agency | `agency` | 1 990 Kč/měsíc | clients=20; frameworks=999; integrations=999; users=999 |

Notes:

- SME and Agency are the only billable runtime plans (`BILLABLE_PLANS`).
- Runtime aliases remain for compatibility only: `business` and `starter` normalize to `sme`; `consultant` normalizes to `agency`.
- The large `999` limits are runtime unlimited-style caps. Do not replace them with old Business-era 5-framework / 10-integration limits.
- Prices above are display prices from `PLANS`; Stripe Price IDs remain environment variables and are not listed here.

## Public plan vocabulary

Public pricing pages, billing copy, and locale messages should use these public names:

| Public name | Use |
| --- | --- |
| Free | Free orientation / first workspace entry point. |
| SME | Paid workspace for one organisation. |
| Agency | Paid agency/client-management workspace. |

Disallowed as public plan names: legacy alias names listed above. They may appear only in explicit migration/archive/audit contexts.

## Buyer-proof/report/export entitlement surfaces

This section records current source-level enforcement. It is not a product decision to make every buyer-proof route paid or Agency-only. Where the current source is auth/org scoped but not subscription gated, that is documented as the current implementation until a separate approved entitlement decision changes runtime gates.

| Surface | Route/API/action | Current source enforcement | Required plan today | T4-E note |
| --- | --- | --- | --- | --- |
| compliance report | `app/api/export/compliance-report/route.ts` | Clerk user/org auth, same-org `orgId` check, `requireActiveSubscription(orgId)`, 402 `subscription_required`, private no-store PDF response. | Active paid subscription (SME or Agency). | Source-smoked as explicit subscription gate. |
| workspace JSON export | `app/api/exports/workspace/route.ts` | Clerk user/org auth, current-org `getWorkspaceExport(session.orgId)`, private no-store JSON response. | Authenticated org workspace; no explicit subscription gate in this route. | T4-F source-smoked for auth/org/private JSON boundary. |
| workspace archive | `app/api/exports/workspace/archive/route.ts` | Clerk user/org auth, current-org `getWorkspaceExport(session.orgId)`, current-org evidence/policy archive queries, private no-store ZIP response. | Authenticated org workspace; no explicit subscription gate in this route. | Source-smoked as buyer-proof export with org scoping; no runtime gate changed. |
| evidence metadata export | `app/api/exports/evidence-metadata/route.ts` | Clerk user/org auth, organisation existence check, current-org `listEvidenceMetadataForExport(session.orgId)`, private no-store CSV response. | Authenticated org workspace; no explicit subscription gate in this route. | Source-smoked as buyer-proof export with org scoping; no runtime gate changed. |
| audit log export | `app/api/audit-log/export/route.ts` | Clerk user/org auth, `MAX_AUDIT_LOG_EXPORT_LIMIT`, cursor/date validation, current-org audit-log query, private no-store CSV response. | Authenticated org workspace; no explicit subscription gate in this route. | Source-smoked as buyer-proof export with org scoping and cap. |
| vendor risk report | `app/api/vendors/supply-chain-report/route.ts` | Clerk user/org auth, current-org `listVendorsForOrg(session.orgId)`, private no-store PDF response. Vendor-submitted answers are labelled as vendor-reported/manual-review input, not certification or automatic pass evidence. | Authenticated org workspace; no explicit subscription gate in this route. | Source-smoked as buyer-proof report with org scoping. |
| risk register report | `app/api/risks/register-report/route.ts` | Clerk user/org auth, current-org `listRiskItemsForOrg(session.orgId)`, private no-store PDF response. | Authenticated org workspace; no explicit subscription gate in this route. | Source-smoked as buyer-proof report with org scoping. |
| incident report exports | `app/api/incidents/[incidentId]/*-report/route.ts` | Clerk user/org auth through shared incident report handler, current-org incident lookup, private no-store PDF response. | Authenticated org workspace; no explicit subscription gate in these routes. | T4-F source-smoked for auth/org/private headers/content type; legal authority-submission finality is not claimed. |
| access review CSV export | `app/api/access-reviews/[reviewId]/export/route.ts` | Clerk user/org auth, current-org access review lookup, private no-store CSV response. | Authenticated org workspace; no explicit subscription gate in this route. | T4-F source-smoked for auth/org/private headers/content type. |
| policy download | `app/api/policies/[policyId]/download/route.ts` | Clerk user/org auth, current-org policy lookup, private Blob download with no-store attachment response. | Authenticated org workspace; no explicit subscription gate in this route. | T4-F source-smoked for auth/org/private headers/attachment boundary. |
| evidence download | `app/api/evidence/[evidenceId]/download/route.ts` | Clerk user/org auth, current-org evidence lookup, private Blob download with no-store attachment response. | Authenticated org workspace; no explicit subscription gate in this route. | T4-F source-smoked for auth/org/private headers/attachment boundary. |
| ISO 27001 package | `app/api/frameworks/iso27001/certification-package/route.ts` | Clerk user/org auth, current-org ISO package data, private no-store ZIP response. Name is operational; it must not be used as a public certification claim. | Authenticated org workspace; no explicit subscription gate in this route. | T4-F source-smoked for auth/org/private ZIP boundary and no public certification overclaim. |
| smart document XLSX | `app/api/documents/generate/[type]/route.ts` | Clerk user/org auth, feature flag/database checks, current-org gap/SoA/vendor data, private no-store XLSX response. | Authenticated org workspace; no explicit subscription gate beyond feature flag/database availability in this route. | T4-F source-smoked for auth/org/private XLSX boundary. |
| questionnaire PDF export | `app/api/questionnaires/export/pdf/route.ts` | Clerk user/org auth, current-org generated artifact lookup, questionnaire export eligibility review gate, private no-store PDF response. | Authenticated org workspace; no explicit subscription gate in this route. | Source-smoked as buyer-proof export with org scoping/review gate. |
| questionnaire XLSX export | `app/api/questionnaires/export/xlsx/route.ts` | Clerk user/org auth, current-org generated artifact lookup, questionnaire export eligibility review gate, private no-store XLSX response. | Authenticated org workspace; no explicit subscription gate in this route. | Source-smoked as buyer-proof export with org scoping/review gate. |
| agency layout | `app/(app)/agency/layout.tsx` | Authenticated user, agency membership lookup, `requireActiveSubscription`, redirect unless subscribed Agency plan. | Agency. | Source-smoked as Agency gate. |
| client create action | `app/(app)/clients/actions.ts` | Authenticated user/org, organisation lookup, `requirePlan(organisation?.plan, "agency")` before client linking/branding actions. | Agency. | Source-smoked as Agency gate. |

## Stripe webhook idempotency plan

Current status: Stripe webhook signature verification and event dispatch are implemented in `app/api/webhooks/stripe/route.ts`. No durable event-id ledger is implemented in this tranche. No Stripe live/test API was called for T4-E.

Required future implementation plan, keyed by Stripe event id:

1. Add a durable local table or equivalent persistent store keyed by Stripe event id, with event type, received timestamp, processing status, and optional error metadata.
2. At webhook entry after signature verification, attempt to insert the Stripe event id before side effects. If it already exists as processed, return `{ ok: true }` without repeating emails or other side effects.
3. Wrap state updates and side-effect markers so subscription sync, cancellation email, invoice receipt email, revalidation, and agency provisioning remain exactly-once under Stripe retries.
4. Add a source/runtime smoke that posts the same signed test fixture twice in a local/disposable environment and proves side-effect counters run once. This must not call Stripe APIs.
5. Treat schema migration, production rollout, and any backfill as a separate approved tranche.

## Verification

T4-E source-only verification command:

```sh
npm run smoke:t4e-plan-entitlements-source
```

The smoke checks:

- this matrix exists and matches `PLANS` names, display prices, and limits;
- the archived Business-era matrix points here;
- public billing/pricing locale copy uses Free/SME/Agency names;
- buyer-proof/report/export route sources match the enforcement documented above;
- Stripe webhook idempotency is documented as event-id keyed future work when implementation is out of scope.
