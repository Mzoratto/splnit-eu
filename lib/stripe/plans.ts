/**
 * Founding pricing: the first customers pay the founding price, locked for
 * 12 months; list prices are shown struck-through. Flip this to false (and
 * point the Stripe env price IDs at the list-price Prices) to end the
 * founding period — no other code changes needed.
 */
export const FOUNDING_PRICING_ACTIVE = true;

/**
 * Annual billing is charged as N months (2 months free). Single source for
 * the calculator and any future annual checkout.
 */
export const ANNUAL_MONTHS_CHARGED = 10;

export const PLANS = {
  free: {
    displayPrice: "0 Kč",
    foundingPrice: null,
    priceCzkMonthly: 0,
    listCzkMonthly: 0,
    limits: { clients: 0, frameworks: 1, integrations: 1, users: 1 },
    name: "Free",
  },
  sme: {
    displayPrice: "1 990 Kč/měsíc",
    foundingPrice: null,
    // priceCzkMonthly = what a customer pays now; listCzkMonthly = list price.
    priceCzkMonthly: 1990,
    listCzkMonthly: 1990,
    envPriceId: "STRIPE_SME_PRICE_ID",
    envPriceIdAnnual: "STRIPE_SME_ANNUAL_PRICE_ID",
    limits: { clients: 1, frameworks: 999, integrations: 999, users: 25 },
    name: "SME",
  },
  agency: {
    displayPrice: "5 990 Kč/měsíc",
    foundingPrice: "4 990 Kč/měsíc",
    priceCzkMonthly: 4990,
    listCzkMonthly: 5990,
    envPriceId: "STRIPE_AGENCY_PRICE_ID",
    envPriceIdAnnual: "STRIPE_AGENCY_ANNUAL_PRICE_ID",
    limits: { clients: 20, frameworks: 999, integrations: 999, users: 999 },
    name: "Agency",
  },
} as const;

export type BillingInterval = "monthly" | "yearly";

/**
 * Annual price = the active monthly price × months charged (2 months free),
 * derived so it can never drift from the monthly source. The matching Stripe
 * annual Price must equal this amount.
 */
export function getAnnualPriceCzk(plan: BillablePlanKey): number {
  return PLANS[plan].priceCzkMonthly * ANNUAL_MONTHS_CHARGED;
}

/** True only when both annual Stripe price IDs are configured. */
export function isAnnualBillingConfigured(): boolean {
  return BILLABLE_PLANS.every((plan) =>
    Boolean(process.env[PLANS[plan].envPriceIdAnnual]?.trim()),
  );
}

export type PlanKey = keyof typeof PLANS;

/** The price a new customer actually pays right now. */
export function getActiveDisplayPrice(plan: PlanKey): string {
  const definition = PLANS[plan];

  if (FOUNDING_PRICING_ACTIVE && definition.foundingPrice) {
    return definition.foundingPrice;
  }

  return definition.displayPrice;
}
export const BILLABLE_PLANS = ["sme", "agency"] as const;
export type BillablePlanKey = (typeof BILLABLE_PLANS)[number];

export const PLAN_LIMITS: Record<PlanKey, {
  clients: number;
  frameworks: number;
  integrations: number;
  users: number;
}> = {
  agency: PLANS.agency.limits,
  free: PLANS.free.limits,
  sme: PLANS.sme.limits,
};

const PLAN_ORDER: Record<PlanKey, number> = {
  free: 0,
  sme: 1,
  agency: 2,
};

const LEGACY_PLAN_ALIASES: Record<string, PlanKey> = {
  business: "sme",
  consultant: "agency",
  starter: "sme",
};

export function isPlanKey(plan: string | null | undefined): plan is PlanKey {
  return Boolean(plan && plan in PLANS);
}

export function isBillablePlanKey(
  plan: string | null | undefined,
): plan is BillablePlanKey {
  return plan === "sme" || plan === "agency";
}

export function normalizePlanKey(plan: string | null | undefined): PlanKey {
  if (!plan) {
    return "free";
  }

  if (isPlanKey(plan)) {
    return plan;
  }

  return LEGACY_PLAN_ALIASES[plan] ?? "free";
}

export function planGateBypassIsEnabled() {
  if (process.env.TEST_BYPASS_PLAN_GATE !== "true") {
    return false;
  }

  // This flag is for CI/Playwright and smoke execution only. Do not allow it
  // to weaken production billing gates if an environment variable is mis-set.
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  return (
    process.env.NODE_ENV === "test" ||
    process.env.ENABLE_TEST_ROUTES === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_TEST_ROUTES === "true"
  );
}

export function hasPlanAccess(
  currentPlan: string | null | undefined,
  requiredPlan: PlanKey,
) {
  if (planGateBypassIsEnabled()) {
    return true;
  }

  return PLAN_ORDER[normalizePlanKey(currentPlan)] >= PLAN_ORDER[requiredPlan];
}

export function requirePlan(
  currentPlan: string | null | undefined,
  requiredPlan: PlanKey,
) {
  if (!hasPlanAccess(currentPlan, requiredPlan)) {
    throw new Error(`Plan ${requiredPlan} is required.`);
  }
}

export function getPriceIdForPlan(
  plan: BillablePlanKey,
  interval: BillingInterval = "monthly",
) {
  const envKey =
    interval === "yearly" ? PLANS[plan].envPriceIdAnnual : PLANS[plan].envPriceId;
  const priceId = process.env[envKey]?.trim();

  if (!priceId) {
    throw new Error(`${envKey} is required for ${plan} ${interval} checkout.`);
  }

  return priceId;
}

/** Resolves a Stripe price ID back to its plan, across both intervals. */
export function getPlanFromPriceId(priceId: string | null | undefined) {
  if (!priceId) {
    return null;
  }

  for (const plan of BILLABLE_PLANS) {
    const monthly = process.env[PLANS[plan].envPriceId]?.trim();
    const annual = process.env[PLANS[plan].envPriceIdAnnual]?.trim();

    if (priceId === monthly || priceId === annual) {
      return plan;
    }
  }

  return null;
}
