import assert from "node:assert/strict";
import { timingSafeEqual } from "node:crypto";
import { createClerkClient } from "@clerk/nextjs/server";
import { get, put } from "@vercel/blob";
import { and, desc, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getMessagesForLocale } from "@/i18n/messages";
import { deleteBlobUrls } from "@/lib/blob/cleanup";
import {
  getControlDisplayTitle,
} from "@/lib/controls/localization";
import { getDb } from "@/lib/db";
import {
  evidence,
  frameworks,
  generatedArtifacts,
  orgControlStatuses,
  orgFrameworks,
  organisations,
  policies,
  profiles,
} from "@/lib/db/schema";
import { getControlDetailByKey, updateControlStatus } from "@/lib/db/queries/controls";
import { getDashboardData } from "@/lib/db/queries/dashboard";
import { createManualEvidence, listEvidenceVault } from "@/lib/db/queries/evidence";
import {
  assessFramework,
  getFrameworkDetail,
  saveGapReportRecord,
} from "@/lib/db/queries/framework-assessment";
import {
  completeOnboarding,
  getOnboardingState,
  saveOnboardingCompany,
  saveOnboardingFrameworks,
  saveOnboardingTools,
} from "@/lib/db/queries/onboarding";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  insertGeneratedPolicy,
  listPoliciesForOrg,
} from "@/lib/db/queries/policies";
import {
  upsertOrganisationFromClerk,
  upsertProfileFromClerk,
} from "@/lib/clerk/sync";
import {
  buildGapAnalysisArtifactContent,
  GAP_ANALYSIS_ARTIFACT_KIND,
} from "@/lib/frameworks/gap-artifacts";
import {
  getFrameworkDisplayDescription,
  getFrameworkDisplayName,
  getFrameworkDisplayRegulator,
} from "@/lib/frameworks/localization";
import {
  getQuestionsForFramework,
  type FrameworkAnswer,
  type FrameworkAnswers,
} from "@/lib/frameworks/questions";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import { renderGapReportPdf } from "@/lib/pdf/gap-report";
import { renderPolicyPdf } from "@/lib/pdf/policy-document";
import { resolvePolicyTemplate } from "@/lib/policies/resolve-template";
import { resolvePolicySourceDocument } from "@/lib/policies/source-documents";

export const dynamic = "force-dynamic";
export const maxDuration = 300;
export const runtime = "nodejs";

const action = "run" as const;
const controlKey = "ctrl_mfa_all_users";
const frameworkSlugs = ["nis2", "gdpr"];
const locale = "it-IT";

type StepName =
  | "environment"
  | "clerk-domain"
  | "fixtures"
  | "primary-flow"
  | "italian-surfaces"
  | "downloads"
  | "cleanup";

type StepResult = {
  detail?: unknown;
  durationMs: number;
  error?: string;
  finishedAt: string;
  name: StepName;
  ok: boolean;
  startedAt: string;
};

type SmokeContext = {
  clerkOrgId: string;
  clerkUserId: string;
  evidenceDescription: string;
  orgName: string;
  runId: string;
};

function getPresentedToken(request: NextRequest) {
  const authorization = request.headers.get("authorization")?.trim();

  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim();
  }

  return request.headers.get("x-verification-token")?.trim() ?? "";
}

function tokensMatch(presented: string, expected: string) {
  const presentedBuffer = Buffer.from(presented);
  const expectedBuffer = Buffer.from(expected);

  return (
    presentedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(presentedBuffer, expectedBuffer)
  );
}

function authenticate(request: NextRequest) {
  const expected = process.env.PRIMARY_FLOW_VERIFICATION_TOKEN?.trim();

  if (!expected || expected.length < 32) {
    return {
      error: "PRIMARY_FLOW_VERIFICATION_TOKEN is not configured strongly enough.",
      status: 503,
    };
  }

  if (!tokensMatch(getPresentedToken(request), expected)) {
    return { error: "Unauthorized.", status: 401 };
  }

  return null;
}

async function parseAction(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { action?: unknown }
    | null;

  return body?.action === action ? action : null;
}

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function getDatabaseUrl() {
  const databaseUrl = getRequiredEnv("DATABASE_URL");
  const parsed = new URL(databaseUrl);

  if (
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "::1"
  ) {
    throw new Error(
      `Refusing primary-flow verification against local database host ${parsed.hostname}.`,
    );
  }

  return { databaseUrl, host: parsed.hostname };
}

