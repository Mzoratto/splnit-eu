import { afterEach, describe, expect, it, vi } from "vitest";
import { getAppUrl, readOptionalEnv, readRequiredEnv } from "@/lib/env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("readOptionalEnv", () => {
  it("returns trimmed values", () => {
    vi.stubEnv("SPLNIT_TEST_VALUE", "  hello  ");
    expect(readOptionalEnv("SPLNIT_TEST_VALUE")).toBe("hello");
  });

  it("returns null for missing or blank values", () => {
    expect(readOptionalEnv("SPLNIT_TEST_MISSING")).toBeNull();
    vi.stubEnv("SPLNIT_TEST_BLANK", "   ");
    expect(readOptionalEnv("SPLNIT_TEST_BLANK")).toBeNull();
  });
});

describe("readRequiredEnv", () => {
  it("returns the value when present", () => {
    vi.stubEnv("SPLNIT_TEST_REQUIRED", "value");
    expect(readRequiredEnv("SPLNIT_TEST_REQUIRED")).toBe("value");
  });

  it("throws a descriptive error when missing", () => {
    expect(() => readRequiredEnv("SPLNIT_TEST_MISSING")).toThrow(
      "SPLNIT_TEST_MISSING is required.",
    );
    expect(() =>
      readRequiredEnv("SPLNIT_TEST_MISSING", "for trust center emails"),
    ).toThrow("SPLNIT_TEST_MISSING is required for trust center emails.");
  });
});

describe("getAppUrl", () => {
  it("returns the configured URL without a trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://staging.splnit.eu/");
    expect(getAppUrl()).toBe("https://staging.splnit.eu");
  });

  it("falls back to the production URL when NODE_ENV is production", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(getAppUrl()).toBe("https://splnit.eu");
  });

  it("falls back to localhost outside production", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    vi.stubEnv("NODE_ENV", "development");
    expect(getAppUrl()).toBe("http://localhost:3000");
  });
});
