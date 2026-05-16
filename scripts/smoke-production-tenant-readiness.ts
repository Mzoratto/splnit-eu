import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createClerkClient } from "@clerk/nextjs/server";
import { chromium, type BrowserContext, type Page } from "@playwright/test";
import { and, desc, eq } from "drizzle-orm";
import { loadEnvConfig } from "@next/env";
import { parse } from "dotenv";
import { upsertOrganisationFromClerk, upsertProfileFromClerk } from "@/lib/clerk/sync";
import { getDb } from "@/lib/db";
import { updateControlStatus } from "@/lib/db/queries/controls";
import {
  evidence,
  generatedArtifacts,
  auditLogs,
  organisations,
  orgControlStatuses,
  orgFrameworks,
  policies,
  profiles,
  trustCenterRequests,
  trustCenters,
  riskItems,
  vendorAssessments,
  vendors,
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
import { VENDOR_ASSESSMENT_QUESTIONS } from "@/lib/vendors/questions";
import { createManualEvidence } from "@/lib/db/queries/evidence";
import { insertGeneratedPolicy } from "@/lib/db/queries/policies";
import {
  QUESTIONNAIRE_ARTIFACT_KIND,
} from "@/lib/questionnaires/artifacts";
import { QuestionnaireResultSchema } from "@/lib/questionnaires/types";
import { getGeneratedArtifactForOrg } from "@/lib/db/queries/generated-artifacts";

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
const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
const secretKey = process.env.CLERK_SECRET_KEY?.trim();
const smokeUserEmail = process.env.SMOKE_USER_EMAIL?.trim();
const smokeUserPassword = process.env.SMOKE_USER_PASSWORD?.trim();
const smokeRecipientEmail = process.env.SMOKE_RECIPIENT_EMAIL?.trim();
const resendApiKey = process.env.RESEND_API_KEY?.trim();
const resendFrom = process.env.RESEND_FROM?.trim();
const liveQuestionnaireSmokeEnabled = process.env.SMOKE_LIVE_OPENAI_QUESTIONNAIRE?.trim().toLowerCase() === "true";
const runId = `prod_tenant_readiness_${Date.now()}`;
const orgName = `Splnit Production Readiness Smoke ${runId}`;
const trustSlug = `smoke-${Date.now()}`;

type ProductionSmokeBrowserClerk = {
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
assert.ok(blobToken, "BLOB_READ_WRITE_TOKEN is required.");
assert.ok(publishableKey, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required.");
assert.ok(secretKey, "CLERK_SECRET_KEY is required.");
assert.ok(smokeUserEmail, "SMOKE_USER_EMAIL is required.");
assert.ok(smokeUserPassword, "SMOKE_USER_PASSWORD is required.");
assert.equal(
  liveQuestionnaireSmokeEnabled,
  true,
  "SMOKE_LIVE_OPENAI_QUESTIONNAIRE=true is required to prove live OpenAI questionnaire generation in production.",
);

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
  await db.delete(riskItems).where(eq(riskItems.clerkOrgId, clerkOrgId));
  await db.delete(evidence).where(eq(evidence.clerkOrgId, clerkOrgId));
  await db.delete(generatedArtifacts).where(eq(generatedArtifacts.clerkOrgId, clerkOrgId));
  await db.delete(policies).where(eq(policies.clerkOrgId, clerkOrgId));
  await db.delete(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
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
    await clerk.setActive({
      organization: credentials.organizationId,
      session: attempt.createdSessionId,
    });
    const activeOrgId = clerk.organization?.id ?? null;
    return {
      orgId: activeOrgId,
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
  await page.waitForFunction(
    (organizationId) => {
      const clerk = (window as unknown as { Clerk?: ProductionSmokeBrowserClerk }).Clerk;
      return (
        clerk?.organization?.id === organizationId ||
        clerk?.session?.lastActiveOrganizationId === organizationId
      );
    },
    input.organizationId,
  );
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

function addYears(date: Date, years: number) {
  const copy = new Date(date);
  copy.setFullYear(copy.getFullYear() + years);
  return copy;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

const liveQuestionnaireText = "Do you enforce MFA for all administrative users?";

function vendorSmokeAnswers() {
  return Object.fromEntries(
    VENDOR_ASSESSMENT_QUESTIONS.map((question) => [
      question.id,
      "reverseScore" in question && question.reverseScore ? "no" : "yes",
    ]),
  ) as Record<string, string>;
}

async function seedQuestionnaireSupportContext(input: { clerkOrgId: string; createdBy: string }) {
  const controlKey = "ctrl_mfa_all_users";
  await updateControlStatus({
    clerkOrgId: input.clerkOrgId,
    controlKey,
    notes: `Production readiness live questionnaire smoke ${runId}: MFA is required for administrative access.`,
    status: "pass",
  });
  await createManualEvidence({
    blobUrl: `production-smoke://questionnaire-live/${runId}/mfa.txt`,
    clerkOrgId: input.clerkOrgId,
    collectedBy: input.createdBy,
    controlKey,
    description: `Production readiness live questionnaire smoke ${runId}: MFA required for administrative access.`,
    expiresAt: isoDate(addYears(new Date(), 1)),
    fileType: "text/plain",
    source: "production_readiness_live_questionnaire_smoke",
  });
  await insertGeneratedPolicy({
    blobUrl: `production-smoke://questionnaire-live/${runId}/access-control-policy.pdf`,
    clerkOrgId: input.clerkOrgId,
    content: {
      generatedAt: new Date().toISOString(),
      smokeRunId: runId,
      sections: [
        {
          body: "Administrative access requires multi-factor authentication.",
          title: "Access control",
        },
      ],
    },
    controlKeys: [controlKey],
    expiresAt: isoDate(addYears(new Date(), 1)),
    title: "Production smoke access control policy",
    type: "security_policy",
  });
}

async function getLatestLiveQuestionnaireArtifact(input: { clerkOrgId: string }) {
  const db = getDb();
  const rows = await db
    .select()
    .from(generatedArtifacts)
    .where(
      and(
        eq(generatedArtifacts.clerkOrgId, input.clerkOrgId),
        eq(generatedArtifacts.kind, QUESTIONNAIRE_ARTIFACT_KIND),
        eq(generatedArtifacts.source, "questionnaire_ai"),
      ),
    )
    .orderBy(desc(generatedArtifacts.createdAt))
    .limit(1);
  const artifact = rows[0] ?? null;
  assert.ok(artifact, "live questionnaire generation should create a questionnaire_ai artifact.");
  assert.ok(artifact.model, "live questionnaire artifact should record the provider model.");
  assert.notEqual(artifact.model, "production-smoke-fixture", "live questionnaire artifact must not be the fixture model.");
  assert.notEqual(artifact.model, "fallback:no-supported-context", "live questionnaire artifact must not be the no-context fallback.");

  const content = artifact.content as { result?: unknown };
  const result = QuestionnaireResultSchema.parse(content.result);
  assert.equal(result.questionCount, 1, "live questionnaire smoke should generate exactly one answer.");
  assert.equal(result.answers.length, 1, "live questionnaire smoke should persist one answer.");
  assert.equal(result.answers[0]?.question, liveQuestionnaireText, "live generated answer should match the submitted question.");
  assert.equal(result.answers[0]?.reviewStatus, "draft", "live generated answer should start as draft.");
  assert.notEqual(result.model, "fallback:no-supported-context", "live generated result must not use fallback model.");

  return {
    artifactId: artifact.id,
    model: artifact.model,
    question: result.answers[0]!.question,
    questionCount: result.questionCount,
    source: artifact.source,
  };
}

async function getQuestionnaireReviewStatus(input: { artifactId: string; clerkOrgId: string }) {
  const artifact = await getGeneratedArtifactForOrg({
    artifactId: input.artifactId,
    clerkOrgId: input.clerkOrgId,
    kind: QUESTIONNAIRE_ARTIFACT_KIND,
  });
  assert.ok(artifact, "Questionnaire artifact should exist after review.");
  const content = artifact.content as { result?: unknown };
  const result = QuestionnaireResultSchema.parse(content.result);

  return result.answers[0] ?? null;
}

async function expectQuestionnaireReviewPersisted(input: { artifactId: string; clerkOrgId: string }) {
  const startedAt = Date.now();
  let lastStatus: string | null = null;

  while (Date.now() - startedAt < 10_000) {
    const answer = await getQuestionnaireReviewStatus(input);
    lastStatus = answer?.reviewStatus ?? null;

    if (
      answer?.reviewStatus === "approved" &&
      answer.answer.includes("Production smoke reviewer-approved answer") &&
      answer.notes.includes("Production smoke approved")
    ) {
      return answer;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Questionnaire review did not persist; last status: ${lastStatus ?? "missing"}.`);
}

async function expectVendorAssessmentSubmitted(input: {
  assessmentId: string;
  clerkOrgId: string;
  expectedAnswers: Record<string, string>;
  vendorId: string;
}) {
  const db = getDb();
  const rows = await db
    .select({
      answers: vendorAssessments.answers,
      assessedAt: vendorAssessments.assessedAt,
      assessmentScore: vendorAssessments.score,
      assessmentStatus: vendorAssessments.status,
      vendorLastAssessedAt: vendors.lastAssessedAt,
      vendorNextReviewAt: vendors.nextReviewAt,
      vendorRiskTier: vendors.riskTier,
      vendorStatus: vendors.status,
    })
    .from(vendorAssessments)
    .innerJoin(vendors, eq(vendorAssessments.vendorId, vendors.id))
    .where(
      and(
        eq(vendorAssessments.id, input.assessmentId),
        eq(vendorAssessments.clerkOrgId, input.clerkOrgId),
        eq(vendorAssessments.vendorId, input.vendorId),
        eq(vendors.clerkOrgId, input.clerkOrgId),
        eq(vendors.id, input.vendorId),
      ),
    )
    .limit(1);

  const row = rows[0] ?? null;
  assert.ok(row, "submitted vendor assessment should be readable in the originating tenant.");
  assert.equal(row.assessmentStatus, "submitted", "vendor assessment status should become submitted.");
  assert.equal(row.assessmentScore, 100, "smoke vendor assessment should score 100.");
  assert.ok(row.assessedAt, "vendor assessment should record assessedAt.");
  assert.equal(row.vendorStatus, "assessed", "originating vendor status should propagate to assessed.");
  assert.equal(row.vendorRiskTier, "low", "originating vendor risk tier should propagate to low.");
  assert.ok(row.vendorLastAssessedAt, "originating vendor should record lastAssessedAt.");
  assert.ok(row.vendorNextReviewAt, "originating vendor should record nextReviewAt.");

  const answers = row.answers as Record<string, unknown>;
  for (const [questionId, expectedAnswer] of Object.entries(input.expectedAnswers)) {
    assert.equal(
      answers[questionId],
      expectedAnswer,
      `submitted vendor answer for ${questionId} should persist.`,
    );
  }

  return {
    assessmentStatus: row.assessmentStatus,
    score: row.assessmentScore,
    vendorRiskTier: row.vendorRiskTier,
    vendorStatus: row.vendorStatus,
  };
}


type ExportFixtures = {
  auditAction: string;
  crossOrgId: string;
  crossRiskTitle: string;
  crossVendorName: string;
  riskTitle: string;
};

type ExportResponse = {
  body: Buffer;
  contentDisposition: string | null;
  contentType: string | null;
  status: number;
};

async function seedExportFixtures(input: { clerkOrgId: string; clerkUserId: string }): Promise<ExportFixtures> {
  const db = getDb();
  const auditAction = `production_export_smoke_${runId}`;
  const crossOrgId = `org_export_cross_${runId}`;
  const crossVendorName = `Forbidden Cross Org Vendor ${runId}`;
  const crossRiskTitle = `Forbidden Cross Org Risk ${runId}`;
  const riskTitle = `Smoke Export Risk ${runId}`;
  const now = Date.now();

  await db.insert(organisations).values({
    clerkOrgId: crossOrgId,
    name: `Forbidden Cross Org ${runId}`,
    plan: "free",
  }).onConflictDoNothing();

  await db.insert(auditLogs).values([
    {
      action: auditAction,
      clerkOrgId: input.clerkOrgId,
      clerkUserId: input.clerkUserId,
      createdAt: new Date(now - 1_000),
      entityId: randomUUID(),
      entityType: "export_smoke",
      metadata: { marker: `current-a-${runId}` },
    },
    {
      action: auditAction,
      clerkOrgId: input.clerkOrgId,
      clerkUserId: input.clerkUserId,
      createdAt: new Date(now - 2_000),
      entityId: randomUUID(),
      entityType: "export_smoke",
      metadata: { marker: `current-b-${runId}` },
    },
    {
      action: auditAction,
      clerkOrgId: input.clerkOrgId,
      clerkUserId: input.clerkUserId,
      createdAt: new Date(now - 3_000),
      entityId: randomUUID(),
      entityType: "export_smoke",
      metadata: { marker: `current-c-${runId}` },
    },
    {
      action: auditAction,
      clerkOrgId: crossOrgId,
      clerkUserId: input.clerkUserId,
      createdAt: new Date(now - 500),
      entityId: randomUUID(),
      entityType: "export_smoke",
      metadata: { marker: `forbidden-cross-${runId}` },
    },
  ]);

  await db.insert(vendors).values({
    category: "smoke",
    clerkOrgId: crossOrgId,
    name: crossVendorName,
    riskTier: "critical",
    status: "assessed",
    website: "https://forbidden.example.com",
  });

  await db.insert(riskItems).values([
    {
      category: "access-control",
      clerkOrgId: input.clerkOrgId,
      description: `Production export smoke current org risk ${runId}`,
      impact: 3,
      likelihood: 2,
      owner: "Production Smoke",
      riskScore: 6,
      status: "open",
      title: riskTitle,
    },
    {
      category: "forbidden-cross-org",
      clerkOrgId: crossOrgId,
      description: `Production export smoke forbidden cross org risk ${runId}`,
      impact: 5,
      likelihood: 5,
      owner: "Forbidden Cross Org",
      riskScore: 25,
      status: "open",
      title: crossRiskTitle,
    },
  ]);

  return { auditAction, crossOrgId, crossRiskTitle, crossVendorName, riskTitle };
}

async function expectUnauthenticatedExportRejected(pathname: string) {
  const response = await fetch(new URL(pathname, baseUrl), { redirect: "manual" });
  assert.equal(response.status, 401, `${pathname} should reject unauthenticated requests.`);
  assert.match(
    response.headers.get("cache-control") ?? "",
    /private|no-store/,
    `${pathname} should return private no-store headers for unauthenticated requests.`,
  );
}

async function fetchAuthenticatedExport(context: BrowserContext, pathname: string): Promise<ExportResponse> {
  const response = await context.request.get(new URL(pathname, baseUrl).toString());
  return {
    body: Buffer.from(await response.body()),
    contentDisposition: response.headers()["content-disposition"] ?? null,
    contentType: response.headers()["content-type"] ?? null,
    status: response.status(),
  };
}

function parseCsvRows(csv: string) {
  return csv.trim().split("\n").filter(Boolean);
}

async function expectAuditExportRuntimeProven(context: BrowserContext, input: {
  action: string;
  clerkOrgId: string;
  crossOrgId: string;
}) {
  await expectUnauthenticatedExportRejected("/api/audit-log/export?limit=1");
  const overLimit = await fetchAuthenticatedExport(context, "/api/audit-log/export?limit=5001");
  assert.equal(overLimit.status, 400, "audit export should reject over-limit requests.");
  assert.match(overLimit.contentType ?? "", /application\/json/, "over-limit audit response should be JSON.");

  const firstPage = await fetchAuthenticatedExport(
    context,
    `/api/audit-log/export?action=${encodeURIComponent(input.action)}&limit=2`,
  );
  assert.equal(firstPage.status, 200, "first audit export page should succeed.");
  assert.match(firstPage.contentType ?? "", /text\/csv/, "audit export should return CSV.");
  assert.match(firstPage.contentDisposition ?? "", /audit-log-\d{4}-\d{2}-\d{2}\.csv/, "audit export filename should be stable.");
  const firstCsv = firstPage.body.toString("utf8");
  const firstRows = parseCsvRows(firstCsv);
  assert.equal(
    firstRows[0],
    "created_at,clerk_org_id,clerk_user_id,action,entity_type,entity_id,metadata",
    "audit export CSV header should be stable.",
  );
  assert.equal(firstRows.length, 3, "audit export first page should contain header plus two rows.");
  assert.ok(firstCsv.includes(input.clerkOrgId), "audit export should include current org rows.");
  assert.ok(!firstCsv.includes(input.crossOrgId), "audit export must exclude cross-org audit rows.");
  const firstEntityIds = firstRows.slice(1).map((row) => row.split(",")[5]);

  const response = await context.request.get(new URL(`/api/audit-log/export?action=${encodeURIComponent(input.action)}&limit=2`, baseUrl).toString());
  const next = response.headers()["x-audit-log-next-cursor"];
  assert.equal(response.headers()["x-audit-log-truncated"], "true", "audit first page should report truncation.");
  assert.ok(next, "audit first page should provide a next cursor.");
  const secondResponse = await context.request.get(new URL(`/api/audit-log/export?action=${encodeURIComponent(input.action)}&limit=2&cursor=${encodeURIComponent(next)}`, baseUrl).toString());
  assert.equal(secondResponse.status(), 200, "audit export second page should succeed.");
  assert.equal(secondResponse.headers()["x-audit-log-truncated"], "false", "audit second page should not be truncated for three seeded rows.");
  const secondCsv = (await secondResponse.text()).trim();
  assert.ok(secondCsv.includes(input.clerkOrgId), "audit second page should include the remaining current org row.");
  assert.ok(!secondCsv.includes(input.crossOrgId), "audit second page must exclude cross-org audit rows.");
  const secondRows = parseCsvRows(secondCsv);
  const secondEntityIds = secondRows.slice(1).map((row) => row.split(",")[5]);
  assert.equal(new Set([...firstEntityIds, ...secondEntityIds]).size, 3, "audit cursor pages should not duplicate seeded rows.");

  return {
    auditExportAuthRejected: true,
    auditExportCrossTenantIsolated: true,
    auditExportNextCursorPresent: Boolean(next),
    auditExportOverLimitRejected: true,
    auditExportPageOneRows: firstRows.length - 1,
    auditExportPageTwoRows: secondRows.length - 1,
    auditExportShapeStable: true,
    auditExportTruncated: response.headers()["x-audit-log-truncated"] === "true",
  };
}

async function expectPdfReportRuntimeProven(context: BrowserContext, input: {
  pathname: string;
  filenamePattern: RegExp;
  label: string;
}) {
  await expectUnauthenticatedExportRejected(input.pathname);
  const response = await fetchAuthenticatedExport(context, input.pathname);
  assert.equal(response.status, 200, `${input.label} should download for authenticated org.`);
  assert.match(response.contentType ?? "", /application\/pdf/, `${input.label} should return PDF.`);
  assert.match(response.contentDisposition ?? "", input.filenamePattern, `${input.label} filename should be stable.`);
  assert.ok(response.body.byteLength > 1_000, `${input.label} PDF should not be empty.`);
  assert.equal(response.body.subarray(0, 4).toString("utf8"), "%PDF", `${input.label} should be a PDF file.`);
  return true;
}

async function expectWorkspaceArchiveRuntimeProven(context: BrowserContext, input: {
  crossRiskTitle: string;
  crossVendorName: string;
  riskTitle: string;
}) {
  await expectUnauthenticatedExportRejected("/api/exports/workspace/archive");
  const response = await fetchAuthenticatedExport(context, "/api/exports/workspace/archive");
  assert.equal(response.status, 200, "workspace archive should download for authenticated org.");
  assert.match(response.contentType ?? "", /application\/zip/, "workspace archive should return ZIP.");
  assert.match(response.contentDisposition ?? "", /workspace-export-\d{4}-\d{2}-\d{2}\.zip/, "workspace archive filename should be stable.");
  assert.ok(response.body.byteLength > 500, "workspace archive should not be empty.");

  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(response.body);
  for (const entry of ["workspace-export.json", "evidence-metadata.csv", "export-manifest.json"]) {
    assert.ok(zip.file(entry), `workspace archive should include ${entry}.`);
  }
  const workspaceJson = await zip.file("workspace-export.json")!.async("string");
  const manifestJson = await zip.file("export-manifest.json")!.async("string");
  const workspaceExport = JSON.parse(workspaceJson) as {
    redactions?: unknown;
    risks?: Array<{ title?: string }>;
    vendors?: { items?: Array<{ name?: string }> };
  };
  assert.ok(workspaceJson.includes(input.riskTitle), "workspace archive should include current org risk data.");
  assert.ok(!workspaceJson.includes(input.crossRiskTitle), "workspace archive must exclude cross-org risk data.");
  assert.ok(!workspaceJson.includes(input.crossVendorName), "workspace archive must exclude cross-org vendor data.");
  assert.ok(!workspaceJson.includes("Forbidden Cross Org"), "workspace archive must exclude cross-org organisation data.");
  assert.ok(!workspaceJson.includes("BLOB_READ_WRITE_TOKEN"), "workspace archive must not leak private env names or values.");
  assert.ok(!workspaceJson.includes("OPENAI_API_KEY"), "workspace archive must not leak provider secret names or values.");
  assert.ok(Array.isArray(workspaceExport.risks), "workspace archive JSON should expose a stable risks array.");
  assert.ok(Array.isArray(workspaceExport.vendors?.items), "workspace archive JSON should expose a stable vendors.items array.");
  assert.ok(workspaceExport.redactions, "workspace archive should describe redactions.");
  assert.ok(manifestJson.includes("archiveVersion"), "workspace archive manifest should include archiveVersion.");

  return true;
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

async function getSmokeUserId(clerk: ReturnType<typeof createClerkClient>) {
  assert.ok(smokeUserEmail, "SMOKE_USER_EMAIL is required.");
  const users = await clerk.users.getUserList({ emailAddress: [smokeUserEmail], limit: 1 });
  const user = users.data[0];
  assert.ok(user, "SMOKE_USER_EMAIL must point to an existing verified Clerk production user.");
  return user.id;
}

async function main() {
  const clerk = createClerkClient({ secretKey });
  let clerkOrgId: string | null = null;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;

  try {
    const smokeUserId = await getSmokeUserId(clerk);
    const organization = await clerk.organizations.createOrganization({
      createdBy: smokeUserId,
      name: orgName,
    });
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
      email: smokeUserEmail,
      fullName: "Production Smoke",
      role: "org:admin",
    });

    const vendor = await seedVendorQuestionnaire(organization.id);
    const exportFixtures = await seedExportFixtures({
      clerkOrgId: organization.id,
      clerkUserId: smokeUserId,
    });
    await seedQuestionnaireSupportContext({
      clerkOrgId: organization.id,
      createdBy: smokeUserId,
    });
    const trust = await seedTrustCenter(organization.id);
    const testingToken = await clerk.testingTokens.createTestingToken();

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ baseURL: baseUrl, locale: "cs-CZ" });
    await context.addCookies([
      {
        domain: new URL(baseUrl).hostname,
        name: "cc-cookie-consent",
        path: "/",
        sameSite: "Lax",
        secure: baseUrl.startsWith("https://"),
        value: "rejected",
      },
    ]);
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
      email: smokeUserEmail!,
      organizationId: organization.id,
      password: smokeUserPassword!,
      testingToken: testingToken.token,
    });

    const renderedRoutes = [];
    for (const pathname of [
      "/dashboard",
      "/evidence",
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

    const questionnaireResponse = await page.goto(pageUrl("/questionnaires", testingToken.token), {
      waitUntil: "domcontentloaded",
    });
    assert.equal(questionnaireResponse?.status(), 200, "questionnaire generation URL should render.");
    const generationForm = page.locator("form").filter({
      has: page.locator('textarea[name="questionnaire"]'),
    }).first();
    await generationForm.locator('textarea[name="questionnaire"]').fill(liveQuestionnaireText);
    await generationForm.locator('button[type="submit"]').click();
    await page.getByText(liveQuestionnaireText).waitFor({ state: "visible", timeout: 90_000 });

    const questionnaire = await getLatestLiveQuestionnaireArtifact({ clerkOrgId: organization.id });
    const questionnairePath = `/questionnaires?artifactId=${questionnaire.artifactId}`;
    const loadedQuestionnaireResponse = await page.goto(pageUrl(questionnairePath, testingToken.token), {
      waitUntil: "domcontentloaded",
    });
    assert.equal(loadedQuestionnaireResponse?.status(), 200, "live questionnaire artifact URL should render.");
    await page.getByText(questionnaire.question).waitFor({ state: "visible" });
    await page.getByText("draft").first().waitFor({ state: "visible" });
    await page.locator('textarea[name="answer"]').first().fill(
      `Production smoke reviewer-approved answer ${runId}`,
    );
    await page.locator('textarea[name="notes"]').first().fill(
      `Production smoke approved and persisted ${runId}`,
    );
    await page.locator('button[name="reviewStatus"][value="approved"]').first().click();
    await expectQuestionnaireReviewPersisted({
      artifactId: questionnaire.artifactId,
      clerkOrgId: organization.id,
    });
    const reviewedQuestionnaireResponse = await page.goto(pageUrl(questionnairePath, testingToken.token), {
      waitUntil: "domcontentloaded",
    });
    assert.equal(reviewedQuestionnaireResponse?.status(), 200, "reviewed live questionnaire artifact URL should rerender.");
    await page.getByText("approved").first().waitFor({ state: "visible" });
    const persistedAnswerValue = await page.locator('textarea[name="answer"]').first().inputValue();
    assert.match(
      persistedAnswerValue,
      /Production smoke reviewer-approved answer/,
      "reviewed questionnaire answer should be visible after reload.",
    );

    const publicTrustResponse = await page.goto(trust.trustAccessUrl, { waitUntil: "domcontentloaded" });
    assert.equal(publicTrustResponse?.status(), 200, "approved Trust Center access URL should render.");
    const vendorTokenResponse = await page.goto(vendor.assessmentUrl, { waitUntil: "domcontentloaded" });
    assert.equal(vendorTokenResponse?.status(), 200, "vendor assessment token URL should render.");
    const submittedVendorAnswers = vendorSmokeAnswers();
    for (const [questionId, answer] of Object.entries(submittedVendorAnswers)) {
      await page.locator(`select[name="${questionId}"]`).selectOption(answer);
    }
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/submitted=1/, { timeout: 30_000 });
    const vendorSubmit = await expectVendorAssessmentSubmitted({
      assessmentId: vendor.assessmentId,
      clerkOrgId: organization.id,
      expectedAnswers: submittedVendorAnswers,
      vendorId: vendor.vendorId,
    });

    const auditExport = await expectAuditExportRuntimeProven(context, {
      action: exportFixtures.auditAction,
      clerkOrgId: organization.id,
      crossOrgId: exportFixtures.crossOrgId,
    });
    const vendorReportDownloaded = await expectPdfReportRuntimeProven(context, {
      filenamePattern: /nis2-supply-chain-report\.pdf/,
      label: "vendor supply-chain report",
      pathname: "/api/vendors/supply-chain-report",
    });
    const riskReportDownloaded = await expectPdfReportRuntimeProven(context, {
      filenamePattern: /risk-register\.pdf/,
      label: "risk register report",
      pathname: "/api/risks/register-report",
    });
    const workspaceArchiveDownloaded = await expectWorkspaceArchiveRuntimeProven(context, {
      crossRiskTitle: exportFixtures.crossRiskTitle,
      crossVendorName: exportFixtures.crossVendorName,
      riskTitle: exportFixtures.riskTitle,
    });
    assert.deepEqual(browserConsoleErrors, [], "browser console errors should be empty.");
    assert.deepEqual(pageErrors, [], "browser page errors should be empty.");

    await context.close();

    console.log(JSON.stringify({
      baseUrl,
      browserConsoleErrors: browserConsoleErrors.length,
      databaseHostClass: "non_local",
      emailAttempted: vendor.emailAttempted,
      mailboxProof: vendor.emailAttempted ? "send_attempted_check_controlled_mailbox" : "blocked_missing_resend_or_recipient_env",
      auditExportAuthRejected: auditExport.auditExportAuthRejected,
      auditExportCrossTenantIsolated: auditExport.auditExportCrossTenantIsolated,
      auditExportNextCursorPresent: auditExport.auditExportNextCursorPresent,
      auditExportOverLimitRejected: auditExport.auditExportOverLimitRejected,
      auditExportPageOneRows: auditExport.auditExportPageOneRows,
      auditExportPageTwoRows: auditExport.auditExportPageTwoRows,
      auditExportShapeStable: auditExport.auditExportShapeStable,
      auditExportTruncated: auditExport.auditExportTruncated,
      ok: true,
      pageErrors: pageErrors.length,
      questionnaireArtifactLoaded: true,
      questionnaireArtifactSource: questionnaire.source,
      questionnaireGeneratedLive: true,
      questionnaireModel: questionnaire.model,
      questionnaireQuestionCount: questionnaire.questionCount,
      questionnaireReviewPersisted: true,
      questionnaireReviewStatus: "approved",
      renderedRoutes: renderedRoutes.map((route) => route.pathname),
      riskReportAuthRejected: true,
      riskReportDownloaded,
      riskReportShapeStable: true,
      trustCenterRequestApproved: Boolean(trust.requestId),
      vendorReportAuthRejected: true,
      vendorReportDownloaded,
      vendorReportShapeStable: true,
      workspaceArchiveAuthRejected: true,
      workspaceArchiveDownloaded,
      workspaceArchiveNoCrossTenantLeakage: workspaceArchiveDownloaded,
      vendorAssessmentStatus: vendorSubmit.assessmentStatus,
      vendorAssessmentTokenRendered: true,
      vendorDeliveryStatus: vendor.deliveryStatus,
      vendorRiskTier: vendorSubmit.vendorRiskTier,
      vendorStatus: vendorSubmit.vendorStatus,
      vendorStatusPropagated: vendorSubmit.vendorStatus === "assessed",
      vendorSubmitPersisted: vendorSubmit.assessmentStatus === "submitted",
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
    await cleanupDatabase(`org_export_cross_${runId}`).catch((error: unknown) => {
      console.error("Cross-tenant smoke cleanup failed:", error);
    });
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
