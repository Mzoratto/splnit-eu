import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { ArrowRight, CheckCircle2, Clock3, Plug, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { getIntegrationDetail } from "@/lib/db/queries/integrations";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { getMicrosoft365AuthUrl } from "@/lib/integrations/microsoft365/oauth";
import { MICROSOFT365_TEST_DEFINITIONS } from "@/lib/integrations/microsoft365/test-definitions";

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

function statusMeta(status: string | null | undefined): {
  label: string;
  tone: StatusPillTone;
} {
  if (status === "connected") {
    return { label: "PASS", tone: "pass" };
  }

  if (status === "connecting") {
    return { label: "WARN", tone: "warn" };
  }

  if (status === "error") {
    return { label: "FAIL", tone: "fail" };
  }

  return { label: "N/A", tone: "neutral" };
}

async function loadMicrosoft365Data() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured) {
    return {
      authUrl: null,
      detail: null,
      organisationLocale: null,
    };
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      authUrl: null,
      detail: null,
      organisationLocale: null,
    };
  }

  const redirectUri = `${getAppUrl()}/api/integrations/microsoft/callback`;
  const authUrl =
    process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET
      ? getMicrosoft365AuthUrl(session.orgId, redirectUri)
      : null;
  const [detail, organisation] = hasDatabaseUrl()
    ? await Promise.all([
        getIntegrationDetail({
          clerkOrgId: session.orgId,
          provider: "microsoft365",
        }).catch(() => null),
        getOrganisationByClerkOrgId(session.orgId).catch(() => null),
      ])
    : [null, null];

  return {
    authUrl,
    detail,
    organisationLocale: organisation?.locale ?? null,
  };
}

export default async function Microsoft365IntegrationPage() {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const { authUrl, detail, organisationLocale } = await loadMicrosoft365Data();
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).integrations;
  const providerCopy = copy.providerPages;
  const integration = detail?.integration ?? null;
  const runs = detail?.runs ?? [];
  const tests = detail?.tests.length ? detail.tests : MICROSOFT365_TEST_DEFINITIONS;
  const connected = integration?.status === "connected";
  const connectionStatus = statusMeta(integration?.status);

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Microsoft Graph"
        title={providerCopy.microsoft365.title}
        subtitle={providerCopy.microsoft365.subtitle}
        actions={
          authUrl ? (
            <Link href={authUrl} className="btn btn-primary">
              {connected ? providerCopy.microsoft365.reconnect : providerCopy.microsoft365.connect}
              <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="btn btn-primary opacity-50"
            >
              {providerCopy.microsoft365.connect}
              <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </button>
          )
        }
      />

      {!authUrl ? (
        <div className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm leading-6 text-foreground/64">
          {providerCopy.common.connectionUnavailable}
        </div>
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
                    <StatusPill tone={statusMeta(run.status).tone}>
                      {statusMeta(run.status).label}
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
