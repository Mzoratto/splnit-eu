import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

test("sets baseline security headers", async ({ request }) => {
  const response = await request.get("/");

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-security-policy"]).toContain(
    "default-src 'self'",
  );
  expect(response.headers()["strict-transport-security"]).toContain(
    "max-age=63072000",
  );
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["permissions-policy"]).toContain("camera=()");
});

test("rejects unsupported manual integration run providers", async ({
  request,
}) => {
  const response = await request.post("/api/cron/run-tests", {
    data: {
      clerkOrgId: "org_test",
      provider: "unsupported",
    },
  });

  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toEqual({
    error: "Unsupported integration provider.",
  });
});

test("requires authentication for private evidence downloads", async ({
  request,
}) => {
  const response = await request.get("/api/evidence/ev_test/download");

  expect(response.status()).toBe(401);
});

test("requires authentication for workspace export", async ({ request }) => {
  const response = await request.get("/api/exports/workspace");

  expect(response.status()).toBe(401);
});

test("requires authentication for workspace archive export", async ({
  request,
}) => {
  const response = await request.get("/api/exports/workspace/archive");

  expect(response.status()).toBe(401);
});

test("requires authentication for evidence metadata export", async ({
  request,
}) => {
  const response = await request.get("/api/exports/evidence-metadata");

  expect(response.status()).toBe(401);
});

test("requires authentication for audit log export filters", async ({
  request,
}) => {
  const response = await request.get(
    "/api/audit-log/export?from=2026-01-01&to=2026-01-31&limit=5000",
  );

  expect(response.status()).toBe(401);
});

test("schedules evidence expiry reminders in Vercel cron", async () => {
  const configPath = path.join(process.cwd(), "vercel.json");
  const config = JSON.parse(await readFile(configPath, "utf8")) as {
    crons?: { path: string; schedule: string }[];
  };

  expect(config.crons).toContainEqual({
    path: "/api/cron/evidence-expiry",
    schedule: "0 7 * * *",
  });
});

test("service worker does not cache private workspace pages", async () => {
  const serviceWorkerPath = path.join(process.cwd(), "public", "sw.js");
  const serviceWorker = await readFile(serviceWorkerPath, "utf8");
  const appShellMatch = serviceWorker.match(/const APP_SHELL = \[([\s\S]*?)\];/);
  const appShell = appShellMatch?.[1] ?? "";

  expect(appShell).not.toContain('"/dashboard"');
  expect(appShell).not.toContain('"/frameworks"');
  expect(appShell).not.toContain('"/controls"');
  expect(serviceWorker).not.toContain('networkFirst(request, "/dashboard")');
  expect(serviceWorker).toContain('networkFirst(request, "/")');
  expect(serviceWorker).toContain("isPrivateRoute(url.pathname)");
});
