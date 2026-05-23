import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { POST as stripeWebhookPost } from "@/app/api/webhooks/stripe/route";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { organisations, subscriptions } from "@/lib/db/schema";
import {
  buildCheckoutSessionCreateParams,
  buildPortalSessionCreateParams,
} from "@/lib/stripe/session-params";
import { orgHasPlan } from "@/lib/stripe/subscriptions";

loadEnvConfig(process.cwd());

type EnvSnapshot = Record<string, string | undefined>;

const envKeys = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_SME_PRICE_ID",
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
  const checkoutParams = buildCheckoutSessionCreateParams({
    appUrl: "https://splnit.eu",
    customerId: "cus_upgrade_smoke",
    metadata: {
      clerkOrgId: "org_upgrade_smoke",
      clerkUserId: "user_upgrade_smoke",
      customerEmail: "upgrade-smoke@example.com",
      plan: "sme",
    },
    priceId: "price_smoke_sme_490czk",
  });
  assert.equal(checkoutParams.mode, "subscription");
  assert.equal(checkoutParams.customer, "cus_upgrade_smoke");
  assert.deepEqual(checkoutParams.line_items, [
    { price: "price_smoke_sme_490czk", quantity: 1 },
  ]);
  assert.equal(checkoutParams.success_url, "https://splnit.eu/settings/billing?success=true");
  assert.equal(checkoutParams.cancel_url, "https://splnit.eu/settings/billing?canceled=true");
  assert.equal(checkoutParams.subscription_data?.metadata?.plan, "sme");

  const portalParams = buildPortalSessionCreateParams({
    customerId: "cus_upgrade_smoke",
    returnUrl: "https://splnit.eu/settings/billing",
  });
  assert.deepEqual(portalParams, {
    customer: "cus_upgrade_smoke",
    return_url: "https://splnit.eu/settings/billing",
  });

  if (!hasDatabaseUrl()) {
    console.log("Stripe upgrade flow smoke passed; DATABASE_URL is missing, webhook DB check skipped.");
    return;
  }

  const originalEnv = snapshotEnv();
  const db = getDb();
  const clerkOrgId = `smoke-stripe-upgrade-${Date.now()}`;
  const stripeCustomerId = `cus_upgrade_smoke_${Date.now()}`;
  const secret = "whsec_smoke_local_upgrade";

  try {
    process.env.STRIPE_SECRET_KEY = "sk_test_smoke_local";
    process.env.STRIPE_WEBHOOK_SECRET = secret;
    process.env.STRIPE_SME_PRICE_ID = "price_smoke_sme_490czk";
    delete process.env.CLERK_SECRET_KEY;

    await db.delete(subscriptions).where(eq(subscriptions.clerkOrgId, clerkOrgId));
    await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
    await db.insert(organisations).values({
      clerkOrgId,
      country: "CZ",
      employeeCount: "1-10",
      locale: "cs-CZ",
      name: "Stripe Upgrade Smoke Org",
      plan: "free",
      primaryJurisdiction: "CZ",
      sector: "technology",
    });

    assert.equal(await orgHasPlan(clerkOrgId, "sme"), false);

    const checkoutEvent = stripeEvent("checkout.session.completed", {
      id: `cs_upgrade_smoke_${Date.now()}`,
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

    console.log("Stripe upgrade flow smoke passed.");
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
