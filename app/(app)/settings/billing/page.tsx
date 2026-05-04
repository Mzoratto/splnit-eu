import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { CreditCard, ExternalLink, ShieldCheck } from "lucide-react";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { hasStripeBillingConfig } from "@/lib/stripe/client";
import {
  BILLABLE_PLANS,
  PLAN_LIMITS,
  PLANS,
  normalizePlanKey,
  type BillablePlanKey,
} from "@/lib/stripe/plans";
import {
  createCheckoutSession,
  createCustomerPortalSession,
} from "./actions";

export const dynamic = "force-dynamic";

const planCopy: Record<BillablePlanKey, { name: string; description: string }> = {
  starter: {
    name: "Starter",
    description: "Automated evidence collection for a small compliance team.",
  },
  business: {
    name: "Business",
    description: "Trust Center, vendor risk, incidents, and access reviews.",
  },
  consultant: {
    name: "Consultant",
    description: "Unlimited client workspaces and white-label reporting.",
  },
};

function formatPrice(cents: number, locale: Locale) {
  return new Intl.NumberFormat(locale, {
    currency: "CZK",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(cents / 100);
}

export default async function BillingSettingsPage() {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);
  const session = clerkConfigured ? await auth() : null;
  const organisation = session?.orgId
    ? await getOrganisationByClerkOrgId(session.orgId)
    : null;
  const currentPlan = normalizePlanKey(organisation?.plan);
  const locale = normalizeLocale(organisation?.locale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).billingSettings;
  const stripeConfigured = hasStripeBillingConfig();
  const canManageBilling = Boolean(stripeConfigured && session?.userId && session?.orgId);
  const canOpenPortal = Boolean(canManageBilling && organisation?.stripeCustomerId);

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Billing
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Subscription
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
            Current plan and Stripe customer state for this Clerk organisation.
          </p>
        </div>
        <form action={createCustomerPortalSession}>
          <button
            type="submit"
            disabled={!canOpenPortal}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium text-foreground enabled:hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-45"
          >
            Customer Portal
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-foreground/58">Current plan</p>
              <h2 className="mt-1 text-2xl font-semibold capitalize">
                {currentPlan}
              </h2>
            </div>
            <span className="rounded-md bg-surface-muted px-2 py-1 text-xs">
              {organisation?.stripeSubscriptionId ? "stripe_synced" : "local"}
            </span>
          </div>
          <dl className="mt-6 grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/58">Frameworks</dt>
              <dd className="font-medium">{PLAN_LIMITS[currentPlan].frameworks}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/58">Integrations</dt>
              <dd className="font-medium">{PLAN_LIMITS[currentPlan].integrations}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/58">Users</dt>
              <dd className="font-medium">{PLAN_LIMITS[currentPlan].users}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold">Stripe connection</h2>
              <p className="mt-1 text-sm leading-6 text-foreground/62">
                {stripeConfigured
                  ? "Billing keys are configured for checkout and portal sessions."
                  : "Stripe keys are not configured in this environment yet."}
              </p>
            </div>
          </div>
          <dl className="mt-6 grid gap-3 text-sm">
            <div className="grid gap-1 sm:grid-cols-[160px_1fr]">
              <dt className="text-foreground/58">Customer</dt>
              <dd className="truncate font-mono text-xs">
                {organisation?.stripeCustomerId ?? "not_created"}
              </dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[160px_1fr]">
              <dt className="text-foreground/58">Subscription</dt>
              <dd className="truncate font-mono text-xs">
                {organisation?.stripeSubscriptionId ?? "none"}
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {BILLABLE_PLANS.map((plan) => {
          const planData = PLANS[plan];
          const isCurrentPlan = currentPlan === plan;

          return (
            <article
              key={plan}
              className="flex min-h-[360px] flex-col rounded-lg border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{planCopy[plan].name}</h2>
                  <p className="mt-2 text-sm leading-6 text-foreground/62">
                    {planCopy[plan].description}
                  </p>
                </div>
                {isCurrentPlan ? (
                  <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                ) : null}
              </div>

              <div className="mt-6 grid gap-2">
                <p className="font-mono text-3xl font-semibold text-primary">
                  {formatPrice(planData.priceMonthly, locale)}
                  <span className="font-sans text-sm font-normal text-foreground/58">
                    {copy.monthSuffix}
                  </span>
                </p>
                <p className="text-sm text-foreground/58">
                  {copy.annualMonthly.replace(
                    "{price}",
                    formatPrice(planData.priceAnnual, locale),
                  )}
                </p>
              </div>

              <ul className="mt-6 grid gap-2 text-sm text-foreground/68">
                <li>{planData.limits.frameworks} frameworks</li>
                <li>{planData.limits.integrations} integrations</li>
                <li>{planData.limits.users} users</li>
              </ul>

              <div className="mt-auto grid gap-2 pt-6">
                <form action={createCheckoutSession.bind(null, plan, "monthly")}>
                  <button
                    type="submit"
                    disabled={!canManageBilling || isCurrentPlan}
                    className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {isCurrentPlan ? "Current plan" : "Monthly checkout"}
                  </button>
                </form>
                <form action={createCheckoutSession.bind(null, plan, "annual")}>
                  <button
                    type="submit"
                    disabled={!canManageBilling || isCurrentPlan}
                    className="w-full rounded-md border border-border px-4 py-3 text-sm font-medium enabled:hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Annual checkout
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