async function runStep<T>(
  steps: StepResult[],
  name: StepName,
  callback: () => Promise<T>,
) {
  const startedAt = new Date();

  try {
    console.info(`primary-flow-verification:${name}:started`);
    const detail = await callback();
    const finishedAt = new Date();
    const step = {
      detail,
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      finishedAt: finishedAt.toISOString(),
      name,
      ok: true,
      startedAt: startedAt.toISOString(),
    };

    steps.push(step);
    console.info(
      `primary-flow-verification:${name}:finished:${step.durationMs}ms`,
    );

    return detail;
  } catch (error) {
    const finishedAt = new Date();
    const message = error instanceof Error ? error.message : "Unknown error";

    steps.push({
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      error: message,
      finishedAt: finishedAt.toISOString(),
      name,
      ok: false,
      startedAt: startedAt.toISOString(),
    });
    console.error(`primary-flow-verification:${name}:failed:${message}`);

    throw error;
  }
}

function addYears(date: Date, years: number) {
  const nextDate = new Date(date);

  nextDate.setUTCFullYear(nextDate.getUTCFullYear() + years);

  return nextDate;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildNis2Answers(): FrameworkAnswers {
  const questions = getQuestionsForFramework("nis2");
  const answers: FrameworkAnswers = {};
  const statuses: FrameworkAnswer[] = ["yes", "partial", "no", "na"];

  for (const [index, question] of questions.entries()) {
    answers[question.id] = statuses[index % statuses.length] ?? "partial";
  }

  return answers;
}

async function verifyEnvironment() {
  const { host } = getDatabaseUrl();

  getRequiredEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  getRequiredEnv("CLERK_SECRET_KEY");
  getRequiredEnv("BLOB_READ_WRITE_TOKEN");

  return {
    databaseHost: host,
    runtime: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
  };
}

async function verifyClerkDomain() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  const response = await fetch(
    "https://clerk.splnit.eu/npm/@clerk/clerk-js@5/dist/clerk.browser.js",
    {
      cache: "no-store",
      headers: {
        Accept: "application/javascript,text/javascript,*/*",
      },
      signal: controller.signal,
    },
  ).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    throw new Error(`Clerk custom domain returned HTTP ${response.status}.`);
  }

  await response.body?.cancel();

  return {
    contentType: response.headers.get("content-type"),
    status: response.status,
  };
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

  return {
    deletedArtifactBlobs: artifactBlobUrls.filter(Boolean).length,
    deletedEvidenceBlobs: evidenceBlobRows.length,
    deletedPolicyBlobs: policyBlobRows.length,
  };
}

async function createFixtures() {
  const clerk = createClerkClient({ secretKey: getRequiredEnv("CLERK_SECRET_KEY") });
  const runId = `route_primary_flow_${Date.now()}`;
  const orgName = `Splnit Route Primary Flow ${runId}`;
  const email = `splnit-route-primary-flow-${Date.now()}+clerk_live@example.com`;
  const password = `SplnitRoute-${Date.now()}-Aa!`;
  const user = await clerk.users.createUser({
    emailAddress: [email],
    firstName: "Route",
    lastName: "Flow",
    password,
  });
  const organization = await clerk.organizations.createOrganization({
    createdBy: user.id,
    name: orgName,
  });

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
    email,
    fullName: "Route Flow",
    role: "org:admin",
  });

  return {
    clerkOrgId: organization.id,
    clerkUserId: user.id,
    evidenceDescription: `Route primary flow evidence ${runId}`,
    orgName,
    runId,
  } satisfies SmokeContext;
}

