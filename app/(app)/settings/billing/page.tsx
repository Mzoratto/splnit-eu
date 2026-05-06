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

type BillingSettingsCopy = ReturnType<typeof getMessagesForLocale>["billingSettings"];

function formatPrice(cents: number, locale: Locale) {
  return new Intl.NumberFormat(locale, {
    currency: locale === "cs-CZ" ? "CZK" : "EUR",
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
  const planCopy = copy.plans as Record<
    BillablePlanKey,
    { description: string; name: string }
  >;
  const currentPlanLabel =
    copy.planNames[currentPlan as keyof BillingSettingsCopy["planNames"]] ??
    currentPlan;

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            {copy.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            {copy.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
            {copy.subtitle}
          </p>
        </div>
        <form action={createCustomerPortalSession}>
          <button
            type="submit"
            disabled={!canOpenPortal}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium text-foreground enabled:hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-45"
          >
            {copy.customerPortal}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-foreground/58">{copy.currentPlan}</p>
              <h2 className="mt-1 text-2xl font-semibold capitalize">
                {currentPlanLabel}
              </h2>
            </div>
            <span className="rounded-md bg-surface-muted px-2 py-1 text-xs">
              {organisation?.stripeSubscriptionId ? copy.stripeSynced : copy.local}
            </span>
          </div>
          <dl className="mt-6 grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/58">{copy.frameworks}</dt>
              <dd className="font-medium">{PLAN_LIMITS[currentPlan].frameworks}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/58">{copy.integrations}</dt>
              <dd className="font-medium">{PLAN_LIMITS[currentPlan].integrations}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-foreground/58">{copy.users}</dt>
              <dd className="font-medium">{PLAN_LIMITS[currentPlan].users}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold">{copy.stripeConnection}</h2>
              <p className="mt-1 text-sm leading-6 text-foreground/62">
                {stripeConfigured
                  ? copy.stripeConfigured
                  : copy.stripeMissing}
              </p>
            </div>
          </div>
          <dl className="mt-6 grid gap-3 text-sm">
            <div className="grid gap-1 sm:grid-cols-[160px_1fr]">
              <dt className="text-foreground/58">{copy.customer}</dt>
              <dd className="truncate font-mono text-xs">
                {organisation?.stripeCustomerId ?? copy.notCreated}
              </dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[160px_1fr]">
              <dt className="text-foreground/58">{copy.subscription}</dt>
              <dd className="truncate font-mono text-xs">
                {organisation?.stripeSubscriptionId ?? copy.none}
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
                <li>
                  {copy.limitFrameworks.replace(
                    "{count}",
                    String(planData.limits.frameworks),
                  )}
                </li>
                <li>
                  {copy.limitIntegrations.replace(
                    "{count}",
                    String(planData.limits.integrations),
                  )}
                </li>
                <li>
                  {copy.limitUsers.replace("{count}", String(planData.limits.users))}
                </li>
              </ul>

              <div className="mt-auto grid gap-2 pt-6">
                <form action={createCheckoutSession.bind(null, plan, "monthly")}>
                  <button
                    type="submit"
                    disabled={!canManageBilling || isCurrentPlan}
                    className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {isCurrentPlan ? copy.currentPlanButton : copy.monthlyCheckout}
                  </button>
                </form>
                <form action={createCheckoutSession.bind(null, plan, "annual")}>
                  <button
                    type="submit"
                    disabled={!canManageBilling || isCurrentPlan}
                    className="w-full rounded-md border border-border px-4 py-3 text-sm font-medium enabled:hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {copy.annualCheckout}
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
