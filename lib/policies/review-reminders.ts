import { hasDatabaseUrl } from "@/lib/db";
import { listPolicyReviewAlerts } from "@/lib/db/queries/policies";
import { getResend, getResendFrom, hasResendConfig } from "@/lib/email/client";
import { policyReviewSubject, policyReviewText } from "@/lib/email/templates/alerts";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

export async function sendPolicyReviewReminders(now = new Date()) {
  if (!hasDatabaseUrl()) {
    return {
      emailsSent: 0,
      policyCount: 0,
      skipped: "DATABASE_URL is not configured.",
    };
  }

  if (!hasResendConfig()) {
    return {
      emailsSent: 0,
      policyCount: 0,
      skipped: "Resend is not configured.",
    };
  }

  const targetDates = [formatDate(addDays(now, 30)), formatDate(addDays(now, 7))];
  const alerts = await listPolicyReviewAlerts(targetDates);
  const resend = getResend();
  const from = getResendFrom();
  let emailsSent = 0;

  for (const alert of alerts) {
    for (const recipient of alert.recipients) {
      await resend.emails.send({
        from,
        subject: policyReviewSubject(alert.policyTitle),
        text: policyReviewText({
          expiresAt: alert.expiresAt,
          organisationName: alert.organisationName,
          policyTitle: alert.policyTitle,
        }),
        to: recipient,
      });
      emailsSent += 1;
    }
  }

  return {
    emailsSent,
    policyCount: alerts.length,
    skipped: null,
  };
}
