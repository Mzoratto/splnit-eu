"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createTrustCenterRequest } from "@/lib/db/queries/trust-center";
import { getAppUrl } from "@/lib/env";
import { enforceIpRateLimit, getClientIp } from "@/lib/http/rate-limit";
import { sendTrustCenterRequestEmail } from "@/lib/trust-center/notifications";

const requestSchema = z.object({
  company: z.string().trim().max(160).optional(),
  email: z.string().trim().email().max(254),
});

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function requestTrustCenterAccessAction(
  orgSlug: string,
  formData: FormData,
) {
  const { allowed } = await enforceIpRateLimit({
    ip: getClientIp(await headers()),
    limit: 5,
    scope: "trust-center-request",
    windowSeconds: 600,
  });

  if (!allowed) {
    throw new Error("Too many requests. Try again later.");
  }

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
