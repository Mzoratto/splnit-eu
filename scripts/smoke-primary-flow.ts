import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { and, eq, inArray } from "drizzle-orm";
import { getMessagesForLocale } from "@/i18n/messages";
import { getDb } from "@/lib/db";
import {
  evidence,
  generatedArtifacts,
  orgControlStatuses,
  orgFrameworks,
  organisations,
  policies,
} from "@/lib/db/schema";
import { createManualEvidence, listEvidenceVault } from "@/lib/db/queries/evidence";
import {
  assessFramework,
  getFrameworkDetail,
  saveGapReportRecord,
} from "@/lib/db/queries/framework-assessment";
import { getDashboardData } from "@/lib/db/queries/dashboard";
import { listGeneratedArtifactSummaries } from "@/lib/db/queries/generated-artifacts";
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
import { getControlDetailByKey, updateControlStatus } from "@/lib/db/queries/controls";
import {
  buildGapAnalysisArtifactContent,
  GAP_ANALYSIS_ARTIFACT_KIND,
} from "@/lib/frameworks/gap-artifacts";
import {
  getQuestionsForFramework,
  type FrameworkAnswer,
  type FrameworkAnswers,
} from "@/lib/frameworks/questions";
import {
  getFrameworkDisplayDescription,
  getFrameworkDisplayName,
  getFrameworkDisplayRegulator,
} from "@/lib/frameworks/localization";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import { renderGapReportPdf } from "@/lib/pdf/gap-report";
import { renderPolicyPdf } from "@/lib/pdf/policy-document";
import { resolvePolicyTemplate } from "@/lib/policies/resolve-template";
import { resolvePolicySourceDocument } from "@/lib/policies/source-documents";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL?.trim();
assert.ok(databaseUrl, "DATABASE_URL is required for primary flow smoke test.");

const clerkOrgId = `smoke_primary_flow_${Date.now()}`;
const clerkUserId = "smoke_primary_flow_user";
const frameworkSlugs = ["nis2", "gdpr"];
const controlKey = "ctrl_mfa_all_users";

