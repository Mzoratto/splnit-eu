"use server";

import {
  createCheckoutSession as _createCheckoutSession,
  createCustomerPortalSession as _createCustomerPortalSession,
  createPortalSession as _createPortalSession,
} from "@/lib/stripe/actions";

export async function createCheckoutSession(...args: Parameters<typeof _createCheckoutSession>) {
  return _createCheckoutSession(...args);
}

export async function createCustomerPortalSession(...args: Parameters<typeof _createCustomerPortalSession>) {
  return _createCustomerPortalSession(...args);
}

export async function createPortalSession(...args: Parameters<typeof _createPortalSession>) {
  return _createPortalSession(...args);
}