async function runPrimaryFlow(context: SmokeContext) {
  const db = getDb();

  await saveOnboardingCompany({
    clerkOrgId: context.clerkOrgId,
    country: "IT",
    employeeCount: "50-249",
    ico: "IT-ROUTE-SMOKE",
    locale,
    name: context.orgName,
    primaryJurisdiction: "IT",
    sector: "technology",
  });
  await saveOnboardingFrameworks({
    clerkOrgId: context.clerkOrgId,
    frameworkSlugs,
  });
  await saveOnboardingTools({
    clerkOrgId: context.clerkOrgId,
    toolKeys: ["chatgpt", "microsoft-copilot", "github-copilot"],
  });
  await completeOnboarding({ clerkOrgId: context.clerkOrgId, initialScore: 74 });

  const onboarding = await getOnboardingState(context.clerkOrgId);

  assert.equal(onboarding.organisation?.country, "IT");
  assert.equal(onboarding.organisation?.primaryJurisdiction, "IT");
  assert.equal(onboarding.organisation?.locale, locale);
  assert.ok(onboarding.organisation?.onboardingCompletedAt);
  assert.deepEqual(onboarding.selectedFrameworks.sort(), frameworkSlugs.sort());

  const assessment = await assessFramework({
    answers: buildNis2Answers(),
    clerkOrgId: context.clerkOrgId,
    frameworkSlug: "nis2",
  });

  assert.ok(assessment.totalControls > 0, "NIS2 setup should map controls.");
  assert.ok(assessment.failingControls > 0, "NIS2 setup should identify open controls.");

  const statusUpdate = await updateControlStatus({
    clerkOrgId: context.clerkOrgId,
    controlKey,
    notes: "Primary flow verification route: MFA evidence uploaded.",
    status: "pass",
  });

  assert.ok(statusUpdate.recalculatedFrameworks > 0);

  const evidenceBlob = await put(
    `evidence/${context.clerkOrgId}/${controlKey}/${Date.now()}-route-smoke.txt`,
    new Blob([`Primary flow verification evidence ${context.runId}\n`], {
      type: "text/plain",
    }),
    {
      access: "private",
      contentType: "text/plain",
    },
  );
  const evidenceResult = await createManualEvidence({
    blobUrl: evidenceBlob.url,
    clerkOrgId: context.clerkOrgId,
    collectedBy: context.clerkUserId,
    controlKey,
    description: context.evidenceDescription,
    expiresAt: isoDate(addYears(new Date(), 1)),
    fileType: "text/plain",
    source: "primary_flow_verification_route",
  });

  assert.ok(evidenceResult.evidenceId);

  const organisation = await getOrganisationByClerkOrgId(context.clerkOrgId);

  assert.ok(organisation, "Organisation should exist after onboarding.");

  const template = resolvePolicyTemplate("security_policy", organisation);
  const sourceDocument = await resolvePolicySourceDocument(template);
  const generatedAt = new Date();
  const reviewDate = isoDate(addYears(generatedAt, 1));
  const policyPdf = await renderPolicyPdf({
    generatedAt,
    organisation: {
      ico: organisation.ico,
      name: organisation.name,
    },
    reviewDate,
    sourceDocument,
    template,
  });

  assert.ok(policyPdf.length > 1_000, "Policy PDF should render non-empty output.");

  const policyBlob = await put(
    `policies/${context.clerkOrgId}/${template.type}-${generatedAt.getTime()}.pdf`,
    policyPdf,
    {
      access: "private",
      contentType: "application/pdf",
    },
  );
  const policyId = await insertGeneratedPolicy({
    blobUrl: policyBlob.url,
    clerkOrgId: context.clerkOrgId,
    content: {
      generatedAt: generatedAt.toISOString(),
      reviewDate,
      sections: template.sections,
      sourceDocument,
    },
    controlKeys: template.controlKeys,
    expiresAt: reviewDate,
    title: template.titleCs,
    type: template.type,
  });

  assert.ok(policyId, "Generated policy should be saved.");

  const detail = await getFrameworkDetail({
    clerkOrgId: context.clerkOrgId,
    frameworkSlug: "nis2",
  });

  assert.ok(detail, "NIS2 framework detail should load.");
  assert.ok(detail.controls.length > 0, "NIS2 detail should include controls.");
  assert.ok(detail.orgFramework, "NIS2 detail should include org framework row.");

  const copy = getMessagesForLocale(locale).frameworks;
  const seedFramework = FRAMEWORK_LIBRARY.find(
    (framework) => framework.slug === "nis2",
  );
  const gapPdf = await renderGapReportPdf({
    controls: detail.controls.map((control) => ({
      ...control,
      description: null,
      title: getControlDisplayTitle(control, locale),
    })),
    framework: {
      description: getFrameworkDisplayDescription(
        detail.framework,
        locale,
        copy.descriptions,
      ),
      mandatoryDeadline: detail.framework.mandatoryDeadline,
      name: getFrameworkDisplayName(detail.framework, locale),
      regulator: getFrameworkDisplayRegulator(
        detail.framework,
        locale,
        copy.regulators,
      ),
      version: detail.framework.version,
    },
    generatedAt,
    locale,
    score: detail.orgFramework.score ?? 0,
  });

  assert.ok(gapPdf.length > 1_000, "Gap report PDF should render non-empty output.");

  const gapBlob = await put(
    `gap-reports/${context.clerkOrgId}/nis2-${generatedAt.getTime()}.pdf`,
    gapPdf,
    {
      access: "private",
      contentType: "application/pdf",
    },
  );
  const gapMetadata = {
    generatedAt: generatedAt.toISOString(),
    locale,
    openControls: detail.controls.filter((control) =>
      ["fail", "manual_review", "unknown", null].includes(control.status),
    ).length,
    score: detail.orgFramework.score ?? 0,
    totalControls: detail.controls.length,
  };

  await saveGapReportRecord({
    blobUrl: gapBlob.url,
    clerkOrgId: context.clerkOrgId,
    frameworkSlug: "nis2",
    metadata: gapMetadata,
    title: `${seedFramework?.nameEn ?? detail.framework.nameEn} gap report`,
  });

  const [artifact] = await db
    .insert(generatedArtifacts)
    .values({
      clerkOrgId: context.clerkOrgId,
      content: buildGapAnalysisArtifactContent({
        blobUrl: gapBlob.url,
        frameworkSlug: "nis2",
        metadata: gapMetadata,
      }),
      createdBy: context.clerkUserId,
      kind: GAP_ANALYSIS_ARTIFACT_KIND,
      model: null,
      source: "primary_flow_verification_route",
      title: "NIS2 gap analysis verification artifact",
    })
    .returning({ id: generatedArtifacts.id });

  assert.ok(artifact?.id);

  return {
    assessmentScore: assessment.score,
    controlRowsRecalculated: statusUpdate.recalculatedFrameworks,
    evidenceId: evidenceResult.evidenceId,
    gapReportBlob: Boolean(gapBlob.url),
    policyId,
    totalControls: assessment.totalControls,
  };
}

