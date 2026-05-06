import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

function expectNoStore(response: { headers(): Record<string, string> }) {
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["pragma"]).toBe("no-cache");
}

test("sets baseline security headers", async ({ request }) => {
  const response = await request.get("/");

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-security-policy"]).toContain(
    "default-src 'self'",
  );
  expect(response.headers()["content-security-policy"]).toContain(
    "https://clerk.splnit.eu",
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
  expectNoStore(response);
});

test("requires authentication for workspace export", async ({ request }) => {
  const response = await request.get("/api/exports/workspace");

  expect(response.status()).toBe(401);
  expectNoStore(response);
});

test("requires authentication for workspace archive export", async ({
  request,
}) => {
  const response = await request.get("/api/exports/workspace/archive");

  expect(response.status()).toBe(401);
  expectNoStore(response);
});

test("requires authentication for evidence metadata export", async ({
  request,
}) => {
  const response = await request.get("/api/exports/evidence-metadata");

  expect(response.status()).toBe(401);
  expectNoStore(response);
});

test("requires authentication for audit log export filters", async ({
  request,
}) => {
  const response = await request.get(
    "/api/audit-log/export?from=2026-01-01&to=2026-01-31&limit=5000",
  );

  expect(response.status()).toBe(401);
  expectNoStore(response);
});

test("requires authentication for vendor, risk, and incident report exports", async ({
  request,
}) => {
  const vendorResponse = await request.get("/api/vendors/supply-chain-report");
  const riskResponse = await request.get("/api/risks/register-report");
  const cybersecurityResponse = await request.get(
    "/api/incidents/incident_test/cybersecurity-report",
  );
  const dataProtectionResponse = await request.get(
    "/api/incidents/incident_test/data-protection-report",
  );
  const legacyNukibResponse = await request.get(
    "/api/incidents/incident_test/nukib-report",
  );
  const legacyUoouResponse = await request.get(
    "/api/incidents/incident_test/uoou-report",
  );

  for (const response of [
    vendorResponse,
    riskResponse,
    cybersecurityResponse,
    dataProtectionResponse,
    legacyNukibResponse,
    legacyUoouResponse,
  ]) {
    expect(response.status()).toBe(401);
    expectNoStore(response);
  }
});

test("requires authentication for questionnaire PDF and XLSX exports", async ({
  request,
}) => {
  const payload = JSON.stringify({
    answers: [],
    artifactId: null,
    generatedAt: "2026-05-06T00:00:00.000Z",
    model: "test",
    organisationName: "Example",
    questionCount: 0,
    summary: "Example",
  });

  const pdfResponse = await request.post("/api/questionnaires/export/pdf", {
    multipart: { payload },
  });
  const xlsxResponse = await request.post("/api/questionnaires/export/xlsx", {
    multipart: { payload },
  });

  expect(pdfResponse.status()).toBe(401);
  expectNoStore(pdfResponse);
  expect(xlsxResponse.status()).toBe(401);
  expectNoStore(xlsxResponse);
});

test("requires authentication for integration OAuth callbacks", async ({
  request,
}) => {
  const githubResponse = await request.get(
    "/api/integrations/github/callback?installation_id=123&state=org_test",
  );
  const microsoftResponse = await request.get(
    "/api/integrations/microsoft/callback?code=test-code&state=org_test",
  );

  expect(githubResponse.status()).toBe(401);
  expect(microsoftResponse.status()).toBe(401);
});

test("schedules reminder jobs in Vercel cron", async () => {
  const configPath = path.join(process.cwd(), "vercel.json");
  const config = JSON.parse(await readFile(configPath, "utf8")) as {
    crons?: { path: string; schedule: string }[];
  };

  expect(config.crons).toContainEqual({
    path: "/api/cron/evidence-expiry",
    schedule: "0 7 * * *",
  });
  expect(config.crons).toContainEqual({
    path: "/api/cron/policy-review-reminders",
    schedule: "0 7 * * *",
  });
  expect(config.crons).toContainEqual({
    path: "/api/cron/access-review-reminders",
    schedule: "0 7 1 */3 *",
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
