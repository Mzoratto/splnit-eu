import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, CheckCircle2, GitBranch, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
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

function statusMeta(status: string | null | undefined): {
  label: string;
  tone: StatusPillTone;
} {
  if (status === "connected" || status === "pass") {
    return { label: "PASS", tone: "pass" };
  }

  if (status === "connecting" || status === "manual_review" || status === "warning") {
    return { label: "WARN", tone: "warn" };
  }

  if (status === "error" || status === "fail") {
    return { label: "FAIL", tone: "fail" };
  }

  return { label: "N/A", tone: "neutral" };
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
  const connectionStatus = statusMeta(integration?.status);
  const config = (integration?.config ?? {}) as {
    accountType?: string | null;
    owner?: string | null;
  };

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="GitHub App"
        title="GitHub integrace"
        subtitle="Read-only GitHub App kontroluje 2FA, branch protection, secret scanning, dependency alerts a code scanning."
        actions={
          installUrl ? (
            <Link href={installUrl} className="btn btn-primary">
              {connected ? "Upravit instalaci" : "Instalovat GitHub App"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </Link>
          ) : (
            <button type="button" disabled className="btn btn-primary opacity-50">
              Instalovat GitHub App
              <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </button>
          )
        }
      />

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
            <h2 className="text-lg font-medium">Stav</h2>
          </div>
          <div className="mt-4">
            <StatusPill tone={connectionStatus.tone}>
              {connectionStatus.label}
            </StatusPill>
          </div>
          <p className="mt-2 text-sm text-foreground/58">
            {config.owner ?? "bez instalace"} · {config.accountType ?? "unknown"}
          </p>
        </article>
        <article className="card">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">Repozitáře</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">
            {repositories.length}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            Poslední sync {formatDate(integration?.lastSyncedAt)}
          </p>
        </article>
        <article className="card">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">Automatické testy</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">{tests.length}</p>
          <p className="mt-2 text-sm text-foreground/58">
            Mapované na MFA, code review, secrets a dependency kontroly.
          </p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <section className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-medium">Repozitáře</h2>
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
                Repozitáře se zobrazí po instalaci GitHub App.
              </p>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-medium">Výsledky běhů</h2>
          </div>
          <div className="divide-y divide-border">
            {runs.length > 0 ? (
              runs.map((run) => (
                <article key={`${run.testName}-${run.ranAt}`} className="p-4 hover:bg-bg-hover">
                  <div className="flex flex-col justify-between gap-2 md:flex-row">
                    <div>
                      <p className="font-medium">{run.testName}</p>
                      <p className="mt-1 text-sm text-foreground/58">
                        {formatDate(run.ranAt)}
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
                Výsledky se zobrazí po prvním běhu runneru.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-medium">Test suite</h2>
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
