import { describe, expect, it } from "vitest";
import csMessages from "@/messages/cs-CZ.json";
import enMessages from "@/messages/en-EU.json";
import itMessages from "@/messages/it-IT.json";
import {
  AGENCY_MAX_CLIENTS,
  CALCULATOR_MAX_ICO,
  computeCalculatorEstimate,
} from "@/lib/marketing/pricing-calculator";
import { ANNUAL_MONTHS_CHARGED, PLANS } from "@/lib/stripe/plans";

const FORBIDDEN = ["soulad zaručen", "certifikováno NÚKIB", "jste v souladu"];

describe("pricing calculator estimate", () => {
  it("recommends SME for a single IČO at the SME price", () => {
    const e = computeCalculatorEstimate(1, "monthly");
    expect(e.plan).toBe("sme");
    expect(e.monthlyTotal).toBe(PLANS.sme.priceCzkMonthly);
    expect(e.intervalTotal).toBe(PLANS.sme.priceCzkMonthly);
    expect(e.perIcoMonthly).toBe(PLANS.sme.priceCzkMonthly);
  });

  it("recommends the flat Agency plan from 2 up to the client limit", () => {
    for (const count of [2, 10, AGENCY_MAX_CLIENTS]) {
      const e = computeCalculatorEstimate(count, "monthly");
      expect(e.plan, `count ${count}`).toBe("agency");
      expect(e.monthlyTotal).toBe(PLANS.agency.priceCzkMonthly);
    }
  });

  it("drives per-IČO price down as the count rises (flat Agency price)", () => {
    const two = computeCalculatorEstimate(2, "monthly").perIcoMonthly ?? 0;
    const twenty = computeCalculatorEstimate(20, "monthly").perIcoMonthly ?? 0;
    expect(twenty).toBeLessThan(two);
    expect(twenty).toBe(Math.round(PLANS.agency.priceCzkMonthly / 20));
  });

  it("computes a growing saving vs one SME plan per IČO on Agency", () => {
    const at5 = computeCalculatorEstimate(5, "monthly");
    const at20 = computeCalculatorEstimate(20, "monthly");

    expect(at5.separateSmeMonthly).toBe(PLANS.sme.priceCzkMonthly * 5);
    expect(at5.agencySavingsMonthly).toBe(
      PLANS.sme.priceCzkMonthly * 5 - PLANS.agency.priceCzkMonthly,
    );
    // The flat rate saves more as the managed count rises.
    expect(at20.agencySavingsMonthly ?? 0).toBeGreaterThan(at5.agencySavingsMonthly ?? 0);
  });

  it("never reports a negative saving when the flat rate is not yet cheaper", () => {
    // At 2 IČO, two SME plans (3 980) cost less than the flat Agency rate.
    const e = computeCalculatorEstimate(2, "monthly");
    expect(e.agencySavingsMonthly).toBe(0);
  });

  it("leaves the SME-comparison fields null off the Agency band", () => {
    const sme = computeCalculatorEstimate(1, "monthly");
    expect(sme.separateSmeMonthly).toBeNull();
    expect(sme.agencySavingsMonthly).toBeNull();

    const custom = computeCalculatorEstimate(AGENCY_MAX_CLIENTS + 1, "monthly");
    expect(custom.separateSmeMonthly).toBeNull();
    expect(custom.agencySavingsMonthly).toBeNull();
  });

  it("flags founding pricing as a real discount on Agency", () => {
    const e = computeCalculatorEstimate(5, "monthly");
    expect(e.foundingActive).toBe(true);
    expect(e.listMonthlyTotal).toBe(PLANS.agency.listCzkMonthly);
    expect(e.monthlyTotal).toBeLessThan(e.listMonthlyTotal ?? 0);
  });

  it("charges 10 months and saves 2 months on yearly billing", () => {
    const e = computeCalculatorEstimate(5, "yearly");
    expect(e.intervalTotal).toBe(PLANS.agency.priceCzkMonthly * ANNUAL_MONTHS_CHARGED);
    expect(e.annualSavings).toBe(PLANS.agency.priceCzkMonthly * 2);
  });

  it("returns custom (contact) above the Agency client limit", () => {
    const e = computeCalculatorEstimate(AGENCY_MAX_CLIENTS + 1, "monthly");
    expect(e.plan).toBe("custom");
    expect(e.monthlyTotal).toBeNull();
    expect(e.intervalTotal).toBeNull();
  });

  it("clamps out-of-range and invalid input", () => {
    expect(computeCalculatorEstimate(0, "monthly").plan).toBe("sme");
    expect(computeCalculatorEstimate(-5, "monthly").plan).toBe("sme");
    expect(computeCalculatorEstimate(9999, "monthly").plan).toBe("custom");
    expect(computeCalculatorEstimate(Number.NaN, "monthly").plan).toBe("sme");
  });

  it("never recommends Agency beyond the slider max being custom", () => {
    expect(CALCULATOR_MAX_ICO).toBeGreaterThan(AGENCY_MAX_CLIENTS);
  });
});

describe("pricing calculator i18n", () => {
  it("has the namespace in all three locales", () => {
    for (const m of [csMessages, enMessages, itMessages]) {
      expect(m.pricingCalculator.cta).toBeTruthy();
      expect(m.pricingCalculator.yearlyBadge).toBeTruthy();
      expect(m.pricingCalculator.totalMonth).toBeTruthy();
    }
  });

  it("contains no forbidden compliance-guarantee phrases", () => {
    const blob = JSON.stringify([
      csMessages.pricingCalculator,
      enMessages.pricingCalculator,
      itMessages.pricingCalculator,
    ]).toLowerCase();

    for (const phrase of FORBIDDEN) {
      expect(blob.includes(phrase.toLowerCase()), phrase).toBe(false);
    }
  });
});
