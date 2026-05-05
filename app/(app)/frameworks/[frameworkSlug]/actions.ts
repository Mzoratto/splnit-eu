"use server";

import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteBlobUrlsAfterFailedSave } from "@/lib/blob/cleanup";
import type { FrameworkSlug } from "@/lib/controls/library";
import { createGeneratedArtifact } from "@/lib/db/queries/generated-artifacts";
import {
  assessFramework,
  getFrameworkDetail,
  saveGapReportRecord,
} from "@/lib/db/queries/framework-assessment";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  FRAMEWORK_QUESTIONS,
  type FrameworkAnswer,
} from "@/lib/frameworks/questions";
import {
  buildGapAnalysisArtifactContent,
  GAP_ANALYSIS_ARTIFACT_KIND,
} from "@/lib/frameworks/gap-artifacts";
import {
  getFrameworkDisplayDescription,
  getFrameworkDisplayName,
  getFrameworkDisplayRegulator,
} from "@/lib/frameworks/localization";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale } from "@/i18n/routing";
import { renderGapReportPdf } from "@/lib/pdf/gap-report";

const answerSchema = z.enum(["yes", "partial", "no", "na"]);
const answersSchema = z.record(z.string(), answerSchema);

function parseFrameworkSlug(slug: string): FrameworkSlug {
  const framework = FRAMEWORK_LIBRARY.find((item) => item.slug === slug);

  if (!framework) {
    throw new Error(`Unknown framework: ${slug}`);
  }

  return framework.slug;
}

async function getActiveOrgId() {
  return (await getActiveSessionContext()).clerkOrgId;
}

async function getActiveSessionContext() {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    throw new Error("Active Clerk organisation is required.");
  }

  return {
    clerkOrgId: session.orgId,
    userId: session.userId,
  };
}

export async function assessFrameworkAction(
  frameworkSlug: string,
  input: unknown,
) {
  const parsedSlug = parseFrameworkSlug(frameworkSlug);
  const parsedAnswers = answersSchema.parse(input);
  const expectedQuestionIds = new Set(
    FRAMEWORK_QUESTIONS[parsedSlug].map((question) => question.id),
  );
  const answers = Object.fromEntries(
    Object.entries(parsedAnswers).filter(([questionId]) =>
      expectedQuestionIds.has(questionId),
    ),
  ) as Record<string, FrameworkAnswer>;
  const clerkOrgId = await getActiveOrgId();
  const result = await assessFramework({
    answers,
    clerkOrgId,
    frameworkSlug: parsedSlug,
  });

  revalidatePath("/dashboard");
  revalidatePath("/frameworks");
  revalidatePath(`/frameworks/${parsedSlug}`);
  revalidatePath(`/frameworks/${parsedSlug}/setup`);

  return result;
}

export async function generateGapReportAction(frameworkSlug: string) {
  const parsedSlug = parseFrameworkSlug(frameworkSlug);
  const session = await getActiveSessionContext();
  const clerkOrgId = session.clerkOrgId;
  const detail = await getFrameworkDetail({
    clerkOrgId,
    frameworkSlug: parsedSlug,
  });
  const organisation = await getOrganisationByClerkOrgId(clerkOrgId);

  if (!detail) {
    throw new Error(`Unknown framework: ${frameworkSlug}`);
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required to generate gap reports.");
  }

  const score = detail.orgFramework?.score ?? 0;
  const generatedAt = new Date();
  const locale = normalizeLocale(organisation?.locale) ?? "cs-CZ";
  const copy = getMessagesForLocale(locale).frameworks;
  const seedFramework = FRAMEWORK_LIBRARY.find(
    (framework) => framework.slug === parsedSlug,
  );
  const pdf = await renderGapReportPdf({
    controls: detail.controls.map((control) => ({
      ...control,
      description: locale === "cs-CZ" ? control.description : null,
      title:
        locale === "cs-CZ"
          ? control.titleCs ?? control.title
          : control.titleEn ?? control.title,
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
    score,
  });
  const blob = await put(
    `gap-reports/${clerkOrgId}/${parsedSlug}-${generatedAt.getTime()}.pdf`,
    pdf,
    {
      access: "private",
      contentType: "application/pdf",
    },
  );

  const metadata = {
    generatedAt: generatedAt.toISOString(),
    locale,
    openControls: detail.controls.filter((control) =>
      ["fail", "manual_review", "unknown", null].includes(control.status),
    ).length,
    score,
    totalControls: detail.controls.length,
  };
  const title = `${seedFramework?.nameEn ?? detail.framework.nameEn} gap report`;

  await saveGapReportRecord({
    blobUrl: blob.url,
    clerkOrgId,
    frameworkSlug: parsedSlug,
    metadata,
    title,
  }).catch((error: unknown) =>
    deleteBlobUrlsAfterFailedSave([blob.url], error),
  );
  await createGeneratedArtifact({
    clerkOrgId,
    content: buildGapAnalysisArtifactContent({
      blobUrl: blob.url,
      frameworkSlug: parsedSlug,
      metadata,
    }),
    createdBy: session.userId,
    kind: GAP_ANALYSIS_ARTIFACT_KIND,
    model: null,
    source: "gap_report_pdf",
    title,
  });

  revalidatePath(`/frameworks/${parsedSlug}`);
}
