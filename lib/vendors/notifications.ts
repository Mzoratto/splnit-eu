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
}) {
  if (!hasResendConfig()) {
    return {
      emailsSent: 0,
      skipped: "Resend is not configured.",
    };
  }

  await getResend().emails.send({
    from: getResendFrom(),
    subject: vendorQuestionnaireSubject({
      locale: input.locale,
      organisationName: input.organisationName,
    }),
    text: vendorQuestionnaireText(input),
    to: input.to,
  });

  return {
    emailsSent: 1,
    skipped: null,
  };
}
