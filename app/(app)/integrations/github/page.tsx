import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, CheckCircle2, GitBranch, ShieldAlert } from "lucide-react";
import { hasDatabaseUrl } from "@/lib/db";
import { getIntegrationDetail } from "@/lib/db/queries/integrations";
import {
  getGitHubAppInstallUrl,
  hasGitHubAppConfig,
  listGitHubInstallationRepositories,
} from "@/lib/integrations/github/app";
import { GITHUB_TEST_DEFINITIONS } from "@/lib/integrations/github/test-definitions";

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "nikdy";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

async function loadGitHubData() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured) {
    return {
      detail: null,
      installUrl: null,
      repositories: [],
    };
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      detail: null,
      installUrl: null,
      repositories: [],
    };
  }

  const detail = hasDatabaseUrl()
    ? await getIntegrationDetail({
        clerkOrgId: session.orgId,
        provider: "github",
      }).catch(() => null)
    : null;
  const repositories = detail?.integration
    ? await listGitHubInstallationRepositories(detail.integration).catch(() => [])
    : [];

  return {
    detail,
    installUrl: hasGitHubAppConfig() ? getGitHubAppInstallUrl(session.orgId) : null,
    repositories,
  };
}

export default async function GitHubIntegrationPage() {
  const { detail, installUrl, repositories } = await loadGitHubData();
  const integration = detail?.integration ?? null;
  const runs = detail?.runs ?? [];
  const tests = detail?.tests.length ? detail.tests : GITHUB_TEST_DEFINITIONS;
  const connected = integration?.status === "connected";
  const config = (integration?.config ?? {}) as {
    accountType?: string | null;
    owner?: string | null;
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            GitHub App
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            GitHub integrace
          </h1>
          <p className="mt-3 text-base leading-7 text-foreground/68">
            Read-only GitHub App kontroluje 2FA, branch protection, secret scanning, dependency alerts a code scanning.
          </p>
        </div>
        {installUrl ? (
          <Link
            href={installUrl}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
          >
            {connected ? "Upravit instalaci" : "Instalovat GitHub App"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground opacity-50"
          >
            Instalovat GitHub App
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            {connected ? (
              <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
            ) : (
              <GitBranch className="h-5 w-5 text-primary" aria-hidden="true" />
            )}
            <h2 className="text-lg font-semibold">Stav</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">
            {integration?.status ?? "not_connected"}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            {config.owner ?? "bez instalace"} · {config.accountType ?? "unknown"}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Repozitáře</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">
            {repositories.length}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            Poslední sync {formatDate(integration?.lastSyncedAt)}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Automatické testy</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">{tests.length}</p>
          <p className="mt-2 text-sm text-foreground/58">
            Mapované na MFA, code review, secrets a dependency kontroly.
          </p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold">Repo list</h2>
          </div>
          <div className="divide-y divide-border">
            {repositories.length > 0 ? (
              repositories.slice(0, 20).map((repo) => (
                <article
                  key={repo.full_name}
                  className="grid gap-3 p-5 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-medium">{repo.full_name}</p>
                    <p className="mt-1 text-sm text-foreground/58">
                      default: {repo.default_branch ?? "n/a"}
                    </p>
                  </div>
                  <span className="rounded-md bg-surface-muted px-2 py-1 text-xs text-foreground/64">
                    {repo.private ? "private" : "public"}
                  </span>
                </article>
              ))
            ) : (
              <p className="p-5 text-sm text-foreground/58">
                Repozitáře se zobrazí po instalaci GitHub App.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold">Výsledky běhů</h2>
          </div>
          <div className="divide-y divide-border">
            {runs.length > 0 ? (
              runs.map((run) => (
                <article key={`${run.testName}-${run.ranAt}`} className="p-5">
                  <div className="flex flex-col justify-between gap-2 md:flex-row">
                    <div>
                      <p className="font-medium">{run.testName}</p>
                      <p className="mt-1 text-sm text-foreground/58">
                        {formatDate(run.ranAt)}
                      </p>
                    </div>
                    <span className="rounded-md bg-surface-muted px-2 py-1 text-xs text-foreground/64">
                      {run.status}
                    </span>
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
                Výsledky se zobrazí po prvním běhu runneru.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-semibold">Test suite</h2>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          {tests.map((test) => (
            <article key={test.checkLogic} className="border-b border-border p-5 md:odd:border-r">
              <p className="font-medium">{test.name}</p>
              <p className="mt-1 text-sm text-foreground/58">{test.checkLogic}</p>
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
