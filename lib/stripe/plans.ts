export const PLANS = {
  free: {
    displayPrice: "0 Kč",
    limits: { clients: 0, frameworks: 1, integrations: 1, users: 1 },
    name: "Free",
  },
  sme: {
    displayPrice: "490 Kč/měsíc",
    envPriceId: "STRIPE_SME_PRICE_ID",
    limits: { clients: 1, frameworks: 999, integrations: 999, users: 25 },
    name: "SME",
  },
  agency: {
    displayPrice: "1 990 Kč/měsíc",
    envPriceId: "STRIPE_AGENCY_PRICE_ID",
    limits: { clients: 20, frameworks: 999, integrations: 999, users: 999 },
    name: "Agency",
  },
} as const;

export type PlanKey = keyof typeof PLANS;
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

export function hasPlanAccess(
  currentPlan: string | null | undefined,
  requiredPlan: PlanKey,
) {
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

export function getPriceIdForPlan(plan: BillablePlanKey) {
  const envKey = PLANS[plan].envPriceId;
  const priceId = process.env[envKey]?.trim();

  if (!priceId) {
    throw new Error(`${envKey} is required for ${plan} checkout.`);
  }

  return priceId;
}

export function getPlanFromPriceId(priceId: string | null | undefined) {
  if (!priceId) {
    return null;
  }

  for (const plan of BILLABLE_PLANS) {
    if (process.env[PLANS[plan].envPriceId]?.trim() === priceId) {
      return plan;
    }
  }

  return null;
}
