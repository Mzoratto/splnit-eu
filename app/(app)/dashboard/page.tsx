import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Clock3,
  FileArchive,
  FileUp,
  Info,
  Landmark,
  LockKeyhole,
  Plug,
  ShieldCheck,
} from "lucide-react";
import { AnimatedScoreRing } from "@/components/app/animated-score-ring";
import { DataModeNotice } from "@/components/app/data-mode-notice";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { ComplianceReportButton } from "@/components/export/compliance-report-button";
import { markRegulationUpdateReadAction } from "@/app/(app)/dashboard/actions";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { getControlDisplayTitle } from "@/lib/controls/localization";
import { CONTROL_LIBRARY } from "@/lib/controls/library";
import { calculateComplianceScore } from "@/lib/dashboard/score";
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

function controlStatusLabel(status: string, copy: DashboardCopy) {
  const labels: Record<string, string> = {
    fail: copy.statusLabels.fail,
    manual_review: copy.statusLabels.manualReview,
    not_applicable: "N/A",
    out_of_scope: copy.statusLabels.outOfScope,
    pass: copy.statusLabels.pass,
    unknown: copy.statusLabels.toAssess,
    warning: copy.statusLabels.manualReview,
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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const resolvedSearchParams = searchParams ? await searchParams : {};
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
  const reportCopy = messages.complianceReport;
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
            intakeRationale: null,
            isIntakePriority: index < 2,
            key: control.key,
            scopeStatus: "applicable" as const,
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
  const intakeScopeSummary = data?.intakeScopeSummary ?? null;
  const hasIntakeScope = Boolean(
    intakeScopeSummary &&
      (intakeScopeSummary.applicableControlKeys.length > 0 ||
        intakeScopeSummary.outOfScopeControlKeys.length > 0),
  );
  const score = calculateComplianceScore({
    frameworkScores,
    statusRows,
  });
  const isPreIntake = !hasIntakeScope;
  const assessedRows = statusRows.filter((row) =>
    ["fail", "manual_review", "pass", "warning"].includes(row.status),
  );
  const shouldShowScore = !isPreIntake && (frameworkScores.some((item) => typeof item.score === "number") || assessedRows.length > 0);
  const failingControls = isPreIntake ? 0 : statusRows.filter((row) => row.status === "fail").length;
  const warningControls = isPreIntake
    ? 0
    : statusRows.filter((row) =>
        ["manual_review", "warning", "unknown"].includes(row.status),
      ).length;
  const openFindings = failingControls + warningControls;
  const setupCta = isPreIntake
    ? { href: "/onboarding", label: copy.onboarding.primaryCta }
    : hasIntakeScope
      ? { href: "/controls?scope=priority", label: copy.onboarding.reviewGapsCta }
      : { href: "/onboarding", label: copy.onboarding.continueSetupCta };
  const onboardingStepIcons = [CheckCircle2, Landmark, Plug, FileUp];
  const activeOnboardingStep = 0;
  const activeOnboardingDetail = copy.onboarding.stepDetails[activeOnboardingStep];
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
  const exportProfileMode = Array.isArray(resolvedSearchParams.exportProfile)
    ? resolvedSearchParams.exportProfile[0]
    : resolvedSearchParams.exportProfile;
  const demoReportExportIdentity = useDemoData
    ? {
        clerkOrgId: "org_demo_export",
        dic: exportProfileMode === "incomplete" ? null : "CZ12345678",
        ico: "12345678",
        sidlo: "Václavské náměstí 1, Praha",
      }
    : null;
  const reportExportIdentity = data?.organisationExportIdentity ?? demoReportExportIdentity;
  const reportMissingFields = reportExportIdentity
    ? [
        !reportExportIdentity.ico && reportCopy.fields.ico,
        !reportExportIdentity.dic && reportCopy.fields.dic,
        !reportExportIdentity.sidlo && reportCopy.fields.sidlo,
      ].filter((field): field is string => Boolean(field))
    : [];
  const deadlines = FRAMEWORK_LIBRARY.filter(
    (framework) => framework.slug === "nis2" || framework.slug === "ai-act" || framework.slug === "gdpr",
  );

  return (
    <section className="page-enter-active space-y-8">
      {isPreIntake ? (
        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-medium text-primary">Dashboard</p>
              <h1 className="mt-2 text-[22px] font-medium tracking-normal">
                {copy.greeting}{firstName ? `, ${firstName}` : ""}
              </h1>
              <p className="mt-1 text-sm text-foreground/64">
                {copy.onboarding.progressLabel}
              </p>
            </div>
            <Link href={setupCta.href} className="btn btn-primary">
              {setupCta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-4">
            {copy.onboarding.steps.map((step, index) => {
              const StepIcon = onboardingStepIcons[index] ?? CircleDot;
              const isActive = index === activeOnboardingStep;
              const isLocked = index > activeOnboardingStep;

              return (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={`flex flex-1 items-center gap-3 rounded-md border px-3 py-2.5 ${
                      isActive
                        ? "border-primary/35 bg-primary/8 text-primary"
                        : isLocked
                          ? "border-border bg-background text-foreground/46"
                          : "border-status-pass/25 bg-status-pass/8 text-status-pass"
                    }`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isLocked
                            ? "bg-border text-foreground/46"
                            : "bg-status-pass text-white"
                      }`}
                    >
                      {isLocked ? (
                        <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.7} />
                      ) : (
                        <StepIcon className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.7} />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] text-foreground/46">
                        {copy.onboarding.stepLabel} {index + 1}
                      </span>
                      <span className="block truncate text-sm font-medium">{step}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-foreground/45">
                        {copy.onboarding.stepHints[index]}
                      </span>
                    </span>
                  </div>
                  {index < copy.onboarding.steps.length - 1 ? (
                    <span className="hidden h-px w-5 bg-border lg:block" aria-hidden="true" />
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
            <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" strokeWidth={1.7} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-medium">{activeOnboardingDetail.title}</h2>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-foreground/64">
                    {activeOnboardingDetail.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground/58">
                      {activeOnboardingDetail.time}
                    </span>
                    <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground/58">
                      {activeOnboardingDetail.unlocks}
                    </span>
                  </div>
                  {useDemoData || dataNotice ? (
                    <p className="mt-3 inline-flex max-w-3xl items-start gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs leading-5 text-foreground/58">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" strokeWidth={1.7} />
                      {copy.onboarding.demoNote}
                    </p>
                  ) : null}
                </div>
                <Link href={setupCta.href} className="btn btn-primary md:mt-1">
                  {activeOnboardingDetail.button}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                </Link>
              </div>
            </div>

            <aside className="rounded-md border border-border bg-background p-4" aria-labelledby="evidence-helper-title">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-surface text-primary">
                  <Info className="h-4 w-4" aria-hidden="true" strokeWidth={1.7} />
                </div>
                <div>
                  <h2 id="evidence-helper-title" className="text-sm font-medium">
                    {copy.onboarding.evidenceHelper.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-foreground/62">
                    {copy.onboarding.evidenceHelper.body}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-foreground/52">
                    {copy.onboarding.evidenceHelper.missing}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      ) : (
        <>
          <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium text-primary">Dashboard</p>
              <h1 className="mt-2 text-[22px] font-medium tracking-normal">
                {copy.greeting}{firstName ? `, ${firstName}` : ""}
              </h1>
              <p className="mt-1 text-sm text-foreground/64">
                {`${openFindings} ${copy.summary.openFindings} · ${failingControls} ${copy.summary.failedControls}`}
              </p>
            </div>
            <Link href={setupCta.href} className="btn btn-primary">
              {setupCta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </Link>
          </div>

          {dataNotice ? (
            <DataModeNotice body={dataNotice.body} title={dataNotice.title} />
          ) : null}
        </>
      )}

      {reportExportIdentity ? (
        <section className="card">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border bg-background text-primary">
                <FileArchive className="h-5 w-5" aria-hidden="true" strokeWidth={1.6} />
              </div>
              <div>
                <h2 className="text-lg font-medium">{reportCopy.title}</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-foreground/58">
                  {reportCopy.dashboardBody}
                </p>
              </div>
            </div>
            <ComplianceReportButton
              missingFields={reportMissingFields}
              orgId={reportExportIdentity.clerkOrgId}
              settingsHref={
                process.env.NEXT_PUBLIC_ENABLE_TEST_ROUTES === "true" &&
                exportProfileMode === "incomplete"
                  ? "/settings/profile?testProfile=editable-incomplete"
                  : "/settings/profile"
              }
            />
          </div>
        </section>
      ) : null}

      {hasIntakeScope && intakeScopeSummary ? (
        <section className="card">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h2 className="text-lg font-medium">{copy.intakeScope.title}</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-foreground/58">
                {copy.intakeScope.subtitle}
              </p>
            </div>
            <Link href="/controls?scope=priority" className="btn btn-secondary">
              {copy.intakeScope.viewControls}
              <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-foreground/52">{copy.intakeScope.applicable}</p>
              <p className="mt-2 font-mono text-2xl font-medium">
                {intakeScopeSummary.applicableControlKeys.length}
              </p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-foreground/52">{copy.intakeScope.priority}</p>
              <p className="mt-2 font-mono text-2xl font-medium text-status-fail">
                {intakeScopeSummary.priorityControlKeys.length}
              </p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-foreground/52">{copy.intakeScope.manualReview}</p>
              <p className="mt-2 font-mono text-2xl font-medium text-status-warn">
                {intakeScopeSummary.manualReviewControlKeys.length}
              </p>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs text-foreground/52">{copy.intakeScope.outOfScope}</p>
              <p className="mt-2 font-mono text-2xl font-medium">
                {intakeScopeSummary.outOfScopeControlKeys.length + intakeScopeSummary.notApplicableControlKeys.length}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.35fr_repeat(3,minmax(0,1fr))]">
        <article className={`metric-card ${shouldShowScore ? "flex items-center gap-5" : "flex flex-col items-start gap-3"}`}>
          {shouldShowScore ? (
            <AnimatedScoreRing label={copy.scoreLabel} locale={locale} score={score} />
          ) : (
            <StatusPill tone="neutral">{copy.metrics.pendingScore}</StatusPill>
          )}
          <div>
            <p className="text-xs text-foreground/52">{copy.metrics.scoreTitle}</p>
            <p className="mt-2 text-sm leading-6 text-foreground/64">
              {shouldShowScore ? copy.metrics.scoreBody : copy.metrics.scorePendingBody}
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
            {isPreIntake ? "—" : frameworkScores.length}
          </p>
          <StatusPill tone={isPreIntake ? "neutral" : "pass"} className="mt-4">
            {isPreIntake ? copy.statusLabels.toAssess : copy.statusLabels.pass}
          </StatusPill>
        </article>

        <article className="metric-card">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-foreground/52">
              {isPreIntake ? copy.metrics.toAssessControls : copy.metrics.failedControls}
            </p>
            <AlertTriangle className={`h-4 w-4 ${isPreIntake ? "text-foreground/38" : "text-status-fail"}`} aria-hidden="true" strokeWidth={1.5} />
          </div>
          <p className="mt-5 font-mono text-[28px] font-medium">
            {isPreIntake ? "—" : failingControls}
          </p>
          <StatusPill tone={isPreIntake ? "neutral" : failingControls > 0 ? "fail" : "pass"} className="mt-4">
            {isPreIntake
              ? copy.statusLabels.toAssess
              : failingControls > 0
                ? copy.statusLabels.fail
                : copy.statusLabels.pass}
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

      <div className="grid gap-4">
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
              const tone = isPreIntake ? "neutral" : statusTone(item.status, item.score);

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
                  <StatusPill tone={tone}>
                    {isPreIntake ? copy.statusLabels.toAssess : frameworkStatusLabel(item.score)}
                  </StatusPill>
                  <span className="font-mono text-sm font-medium">
                    {isPreIntake ? "—" : `${rowScore}%`}
                  </span>
                  <span
                    className={
                      tone === "pass"
                        ? "text-status-pass"
                        : tone === "warn"
                          ? "text-status-warn"
                          : tone === "fail"
                            ? "text-status-fail"
                            : "text-foreground/30"
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
          <details className="nukib-card group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-sm border border-[var(--nukib-border)] bg-white/10 px-2 py-1 text-[11px] font-medium">
                    {copy.nukib.badge}
                  </span>
                  <span className="rounded-sm bg-[var(--nukib-accent)]/18 px-2 py-1 text-[11px] font-medium text-[var(--nukib-text)]">
                    {copy.nukib.exclusive}
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-medium">{copy.nukib.title}</h2>
              </div>
              <span className="flex shrink-0 items-center gap-2 text-sm font-medium text-[var(--nukib-accent)]">
                {copy.nukib.showFeed}
                <ArrowRight className="h-4 w-4 transition-transform group-open:rotate-90" aria-hidden="true" strokeWidth={1.5} />
              </span>
            </summary>
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
          </details>

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
                      isPreIntake
                        ? "mt-0.5 h-4 w-4 text-foreground/38"
                        : statusTone(control.status) === "fail"
                          ? "mt-0.5 h-4 w-4 text-status-fail"
                          : "mt-0.5 h-4 w-4 text-status-warn"
                    }
                    aria-hidden="true"
                    strokeWidth={1.5}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium">{control.title}</p>
                      {control.isIntakePriority && !isPreIntake ? (
                        <span className="rounded-sm bg-status-fail/10 px-2 py-0.5 text-[11px] font-medium text-status-fail">
                          {copy.intakeScope.priority}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 font-mono text-xs text-foreground/52">
                      {control.key} · {isPreIntake ? copy.statusLabels.toAssess : controlStatusLabel(control.status, copy)}
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
      <div className="lg:hidden">
        <Link
          href={setupCta.href}
          className="btn btn-primary fixed inset-x-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 min-h-12"
        >
          {setupCta.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  );
}
