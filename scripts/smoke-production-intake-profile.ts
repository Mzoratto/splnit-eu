import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createClerkClient } from "@clerk/nextjs/server";
import { chromium, type Page } from "@playwright/test";
import { eq, sql } from "drizzle-orm";
import { loadEnvConfig } from "@next/env";
import { parse } from "dotenv";
import { upsertOrganisationFromClerk, upsertProfileFromClerk } from "@/lib/clerk/sync";
import { getDb } from "@/lib/db";
import type { IntakeDerivedScope } from "@/lib/onboarding/intake-scope";
import {
  organisations,
  orgControlStatuses,
  orgFrameworks,
  orgIntakeProfiles,
  profiles,
} from "@/lib/db/schema";

loadEnvConfig(process.cwd());

function loadLocalEnvForMissingValues() {
  const envLocalPath = ".env.local";
  if (!existsSync(envLocalPath)) {
    return;
  }

  const parsed = parse(readFileSync(envLocalPath));
  for (const [key, value] of Object.entries(parsed)) {
    if (!process.env[key]?.trim() && value.trim()) {
      process.env[key] = value;
    }
  }
}

loadLocalEnvForMissingValues();

const baseUrl = process.env.AUTH_PRIMARY_FLOW_BASE_URL ?? "https://splnit.eu";
const databaseUrl = process.env.DATABASE_URL?.trim();
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
const secretKey = process.env.CLERK_SECRET_KEY?.trim();
const smokeUserEmail = process.env.SMOKE_USER_EMAIL?.trim();
const smokeUserPassword = process.env.SMOKE_USER_PASSWORD?.trim();
const runId = `prod_intake_${Date.now()}_${randomUUID().slice(0, 8)}`;
const orgName = `Splnit Production Intake Smoke ${runId}`;

type BrowserClerk = {
  client: {
    signIn: {
      create(input: { identifier: string; password: string }): Promise<{
        createdSessionId: string | null;
        status: string;
        supportedSecondFactors?: Array<{ strategy: string }> | null;
      }>;
    };
  };
  loaded?: boolean;
  organization?: { id?: string } | null;
  session?: { lastActiveOrganizationId?: string | null } | null;
  setActive(input: { organization?: string; session?: string }): Promise<unknown>;
  user?: { id?: string } | null;
};

