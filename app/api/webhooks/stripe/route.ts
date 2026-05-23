import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  getOrganisationByClerkOrgId,
  getPrimaryContactEmailForOrg,
} from "@/lib/db/queries/organisations";
import {
  sendInvoiceReceipt,
  sendSubscriptionCancellation,
  sendSubscriptionConfirmation,
} from "@/lib/email/send";
import {
  getObjectId,
  getPrimaryEmail,
  syncSubscriptionToOrg,
} from "@/lib/stripe/billing";
import { getStripe } from "@/lib/stripe/client";
import { isBillablePlanKey } from "@/lib/stripe/plans";
import {
  findOrgIdForStripeCustomer,
  syncLegacyOrganisationBilling,
  updateSubscriptionStatus,
  upsertSubscription,
} from "@/lib/stripe/subscriptions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function revalidateBillingPaths() {
  try {
    revalidatePath("/dashboard");
    revalidatePath("/settings/billing");
    revalidatePath("/agency/dashboard");
    revalidatePath("/agency/settings");
    revalidatePath("/clients");
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
  }
}

function formatStripeAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("cs-CZ", {
    currency: currency.toUpperCase(),
    style: "currency",
  }).format(amount / 100);
}

function formatStripeDate(timestampSeconds: number | null | undefined) {
  const date =
    typeof timestampSeconds === "number"
      ? new Date(timestampSeconds * 1000)
      : new Date();

  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

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
    revalidateBillingPaths();

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

  revalidateBillingPaths();

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
  revalidateBillingPaths();
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const stripeCustomerId = getObjectId(invoice.customer);

  if (!stripeCustomerId) {
    return null;
  }

  const clerkOrgId = await findOrgIdForStripeCustomer(stripeCustomerId);

  if (!clerkOrgId) {
    return null;
  }

  const [organisation, primaryContactEmail] = await Promise.all([
    getOrganisationByClerkOrgId(clerkOrgId),
    getPrimaryContactEmailForOrg(clerkOrgId),
  ]);
  const recipient = invoice.customer_email ?? primaryContactEmail;
  const invoiceUrl = invoice.invoice_pdf ?? invoice.hosted_invoice_url ?? null;

  if (!recipient || !invoiceUrl) {
    revalidateBillingPaths();
    return { clerkOrgId, sent: false };
  }

  await sendInvoiceReceipt(recipient, {
    amountPaid: formatStripeAmount(invoice.amount_paid, invoice.currency),
    invoiceNumber: invoice.number ?? invoice.id,
    invoiceUrl,
    orgName: organisation?.name ?? invoice.customer_name ?? clerkOrgId,
    paidAt: formatStripeDate(invoice.status_transitions?.paid_at ?? invoice.created),
  });
  revalidateBillingPaths();

  return { clerkOrgId, sent: true };
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const result = await syncSubscriptionToOrg(subscription);
  const [organisation, primaryContactEmail] = await Promise.all([
    getOrganisationByClerkOrgId(result.clerkOrgId),
    getPrimaryContactEmailForOrg(result.clerkOrgId),
  ]);
  const recipient = subscription.metadata.customerEmail ?? primaryContactEmail;

  if (recipient) {
    await sendSubscriptionCancellation(recipient, {
      canceledAt: formatStripeDate(
        (subscription as { canceled_at?: number | null }).canceled_at ?? null,
      ),
      orgName: organisation?.name ?? result.clerkOrgId,
      plan: result.plan,
    });
  }

  revalidateBillingPaths();

  return result;
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
      await syncSubscriptionToOrg(event.data.object);
      revalidateBillingPaths();
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object);
      break;

    case "invoice.payment_failed":
      await handlePaymentFailed(event.data.object);
      break;

    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event.data.object);
      break;
  }

  return NextResponse.json({
    ok: true,
    type: event.type,
  });
}
