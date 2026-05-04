"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createTrustCenterRequest } from "@/lib/db/queries/trust-center";
import { sendTrustCenterRequestEmail } from "@/lib/trust-center/notifications";

const requestSchema = z.object({
  company: z.string().trim().max(160).optional(),
  email: z.string().trim().email().max(254),
});

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function requestTrustCenterAccessAction(
  orgSlug: string,
  formData: FormData,
) {
  const parsed = requestSchema.parse({
    company: getStringValue(formData, "company"),
    email: getStringValue(formData, "email"),
  });
  const result = await createTrustCenterRequest({
    company: parsed.company || null,
    email: parsed.email,
    orgSlug,
  });

  await sendTrustCenterRequestEmail({
    locale: result.locale,
    organisationName: result.organisationName,
    recipients: result.recipients,
    requesterCompany: result.request.company,
    requesterEmail: result.request.email,
    reviewUrl: `${getAppUrl()}/trust-center`,
  });

  redirect(`/trust/${orgSlug}?requested=1`);
}
