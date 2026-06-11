import { describe, expect, it } from "vitest";
import { normalizeStripeSubscriptionStatus } from "@/lib/stripe/billing";

describe("normalizeStripeSubscriptionStatus", () => {
  it("passes through statuses the schema models directly", () => {
    for (const status of [
      "active",
      "trialing",
      "past_due",
      "canceled",
      "incomplete",
    ] as const) {
      expect(normalizeStripeSubscriptionStatus(status)).toBe(status);
    }
  });

  it("maps unpaid to past_due", () => {
    expect(normalizeStripeSubscriptionStatus("unpaid")).toBe("past_due");
  });

  it("maps incomplete_expired to canceled", () => {
    expect(normalizeStripeSubscriptionStatus("incomplete_expired")).toBe("canceled");
  });

  it("treats unrecognized statuses as incomplete", () => {
    expect(normalizeStripeSubscriptionStatus("paused")).toBe("incomplete");
    expect(normalizeStripeSubscriptionStatus("")).toBe("incomplete");
  });
});
