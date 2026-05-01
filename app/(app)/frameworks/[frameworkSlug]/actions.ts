"use server";

import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteBlobUrlsAfterFailedSave } from "@/lib/blob/cleanup";
import type { FrameworkSlug } from "@/lib/controls/library";
import {
  assessFramework,
  getFrameworkDetail,
  saveGapReportRecord,
} from "@/lib/db/queries/framework-assessment";
import {
  FRAMEWORK_QUESTIONS,
  type FrameworkAnswer,
} from "@/lib/frameworks/questions";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
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
  const session = await auth();

  if (!session.userId || !session.orgId) {
    throw new Error("Active Clerk organisation is required.");
  }

  return session.orgId;
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
  const clerkOrgId = await getActiveOrgId();
  const detail = await getFrameworkDetail({
    clerkOrgId,
    frameworkSlug: parsedSlug,
  });

  if (!detail) {
    throw new Error(`Unknown framework: ${frameworkSlug}`);
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required to generate gap reports.");
  }

  const score = detail.orgFramework?.score ?? 0;
  const generatedAt = new Date();
  const pdf = await renderGapReportPdf({
    controls: detail.controls,
    framework: detail.framework,
    generatedAt,
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

  await saveGapReportRecord({
    blobUrl: blob.url,
    clerkOrgId,
    frameworkSlug: parsedSlug,
    metadata: {
      generatedAt: generatedAt.toISOString(),
      openControls: detail.controls.filter((control) =>
        ["fail", "manual_review", "unknown", null].includes(control.status),
      ).length,
      score,
      totalControls: detail.controls.length,
    },
    title: `${detail.framework.nameCs} gap report`,
  }).catch((error: unknown) =>
    deleteBlobUrlsAfterFailedSave([blob.url], error),
  );

  revalidatePath(`/frameworks/${parsedSlug}`);
}
