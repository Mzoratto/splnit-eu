import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createClerkClient } from "@clerk/nextjs/server";
import { chromium, expect, type APIResponse, type Page } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import { and, desc, eq } from "drizzle-orm";
import { deleteBlobUrls } from "@/lib/blob/cleanup";
import {
  upsertOrganisationFromClerk,
  upsertProfileFromClerk,
} from "@/lib/clerk/sync";
import { getDb } from "@/lib/db";
import {
  auditLogs,
  evidence,
  frameworks,
  generatedArtifacts,
  orgControlStatuses,
  orgFrameworks,
  organisations,
  policies,
  profiles,
} from "@/lib/db/schema";

loadEnvConfig(process.cwd());

const baseUrl = process.env.AUTH_PRIMARY_FLOW_BASE_URL ?? "http://127.0.0.1:3012";
const databaseUrl = process.env.DATABASE_URL?.trim();
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
const secretKey = process.env.CLERK_SECRET_KEY?.trim();
const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
const runId = `auth_primary_flow_${Date.now()}`;
const orgName = `Splnit Auth Primary Flow ${runId}`;
const orgSlug = `splnit-auth-primary-flow-${Date.now()}`;
const testEmail = `splnit-auth-primary-flow+clerk_test_${Date.now()}@example.com`;
const testPassword = `SplnitTest-${Date.now()}-Aa!`;
const testUsername = `splnitauth${Date.now()}`;
const controlKey = "ctrl_mfa_all_users";
const evidenceDescription = `Authenticated primary flow evidence ${runId}`;

type BrowserClerk = {
  client: {
    signIn: {
      create(input: {
        identifier: string;
        password: string;
      }): Promise<{
        createdSessionId: string;
        status: string;
      }>;
    };
  };
  loaded?: boolean;
  organization?: { id: string } | null;
  session?: { lastActiveOrganizationId?: string | null } | null;
  setActive(input: {
    organization?: string;
    session?: string;
  }): Promise<unknown>;
  user?: { id: string } | null;
};

declare global {
  interface Window {
    Clerk?: BrowserClerk;
  }
}

