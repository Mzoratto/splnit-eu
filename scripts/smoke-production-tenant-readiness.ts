import { strict as assert } from "node:assert";
import { createClerkClient } from "@clerk/nextjs/server";
import { chromium, type Page } from "@playwright/test";
import { eq } from "drizzle-orm";
import { loadEnvConfig } from "@next/env";
import { upsertOrganisationFromClerk, upsertProfileFromClerk } from "@/lib/clerk/sync";
import { getDb } from "@/lib/db";
import {
  orgFrameworks,
  profiles,
  trustCenterRequests,
  trustCenters,
  vendorAssessments,
  vendors,
  organisations,
} from "@/lib/db/schema";
import {
  createVendor,
  createVendorQuestionnaire,
  updateVendorQuestionnaireDelivery,
} from "@/lib/db/queries/vendors";
import {
  approveTrustCenterRequest,
  createTrustCenterRequest,
  upsertTrustCenterSettings,
} from "@/lib/db/queries/trust-center";
import { createVendorAssessmentToken } from "@/lib/vendors/access";
import {
  getVendorQuestionnaireDeliveryMetadata,
  getVendorQuestionnaireDeliveryStatus,
  type VendorQuestionnaireDeliveryResult,
} from "@/lib/vendors/delivery-status";
import { sendVendorQuestionnaireEmail } from "@/lib/vendors/notifications";

loadEnvConfig(process.cwd());

const baseUrl = process.env.AUTH_PRIMARY_FLOW_BASE_URL ?? "https://splnit.eu";
const databaseUrl = process.env.DATABASE_URL?.trim();
const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
const secretKey = process.env.CLERK_SECRET_KEY?.trim();
const smokeRecipientEmail = process.env.SMOKE_RECIPIENT_EMAIL?.trim();
const resendApiKey = process.env.RESEND_API_KEY?.trim();
const resendFrom = process.env.RESEND_FROM?.trim();
const runId = `prod_tenant_readiness_${Date.now()}`;
const orgName = `Splnit Production Readiness Smoke ${runId}`;
const testEmail = `splnit-${runId}@example.com`;
const testPassword = `SplnitSmoke-${Date.now()}-Aa!`;
const testUsername = `splnitsmoke${Date.now()}`.slice(0, 32);
const trustSlug = `smoke-${Date.now()}`;

type ProductionSmokeBrowserClerk = {
  client: {
    signIn: {
      create(input: { identifier: string; password: string }): Promise<{
        createdSessionId: string | null;
        status: string;
      }>;
    };
  };
  loaded?: boolean;
  setActive(input: { organization?: string; session?: string }): Promise<unknown>;
};

