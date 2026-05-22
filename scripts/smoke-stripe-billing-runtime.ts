import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { POST as stripeWebhookPost } from "@/app/api/webhooks/stripe/route";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { organisations, subscriptions } from "@/lib/db/schema";
import {
  getSubscriptionForOrg,
  orgHasPlan,
  orgIsSubscribed,
} from "@/lib/stripe/subscriptions";

loadEnvConfig(process.cwd());

type EnvSnapshot = Record<string, string | undefined>;

const envKeys = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_SME_PRICE_ID",
  "STRIPE_AGENCY_PRICE_ID",
  "CLERK_SECRET_KEY",
] as const;

function snapshotEnv(): EnvSnapshot {
  return Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
}

function restoreEnv(snapshot: EnvSnapshot) {
  for (const key of envKeys) {
    const value = snapshot[key];

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function signStripeEvent(input: {
  event: Stripe.Event;
  secret: string;
}) {
  const payload = JSON.stringify(input.event);
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload,
    secret: input.secret,
  });

  return new Request("http://localhost/api/webhooks/stripe", {
    body: payload,
    headers: {
      "stripe-signature": signature,
    },
    method: "POST",
  });
}

function invalidStripeEvent() {
  return new Request("http://localhost/api/webhooks/stripe", {
    body: JSON.stringify({ type: "checkout.session.completed" }),
    headers: {
      "stripe-signature": "invalid",
    },
    method: "POST",
  });
}

function stripeEvent(type: string, object: unknown): Stripe.Event {
  return {
    id: `evt_${type.replaceAll(".", "_")}_${Date.now()}`,
    object: "event",
    api_version: "2026-04-22.dahlia",
    created: Math.floor(Date.now() / 1000),
    data: { object },
    livemode: false,
    pending_webhooks: 1,
    request: null,
    type,
  } as Stripe.Event;
}

async function main() {
  if (!hasDatabaseUrl()) {
    console.log("Stripe billing smoke skipped: DATABASE_URL is missing.");
    return;
  }

  const originalEnv = snapshotEnv();
  const db = getDb();
  const clerkOrgId = `smoke-stripe-billing-${Date.now()}`;
  const stripeCustomerId = `cus_smoke_${Date.now()}`;
  const stripeSubscriptionId = `sub_smoke_${Date.now()}`;
  const secret = "whsec_smoke_local_entitlement";

  try {
    process.env.STRIPE_SECRET_KEY = "sk_test_smoke_local";
    process.env.STRIPE_WEBHOOK_SECRET = secret;
    process.env.STRIPE_SME_PRICE_ID = "price_smoke_sme_490czk";
    process.env.STRIPE_AGENCY_PRICE_ID = "price_smoke_agency_1990czk";
    delete process.env.CLERK_SECRET_KEY;

    await db.delete(subscriptions).where(eq(subscriptions.clerkOrgId, clerkOrgId));
    await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
    await db.insert(organisations).values({
      clerkOrgId,
      country: "CZ",
      employeeCount: "1-10",
      locale: "cs-CZ",
      name: "Stripe Billing Smoke Org",
      plan: "free",
      primaryJurisdiction: "CZ",
      sector: "technology",
    });

    assert.equal(await orgHasPlan(clerkOrgId, "sme"), false);

    const invalidResponse = await stripeWebhookPost(invalidStripeEvent());
    assert.equal(invalidResponse.status, 400);

    const checkoutEvent = stripeEvent("checkout.session.completed", {
      id: `cs_smoke_${Date.now()}`,
      object: "checkout.session",
      customer: stripeCustomerId,
      metadata: {
        clerkOrgId,
        plan: "sme",
      },
      subscription: null,
    });
    const checkoutResponse = await stripeWebhookPost(
      signStripeEvent({ event: checkoutEvent, secret }),
    );
    assert.equal(checkoutResponse.status, 200);
    assert.equal(await orgHasPlan(clerkOrgId, "sme"), true);

    const subscriptionEvent = stripeEvent("customer.subscription.updated", {
      id: stripeSubscriptionId,
      object: "subscription",
      customer: stripeCustomerId,
      current_period_end: Math.floor(Date.now() / 1000) + 86_400,
      items: {
        object: "list",
        data: [
          {
            id: `si_smoke_${Date.now()}`,
            object: "subscription_item",
            price: {
              id: process.env.STRIPE_AGENCY_PRICE_ID,
              object: "price",
            },
          },
        ],
        has_more: false,
        url: "/v1/subscription_items",
      },
      metadata: {
        clerkOrgId,
        plan: "agency",
      },
      status: "active",
    });
    const subscriptionResponse = await stripeWebhookPost(
      signStripeEvent({ event: subscriptionEvent, secret }),
    );
    assert.equal(subscriptionResponse.status, 200);
    assert.equal(await orgHasPlan(clerkOrgId, "agency"), true);

    const deletedEvent = stripeEvent("customer.subscription.deleted", {
      ...(subscriptionEvent.data.object as unknown as Record<string, unknown>),
      status: "canceled",
    });
    const deletedResponse = await stripeWebhookPost(
      signStripeEvent({ event: deletedEvent, secret }),
    );
    assert.equal(deletedResponse.status, 200);
    const canceled = await getSubscriptionForOrg(clerkOrgId);
    assert.equal(canceled?.status, "canceled");
    assert.equal(await orgIsSubscribed(clerkOrgId), false);

    console.log("Stripe billing smoke passed.");
  } finally {
    await db.delete(subscriptions).where(eq(subscriptions.clerkOrgId, clerkOrgId));
    await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
    restoreEnv(originalEnv);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
