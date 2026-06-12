import { hasDatabaseUrl } from "@/lib/db";
import {
  listExpiringEvidenceAlerts,
  markEvidenceExpiryAlertSent,
} from "@/lib/db/queries/evidence";
import { getResend, getResendFrom, hasResendConfig } from "@/lib/email/client";
import {
  evidenceExpirySubject,
  evidenceExpiryText,
} from "@/lib/email/templates/alerts";

function evidenceExpiryAlertsEnabled() {
  return process.env.SPLNIT_ENABLE_EVIDENCE_EXPIRY_ALERTS === "true";
}

export async function sendEvidenceExpiryAlerts(now = new Date()) {
  if (!evidenceExpiryAlertsEnabled()) {
    return {
      emailsSent: 0,
      evidenceCount: 0,
      skipped: "Disabled. Set SPLNIT_ENABLE_EVIDENCE_EXPIRY_ALERTS=true to enable.",
    };
  }

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

  const alerts = await listExpiringEvidenceAlerts(now);
  const resend = getResend();
  const from = getResendFrom();
  let emailsSent = 0;

  for (const alert of alerts) {
    for (const recipient of alert.recipients) {
      await resend.emails.send({
        from,
        subject: evidenceExpirySubject({
          controlTitle: alert.controlTitle,
          locale: alert.locale,
        }),
        text: evidenceExpiryText({
          controlTitle: alert.controlTitle,
          expiresAt: alert.expiresAt,
          locale: alert.locale,
          organisationName: alert.organisationName,
        }),
        to: recipient,
      });
      emailsSent += 1;
    }

    // Persist the sent stage only after the emails went out, so a failed
    // send retries on the next run instead of being silently skipped.
    await markEvidenceExpiryAlertSent({
      evidenceId: alert.evidenceId,
      stage: alert.stage,
    });
  }

  return {
    emailsSent,
    evidenceCount: alerts.length,
    skipped: null,
  };
}
