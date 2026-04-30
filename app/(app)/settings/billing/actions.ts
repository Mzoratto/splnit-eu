"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  findPriceForPlan,
  getAppUrl,
  getOrCreateStripeCustomer,
} from "@/lib/stripe/billing";
import { getStripe } from "@/lib/stripe/client";
import type { BillablePlanKey, BillingInterval } from "@/lib/stripe/plans";

function requireActiveOrganisation(session: Awaited<ReturnType<typeof auth>>) {
  if (!session.userId || !session.orgId) {
    redirect("/sign-in");
  }

  return {
    userId: session.userId,
    orgId: session.orgId,
  };
}

export async function createCheckoutSession(
  plan: BillablePlanKey,
  interval: BillingInterval,
) {
  const session = requireActiveOrganisation(await auth());
  const price = await findPriceForPlan(plan, interval);
  const customerId = await getOrCreateStripeCustomer({
    clerkOrgId: session.orgId,
    clerkUserId: session.userId,
  });
  const appUrl = getAppUrl();
  const checkoutSession = await getStripe().checkout.sessions.create({
    allow_promotion_codes: true,
    customer: customerId,
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: {
      clerkOrgId: session.orgId,
      clerkUserId: session.userId,
      interval,
      plan,
    },
    mode: "subscription",
    subscription_data: {
      metadata: {
        clerkOrgId: session.orgId,
        clerkUserId: session.userId,
        interval,
        plan,
      },
    },
    success_url: `${appUrl}/settings/billing?checkout=success`,
    cancel_url: `${appUrl}/settings/billing?checkout=cancelled`,
  });

  if (!checkoutSession.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  redirect(checkoutSession.url);
}

export async function createCustomerPortalSession() {
  const session = requireActiveOrganisation(await auth());
  const organisation = await getOrganisationByClerkOrgId(session.orgId);

  if (!organisation?.stripeCustomerId) {
    throw new Error("No Stripe customer exists for this organisation.");
  }

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: organisation.stripeCustomerId,
    return_url: `${getAppUrl()}/settings/billing`,
  });

  redirect(portalSession.url);
}
