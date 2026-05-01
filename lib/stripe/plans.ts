export const PLANS = {
  free: {
    price: 0,
    limits: { frameworks: 1, integrations: 1, users: 1, vendors: 3, policies: 3 },
    features: ["framework_wizard", "manual_controls", "basic_policies"],
  },
  starter: {
    priceMonthly: 147500,
    priceAnnual: 122500,
    limits: { frameworks: 2, integrations: 3, users: 5, vendors: 10, policies: 20 },
    features: [
      "starter_integrations",
      "automated_tests",
      "evidence_vault",
      "policy_library",
      "deadline_alerts",
    ],
  },
  business: {
    priceMonthly: 372500,
    priceAnnual: 310000,
    limits: { frameworks: 5, integrations: 10, users: 25, vendors: 50, policies: 999 },
    features: [
      "trust_center",
      "vendor_risk",
      "access_reviews",
      "incident_log",
      "risk_register",
      "questionnaire_ai",
    ],
  },
  consultant: {
    priceMonthly: 747500,
    priceAnnual: 622500,
    limits: {
      frameworks: 999,
      integrations: 999,
      users: 999,
      vendors: 999,
      policies: 999,
    },
    features: ["multi_client_dashboard", "white_label", "partner_badge", "api_access"],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
export type BillingInterval = "monthly" | "annual";

export const PLAN_LIMITS: Record<PlanKey, {
  frameworks: number;
  integrations: number;
  users: number;
  vendors: number;
  policies: number;
}> = {
  free: PLANS.free.limits,
  starter: PLANS.starter.limits,
  business: PLANS.business.limits,
  consultant: PLANS.consultant.limits,
};

export const BILLABLE_PLANS = ["starter", "business", "consultant"] as const;
export type BillablePlanKey = (typeof BILLABLE_PLANS)[number];

const PLAN_ORDER: Record<PlanKey, number> = {
  free: 0,
  starter: 1,
  business: 2,
  consultant: 3,
};

const PLAN_PRICE_LOOKUP_KEYS: Record<BillablePlanKey, Record<BillingInterval, string>> = {
  starter: {
    monthly:
      process.env.STRIPE_STARTER_MONTHLY_LOOKUP_KEY ??
      process.env.STRIPE_STARTER_PRICE_LOOKUP_KEY ??
      "starter_monthly",
    annual:
      process.env.STRIPE_STARTER_ANNUAL_LOOKUP_KEY ??
      "starter_annual",
  },
  business: {
    monthly:
      process.env.STRIPE_BUSINESS_MONTHLY_LOOKUP_KEY ??
      process.env.STRIPE_BUSINESS_PRICE_LOOKUP_KEY ??
      "business_monthly",
    annual:
      process.env.STRIPE_BUSINESS_ANNUAL_LOOKUP_KEY ??
      "business_annual",
  },
  consultant: {
    monthly:
      process.env.STRIPE_CONSULTANT_MONTHLY_LOOKUP_KEY ??
      process.env.STRIPE_CONSULTANT_PRICE_LOOKUP_KEY ??
      "consultant_monthly",
    annual:
      process.env.STRIPE_CONSULTANT_ANNUAL_LOOKUP_KEY ??
      "consultant_annual",
  },
};

export function isPlanKey(plan: string | null | undefined): plan is PlanKey {
  return Boolean(plan && plan in PLANS);
}

export function normalizePlanKey(plan: string | null | undefined): PlanKey {
  return isPlanKey(plan) ? plan : "free";
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

export function getLookupKeyForPlan(
  plan: BillablePlanKey,
  interval: BillingInterval,
) {
  return PLAN_PRICE_LOOKUP_KEYS[plan][interval];
}

export function getPlanFromLookupKey(lookupKey: string | null | undefined) {
  if (!lookupKey) {
    return null;
  }

  for (const plan of BILLABLE_PLANS) {
    const intervalKeys = PLAN_PRICE_LOOKUP_KEYS[plan];

    if (intervalKeys.monthly === lookupKey || intervalKeys.annual === lookupKey) {
      return plan;
    }
  }

  return null;
}
