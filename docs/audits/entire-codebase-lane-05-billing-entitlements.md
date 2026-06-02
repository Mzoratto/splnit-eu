# Entire Codebase Audit — Lane 05: Billing, Stripe, Entitlements, Plan Gates, Paid Readiness

Date: 2026-06-02
Repo: `/Users/marcozoratto/splnit.eu`
Lane status: PARTIAL
Auditor: Hermes orchestrator direct audit, after two subagent Lane 05 dispatch attempts failed before starting with provider 401.

## Scope

This lane audited pricing, Stripe checkout/portal/webhook handling, subscription state, entitlement helpers, plan-gate bypass behavior, agency-plan restrictions, report/export gates, and docs/public pricing alignment.

No implementation was performed. No commit, push, deploy, production DB write, production Blob operation, or live Stripe action was performed.

## Files and directories inspected

Primary files:

- `lib/stripe/plans.ts`
- `lib/stripe/subscriptions.ts`
- `lib/stripe/billing.ts`
- `lib/stripe/actions.ts`
- `lib/stripe/session-params.ts`
- `lib/stripe/client.ts`
- `app/api/webhooks/stripe/route.ts`
- `app/(app)/settings/billing/page.tsx`
- `app/(app)/settings/billing/actions.ts`
- `app/(app)/agency/layout.tsx`
- `app/(marketing)/pricing/page.tsx`
- `app/(marketing)/cenik/page.tsx`
- `components/marketing/pricing-widgets.tsx`
- `lib/marketing/pricing.ts`
- `docs/product/business-entitlement-matrix.md`
- `scripts/smoke-plan-gate-enforcement.ts`
- `scripts/smoke-plan-gate-bypass.ts`
- `scripts/smoke-stripe-billing-runtime.ts`
- `scripts/smoke-stripe-upgrade-flow.ts`
- `scripts/smoke-stripe-invoice-email.ts`

Searches also inspected plan-gate call sites across `app/`, `components/`, `lib/`, and `scripts/`.

## Commands run

Safe local commands only:

| Command | Result | Notes |
| --- | --- | --- |
| `npm run smoke:plan-gate-enforcement` | PASS | Confirms production disables test bypass and grace-period bypass. |
| `npm run smoke:plan-gate-bypass` | PASS | Confirms bypass works only in test/test-route mode and is disabled in production. |

Not run in this lane:

| Command | Status | Reason |
| --- | --- | --- |
| `npm run smoke:stripe-billing` | BLOCKED | T0 classified as env/prod-sensitive. It can exercise DB/webhook/payment paths and should run only in a clean local DB or explicitly approved test Stripe environment. |
| `npm run smoke:stripe-upgrade-flow` | BLOCKED | Same reason. |
| `npm run smoke:stripe-invoice-email` | BLOCKED | Same reason plus email side-effect sensitivity. |

T0 already recorded those three Stripe smokes as blocked.

## Classification summary

| Area | Status | Evidence |
| --- | --- | --- |
| Runtime plan model | Implemented with caveats | `PLANS` defines `free`, `sme`, `agency`; legacy aliases map `business`/`starter` to `sme`, `consultant` to `agency`. |
| Plan-gate bypass safety | Implemented | Safe smokes passed; `planGateBypassIsEnabled()` returns false in production. |
| Billing settings UI | Implemented | `/settings/billing` shows active subscription, portal, and checkout cards for SME/Agency when Stripe is configured. |
| Stripe checkout creation | Implemented with caveats | Auth/org required; metadata includes org/user/email/plan; no live Stripe test run in this lane. |
| Stripe portal session | Implemented with caveats | Requires Stripe customer from subscription or organisation. |
| Stripe webhook handling | Implemented with caveats | Signature verified; handles checkout, subscription create/update/delete, invoice failure/success; no event idempotency table observed. |
| Subscription DB sync | Implemented with caveats | Upsert by `clerkOrgId`; status updates by customer/subscription id. |
| Agency subscription provisioning | Partial | Agency row/member can be created for agency subscription, but client limits/seat limits are not broadly enforced across all claimed surfaces. |
| Feature entitlements across app | Partial | Agency layout gates agency section; many buyer-proof/report/export surfaces appear auth/org-scoped but not consistently plan-gated. |
| Public pricing/docs alignment | Partial | Runtime has SME/Agency; older entitlement doc still speaks in Business vocabulary and stale limits/proof dates. |
| Paid launch readiness | Blocked pending human approval | Requires explicit live/test Stripe proof, legal/refund/liability approval, and entitlement-doc reconciliation. |

