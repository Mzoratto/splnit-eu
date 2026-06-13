"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  getAppUrl,
  getCheckoutPriceId,
  getOrCreateStripeCustomer,
  getPrimaryEmail,
} from "@/lib/stripe/billing";
import { getStripe } from "@/lib/stripe/client";
import { type BillablePlanKey, type BillingInterval } from "@/lib/stripe/plans";
import {
  buildCheckoutSessionCreateParams,
  buildPortalSessionCreateParams,
} from "@/lib/stripe/session-params";
import { getSubscriptionForOrg } from "@/lib/stripe/subscriptions";

type CheckoutMetadata = Record<string, string | null | undefined>;

function requireActiveOrganisation(session: Awaited<ReturnType<typeof auth>>) {
  if (!session.userId || !session.orgId) {
    redirect("/sign-in");
  }

  return {
    orgId: session.orgId,
    userId: session.userId,
  };
}

function metadataValues(input: CheckoutMetadata) {
  return Object.fromEntries(
    Object.entries(input).filter((entry): entry is [string, string] =>
      Boolean(entry[1]),
    ),
  );
}

export async function createCheckoutSessionForPlan(input: {
  cancelPath?: string;
  interval?: BillingInterval;
  metadata?: CheckoutMetadata;
  plan: BillablePlanKey;
  successPath?: string;
}): Promise<never> {
  const session = requireActiveOrganisation(await auth());
  const interval: BillingInterval = input.interval === "yearly" ? "yearly" : "monthly";
  const priceId = getCheckoutPriceId(input.plan, interval);
  const customerId = await getOrCreateStripeCustomer({
    clerkOrgId: session.orgId,
    clerkUserId: session.userId,
  });
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(session.userId);
  const customerEmail = getPrimaryEmail(user);
  const appUrl = getAppUrl();
  const metadata = metadataValues({
    clerkOrgId: session.orgId,
    clerkUserId: session.userId,
    customerEmail,
    interval,
    plan: input.plan,
    ...(input.metadata ?? {}),
  });
  const checkoutSession = await getStripe().checkout.sessions.create(
    buildCheckoutSessionCreateParams({
      appUrl,
      cancelPath: input.cancelPath,
      customerId,
      metadata,
      priceId,
      successPath: input.successPath,
    }),
  );

  if (!checkoutSession.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  redirect(checkoutSession.url);
}

export async function createCheckoutSession(
  plan: BillablePlanKey,
  interval: BillingInterval = "monthly",
): Promise<never> {
  return createCheckoutSessionForPlan({ interval, plan });
}

export async function createPortalSession(): Promise<never> {
  const session = requireActiveOrganisation(await auth());
  const [subscription, organisation] = await Promise.all([
    getSubscriptionForOrg(session.orgId),
    getOrganisationByClerkOrgId(session.orgId),
  ]);
  const stripeCustomerId =
    subscription?.stripeCustomerId ?? organisation?.stripeCustomerId ?? null;

  if (!stripeCustomerId) {
    redirect("/settings/billing?portal=missing_customer");
  }

  const portalSession = await getStripe().billingPortal.sessions.create(
    buildPortalSessionCreateParams({
      customerId: stripeCustomerId,
      returnUrl: `${getAppUrl()}/settings/billing`,
    }),
  );

  redirect(portalSession.url);
}

export const createCustomerPortalSession = createPortalSession;