async function cleanup() {
  const db = getDb();

  await db.delete(generatedArtifacts).where(eq(generatedArtifacts.clerkOrgId, clerkOrgId));
  await db.delete(policies).where(eq(policies.clerkOrgId, clerkOrgId));
  await db.delete(evidence).where(eq(evidence.clerkOrgId, clerkOrgId));
  await db
    .delete(orgControlStatuses)
    .where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
  await db.delete(orgFrameworks).where(eq(orgFrameworks.clerkOrgId, clerkOrgId));
  await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
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

async function assertSeedDataAvailable() {
  const db = getDb();
  const frameworkRows = await db
    .select({ id: orgFrameworks.frameworkId })
    .from(orgFrameworks)
    .where(eq(orgFrameworks.clerkOrgId, "__nonexistent_seed_check__"));

  assert.equal(
    frameworkRows.length,
    0,
    "seed check should not find synthetic org framework rows",
  );

  const nis2Framework = FRAMEWORK_LIBRARY.find((framework) => framework.slug === "nis2");
  assert.ok(nis2Framework, "NIS2 framework must exist in framework library.");
}

async function main() {
  await cleanup();
  const db = getDb();

  try {
    await assertSeedDataAvailable();

    await saveOnboardingCompany({
      clerkOrgId,
      country: "IT",
      employeeCount: "50-249",
      ico: "IT-SMOKE-001",
      locale: "it-IT",
      name: "Smoke Primary Flow S.r.l.",
      primaryJurisdiction: "IT",
      sector: "technology",
    });
    await saveOnboardingFrameworks({ clerkOrgId, frameworkSlugs });
    await saveOnboardingTools({
      clerkOrgId,
      toolKeys: ["chatgpt", "microsoft-copilot", "github-copilot"],
    });
    await completeOnboarding({ clerkOrgId, initialScore: 74 });

    const onboarding = await getOnboardingState(clerkOrgId);
    assert.equal(onboarding.organisation?.country, "IT");
    assert.equal(onboarding.organisation?.primaryJurisdiction, "IT");
    assert.equal(onboarding.organisation?.locale, "it-IT");
    assert.ok(onboarding.organisation?.onboardingCompletedAt);
    assert.deepEqual(onboarding.selectedFrameworks.sort(), frameworkSlugs.sort());

    const assessment = await assessFramework({
      answers: buildNis2Answers(),
      clerkOrgId,
      frameworkSlug: "nis2",
    });
    assert.ok(assessment.totalControls > 0, "NIS2 setup should map controls.");
    assert.ok(assessment.failingControls > 0, "NIS2 setup should identify open controls.");
    assert.ok(assessment.score >= 0 && assessment.score <= 100);

    const statusUpdate = await updateControlStatus({
      clerkOrgId,
      controlKey,
      notes: "Primary flow smoke: MFA evidence requested.",
      status: "pass",
    });
    assert.ok(statusUpdate.recalculatedFrameworks > 0);

    const controlDetail = await getControlDetailByKey({ clerkOrgId, controlKey });
    assert.equal(controlDetail?.status?.status, "pass");

    const evidenceResult = await createManualEvidence({
      blobUrl: `local-smoke://evidence/${controlKey}.txt`,
      clerkOrgId,
      collectedBy: clerkUserId,
      controlKey,
      description: "Primary flow smoke evidence",
      expiresAt: isoDate(addYears(new Date(), 1)),
      fileType: "text/plain",
      source: "primary_flow_smoke",
    });
    assert.ok(evidenceResult.evidenceId);

    const evidenceRows = await listEvidenceVault(clerkOrgId);
    assert.equal(evidenceRows.length, 1);
    assert.equal(evidenceRows[0]?.controlKey, controlKey);

    const organisation = await getOrganisationByClerkOrgId(clerkOrgId);
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

    const policyId = await insertGeneratedPolicy({
      blobUrl: `local-smoke://policies/${template.type}.pdf`,
      clerkOrgId,
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

    const policiesForOrg = await listPoliciesForOrg(clerkOrgId);
    assert.ok(
      policiesForOrg.some((policy) => policy.id === policyId),
      "Generated policy should be listed for org.",
    );

    const detail = await getFrameworkDetail({ clerkOrgId, frameworkSlug: "nis2" });
    assert.ok(detail, "NIS2 framework detail should load.");
    assert.ok(detail.controls.length > 0, "NIS2 detail should include controls.");
    assert.ok(detail.orgFramework, "NIS2 detail should include org framework row.");

    const locale = "it-IT";
    const copy = getMessagesForLocale(locale).frameworks;
    const gapPdf = await renderGapReportPdf({
      controls: detail.controls.map((control) => ({
        ...control,
        description: null,
        title: control.titleEn ?? control.title,
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

    await saveGapReportRecord({
      blobUrl: "local-smoke://gap-reports/nis2.pdf",
      clerkOrgId,
      frameworkSlug: "nis2",
      metadata: {
        generatedAt: generatedAt.toISOString(),
        locale,
        openControls: detail.controls.filter((control) =>
          ["fail", "manual_review", "unknown", null].includes(control.status),
        ).length,
        score: detail.orgFramework.score ?? 0,
        totalControls: detail.controls.length,
      },
      title: "NIS2 gap report",
    });

    const content = buildGapAnalysisArtifactContent({
      blobUrl: "local-smoke://gap-reports/nis2.pdf",
      frameworkSlug: "nis2",
      metadata: {
        generatedAt: generatedAt.toISOString(),
        openControls: detail.controls.length,
        score: detail.orgFramework.score ?? 0,
        totalControls: detail.controls.length,
      },
    });
    assert.equal(content.resultType, GAP_ANALYSIS_ARTIFACT_KIND);

    const [artifact] = await db
      .insert(generatedArtifacts)
      .values({
        clerkOrgId,
        content,
        createdBy: clerkUserId,
        kind: "gap_analysis",
        model: null,
        source: "primary_flow_smoke",
        title: "NIS2 gap analysis smoke artifact",
      })
      .returning({ id: generatedArtifacts.id });
    assert.ok(artifact?.id);

    const artifacts = await listGeneratedArtifactSummaries({
      clerkOrgId,
      limit: 5,
    });
    assert.ok(artifacts.some((item) => item.id === artifact.id));

    const refreshedDetail = await getFrameworkDetail({
      clerkOrgId,
      frameworkSlug: "nis2",
    });
    assert.ok(refreshedDetail?.gapReport, "Latest gap report should be visible.");

    const dashboard = await getDashboardData(clerkOrgId);
    assert.equal(dashboard.organisationLocale, "it-IT");
    assert.equal(dashboard.organisationJurisdiction, "IT");
    assert.ok(
      dashboard.frameworkScores.some((framework) => framework.slug === "nis2"),
      "Dashboard should show enrolled NIS2 framework.",
    );

    const activeFrameworkRows = await db
      .select({ status: orgFrameworks.status })
      .from(orgFrameworks)
      .where(
        and(
          eq(orgFrameworks.clerkOrgId, clerkOrgId),
          inArray(orgFrameworks.status, ["active"]),
        ),
      );
    assert.equal(activeFrameworkRows.length, frameworkSlugs.length);
  } finally {
    await cleanup();
  }
}

main()
  .then(() => {
    console.log("Primary flow smoke test passed.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
