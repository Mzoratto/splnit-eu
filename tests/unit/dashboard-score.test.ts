import { describe, expect, it } from "vitest";
import { calculateComplianceScore } from "@/lib/dashboard/score";

describe("calculateComplianceScore", () => {
  it("averages explicit framework scores when present", () => {
    expect(
      calculateComplianceScore({
        frameworkScores: [{ score: 80 }, { score: 60 }],
        statusRows: [{ status: "fail" }],
      }),
    ).toBe(70);
  });

  it("ignores null framework scores when averaging", () => {
    expect(
      calculateComplianceScore({
        frameworkScores: [{ score: 90 }, { score: null }],
        statusRows: [],
      }),
    ).toBe(90);
  });

  it("falls back to weighted status scoring when no framework scores exist", () => {
    expect(
      calculateComplianceScore({
        frameworkScores: [{ score: null }],
        statusRows: [{ status: "pass" }, { status: "manual_review" }],
      }),
    ).toBe(75);
  });

  it("returns 0 when there are no scores and no statuses", () => {
    expect(
      calculateComplianceScore({ frameworkScores: [], statusRows: [] }),
    ).toBe(0);
  });
});
