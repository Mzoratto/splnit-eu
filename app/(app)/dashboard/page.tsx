import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CircleDot,
  Clock3,
  FileArchive,
  Landmark,
  Newspaper,
  ShieldCheck,
} from "lucide-react";
import { AnimatedScoreRing } from "@/components/app/animated-score-ring";
import { DataModeNotice } from "@/components/app/data-mode-notice";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { markRegulationUpdateReadAction } from "@/app/(app)/dashboard/actions";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { getControlDisplayTitle } from "@/lib/controls/localization";
import { CONTROL_LIBRARY } from "@/lib/controls/library";
import { hasDatabaseUrl } from "@/lib/db";
import { getDashboardData } from "@/lib/db/queries/dashboard";
import { isLocalDemoDataEnabled } from "@/lib/demo-mode";
import {
  getFrameworkDisplayDescription,
  getFrameworkDisplayName,
  getFrameworkDisplayRegulator,
} from "@/lib/frameworks/localization";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import { getJurisdictionContext } from "@/lib/jurisdictions/context";

type DashboardCopy = ReturnType<typeof getMessagesForLocale>["dashboard"];

const fallbackFrameworkScores = [
  { slug: "nis2", score: 72, status: "active" },
  { slug: "ai-act", score: 64, status: "setup" },
  { slug: "gdpr", score: 81, status: "active" },
  { slug: "iso27001", score: 58, status: "manual_review" },
];

function getFallbackUpdates(copy: DashboardCopy) {
  return [
    {
      frameworkName: "NIS2",
      id: "demo-nukib-feed",
      isRead: true,
      publishedAt: new Date("2026-04-30T08:00:00.000Z"),
      severity: "info",
      source: copy.demoUpdates.demoSource,
      sourceUrl: null,
      summary: copy.demoUpdates.nukibMethodology.summary,
      title: copy.demoUpdates.nukibMethodology.title,
    },
    {
      frameworkName: "NIS2",
      id: "demo-nukib-cve",
      isRead: true,
      publishedAt: new Date("2026-04-30T06:30:00.000Z"),
      severity: "warning",
      source: copy.demoUpdates.demoSource,
      sourceUrl: null,
      summary: copy.demoUpdates.nukibCve.summary,
      title: copy.demoUpdates.nukibCve.title,
    },
    {
      frameworkName: "GDPR",
      id: "demo-uooou-update",
      isRead: true,
      publishedAt: new Date("2026-04-26T10:00:00.000Z"),
      severity: "info",
      source: copy.demoUpdates.demoSource,
      sourceUrl: null,
      summary: copy.demoUpdates.uoouGuidance.summary,
      title: copy.demoUpdates.uoouGuidance.title,
    },
  ];
}

async function loadDashboardData() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);
  const session = clerkConfigured ? await auth() : null;

  if (!session?.orgId || !hasDatabaseUrl()) {
    return null;
  }

  try {
    return await getDashboardData(session.orgId);
  } catch {
    return null;
  }
}

async function loadUserName() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured) {
    return null;
  }

  try {
    const user = await currentUser();
    return user?.firstName ?? null;
  } catch {
    return null;
  }
}

function calculateScore(input: {
  frameworkScores: { score: number | null }[];
  statusRows: { status: string }[];
}) {
  const explicitScores = input.frameworkScores
    .map((item) => item.score)
    .filter((score): score is number => typeof score === "number");

  if (explicitScores.length > 0) {
    return Math.round(
      explicitScores.reduce((total, score) => total + score, 0) /
        explicitScores.length,
    );
  }

  if (input.statusRows.length === 0) {
    return 0;
  }

  const passing = input.statusRows.filter((row) => row.status === "pass").length;
  return Math.round((passing / input.statusRows.length) * 100);
}

function statusTone(status: string | null | undefined, score?: number | null): StatusPillTone {
  if (status === "pass" || status === "completed" || status === "connected") {
    return "pass";
  }

  if (status === "fail" || status === "error" || status === "critical") {
    return "fail";
  }

  if (
    status === "manual_review" ||
    status === "warning" ||
    status === "setup" ||
    status === "in_progress" ||
    status === "connecting"
  ) {
    return "warn";
  }

  if (typeof score === "number") {
    if (score >= 80) {
      return "pass";
    }
    if (score >= 60) {
      return "warn";
    }
    return "fail";
  }

  return "neutral";
}

function frameworkStatusLabel(score: number | null | undefined) {
  if (typeof score !== "number") {
    return "PENDING";
  }

  if (score >= 80) {
    return "PASS";
  }

  if (score >= 60) {
    return "WARN";
  }

  return "FAIL";
}

