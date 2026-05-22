import type { ReactElement } from "react";
import {
  FROM_ADDRESS,
  REPLY_TO,
  getResend,
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

async function sendEmail(input: {
  react: ReactElement;
  subject: string;
  text: string;
  to: string;
}) {
  if (!hasResendConfig()) {
    console.warn("Email skipped: RESEND_API_KEY is not configured.");
    return;
  }

  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      react: input.react,
      replyTo: REPLY_TO,
      subject: input.subject,
      text: input.text,
      to: input.to,
    });
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
