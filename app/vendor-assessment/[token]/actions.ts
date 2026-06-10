"use server";

import { redirect } from "next/navigation";
import { submitVendorAssessmentByToken } from "@/lib/db/queries/vendors";
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