async function verifyItalianSurfaces(context: SmokeContext) {
  const db = getDb();
  const controlDetail = await getControlDetailByKey({
    clerkOrgId: context.clerkOrgId,
    controlKey,
  });
  const evidenceRows = await listEvidenceVault(context.clerkOrgId);
  const frameworkRows = await db
    .select({ slug: frameworks.slug })
    .from(orgFrameworks)
    .innerJoin(frameworks, eq(orgFrameworks.frameworkId, frameworks.id))
    .where(eq(orgFrameworks.clerkOrgId, context.clerkOrgId));
  const detail = await getFrameworkDetail({
    clerkOrgId: context.clerkOrgId,
    frameworkSlug: "nis2",
  });
  const copy = getMessagesForLocale(locale).frameworks;

  assert.equal(
    controlDetail ? getControlDisplayTitle(controlDetail.control, locale) : null,
    "MFA abilitata per tutti gli account utente",
  );
  assert.ok(
    evidenceRows.some((row) => row.description === context.evidenceDescription),
    "Italian evidence vault should list uploaded evidence.",
  );
  assert.ok(
    frameworkRows.some((row) => row.slug === "nis2") &&
      frameworkRows.some((row) => row.slug === "gdpr"),
    "Framework index should have selected NIS2 and GDPR rows.",
  );

  assert.equal(
    detail
      ? getFrameworkDisplayDescription(
          detail.framework,
          locale,
          copy.descriptions,
        )
      : null,
    "Cybersecurity, gestione del rischio, incident reporting e responsabilità del management.",
  );
  assert.equal(
    detail
      ? getFrameworkDisplayRegulator(detail.framework, locale, copy.regulators)
      : null,
    "Direttiva UE / autorità nazionali",
  );

  return {
    evidenceRows: evidenceRows.length,
    frameworks: frameworkRows.map((row) => row.slug).sort(),
    italianControlTitle: "MFA abilitata per tutti gli account utente",
  };
}

