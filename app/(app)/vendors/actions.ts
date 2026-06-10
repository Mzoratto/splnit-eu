"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  createVendor,
  createVendorQuestionnaire,
  getVendorDetail,
  saveVendorAssessment,
  updateVendorQuestionnaireDelivery,
} from "@/lib/db/queries/vendors";
import { createVendorAssessmentToken } from "@/lib/vendors/access";
import {
  requireVendorAssessmentAnswers,
  VENDOR_ASSESSMENT_QUESTIONS,
} from "@/lib/vendors/questions";
import { sendVendorQuestionnaireEmail } from "@/lib/vendors/notifications";
import {
  getVendorQuestionnaireDeliveryMetadata,
  getVendorQuestionnaireDeliveryStatus,
} from "@/lib/vendors/delivery-status";

const vendorSchema = z.object({
  category: z.string().trim().max(80).optional(),
  name: z.string().trim().min(2).max(160),
  website: z.string().trim().url().optional().or(z.literal("")),
});

const questionnaireSchema = z.object({
  email: z.string().trim().email().max(254),
});

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function requireActiveSession() {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    redirect("/sign-in");
  }

  return {
    clerkOrgId: session.orgId,
    userId: session.userId,
  };
}

export async function createVendorAction(formData: FormData) {
  const session = await requireActiveSession();
  const parsed = vendorSchema.parse({
    category: getStringValue(formData, "category"),
    name: getStringValue(formData, "name"),
    website: getStringValue(formData, "website"),
  });

  const vendor = await createVendor({
    category: parsed.category || null,
    clerkOrgId: session.clerkOrgId,
    name: parsed.name,
    website: parsed.website || null,
  });

  revalidatePath("/vendors");
  redirect(`/vendors/${vendor.id}`);
}

export async function saveVendorAssessmentAction(
  vendorId: string,
  formData: FormData,
) {
  const session = await requireActiveSession();
  const rawAnswers = Object.fromEntries(
    VENDOR_ASSESSMENT_QUESTIONS.map((question) => [
      question.id,
      getStringValue(formData, question.id),
    ]),
  );
  const answers = requireVendorAssessmentAnswers(rawAnswers);

  await saveVendorAssessment({
    answers,
    assessedBy: session.userId,
    clerkOrgId: session.clerkOrgId,
    vendorId,
  });

  revalidatePath("/vendors");
  revalidatePath(`/vendors/${vendorId}`);
}

export async function sendVendorQuestionnaireAction(
  vendorId: string,
  formData: FormData,
) {
  const session = await requireActiveSession();
  const parsed = questionnaireSchema.parse({
    email: getStringValue(formData, "email"),
  });
  const detail = await getVendorDetail({
    clerkOrgId: session.clerkOrgId,
    vendorId,
  });

  if (!detail) {
    throw new Error("Vendor not found.");
  }

  const assessment = await createVendorQuestionnaire({
    clerkOrgId: session.clerkOrgId,
    vendorEmail: parsed.email,
    vendorId,
  });
  const token = createVendorAssessmentToken({
    assessmentId: assessment.id,
    clerkOrgId: session.clerkOrgId,
    vendorId,
  });
  const organisation = await getOrganisationByClerkOrgId(session.clerkOrgId);

  const deliveryResult = await sendVendorQuestionnaireEmail({
    assessmentUrl: `${getAppUrl()}/vendor-assessment/${token}`,
    locale: organisation?.locale,
    organisationName: organisation?.name ?? "Splnit.eu",
    to: parsed.email,
    vendorName: detail.vendor.name,
  });
  const deliveryState = getVendorQuestionnaireDeliveryStatus(deliveryResult);

  await updateVendorQuestionnaireDelivery({
    assessmentId: assessment.id,
    clerkOrgId: session.clerkOrgId,
    delivery: {
      ...getVendorQuestionnaireDeliveryMetadata({
        result: deliveryResult,
        to: parsed.email,
      }),
      tokenCreated: true,
      vendorEmail: parsed.email,
    },
    status: deliveryState.assessmentStatus,
    vendorId,
    vendorStatus: deliveryState.vendorStatus,
  });

  revalidatePath("/vendors");
  revalidatePath(`/vendors/${vendorId}`);
}
