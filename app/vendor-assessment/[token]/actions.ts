"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { submitVendorAssessmentByToken } from "@/lib/db/queries/vendors";
import { enforceIpRateLimit, getClientIp } from "@/lib/http/rate-limit";
import {
  requireVendorAssessmentAnswers,
  VENDOR_ASSESSMENT_QUESTIONS,
} from "@/lib/vendors/questions";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function submitVendorAssessmentAction(
  token: string,
  formData: FormData,
) {
  const { allowed } = await enforceIpRateLimit({
    ip: getClientIp(await headers()),
    limit: 10,
    scope: "vendor-assessment-submit",
    windowSeconds: 600,
  });

  if (!allowed) {
    throw new Error("Too many requests. Try again later.");
  }

  const rawAnswers = Object.fromEntries(
    VENDOR_ASSESSMENT_QUESTIONS.map((question) => [
      question.id,
      getStringValue(formData, question.id),
    ]),
  );
  const answers = requireVendorAssessmentAnswers(rawAnswers);

  await submitVendorAssessmentByToken({
    answers,
    token,
  });

  redirect(`/vendor-assessment/${encodeURIComponent(token)}?submitted=1`);
}
