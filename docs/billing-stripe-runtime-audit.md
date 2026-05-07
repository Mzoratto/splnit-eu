# Billing / Stripe Runtime Audit

Last updated: 2026-05-07

Purpose: record exactly what is runtime-proven for Splnit.eu billing and what remains unproven before sales or production reliance.

## Current conclusion

Billing is partially runtime-proven.

Use:
- The billing settings page renders safely when Stripe and Clerk billing config are absent.
- Disabled checkout/portal controls show explicit unavailable-state copy instead of throwing a 500.
- The Stripe webhook route can process locally signed `checkout.session.completed` and `customer.subscription.updated` events and update organisation plan entitlement fields in the database.

Do not claim yet:
- A signed-in production user can complete Stripe Checkout from `/settings/billing`.
- A real subscriber can open the Stripe customer portal from the app.
- Test-mode card payment completion has been verified end-to-end through Stripe Checkout.
- Stripe-hosted checkout completion has been verified through Stripe CLI or production webhook forwarding.
- The free-plan banner/gates disappear after a live checkout-created subscription.

## Runtime evidence

Command run:

```bash
npm run smoke:stripe-billing
```

Observed non-secret output:

```text
Stripe billing runtime smoke environment:
STRIPE_SECRET_KEY: missing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: missing
STRIPE_WEBHOOK_SECRET: missing
DATABASE_URL: set
CLERK_SECRET_KEY: missing
hasStripeBillingConfig: false
hasStripeWebhookConfig: false
Stripe webhook entitlement smoke passed: checkout.session.completed and customer.subscription.updated updated org plan state.
Stripe hosted checkout smoke skipped: STRIPE_SECRET_KEY is missing.
Stripe customer portal smoke skipped: STRIPE_SECRET_KEY is missing.
```

Missing-config browser smoke:

```bash
npx playwright test tests/e2e/billing.spec.ts --project=chromium
```

Result:

```text
3 passed
```

This proves the unauthenticated/missing-config billing page renders localized plan cards and disabled checkout controls without a server error.

## Status matrix

| Flow | Status | Evidence | Gap |
| --- | --- | --- | --- |
| Billing page missing Stripe config | ready | Playwright billing spec passes without Clerk/Stripe config and asserts the unavailable-state copy. | None for the missing-config state. |
| Checkout session creation | unproven in this environment | Source path exists in `app/(app)/settings/billing/actions.ts`; smoke script can create a Stripe-hosted Checkout session only when `STRIPE_SECRET_KEY` is a test-mode `sk_test_` key and price lookup keys are configured. | Current `.env.local` has no Stripe secret or publishable key, so no real `checkout.stripe.com` URL was created from this environment. |
| Test-mode card completion | unproven | Not run. | Requires Stripe test keys, active prices with lookup keys, authenticated Clerk org/session, and a browser pass through Stripe Checkout with a test card. |
| Customer portal | unproven in this environment | Source path exists in `createCustomerPortalSession`; smoke script can request a portal URL when Stripe is configured. | Current environment has no Stripe secret and no existing subscriber/customer to verify portal data against. |
| Webhook `checkout.session.completed` | partial runtime-proven | `npm run smoke:stripe-billing` sends a locally signed event to `/api/webhooks/stripe` and verifies DB plan/customer updates. | A real Stripe-delivered checkout completion event has not been forwarded to the route. |
| Webhook `customer.subscription.updated` | partial runtime-proven | `npm run smoke:stripe-billing` sends a locally signed subscription update event and verifies DB plan/customer/subscription updates. | A real Stripe-delivered subscription update has not been forwarded to the route. |
| Plan entitlement update | partial runtime-proven | Smoke verifies `organisations.plan`, `stripe_customer_id`, and `stripe_subscription_id` updates in DB. | UI gate refresh after a live paid subscription is not browser-verified. |
| Free-plan banner/gated feature unlock | unproven | Plan helper source exists and app layout reads org plan. | Needs an authenticated tenant before/after live checkout to verify banner removal and gated routes. |

## Trackable gaps

1. Configure Stripe test-mode env vars for a production-like smoke environment:
   - test-mode `STRIPE_SECRET_KEY` (`sk_test_...`; the smoke intentionally skips live keys)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - lookup keys for active test prices, or prices using the defaults in `lib/stripe/plans.ts`
2. Create or select a Clerk test org/user with active organisation context.
3. Run checkout from `/settings/billing` and verify redirect to `https://checkout.stripe.com/`.
4. Complete Checkout with a Stripe test card and confirm `checkout.session.completed` reaches `/api/webhooks/stripe`.
5. Confirm `organisations.plan`, `stripe_customer_id`, and `stripe_subscription_id` update for the real test org.
6. Reopen the app and verify current plan, free-plan messaging, and gated surfaces reflect the paid plan.
7. Open customer portal for the same org and verify the portal displays the correct customer/subscription.
8. Trigger a real `customer.subscription.updated` event and confirm the DB entitlement refreshes.

## Sales-safe wording

Use:
- “Billing settings have safe disabled-state handling when Stripe is not configured.”
- “Webhook entitlement logic has been locally runtime-smoked for checkout completion and subscription updates against the database.”
- “Stripe checkout and customer portal source paths exist but still need a real Stripe test-mode end-to-end smoke before claiming production readiness.”

Do not use:
- “Stripe billing is production-ready.”
- “Customers can already self-serve checkout and subscription management.”
- “Plan upgrades are verified end-to-end.”
- “Webhook processing has been proven with live Stripe delivery.”
