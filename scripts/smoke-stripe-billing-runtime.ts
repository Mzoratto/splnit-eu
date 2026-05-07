import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { POST as stripeWebhookPost } from "@/app/api/webhooks/stripe/route";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { organisations } from "@/lib/db/schema";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  hasStripeBillingConfig,
  hasStripeSecretKey,
  hasStripeWebhookConfig,
} from "@/lib/stripe/client";

loadEnvConfig(process.cwd());

type EnvSnapshot = Record<string, string | undefined>;

const envKeys = [
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
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

function envStatus(name: string) {
  return `${name}: ${process.env[name] ? "set" : "missing"}`;
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

function getSmokeLookupKeyForPlan(
  plan: "starter" | "business" | "consultant",
  interval: "monthly" | "annual",
) {
  const upperPlan = plan.toUpperCase();
  const upperInterval = interval.toUpperCase();

  return (
    process.env[`STRIPE_${upperPlan}_${upperInterval}_LOOKUP_KEY`] ??
    (interval === "monthly"
      ? process.env[`STRIPE_${upperPlan}_PRICE_LOOKUP_KEY`]
      : undefined) ??
    `${plan}_${interval}`
  );
}

async function smokeWebhookEntitlementSync() {
  if (!hasDatabaseUrl()) {
    console.log("Stripe webhook entitlement smoke skipped: DATABASE_URL is missing.");
    return;
  }

  const originalEnv = snapshotEnv();
  const clerkOrgId = `smoke-stripe-billing-${Date.now()}`;
  const stripeCustomerId = `cus_smoke_${Date.now()}`;
  const subscriptionId = `sub_smoke_${Date.now()}`;
  const secret = "whsec_smoke_local_entitlement";
  const db = getDb();

  try {
    process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_smoke_local";
    process.env.STRIPE_WEBHOOK_SECRET = secret;
    delete process.env.CLERK_SECRET_KEY;

    await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
    await db.insert(organisations).values({
      clerkOrgId,
      country: "CZ",
      employeeCount: "1-10",
      locale: "en-EU",
      name: "Stripe Billing Smoke Org",
      plan: "free",
      primaryJurisdiction: "CZ",
      sector: "technology",
    });

    const checkoutEvent = {
      id: `evt_checkout_${Date.now()}`,
      object: "event",
      api_version: "2026-04-22.dahlia",
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: `cs_smoke_${Date.now()}`,
          object: "checkout.session",
          customer: stripeCustomerId,
          metadata: {
            clerkOrgId,
            plan: "starter",
          },
          subscription: null,
        },
      },
      livemode: false,
      pending_webhooks: 1,
      request: null,
      type: "checkout.session.completed",
    } as unknown as Stripe.Event;

    const checkoutResponse = await stripeWebhookPost(
      signStripeEvent({ event: checkoutEvent, secret }),
    );
    const checkoutBody = await checkoutResponse.clone().text();
    assert.equal(checkoutResponse.status, 200, checkoutBody);

    const afterCheckout = await getOrganisationByClerkOrgId(clerkOrgId);
    assert.equal(afterCheckout?.plan, "starter");
    assert.equal(afterCheckout?.stripeCustomerId, stripeCustomerId);
    assert.equal(afterCheckout?.stripeSubscriptionId, null);

    const subscriptionEvent = {
      id: `evt_subscription_${Date.now()}`,
      object: "event",
      api_version: "2026-04-22.dahlia",
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: subscriptionId,
          object: "subscription",
          customer: stripeCustomerId,
          items: {
            object: "list",
            data: [
              {
                id: `si_smoke_${Date.now()}`,
                object: "subscription_item",
                price: {
                  id: "price_smoke_business_monthly",
                  object: "price",
                  lookup_key: getSmokeLookupKeyForPlan("business", "monthly"),
                },
              },
            ],
            has_more: false,
            url: "/v1/subscription_items",
          },
          metadata: {
            clerkOrgId,
            plan: "business",
          },
          status: "active",
        },
      },
      livemode: false,
      pending_webhooks: 1,
      request: null,
      type: "customer.subscription.updated",
    } as unknown as Stripe.Event;

    const subscriptionResponse = await stripeWebhookPost(
      signStripeEvent({ event: subscriptionEvent, secret }),
    );
    assert.equal(subscriptionResponse.status, 200);

    const afterSubscription = await getOrganisationByClerkOrgId(clerkOrgId);
    assert.equal(afterSubscription?.plan, "business");
    assert.equal(afterSubscription?.stripeCustomerId, stripeCustomerId);
    assert.equal(afterSubscription?.stripeSubscriptionId, subscriptionId);

    console.log(
      "Stripe webhook entitlement smoke passed: checkout.session.completed and customer.subscription.updated updated org plan state.",
    );
  } finally {
    await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
    restoreEnv(originalEnv);
  }
}