function controlStatusLabel(status: string) {
  const labels: Record<string, string> = {
    fail: "FAIL",
    manual_review: "WARN",
    pass: "PASS",
    unknown: "PENDING",
    warning: "WARN",
  };

  return labels[status] ?? status.toUpperCase();
}

function severityTone(severity: string): StatusPillTone {
  if (severity === "critical" || severity === "high" || severity === "fail") {
    return "fail";
  }

  if (severity === "warning" || severity === "medium") {
    return "warn";
  }

  if (severity === "info" || severity === "low") {
    return "pass";
  }

  return "neutral";
}

function formatRelative(
  value: Date | string,
  locale: Locale,
) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60_000));
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (minutes < 60) {
    return formatter.format(-minutes, "minute");
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return formatter.format(-hours, "hour");
  }

  const days = Math.round(hours / 24);
  return formatter.format(-days, "day");
}

function formatDeadline(deadline: string | null, copy: DashboardCopy) {
  if (!deadline) {
    return copy.deadline.continuous;
  }

  const deadlineDate = new Date(`${deadline}T00:00:00.000Z`);
  const days = Math.ceil(
    (deadlineDate.getTime() - Date.now()) / 86_400_000,
  );

  if (days < 0) {
    return copy.deadline.past;
  }

  if (days === 0) {
    return copy.deadline.today;
  }

  return copy.deadline.days.replace("{days}", String(days));
}

