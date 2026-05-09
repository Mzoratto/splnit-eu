import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { ArrowRight, CheckCircle2, GitBranch, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { getIntegrationDetail } from "@/lib/db/queries/integrations";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  getGitHubAppInstallUrl,
  hasGitHubAppConfig,
  listGitHubInstallationRepositories,
} from "@/lib/integrations/github/app";
import { GITHUB_TEST_DEFINITIONS } from "@/lib/integrations/github/test-definitions";

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

async function loadGitHubData() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured) {
    return {
      detail: null,
      installUrl: null,
      organisationLocale: null,
      repositories: [],
    };
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      detail: null,
      installUrl: null,
      organisationLocale: null,
      repositories: [],
    };
  }

  const [detail, organisation] = hasDatabaseUrl()
    ? await Promise.all([
        getIntegrationDetail({
          clerkOrgId: session.orgId,
          provider: "github",
        }).catch(() => null),
        getOrganisationByClerkOrgId(session.orgId).catch(() => null),
      ])
    : [null, null];
  const repositories = detail?.integration
    ? await listGitHubInstallationRepositories(detail.integration).catch(() => [])
    : [];

  return {
    detail,
    installUrl: hasGitHubAppConfig() ? getGitHubAppInstallUrl(session.orgId) : null,
    organisationLocale: organisation?.locale ?? null,
    repositories,
  };
}

export default async function GitHubIntegrationPage() {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const { detail, installUrl, organisationLocale, repositories } = await loadGitHubData();
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).integrations;
  const providerCopy = copy.providerPages;
  const integration = detail?.integration ?? null;
  const runs = detail?.runs ?? [];
  const tests = detail?.tests.length ? detail.tests : GITHUB_TEST_DEFINITIONS;
  const connected = integration?.status === "connected";
  const connectionStatus = statusMeta(integration?.status, providerCopy.common);
  const config = (integration?.config ?? {}) as {
    accountType?: string | null;
    owner?: string | null;
  };

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="GitHub App"
        title={providerCopy.github.title}
        subtitle={providerCopy.github.subtitle}
        actions={
          installUrl ? (
            <Link href={installUrl} className="btn btn-primary">
              {connected ? providerCopy.github.editInstall : providerCopy.github.installApp}
              <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </Link>
          ) : (
            <button type="button" disabled className="btn btn-primary opacity-50">
              {providerCopy.github.installApp}
              <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </button>
          )
        }
      />

      {!installUrl ? (
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
              <GitBranch className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            )}
            <h2 className="text-lg font-medium">{providerCopy.common.status}</h2>
          </div>
          <div className="mt-4">
            <StatusPill tone={connectionStatus.tone}>
              {connectionStatus.label}
            </StatusPill>
          </div>
          <p className="mt-2 text-sm text-foreground/58">
            {config.owner ?? providerCopy.github.installMissing} · {config.accountType ?? "unknown"}
          </p>
        </article>
        <article className="card">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">{providerCopy.github.repositories}</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">
            {repositories.length}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            {providerCopy.common.lastSync} {formatDate(integration?.lastSyncedAt, locale, copy.never)}
          </p>
        </article>
        <article className="card">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">{providerCopy.common.automatedTests}</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">{tests.length}</p>
          <p className="mt-2 text-sm text-foreground/58">
            {providerCopy.github.testsBody}
          </p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <section className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-medium">{providerCopy.github.repositories}</h2>
          </div>
          <div className="divide-y divide-border">
            {repositories.length > 0 ? (
              repositories.slice(0, 20).map((repo) => (
                <article
                  key={repo.full_name}
                  className="grid gap-3 p-4 hover:bg-bg-hover md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-mono text-sm font-medium">{repo.full_name}</p>
                    <p className="mt-1 text-xs text-foreground/58">
                      default: {repo.default_branch ?? "n/a"}
                    </p>
                  </div>
                  <span className="rounded-sm bg-surface-muted px-2 py-1 text-xs text-foreground/64">
                    {repo.private ? "private" : "public"}
                  </span>
                </article>
              ))
            ) : (
              <p className="p-5 text-sm text-foreground/58">
                {providerCopy.github.repositoriesEmpty}
              </p>
            )}
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

      <section className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-medium">{providerCopy.common.testSuite}</h2>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          {tests.map((test) => (
            <article key={test.checkLogic} className="border-b border-border p-4 hover:bg-bg-hover md:odd:border-r">
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
    </section>
  );
}
