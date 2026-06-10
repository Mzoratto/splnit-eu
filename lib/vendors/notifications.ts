import { getResend, getResendFrom, hasResendConfig } from "@/lib/email/client";
import {
  vendorQuestionnaireSubject,
  vendorQuestionnaireText,
} from "@/lib/email/templates/alerts";

export type VendorQuestionnaireEmailInput = {
  assessmentUrl: string;
  locale?: string | null;
  organisationName: string;
  to: string;
  vendorName: string;
};

export type VendorQuestionnaireEmailResult = {
  emailsSent: number;
  failed: string | null;
  skipped: string | null;
};

type VendorQuestionnaireEmailTransport = (
  input: VendorQuestionnaireEmailInput,
) => Promise<VendorQuestionnaireEmailResult>;

let vendorQuestionnaireEmailTransportForTesting:
  | VendorQuestionnaireEmailTransport
  | null = null;

export function setVendorQuestionnaireEmailTransportForTesting(
  transport: VendorQuestionnaireEmailTransport | null,
) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Test email transport cannot be set in production.");
  }

  vendorQuestionnaireEmailTransportForTesting = transport;
}

export function canSendVendorQuestionnaireEmail() {
  return hasResendConfig() || vendorQuestionnaireEmailTransportForTesting !== null;
}

export async function sendVendorQuestionnaireEmail(
  input: VendorQuestionnaireEmailInput,
): Promise<VendorQuestionnaireEmailResult> {
  if (vendorQuestionnaireEmailTransportForTesting) {
    return vendorQuestionnaireEmailTransportForTesting(input);
  }

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
