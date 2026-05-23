import { auth } from "@clerk/nextjs/server";
import { CreditCard, ExternalLink, ShieldCheck } from "lucide-react";
import { getLocale } from "next-intl/server";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import {
  countAgencyClients,
  getAgencyByClerkOrgId,
} from "@/lib/db/queries/agencies";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { hasStripeBillingConfig } from "@/lib/stripe/client";
import {
  BILLABLE_PLANS,
  normalizePlanKey,
  type BillablePlanKey,
  type PlanKey,
} from "@/lib/stripe/plans";
import {
  getSubscriptionForOrg,
  isActiveSubscriptionStatus,
} from "@/lib/stripe/subscriptions";
import {
  createCheckoutSession,
  createPortalSession,
} from "./actions";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type PlanCardCopy = {
  description: string;
  features: string[];
  name: string;
  price: string;
};

type BillingSettingsCopy = ReturnType<typeof getMessagesForLocale>["billingSettings"];

function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(date: Date | null, locale: Locale) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function Banner({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-border bg-surface p-3 text-sm leading-6 text-foreground/72">
      {children}
    </p>
  );
}

export default async function BillingSettingsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);
  const session = clerkConfigured ? await auth() : null;
  const [organisation, subscription] = session?.orgId
    ? await Promise.all([
        getOrganisationByClerkOrgId(session.orgId),
        getSubscriptionForOrg(session.orgId),
      ])
    : [null, null] as const;
  const locale = normalizeLocale(organisation?.locale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).billingSettings;
  const stripeConfigured = hasStripeBillingConfig();
  const canManageBilling = Boolean(stripeConfigured && session?.userId && session?.orgId);
  const activeSubscription = subscription && isActiveSubscriptionStatus(subscription.status)
    ? subscription
    : null;
  const currentPlan: PlanKey = activeSubscription
    ? activeSubscription.plan
    : normalizePlanKey(organisation?.plan);
  const planNames = copy.planNames as BillingSettingsCopy["planNames"] & Record<string, string>;
  const planCopy = copy.plans as Record<BillablePlanKey, PlanCardCopy>;
  const currentPlanLabel = planNames[currentPlan] ?? currentPlan;
  const agency =
    session?.orgId && currentPlan === "agency"
      ? await getAgencyByClerkOrgId(session.orgId)
      : null;
  const agencyClientCount = agency ? await countAgencyClients(agency.id) : null;
  const agencyClientLimit = agency?.planClientLimit ?? 20;
  const nextBillingDate = formatDate(activeSubscription?.currentPeriodEnd ?? null, locale);
  const canOpenPortal = Boolean(
    canManageBilling &&
      (activeSubscription?.stripeCustomerId || organisation?.stripeCustomerId),
  );
  const success = getParam(resolvedSearchParams, "success") === "true";
  const canceled = getParam(resolvedSearchParams, "canceled") === "true";
  const agencyRequired = getParam(resolvedSearchParams, "required") === "agency";
  const portalMissing = getParam(resolvedSearchParams, "portal") === "missing_customer";

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
        <form action={createPortalSession}>
          <button
            type="submit"
            disabled={!canOpenPortal}
          className="btn btn-secondary min-h-11 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {copy.customerPortal}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {!stripeConfigured ? <Banner>{copy.billingUnavailable}</Banner> : null}
        {success ? <Banner>{copy.success}</Banner> : null}
        {canceled ? <Banner>{copy.canceled}</Banner> : null}
        {agencyRequired ? <Banner>{copy.agencyRequired}</Banner> : null}
        {portalMissing ? <Banner>{copy.portalMissing}</Banner> : null}
      </div>

      {activeSubscription ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <article className="rounded-lg border border-primary bg-white p-5 shadow-sm shadow-blue-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-foreground/58">{copy.currentPlan}</p>
                <h2 className="mt-1 text-2xl font-semibold">{currentPlanLabel}</h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] px-2 py-1 text-xs font-semibold text-[var(--status-pass)]">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {copy.stripeSynced}
              </span>
            </div>
            <dl className="mt-6 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/58">{copy.status}</dt>
                <dd className="font-medium">{activeSubscription.status}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/58">{copy.nextBillingDate}</dt>
                <dd className="font-medium">{nextBillingDate ?? copy.none}</dd>
              </div>
              {currentPlan === "agency" ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-foreground/58">{copy.clientUsage}</dt>
                  <dd className="font-medium">
                    {copy.clients
                      .replace("{used}", String(agencyClientCount ?? 0))
                      .replace("{limit}", String(agencyClientLimit))}
                  </dd>
                </div>
              ) : null}
            </dl>
          </article>

          <article className="rounded-lg border border-border bg-white p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <CreditCard className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold">{copy.stripeConnection}</h2>
                <p className="mt-1 text-sm leading-6 text-foreground/62">
                  {stripeConfigured ? copy.stripeConfigured : copy.stripeMissing}
                </p>
              </div>
            </div>
            <dl className="mt-6 grid gap-3 text-sm">
              <div className="grid gap-1 sm:grid-cols-[160px_1fr]">
                <dt className="text-foreground/58">{copy.customer}</dt>
                <dd className="truncate font-mono text-xs">
                  {activeSubscription.stripeCustomerId}
                </dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[160px_1fr]">
                <dt className="text-foreground/58">{copy.subscription}</dt>
                <dd className="truncate font-mono text-xs">
                  {activeSubscription.stripeSubscriptionId ?? copy.none}
                </dd>
              </div>
            </dl>
          </article>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold">{copy.choosePlan}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {BILLABLE_PLANS.map((plan) => (
              <article
                key={plan}
                className="flex min-h-[340px] flex-col rounded-lg border border-border bg-white p-5 shadow-xs"
              >
                <div>
                  <h3 className="text-xl font-semibold">{planCopy[plan].name}</h3>
                  <p className="mt-3 font-mono text-3xl font-semibold text-primary">
                    {planCopy[plan].price}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-foreground/64">
                    {planCopy[plan].description}
                  </p>
                </div>

                <ul className="mt-6 grid gap-2 text-sm text-foreground/70">
                  {planCopy[plan].features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <ShieldCheck
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <form className="mt-auto pt-6" action={createCheckoutSession.bind(null, plan)}>
                  <button
                    type="submit"
                    disabled={!canManageBilling}
                    className="btn btn-primary w-full min-h-11 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {copy.subscribe}
                  </button>
                </form>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
