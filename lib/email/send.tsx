import React, { type ReactElement } from "react";
import {
  REPLY_TO,
  getResend,
  getResendFrom,
  hasResendConfig,
} from "@/lib/email/client";
import DeadlineReminderEmail, {
  deadlineReminderSubject,
  plainText as deadlineReminderText,
  type DeadlineReminderProps,
} from "@/lib/email/templates/deadline-reminder";
import GapAlertEmail, {
  gapAlertSubject,
  plainText as gapAlertText,
  type GapAlertProps,
} from "@/lib/email/templates/gap-alert";
import ConsultantInviteEmail, {
  consultantInviteSubject,
  plainText as consultantInviteText,
  type ConsultantInviteProps,
} from "@/lib/email/templates/consultant-invite";
import SubscriptionConfirmationEmail, {
  plainText as subscriptionConfirmationText,
  subscriptionConfirmationSubject,
  type SubscriptionConfirmationProps,
} from "@/lib/email/templates/subscription-confirmation";
import InvoiceReceiptEmail, {
  invoiceReceiptSubject,
  plainText as invoiceReceiptText,
  type InvoiceReceiptProps,
} from "@/lib/email/templates/invoice-receipt";
import SubscriptionCancellationEmail, {
  plainText as subscriptionCancellationText,
  subscriptionCancellationSubject,
  type SubscriptionCancellationProps,
} from "@/lib/email/templates/subscription-cancellation";

type EmailPayload = {
  from: string;
  react: ReactElement;
  replyTo: string;
  subject: string;
  text: string;
  to: string;
};

type EmailTransport = (input: EmailPayload) => Promise<void> | void;

let emailTransportForTesting: EmailTransport | null = null;

export function setEmailTransportForTesting(transport: EmailTransport | null) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Test email transport cannot be set in production.");
  }

  emailTransportForTesting = transport;
}

async function sendEmail(input: {
  react: ReactElement;
  subject: string;
  text: string;
  to: string;
}) {
  const payload = {
    from: getResendFrom(),
    react: input.react,
    replyTo: REPLY_TO,
    subject: input.subject,
    text: input.text,
    to: input.to,
  };

  if (emailTransportForTesting) {
    await emailTransportForTesting(payload);
    return;
  }

  if (!hasResendConfig()) {
    console.warn("Email skipped: RESEND_API_KEY is not configured.");
    return;
  }

  try {
    await getResend().emails.send(payload);
  } catch (error) {
    console.error("Email delivery failed.", error);
  }
}

export async function sendDeadlineReminder(
  to: string,
  props: DeadlineReminderProps,
): Promise<void> {
  await sendEmail({
    react: <DeadlineReminderEmail {...props} />,
    subject: deadlineReminderSubject(props),
    text: deadlineReminderText(props),
    to,
  });
}

export async function sendGapAlert(
  to: string,
  props: GapAlertProps,
): Promise<void> {
  await sendEmail({
    react: <GapAlertEmail {...props} />,
    subject: gapAlertSubject(props),
    text: gapAlertText(props),
    to,
  });
}

export async function sendConsultantInvite(
  to: string,
  props: ConsultantInviteProps,
): Promise<void> {
  await sendEmail({
    react: <ConsultantInviteEmail {...props} />,
    subject: consultantInviteSubject(props),
    text: consultantInviteText(props),
    to,
  });
}

export async function sendSubscriptionConfirmation(
  to: string,
  props: SubscriptionConfirmationProps,
): Promise<void> {
  await sendEmail({
    react: <SubscriptionConfirmationEmail {...props} />,
    subject: subscriptionConfirmationSubject(),
    text: subscriptionConfirmationText(props),
    to,
  });
}

export async function sendInvoiceReceipt(
  to: string,
  props: InvoiceReceiptProps,
): Promise<void> {
  await sendEmail({
    react: <InvoiceReceiptEmail {...props} />,
    subject: invoiceReceiptSubject(props),
    text: invoiceReceiptText(props),
    to,
  });
}

export async function sendSubscriptionCancellation(
  to: string,
  props: SubscriptionCancellationProps,
): Promise<void> {
  await sendEmail({
    react: <SubscriptionCancellationEmail {...props} />,
    subject: subscriptionCancellationSubject(),
    text: subscriptionCancellationText(props),
    to,
  });
}
