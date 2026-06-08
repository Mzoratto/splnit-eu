import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { ArrowRight, CheckCircle2, Clock3, ListChecks, Plug, ShieldAlert, XCircle } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { getProposedDiscoveryCountsForOrg } from "@/lib/db/queries/discovery";
import { getIntegrationDetail } from "@/lib/db/queries/integrations";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { isDiscoveryEnabledForOrg, isDiscoveryProviderEnabled } from "@/lib/discovery/flags";
import { MICROSOFT365_TEST_DEFINITIONS } from "@/lib/integrations/microsoft365/test-definitions";
import { disconnectIntegrationAction } from "../actions";

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

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function statusMeta(
  status: string | null | undefined,
  labels: ReturnType<typeof getMessagesForLocale>["integrations"]["providerPages"]["common"],
): {
  label: string;
  tone: StatusPillTone;
} {
  if (status === "connected") {
    return { label: labels.statusConnected, tone: "pass" };
  }

  if (status === "pass") {
    return { label: "PASS", tone: "pass" };
  }

  if (status === "connecting") {
    return { label: labels.statusConnecting, tone: "warn" };
  }

  if (status === "manual_review" || status === "warning") {
    return { label: "WARN", tone: "warn" };
  }

  if (status === "error") {
    return { label: labels.statusActionNeeded, tone: "fail" };
  }

  if (status === "fail") {
    return { label: "FAIL", tone: "fail" };
  }

  return { label: labels.statusNotConnected, tone: "neutral" };
}

async function loadMicrosoft365Data() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured) {
    return {
      authUrl: null,
      detail: null,
      discoveryCounts: null,
      discoveryEnabled: false,
      organisationLocale: null,
    };
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      authUrl: null,
      detail: null,
      discoveryCounts: null,
      discoveryEnabled: false,
      organisationLocale: null,
    };
  }

  const authUrl =
    process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET
      ? `${getAppUrl()}/api/integrations/microsoft/start`
      : null;
  const discoveryEnabled =
    isDiscoveryEnabledForOrg(session.orgId) && isDiscoveryProviderEnabled("microsoft365");
  const [detail, organisation, discoveryCounts] = hasDatabaseUrl()
    ? await Promise.all([
        getIntegrationDetail({
          clerkOrgId: session.orgId,
          provider: "microsoft365",
        }).catch(() => null),
        getOrganisationByClerkOrgId(session.orgId).catch(() => null),
        discoveryEnabled
          ? getProposedDiscoveryCountsForOrg(session.orgId, "microsoft365").catch(() => null)
          : Promise.resolve(null),
      ])
    : [null, null, null];

  return {
    authUrl,
    detail,
    discoveryCounts,
    discoveryEnabled,
    organisationLocale: organisation?.locale ?? null,
  };
}

type Microsoft365DiscoveryHandoffCopy = ReturnType<
  typeof getMessagesForLocale
>["integrations"]["providerPages"]["microsoft365"]["discoveryHandoff"];

type DiscoveryCounts = {
  assets: number;
  vendors: number;
};

function formatTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function DiscoveryHandoffCard({
  copy,
  counts,
}: {
  copy: Microsoft365DiscoveryHandoffCopy;
  counts: DiscoveryCounts | null;
}) {
  const total = counts ? counts.assets + counts.vendors : 0;
  const hasDrafts = total > 0;
  const toneClass = !counts
    ? "border-amber-200 bg-amber-50 text-amber-950"
    : hasDrafts
      ? "border-blue-200 bg-blue-50 text-blue-950"
      : "border-emerald-200 bg-emerald-50 text-emerald-950";
  const mutedClass = !counts
    ? "text-amber-900/80"
    : hasDrafts
      ? "text-blue-900/80"
      : "text-emerald-900/80";
  const title = !counts
    ? copy.errorTitle
    : hasDrafts
      ? formatTemplate(copy.draftsTitle, { count: total })
      : copy.zeroTitle;
  const body = !counts
    ? copy.errorBody
    : hasDrafts
      ? formatTemplate(copy.draftsBody, {
          assets: counts.assets,
          count: total,
          vendors: counts.vendors,
        })
      : copy.zeroBody;

  return (
    <section className={`rounded-xl border p-5 shadow-sm ${toneClass}`}>
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div className="flex gap-3">
          <ListChecks className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" strokeWidth={1.5} />
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className={`mt-1 max-w-3xl text-sm leading-6 ${mutedClass}`}>{body}</p>
            {counts ? (
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="rounded-lg bg-white/70 px-3 py-2 font-medium text-foreground shadow-sm">
                  {copy.statsAssets}: {counts.assets}
                </span>
                <span className="rounded-lg bg-white/70 px-3 py-2 font-medium text-foreground shadow-sm">
                  {copy.statsSuppliers}: {counts.vendors}
                </span>
              </div>
            ) : null}
          </div>
        </div>
        {counts ? (
          <Link href="/discovery" className="btn btn-primary shrink-0">
            {copy.reviewCta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          </Link>
        ) : null}
      </div>
      <div className="mt-4 rounded-lg border border-white/70 bg-white/60 px-3 py-2 text-sm text-foreground/70">
        <span className="font-medium text-foreground">{copy.boundaryTitle}</span>{" "}
        {copy.boundaryBody}
      </div>
    </section>
  );
}

export default async function Microsoft365IntegrationPage() {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const { authUrl, detail, discoveryCounts, discoveryEnabled, organisationLocale } = await loadMicrosoft365Data();
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).integrations;
  const providerCopy = copy.providerPages;
  const integration = detail?.integration ?? null;
  const runs = detail?.runs ?? [];
  const tests = detail?.tests.length ? detail.tests : MICROSOFT365_TEST_DEFINITIONS;
  const connected = integration?.status === "connected";
  const connectionStatus = statusMeta(integration?.status, providerCopy.common);

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Microsoft Graph"
        title={providerCopy.microsoft365.title}
        subtitle={providerCopy.microsoft365.subtitle}
        actions={
          <div className="flex flex-wrap gap-2">
            {authUrl ? (
              <Link href={authUrl} className="btn btn-primary">
                {connected ? providerCopy.microsoft365.reconnect : providerCopy.microsoft365.connect}
                <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="btn btn-primary cursor-not-allowed opacity-50"
              >
                {providerCopy.microsoft365.connect}
                <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              </button>
            )}
            {connected ? (
              <form action={disconnectIntegrationAction.bind(null, "microsoft365")}>
                <button type="submit" className="btn btn-danger">
                  {providerCopy.common.disconnect}
                  <XCircle className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                </button>
              </form>
            ) : null}
          </div>
        }
      />

      {!authUrl ? (
        <div className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm leading-6 text-foreground/64">
          {providerCopy.common.connectionUnavailable}
        </div>
      ) : null}

      {connected && discoveryEnabled ? (
        <DiscoveryHandoffCard
          copy={providerCopy.microsoft365.discoveryHandoff}
          counts={discoveryCounts}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="card">
          <div className="flex items-center gap-2">
            {connected ? (
              <CheckCircle2
                className="h-5 w-5 text-status-pass"
                aria-hidden="true"
                strokeWidth={1.5}
              />
            ) : (
              <Plug className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            )}
            <h2 className="text-lg font-medium">{providerCopy.common.status}</h2>
          </div>
          <div className="mt-4">
            <StatusPill tone={connectionStatus.tone}>
              {connectionStatus.label}
            </StatusPill>
          </div>
          <p className="mt-2 text-sm text-foreground/58">
            {providerCopy.microsoft365.tokenExpires} {formatDate(integration?.tokenExpiresAt, locale, copy.never)}
          </p>
        </article>
        <article className="card">
          <div className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">{providerCopy.common.lastSync}</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">
            {formatDate(integration?.lastSyncedAt, locale, copy.never)}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            {integration?.lastErrorMsg ?? providerCopy.common.lastErrorEmpty}
          </p>
        </article>
        <article className="card">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">{providerCopy.common.automatedTests}</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">{tests.length}</p>
          <p className="mt-2 text-sm text-foreground/58">
            {providerCopy.microsoft365.testsBody}
          </p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <section className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-medium">{providerCopy.common.testSuite}</h2>
          </div>
          <div className="divide-y divide-border">
            {tests.map((test) => (
              <article key={test.checkLogic} className="p-4 hover:bg-bg-hover">
                <p className="font-medium">{test.name}</p>
                <p className="mt-1 font-mono text-xs text-foreground/52">
                  {test.checkLogic}
                </p>
                {"passCriteria" in test ? (
                  <p className="mt-2 text-sm leading-6 text-foreground/64">
                    {test.passCriteria}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-medium">{providerCopy.common.runResults}</h2>
          </div>
          <div className="divide-y divide-border">
            {runs.length > 0 ? (
              runs.map((run) => (
                <article key={`${run.testName}-${run.ranAt}`} className="p-4 hover:bg-bg-hover">
                  <div className="flex flex-col justify-between gap-2 md:flex-row">
                    <div>
                      <p className="font-medium">{run.testName}</p>
                      <p className="mt-1 text-sm text-foreground/58">
                        {formatDate(run.ranAt, locale, copy.never)}
                      </p>
                    </div>
                    <StatusPill tone={statusMeta(run.status, providerCopy.common).tone}>
                      {statusMeta(run.status, providerCopy.common).label}
                    </StatusPill>
                  </div>
                  {run.failureReason ? (
                    <p className="mt-2 text-sm leading-6 text-foreground/64">
                      {run.failureReason}
                    </p>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="p-5 text-sm text-foreground/58">
                {providerCopy.common.runResultsEmpty}
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
