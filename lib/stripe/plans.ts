export const PLANS = {
  free: {
    price: 0,
    limits: { frameworks: 1, integrations: 1, users: 1, vendors: 3, policies: 3 },
    features: ["framework_wizard", "manual_controls", "basic_policies"],
  },
  starter: {
    priceMonthly: 5900,
    priceAnnual: 4900,
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
    priceMonthly: 14900,
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
    priceMonthly: 29900,
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
