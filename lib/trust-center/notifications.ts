import { getResend, getResendFrom, hasResendConfig } from "@/lib/email/client";
import {
  trustCenterAccessSubject,
  trustCenterAccessText,
  trustCenterRequestSubject,
  trustCenterRequestText,
} from "@/lib/email/templates/alerts";

export async function sendTrustCenterRequestEmail(input: {
  locale?: string | null;
  organisationName: string;
  recipients: { email: string | null }[];
  requesterCompany?: string | null;
  requesterEmail: string;
  reviewUrl: string;
}) {
  if (!hasResendConfig()) {
    return {
      emailsSent: 0,
      skipped: "Resend is not configured.",
    };
  }

  const resend = getResend();
  const from = getResendFrom();
  let emailsSent = 0;

  for (const recipient of input.recipients) {
    if (!recipient.email) {
      continue;
    }

    await resend.emails.send({
      from,
      subject: trustCenterRequestSubject({
        locale: input.locale,
        organisationName: input.organisationName,
      }),
      text: trustCenterRequestText(input),
      to: recipient.email,
    });
    emailsSent += 1;
  }

  return {
    emailsSent,
    skipped: null,
  };
}

export async function sendTrustCenterAccessEmail(input: {
  accessUrl: string;
  locale?: string | null;
  organisationName: string;
  requesterEmail: string;
}) {
  if (!hasResendConfig()) {
    return {
      emailsSent: 0,
      skipped: "Resend is not configured.",
    };
  }

  await getResend().emails.send({
    from: getResendFrom(),
    subject: trustCenterAccessSubject({
      locale: input.locale,
      organisationName: input.organisationName,
    }),
    text: trustCenterAccessText(input),
    to: input.requesterEmail,
  });

  return {
    emailsSent: 1,
    skipped: null,
  };
}
