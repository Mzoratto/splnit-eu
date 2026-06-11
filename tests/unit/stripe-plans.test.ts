import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getPlanFromPriceId,
  hasPlanAccess,
  isBillablePlanKey,
  isPlanKey,
  normalizePlanKey,
  planGateBypassIsEnabled,
} from "@/lib/stripe/plans";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("normalizePlanKey", () => {
  it("passes through canonical plan keys", () => {
    expect(normalizePlanKey("free")).toBe("free");
    expect(normalizePlanKey("sme")).toBe("sme");
    expect(normalizePlanKey("agency")).toBe("agency");
  });

  it("maps legacy aliases", () => {
    expect(normalizePlanKey("business")).toBe("sme");
    expect(normalizePlanKey("starter")).toBe("sme");
    expect(normalizePlanKey("consultant")).toBe("agency");
  });

  it("falls back to free for unknown or missing plans", () => {
    expect(normalizePlanKey(null)).toBe("free");
    expect(normalizePlanKey(undefined)).toBe("free");
    expect(normalizePlanKey("enterprise")).toBe("free");
  });
});

describe("plan key guards", () => {
  it("identifies billable plans", () => {
    expect(isBillablePlanKey("sme")).toBe(true);
    expect(isBillablePlanKey("agency")).toBe(true);
    expect(isBillablePlanKey("free")).toBe(false);
    expect(isBillablePlanKey(null)).toBe(false);
  });

  it("identifies known plan keys", () => {
    expect(isPlanKey("free")).toBe(true);
    expect(isPlanKey("business")).toBe(false);
  });
});

describe("hasPlanAccess", () => {
  it("orders plans free < sme < agency", () => {
    expect(hasPlanAccess("agency", "sme")).toBe(true);
    expect(hasPlanAccess("sme", "agency")).toBe(false);
    expect(hasPlanAccess("free", "sme")).toBe(false);
    expect(hasPlanAccess("sme", "sme")).toBe(true);
  });

  it("treats unknown plans as free", () => {
    expect(hasPlanAccess("enterprise", "sme")).toBe(false);
    expect(hasPlanAccess(null, "free")).toBe(true);
  });
});

describe("planGateBypassIsEnabled", () => {
  it("is disabled by default", () => {
    expect(planGateBypassIsEnabled()).toBe(false);
  });

  it("requires both the flag and a test-route environment", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("TEST_BYPASS_PLAN_GATE", "true");
    expect(planGateBypassIsEnabled()).toBe(false);

    vi.stubEnv("ENABLE_TEST_ROUTES", "true");
    expect(planGateBypassIsEnabled()).toBe(true);
  });

  it("never weakens production billing gates", () => {
    vi.stubEnv("TEST_BYPASS_PLAN_GATE", "true");
    vi.stubEnv("ENABLE_TEST_ROUTES", "true");
    vi.stubEnv("NODE_ENV", "production");

    expect(planGateBypassIsEnabled()).toBe(false);
    expect(hasPlanAccess("free", "agency")).toBe(false);
  });
});

describe("getPlanFromPriceId", () => {
  it("resolves plans from configured Stripe price ids", () => {
    vi.stubEnv("STRIPE_SME_PRICE_ID", "price_sme_123");
    vi.stubEnv("STRIPE_AGENCY_PRICE_ID", "price_agency_456");

    expect(getPlanFromPriceId("price_sme_123")).toBe("sme");
    expect(getPlanFromPriceId("price_agency_456")).toBe("agency");
    expect(getPlanFromPriceId("price_other")).toBeNull();
    expect(getPlanFromPriceId(null)).toBeNull();
  });
});