## Key findings

### P0/P1 — Runtime plans changed to SME/Agency, but entitlement docs still carry Business-era assumptions

Evidence:

- `lib/stripe/plans.ts` canonical runtime plans:
  - `free`: 0 Kč, 1 framework, 1 integration, 1 user.
  - `sme`: 490 Kč/měsíc, 1 client, 999 frameworks, 999 integrations, 25 users.
  - `agency`: 1 990 Kč/měsíc, 20 clients, 999 frameworks, 999 integrations, 999 users.
- `docs/product/business-entitlement-matrix.md` still describes a Business plan with limits/features such as 5 frameworks, 10 integrations, 25 users, 50 vendors, and many Business-era claims.
- Legacy aliases map `business` and `starter` to `sme`, and `consultant` to `agency`, but that is runtime compatibility, not a current public/docs truth source.

Risk:

- Sales/founder/support answers can drift from runtime gates.
- Public pricing can say SME/Agency while internal docs still guide Business-era claims.
- Implementation plans for entitlement gates may target the wrong plan names or limits.

Recommendation:

- Create a new current entitlement matrix for `free`/`sme`/`agency` and either archive or clearly mark `business-entitlement-matrix.md` as historical.
- Use `lib/stripe/plans.ts` as the runtime truth source and public pricing/messages as the public claim source.
- Do not claim Business plan availability unless deliberately reintroduced.

Implementation plan needed:

- Docs-only first: reconcile `docs/product/business-entitlement-matrix.md` or replace with `docs/product/plan-entitlement-matrix.md`.
- Then code audit: ensure app gates and public copy refer to SME/Agency consistently.
- Human approval required for plan/package naming and paid sales claims.

### P1 — Plan gates are centralized but not consistently applied to buyer-proof/report/export surfaces

Evidence:

- Gate helpers exist in `lib/stripe/plans.ts` and `lib/stripe/subscriptions.ts`:
  - `hasPlanAccess`
  - `requirePlan`
  - `orgHasPlan`
  - `orgIsSubscribed`
  - `requireActiveSubscription`
- `app/(app)/agency/layout.tsx` redirects non-agency orgs to `/settings/billing?required=agency`.
- Search found strong gate usage around agency surfaces and smokes, but many report/export/proof surfaces are primarily auth/org scoped rather than clearly plan gated.
- Lane 06 independently found plan gates inconsistent across buyer-proof exports beyond compliance report / smart-document flag path.

Risk:

- Paid value surfaces may remain reachable on Free/SME where product wants them Agency-only, or vice versa.
- Buyer-proof/export functionality can be hard to sell reliably if entitlement behavior is not explicit.

Recommendation:

- Build an entitlement surface matrix: each route/API/action/export/report → required plan → current enforcement → source of truth.
- Add source-only and runtime smokes for at least:
  - compliance report
  - workspace archive
  - evidence metadata export
  - audit log export
  - vendor/risk reports
  - questionnaire exports
  - Trust Center publish/request/approved access flows
  - agency/client management
- Human approval needed for which surfaces belong to Free/SME/Agency.

### P1 — Stripe webhook has good signature/event coverage but no durable event-id idempotency ledger observed

Evidence:

- `app/api/webhooks/stripe/route.ts` verifies the Stripe signature using raw body and `STRIPE_WEBHOOK_SECRET`.
- It handles:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
  - `invoice.payment_succeeded`
- Subscription upserts are idempotent at `clerkOrgId` level, and status updates target customer/subscription ids.
- No durable `stripe_events`/webhook event id table was found in inspected files.

Risk:

- Retried Stripe events can repeat side effects such as emails or revalidation.
- Webhook idempotency depends on upsert semantics for DB state but not for side-effectful email sends.