async function verifyDownloads(context: SmokeContext) {
  const db = getDb();
  const evidenceRows = await db
    .select({ blobUrl: evidence.blobUrl, id: evidence.id })
    .from(evidence)
    .where(eq(evidence.clerkOrgId, context.clerkOrgId))
    .orderBy(desc(evidence.collectedAt))
    .limit(1);
  const policyRows = await db
    .select({ blobUrl: policies.blobUrl, id: policies.id, type: policies.type })
    .from(policies)
    .where(eq(policies.clerkOrgId, context.clerkOrgId))
    .orderBy(desc(policies.createdAt));
  const generatedRows = await db
    .select({ content: generatedArtifacts.content, id: generatedArtifacts.id })
    .from(generatedArtifacts)
    .where(eq(generatedArtifacts.clerkOrgId, context.clerkOrgId));
  const statusRows = await db
    .select({ id: orgControlStatuses.id })
    .from(orgControlStatuses)
    .where(
      and(
        eq(orgControlStatuses.clerkOrgId, context.clerkOrgId),
        eq(orgControlStatuses.status, "pass"),
      ),
    );
  const activeFrameworkRows = await db
    .select({ status: orgFrameworks.status })
    .from(orgFrameworks)
    .where(
      and(
        eq(orgFrameworks.clerkOrgId, context.clerkOrgId),
        inArray(orgFrameworks.status, ["active"]),
      ),
    );
  const dashboard = await getDashboardData(context.clerkOrgId);
  const policiesForOrg = await listPoliciesForOrg(context.clerkOrgId);

  assert.ok(evidenceRows[0]?.blobUrl, "Evidence blob should persist.");
  const evidenceBlobUrl = evidenceRows[0]?.blobUrl;

  assert.ok(evidenceBlobUrl, "Evidence blob URL should exist.");
  assert.ok(
    policyRows.some((policy) => policy.type === "security_policy"),
    "Security policy should persist.",
  );
  assert.ok(
    policyRows.some((policy) => policy.type === "gap_report:nis2"),
    "NIS2 gap report should persist.",
  );
  assert.ok(generatedRows.length > 0, "Generated artifact should persist.");
  assert.ok(statusRows.length > 0, "Control status updates should persist.");
  assert.equal(activeFrameworkRows.length, frameworkSlugs.length);
  assert.equal(dashboard.organisationLocale, locale);
  assert.equal(dashboard.organisationJurisdiction, "IT");

  const evidenceBlob = await get(evidenceBlobUrl, { access: "private" });

  assert.ok(evidenceBlob, "Evidence blob should be downloadable.");
  assert.equal(evidenceBlob.statusCode, 200);
  assert.equal(evidenceBlob.blob.contentType, "text/plain");

  for (const policy of policyRows) {
    assert.ok(policy.blobUrl, `Policy ${policy.type} should have a blob URL.`);

    const blob = await get(policy.blobUrl, { access: "private" });

    assert.ok(blob, `Policy ${policy.type} blob should be downloadable.`);
    assert.equal(blob.statusCode, 200);
    assert.equal(blob.blob.contentType, "application/pdf");
  }

  return {
    evidenceRows: evidenceRows.length,
    generatedArtifacts: generatedRows.length,
    policies: policyRows.length,
    policiesListed: policiesForOrg.length,
    statusRows: statusRows.length,
  };
}

export async function POST(request: NextRequest) {
  const steps: StepResult[] = [];
  const authError = authenticate(request);

  if (authError) {
    return NextResponse.json(
      { error: authError.error, ok: false },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          Pragma: "no-cache",
        },
        status: authError.status,
      },
    );
  }

  const requestedAction = await parseAction(request);

  if (!requestedAction) {
    return NextResponse.json(
      {
        allowedActions: [action],
        error: "Request body must include action=run.",
        ok: false,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          Pragma: "no-cache",
        },
        status: 422,
      },
    );
  }

  let context: SmokeContext | null = null;
  let clerkUserId: string | null = null;
  let ok = false;

  try {
    await runStep(steps, "environment", verifyEnvironment);
    await runStep(steps, "clerk-domain", verifyClerkDomain);
    context = await runStep(steps, "fixtures", createFixtures);
    const activeContext = context;

    clerkUserId = activeContext.clerkUserId;
    await runStep(steps, "primary-flow", () => runPrimaryFlow(activeContext));
    await runStep(steps, "italian-surfaces", () =>
      verifyItalianSurfaces(activeContext),
    );
    await runStep(steps, "downloads", () => verifyDownloads(activeContext));
    ok = true;
  } catch {
    ok = false;
  } finally {
    if (context) {
      const cleanupContext = context;
      const clerk = createClerkClient({
        secretKey: getRequiredEnv("CLERK_SECRET_KEY"),
      });

      await runStep(steps, "cleanup", async () => {
        const dbCleanup = await cleanupDatabase(cleanupContext.clerkOrgId);

        await clerk.organizations
          .deleteOrganization(cleanupContext.clerkOrgId)
          .catch(() => null);

        if (clerkUserId) {
          await clerk.users.deleteUser(clerkUserId).catch(() => null);
        }

        return dbCleanup;
      }).catch((error: unknown) => ({
        error: error instanceof Error ? error.message : "Unknown cleanup error",
      }));
    }
  }

  return NextResponse.json(
    {
      action,
      ok,
      steps,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache",
      },
      status: ok ? 200 : 500,
    },
  );
}
