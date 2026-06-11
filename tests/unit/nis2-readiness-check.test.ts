import { describe, expect, it } from "vitest";
import {
  getReadinessScore,
  getScopeVerdict,
} from "@/components/marketing/nis2-readiness-check";

describe("getScopeVerdict", () => {
  it("returns likely for size-independent services regardless of size", () => {
    expect(
      getScopeVerdict({
        sectorCount: 0,
        size: "micro",
        sizeIndependent: true,
        turnover: false,
      }),
    ).toBe("likely");
  });

  it("returns likely when the size condition and a sector are both met", () => {
    expect(
      getScopeVerdict({
        sectorCount: 1,
        size: "medium",
        sizeIndependent: false,
        turnover: false,
      }),
    ).toBe("likely");
    // Turnover above EUR 10M satisfies the size condition even for small orgs.
    expect(
      getScopeVerdict({
        sectorCount: 2,
        size: "small",
        sizeIndependent: false,
        turnover: true,
      }),
    ).toBe("likely");
  });

  it("returns possible when only one of size or sector matches", () => {
    expect(
      getScopeVerdict({
        sectorCount: 0,
        size: "large",
        sizeIndependent: false,
        turnover: false,
      }),
    ).toBe("possible");
    expect(
      getScopeVerdict({
        sectorCount: 1,
        size: "micro",
        sizeIndependent: false,
        turnover: false,
      }),
    ).toBe("possible");
  });

  it("returns unlikely when neither size nor sector matches", () => {
    expect(
      getScopeVerdict({
        sectorCount: 0,
        size: "small",
        sizeIndependent: false,
        turnover: false,
      }),
    ).toBe("unlikely");
  });
});

describe("getReadinessScore", () => {
  const QUESTION_IDS = [
    "isms",
    "management",
    "hr_security",
    "continuity",
    "access_control",
    "identity_mfa",
    "detection_logging",
    "incident_response",
    "network_security",
    "application_security",
    "cryptography",
    "incident_impact",
  ] as const;

  function answersWith(value: "yes" | "partial" | "no") {
    return Object.fromEntries(QUESTION_IDS.map((id) => [id, value])) as Record<
      string,
      "yes" | "partial" | "no"
    >;
  }

  it("scores all-yes at 100 and all-no at 0", () => {
    expect(getReadinessScore(answersWith("yes"))).toBe(100);
    expect(getReadinessScore(answersWith("no"))).toBe(0);
  });

  it("scores all-partial at 50", () => {
    expect(getReadinessScore(answersWith("partial"))).toBe(50);
  });

  it("treats missing answers as gaps", () => {
    expect(getReadinessScore({})).toBe(0);
    expect(getReadinessScore({ isms: "yes" })).toBe(Math.round((2 / 24) * 100));
  });
});
