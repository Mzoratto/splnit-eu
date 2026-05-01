"use server";

import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteBlobUrlsAfterFailedSave } from "@/lib/blob/cleanup";
import { createAuditLog } from "@/lib/db/queries/audit-logs";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { insertGeneratedPolicy } from "@/lib/db/queries/policies";
import { renderPolicyPdf } from "@/lib/pdf/policy-document";
import { POLICY_TEMPLATES } from "@/lib/policies/templates";

const policyTypeSchema = z.enum(
  POLICY_TEMPLATES.map((template) => template.type) as [string, ...string[]],
);

function addYears(date: Date, years: number) {
  const nextDate = new Date(date);
  nextDate.setUTCFullYear(nextDate.getUTCFullYear() + years);
  return nextDate;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function getActiveSession() {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    throw new Error("Active Clerk organisation is required.");
  }

  return {
    clerkOrgId: session.orgId,
    userId: session.userId,
  };
}

export async function generatePolicyAction(type: string) {
  const parsedType = policyTypeSchema.parse(type);
  const template = POLICY_TEMPLATES.find((item) => item.type === parsedType);

  if (!template) {
    throw new Error(`Unknown policy template: ${type}`);
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required to generate policies.");
  }

  const session = await getActiveSession();
  const organisation = await getOrganisationByClerkOrgId(session.clerkOrgId);

  if (!organisation) {
    throw new Error("Organisation profile is required to generate policies.");
  }

  const generatedAt = new Date();
  const reviewDate = formatDate(addYears(generatedAt, 1));
  const pdf = await renderPolicyPdf({
    generatedAt,
    organisation: {
      ico: organisation.ico,
      name: organisation.name,
    },
    reviewDate,
    template,
  });
  const blob = await put(
    `policies/${session.clerkOrgId}/${parsedType}-${generatedAt.getTime()}.pdf`,
    pdf,
    {
      access: "private",
      contentType: "application/pdf",
    },
  );

  const policyId = await insertGeneratedPolicy({
    blobUrl: blob.url,
    clerkOrgId: session.clerkOrgId,
    content: {
      generatedAt: generatedAt.toISOString(),
      reviewDate,
      sections: template.sections,
      sourceDocument: template.sourceDocument,
    },
    controlKeys: template.controlKeys,
    expiresAt: reviewDate,
    title: template.titleCs,
    type: template.type,
  }).catch((error: unknown) =>
    deleteBlobUrlsAfterFailedSave([blob.url], error),
  );

  if (policyId) {
    await createAuditLog({
      action: "policy.generated",
      clerkOrgId: session.clerkOrgId,
      clerkUserId: session.userId,
      entityId: policyId,
      entityType: "policy",
      metadata: {
        expiresAt: reviewDate,
        title: template.titleCs,
        type: template.type,
      },
    });
  }

  revalidatePath("/policies");
  revalidatePath("/settings/audit-log");
  revalidatePath(`/policies/${template.type}`);
}
