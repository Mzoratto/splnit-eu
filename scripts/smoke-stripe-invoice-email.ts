import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { POST as stripeWebhookPost } from "@/app/api/webhooks/stripe/route";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { organisations, subscriptions } from "@/lib/db/schema";
import { setEmailTransportForTesting } from "@/lib/email/send";

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
  if (!hasDatabaseUrl()) {
    console.log("Stripe invoice email smoke skipped: DATABASE_URL is missing.");
    return;
  }

  const originalEnv = snapshotEnv();
  const db = getDb();
  const clerkOrgId = `smoke-stripe-invoice-${Date.now()}`;
  const stripeCustomerId = `cus_invoice_smoke_${Date.now()}`;
  const secret = "whsec_smoke_local_invoice";
  const sentEmails: Array<{ subject: string; text: string; to: string }> = [];

  try {
    setEmailTransportForTesting((email) => {
      sentEmails.push({
        subject: email.subject,
        text: email.text,
        to: email.to,
      });
    });
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
      name: "Stripe Invoice Smoke Org",
      plan: "sme",
      primaryJurisdiction: "CZ",
      sector: "technology",
      stripeCustomerId,
    });
    await db.insert(subscriptions).values({
      clerkOrgId,
      plan: "sme",
      status: "active",
      stripeCustomerId,
      stripeSubscriptionId: `sub_invoice_smoke_${Date.now()}`,
    });

    const paidAt = Math.floor(Date.now() / 1000);
    const invoiceEvent = stripeEvent("invoice.payment_succeeded", {
      id: `in_smoke_${Date.now()}`,
      object: "invoice",
      amount_paid: 49_000,
      created: paidAt,
      currency: "czk",
      customer: stripeCustomerId,
      customer_email: "invoice-smoke@example.com",
      customer_name: "Stripe Invoice Smoke Org",
      hosted_invoice_url: "https://pay.stripe.com/invoice/smoke",
      invoice_pdf: "https://pay.stripe.com/invoice/smoke/pdf",
      number: "SMOKE-2026-0001",
      status_transitions: {
        finalized_at: paidAt,
        marked_uncollectible_at: null,
        paid_at: paidAt,
        voided_at: null,
      },
    });
    const invoiceResponse = await stripeWebhookPost(
      signStripeEvent({ event: invoiceEvent, secret }),
    );

    assert.equal(invoiceResponse.status, 200);
    assert.equal(sentEmails.length, 1);
    assert.equal(sentEmails[0]?.to, "invoice-smoke@example.com");
    assert.match(sentEmails[0]?.subject ?? "", /SMOKE-2026-0001/);
    assert.match(sentEmails[0]?.text ?? "", /490/);
    assert.match(sentEmails[0]?.text ?? "", /https:\/\/pay\.stripe\.com\/invoice\/smoke\/pdf/);

    console.log("Stripe invoice email smoke passed.");
  } finally {
    setEmailTransportForTesting(null);
    await db.delete(subscriptions).where(eq(subscriptions.clerkOrgId, clerkOrgId));
    await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
    restoreEnv(originalEnv);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
