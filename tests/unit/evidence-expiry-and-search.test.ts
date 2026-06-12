import { describe, expect, it } from "vitest";
import { computeEvidenceExpiryStage } from "@/lib/db/queries/evidence";
import { buildSearchPattern, isSearchableQuery } from "@/lib/search/query";

const NOW = new Date("2026-06-11T00:00:00Z");

describe("evidence expiry alert stages", () => {
  it("fires the 30-day stage once when entering the window", () => {
    expect(computeEvidenceExpiryStage("2026-07-01", null, NOW)).toBe(30);
    // already sent -> no repeat
    expect(computeEvidenceExpiryStage("2026-07-01", 30, NOW)).toBeNull();
  });

  it("fires the 7-day stage even if the 30-day stage was sent", () => {
    expect(computeEvidenceExpiryStage("2026-06-15", 30, NOW)).toBe(7);
    expect(computeEvidenceExpiryStage("2026-06-15", 7, NOW)).toBeNull();
  });

  it("jumps straight to the 7-day stage when a cron skipped the 30-day window", () => {
    expect(computeEvidenceExpiryStage("2026-06-13", null, NOW)).toBe(7);
  });

  it("stays silent outside the window and after expiry", () => {
    expect(computeEvidenceExpiryStage("2026-12-01", null, NOW)).toBeNull();
    expect(computeEvidenceExpiryStage("2026-06-01", null, NOW)).toBeNull();
  });
});

describe("global search query helpers", () => {
  it("requires 2-80 characters after trimming", () => {
    expect(isSearchableQuery("a")).toBe(false);
    expect(isSearchableQuery("  a  ")).toBe(false);
    expect(isSearchableQuery("mfa")).toBe(true);
    expect(isSearchableQuery("x".repeat(81))).toBe(false);
  });

  it("escapes LIKE wildcards so user input matches literally", () => {
    expect(buildSearchPattern("mfa")).toBe("%mfa%");
    expect(buildSearchPattern("100%")).toBe("%100\\%%");
    expect(buildSearchPattern("a_b")).toBe("%a\\_b%");
    expect(buildSearchPattern("back\\slash")).toBe("%back\\\\slash%");
  });
});