Recommendation:

- Add a durable webhook-event processing table or equivalent idempotency guard keyed by Stripe event id.
- Make state changes and outbound emails idempotent under retries.
- Add RED/GREEN smoke that posts the same signed event twice and proves exactly-once side effects.

Rollback/backfill:

- No existing-data backfill needed for adding idempotency table, but migration requires standard production migration approval and drift gate.

### P1 — Paid launch still needs live/test Stripe proof before relying on subscription claims

Evidence:

- Safe plan-gate smokes passed in this lane.
- T0 blocked `smoke:stripe-billing`, `smoke:stripe-upgrade-flow`, and `smoke:stripe-invoice-email` as env/prod-sensitive.
- Checkout/portal/webhook code exists, but this lane did not run real Stripe test/live actions.

Risk:

- Local source checks can miss Stripe dashboard configuration, price-id mismatch, webhook endpoint mismatch, email delivery, VAT/tax invoice settings, or portal setup.

Recommendation:

- Run a separate approved Stripe test-mode proof lane, not as part of read-only codebase audit.
- Verify env price IDs are present by metadata only, never values.
- Verify checkout → webhook → subscription row → Clerk org metadata → billing UI → portal → cancellation/update flows.
- Verify invoice email path with a controlled test mailbox if buyer-critical.

Human approval:

- Required for any live-mode Stripe action.
- Required before public paid-launch claim.
- Required for terms/refund/liability decisions.

### P2 — Agency provisioning exists but limits/roles need a dedicated enforcement audit

Evidence:

- `syncSubscriptionToOrg()` provisions agency data for `agency` subscriptions through `upsertAgencyForSubscription()` and `recordAgencyConsultantMembership()`.
- `app/(app)/agency/layout.tsx` gates the agency section on `requireActiveSubscription()` and `plan === "agency"`.
- Billing settings displays `agencyClientCount` and `agencyClientLimit`.

Risk:

- Displaying client limits is not the same as preventing excess clients.
- Agency roles/memberships may be partially represented in Clerk/app DB but not exhaustively permission-smoked.

Recommendation:

- Add targeted agency entitlement smokes:
  - SME cannot access agency layout.
  - Agency can access agency layout.
  - Agency client limit is enforced at create/invite path, not only displayed.
  - Consultant membership role is created exactly once under webhook retry.

### P2 — Public pricing uses separate marketing data and must be checked against runtime plans after every pricing change

Evidence:

- Runtime pricing source is `lib/stripe/plans.ts`.
- Public pricing route `/pricing` redirects to `/cenik`; `/cenik` uses localized marketing widgets/data/messages.
- Public pricing cards are driven by `components/marketing/pricing-widgets.tsx`, `lib/marketing/pricing.ts`, and `messages/*`.

Risk:

- Display prices or plan names can drift from runtime Stripe price IDs and billing settings.

Recommendation:

- Add a source smoke that asserts public pricing card names/prices/plan keys match runtime `PLANS` or a documented mapping.
- The smoke should fail if `PLANS` changes without public pricing/docs review.

## Shared-file claims for conflict registry

| File/path | Claimed by Lane 05 | Other likely lanes | Reason | Owner recommendation |
| --- | --- | --- | --- | --- |
| `lib/stripe/plans.ts` | yes | Lane 06, Lane 08, Lane 10 | Runtime plan truth, public claim/docs alignment, smoke policy. | Lane 05 owner. |
| `lib/stripe/subscriptions.ts` | yes | Lane 03, Lane 08 | Subscription state and auth/org-boundary entitlements. | Lane 05 owner, Lane 03 reviewer. |
| `app/api/webhooks/stripe/route.ts` | yes | Lane 03, Lane 09 | Webhook auth/signature, side effects, observability. | Lane 05 owner, Lane 03/09 reviewers. |
| `app/(app)/settings/billing/page.tsx` | yes | Lane 07, Lane 10 | Billing UX/localization/accessibility. | Lane 05 owner for behavior, Lane 07/10 for copy/UX. |
| `app/(app)/agency/layout.tsx` | yes | Lane 03 | Agency access control and entitlement gate. | Lane 03 owner for auth boundary, Lane 05 owner for plan semantics. |
| `docs/product/business-entitlement-matrix.md` | yes | Lane 06, Lane 10 | Plan claims and public/support boundaries. | Lane 05 owner, human approval for claim changes. |
| `components/marketing/pricing-widgets.tsx` | yes | Lane 06, Lane 07, Lane 10 | Public pricing claims, accessibility, localization. | Lane 06 owner for public claims; Lane 05 owner for runtime alignment. |

