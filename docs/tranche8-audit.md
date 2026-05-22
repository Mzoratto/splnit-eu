# Tranche 8 Audit

Last updated: 2026-05-22

## Existing Stripe and billing surface

- Stripe is already installed (`stripe` in `package.json`) and used by `lib/stripe/client.ts`, `lib/stripe/billing.ts`, `lib/stripe/plans.ts`, `app/api/webhooks/stripe/route.ts`, and `app/(app)/settings/billing/actions.ts`.
- The current billing model is an earlier prototype with `free`, `starter`, `business`, and `consultant` plan keys. Prices are resolved through Stripe price lookup keys such as `STRIPE_STARTER_MONTHLY_LOOKUP_KEY`; Tranche 8 needs direct Price IDs for `sme` and `agency`.
- `app/api/webhooks/stripe/route.ts` already verifies Stripe signatures with `stripe.webhooks.constructEvent`, but it reads the body with `request.text()` and syncs into `organisations` billing fields only. Tranche 8 needs raw `arrayBuffer()` handling and a new `subscriptions` table as the source of truth.
- The current webhook handles `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`; it does not handle `invoice.payment_failed`.

## Existing `/settings/billing`

- `app/(app)/settings/billing/page.tsx` renders a real but prototype billing page rather than an empty placeholder.
- It shows the current organisation plan from `organisations.plan`, Stripe customer/subscription IDs, and three plan cards for `starter`, `business`, and `consultant`.
- Checkout and portal actions are disabled when Clerk or Stripe config is missing.
- Tranche 8 should replace this with two plans: SME `490 Kč/měsíc` and Agency `1 990 Kč/měsíc`, backed by `STRIPE_SME_PRICE_ID` and `STRIPE_AGENCY_PRICE_ID`.

## Existing plan and access gates

- Middleware only performs Clerk authentication for protected routes. It already includes `/agency(.*)` and does not import database code.
- App shell plan state is read from `organisations.plan` and Clerk public metadata via the existing billing prototype.
- Tranche 7 agency access is enforced in `app/(app)/agency/layout.tsx` through `getAgencyForUser(userId)`, checking `agency_consultants` membership and active agency status.
- No route currently gates compliance PDF export on a paid subscription.
- Tranche 8 should add DB-backed subscription helpers and keep legacy `organisations.plan`, `stripe_customer_id`, and `stripe_subscription_id` synced for compatibility.

## Clerk organisation metadata in use

- `app/api/webhooks/clerk/route.ts` reads `public_metadata.plan` from Clerk organisation webhook events.
- `lib/clerk/sync.ts` writes the plan into `organisations.plan` when upserting organisations.
- `lib/stripe/billing.ts` currently updates Clerk organisation public metadata with `plan`, `stripeCustomerId`, and `stripeSubscriptionId`.
- Tranche 8 can continue syncing these metadata fields, but access decisions should use the new `subscriptions` table plus agency grandfathering rules.

## Existing email surface

- `resend` is already installed and `lib/email/client.ts` provides a lazy Resend client using `RESEND_API_KEY` and `RESEND_FROM`.
- `@react-email/components` is not listed as a direct dependency.
- Existing email templates are plain text helpers in `lib/email/templates/alerts.ts`; Tranche 8 needs React Email component templates under `lib/email/templates/` with plain-text fallbacks.
- `app/(app)/agency/actions.ts` still has a consultant-invite delivery TODO in `recordAgencyConsultantInviteAction`.

## Environment and deployment notes

- `.env.example` already includes Stripe secret, webhook secret, publishable key, and old lookup-key variables.
- Tranche 8 should add `STRIPE_SME_PRICE_ID` for the 490 Kč monthly SME Stripe Price ID and `STRIPE_AGENCY_PRICE_ID` for the 1 990 Kč monthly Agency Stripe Price ID. The app code should treat the Price ID as authoritative and should not infer currency from the variable name.
- `.env.example` should also add `BILLING_ENFORCEMENT_DATE`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`, and the Resend values required by the new email sender.
- `vercel.json` already contains cron jobs. JSON does not support comments, so the Vercel Cron plan requirement should be documented outside `vercel.json`.