assert.ok(databaseUrl, "DATABASE_URL is required.");
assert.ok(publishableKey, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required.");
assert.ok(secretKey, "CLERK_SECRET_KEY is required.");
assert.ok(blobToken, "BLOB_READ_WRITE_TOKEN is required for authenticated file flow.");

const parsedDatabaseUrl = new URL(databaseUrl);

if (
  !process.env.AUTH_PRIMARY_FLOW_ALLOW_LOCAL_DB &&
  ["localhost", "127.0.0.1", "::1"].includes(parsedDatabaseUrl.hostname)
) {
  throw new Error(
    `Refusing authenticated primary-flow smoke against local database host ${parsedDatabaseUrl.hostname}. Set AUTH_PRIMARY_FLOW_ALLOW_LOCAL_DB=1 to override.`,
  );
}

function getPageUrl(pathname: string, testingToken?: string) {
  const url = new URL(pathname, baseUrl);

  if (testingToken) {
    url.searchParams.set("__clerk_testing_token", testingToken);
  }

  return url.toString();
}

async function cleanupDatabase(clerkOrgId: string) {
  const db = getDb();
  const [evidenceBlobRows, policyBlobRows, artifactRows] = await Promise.all([
    db
      .select({ blobUrl: evidence.blobUrl })
      .from(evidence)
      .where(eq(evidence.clerkOrgId, clerkOrgId)),
    db
      .select({ blobUrl: policies.blobUrl })
      .from(policies)
      .where(eq(policies.clerkOrgId, clerkOrgId)),
    db
      .select({ content: generatedArtifacts.content })
      .from(generatedArtifacts)
      .where(eq(generatedArtifacts.clerkOrgId, clerkOrgId)),
  ]);
  const artifactBlobUrls = artifactRows.map((row) =>
    typeof row.content.blobUrl === "string" ? row.content.blobUrl : null,
  );

  await deleteBlobUrls([
    ...evidenceBlobRows.map((row) => row.blobUrl),
    ...policyBlobRows.map((row) => row.blobUrl),
    ...artifactBlobUrls,
  ]);

  await db.delete(auditLogs).where(eq(auditLogs.clerkOrgId, clerkOrgId));
  await db
    .delete(generatedArtifacts)
    .where(eq(generatedArtifacts.clerkOrgId, clerkOrgId));
  await db.delete(policies).where(eq(policies.clerkOrgId, clerkOrgId));
  await db.delete(evidence).where(eq(evidence.clerkOrgId, clerkOrgId));
  await db
    .delete(orgControlStatuses)
    .where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
  await db.delete(orgFrameworks).where(eq(orgFrameworks.clerkOrgId, clerkOrgId));
  await db.delete(profiles).where(eq(profiles.clerkOrgId, clerkOrgId));
  await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
}

async function clickButton(page: Page, name: RegExp) {
  await page.getByRole("button", { name }).click();
}

async function expectDownloadResponse(response: APIResponse, expectedContentType: RegExp) {
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"] ?? "").toMatch(expectedContentType);
  expect((await response.body()).length).toBeGreaterThan(100);
}

async function signIn(page: Page, input: {
  email: string;
  organizationId: string;
  password: string;
  testingToken: string;
}) {
  await page.goto(getPageUrl("/sign-in", input.testingToken), {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => Boolean(window.Clerk?.loaded));
  const result = await page.evaluate(async (credentials) => {
    const clerk = window.Clerk;

    if (!clerk) {
      return { orgId: null, status: "missing_clerk", userId: null };
    }

    const attempt = await clerk.client.signIn.create({
      identifier: credentials.email,
      password: credentials.password,
    });

    if (attempt.status !== "complete") {
      return { orgId: null, status: attempt.status, userId: null };
    }

    await clerk.setActive({
      organization: credentials.organizationId,
      session: attempt.createdSessionId,
    });

    return {
      orgId: clerk.organization?.id ?? null,
      status: attempt.status,
      userId: clerk.user?.id ?? null,
    };
  }, input);

  expect(result.status).toBe("complete");
  await page.waitForFunction(
    (organizationId) =>
      window.Clerk?.organization?.id === organizationId ||
      window.Clerk?.session?.lastActiveOrganizationId === organizationId,
    input.organizationId,
  );
}

async function runOnboarding(page: Page) {
  await page.goto(getPageUrl("/onboarding"), { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", {
      name: /Nastavení organizace|Organisation setup|Setup organizzazione/i,
    }),
  ).toBeVisible();

  await page.getByLabel(/Název firmy|Company name|Nome azienda/i).fill(orgName);
  await page.getByLabel(/IČO|Legal identifier|Identificativo legale/i).fill("IT-AUTH-SMOKE");
  await page.getByLabel(/Sektor|Sector|Settore/i).selectOption("technology");
  await page.getByLabel(/Počet zaměstnanců|Employee count|Numero dipendenti/i).selectOption("50-249");
  await page.getByLabel(/Země|Country|Paese/i).selectOption("IT");
  await page.getByLabel(/Primární jurisdikce|Primary jurisdiction|Giurisdizione primaria/i).selectOption("IT");
  await page.getByLabel(/Locale/i).selectOption("it-IT");
  await clickButton(page, /Pokračovat|Continue|Continua/i);

  await expect(
    page.getByRole("heading", {
      name: /Vyberte frameworky|Choose frameworks|Scegli i framework/i,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: /GDPR/i }).click();
  await clickButton(page, /Uložit frameworky|Save frameworks|Salva framework/i);

  await expect(
    page.getByRole("heading", {
      name: /AI nástroje|AI tools|Strumenti AI/i,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: /ChatGPT/i }).click();
  await page.getByRole("button", { name: /Microsoft Copilot/i }).click();
  await page.getByRole("button", { name: /GitHub Copilot/i }).click();
  await clickButton(page, /Uložit nástroje|Save tools|Salva strumenti/i);

  await expect(
    page.getByRole("heading", {
      name: /Doporučená integrace|Recommended integration|Integrazione consigliata/i,
    }),
  ).toBeVisible();
  await clickButton(page, /Zobrazit skóre|Show score|Mostra score/i);

  await expect(
    page.getByRole("heading", {
      name: /První baseline je připravená|first baseline is ready|prima baseline/i,
    }),
  ).toBeVisible();
  await clickButton(page, /Dokončit onboarding|Finish onboarding|Completa onboarding/i);
  await page.waitForURL(/\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: /Dashboard|Cruscotto|Přehled/i }),
  ).toBeVisible();
}

async function runFrameworkAssessment(page: Page) {
  await page.goto(getPageUrl("/frameworks/nis2/setup"), {
    waitUntil: "domcontentloaded",
  });

  for (let step = 0; step < 6; step += 1) {
    const fieldsets = page.locator("fieldset");
    const count = await fieldsets.count();

    for (let index = 0; index < count; index += 1) {
      await fieldsets.nth(index).getByRole("button").first().click();
    }

    const assessButton = page.getByRole("button", {
      name: /Vyhodnotit|Assess|Valuta/i,
    });

    if (await assessButton.isVisible()) {
      await assessButton.click();
      break;
    }

    await clickButton(page, /Pokračovat|Continue|Continua/i);
  }

  await expect(
    page.getByRole("heading", {
      name: /Gap assessment hotový|Gap assessment complete|Gap assessment completato/i,
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Otevřít kontroly|Open controls|Apri controlli/i }).click();
  await page.waitForURL(/\/frameworks\/nis2$/);
  await expect(page.getByText(controlKey)).toBeVisible();
}

async function updateControlAndUploadEvidence(page: Page) {
  const evidenceFile = path.join(os.tmpdir(), `${runId}-evidence.txt`);
  const expiresAt = new Date();
  expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + 1);

  await writeFile(evidenceFile, `Authenticated primary flow evidence ${runId}\n`);
  await page.goto(getPageUrl(`/controls/${controlKey}`), {
    waitUntil: "domcontentloaded",
  });
  await page.locator('select[name="status"]').selectOption("pass");
  await page.locator('textarea[name="notes"]').first().fill("Authenticated primary flow verified.");
  await clickButton(page, /Uložit status|Save status|Salva stato/i);
  await expect(page.locator('select[name="status"]')).toHaveValue("pass");

  await page.locator('input[name="file"]').setInputFiles(evidenceFile);
  await page.locator('input[name="source"]').fill("authenticated_primary_flow");
  await page
    .locator('input[name="expiresAt"]')
    .fill(expiresAt.toISOString().slice(0, 10));
  await page.locator('textarea[name="description"]').last().fill(evidenceDescription);
  await clickButton(page, /Nahrát soubor|Upload file|Carica file/i);
  await expect(page.getByText(evidenceDescription)).toBeVisible();

  await page.goto(getPageUrl("/evidence"), { waitUntil: "domcontentloaded" });
  await expect(page.getByText(evidenceDescription)).toBeVisible();
}

async function generatePolicyAndGapReport(page: Page) {
  await page.goto(getPageUrl("/policies/security_policy"), {
    waitUntil: "domcontentloaded",
  });
  await clickButton(page, /Vygenerovat PDF|Generate PDF|Genera PDF/i);
  await expect(
    page.getByRole("link", {
      name: /Stáhnout PDF|Download PDF|Scarica PDF/i,
    }),
  ).toBeVisible();

  await page.goto(getPageUrl("/frameworks/nis2"), {
    waitUntil: "domcontentloaded",
  });
  await clickButton(page, /Vygenerovat PDF|Generate PDF|Genera PDF/i);
  await expect(
    page.getByRole("link", {
      name: /Stáhnout poslední PDF|Download latest PDF|Scarica ultimo PDF/i,
    }),
  ).toBeVisible();
}

async function verifyDatabaseAndDownloads(page: Page, clerkOrgId: string) {
  const db = getDb();
  const organisationRows = await db
    .select()
    .from(organisations)
    .where(eq(organisations.clerkOrgId, clerkOrgId))
    .limit(1);
  const organisation = organisationRows[0];

  assert.ok(organisation, "organisation row should exist.");
  assert.equal(organisation.country, "IT");
  assert.equal(organisation.primaryJurisdiction, "IT");
  assert.equal(organisation.locale, "it-IT");
  assert.ok(organisation.onboardingCompletedAt, "onboarding should be completed.");

  const frameworkRows = await db
    .select({ slug: frameworks.slug })
    .from(orgFrameworks)
    .innerJoin(frameworks, eq(orgFrameworks.frameworkId, frameworks.id))
    .where(eq(orgFrameworks.clerkOrgId, clerkOrgId));
  const frameworkSlugs = frameworkRows.map((row) => row.slug).sort();

  assert.deepEqual(frameworkSlugs, ["gdpr", "nis2"]);

  const evidenceRows = await db
    .select({ id: evidence.id })
    .from(evidence)
    .where(eq(evidence.clerkOrgId, clerkOrgId))
    .orderBy(desc(evidence.collectedAt))
    .limit(1);
  const policyRows = await db
    .select({ id: policies.id, type: policies.type })
    .from(policies)
    .where(eq(policies.clerkOrgId, clerkOrgId))
    .orderBy(desc(policies.createdAt));
  const generatedRows = await db
    .select({ id: generatedArtifacts.id })
    .from(generatedArtifacts)
    .where(eq(generatedArtifacts.clerkOrgId, clerkOrgId));
  const statusRows = await db
    .select({ id: orgControlStatuses.id })
    .from(orgControlStatuses)
    .where(
      and(
        eq(orgControlStatuses.clerkOrgId, clerkOrgId),
        eq(orgControlStatuses.status, "pass"),
      ),
    );

  assert.ok(evidenceRows[0]?.id, "evidence upload should persist.");
  assert.ok(
    policyRows.some((policy) => policy.type === "security_policy"),
    "security policy should persist.",
  );
  assert.ok(
    policyRows.some((policy) => policy.type === "gap_report:nis2"),
    "NIS2 gap report should persist.",
  );
  assert.ok(generatedRows.length > 0, "gap report generated artifact should persist.");
  assert.ok(statusRows.length > 0, "control status updates should persist.");

  const evidenceResponse = await page.request.get(
    getPageUrl(`/api/evidence/${evidenceRows[0].id}/download`),
  );
  await expectDownloadResponse(evidenceResponse, /text\/plain/i);

  const securityPolicy = policyRows.find((policy) => policy.type === "security_policy");
  const gapReport = policyRows.find((policy) => policy.type === "gap_report:nis2");

  assert.ok(securityPolicy?.id, "security policy id should exist.");
  assert.ok(gapReport?.id, "gap report id should exist.");

  await expectDownloadResponse(
    await page.request.get(getPageUrl(`/api/policies/${securityPolicy.id}/download`)),
    /application\/pdf/i,
  );
  await expectDownloadResponse(
    await page.request.get(getPageUrl(`/api/policies/${gapReport.id}/download`)),
    /application\/pdf/i,
  );

  return {
    evidenceRows: evidenceRows.length,
    frameworkSlugs,
    generatedArtifacts: generatedRows.length,
    policies: policyRows.length,
    statusRows: statusRows.length,
  };
}

async function main() {
  const clerk = createClerkClient({ secretKey });
  let clerkUserId: string | null = null;
  let clerkOrgId: string | null = null;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;

  try {
    const user = await clerk.users.createUser({
      emailAddress: [testEmail],
      firstName: "Primary",
      lastName: "Flow",
      password: testPassword,
      skipLegalChecks: true,
      skipPasswordChecks: true,
      username: testUsername,
    });
    clerkUserId = user.id;

    const organization = await clerk.organizations.createOrganization({
      createdBy: user.id,
      name: orgName,
      slug: orgSlug,
    });
    clerkOrgId = organization.id;

    await clerk.organizations
      .createOrganizationMembership({
        organizationId: organization.id,
        role: "org:admin",
        userId: user.id,
      })
      .catch(() => null);

    await cleanupDatabase(organization.id);
    await upsertOrganisationFromClerk({
      clerkOrgId: organization.id,
      name: organization.name,
      plan: "free",
    });
    await upsertProfileFromClerk({
      clerkOrgId: organization.id,
      clerkUserId: user.id,
      email: testEmail,
      fullName: "Primary Flow",
      role: "org:admin",
    });

    const testingToken = await clerk.testingTokens.createTestingToken();
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      baseURL: baseUrl,
      locale: "cs-CZ",
      viewport: { height: 900, width: 1440 },
    });
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
      email: testEmail,
      organizationId: organization.id,
      password: testPassword,
      testingToken: testingToken.token,
    });
    await runOnboarding(page);
    await runFrameworkAssessment(page);
    await updateControlAndUploadEvidence(page);
    await generatePolicyAndGapReport(page);
    const summary = await verifyDatabaseAndDownloads(page, organization.id);

    assert.deepEqual(pageErrors, [], "browser page errors should be empty.");

    await context.close();

    console.log(
      JSON.stringify(
        {
          browserConsoleErrors: consoleErrors.length,
          clerkOrgCreated: Boolean(clerkOrgId),
          databaseHost: parsedDatabaseUrl.hostname,
          ok: true,
          ...summary,
        },
        null,
        2,
      ),
    );
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
