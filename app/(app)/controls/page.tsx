import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { ArrowRight, BookCheck, CircleHelp } from "lucide-react";
import { ActivationStatus, deriveActivationStatusState } from "@/components/activation/activation-status";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import {
  getControlDisplayDescription,
  getControlDisplayTitle,
} from "@/lib/controls/localization";
import { CONTROL_LIBRARY } from "@/lib/controls/library";
import { hasDatabaseUrl } from "@/lib/db";
import { listOrgControlsForIndex, getOrgWorkspaceRecommendations } from "@/lib/db/queries/controls";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { getWorkspaceProgress } from "@/lib/db/queries/workspaces";
import { pohodaWorkspace } from "@/lib/workspaces/pohoda";
import { heliosWorkspace } from "@/lib/workspaces/helios";
import { moneyS3Workspace } from "@/lib/workspaces/money-s3";

type ControlsCopy = ReturnType<typeof getMessagesForLocale>["controlsPage"];
type OrgControl = Awaited<ReturnType<typeof listOrgControlsForIndex>>[number];
type DataMode = "live" | "demo" | "unavailable";
type ScopeFilter = "in-scope" | "priority" | "gaps" | "out-of-scope";
type ViewMode = "focus" | "all";


function buildDemoControls(): OrgControl[] {
  const statusCycle: Array<OrgControl["status"]> = ["fail", "manual_review", "warning", "pass", null];
  const evidenceCycle: Array<{
    assessmentResult: OrgControl["latestEvidenceAssessmentResult"];
    blockedReason: OrgControl["latestEvidenceBlockedReason"];
    collectionStatus: OrgControl["latestEvidenceCollectionStatus"];
    confidence: OrgControl["latestEvidenceConfidence"];
    lastKnownAssessmentResult: OrgControl["lastKnownAssessmentResult"];
    source: OrgControl["latestEvidenceSource"];
  }> = [
    {
      assessmentResult: "gap",
      blockedReason: null,
      collectionStatus: "collected",
      confidence: "high",
      lastKnownAssessmentResult: null,
      source: "connector",
    },
    {
      assessmentResult: "unknown",
      blockedReason: "missing_permission",
      collectionStatus: "blocked",
      confidence: "low",
      lastKnownAssessmentResult: "pass",
      source: "connector",
    },
    {
      assessmentResult: "unknown",
      blockedReason: null,
      collectionStatus: "pending",
      confidence: "medium",
      lastKnownAssessmentResult: null,
      source: "connector",
    },
    {
      assessmentResult: "manual_review",
      blockedReason: null,
      collectionStatus: "collected",
      confidence: "medium",
      lastKnownAssessmentResult: null,
      source: "manual",
    },
  ];
  const frameworkNameBySlug = new Map([
    ["nis2", { nameCs: "NIS2", nameEn: "NIS2" }],
    ["gdpr", { nameCs: "GDPR", nameEn: "GDPR" }],
    ["iso27001", { nameCs: "ISO 27001", nameEn: "ISO 27001" }],
    ["ai-act", { nameCs: "EU AI Act", nameEn: "EU AI Act" }],
    ["csrd", { nameCs: "CSRD", nameEn: "CSRD" }],
  ]);

  return CONTROL_LIBRARY.slice(0, 28).map((control, index) => {
    const frameworks = control.frameworkMappings.map((mapping) => ({
      nameCs: frameworkNameBySlug.get(mapping.frameworkSlug)?.nameCs ?? mapping.frameworkSlug,
      nameEn: frameworkNameBySlug.get(mapping.frameworkSlug)?.nameEn ?? mapping.frameworkSlug,
      slug: mapping.frameworkSlug,
    }));
    const latestEvidence = evidenceCycle[index % evidenceCycle.length];

    return {
      category: control.category,
      descriptionCs: control.descriptionCs ?? null,
      frameworks,
      intakeRationale: null,
      isAutomated: control.isAutomated,
      isIntakePriority: index < 5,
      key: control.key,
      latestEvidenceAssessmentResult: latestEvidence.assessmentResult,
      latestEvidenceBlockedReason: latestEvidence.blockedReason,
      latestEvidenceCollectionStatus: latestEvidence.collectionStatus,
      latestEvidenceConfidence: latestEvidence.confidence,
      latestEvidenceCollectedAt: new Date(),
      latestEvidenceSource: latestEvidence.source,
      lastKnownAssessmentResult: latestEvidence.lastKnownAssessmentResult,
      scopeStatus: index > 23 ? "out_of_scope" : "applicable",
      status: statusCycle[index % statusCycle.length],
      titleCs: control.titleCs,
      titleEn: control.titleEn,
      updatedAt: null,
    };
  });
}