assert.ok(databaseUrl, "DATABASE_URL is required.");
assert.ok(publishableKey, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required.");
assert.ok(secretKey, "CLERK_SECRET_KEY is required.");
assert.ok(smokeUserEmail, "SMOKE_USER_EMAIL is required.");
assert.ok(smokeUserPassword, "SMOKE_USER_PASSWORD is required.");

const parsedDatabaseUrl = new URL(databaseUrl);
if (["localhost", "127.0.0.1", "::1"].includes(parsedDatabaseUrl.hostname)) {
  throw new Error(`Refusing production intake smoke against local database host ${parsedDatabaseUrl.hostname}.`);
}

function pageUrl(pathname: string, testingToken?: string) {
  const url = new URL(pathname, baseUrl);
  if (testingToken) {
    url.searchParams.set("__clerk_testing_token", testingToken);
  }
  return url.toString();
}

async function getSmokeUserId(clerk: ReturnType<typeof createClerkClient>) {
  const users = await clerk.users.getUserList({ emailAddress: [smokeUserEmail!], limit: 1 });
  const user = users.data[0];
  assert.ok(user, "SMOKE_USER_EMAIL must point to an existing verified Clerk production user.");
  return user.id;
}

async function signIn(page: Page, input: {
  email: string;
  organizationId: string;
  password: string;
  testingToken: string;
}) {
  await page.goto(pageUrl("/sign-in", input.testingToken), { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean((window as unknown as { Clerk?: BrowserClerk }).Clerk?.loaded));
  const result = await page.evaluate(async (credentials) => {
    const clerk = (window as unknown as { Clerk?: BrowserClerk }).Clerk;
    if (!clerk) {
      return { orgId: null, status: "missing_clerk", supportedSecondFactors: [], userId: null };
    }
    const attempt = await clerk.client.signIn.create({
      identifier: credentials.email,
      password: credentials.password,
    });
    const supportedSecondFactors = (attempt.supportedSecondFactors ?? []).map((factor) => factor.strategy);
    if (!attempt.createdSessionId) {
      return { orgId: null, status: attempt.status, supportedSecondFactors, userId: null };
    }
    await clerk.setActive({ organization: credentials.organizationId, session: attempt.createdSessionId });
    return {
      orgId: clerk.organization?.id ?? null,
      status: attempt.status,
      supportedSecondFactors,
      userId: clerk.user?.id ?? null,
    };
  }, input);

  assert.equal(
    result.status,
    "complete",
    `Clerk sign-in did not complete: ${result.status}; supported second factors: ${result.supportedSecondFactors.join(",") || "none"}`,
  );
  assert.equal(result.orgId, input.organizationId, "Clerk active org did not match smoke org.");
}

async function cleanupDatabase(clerkOrgId: string) {
  const db = getDb();
  await db.delete(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
  await db.delete(orgIntakeProfiles).where(eq(orgIntakeProfiles.clerkOrgId, clerkOrgId));
  await db.delete(orgFrameworks).where(eq(orgFrameworks.clerkOrgId, clerkOrgId));
  await db.delete(profiles).where(eq(profiles.clerkOrgId, clerkOrgId));
  await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
}

async function assertNoHorizontalOverflow(page: Page, label: string) {
  const result = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  const maxScrollWidth = Math.max(result.bodyScrollWidth, result.documentScrollWidth);
  assert.ok(
    maxScrollWidth <= result.viewportWidth + 1,
    `${label} should not horizontally overflow: viewport=${result.viewportWidth}, scrollWidth=${maxScrollWidth}`,
  );
}

async function verifyPolicyEvidenceControlDetail(page: Page, testingToken: string) {
  await page.setViewportSize({ width: 1280, height: 900 });
  const desktopResponse = await page.goto(pageUrl("/controls/ctrl_mfa_all_users", testingToken), {
    waitUntil: "domcontentloaded",
  });
  assert.equal(desktopResponse?.status(), 200, "production MFA control detail page should render.");
  await page.getByRole("heading", { name: /Recommended next action/i }).waitFor({ state: "visible" });
  await page.getByText(/Gap still open/i).waitFor({ state: "visible" });
  await page.getByText("Supporting evidence", { exact: true }).waitFor({ state: "visible" });
  await page.getByRole("link", { name: /Open security policy/i }).waitFor({ state: "visible" });
  await page.locator("#evidence-upload").waitFor({ state: "attached" });
  await page.locator("#status-review").waitFor({ state: "attached" });
  await assertNoHorizontalOverflow(page, "desktop policy-to-evidence control detail");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: /Recommended next action/i }).waitFor({ state: "visible" });
  await assertNoHorizontalOverflow(page, "mobile policy-to-evidence control detail");
}

async function verifyPersistedIntake(clerkOrgId: string) {
  const db = getDb();
  const rows = await db
    .select({
      answers: orgIntakeProfiles.answers,
      completedAt: orgIntakeProfiles.completedAt,
      derivedScope: orgIntakeProfiles.derivedScope,
      version: orgIntakeProfiles.version,
    })
    .from(orgIntakeProfiles)
    .where(eq(orgIntakeProfiles.clerkOrgId, clerkOrgId))
    .limit(1);
  const intake = rows[0];
  assert.ok(intake, "org_intake_profiles row should be created by production app write path.");
  assert.equal(intake.version, 1, "intake profile version should match current version.");
  assert.ok(intake.completedAt, "intake profile should be marked completed.");
  assert.equal(intake.answers.businessModel, "saas", "business model answer should round-trip.");
  assert.equal(intake.answers.handlesPersonalData, "customers_and_employees", "personal-data answer should round-trip.");
  const derivedScope = intake.derivedScope as IntakeDerivedScope;
  assert.ok(derivedScope.priorityControlKeys.length > 0, "derived scope should include priority controls.");
  assert.ok(derivedScope.applicableControlKeys.length > 0, "derived scope should include applicable controls.");
  assert.ok(derivedScope.outOfScopeControlKeys.length > 0, "derived scope should keep out-of-scope controls explicit.");

  const [statusCount] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(orgControlStatuses)
    .where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
  assert.ok((statusCount?.value ?? 0) > 0, "finishing onboarding should seed org control statuses from intake scope.");

  return {
    applicableControls: derivedScope.applicableControlKeys.length,
    outOfScopeControls: derivedScope.outOfScopeControlKeys.length,
    priorityControls: derivedScope.priorityControlKeys.length,
    seededStatuses: statusCount?.value ?? 0,
  };
}

async function selectVisibleOptionByIndex(page: Page, index: number, value: string) {
  await page.locator("select").nth(index).selectOption(value);
}

async function main() {
  const health = await fetch(new URL("/api/health", baseUrl));
  assert.equal(health.status, 200, "production /api/health should return HTTP 200.");

  const clerk = createClerkClient({ secretKey });
  let clerkOrgId: string | null = null;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;

  try {
    const smokeUserId = await getSmokeUserId(clerk);
    const organization = await clerk.organizations.createOrganization({ createdBy: smokeUserId, name: orgName });
    clerkOrgId = organization.id;
    await clerk.organizations.createOrganizationMembership({
      organizationId: organization.id,
      role: "org:admin",
      userId: smokeUserId,
    }).catch(() => null);

    await cleanupDatabase(organization.id).catch(() => null);
    await upsertOrganisationFromClerk({ clerkOrgId: organization.id, name: orgName, plan: "free" });
    await upsertProfileFromClerk({
      clerkOrgId: organization.id,
      clerkUserId: smokeUserId,
      email: smokeUserEmail!,
      fullName: "Production Intake Smoke",
      role: "org:admin",
    });

    const testingToken = await clerk.testingTokens.createTestingToken();
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ baseURL: baseUrl, locale: "en-US" });
    const page = await context.newPage();
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await signIn(page, {
      email: smokeUserEmail!,
      organizationId: organization.id,
      password: smokeUserPassword!,
      testingToken: testingToken.token,
    });

    const onboardingResponse = await page.goto(pageUrl("/onboarding", testingToken.token), { waitUntil: "domcontentloaded" });
    assert.equal(onboardingResponse?.status(), 200, "production onboarding page should render.");
    await page.locator("body").waitFor({ state: "visible" });
    await page.locator("input").first().fill(orgName);
    await selectVisibleOptionByIndex(page, 0, "technology");
    await selectVisibleOptionByIndex(page, 1, "10-49");
    await selectVisibleOptionByIndex(page, 2, "IT");
    await selectVisibleOptionByIndex(page, 3, "IT");
    await selectVisibleOptionByIndex(page, 4, "en-EU");
    await page.getByRole("button", { name: /continue|pokračovat|continua/i }).click();
    await page.locator("button").filter({ hasText: /GDPR|ISO 27001|NIS2/i }).first().waitFor({ state: "visible" });

    const gdprButton = page.locator("button").filter({ hasText: /GDPR/i }).first();
    const isoButton = page.locator("button").filter({ hasText: /ISO 27001/i }).first();
    if ((await gdprButton.count()) > 0) {
      await gdprButton.click();
    }
    if ((await isoButton.count()) > 0) {
      await isoButton.click();
    }
    await page.getByRole("button", { name: /save frameworks|uložit frameworky|salva framework/i }).click();

    await page.getByRole("button", { name: /save tools|uložit nástroje|salva strumenti/i }).click();

    await page.getByText(/preview|náhled|anteprima/i).first().waitFor({ state: "visible" });
    await selectVisibleOptionByIndex(page, 0, "saas");
    await selectVisibleOptionByIndex(page, 1, "technology");
    await selectVisibleOptionByIndex(page, 2, "10_49");
    await selectVisibleOptionByIndex(page, 3, "customers_and_employees");
    await selectVisibleOptionByIndex(page, 4, "false");
    await selectVisibleOptionByIndex(page, 5, "true");
    await selectVisibleOptionByIndex(page, 6, "true");
    await selectVisibleOptionByIndex(page, 7, "true");
    await selectVisibleOptionByIndex(page, 8, "false");
    await selectVisibleOptionByIndex(page, 9, "few");
    await selectVisibleOptionByIndex(page, 10, "internal_productivity");
    await selectVisibleOptionByIndex(page, 11, "false");
    await page.getByRole("button", { name: /save intake|uložit vstup|salva intake/i }).click();

    await page.getByRole("button", { name: /show score|zobrazit skóre|mostra punteggio/i }).click();
    await page.getByRole("button", { name: /finish|dokončit|completa/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
    await page.getByText(/Priority gaps based on your intake|Prioritní mezery podle vašeho vstupu|Gap prioritari basati/i).first().waitFor({ state: "visible" });

    const controlsResponse = await page.goto(pageUrl("/controls", testingToken.token), { waitUntil: "domcontentloaded" });
    assert.equal(controlsResponse?.status(), 200, "production controls page should render.");
    await page.getByRole("link", { name: /In-scope controls|Kontroly v rozsahu|Controlli in ambito/i }).waitFor({ state: "visible" });
    assert.ok(!page.url().includes("scope=out-of-scope"), "controls should default to the in-scope view.");

    const outOfScopeResponse = await page.goto(pageUrl("/controls?scope=out-of-scope", testingToken.token), { waitUntil: "domcontentloaded" });
    assert.equal(outOfScopeResponse?.status(), 200, "production out-of-scope controls view should render.");
    await page.getByRole("link", { name: /Out of scope \/ not applicable|Mimo rozsah \/ nerelevantní|Fuori ambito \/ non applicabile/i }).waitFor({ state: "visible" });

    await verifyPolicyEvidenceControlDetail(page, testingToken.token);

    const persisted = await verifyPersistedIntake(organization.id);
    assert.deepEqual(pageErrors, [], `Browser page errors: ${pageErrors.join(" | ")}`);

    const ignoredConsoleErrors = consoleErrors.filter((message) => !message.includes("favicon"));
    assert.deepEqual(ignoredConsoleErrors, [], `Browser console errors: ${ignoredConsoleErrors.join(" | ")}`);

    console.log(JSON.stringify({
      appUrl: baseUrl,
      checks: {
        controlsDefaultInScope: true,
        dashboardRenderedAfterWrite: true,
        healthOk: true,
        onboardingWritePath: true,
        outOfScopeFilterRendered: true,
        persistedReadBack: true,
        policyEvidenceControlDetailRendered: true,
        policyEvidenceNoDesktopOverflow: true,
        policyEvidenceNoMobileOverflow: true,
      },
      databaseHostClass: parsedDatabaseUrl.hostname.includes("neon.tech") ? "neon" : "non_local_other",
      persisted,
      runId,
    }, null, 2));
  } finally {
    if (browser) {
      await browser.close();
    }
    if (clerkOrgId) {
      await cleanupDatabase(clerkOrgId).catch((error: unknown) => {
        console.error(`Database cleanup failed for smoke org ${clerkOrgId}: ${error instanceof Error ? error.message : String(error)}`);
      });
      await clerk.organizations.deleteOrganization(clerkOrgId).catch((error: unknown) => {
        console.error(`Clerk cleanup failed for smoke org ${clerkOrgId}: ${error instanceof Error ? error.message : String(error)}`);
      });
    }
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
