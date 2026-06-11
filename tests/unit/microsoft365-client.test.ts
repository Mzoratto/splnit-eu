import { describe, expect, it } from "vitest";
import { isMicrosoftTokenFresh } from "@/lib/integrations/microsoft365/client";

const NOW = new Date("2026-06-11T12:00:00.000Z");
const SKEW_MS = 5 * 60 * 1000;

describe("isMicrosoftTokenFresh", () => {
  it("treats a missing expiry as stale", () => {
    expect(isMicrosoftTokenFresh(null, NOW, SKEW_MS)).toBe(false);
  });

  it("treats tokens expiring beyond the skew window as fresh", () => {
    const expiresAt = new Date(NOW.getTime() + SKEW_MS + 1000);
    expect(isMicrosoftTokenFresh(expiresAt, NOW, SKEW_MS)).toBe(true);
  });

  it("treats tokens expiring inside the skew window as stale", () => {
    const expiresAt = new Date(NOW.getTime() + SKEW_MS - 1000);
    expect(isMicrosoftTokenFresh(expiresAt, NOW, SKEW_MS)).toBe(false);
  });

  it("treats already-expired tokens as stale", () => {
    const expiresAt = new Date(NOW.getTime() - 1000);
    expect(isMicrosoftTokenFresh(expiresAt, NOW, SKEW_MS)).toBe(false);
  });
});
