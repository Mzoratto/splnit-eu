import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { updateOrganisationBilling } from "@/lib/db/queries/organisations";
import {
  syncClerkPlanMetadata,
  syncSubscriptionToOrg,
} from "@/lib/stripe/billing";
import { getStripe } from "@/lib/stripe/client";
import { normalizePlanKey } from "@/lib/stripe/plans";

export const dynamic = "force-dynamic";

function getObjectId(value: string | { id: string } | null) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const clerkOrgId = session.metadata?.clerkOrgId;

  if (!clerkOrgId) {
    throw new Error(`Checkout session ${session.id} is missing clerkOrgId metadata.`);
  }

  const stripeCustomerId = getObjectId(session.customer);
  const stripeSubscriptionId = getObjectId(session.subscription);

  if (stripeSubscriptionId) {
    const subscription = await getStripe().subscriptions.retrieve(stripeSubscriptionId);
    await syncSubscriptionToOrg(subscription);
    return;
  }

  const plan = normalizePlanKey(session.metadata?.plan);

  await updateOrganisationBilling({
    clerkOrgId,
    plan,
    stripeCustomerId,
    stripeSubscriptionId: null,
  });

  await syncClerkPlanMetadata({
    clerkOrgId,
    plan,
    stripeCustomerId,
    stripeSubscriptionId: null,
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
  const body = await request.text();

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
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
  }

  return NextResponse.json({
    ok: true,
    type: event.type,
  });
}
