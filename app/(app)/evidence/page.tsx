import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { ArrowRight, Download, FileText, Filter } from "lucide-react";
import { ActivationStatus, deriveActivationStatusState } from "@/components/activation/activation-status";
import { PageHeader } from "@/components/app/page-header";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { deriveActivationNextAction } from "@/lib/activation/next-action";
import { getControlDisplayTitle } from "@/lib/controls/localization";
import { hasDatabaseUrl } from "@/lib/db";
import { listEvidenceVault } from "@/lib/db/queries/evidence";
import { getActivationAutomationOutcomeForControlKeys } from "@/lib/db/queries/activation-automation-outcomes";
import { listOrgControlsForIndex, getOrgWorkspaceRecommendations } from "@/lib/db/queries/controls";
import { getIntegrationsHubData } from "@/lib/db/queries/integrations";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { getFrameworkDisplayName } from "@/lib/frameworks/localization";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";

type EvidenceRow = Awaited<ReturnType<typeof listEvidenceVault>>[number];
type EvidenceControl = Awaited<ReturnType<typeof listOrgControlsForIndex>>[number];

type SearchParams = {
  expiry?: string;
  framework?: string;
  status?: string;
};

function formatDate(
  value: Date | string | null | undefined,
  locale: Locale,
  emptyLabel: string,
) {
  if (!value) {
    return emptyLabel;
  }

  return new Intl.DateTimeFormat(locale).format(new Date(value));
}

