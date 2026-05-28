import { createClerkClient } from "@clerk/nextjs/server";
import { loadEnvConfig } from "@next/env";
import { expect, test, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { stat } from "node:fs/promises";
import {
  deleteOrganisationFromClerk,
  upsertOrganisationFromClerk,
  upsertProfileFromClerk,
} from "../../lib/clerk/sync";
import { getDb } from "../../lib/db";
import { featureFlags, trustCenters } from "../../lib/db/schema";

loadEnvConfig(process.cwd());

test.use({ locale: "cs-CZ" });

type BrowserClerk = {
  client: {
    signIn: {
      create(input: { strategy: "ticket"; ticket: string }): Promise<{
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

const smokeUserEmail = process.env.SMOKE_USER_EMAIL?.trim();
const clerkSecretKey = process.env.CLERK_SECRET_KEY?.trim();
const requireAuthenticatedE2E = process.env.REQUIRE_AUTHENTICATED_E2E === "true";
const canRunAuthenticatedFeatureVerification = Boolean(
  smokeUserEmail && clerkSecretKey && process.env.DATABASE_URL?.trim(),
);

if (requireAuthenticatedE2E && !canRunAuthenticatedFeatureVerification) {
  throw new Error(
    "test:e2e:authenticated requires SMOKE_USER_EMAIL, CLERK_SECRET_KEY, and DATABASE_URL.",
  );
}

let clerk: ReturnType<typeof createClerkClient>;
let smokeOrgId: string;
let smokeUserId: string;
let testingToken: string;
let smokeOrgCreated = false;

function pageUrl(pathname: string) {
  const url = new URL(pathname, "http://127.0.0.1");
  url.searchParams.set("__clerk_testing_token", testingToken);
  return `${url.pathname}${url.search}`;
}

async function signIn(page: Page) {
  if (!smokeUserEmail) {
    throw new Error("SMOKE_USER_EMAIL is required.");
  }

  const signInToken = await clerk.signInTokens.createSignInToken({
    expiresInSeconds: 120,
    userId: smokeUserId,
  });

  await page.goto(pageUrl("/sign-in"), { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() =>
    Boolean((window as unknown as { Clerk?: BrowserClerk }).Clerk?.loaded),
  );

  const result = await page.evaluate(
    async (credentials) => {
      const clerk = (window as unknown as { Clerk?: BrowserClerk }).Clerk;

      if (!clerk) {
        return {
          orgId: null,
          status: "missing_clerk",
          supportedSecondFactors: [],
          userId: null,
        };
      }

      const attempt = await clerk.client.signIn.create({
        strategy: "ticket",
        ticket: credentials.signInToken,
      });
      const supportedSecondFactors = (attempt.supportedSecondFactors ?? []).map(
        (factor) => factor.strategy,
      );

      if (!attempt.createdSessionId) {
        return {
          orgId: null,
          status: attempt.status,
          supportedSecondFactors,
          userId: null,
        };
      }

      await clerk.setActive({
        organization: credentials.organizationId,
        session: attempt.createdSessionId,
      });

      return {
        orgId: clerk.organization?.id ?? clerk.session?.lastActiveOrganizationId ?? null,
        status: attempt.status,
        supportedSecondFactors,
        userId: clerk.user?.id ?? null,
      };
    },
    {
      organizationId: smokeOrgId,
      signInToken: signInToken.token,
    },
  );

  expect(
    result.status,
    `Clerk sign-in did not complete; supported second factors: ${
      result.supportedSecondFactors.join(",") || "none"
    }`,
  ).toBe("complete");
  expect(result.orgId).toBe(smokeOrgId);
}

async function assertDownloadFile(
  download: import("@playwright/test").Download,
  expectedNamePart: string,
) {
  const filename = download.suggestedFilename();

  expect(filename).toContain(expectedNamePart);
  expect(filename).toMatch(/\.xlsx$/);

  const path = await download.path();
  expect(path, "download path should be available for local Playwright runs").toBeTruthy();

  const file = await stat(path as string);
  expect(file.size).toBeGreaterThan(1000);
}

test.describe("feature verification", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(
    !canRunAuthenticatedFeatureVerification,
    "requires smoke Clerk credentials and DATABASE_URL",
  );

  test.beforeAll(async () => {
    if (!clerkSecretKey) {
      throw new Error("CLERK_SECRET_KEY is required.");
    }

    clerk = createClerkClient({ secretKey: clerkSecretKey });
    const users = await clerk.users.getUserList({
      emailAddress: [smokeUserEmail ?? ""],
      limit: 1,
    });
    const user = users.data[0];

    if (!user) {
      throw new Error("SMOKE_USER_EMAIL must identify an existing Clerk user.");
    }

    smokeUserId = user.id;
    const orgName = `Feature Verification Smoke ${Date.now()} ${randomUUID().slice(0, 8)}`;
    const organization = await clerk.organizations.createOrganization({
      createdBy: smokeUserId,
      name: orgName,
    });

    smokeOrgId = organization.id;
    smokeOrgCreated = true;
    await clerk.organizations
      .createOrganizationMembership({
        organizationId: smokeOrgId,
        role: "org:admin",
        userId: smokeUserId,
      })
      .catch(() => null);
    await upsertOrganisationFromClerk({
      clerkOrgId: smokeOrgId,
      name: orgName,
      plan: "free",
    });
    await upsertProfileFromClerk({
      clerkOrgId: smokeOrgId,
      clerkUserId: smokeUserId,
      email: smokeUserEmail,
      fullName: "Feature Verification Smoke",
      role: "org:admin",
    });

    const db = getDb();
    await db
      .insert(featureFlags)
      .values([
        {
          enabled: true,
          flag: "smart-document-generation",
          orgId: smokeOrgId,
        },
        {
          enabled: true,
          flag: "client-trust-dashboard",
          orgId: smokeOrgId,
        },
      ])
      .onConflictDoUpdate({
        target: [featureFlags.orgId, featureFlags.flag],
        set: { enabled: true },
      });
    await db
      .insert(trustCenters)
      .values({
        clerkOrgId: smokeOrgId,
        isPublic: false,
        subdomain: `feature-verification-${randomUUID().slice(0, 8)}`,
        visibleFrameworks: [],
      })
      .onConflictDoUpdate({
        target: trustCenters.clerkOrgId,
        set: {
          isPublic: false,
          visibleFrameworks: [],
        },
      });

    const token = await clerk.testingTokens.createTestingToken();
    testingToken = token.token;
  });

  test.afterAll(async () => {
    if (!smokeOrgCreated || !smokeOrgId) {
      return;
    }

    await deleteOrganisationFromClerk(smokeOrgId).catch(() => null);
    await clerk.organizations.deleteOrganization(smokeOrgId).catch(() => null);
  });

  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("downloads NIS2 GAP analysis XLSX", async ({ page }) => {
    await page.goto(pageUrl("/frameworks/nis2"), { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    const button = page.getByRole("button", { name: /Stáhnout GAP analýzu/ });
    await expect(button).toBeVisible({ timeout: 15_000 });

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      button.click(),
    ]);

    await assertDownloadFile(download, "gap-analysis");
  });

  test("downloads vendor report XLSX", async ({ page }) => {
    await page.goto(pageUrl("/vendors"), { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    const button = page.getByRole("button", { name: /Stáhnout vendor report/ });
    await expect(button).toBeVisible({ timeout: 15_000 });

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      button.click(),
    ]);

    await assertDownloadFile(download, "vendor-report");
  });

  test("shows Trust Center client access controls", async ({ page }) => {
    await page.goto(pageUrl("/trust-center"), { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "Klientské přístupy" }),
    ).toBeVisible({ timeout: 15_000 });

    const publishNotice = page.getByText(/Nejprve zveřejněte Trust Center/);

    if (await publishNotice.isVisible()) {
      await expect(publishNotice).toBeVisible();
      return;
    }

    await page.getByRole("button", { name: "Přidat klientský přístup" }).click();
    await page.getByLabel("Název zákazníka").fill("Test Client");
    await page.getByRole("button", { name: "Vytvořit přístup" }).click();

    await expect(page.getByText("Test Client").first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
