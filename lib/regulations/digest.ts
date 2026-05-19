import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { hasDatabaseUrl, getDb } from "@/lib/db";
import { listWeeklyRegulationDigestRecipients } from "@/lib/db/queries/regulation-updates";
import { listOrgControlsForIndex } from "@/lib/db/queries/controls";
import {
  evidence,
  orgControlStatuses,
  orgFrameworks,
} from "@/lib/db/schema";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://splnit.eu";

function hasLoopsDigestConfig() {
  return Boolean(
    process.env.LOOPS_API_KEY &&
      process.env.LOOPS_REGULATION_DIGEST_TRANSACTIONAL_ID,
  );
}

type WeeklyRecipient = Awaited<
  ReturnType<typeof listWeeklyRegulationDigestRecipients>
>[number];

export type WeeklyDigestModel = {
  completedStepLabel: string;
  currentScore: number;
  evidenceDeltaLabel: string;
  evidenceUploadedThisWeek: number;
  organisationName: string;
  primaryCtaUrl: string;
  regulatoryNews: {
    date: string;
    source: string;
    summary: string;
    title: string;
    url: string | null;
  }[];
  scoreDeltaLabel: string;
  topPriorities: {
    href: string;
    reason: string;
    title: string;
  }[];
  unresolvedPriorityCount: number;
  unresolvedPriorityDeltaLabel: string;
  updateCount: number;
};

function formatUpdateList(updates: WeeklyRecipient["updates"]) {
  return updates
    .map((update) => {
      const date = new Intl.DateTimeFormat("cs-CZ").format(update.publishedAt);
      return `${date} · ${update.source} · ${update.title}`;
    })
    .join("\n");
}

function formatRegulatoryNews(updates: WeeklyRecipient["updates"]): WeeklyDigestModel["regulatoryNews"] {
  return updates.slice(0, 3).map((update) => ({
    date: new Intl.DateTimeFormat("cs-CZ", { dateStyle: "medium" }).format(update.publishedAt),
    source: update.source,
    summary: update.summary ?? update.frameworkName ?? "Relevantní aktualizace pro váš rámec.",
    title: update.title,
    url: update.sourceUrl,
  }));
}

function rankControl(control: Awaited<ReturnType<typeof listOrgControlsForIndex>>[number]) {
  let score = 0;

  if (control.isIntakePriority) score += 50;
  if (control.scopeStatus === "applicable") score += 20;
  if (control.status === "fail") score += 18;
  if (control.status === "manual_review" || control.status === "warning") score += 12;
  if (!control.status || control.status === "unknown") score += 8;
  if (control.isAutomated) score += 4;

  return score;
}

export async function buildWeeklyDigestModel(
  recipient: WeeklyRecipient,
  since: Date,
): Promise<WeeklyDigestModel> {
  const db = getDb();
  const [controls, scoreRows, evidenceRows, completedRows] = await Promise.all([
    listOrgControlsForIndex(recipient.clerkOrgId),
    db
      .select({
        averageScore: sql<number>`coalesce(round(avg(${orgFrameworks.score})), 0)::int`,
      })
      .from(orgFrameworks)
      .where(eq(orgFrameworks.clerkOrgId, recipient.clerkOrgId)),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(evidence)
      .where(
        and(
          eq(evidence.clerkOrgId, recipient.clerkOrgId),
          gte(evidence.collectedAt, since),
        ),
      ),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(orgControlStatuses)
      .where(
        and(
          eq(orgControlStatuses.clerkOrgId, recipient.clerkOrgId),
          gte(orgControlStatuses.updatedAt, since),
          inArray(orgControlStatuses.status, ["pass", "manual_review", "warning"]),
        ),
      ),
  ]);
  const unresolvedPriorities = controls.filter(
    (control) =>
      control.isIntakePriority &&
      control.scopeStatus !== "out_of_scope" &&
      control.status !== "pass" &&
      control.status !== "not_applicable",
  );
  const topPriorities = [...unresolvedPriorities]
    .sort((a, b) => rankControl(b) - rankControl(a))
    .slice(0, 3)
    .map((control) => ({
      href: `${APP_URL}/controls/${control.key}`,
      reason:
        control.intakeRationale ??
        (control.isAutomated
          ? "Připojte integraci a Splnit začne sbírat důkaz automaticky."
          : "Doplňte vlastnictví a první důkaz, aby se stav posunul."),
      title: control.titleCs,
    }));
  const completedThisWeek = completedRows[0]?.value ?? 0;
  const evidenceUploadedThisWeek = evidenceRows[0]?.value ?? 0;
  const currentScore = scoreRows[0]?.averageScore ?? 0;
  const scoreDelta = Math.min(completedThisWeek * 7, 21);

  return {
    completedStepLabel: completedThisWeek > 0 ? "Krok 2 ze 4 dokončen tento týden" : "Krok 2 ze 4 čeká na první důkaz",
    currentScore,
    evidenceDeltaLabel: evidenceUploadedThisWeek > 0 ? `↑ +${evidenceUploadedThisWeek}` : "→ 0",
    evidenceUploadedThisWeek,
    organisationName: recipient.organisationName,
    primaryCtaUrl: `${APP_URL}/controls`,
    regulatoryNews: formatRegulatoryNews(recipient.updates),
    scoreDeltaLabel: scoreDelta > 0 ? `↑ +${scoreDelta}%` : "→ 0%",
    topPriorities,
    unresolvedPriorityCount: unresolvedPriorities.length,
    unresolvedPriorityDeltaLabel: completedThisWeek > 0 ? `↓ −${completedThisWeek}` : "→ 0",
    updateCount: recipient.updates.length,
  };
}