function Sparkline({ score }: { score: number }) {
  const values = Array.from({ length: 14 }, (_, index) =>
    Math.max(12, Math.min(96, score - 8 + (index % 5) * 3 + Math.floor(index / 3))),
  );
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 60;
      const y = 16 - (value / 100) * 16;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg aria-hidden="true" className="h-4 w-[60px]" viewBox="0 0 60 16">
      <polyline
        fill="none"
        points={points}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function FrameworkIcon({ tone }: { tone: StatusPillTone }) {
  const className =
    tone === "pass"
      ? "text-status-pass"
      : tone === "warn"
        ? "text-status-warn"
        : tone === "fail"
          ? "text-status-fail"
          : "text-foreground/42";

  return (
    <div className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background">
      <Landmark className={`h-4 w-4 ${className}`} aria-hidden="true" strokeWidth={1.5} />
    </div>
  );
}

export default async function DashboardPage() {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const [data, firstName] = await Promise.all([
    loadDashboardData(),
    loadUserName(),
  ]);
  const locale = normalizeLocale(data?.organisationLocale) ?? requestLocale;
  const jurisdiction = getJurisdictionContext(
    data?.organisationJurisdiction,
    locale,
  );
  const messages = getMessagesForLocale(locale);
  const copy = messages.dashboard;
  const frameworkCopy = messages.frameworks;
  const fallbackUpdates = getFallbackUpdates(copy);
  const useDemoData = !data && isLocalDemoDataEnabled();
  const dataNotice = useDemoData
    ? {
        body: messages.appDataNotice.demoBody,
        title: messages.appDataNotice.demoTitle,
      }
    : !data
      ? {
          body: messages.appDataNotice.unavailableBody,
          title: messages.appDataNotice.unavailableTitle,
        }
      : null;
  const rawFrameworkScores =
    data?.frameworkScores.length
      ? data.frameworkScores
      : useDemoData
        ? fallbackFrameworkScores.map((item) => {
            return {
              name: item.slug,
              regulator: null,
              score: item.score,
              slug: item.slug,
              status: item.status,
            };
          })
        : [];
  const frameworkScores = rawFrameworkScores.map((item) => {
    const framework = FRAMEWORK_LIBRARY.find((fw) => fw.slug === item.slug);

    return {
      ...item,
      name: framework ? getFrameworkDisplayName(framework, locale) : item.name,
      regulator: framework
        ? getFrameworkDisplayRegulator(framework, locale, frameworkCopy.regulators)
        : item.regulator,
    };
  });
  const priorityControls =
    data?.priorityControls.length
      ? data.priorityControls
      : useDemoData
        ? CONTROL_LIBRARY.slice(0, 5).map((control, index) => ({
            category: control.category,
            key: control.key,
            status: index < 2 ? "fail" : "manual_review",
            title: getControlDisplayTitle(control, locale),
            titleCs: control.titleCs,
            titleEn: control.titleEn,
          }))
        : [];
  const priorityControlRows = priorityControls.map((control) => ({
    ...control,
    title: getControlDisplayTitle(control, locale),
  }));
  const updates = data?.updates.length
    ? data.updates
    : useDemoData
      ? fallbackUpdates
      : [];
  const statusRows =
    data?.statusRows.length
      ? data.statusRows
      : priorityControls.map((control) => ({ status: control.status }));
  const score = calculateScore({
    frameworkScores,
    statusRows,
  });
  const failingControls = statusRows.filter((row) => row.status === "fail").length;
  const warningControls = statusRows.filter((row) =>
    ["manual_review", "warning", "unknown"].includes(row.status),
  ).length;
  const openFindings = failingControls + warningControls;
  const regulatoryFeedSources = new Set([
    jurisdiction.authorities.cybersecurity,
    jurisdiction.authorities.dataProtection,
    copy.demoUpdates.demoSource,
  ]);
  const regulatoryUpdates = updates.filter((update) =>
    regulatoryFeedSources.has(update.source),
  );
  const visibleRegulatoryUpdates = regulatoryUpdates.length
    ? regulatoryUpdates
    : useDemoData
      ? fallbackUpdates
      : [];
  const deadlines = FRAMEWORK_LIBRARY.filter(
    (framework) => framework.slug === "nis2" || framework.slug === "ai-act" || framework.slug === "gdpr",
  );

  return (
    <section className="page-enter-active space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Dashboard</p>
          <h1 className="mt-2 text-[22px] font-medium tracking-normal">
            {copy.greeting}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-foreground/64">
            {openFindings} {copy.summary.openFindings} · {failingControls}{" "}
            {copy.summary.failedControls}
          </p>
        </div>
        <Link href="/frameworks/ai-act/setup" className="btn btn-primary">
          {copy.aiActWizardCta}
          <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
        </Link>
      </div>

      {dataNotice ? (
        <DataModeNotice body={dataNotice.body} title={dataNotice.title} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="metric-card flex items-center gap-5">
          <AnimatedScoreRing label={copy.scoreLabel} locale={locale} score={score} />
          <div>
            <p className="text-xs text-foreground/52">{copy.metrics.scoreTitle}</p>
            <p className="mt-2 text-sm leading-6 text-foreground/64">
              {copy.metrics.scoreBody}
            </p>
          </div>
        </article>

        <article className="metric-card">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-foreground/52">
              {copy.metrics.activeFrameworks}
            </p>
            <ShieldCheck className="h-4 w-4 text-status-pass" aria-hidden="true" strokeWidth={1.5} />
          </div>
          <p className="mt-5 font-mono text-[28px] font-medium">
            {frameworkScores.length}
          </p>
          <StatusPill tone="pass" className="mt-4">PASS</StatusPill>
        </article>

        <article className="metric-card">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-foreground/52">
              {copy.metrics.failedControls}
            </p>
            <AlertTriangle className="h-4 w-4 text-status-fail" aria-hidden="true" strokeWidth={1.5} />
          </div>
          <p className="mt-5 font-mono text-[28px] font-medium">
            {failingControls}
          </p>
          <StatusPill tone={failingControls > 0 ? "fail" : "pass"} className="mt-4">
            {failingControls > 0 ? "FAIL" : "PASS"}
          </StatusPill>
        </article>

        <article className="metric-card">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-foreground/52">{copy.metrics.lastChange}</p>
            <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" strokeWidth={1.5} />
          </div>
          <p className="mt-5 font-mono text-[28px] font-medium">
            {updates[0] ? formatRelative(updates[0].publishedAt, locale) : "—"}
          </p>
          <p className="mt-4 text-xs text-foreground/52">
            {updates[0]
              ? `${updates[0].source} · ${updates[0].frameworkName ?? copy.general}`
              : copy.general}
          </p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <section className="card">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium">{copy.frameworks.title}</h2>
              <p className="mt-1 text-sm text-foreground/58">
                {copy.frameworks.subtitle}
              </p>
            </div>
            <Link
              href="/frameworks"
              className="text-sm font-medium text-primary hover:text-[var(--accent-hover)]"
            >
              {copy.frameworks.viewAll}
            </Link>
          </div>
          <div className="stagger -mx-3 grid gap-1">
            {frameworkScores.map((item) => {
              const framework = FRAMEWORK_LIBRARY.find((fw) => fw.slug === item.slug);
              const rowScore = item.score ?? 0;
              const tone = statusTone(item.status, item.score);

              return (
                <Link
                  key={item.slug}
                  href={`/frameworks/${item.slug}`}
                  className="interactive-card grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 rounded-md px-3 py-3 text-sm"
                >
                  <FrameworkIcon tone={tone} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {framework
                        ? getFrameworkDisplayName(framework, locale)
                        : item.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-foreground/52">
                      {framework
                        ? getFrameworkDisplayDescription(
                            framework,
                            locale,
                            copy.frameworkDescriptions,
                          )
                        : item.regulator ?? "Framework"}
                    </p>
                  </div>
                  <StatusPill tone={tone}>{frameworkStatusLabel(item.score)}</StatusPill>
                  <span className="font-mono text-sm font-medium">
                    {rowScore}%
                  </span>
                  <span
                    className={
                      tone === "pass"
                        ? "text-status-pass"
                        : tone === "warn"
                          ? "text-status-warn"
                          : "text-status-fail"
                    }
                  >
                    <Sparkline score={rowScore} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="grid gap-4">
          <section className="nukib-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-sm border border-[var(--nukib-border)] bg-white/10 px-2 py-1 text-[11px] font-medium">
                    {copy.nukib.badge}
                  </span>
                  <span className="rounded-sm bg-[var(--nukib-accent)]/18 px-2 py-1 text-[11px] font-medium text-[var(--nukib-text)]">
                    {copy.nukib.exclusive}
                  </span>
                </div>
                <h2 className="mt-3 text-lg font-medium">{copy.nukib.title}</h2>
              </div>
              <Newspaper className="h-5 w-5 text-[var(--nukib-accent)]" aria-hidden="true" strokeWidth={1.5} />
            </div>
            <div className="mt-4 grid gap-3">
              {visibleRegulatoryUpdates.slice(0, 3).map((update) => (
                <article
                  key={update.id}
                  className="rounded-md border border-white/10 bg-white/[0.04] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-[var(--nukib-accent)]">
                        {update.frameworkName ?? copy.general}
                      </p>
                      <h3 className="mt-1 text-sm font-medium text-[var(--nukib-text)]">
                        {update.title}
                      </h3>
                    </div>
                    <StatusPill tone={severityTone(update.severity)}>
                      {update.severity.toUpperCase()}
                    </StatusPill>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-emerald-50/72">
                    {update.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-emerald-50/70">
                    <span>{formatRelative(update.publishedAt, locale)}</span>
                    {update.sourceUrl ? (
                      <a href={update.sourceUrl} target="_blank" rel="noreferrer" className="font-medium text-[var(--nukib-accent)]">
                        {copy.nukib.openSource}
                      </a>
                    ) : null}
                    {!update.isRead && !update.id.startsWith("demo-") ? (
                      <form action={markRegulationUpdateReadAction.bind(null, update.id)}>
                        <button type="submit" className="font-medium text-[var(--nukib-accent)]">
                          {copy.nukib.markRead}
                        </button>
                      </form>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="card">
            <h2 className="text-lg font-medium">{copy.activity.title}</h2>
            <div className="mt-4 grid gap-3">
              {priorityControlRows.slice(0, 3).map((control) => (
                <Link
                  key={control.key}
                  href={`/controls/${control.key}`}
                  className="interactive-card flex items-start gap-3 rounded-md p-2"
                >
                  <CircleDot
                    className={
                      statusTone(control.status) === "fail"
                        ? "mt-0.5 h-4 w-4 text-status-fail"
                        : "mt-0.5 h-4 w-4 text-status-warn"
                    }
                    aria-hidden="true"
                    strokeWidth={1.5}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{control.title}</p>
                    <p className="mt-1 font-mono text-xs text-foreground/52">
                      {control.key} · {controlStatusLabel(control.status)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="card">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium">{copy.deadlines.title}</h2>
            <p className="mt-1 text-sm text-foreground/58">
              {copy.deadlines.subtitle}
            </p>
          </div>
          <CalendarClock className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
        </div>
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {deadlines.map((framework) => (
            <article
              key={framework.slug}
              className="min-w-[260px] rounded-lg border border-border bg-background p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {getFrameworkDisplayName(framework, locale)}
                  </p>
                  <p className="mt-1 text-xs text-foreground/52">
                    {getFrameworkDisplayRegulator(
                      framework,
                      locale,
                      frameworkCopy.regulators,
                    )}
                  </p>
                </div>
                <FileArchive className="h-4 w-4 text-primary" aria-hidden="true" strokeWidth={1.5} />
              </div>
              <p className="mt-4 text-sm text-foreground/72">
                {getFrameworkDisplayDescription(
                  framework,
                  locale,
                  copy.frameworkDescriptions,
                )}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-foreground/52">
                  {framework.mandatoryDeadline ?? copy.deadline.continuous}
                </span>
                <StatusPill
                  tone={
                    framework.mandatoryDeadline &&
                    formatDeadline(framework.mandatoryDeadline, copy) ===
                      copy.deadline.past
                      ? "fail"
                      : "warn"
                  }
                >
                  {formatDeadline(framework.mandatoryDeadline, copy)}
                </StatusPill>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