assert.ok(databaseUrl, "DATABASE_URL is required.");
assert.ok(blobToken, "BLOB_READ_WRITE_TOKEN is required.");
assert.ok(publishableKey, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required.");
assert.ok(secretKey, "CLERK_SECRET_KEY is required.");

const parsedDatabaseUrl = new URL(databaseUrl);
if (["localhost", "127.0.0.1", "::1"].includes(parsedDatabaseUrl.hostname)) {
  throw new Error(
    `Refusing production tenant readiness smoke against local database host ${parsedDatabaseUrl.hostname}.`,
  );
}

function pageUrl(pathname: string, testingToken?: string) {
  const url = new URL(pathname, baseUrl);
  if (testingToken) {
    url.searchParams.set("__clerk_testing_token", testingToken);
  }
  return url.toString();
}

async function cleanupDatabase(clerkOrgId: string) {
  const db = getDb();
  await db.delete(trustCenterRequests).where(eq(trustCenterRequests.clerkOrgId, clerkOrgId));
  await db.delete(trustCenters).where(eq(trustCenters.clerkOrgId, clerkOrgId));
  await db.delete(vendorAssessments).where(eq(vendorAssessments.clerkOrgId, clerkOrgId));
  await db.delete(vendors).where(eq(vendors.clerkOrgId, clerkOrgId));
  await db.delete(orgFrameworks).where(eq(orgFrameworks.clerkOrgId, clerkOrgId));
  await db.delete(profiles).where(eq(profiles.clerkOrgId, clerkOrgId));
  await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
}

async function signIn(page: Page, input: {
  email: string;
  organizationId: string;
  password: string;
  testingToken: string;
}) {
  await page.goto(pageUrl("/sign-in", input.testingToken), { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() =>
    Boolean((window as unknown as { Clerk?: ProductionSmokeBrowserClerk }).Clerk?.loaded),
  );
  const result = await page.evaluate(async (credentials) => {
    const clerk = (window as unknown as { Clerk?: ProductionSmokeBrowserClerk }).Clerk;
    if (!clerk) {
      return { orgId: null, status: "missing_clerk", userId: null };
    }
    const attempt = await clerk.client.signIn.create({
      identifier: credentials.email,
      password: credentials.password,
    });
    if (!attempt.createdSessionId) {
      return { orgId: null, status: attempt.status, userId: null };
    }
    await clerk.setActive({ session: attempt.createdSessionId });
    await clerk.setActive({ organization: credentials.organizationId });
    return { orgId: credentials.organizationId, status: attempt.status, userId: "created" };
  }, input);

  assert.equal(result.status, "complete", `Clerk sign-in did not complete: ${result.status}`);
  assert.equal(result.orgId, input.organizationId, "Clerk active org did not match smoke org.");
}

async function expectPageRendered(page: Page, pathname: string, options?: { testingToken?: string }) {
  const response = await page.goto(pageUrl(pathname, options?.testingToken), {
    waitUntil: "domcontentloaded",
  });
  assert.equal(response?.status(), 200, `${pathname} should return HTTP 200.`);
  await page.locator("body").waitFor({ state: "visible" });
  const body = (await page.locator("body").innerText()).trim();
  assert.ok(body.length > 40, `${pathname} should render non-empty content.`);
  assert.ok(!page.url().includes("/sign-in"), `${pathname} unexpectedly redirected to sign-in.`);
  return { pathname, title: await page.title() };
}

async function seedVendorQuestionnaire(clerkOrgId: string) {
  const vendor = await createVendor({
    category: "smoke",
    clerkOrgId,
    name: `Smoke Vendor ${runId}`,
    website: "https://example.com",
  });
  const recipient = smokeRecipientEmail ?? `vendor-${runId}@example.com`;
  const assessment = await createVendorQuestionnaire({
    clerkOrgId,
    vendorEmail: recipient,
    vendorId: vendor.id,
  });
  const token = createVendorAssessmentToken({
    assessmentId: assessment.id,
    clerkOrgId,
    vendorId: vendor.id,
  });
  const assessmentUrl = `${baseUrl}/vendor-assessment/${token}`;
  let deliveryResult: VendorQuestionnaireDeliveryResult = {
    emailsSent: 0,
    failed: null,
    skipped: "SMOKE_RECIPIENT_EMAIL is not configured.",
  };

  if (resendApiKey && resendFrom && smokeRecipientEmail) {
    deliveryResult = await sendVendorQuestionnaireEmail({
      assessmentUrl,
      organisationName: orgName,
      to: smokeRecipientEmail,
      vendorName: vendor.name,
    });
  }

  const deliveryState = getVendorQuestionnaireDeliveryStatus(deliveryResult);
  await updateVendorQuestionnaireDelivery({
    assessmentId: assessment.id,
    clerkOrgId,
    delivery: {
      ...getVendorQuestionnaireDeliveryMetadata({ result: deliveryResult, to: recipient }),
      tokenCreated: true,
      vendorEmail: recipient,
    },
    status: deliveryState.assessmentStatus,
    vendorId: vendor.id,
    vendorStatus: deliveryState.vendorStatus,
  });

  return {
    assessmentId: assessment.id,
    assessmentUrl,
    deliveryStatus: deliveryState.deliveryStatus,
    emailAttempted: Boolean(resendApiKey && resendFrom && smokeRecipientEmail),
    vendorId: vendor.id,
  };
}

async function seedTrustCenter(clerkOrgId: string) {
  await upsertTrustCenterSettings({
    clerkOrgId,
    isPublic: true,
    ndaRequired: true,
    showFrameworkDrilldown: false,
    showFrameworkPercentages: false,
    subdomain: trustSlug,
    visibleFrameworks: [],
  });
  const request = await createTrustCenterRequest({
    company: "Smoke Buyer",
    email: `buyer-${runId}@example.com`,
    orgSlug: trustSlug,
  });
  const approval = await approveTrustCenterRequest({
    appUrl: baseUrl,
    clerkOrgId,
    requestId: request.request.id,
    subdomain: trustSlug,
  });

  return { requestId: request.request.id, trustSlug, trustAccessUrl: approval.accessUrl };
}

async function main() {
  const clerk = createClerkClient({ secretKey });
  let clerkUserId: string | null = null;
  let clerkOrgId: string | null = null;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;

  try {
    const user = await clerk.users.createUser({
      emailAddress: [testEmail],
      firstName: "Production",
      lastName: "Smoke",
      password: testPassword,
      skipLegalChecks: true,
      skipPasswordChecks: true,
      username: testUsername,
    });
    clerkUserId = user.id;
    const organization = await clerk.organizations.createOrganization({
      createdBy: user.id,
      name: orgName,
    });
    clerkOrgId = organization.id;
    await clerk.organizations.createOrganizationMembership({
      organizationId: organization.id,
      role: "org:admin",
      userId: user.id,
    }).catch(() => null);

    await cleanupDatabase(organization.id).catch(() => null);
    await upsertOrganisationFromClerk({ clerkOrgId: organization.id, name: orgName, plan: "free" });
    await upsertProfileFromClerk({
      clerkOrgId: organization.id,
      clerkUserId: user.id,
      email: testEmail,
      fullName: "Production Smoke",
      role: "org:admin",
    });

    const vendor = await seedVendorQuestionnaire(organization.id);
    const trust = await seedTrustCenter(organization.id);
    const testingToken = await clerk.testingTokens.createTestingToken();

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ baseURL: baseUrl, locale: "cs-CZ" });
    const page = await context.newPage();
    const browserConsoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        browserConsoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await signIn(page, {
      email: testEmail,
      organizationId: organization.id,
      password: testPassword,
      testingToken: testingToken.token,
    });

    const renderedRoutes = [];
    for (const pathname of [
      "/dashboard",
      "/integrations",
      "/integrations/microsoft365",
      "/integrations/github",
      "/integrations/aws",
      "/trust-center",
      "/vendors",
      `/vendors/${vendor.vendorId}`,
      "/questionnaires",
    ]) {
      renderedRoutes.push(await expectPageRendered(page, pathname, { testingToken: testingToken.token }));
    }

    const publicTrustResponse = await page.goto(trust.trustAccessUrl, { waitUntil: "domcontentloaded" });
    assert.equal(publicTrustResponse?.status(), 200, "approved Trust Center access URL should render.");
    const vendorTokenResponse = await page.goto(vendor.assessmentUrl, { waitUntil: "domcontentloaded" });
    assert.equal(vendorTokenResponse?.status(), 200, "vendor assessment token URL should render.");
    assert.deepEqual(pageErrors, [], "browser page errors should be empty.");

    await context.close();

    console.log(JSON.stringify({
      baseUrl,
      browserConsoleErrors: browserConsoleErrors.length,
      databaseHost: parsedDatabaseUrl.hostname,
      emailAttempted: vendor.emailAttempted,
      mailboxProof: vendor.emailAttempted ? "send_attempted_check_controlled_mailbox" : "blocked_missing_resend_or_recipient_env",
      ok: true,
      pageErrors: pageErrors.length,
      renderedRoutes: renderedRoutes.map((route) => route.pathname),
      trustCenterRequestApproved: Boolean(trust.requestId),
      vendorAssessmentTokenRendered: true,
      vendorDeliveryStatus: vendor.deliveryStatus,
    }, null, 2));
  } finally {
    if (browser) {
      await browser.close();
    }
    if (clerkOrgId) {
      await cleanupDatabase(clerkOrgId).catch((error: unknown) => {
        console.error("Database cleanup failed:", error);
      });
      await clerk.organizations.deleteOrganization(clerkOrgId).catch(() => null);
    }
    if (clerkUserId) {
      await clerk.users.deleteUser(clerkUserId).catch(() => null);
    }
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
