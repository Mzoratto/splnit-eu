import { describe, expect, it } from "vitest";
import { calculateWeightedControlScore } from "@/lib/controls/scorer";

describe("calculateWeightedControlScore", () => {
  it("returns 100 for an empty status list by default", () => {
    expect(calculateWeightedControlScore([])).toBe(100);
  });

  it("honours the emptyScore option", () => {
    expect(calculateWeightedControlScore([], { emptyScore: 0 })).toBe(0);
  });

  it("scores all passing controls as 100", () => {
    expect(calculateWeightedControlScore(["pass", "pass", "pass"])).toBe(100);
  });

  it("scores all failing controls as 0", () => {
    expect(calculateWeightedControlScore(["fail", "fail"])).toBe(0);
  });

  it("weights manual_review and warning as half-compliant", () => {
    expect(calculateWeightedControlScore(["manual_review", "warning"])).toBe(50);
    expect(calculateWeightedControlScore(["pass", "manual_review"])).toBe(75);
  });

  it("treats unknown, null, and undefined statuses as non-passing", () => {
    expect(calculateWeightedControlScore(["unknown", null, undefined, "pass"])).toBe(25);
  });

  it("excludes not_applicable and out_of_scope from the denominator", () => {
    expect(
      calculateWeightedControlScore(["pass", "not_applicable", "out_of_scope"]),
    ).toBe(100);
    expect(
      calculateWeightedControlScore(["fail", "not_applicable"]),
    ).toBe(0);
  });

  it("returns the empty score when every status is excluded", () => {
    expect(calculateWeightedControlScore(["not_applicable", "out_of_scope"])).toBe(100);
    expect(
      calculateWeightedControlScore(["not_applicable"], { emptyScore: 0 }),
    ).toBe(0);
  });

  it("rounds to the nearest integer", () => {
    expect(calculateWeightedControlScore(["pass", "fail", "fail"])).toBe(33);
    expect(calculateWeightedControlScore(["pass", "pass", "fail"])).toBe(67);
  });
});
