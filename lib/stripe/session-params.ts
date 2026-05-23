import type Stripe from "stripe";

export function buildCheckoutSessionCreateParams(input: {
  appUrl: string;
  cancelPath?: string;
  customerId: string;
  metadata: Record<string, string>;
  priceId: string;
  successPath?: string;
}): Stripe.Checkout.SessionCreateParams {
  return {
    allow_promotion_codes: true,
    customer: input.customerId,
    line_items: [{ price: input.priceId, quantity: 1 }],
    metadata: input.metadata,
    mode: "subscription",
    subscription_data: {
      metadata: input.metadata,
    },
    success_url: `${input.appUrl}${input.successPath ?? "/settings/billing?success=true"}`,
    cancel_url: `${input.appUrl}${input.cancelPath ?? "/settings/billing?canceled=true"}`,
  };
}

export function buildPortalSessionCreateParams(input: {
  customerId: string;
  returnUrl: string;
}): Stripe.BillingPortal.SessionCreateParams {
  return {
    customer: input.customerId,
    return_url: input.returnUrl,
  };
}
