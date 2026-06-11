"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { submitVendorAssessmentByToken } from "@/lib/db/queries/vendors";
import { enforceIpRateLimit, getClientIp } from "@/lib/http/rate-limit";
import { getAllVendorQuestionIds } from "@/lib/vendors/questions";

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

  // Collect every known question id present in the form; template-aware
  // validation happens inside submitVendorAssessmentByToken against the
  // template stored on the assessment.
  const rawAnswers = Object.fromEntries(
    getAllVendorQuestionIds()
      .map((id) => [id, getStringValue(formData, id)] as const)
      .filter(([, value]) => value !== ""),
  );

  await submitVendorAssessmentByToken({
    answers: rawAnswers,
    token,
  });

  redirect(`/vendor-assessment/${encodeURIComponent(token)}?submitted=1`);
}
