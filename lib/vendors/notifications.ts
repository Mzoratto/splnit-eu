import { getResend, getResendFrom, hasResendConfig } from "@/lib/email/client";
import {
  vendorQuestionnaireSubject,
  vendorQuestionnaireText,
} from "@/lib/email/templates/alerts";

export async function sendVendorQuestionnaireEmail(input: {
  assessmentUrl: string;
  locale?: string | null;
  organisationName: string;
  to: string;
  vendorName: string;
}): Promise<{ emailsSent: number; failed: string | null; skipped: string | null }> {
  if (!hasResendConfig()) {
    return {
      emailsSent: 0,
      failed: null,
      skipped: "Resend is not configured.",
    };
  }

  try {
    await getResend().emails.send({
      from: getResendFrom(),
      subject: vendorQuestionnaireSubject({
        locale: input.locale,
        organisationName: input.organisationName,
      }),
      text: vendorQuestionnaireText(input),
      to: input.to,
    });
  } catch (error) {
    return {
      emailsSent: 0,
      failed: error instanceof Error ? error.message : "Vendor questionnaire email failed.",
      skipped: null,
    };
  }

  return {
    emailsSent: 1,
    failed: null,
    skipped: null,
  };
}