async function loadControlsIndexData() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return { controls: buildDemoControls(), mode: "demo" as DataMode, organisationLocale: null, pohodaRecommended: false, pohodaCompletionPct: null, heliosRecommended: false, heliosCompletionPct: null, moneyS3Recommended: false, moneyS3CompletionPct: null };
  }

  const session = await auth();

  if (!session.orgId) {
    return { controls: buildDemoControls(), mode: "demo" as DataMode, organisationLocale: null, pohodaRecommended: false, pohodaCompletionPct: null, heliosRecommended: false, heliosCompletionPct: null, moneyS3Recommended: false, moneyS3CompletionPct: null };
  }

  try {
    const [controls, organisation, workspaceRecommendations] = await Promise.all([
      listOrgControlsForIndex(session.orgId),
      getOrganisationByClerkOrgId(session.orgId),
      getOrgWorkspaceRecommendations(session.orgId),
    ]);

    const pohodaRecommended = workspaceRecommendations.some((r) => r.platformKey === "pohoda");
    const heliosRecommended = workspaceRecommendations.some((r) => r.platformKey === "helios");
    const moneyS3Recommended = workspaceRecommendations.some((r) => r.platformKey === "money_s3");

    let pohodaCompletionPct: number | null = null;
    if (pohodaRecommended) {
      try {
        const progress = await getWorkspaceProgress(session.orgId, pohodaWorkspace);
        if (progress.completedControls > 0) {
          pohodaCompletionPct = progress.overallCompletionPct;
        }
      } catch {
        // workspace progress unavailable — show card without percentage
      }
    }

    let heliosCompletionPct: number | null = null;
    if (heliosRecommended) {
      try {
        const progress = await getWorkspaceProgress(session.orgId, heliosWorkspace);
        if (progress.completedControls > 0) {
          heliosCompletionPct = progress.overallCompletionPct;
        }
      } catch {
        // workspace progress unavailable — show card without percentage
      }
    }

    let moneyS3CompletionPct: number | null = null;
    if (moneyS3Recommended) {
      try {
        const progress = await getWorkspaceProgress(session.orgId, moneyS3Workspace);
        if (progress.completedControls > 0) {
          moneyS3CompletionPct = progress.overallCompletionPct;
        }
      } catch {
        // workspace progress unavailable — show card without percentage
      }
    }

    return {
      controls,
      mode: "live" as const,
      organisationLocale: organisation?.locale ?? null,
      pohodaRecommended,
      pohodaCompletionPct,
      heliosRecommended,
      heliosCompletionPct,
      moneyS3Recommended,
      moneyS3CompletionPct,
    };
  } catch {
    return { controls: buildDemoControls(), mode: "demo" as DataMode, organisationLocale: null, pohodaRecommended: false, pohodaCompletionPct: null, heliosRecommended: false, heliosCompletionPct: null, moneyS3Recommended: false, moneyS3CompletionPct: null };
  }
}

function getCategoryLabel(category: string, copy: ControlsCopy) {
  return copy.categories[category as keyof typeof copy.categories] ?? category;
}

function getStatusTone(status: string | null): StatusPillTone {
  if (status === "pass" || status === "not_applicable") {
    return "pass";
  }

  if (status === "fail") {
    return "fail";
  }

  if (status === "manual_review" || status === "warning") {
    return "warn";
  }

  return "neutral";
}

function getStatusLabel(status: string | null, copy: ControlsCopy) {
  if (!status) {
    return copy.statuses.unknown;
  }

  return copy.statuses[status as keyof typeof copy.statuses] ?? status;
}

function getFrameworkNames(control: OrgControl, locale: Locale) {
  return control.frameworks
    .map((framework) => (locale === "cs-CZ" ? framework.nameCs : framework.nameEn))
    .join(", ");
}

