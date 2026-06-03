import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Cloud,
  DatabaseZap,
  GitBranch,
  ServerCog,
  MonitorCog,
  PlugZap,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import {
  getConnectorRecommendationFromTools,
  getIntegrationHubRecommendations,
  type IntegrationHubIconKey,
} from "@/lib/activation/recommendations";
import { hasDatabaseUrl } from "@/lib/db";
import { getIntegrationsHubData } from "@/lib/db/queries/integrations";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { disconnectIntegrationAction } from "./actions";
import { IntegrationStatusRefresh } from "./status-refresh";

const providerIcons: Record<IntegrationHubIconKey, LucideIcon> = {
  cloud: Cloud,
  database: DatabaseZap,
  "git-branch": GitBranch,
  monitor: MonitorCog,
  plug: PlugZap,
  server: ServerCog,
};

type HubData = Awaited<ReturnType<typeof getIntegrationsHubData>>;
type IntegrationsCopy = ReturnType<typeof getMessagesForLocale>["integrations"];

async function loadHubData() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return { data: null, organisationLocale: null, toolInventory: [] as string[] };
  }

  const session = await auth();

  if (!session.orgId) {
    return { data: null, organisationLocale: null, toolInventory: [] as string[] };
  }

  try {
    const [data, organisation] = await Promise.all([
      getIntegrationsHubData(session.orgId),
      getOrganisationByClerkOrgId(session.orgId),
    ]);

    return {
      data,
      organisationLocale: organisation?.locale ?? null,
      toolInventory: Array.isArray(organisation?.toolInventory)
        ? organisation.toolInventory.filter((tool): tool is string => typeof tool === "string")
        : [],
    };
  } catch {
    return { data: null, organisationLocale: null, toolInventory: [] as string[] };
  }
}

