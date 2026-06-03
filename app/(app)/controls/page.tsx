import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { ArrowRight, BookCheck, CircleHelp } from "lucide-react";
import { ActivationStatus, deriveActivationStatusState } from "@/components/activation/activation-status";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { ComplianceReportButton } from "@/components/export/compliance-report-button";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { deriveActivationNextAction, type ActivationNextActionStage } from "@/lib/activation/next-action";
import { getActivationRecommendation } from "@/lib/activation/recommendations";
import {
  getControlDisplayDescription,
  getControlDisplayTitle,
} from "@/lib/controls/localization";
import { CONTROL_LIBRARY } from "@/lib/controls/library";
import { hasDatabaseUrl } from "@/lib/db";
import { listOrgControlsForIndex, getOrgWorkspaceRecommendations } from "@/lib/db/queries/controls";
import { getIntegrationsHubData } from "@/lib/db/queries/integrations";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { getWorkspaceProgress } from "@/lib/db/queries/workspaces";
import { pohodaWorkspace } from "@/lib/workspaces/pohoda";
import { heliosWorkspace } from "@/lib/workspaces/helios";
import { moneyS3Workspace } from "@/lib/workspaces/money-s3";
import { abraFlexiWorkspace } from "@/lib/workspaces/abra-flexi";

type ControlsCopy = ReturnType<typeof getMessagesForLocale>["controlsPage"];
type OrgControl = Awaited<ReturnType<typeof listOrgControlsForIndex>>[number];
type DataMode = "live" | "demo" | "unavailable";
type ScopeFilter = "in-scope" | "priority" | "gaps" | "out-of-scope";
type ViewMode = "focus" | "all";
type WorkspaceCallout = {
  href: string;
  key: string;
  label: string;
  progressPct: number | null;
  reason: string;
};


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

function buildWorkspaceCallout(platformKey: string, progressPct: number | null): WorkspaceCallout | null {
  const recommendation = getActivationRecommendation(platformKey);

  if (!recommendation || recommendation.kind !== "workspace") {
    return null;
  }

  return {
    href: recommendation.href,
    key: recommendation.key,
    label: recommendation.label,
    progressPct,
    reason: recommendation.reason,
  };
}

