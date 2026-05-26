# Tranche 12 Phase 0 Decision: Stripe Live Switch + Billing Hardening

Date: 2026-05-23
Status: Phase 2 code hardening implemented in sandbox; Phase 3 blocked until Phase 1 is complete and sandbox browser smoke is accepted.

## Decision

Do not swap production Stripe keys yet.

The codebase has the main Stripe subscription primitives: Checkout Session creation, Customer Portal session creation, signed webhook verification, subscription persistence, invoice receipt email handling, cancellation email handling, and a non-production-only plan-gate bypass.

The remaining blocker is operational, not a local code gap: complete Phase 1 in Stripe/Vercel, then run the sandbox and live checks before Phase 3/4.

## Current Stripe Integration

Primary files:

- `lib/stripe/client.ts` lazily creates the Stripe SDK client from `STRIPE_SECRET_KEY` and uses API version `2026-04-22.dahlia`.
- `lib/stripe/plans.ts` defines `free`, `sme`, and `agency`, maps billable plans to `STRIPE_SME_PRICE_ID` and `STRIPE_AGENCY_PRICE_ID`, and gates `TEST_BYPASS_PLAN_GATE`.
- `lib/stripe/actions.ts` creates Stripe Checkout Sessions with `mode: "subscription"` and creates Stripe Billing Portal Sessions.
- `lib/stripe/billing.ts` creates Stripe Customers, maps subscription prices to plans, syncs subscription state to organisations, Clerk metadata, and agency records.
- `lib/stripe/subscriptions.ts` persists subscription rows and exposes plan/subscription guard helpers.
- `app/api/webhooks/stripe/route.ts` verifies webhook signatures with `stripe.webhooks.constructEvent`.
- `app/(app)/settings/billing/page.tsx` is the self-service billing UI for Checkout and the Customer Portal.
- `app/(app)/agency/signup/actions.ts` starts an Agency checkout from inside the app.

The schema already includes `organisations.plan`, `organisations.stripeCustomerId`, `organisations.stripeSubscriptionId`, and the `subscriptions` table. No new migration is required for the Phase 0-known requirements.

## Current Plan Gates

Current gate call sites:

- `app/api/export/compliance-report/route.ts` calls `requireActiveSubscription()` before PDF report export.
- `app/(app)/agency/layout.tsx` checks `requireActiveSubscription()` for agencies that have `stripeSubscriptionId`.
- `app/(app)/clients/actions.ts` calls `requirePlan(organisation?.plan, "agency")` before consultant client linking/branding actions.

Bypass status:

- `TEST_BYPASS_PLAN_GATE=true` only activates when `NODE_ENV !== "production"` and either `NODE_ENV === "test"`, `ENABLE_TEST_ROUTES=true`, or `NEXT_PUBLIC_ENABLE_TEST_ROUTES=true`.
- `scripts/smoke-plan-gate-bypass.ts` confirms `planGateBypassIsEnabled()` is false when `NODE_ENV=production`, even with test-route flags enabled.
- The production-mode regression also asserts that `hasPlanAccess("free", "agency")`, `orgHasPlan(...)`, `orgIsSubscribed(...)`, and `requireActiveSubscription(...)` do not bypass in production mode when a database is configured.

Enforcement gap:

- `requireActiveSubscription()` allows unpaid access only when `billingGracePeriodIsActive()` returns true.
- Missing or invalid `BILLING_ENFORCEMENT_DATE` now means no grace period.
- Production mode ignores `BILLING_ENFORCEMENT_DATE` and keeps gates enforced.
- `.env.example` now documents `BILLING_ENFORCEMENT_DATE` as an optional non-production grace date.
- Local `.env.local` has no `BILLING_ENFORCEMENT_DATE`, so local subscription enforcement now blocks unpaid `requireActiveSubscription()` paths unless an explicit future non-production grace date is configured.

This closes the Phase 0 enforcement gap.

## Current Webhook Coverage

Handled in `app/api/webhooks/stripe/route.ts`:

- `checkout.session.completed`: syncs checkout metadata, retrieves the subscription when present, updates subscription/org plan state, updates Clerk metadata, creates Agency records for Agency subscriptions, and sends a subscription confirmation email.
- `customer.subscription.created`: syncs subscription/org plan state.
- `customer.subscription.updated`: syncs subscription/org plan state.
- `customer.subscription.deleted`: syncs subscription/org plan state, downgrades inactive subscriptions to `free`, sends a cancellation confirmation email when a recipient is available, and revalidates billing-related paths.
- `invoice.payment_succeeded`: resolves the organisation from the Stripe customer, sends a receipt email with amount/date/PDF invoice link when a recipient and invoice URL are available, and revalidates billing-related paths.
- `invoice.payment_failed`: marks matching subscriptions `past_due`.

Missing for Tranche 12:

- Live Stripe dashboard delivery is not proven from this environment.
- A browser-driven sandbox Checkout completion with Stripe-hosted redirect is not yet recorded.

## Customer Portal

Code exists:

- `createPortalSession()` in `lib/stripe/actions.ts` creates `stripe.billingPortal.sessions.create(...)` with `return_url: ${NEXT_PUBLIC_APP_URL}/settings/billing`.
- `app/(app)/settings/billing/page.tsx` shows the portal button when Stripe is configured and a Stripe customer exists.

External setup still needs verification:

- Stripe Customer Portal must be configured in the live Stripe dashboard.
- Portal behavior for cancellation, payment method updates, invoices, and return URL should be smoke-tested in sandbox before Phase 3.

## Smoke Coverage

Existing scripts:

- `npm run smoke:stripe-billing` maps to `scripts/smoke-stripe-billing-runtime.ts`.
- `npm run smoke:stripe-upgrade-flow` maps to `scripts/smoke-stripe-upgrade-flow.ts`.
- `npm run smoke:stripe-invoice-email` maps to `scripts/smoke-stripe-invoice-email.ts`.
- `npm run smoke:plan-gate-bypass` maps to `scripts/smoke-plan-gate-bypass.ts`.
- `npm run smoke:plan-gate-enforcement` maps to `scripts/smoke-plan-gate-enforcement.ts`.

`smoke:stripe-billing` currently covers:

- Signed webhook rejection for an invalid Stripe signature.
- Local signed `checkout.session.completed` without a subscription object.
- Local signed `customer.subscription.updated`.
- Local signed `customer.subscription.deleted`.
- Cancellation confirmation send through a mocked email transport.
- DB entitlement changes through `orgHasPlan()` and `orgIsSubscribed()`.

`smoke:stripe-upgrade-flow` covers:

- Checkout Session parameter construction for subscription mode.
- Billing Portal Session parameter construction.
- Local signed `checkout.session.completed` success handling and DB entitlement lift.

`smoke:stripe-invoice-email` covers:

- Local signed `invoice.payment_succeeded`.
- Receipt email subject/text routing through a mocked email transport.

`smoke:plan-gate-enforcement` covers:

- Missing enforcement date blocks unpaid access.
- Production mode ignores future grace dates.
- Production mode keeps `TEST_BYPASS_PLAN_GATE` unreachable.

Still not covered:

- Stripe-hosted Checkout redirect in a real browser.
- Stripe Billing Portal dashboard configuration in live mode.
- Live Stripe webhook delivery.

## Resend Wiring

Existing email infrastructure:

- `lib/email/client.ts` lazily creates the Resend client from `RESEND_API_KEY`.
- `lib/email/send.tsx` centralizes React Email + plaintext sends.
- Existing send functions include deadline reminders, gap alerts, consultant invites, and subscription confirmation.
- New billing send functions include invoice receipts and subscription cancellation confirmations.
- Existing templates live under `lib/email/templates/`.
- `lib/email/send.tsx` now uses `RESEND_FROM` via `getResendFrom()` and exposes a production-gated test transport for smoke scripts.

Gap:

- Real mailbox receipt for a live charge is still a Phase 4 manual gate.

## Configuration State

Local `.env.local` was checked without printing secret values:

- `STRIPE_SECRET_KEY`: test key present.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: test key present.
- `STRIPE_WEBHOOK_SECRET`: present.
- `STRIPE_SME_PRICE_ID`: present.
- `STRIPE_AGENCY_PRICE_ID`: present.
- `BILLING_ENFORCEMENT_DATE`: missing.
- `TEST_BYPASS_PLAN_GATE`: missing.
- `RESEND_API_KEY`: present.
- `RESEND_FROM`: present.

Configuration drift/gaps:

- `.env.example` now uses `STRIPE_SME_PRICE_ID` and `STRIPE_AGENCY_PRICE_ID` as the authoritative Stripe Price ID variables.
- `lib/readiness.ts` now requires `STRIPE_SME_PRICE_ID` and `STRIPE_AGENCY_PRICE_ID` instead of obsolete lookup-key variables.

## Phase 3 Production Env Vars

Production Vercel should use the same runtime variable names as sandbox/local. Do not introduce a separate `STRIPE_WEBHOOK_SECRET_LIVE` code path.

Swap or confirm in Vercel production:

- `STRIPE_SECRET_KEY=sk_live_...`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...` for the live `https://splnit.eu/api/webhooks/stripe` endpoint
- `STRIPE_SME_PRICE_ID=price_...` live-mode SME monthly price
- `STRIPE_AGENCY_PRICE_ID=price_...` live-mode Agency monthly price
- `NEXT_PUBLIC_APP_URL=https://splnit.eu`
- `RESEND_API_KEY` and `RESEND_FROM` confirmed for invoice/cancellation emails
- `TEST_BYPASS_PLAN_GATE` absent in production
- `BILLING_ENFORCEMENT_DATE` not needed for production enforcement; production gates ignore grace dates

Keep sandbox/test values in `.env.local`.

## Phase 2 Implementation Completed

1. Added invoice receipt email template/sender and handled `invoice.payment_succeeded`.
2. Added cancellation confirmation email on `customer.subscription.deleted`.
3. Added explicit billing revalidation after checkout/subscription changes.
4. Added `smoke:stripe-upgrade-flow`.
5. Added `smoke:stripe-invoice-email`.
6. Added `smoke:plan-gate-enforcement` and strengthened `smoke:plan-gate-bypass`.
7. Updated readiness/env docs to use `STRIPE_SME_PRICE_ID` and `STRIPE_AGENCY_PRICE_ID` as authoritative.

## Remaining Gates

- Complete Phase 1 manual Stripe live account setup.
- Run a browser-based sandbox Checkout and Portal pass before Phase 3.
- Swap Vercel production Stripe keys only after the Phase 1/2 gates are accepted.
- Run Phase 4 live charge, receipt, entitlement, refund, and drift checks before declaring Tranche 12 shipped.