If T3 cannot assign a clear owner for any of these files, escalate to human approval before writing an implementation plan for that file.

## Cross-lane dependencies

- Lane 03 must stay GREEN/PARTIAL-accepted before finalizing subscription/auth route changes.
- Lane 06 must approve public pricing/legal/paid claims before docs or public copy changes.
- Lane 07 must review billing/settings UI changes for accessibility and mobile layout.
- Lane 08 must own smoke taxonomy and CI safety for Stripe/plan-gate smokes.
- Lane 10 must review localized pricing and plan naming across `messages/*`.

## Recommended implementation slices

### Slice 05-A: Current plan entitlement matrix

Goal:

Create a current Free/SME/Agency entitlement truth source and retire or mark the Business matrix historical.

Likely files:

- `docs/product/business-entitlement-matrix.md`
- new `docs/product/plan-entitlement-matrix.md`
- `docs/README.md`
- `lib/stripe/plans.ts` only if runtime plan definitions need explicit metadata.

Validation:

- Source smoke to compare runtime plan names/prices/limits to doc matrix.
- Human approval for sales/legal wording.

### Slice 05-B: Buyer-proof entitlement gate matrix and smokes

Goal:

Make plan gates explicit for exports/reports/Trust Center/questionnaires/agency surfaces.

Likely files:

- report/export route handlers under `app/api/**`
- `lib/stripe/subscriptions.ts`
- new or updated `scripts/smoke-plan-gate-*`
- entitlement docs.

Validation:

- RED smoke: Free org reaches a gated buyer-proof route when it should not.
- GREEN smoke: route denies or redirects with expected status/URL.
- Agency/SME positive path smoke for intended plan.

Rollback:

- Feature flag or config mapping for stricter gates if needed.
- No data migration unless persistent entitlement records change.

### Slice 05-C: Stripe webhook durable idempotency

Goal:

Prevent duplicate side effects on webhook retries.

Likely files:

- `lib/db/schema.ts`
- new migration
- `app/api/webhooks/stripe/route.ts`
- `scripts/smoke-stripe-billing-runtime.ts` or new duplicate-event smoke.

Validation:

- RED: duplicate event sends duplicate email or repeats side effect.
- GREEN: duplicate event returns ok but side effects are once-only.

Human approval:

- Schema migration.
- Production migration window if deployed.

### Slice 05-D: Approved Stripe test-mode proof lane

Goal:

Prove checkout/portal/webhook/invoice flows with test-mode Stripe and controlled env.

Validation:

- clean worktree
- fresh `npm ci --prefer-offline --no-audit --no-fund`
- no inherited implementer env
- test-mode Stripe only unless explicitly approved
- record env presence/metadata only, never secret values
- controlled mailbox proof only if email delivery is in scope.

## Human approval items

- Public pricing and plan naming decisions.
- Any live-mode Stripe action.
- Any production DB migration or subscription backfill.
- Terms/refund/liability/legal paid-launch claims.
- Whether buyer-proof exports are Free, SME, or Agency features.

## Final Lane 05 verdict

PARTIAL.

The billing foundation is real: runtime plans exist, checkout/portal/webhook paths exist, subscription helpers are centralized, agency layout has a clear gate, and plan-gate bypass safety smokes pass.

The gaps are paid-readiness gaps rather than absence of code:

- current plan/docs matrix is stale around Business vs SME/Agency;
- buyer-proof entitlement gates need a surface-by-surface matrix;
- Stripe webhook side effects need durable event-id idempotency;
- live/test Stripe proof remains a separate approved lane;
- public paid claims require human/legal approval.