async function loadControlsIndexData() {
  const localDemoHeliosRecommended = process.env.ENABLE_LOCAL_DEMO_DATA === "true";
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  const demoWorkspaceRecommendations = localDemoHeliosRecommended
    ? [{ platformKey: "helios", label: "Helios (Asseco)", reason: "Demo Helios workspace recommendation." }]
    : [];
  const demoData = {
    abraFlexiCompletionPct: null,
    abraFlexiRecommended: false,
    controls: buildDemoControls(),
    heliosCompletionPct: null,
    heliosRecommended: localDemoHeliosRecommended,
    integrations: [] as { provider: string; status: string }[],
    mode: "demo" as DataMode,
    moneyS3CompletionPct: null,
    moneyS3Recommended: false,
    organisationLocale: null,
    pohodaCompletionPct: null,
    pohodaRecommended: false,
    toolInventory: ["microsoft-copilot", "github"],
    workspaceRecommendations: demoWorkspaceRecommendations,
  };

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return demoData;
  }

  const session = await auth();

  if (!session.orgId) {
    return demoData;
  }

  try {
    const [controls, organisation, workspaceRecommendations, integrationHubData] = await Promise.all([
      listOrgControlsForIndex(session.orgId),
      getOrganisationByClerkOrgId(session.orgId),
      getOrgWorkspaceRecommendations(session.orgId),
      getIntegrationsHubData(session.orgId),
    ]);

    const pohodaRecommended = workspaceRecommendations.some((r) => r.platformKey === "pohoda");
    const heliosRecommended = workspaceRecommendations.some((r) => r.platformKey === "helios");
    const moneyS3Recommended = workspaceRecommendations.some((r) => r.platformKey === "money_s3");
    const abraFlexiRecommended = workspaceRecommendations.some((r) => r.platformKey === "abra-flexi");

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

    let abraFlexiCompletionPct: number | null = null;
    if (abraFlexiRecommended) {
      try {
        const progress = await getWorkspaceProgress(session.orgId, abraFlexiWorkspace);
        if (progress.completedControls > 0) {
          abraFlexiCompletionPct = progress.overallCompletionPct;
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
      integrations: integrationHubData.integrations.map((integration) => ({
        provider: integration.provider,
        status: integration.status,
      })),
      moneyS3Recommended,
      moneyS3CompletionPct,
      abraFlexiRecommended,
      abraFlexiCompletionPct,
      toolInventory: Array.isArray(organisation?.toolInventory)
        ? organisation.toolInventory.filter((tool): tool is string => typeof tool === "string")
        : [],
      workspaceRecommendations,
    };
  } catch {
    return demoData;
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

function formatCopyTemplate(template: string, values: Record<string, string | number | null | undefined>) {
  return Object.entries(values).reduce(
    (current, [key, value]) => current.replaceAll(`{${key}}`, String(value ?? "")),
    template,
  );
}

function getActivationStageCopy(copy: ControlsCopy, stage: ActivationNextActionStage) {
  return copy.activationCallout.stages[stage] ?? copy.activationCallout.stages.review_ranked_gaps;
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
        ["fail", "manual_review", "warning", "unknown", null].includes(control.status),
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
  const {
    abraFlexiCompletionPct,
    abraFlexiRecommended,
    controls,
    heliosCompletionPct,
    heliosRecommended,
    integrations,
    mode,
    moneyS3CompletionPct,
    moneyS3Recommended,
    organisationLocale,
    pohodaCompletionPct,
    pohodaRecommended,
    toolInventory,
    workspaceRecommendations,
  } = await loadControlsIndexData();
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const messages = getMessagesForLocale(locale);
  const copy = messages.controlsPage;
  const reportCopy = messages.complianceReport;
  const scopeFilter = normalizeScopeFilter(resolvedSearchParams.scope);
  const viewMode = normalizeViewMode(resolvedSearchParams.view);
  const visibleCount = normalizeVisibleCount(resolvedSearchParams.limit);
  const filteredControls = filterControlsByScope(controls, scopeFilter);
  const sortControlsByPriority = (items: OrgControl[]) =>
    [...items].sort((first, second) => {
      const scoreDelta = getControlPriorityScore(second) - getControlPriorityScore(first);

      return scoreDelta || first.key.localeCompare(second.key);
    });
  const rankedControls = sortControlsByPriority(filteredControls);
  const focusControls = rankedControls.filter((control) => getControlPriorityScore(control) > 0);
  const controlsForView = viewMode === "focus" ? focusControls.slice(0, 5) : rankedControls.slice(0, visibleCount);
  const activationSourceControls = sortControlsByPriority(
    controls.filter(
      (control) =>
        control.scopeStatus !== "out_of_scope" &&
        control.scopeStatus !== "not_applicable" &&
        getControlPriorityScore(control) > 0,
    ),
  );
  const activationPriorityControls = activationSourceControls.map((control) => ({
    evidenceCount: control.latestEvidenceCollectionStatus || control.latestEvidenceCollectedAt ? 1 : 0,
    href: `/controls/${control.key}`,
    key: control.key,
    status: control.status,
    title: getControlDisplayTitle(control, locale),
  }));
  const hasIntakeProfile = controls.some(
    (control) => control.scopeStatus !== null || control.isIntakePriority || Boolean(control.intakeRationale),
  );
  const activationNextAction = deriveActivationNextAction({
    hasIntakeProfile,
    integrations,
    priorityControls: activationPriorityControls,
    selectedTools: toolInventory,
    workspaceRecommendations,
  });
  const activationStageCopy = getActivationStageCopy(copy, activationNextAction.stage);
  const activationTargetControl = activationPriorityControls.find(
    (control) => control.key === activationNextAction.topPriorityControlKey,
  ) ?? activationPriorityControls[0];
  const isControlTargetStage =
    activationNextAction.stage === "upload_first_evidence" ||
    activationNextAction.stage === "review_first_gap";
  const activationTarget = isControlTargetStage
    ? activationTargetControl?.title ?? copy.activationCallout.fallbackTarget
    : activationNextAction.recommendation?.label ??
      activationTargetControl?.title ??
      copy.activationCallout.fallbackTarget;
  const activationHref = getLocalizedAppHref(activationNextAction.href, requestLocale);
  const hasMoreControls = viewMode === "all" && rankedControls.length > visibleCount;
  const localizedControlsPath = getLocalizedAppHref("/controls", requestLocale);
  const scopeFilters: { href: string; label: string; value: ScopeFilter }[] = [
    { href: localizedControlsPath, label: copy.index.allScope, value: "in-scope" },
    { href: `${localizedControlsPath}?scope=priority`, label: copy.index.priorityScope, value: "priority" },
    { href: `${localizedControlsPath}?scope=gaps`, label: copy.index.gapScope, value: "gaps" },
    { href: `${localizedControlsPath}?scope=out-of-scope`, label: copy.index.outOfScope, value: "out-of-scope" },
  ];
  const demoMode = mode !== "live";
  const workspaceCallouts = viewMode === "focus"
    ? [
        pohodaRecommended ? buildWorkspaceCallout("pohoda", pohodaCompletionPct) : null,
        heliosRecommended ? buildWorkspaceCallout("helios", heliosCompletionPct) : null,
        moneyS3Recommended ? buildWorkspaceCallout("money_s3", moneyS3CompletionPct) : null,
        abraFlexiRecommended ? buildWorkspaceCallout("abra-flexi", abraFlexiCompletionPct) : null,
      ].filter((callout): callout is WorkspaceCallout => Boolean(callout))
    : [];

  const exportProfileParam =
    typeof resolvedSearchParams.exportProfile === "string"
      ? resolvedSearchParams.exportProfile
      : undefined;

  const demoExportIdentity = {
    clerkOrgId: "org_demo_export",
    dic: exportProfileParam === "incomplete" ? null : "CZ12345678",
    ico: "12345678",
    sidlo: "Václavské náměstí 1, Praha",
  };

  const reportMissingFields = [
    !demoExportIdentity.ico && reportCopy.fields.ico,
    !demoExportIdentity.dic && reportCopy.fields.dic,
    !demoExportIdentity.sidlo && reportCopy.fields.sidlo,
  ].filter((f): f is string => Boolean(f));

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

      <div className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-medium">{copy.report.title}</h2>
          <p className="mt-1 text-sm text-foreground/58">
            {copy.report.body}
          </p>
        </div>
        <ComplianceReportButton
          missingFields={reportMissingFields}
          orgId={demoExportIdentity.clerkOrgId}
          settingsHref={
            process.env.NEXT_PUBLIC_ENABLE_TEST_ROUTES === "true" &&
            exportProfileParam === "incomplete"
              ? "/settings/organisation?testProfile=editable-incomplete"
              : "/settings/organisation"
          }
        />
      </div>

      <section className="rounded-lg border border-primary/24 bg-primary/5 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary">
              {copy.activationCallout.eyebrow}
            </p>
            <h2 className="mt-1 text-lg font-semibold">
              {formatCopyTemplate(activationStageCopy.title, { target: activationTarget })}
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-foreground/62">
              {formatCopyTemplate(activationStageCopy.body, { target: activationTarget })}
            </p>
          </div>
          <Link href={activationHref} className="btn btn-primary shrink-0">
            {activationStageCopy.cta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {workspaceCallouts.map((callout) => (
        <Link
          key={callout.key}
          href={getLocalizedAppHref(callout.href, requestLocale)}
          className="flex items-start gap-4 rounded-lg border border-primary/24 bg-primary/4 p-4 transition-colors hover:bg-primary/8"
        >
          <BookCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium">{callout.label} — compliance workspace</p>
            <p className="mt-0.5 text-xs text-foreground/60">
              {copy.workspaceCallouts.workspaceDescription.replace("{platform}", callout.label)}
            </p>
            <p className="mt-1 text-xs leading-5 text-foreground/58">
              {callout.reason}
            </p>
            {callout.progressPct !== null ? (
              <p className="mt-1.5 text-xs font-medium text-primary">
                {copy.workspaceCallouts.workspaceCompletion.replace(
                  "{progress}",
                  String(Math.round(callout.progressPct * 100)),
                )}
              </p>
            ) : null}
          </div>
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        </Link>
      ))}

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
