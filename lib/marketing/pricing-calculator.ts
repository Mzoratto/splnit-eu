import {
  ANNUAL_MONTHS_CHARGED,
  FOUNDING_PRICING_ACTIVE,
  PLANS,
} from "@/lib/stripe/plans";

export type BillingInterval = "monthly" | "yearly";
export type CalculatorPlan = "sme" | "agency" | "custom";

/** Slider/stepper bounds. Agency caps at its client limit; above → custom. */
export const CALCULATOR_MIN_ICO = 1;
export const CALCULATOR_MAX_ICO = 25;
export const AGENCY_MAX_CLIENTS = PLANS.agency.limits.clients;

export type CalculatorEstimate = {
  plan: CalculatorPlan;
  /** CZK/month equivalent for the recommended plan (null when custom). */
  monthlyTotal: number | null;
  /** List CZK/month (for the struck-through anchor); null when custom. */
  listMonthlyTotal: number | null;
  /** What the customer pays for the chosen interval period (null when custom). */
  intervalTotal: number | null;
  /** Effective monthly price per IČO (null when custom). */
  perIcoMonthly: number | null;
  /** CZK saved over a year by paying yearly vs monthly. */
  annualSavings: number;
  /** True when the Agency founding discount is the active price. */
  foundingActive: boolean;
};

function clampIco(count: number): number {
  if (!Number.isFinite(count)) {
    return CALCULATOR_MIN_ICO;
  }

  return Math.min(CALCULATOR_MAX_ICO, Math.max(CALCULATOR_MIN_ICO, Math.round(count)));
}

/**
 * Maps a number of managed IČO to the recommended plan and a price estimate.
 * One IČO → SME; 2…20 → the flat Agency plan (so effective per-IČO price
 * falls as the count rises, which the flat price genuinely delivers); above
 * the Agency client limit → custom (contact). Estimator only — it never
 * transacts; the real charge is the Stripe price on checkout.
 */
export function computeCalculatorEstimate(
  rawCount: number,
  interval: BillingInterval,
): CalculatorEstimate {
  const count = clampIco(rawCount);

  let plan: CalculatorPlan;
  let monthlyTotal: number | null;
  let listMonthlyTotal: number | null;
  let foundingActive = false;

  if (count === 1) {
    plan = "sme";
    monthlyTotal = PLANS.sme.priceCzkMonthly;
    listMonthlyTotal = PLANS.sme.listCzkMonthly;
  } else if (count <= AGENCY_MAX_CLIENTS) {
    plan = "agency";
    monthlyTotal = PLANS.agency.priceCzkMonthly;
    listMonthlyTotal = PLANS.agency.listCzkMonthly;
    foundingActive =
      FOUNDING_PRICING_ACTIVE && PLANS.agency.priceCzkMonthly < PLANS.agency.listCzkMonthly;
  } else {
    return {
      annualSavings: 0,
      foundingActive: false,
      intervalTotal: null,
      listMonthlyTotal: null,
      monthlyTotal: null,
      perIcoMonthly: null,
      plan: "custom",
    };
  }

  const intervalTotal =
    interval === "yearly" ? monthlyTotal * ANNUAL_MONTHS_CHARGED : monthlyTotal;
  const annualSavings = monthlyTotal * (12 - ANNUAL_MONTHS_CHARGED);
  const perIcoMonthly = Math.round(monthlyTotal / count);

  return {
    annualSavings,
    foundingActive,
    intervalTotal,
    listMonthlyTotal,
    monthlyTotal,
    perIcoMonthly,
    plan,
  };
}
