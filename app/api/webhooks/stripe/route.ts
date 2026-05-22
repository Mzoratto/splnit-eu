import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { sendSubscriptionConfirmation } from "@/lib/email/send";
import {
  getObjectId,
  getPrimaryEmail,
  syncSubscriptionToOrg,
} from "@/lib/stripe/billing";
import { getStripe } from "@/lib/stripe/client";
import { isBillablePlanKey } from "@/lib/stripe/plans";
import {
  syncLegacyOrganisationBilling,
  updateSubscriptionStatus,
  upsertSubscription,
} from "@/lib/stripe/subscriptions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const stripeSubscriptionId = getObjectId(session.subscription);

  if (!stripeSubscriptionId) {
    const clerkOrgId = session.metadata?.clerkOrgId;
    const plan = session.metadata?.plan;
    const stripeCustomerId = getObjectId(session.customer);

    if (!clerkOrgId || !stripeCustomerId || !isBillablePlanKey(plan)) {
      return null;
    }

    await upsertSubscription({
      clerkOrgId,
      plan,
      status: "active",
      stripeCustomerId,
      stripeSubscriptionId: null,
    });
    await syncLegacyOrganisationBilling({
      clerkOrgId,
      plan,
      stripeCustomerId,
      stripeSubscriptionId: null,
    });

    return {
      clerkOrgId,
      currentPeriodEnd: null,
      plan,
      status: "active",
      stripeCustomerId,
      stripeSubscriptionId: null,
    };
  }

  const subscription = await getStripe().subscriptions.retrieve(stripeSubscriptionId);

  const result = await syncSubscriptionToOrg(subscription);
  const clerkUserId = session.metadata?.clerkUserId ?? subscription.metadata.clerkUserId;

  if (clerkUserId && process.env.CLERK_SECRET_KEY) {
    const clerk = await clerkClient();
    const [user, organisation] = await Promise.all([
      clerk.users.getUser(clerkUserId),
      getOrganisationByClerkOrgId(result.clerkOrgId),
    ]);
    const email = getPrimaryEmail(user);

    if (email) {
      await sendSubscriptionConfirmation(email, {
        orgName: organisation?.name ?? result.clerkOrgId,
        periodEnd: result.currentPeriodEnd?.toISOString().slice(0, 10) ?? "neuvedeno",
        plan: result.plan,
      });
    }
  }

  return result;
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  await updateSubscriptionStatus({
    status: "past_due",
    stripeCustomerId: getObjectId(invoice.customer),
    stripeSubscriptionId: getObjectId(
      (invoice as { subscription?: string | { id: string } | null }).subscription ?? null,
    ),
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe webhook configuration is missing." },
      { status: 500 },
    );
  }

  if (!signature) {
    return NextResponse.json(
      { error: "Stripe signature header is missing." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  const rawBody = Buffer.from(await request.arrayBuffer());

  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event.data.object);
      break;

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscriptionToOrg(event.data.object);
      break;

    case "invoice.payment_failed":
      await handlePaymentFailed(event.data.object);
      break;
  }

  return NextResponse.json({
    ok: true,
    type: event.type,
  });
}