function formatDate(
  value: Date | string | null | undefined,
  locale: Locale,
  emptyLabel: string,
) {
  if (!value) {
    return emptyLabel;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusMeta(
  status: string,
  copy: IntegrationsCopy,
): { label: string; tone: StatusPillTone } {
  if (status === "connected") {
    return { label: copy.index.statusConnected, tone: "pass" };
  }

  if (status === "connecting") {
    return { label: copy.index.statusConnecting, tone: "warn" };
  }

  if (status === "coming_soon") {
    return { label: copy.index.comingSoon, tone: "neutral" };
  }

  return { label: copy.index.statusAvailable, tone: "neutral" };
}

function getRunBreakdown(provider: string, data: HubData | null) {
  const empty = {
    error: 0,
    fail: 0,
    manual_review: 0,
    pass: 0,
    warning: 0,
  };

  if (!data) {
    return empty;
  }

  return data.runs
    .filter((run) => run.provider === provider)
    .reduce((counts, run) => {
      if (run.status in counts) {
        counts[run.status as keyof typeof counts] += 1;
      }

      return counts;
    }, empty);
}

function getTestCount(provider: string, fallback: number, data: HubData | null) {
  if (!data) {
    return fallback;
  }

  return data.tests.filter((test) => test.provider === provider).length;
}

function hasAwsApiKeyCredential(integration: HubData["integrations"][number] | undefined) {
  const config = integration?.config as Record<string, unknown> | null | undefined;
  return config?.credentialType === "aws_iam_access_key";
}

function getRecommendedProvider(toolInventory: string[]) {
  return getConnectorRecommendationFromTools(toolInventory, { fallback: true })?.providerKey ?? "microsoft365";
}

function getProviderDescription(
  providerKey: string,
  copy: IntegrationsCopy,
  fallback: string,
) {
  const providerDescriptions = copy.providers as Record<string, string>;

  return providerDescriptions[providerKey] ?? fallback;
}

export default async function IntegrationsPage() {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const { data, organisationLocale, toolInventory } = await loadHubData();
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).integrations;
  const integrationMap = new Map(
    data?.integrations.map((integration) => [
      integration.provider,
      integration,
    ]) ?? [],
  );
  const hasConnecting = data?.integrations.some(
    (integration) => integration.status === "connecting",
  ) ?? false;
  const hasConnectedIntegration = data?.integrations.some(
    (integration) => integration.status === "connected" || integration.status === "connecting",
  ) ?? false;
  const recommendedProvider = getRecommendedProvider(toolInventory);
  const providerCards = getIntegrationHubRecommendations();

  return (
    <section className="space-y-6">
      <IntegrationStatusRefresh enabled={hasConnecting} />
      <PageHeader
        eyebrow={copy.index.eyebrow}
        title={copy.index.title}
        subtitle={copy.index.subtitle}
      />

      {!hasConnectedIntegration ? (
        <section className="rounded-lg border border-primary/30 bg-primary/8 p-5">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary">
              {copy.index.recommendationEyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              {copy.index.recommendationTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground/64">
              {copy.index.recommendationBody}
            </p>
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-border bg-white px-4 py-3 text-xs text-foreground/62 shadow-xs">
        <span className="font-medium text-foreground/78">{copy.index.results24h}</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-status-pass" aria-hidden="true" />{copy.index.statusPass}</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger" aria-hidden="true" />{copy.index.statusFail}</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" />{copy.index.statusWarning}</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />{copy.index.statusManual}</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-foreground/40" aria-hidden="true" />{copy.index.statusError}</span>
      </div>

      <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {providerCards.map((provider) => {
          const Icon = providerIcons[provider.iconKey];
          const statusProviderKey = provider.providerKey ?? provider.workspaceKey ?? provider.key;
          const recommendationKey = provider.providerKey ?? provider.key;
          const isComingSoon = provider.planned || !provider.supported;
          const rawIntegration = integrationMap.get(statusProviderKey);
          const integration =
            statusProviderKey === "aws" && !hasAwsApiKeyCredential(rawIntegration)
              ? undefined
              : rawIntegration;
          const rawStatus =
            integration?.status ?? (isComingSoon ? "coming_soon" : "available");
          const connected = rawStatus === "connected";
          const providerStatus = statusMeta(rawStatus, copy);
          const breakdown = getRunBreakdown(statusProviderKey, data);
          const testCount = getTestCount(statusProviderKey, provider.defaultTestCount, data);

          return (
            <article
              key={provider.key}
              className={
                !hasConnectedIntegration && recommendationKey === recommendedProvider
                  ? "card interactive-card flex h-full flex-col border-primary/50 ring-1 ring-primary/20"
                  : rawStatus === "available" || rawStatus === "coming_soon"
                    ? "card interactive-card flex h-full flex-col border-dashed"
                    : "card interactive-card flex h-full flex-col"
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span
                    className={`mb-4 grid h-11 w-11 place-items-center rounded-lg text-sm font-bold text-white ${provider.badgeClassName}`}
                  >
                    {provider.badgeAbbreviation}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill tone={providerStatus.tone}>
                      {providerStatus.label}
                    </StatusPill>
                    {!hasConnectedIntegration && recommendationKey === recommendedProvider ? (
                      <StatusPill tone="warn">{copy.index.recommended}</StatusPill>
                    ) : null}
                  </div>
                  <h2 className="mt-3 text-lg font-semibold">{provider.label}</h2>
                </div>
                {connected ? (
                  <CheckCircle2
                    className="h-5 w-5 text-status-pass"
                    aria-hidden="true"
                    strokeWidth={1.5}
                  />
                ) : isComingSoon ? (
                  <CircleDashed
                    className="h-5 w-5 text-foreground/42"
                    aria-hidden="true"
                    strokeWidth={1.5}
                  />
                ) : (
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
                )}
              </div>
              <p className="mt-3 min-h-24 text-sm leading-6 text-foreground/64">
                {getProviderDescription(provider.key, copy, provider.reason)}
              </p>
              {isComingSoon ? (
                <p className="mt-2 rounded-md border border-border bg-surface-muted px-3 py-2 text-xs leading-5 text-foreground/62">
                  {copy.index.plannedCardNote}
                </p>
              ) : null}

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-foreground/52">{copy.index.tests}</dt>
                  <dd className="mt-1 font-mono text-lg font-medium">
                    {testCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/52">{copy.index.lastSync}</dt>
                  <dd className="mt-1 text-xs text-foreground/68">
                    {formatDate(integration?.lastSyncedAt, locale, copy.never)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 rounded-lg bg-surface-muted p-3">
                <p className="text-xs font-medium text-foreground/60">
                  {copy.index.results24h}
                </p>
                <div className="mt-2 grid grid-cols-5 gap-2 text-center font-mono text-xs" aria-label={copy.index.resultsAria}>
                  <span className="rounded-sm bg-background px-1 py-1 text-status-pass" title="Pass">
                    {breakdown.pass}
                  </span>
                  <span className="rounded-sm bg-background px-1 py-1 text-danger" title="Fail">
                    {breakdown.fail}
                  </span>
                  <span className="rounded-sm bg-background px-1 py-1 text-warning" title="Warning">
                    {breakdown.warning}
                  </span>
                  <span className="rounded-sm bg-background px-1 py-1 text-primary" title={copy.index.manualReviewTitle}>
                    {breakdown.manual_review}
                  </span>
                  <span className="rounded-sm bg-background px-1 py-1 text-foreground/58" title="Error">
                    {breakdown.error}
                  </span>
                </div>
              </div>

              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                {isComingSoon ? (
                  <span
                    className="btn btn-secondary cursor-not-allowed opacity-60"
                    aria-disabled="true"
                  >
                    {copy.index.comingSoon}
                    <CircleDashed className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                  </span>
                ) : (
                  <Link
                    href={provider.href}
                    className={connected ? "btn btn-secondary" : "btn btn-primary"}
                  >
                    {connected ? copy.index.manage : copy.index.connect}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                  </Link>
                )}
                {connected ? (
                  <form action={disconnectIntegrationAction.bind(null, statusProviderKey)}>
                    <button
                      type="submit"
                      className="btn btn-danger"
                    >
                      {copy.index.disconnect}
                      <XCircle className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                    </button>
                  </form>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {!hasConnectedIntegration ? (
        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-medium">{copy.index.stackMissingTitle}</h2>
              <p className="mt-1 text-sm leading-6 text-foreground/64">
                {copy.index.stackMissingBody}
              </p>
            </div>
            <Link href="/evidence" className="btn btn-secondary shrink-0">
              {copy.index.manualUpload}
              <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </Link>
          </div>
        </section>
      ) : null}
    </section>
  );
}