export function renderWeeklyDigestHtml(model: WeeklyDigestModel) {
  const priorityRows = model.topPriorities
    .map(
      (priority, index) => `
        <tr>
          <td style="padding:14px 0;border-top:1px solid #e5e7eb;vertical-align:top;color:#64748b;font-weight:700;">${index + 1}</td>
          <td style="padding:14px 0;border-top:1px solid #e5e7eb;">
            <div style="font-weight:700;color:#0f172a;">${escapeHtml(priority.title)}</div>
            <div style="margin-top:4px;color:#64748b;line-height:1.5;">${escapeHtml(priority.reason)}</div>
          </td>
        </tr>`,
    )
    .join("");
  const prioritiesBlock = priorityRows || `
        <tr>
          <td style="padding:14px 0;border-top:1px solid #e5e7eb;color:#64748b;line-height:1.5;">
            Zatím nejsou vybrané žádné intake priority. Otevřete Splnit a dokončete intake nebo zkontrolujte rozsah rámců.
          </td>
        </tr>`;
  const newsRows = model.regulatoryNews
    .map(
      (item) => `
        <li style="margin:0 0 14px 0;">
          <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#64748b;">${escapeHtml(item.source)} · ${escapeHtml(item.date)}</div>
          <div style="margin-top:3px;font-weight:700;color:#0f172a;">${escapeHtml(item.title)}</div>
          <div style="margin-top:4px;color:#64748b;line-height:1.5;">${escapeHtml(item.summary)}</div>
        </li>`,
    )
    .join("");
  const newsBlock = newsRows || `
        <li style="margin:0;color:#64748b;line-height:1.5;">
          Tento týden pro vaše aktivní rámce neevidujeme novou regulatorní aktualizaci.
        </li>`;

  return `<!doctype html>
<html lang="cs">
  <body style="margin:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;color:#0f172a;">
    <div style="max-width:680px;margin:0 auto;padding:28px 16px;">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">
        <div style="padding:28px;background:#0f172a;color:#ffffff;">
          <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#93c5fd;">Splnit weekly digest</div>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;">${escapeHtml(model.organisationName)} — týdenní posun v compliance</h1>
          <p style="margin:12px 0 0;color:#cbd5e1;">${escapeHtml(model.completedStepLabel)}</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-bottom:1px solid #e5e7eb;">
          ${metricCell("Skóre", `${model.currentScore}%`, model.scoreDeltaLabel)}
          ${metricCell("Priority", String(model.unresolvedPriorityCount), model.unresolvedPriorityDeltaLabel)}
          ${metricCell("Důkazy", String(model.evidenceUploadedThisWeek), model.evidenceDeltaLabel)}
        </div>
        <div style="padding:28px;">
          <h2 style="margin:0 0 8px;font-size:20px;">Top 3 priority na tento týden</h2>
          <p style="margin:0 0 14px;color:#64748b;line-height:1.5;">Přímo z vašeho prioritizovaného gap listu.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${prioritiesBlock}</table>
          <p style="margin:22px 0 0;">
            <a href="${model.primaryCtaUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:13px 18px;border-radius:12px;font-weight:700;">Otevřít priority ve Splnit</a>
          </p>
        </div>
        <div style="padding:0 28px 28px;">
          <div style="border:1px solid #e5e7eb;border-radius:16px;padding:18px;background:#f8fafc;">
            <h2 style="margin:0 0 12px;font-size:18px;">Regulatorní signály pro CZ/EU</h2>
            <ul style="padding-left:18px;margin:0;">${newsBlock}</ul>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}


export function buildWeeklyDigestDataVariables(
  digest: WeeklyDigestModel,
  updatesText: string,
) {
  return {
    completedStepLabel: digest.completedStepLabel,
    currentScore: digest.currentScore,
    evidenceDelta: digest.evidenceDeltaLabel,
    evidenceUploadedThisWeek: digest.evidenceUploadedThisWeek,
    htmlPreview: renderWeeklyDigestHtml(digest),
    organisationName: digest.organisationName,
    primaryCtaUrl: digest.primaryCtaUrl,
    regulatoryNews: digest.regulatoryNews,
    scoreDelta: digest.scoreDeltaLabel,
    topPriorities: digest.topPriorities,
    unresolvedPriorityCount: digest.unresolvedPriorityCount,
    unresolvedPriorityDelta: digest.unresolvedPriorityDeltaLabel,
    updateCount: digest.updateCount,
    updates: updatesText,
  };
}

function metricCell(label: string, value: string, delta: string) {
  return `<div style="padding:18px;border-right:1px solid #e5e7eb;"><div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#64748b;">${label}</div><div style="margin-top:7px;font-size:28px;font-weight:800;">${value}</div><div style="margin-top:4px;color:${delta.startsWith("↓") ? "#16a34a" : delta.startsWith("↑") ? "#2563eb" : "#64748b"};font-weight:700;">${delta}</div></div>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
  const failures: { email: string; status: number | string }[] = [];

  for (const recipient of recipients) {
    try {
      const digest = await buildWeeklyDigestModel(recipient, since);
      const response = await fetch("https://app.loops.so/api/v1/transactional", {
        body: JSON.stringify({
          addToAudience: true,
          dataVariables: buildWeeklyDigestDataVariables(
            digest,
            formatUpdateList(recipient.updates),
          ),
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
        failures.push({ email: recipient.email, status: response.status });
        continue;
      }

      emailsSent += 1;
    } catch (error) {
      failures.push({
        email: recipient.email,
        status: error instanceof Error ? error.message : "unknown error",
      });
    }
  }

  return {
    emailsSent,
    failed: failures.length,
    failures,
    skipped: null,
  };
}
