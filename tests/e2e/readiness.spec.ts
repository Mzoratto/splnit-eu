import { expect, test } from "@playwright/test";

function expectNoStore(response: { headers(): Record<string, string> }) {
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["pragma"]).toBe("no-cache");
}

test("reports production readiness without exposing secret values", async ({
  request,
}) => {
  const response = await request.get("/api/readiness");

  expect([200, 503]).toContain(response.status());
  expectNoStore(response);

  const body = await response.json();

  expect(body.service).toBe("splnit.eu");
  expect(typeof body.ok).toBe("boolean");
  expect(body.required.total).toBeGreaterThan(0);
  expect(body.recommended.total).toBeGreaterThan(0);
  expect(body.checks).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        level: "required",
        name: "database",
      }),
      expect.objectContaining({
        level: "required",
        name: "auth",
      }),
      expect.objectContaining({
        level: "recommended",
        name: "observability",
      }),
      expect.objectContaining({
        level: "recommended",
        name: "sentrySourceMaps",
      }),
    ]),
  );

  for (const check of body.checks) {
    expect(check).not.toHaveProperty("value");
  }
});

test("reports uncached health status", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expectNoStore(response);

  const body = await response.json();

  expect(body.service).toBe("splnit.eu");
  expect(body.readiness).toBe("/api/readiness");
  expect(body.ok).toBe(true);
});