function normalizeScopeFilter(value: string | string[] | undefined): ScopeFilter {
  const raw = Array.isArray(value) ? value[0] : value;

  if (raw === "priority" || raw === "gaps" || raw === "out-of-scope") {
    return raw;
  }

  return "in-scope";
}


function normalizeViewMode(value: string | string[] | undefined): ViewMode {
  const raw = Array.isArray(value) ? value[0] : value;

  return raw === "all" ? "all" : "focus";
}

function normalizeVisibleCount(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "", 10);

  if (!Number.isFinite(parsed)) {
    return 5;
  }

  return Math.min(Math.max(parsed, 5), 50);
}

function getLocalizedAppHref(path: string, requestLocale: Locale) {
  if (requestLocale === "it-IT") {
    return `/it${path}`;
  }

  if (requestLocale === "en-EU") {
    return `/en${path}`;
  }

  return path;
}

function getControlPriorityScore(control: OrgControl) {
  let score = 0;

  if (control.isIntakePriority) {
    score += 100;
  }

  if (control.status === "fail") {
    score += 40;
  } else if (control.status === "manual_review" || control.status === "warning") {
    score += 25;
  } else if (control.status === "unknown" || control.status === null) {
    score += 15;
  }

  if (control.scopeStatus === "applicable") {
    score += 10;
  }

  if (control.intakeRationale) {
    score += 5;
  }

  return score;
}

function getPriorityBorderClass(control: OrgControl) {
  if (control.isIntakePriority || control.status === "fail") {
    return "border-l-4 border-l-status-fail";
  }

  if (control.status === "manual_review" || control.status === "warning" || control.status === "unknown" || control.status === null) {
    return "border-l-4 border-l-status-warn";
  }

  return "border-l-4 border-l-border";
}

function getEffortEstimate(control: OrgControl, copy: ControlsCopy) {
  if (control.isAutomated) {
    return copy.index.effortWithIntegration;
  }

  if (control.category === "governance" || control.category === "supplier") {
    return "~30 min";
  }

  return "~15 min";
}

function filterControlsByScope(controls: OrgControl[], scopeFilter: ScopeFilter) {
  if (scopeFilter === "priority") {
    return controls.filter((control) => control.isIntakePriority);
  }

  if (scopeFilter === "gaps") {
    return controls.filter(
      (control) =>
        control.scopeStatus !== "out_of_scope" &&
        control.scopeStatus !== "not_applicable" &&
        ["fail", "manual_review", "unknown", null].includes(control.status),
    );
  }

  if (scopeFilter === "out-of-scope") {
    return controls.filter(
      (control) => control.scopeStatus === "out_of_scope" || control.scopeStatus === "not_applicable",
    );
  }

  return controls.filter(
    (control) => control.scopeStatus !== "out_of_scope" && control.scopeStatus !== "not_applicable",
  );
}