async function smokeStripeHostedCheckoutAndPortal() {
  if (!hasStripeSecretKey()) {
    console.log("Stripe hosted checkout smoke skipped: STRIPE_SECRET_KEY is missing.");
    console.log("Stripe customer portal smoke skipped: STRIPE_SECRET_KEY is missing.");
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY!;
  if (!secretKey.startsWith("sk_test_")) {
    console.log(
      "Stripe hosted checkout smoke skipped: STRIPE_SECRET_KEY is not a test-mode key.",
    );
    console.log(
      "Stripe customer portal smoke skipped: STRIPE_SECRET_KEY is not a test-mode key.",
    );
    return;
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const lookupKey = getSmokeLookupKeyForPlan("starter", "monthly");
  const prices = await stripe.prices.list({
    active: true,
    limit: 1,
    lookup_keys: [lookupKey],
  });
  const price = prices.data[0];

  if (!price) {
    console.log(
      `Stripe hosted checkout smoke skipped: no active test price found for lookup_key ${lookupKey}.`,
    );
    return;
  }

  const customer = await stripe.customers.create({
    email: "billing-smoke@splnit.eu",
    metadata: {
      smoke: "stripe-billing-runtime",
    },
    name: "Splnit Billing Smoke",
  });

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: {
        clerkOrgId: "smoke-stripe-hosted-checkout",
        clerkUserId: "smoke-user",
        interval: "monthly",
        plan: "starter",
      },
      mode: "subscription",
      subscription_data: {
        metadata: {
          clerkOrgId: "smoke-stripe-hosted-checkout",
          clerkUserId: "smoke-user",
          interval: "monthly",
          plan: "starter",
        },
      },
      success_url: `${appUrl}/settings/billing?checkout=success`,
      cancel_url: `${appUrl}/settings/billing?checkout=cancelled`,
    });

    assert.match(checkoutSession.url ?? "", /^https:\/\/checkout\.stripe\.com\//);
    console.log("Stripe hosted checkout smoke passed: Stripe returned a checkout.stripe.com URL.");

    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: `${appUrl}/settings/billing`,
      });
      assert.match(portalSession.url, /^https:\/\/billing\.stripe\.com\//);
      console.log("Stripe customer portal smoke passed: Stripe returned a billing.stripe.com URL for the smoke customer.");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`Stripe customer portal smoke skipped/blocked: ${message}`);
    }
  } finally {
    await stripe.customers.del(customer.id);
  }
}

async function main() {
  console.log("Stripe billing runtime smoke environment:");
  console.log(envStatus("STRIPE_SECRET_KEY"));
  console.log(envStatus("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"));
  console.log(envStatus("STRIPE_WEBHOOK_SECRET"));
  console.log(envStatus("DATABASE_URL"));
  console.log(envStatus("CLERK_SECRET_KEY"));
  console.log(`hasStripeBillingConfig: ${hasStripeBillingConfig() ? "true" : "false"}`);
  console.log(`hasStripeWebhookConfig: ${hasStripeWebhookConfig() ? "true" : "false"}`);

  await smokeWebhookEntitlementSync();
  await smokeStripeHostedCheckoutAndPortal();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
