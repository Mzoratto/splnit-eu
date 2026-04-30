import { hasDatabaseUrl } from "@/lib/db";
import {
  listRegulationAlertRecipients,
  type RegulationAlertUpdate,
} from "@/lib/db/queries/regulation-updates";
import { getResend, getResendFrom, hasResendConfig } from "@/lib/email/client";
import {
  regulationUpdateSubject,
  regulationUpdateText,
} from "@/lib/email/templates/alerts";

export async function sendRegulationUpdateAlerts(
  updates: RegulationAlertUpdate[],
) {
  if (updates.length === 0) {
    return {
      emailsSent: 0,
      skipped: null,
      updateCount: 0,
    };
  }

  if (!hasDatabaseUrl()) {
    return {
      emailsSent: 0,
      skipped: "DATABASE_URL is not configured.",
      updateCount: updates.length,
    };
  }

  if (!hasResendConfig()) {
    return {
      emailsSent: 0,
      skipped: "Resend is not configured.",
      updateCount: updates.length,
    };
  }

  const resend = getResend();
  const from = getResendFrom();
  let emailsSent = 0;

  for (const update of updates) {
    const recipients = await listRegulationAlertRecipients({
      affectsPlans: update.affectsPlans,
      frameworkSlug: update.frameworkSlug,
    });

    for (const recipient of recipients) {
      if (!recipient.email) {
        continue;
      }

      await resend.emails.send({
        from,
        subject: regulationUpdateSubject(update.title),
        text: regulationUpdateText({
          organisationName: recipient.organisationName,
          publishedAt: update.publishedAt,
          source: update.source,
          sourceUrl: update.sourceUrl,
          summary: update.summaryCs,
          title: update.title,
        }),
        to: recipient.email,
      });
      emailsSent += 1;
    }
  }

  return {
    emailsSent,
    skipped: null,
    updateCount: updates.length,
  };
}
