"use server";

import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteBlobUrlsAfterFailedSave } from "@/lib/blob/cleanup";
import { createAuditLog } from "@/lib/db/queries/audit-logs";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  getLatestPolicyDraftForOrg,
  insertGeneratedPolicy,
  upsertPolicyDraft,
} from "@/lib/db/queries/policies";
import { renderPolicyPdf } from "@/lib/pdf/policy-document";
import {
  buildInitialPolicyDraftContent,
  buildPolicyTemplateFromDraft,
  parsePolicyDraftContent,
  parsePolicyDraftFormData,
  type PolicyDraftContent,
} from "@/lib/policies/policy-drafts";
import { resolvePolicyTemplate } from "@/lib/policies/resolve-template";
import { resolvePolicySourceDocument } from "@/lib/policies/source-documents";
import { POLICY_TEMPLATE_TYPES } from "@/lib/policies/templates";

const policyTypeSchema = z.enum(POLICY_TEMPLATE_TYPES);

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

async function resolveCurrentPolicyDraft(input: {
  clerkOrgId: string;
  formData?: FormData;
  type: (typeof POLICY_TEMPLATE_TYPES)[number];
}) {
  const organisation = await getOrganisationByClerkOrgId(input.clerkOrgId);

  if (!organisation) {
    throw new Error("Organisation profile is required to prepare policy drafts.");
  }

  const template = resolvePolicyTemplate(input.type, organisation);
  const sourceDocument = await resolvePolicySourceDocument(template);
  const existingDraft = await getLatestPolicyDraftForOrg({
    clerkOrgId: input.clerkOrgId,
    type: input.type,
  });
  const generatedAt = new Date();
  const initialDraft = buildInitialPolicyDraftContent({
    generatedAt,
    organisation,
    reviewDate: formatDate(addYears(generatedAt, 1)),
    sourceDocument,
    template,
  });
  const storedDraft = parsePolicyDraftContent(existingDraft?.content) ?? initialDraft;
  const draft = input.formData?.has("title")
    ? parsePolicyDraftFormData({ currentDraft: storedDraft, formData: input.formData })
    : storedDraft;

  return {
    draft,
    organisation,
    sourceDocument,
    template,
  };
}

export async function savePolicyDraftAction(type: string, formData: FormData) {
  const parsedType = policyTypeSchema.parse(type);
  const session = await getActiveSession();
  const { draft, template } = await resolveCurrentPolicyDraft({
    clerkOrgId: session.clerkOrgId,
    formData,
    type: parsedType,
  });

  const policyId = await upsertPolicyDraft({
    clerkOrgId: session.clerkOrgId,
    content: draft,
    title: draft.title,
    type: template.type,
  });

  if (policyId) {
    await createAuditLog({
      action: "policy.draft_saved",
      clerkOrgId: session.clerkOrgId,
      clerkUserId: session.userId,
      entityId: policyId,
      entityType: "policy",
      metadata: {
        reviewDate: draft.reviewDate,
        title: draft.title,
        type: template.type,
      },
    });
  }

  revalidatePath("/policies");
  revalidatePath("/settings/audit-log");
  revalidatePath(`/policies/${template.type}`);
}

export async function generatePolicyAction(type: string, formData?: FormData) {
  const parsedType = policyTypeSchema.parse(type);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required to generate policies.");
  }

  const session = await getActiveSession();
  const { draft, organisation, sourceDocument, template } =
    await resolveCurrentPolicyDraft({
      clerkOrgId: session.clerkOrgId,
      formData,
      type: parsedType,
    });
  const templateFromDraft = buildPolicyTemplateFromDraft({ draft, template });
  const generatedAt = new Date();
  const pdf = await renderPolicyPdf({
    generatedAt,
    organisation: {
      ico: organisation.ico,
      name: organisation.name,
    },
    reviewDate: draft.reviewDate,
    sourceDocument,
    template: templateFromDraft,
  });
  const blob = await put(
    `policies/${session.clerkOrgId}/${parsedType}-${generatedAt.getTime()}.pdf`,
    pdf,
    {
      access: "private",
      contentType: "application/pdf",
    },
  );

  const draftContent: PolicyDraftContent = {
    ...draft,
    generatedAt: generatedAt.toISOString(),
  };
  const policyId = await insertGeneratedPolicy({
    blobUrl: blob.url,
    clerkOrgId: session.clerkOrgId,
    content: {
      ...draftContent,
      sourceDocument,
    },
    controlKeys: template.controlKeys,
    expiresAt: draft.reviewDate,
    title: draft.title,
    type: template.type,
  }).catch((error: unknown) =>
    deleteBlobUrlsAfterFailedSave([blob.url], error),
  );

  if (policyId) {
    await upsertPolicyDraft({
      clerkOrgId: session.clerkOrgId,
      content: draftContent,
      title: draft.title,
      type: template.type,
    });
    await createAuditLog({
      action: "policy.generated",
      clerkOrgId: session.clerkOrgId,
      clerkUserId: session.userId,
      entityId: policyId,
      entityType: "policy",
      metadata: {
        expiresAt: draft.reviewDate,
        title: draft.title,
        type: template.type,
      },
    });
  }

  revalidatePath("/policies");
  revalidatePath("/settings/audit-log");
  revalidatePath(`/policies/${template.type}`);
}
