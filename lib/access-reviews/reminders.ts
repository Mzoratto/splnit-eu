import { hasDatabaseUrl } from "@/lib/db";
import { listAccessReviewReminderAlerts } from "@/lib/db/queries/access-reviews";
import { getResend, getResendFrom, hasResendConfig } from "@/lib/email/client";
import {
  accessReviewReminderSubject,
  accessReviewReminderText,
} from "@/lib/email/templates/alerts";

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function sendAccessReviewReminders() {
  if (!hasDatabaseUrl()) {
    return {
      emailsSent: 0,
      organisationCount: 0,
      skipped: "DATABASE_URL is not configured.",
    };
  }

  if (!hasResendConfig()) {
    return {
      emailsSent: 0,
      organisationCount: 0,
      skipped: "Resend is not configured.",
    };
  }

  const alerts = await listAccessReviewReminderAlerts();
  const resend = getResend();
  const from = getResendFrom();
  let emailsSent = 0;

  for (const alert of alerts) {
    for (const recipient of alert.recipients) {
      await resend.emails.send({
        from,
        subject: accessReviewReminderSubject({
          locale: alert.locale,
          organisationName: alert.organisationName,
        }),
        text: accessReviewReminderText({
          accessReviewsUrl: `${getAppUrl()}/team/access-reviews`,
          locale: alert.locale,
          organisationName: alert.organisationName,
        }),
        to: recipient,
      });
      emailsSent += 1;
    }
  }

  return {
    emailsSent,
    organisationCount: alerts.length,
    skipped: null,
  };
}