function getDaysUntil(value: Date | string | null) {
  if (!value) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(value);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function getControlTitle(item: EvidenceRow, locale: Locale) {
  return getControlDisplayTitle(
    {
      key: item.controlKey,
      title: item.controlTitle,
      titleCs: item.controlTitleCs,
      titleEn: item.controlTitleEn,
    },
    locale,
  );
}

function getFrameworkName(
  framework: (typeof FRAMEWORK_LIBRARY)[number],
  locale: Locale,
) {
  return getFrameworkDisplayName(framework, locale);
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

function getEvidenceFrameworkName(
  framework: EvidenceRow["frameworks"][number],
  locale: Locale,
) {
  return getFrameworkDisplayName(
    {
      nameCs: framework.frameworkNameCs ?? framework.frameworkName,
      nameEn: framework.frameworkNameEn ?? framework.frameworkName,
      slug: framework.frameworkSlug,
    },
    locale,
  );
}

function getEvidenceControlPriorityScore(control: EvidenceControl) {
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

function buildEvidenceActivationPriorityControls(
  controls: EvidenceControl[],
  locale: Locale,
) {
  return controls
    .filter(
      (control) =>
        control.scopeStatus !== "out_of_scope" &&
        control.scopeStatus !== "not_applicable" &&
        getEvidenceControlPriorityScore(control) > 0,
    )
    .sort((first, second) => {
      const scoreDelta = getEvidenceControlPriorityScore(second) - getEvidenceControlPriorityScore(first);
      return scoreDelta || first.key.localeCompare(second.key);
    })
    .map((control) => ({
      evidenceCount: control.latestEvidenceCollectionStatus || control.latestEvidenceCollectedAt ? 1 : 0,
      href: `/controls/${control.key}`,
      key: control.key,
      status: control.status,
      title: getControlDisplayTitle(control, locale),
    }));
}

async function loadEvidenceRows(requestLocale: Locale) {
  const fallbackActivationNextAction = deriveActivationNextAction({
    hasIntakeProfile: false,
  });
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return {
      activationAutomationOutcome: null,
      activationNextAction: fallbackActivationNextAction,
      organisationLocale: null,
      rows: [],
    };
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      activationAutomationOutcome: null,
      activationNextAction: fallbackActivationNextAction,
      organisationLocale: null,
      rows: [],
    };
  }

  try {
    const [
      organisation,
      rows,
      controls,
      workspaceRecommendations,
      integrationHubData,
    ] = await Promise.all([
      getOrganisationByClerkOrgId(session.orgId),
      listEvidenceVault(session.orgId),
      listOrgControlsForIndex(session.orgId),
      getOrgWorkspaceRecommendations(session.orgId),
      getIntegrationsHubData(session.orgId),
    ]);
    const locale = normalizeLocale(organisation?.locale) ?? requestLocale;
    const priorityControls = buildEvidenceActivationPriorityControls(controls, locale);
    const hasIntakeProfile = controls.some(
      (control) => control.scopeStatus !== null || control.isIntakePriority || Boolean(control.intakeRationale),
    );
    const selectedTools = Array.isArray(organisation?.toolInventory)
      ? organisation.toolInventory.filter((tool): tool is string => typeof tool === "string")
      : [];

    const activationNextAction = deriveActivationNextAction({
      hasIntakeProfile,
      integrations: integrationHubData.integrations.map((integration) => ({
        provider: integration.provider,
        status: integration.status,
      })),
      priorityControls,
      selectedTools,
      workspaceRecommendations,
    });
    const activationAutomationOutcome = await getActivationAutomationOutcomeForControlKeys({
      clerkOrgId: session.orgId,
      controlKeys: priorityControls.map((control) => control.key),
    });

    return {
      activationAutomationOutcome,
      activationNextAction,
      organisationLocale: organisation?.locale ?? null,
      rows,
    };
  } catch {
    return {
      activationAutomationOutcome: null,
      activationNextAction: fallbackActivationNextAction,
      organisationLocale: null,
      rows: [],
    };
  }
}

export default async function EvidencePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const filters = await searchParams;
  const { activationAutomationOutcome, activationNextAction, organisationLocale, rows } = await loadEvidenceRows(requestLocale);
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).evidence;
  const filteredRows = rows.filter((row) => {
    const status = row.status ?? "unknown";
    const frameworkMatch =
      !filters.framework ||
      row.frameworks.some((framework) => framework.frameworkSlug === filters.framework);
    const statusMatch = !filters.status || status === filters.status;
    const daysUntilExpiry = getDaysUntil(null);
    const expiryMatch =
      !filters.expiry ||
      (filters.expiry === "expired" && daysUntilExpiry !== null && daysUntilExpiry < 0) ||
      (filters.expiry === "30" &&
        daysUntilExpiry !== null &&
        daysUntilExpiry >= 0 &&
        daysUntilExpiry <= 30) ||
      (filters.expiry === "none" && daysUntilExpiry === null);

    return frameworkMatch && statusMatch && expiryMatch;
  });
  const emptyAutomationStatusState = activationAutomationOutcome
    ? deriveActivationStatusState({
        assessmentResult: activationAutomationOutcome.assessmentResult,
        blockedReason: activationAutomationOutcome.blockedReason ?? undefined,
        collectionStatus: activationAutomationOutcome.collectionStatus,
        lastKnownAssessmentResult: activationAutomationOutcome.lastKnownAssessmentResult,
        source: activationAutomationOutcome.source,
      })
    : null;
  const emptyEvidenceHref = getLocalizedAppHref(
    activationAutomationOutcome
      ? `/controls/${activationAutomationOutcome.controlKey}`
      : activationNextAction.href,
    requestLocale,
  );
  const emptyEvidenceAction = activationAutomationOutcome?.kind === "blocked"
    ? copy.records.emptyAutomationBlockedAction
    : copy.records.emptyAction;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
      />

      <form className="card">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
          <h2 className="text-lg font-medium">{copy.filters.title}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <label className="grid gap-2 text-xs font-medium text-foreground/68">
            {copy.filters.framework}
            <select
              name="framework"
              defaultValue={filters.framework ?? ""}
              className="h-9 rounded-md border border-border-default bg-[var(--bg-input)] px-3 text-sm text-foreground"
            >
              <option value="">{copy.filters.allFrameworks}</option>
              {FRAMEWORK_LIBRARY.map((framework) => (
                <option key={framework.slug} value={framework.slug}>
                  {getFrameworkName(framework, locale)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-xs font-medium text-foreground/68">
            {copy.filters.status}
            <select
              name="status"
              defaultValue={filters.status ?? ""}
              className="h-9 rounded-md border border-border-default bg-[var(--bg-input)] px-3 text-sm text-foreground"
            >
              <option value="">{copy.filters.allStatuses}</option>
              <option value="pass">{copy.statuses.pass}</option>
              <option value="fail">{copy.statuses.fail}</option>
              <option value="manual_review">{copy.statuses.manualReview}</option>
              <option value="unknown">{copy.statuses.unknown}</option>
            </select>
          </label>
          <label className="grid gap-2 text-xs font-medium text-foreground/68">
            {copy.filters.expiry}
            <select
              name="expiry"
              defaultValue={filters.expiry ?? ""}
              className="h-9 rounded-md border border-border-default bg-[var(--bg-input)] px-3 text-sm text-foreground"
            >
              <option value="">{copy.filters.anyExpiry}</option>
              <option value="30">{copy.filters.next30Days}</option>
              <option value="expired">{copy.filters.expired}</option>
              <option value="none">{copy.filters.noExpiry}</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="btn btn-primary w-full"
            >
              {copy.filters.apply}
              <Filter className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </form>

      <section className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between gap-4 border-b border-border p-5">
          <h2 className="text-lg font-medium">{copy.records.title}</h2>
          <span className="rounded-sm bg-surface-muted px-2 py-1 font-mono text-xs text-foreground/64">
            {filteredRows.length} / {rows.length}
          </span>
        </div>
        <div className="divide-y divide-border">
          {filteredRows.length > 0 ? (
            filteredRows.map((item) => {
              const controlTitle = getControlTitle(item, locale);

              return (
                <article
                  key={item.evidenceId}
                  className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <FileText className="h-4 w-4 text-status-pass" aria-hidden="true" strokeWidth={1.5} />
                      <h3 className="font-mono text-sm font-medium">
                        {item.description ?? controlTitle}
                      </h3>
                      <ActivationStatus
                        confidence={item.confidence}
                        showDetails={false}
                        state={deriveActivationStatusState({
                          assessmentResult: item.assessmentResult,
                          blockedReason: item.blockedReason,
                          collectionStatus: item.collectionStatus,
                          reviewStatus: item.status,
                          source: item.source,
                        })}
                      />
                      {item.collectionStatus === "pending" || item.assessmentResult === "manual_review" ? (
                        <span className="rounded-sm border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900">
                          {copy.records.aiDraftHumanReview}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-foreground/58">
                      {controlTitle} · {item.type} ·{" "}
                      {formatDate(item.collectedAt, locale, copy.noDate)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.frameworks.map((framework) => (
                        <span
                          key={`${item.evidenceId}-${framework.frameworkSlug}`}
                          className="rounded-sm bg-[var(--accent-subtle)] px-2 py-1 text-xs text-primary"
                        >
                          {getEvidenceFrameworkName(framework, locale)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 lg:items-end">
                    <ActivationStatus
                      confidence={item.confidence}
                      state={deriveActivationStatusState({
                        assessmentResult: item.assessmentResult,
                        blockedReason: item.blockedReason,
                        collectionStatus: item.collectionStatus,
                      })}
                    />
                    {item.blobUrl ? (
                      <Link
                        href={`/api/evidence/${item.evidenceId}/download`}
                        className="btn btn-secondary h-8 px-3"
                      >
                        {copy.actions.file}
                        <Download className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                      </Link>
                    ) : null}
                    <Link
                      href={`/controls/${item.controlKey}`}
                      className="btn btn-secondary h-8 px-3"
                    >
                      {copy.actions.control}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                    </Link>
                  </div>
                </article>
              );
            })
          ) : rows.length === 0 ? (
            <div className="p-5">
              <p className="text-sm leading-6 text-foreground/64">
                {activationAutomationOutcome
                  ? copy.records.emptyAutomationOutcome
                  : copy.records.empty}
              </p>
              {activationAutomationOutcome && emptyAutomationStatusState ? (
                <div className="mt-4 max-w-xl">
                  <ActivationStatus
                    confidence={activationAutomationOutcome.confidence}
                    state={emptyAutomationStatusState}
                  />
                </div>
              ) : null}
              <Link href={emptyEvidenceHref} className="btn btn-primary mt-4">
                {emptyEvidenceAction}
                <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              </Link>
            </div>
          ) : (
            <p className="p-5 text-sm text-foreground/58">
              {copy.records.emptyFiltered}
            </p>
          )}
        </div>
      </section>
    </section>
  );
}