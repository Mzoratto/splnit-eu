import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ANNUAL_MONTHS_CHARGED,
  getAnnualPriceCzk,
  getPlanFromPriceId,
  getPriceIdForPlan,
  isAnnualBillingConfigured,
  PLANS,
} from "@/lib/stripe/plans";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("annual pricing math", () => {
  it("charges 2 months free (10× monthly)", () => {
    expect(ANNUAL_MONTHS_CHARGED).toBe(10);
    expect(getAnnualPriceCzk("sme")).toBe(PLANS.sme.priceCzkMonthly * 10);
    expect(getAnnualPriceCzk("agency")).toBe(PLANS.agency.priceCzkMonthly * 10);
    expect(getAnnualPriceCzk("sme")).toBe(19900);
    expect(getAnnualPriceCzk("agency")).toBe(49900);
  });
});

describe("interval-aware price-id resolution", () => {
  it("returns the monthly or annual env price id by interval", () => {
    vi.stubEnv("STRIPE_SME_PRICE_ID", "price_sme_m");
    vi.stubEnv("STRIPE_SME_ANNUAL_PRICE_ID", "price_sme_y");

    expect(getPriceIdForPlan("sme")).toBe("price_sme_m");
    expect(getPriceIdForPlan("sme", "monthly")).toBe("price_sme_m");
    expect(getPriceIdForPlan("sme", "yearly")).toBe("price_sme_y");
  });

  it("throws a clear error when the annual price id is missing", () => {
    vi.stubEnv("STRIPE_AGENCY_ANNUAL_PRICE_ID", "");
    expect(() => getPriceIdForPlan("agency", "yearly")).toThrow(
      /STRIPE_AGENCY_ANNUAL_PRICE_ID is required for agency yearly/,
    );
  });

  it("maps both monthly and annual price ids back to the plan", () => {
    vi.stubEnv("STRIPE_AGENCY_PRICE_ID", "price_ag_m");
    vi.stubEnv("STRIPE_AGENCY_ANNUAL_PRICE_ID", "price_ag_y");

    expect(getPlanFromPriceId("price_ag_m")).toBe("agency");
    expect(getPlanFromPriceId("price_ag_y")).toBe("agency");
    expect(getPlanFromPriceId("price_unknown")).toBeNull();
  });
});

describe("annual billing configuration gate", () => {
  it("is enabled only when both annual price ids are set", () => {
    vi.stubEnv("STRIPE_SME_ANNUAL_PRICE_ID", "price_sme_y");
    vi.stubEnv("STRIPE_AGENCY_ANNUAL_PRICE_ID", "");
    expect(isAnnualBillingConfigured()).toBe(false);

    vi.stubEnv("STRIPE_AGENCY_ANNUAL_PRICE_ID", "price_ag_y");
    expect(isAnnualBillingConfigured()).toBe(true);
  });
});
