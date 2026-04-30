import { hasDatabaseUrl } from "@/lib/db";
import { listWeeklyRegulationDigestRecipients } from "@/lib/db/queries/regulation-updates";

function hasLoopsDigestConfig() {
  return Boolean(
    process.env.LOOPS_API_KEY &&
      process.env.LOOPS_REGULATION_DIGEST_TRANSACTIONAL_ID,
  );
}

function formatUpdateList(
  updates: Awaited<ReturnType<typeof listWeeklyRegulationDigestRecipients>>[number]["updates"],
) {
  return updates
    .map((update) => {
      const date = new Intl.DateTimeFormat("cs-CZ").format(update.publishedAt);
      return `${date} · ${update.source} · ${update.title}`;
    })
    .join("\n");
}

export async function sendWeeklyRegulationDigest() {
  if (!hasDatabaseUrl()) {
    return {
      emailsSent: 0,
      skipped: "DATABASE_URL is not configured.",
    };
  }

  if (!hasLoopsDigestConfig()) {
    return {
      emailsSent: 0,
      skipped: "Loops regulation digest is not configured.",
    };
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recipients = await listWeeklyRegulationDigestRecipients(since);
  let emailsSent = 0;

  for (const recipient of recipients) {
    const response = await fetch("https://app.loops.so/api/v1/transactional", {
      body: JSON.stringify({
        addToAudience: true,
        dataVariables: {
          organisationName: recipient.organisationName,
          updateCount: recipient.updates.length,
          updates: formatUpdateList(recipient.updates),
        },
        email: recipient.email,
        transactionalId: process.env.LOOPS_REGULATION_DIGEST_TRANSACTIONAL_ID,
      }),
      headers: {
        Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Loops digest send failed: ${response.status}`);
    }

    emailsSent += 1;
  }

  return {
    emailsSent,
    skipped: null,
  };
}
