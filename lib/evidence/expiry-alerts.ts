import { hasDatabaseUrl } from "@/lib/db";
import { listExpiringEvidenceAlerts } from "@/lib/db/queries/evidence";
import { getResend, getResendFrom, hasResendConfig } from "@/lib/email/client";
import {
  evidenceExpirySubject,
  evidenceExpiryText,
} from "@/lib/email/templates/alerts";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

export async function sendEvidenceExpiryAlerts(now = new Date()) {
  if (!hasDatabaseUrl()) {
    return {
      emailsSent: 0,
      evidenceCount: 0,
      skipped: "DATABASE_URL is not configured.",
    };
  }

  if (!hasResendConfig()) {
    return {
      emailsSent: 0,
      evidenceCount: 0,
      skipped: "Resend is not configured.",
    };
  }

  const targetDates = [formatDate(addDays(now, 30)), formatDate(addDays(now, 7))];
  const alerts = await listExpiringEvidenceAlerts(targetDates);
  const resend = getResend();
  const from = getResendFrom();
  let emailsSent = 0;

  for (const alert of alerts) {
    for (const recipient of alert.recipients) {
      await resend.emails.send({
        from,
        subject: evidenceExpirySubject(alert.controlTitle),
        text: evidenceExpiryText({
          controlTitle: alert.controlTitle,
          expiresAt: alert.expiresAt,
          organisationName: alert.organisationName,
        }),
        to: recipient,
      });
      emailsSent += 1;
    }
  }

  return {
    emailsSent,
    evidenceCount: alerts.length,
    skipped: null,
  };
}