export default async function ControlsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const { controls, mode, organisationLocale, pohodaRecommended, pohodaCompletionPct, heliosRecommended, heliosCompletionPct, moneyS3Recommended, moneyS3CompletionPct } = await loadControlsIndexData();
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const messages = getMessagesForLocale(locale);
  const copy = messages.controlsPage;
  const scopeFilter = normalizeScopeFilter(resolvedSearchParams.scope);
  const viewMode = normalizeViewMode(resolvedSearchParams.view);
  const visibleCount = normalizeVisibleCount(resolvedSearchParams.limit);
  const filteredControls = filterControlsByScope(controls, scopeFilter);
  const rankedControls = [...filteredControls].sort((first, second) => {
    const scoreDelta = getControlPriorityScore(second) - getControlPriorityScore(first);

    return scoreDelta || first.key.localeCompare(second.key);
  });
  const focusControls = rankedControls.filter((control) => getControlPriorityScore(control) > 0);
  const controlsForView = viewMode === "focus" ? focusControls.slice(0, 5) : rankedControls.slice(0, visibleCount);
  const hasMoreControls = viewMode === "all" && rankedControls.length > visibleCount;
  const localizedControlsPath = getLocalizedAppHref("/controls", requestLocale);
  const scopeFilters: { href: string; label: string; value: ScopeFilter }[] = [
    { href: localizedControlsPath, label: copy.index.allScope, value: "in-scope" },
    { href: `${localizedControlsPath}?scope=priority`, label: copy.index.priorityScope, value: "priority" },
    { href: `${localizedControlsPath}?scope=gaps`, label: copy.index.gapScope, value: "gaps" },
    { href: `${localizedControlsPath}?scope=out-of-scope`, label: copy.index.outOfScope, value: "out-of-scope" },
  ];
  const demoMode = mode !== "live";

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={copy.index.eyebrow}
        title={copy.index.title}
        subtitle={copy.index.subtitle}
      />

      {demoMode ? (
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground/64">
          {copy.index.demoMode}
        </div>
      ) : null}

      {viewMode === "focus" && pohodaRecommended ? (
        <Link
          href={getLocalizedAppHref("/workspaces/pohoda", requestLocale)}
          className="flex items-start gap-4 rounded-lg border border-primary/24 bg-primary/4 p-4 transition-colors hover:bg-primary/8"
        >
          <BookCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium">Pohoda (Stormware) — compliance workspace</p>
            <p className="mt-0.5 text-xs text-foreground/60">
              Projděte kontrolní vrstvy pro Pohodu: infrastruktura, přístupy, zálohy a API.
              Dokládejte důkazy a sledujte postup shody.
            </p>
            {pohodaCompletionPct !== null ? (
              <p className="mt-1.5 text-xs font-medium text-primary">
                {Math.round(pohodaCompletionPct * 100)}% dokončeno
              </p>
            ) : null}
          </div>
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        </Link>
      ) : null}

      {viewMode === "focus" && heliosRecommended ? (
        <Link
          href={getLocalizedAppHref("/workspaces/helios", requestLocale)}
          className="flex items-start gap-4 rounded-lg border border-primary/24 bg-primary/4 p-4 transition-colors hover:bg-primary/8"
        >
          <BookCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium">Helios (Asseco) — compliance workspace</p>
            <p className="mt-0.5 text-xs text-foreground/60">
              Projděte kontrolní vrstvy pro Helios: infrastruktura, přístupy, zálohy a API.
              Dokládejte důkazy a sledujte postup shody.
            </p>
            {heliosCompletionPct !== null ? (
              <p className="mt-1.5 text-xs font-medium text-primary">
                {Math.round(heliosCompletionPct * 100)}% dokončeno
              </p>
            ) : null}
          </div>
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        </Link>
      ) : null}

      {viewMode === "focus" && moneyS3Recommended ? (
        <Link
          href={getLocalizedAppHref("/workspaces/money-s3", requestLocale)}
          className="flex items-start gap-4 rounded-lg border border-primary/24 bg-primary/4 p-4 transition-colors hover:bg-primary/8"
        >
          <BookCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium">Money S3 / S4 (Seyfor) — compliance workspace</p>
            <p className="mt-0.5 text-xs text-foreground/60">
              Projděte kontrolní vrstvy pro Money S3: infrastruktura, přístupy, zálohy a API.
              Dokládejte důkazy a sledujte postup shody.
            </p>
            {moneyS3CompletionPct !== null ? (
              <p className="mt-1.5 text-xs font-medium text-primary">
                {Math.round(moneyS3CompletionPct * 100)}% dokončeno
              </p>
            ) : null}
          </div>
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        </Link>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-medium">
              {viewMode === "focus" ? copy.index.focusStartTitle : copy.index.activeTitle}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-foreground/58">
              {viewMode === "focus"
                ? copy.index.focusStartSubtitle
                : copy.index.activeSubtitle}
            </p>
          </div>
          <div className="inline-flex w-fit rounded-md border border-border bg-background p-1 text-sm">
            <Link
              href={`${localizedControlsPath}?scope=${scopeFilter}`}
              className={
                viewMode === "focus"
                  ? "rounded-sm bg-primary px-3 py-2 font-medium text-primary-foreground"
                  : "rounded-sm px-3 py-2 font-medium text-foreground/64 hover:text-foreground"
              }
            >
              {copy.index.focusView}
            </Link>
            <Link
              href={`${localizedControlsPath}?view=all&scope=${scopeFilter}`}
              className={
                viewMode === "all"
                  ? "rounded-sm bg-primary px-3 py-2 font-medium text-primary-foreground"
                  : "rounded-sm px-3 py-2 font-medium text-foreground/64 hover:text-foreground"
              }
            >
              {copy.index.allView}
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs font-medium text-foreground/52">
            {copy.index.scopeFiltersTitle}
          </p>
          <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label={copy.index.scopeFiltersTitle}>
            {scopeFilters.map((filter) => (
              <Link
                key={filter.value}
                href={viewMode === "all" ? `${filter.href}${filter.href.includes("?") ? "&" : "?"}view=all` : filter.href}
                role="tab"
                aria-selected={filter.value === scopeFilter}
                className={
                  filter.value === scopeFilter
                    ? "rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                    : "rounded-sm border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/72 hover:text-foreground"
                }
              >
                {filter.label}
              </Link>
            ))}
          </div>
        </div>

        {controls.length ? (
          controlsForView.length ? (
            <div className="space-y-3">
              {controlsForView.map((control, index) => (
                <article key={control.key} className={`rounded-lg border border-border bg-surface p-4 ${getPriorityBorderClass(control)}`}>
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-foreground/52">#{index + 1} · {control.key}</span>
                        <span className="rounded-sm bg-surface-muted px-2 py-1 text-xs font-medium text-foreground/64">
                          {getCategoryLabel(control.category ?? "unknown", copy)}
                        </span>
                        <StatusPill tone={getStatusTone(control.status)}>
                          {getStatusLabel(control.status, copy)}
                        </StatusPill>
                      </div>
                      <h3 className="mt-2 text-lg font-medium">
                        {getControlDisplayTitle(control, locale)}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-foreground/64">
                        {getControlDisplayDescription(control, locale)}
                      </p>
                      {control.intakeRationale ? (
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground/58" title={control.intakeRationale}>
                          <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.8} />
                          {copy.index.rationaleLabel}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-3 lg:w-56">
                      <div className="rounded-md bg-surface-muted p-3 text-sm">
                        <p className="text-xs text-foreground/52">{copy.index.effortLabel}</p>
                        <p className="mt-1 font-medium">{getEffortEstimate(control, copy)}</p>
                      </div>
                      <div className="rounded-md bg-surface-muted p-3 text-sm">
                        <p className="text-xs text-foreground/52">{copy.index.frameworksLabel}</p>
                        <p className="mt-1 text-sm font-medium">{getFrameworkNames(control, locale)}</p>
                      </div>
                      <div className="rounded-md bg-surface-muted p-3 text-sm">
                        <p className="mb-2 text-xs text-foreground/52">{copy.index.statusLabel}</p>
                        <ActivationStatus
                          confidence={control.latestEvidenceConfidence}
                          showDetails={viewMode === "focus"}
                          state={deriveActivationStatusState({
                            assessmentResult: control.latestEvidenceAssessmentResult,
                            blockedReason: control.latestEvidenceBlockedReason ?? undefined,
                            collectionStatus: control.latestEvidenceCollectionStatus,
                            lastKnownAssessmentResult: control.lastKnownAssessmentResult,
                            reviewStatus: control.status,
                            source: control.latestEvidenceSource,
                          })}
                        />
                      </div>
                      <Link href={getLocalizedAppHref(`/controls/${control.key}`, requestLocale)} className="btn btn-secondary justify-center">
                        {copy.index.openControl}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
              {hasMoreControls ? (
                <div className="flex justify-center pt-2">
                  <Link href={`${localizedControlsPath}?view=all&scope=${scopeFilter}&limit=${visibleCount + 5}`} className="btn btn-secondary">
                    {copy.index.loadMore}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                  </Link>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-surface p-5">
              <p className="text-sm leading-6 text-foreground/64">
                {viewMode === "focus"
                  ? copy.index.emptyFocus
                  : copy.index.emptyFiltered}
              </p>
            </div>
          )
        ) : (
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm leading-6 text-foreground/64">
              {copy.index.emptyActive}
            </p>
            <Link href={getLocalizedAppHref("/frameworks", requestLocale)} className="btn btn-primary mt-4">
              {copy.index.emptyActiveAction}
              <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </Link>
          </div>
        )}
      </section>


    </section>
  );
}
