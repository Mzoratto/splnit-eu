import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, CheckCircle2, Clock3, Plug, ShieldAlert } from "lucide-react";
import { hasDatabaseUrl } from "@/lib/db";
import { getIntegrationDetail } from "@/lib/db/queries/integrations";
import { getMicrosoft365AuthUrl } from "@/lib/integrations/microsoft365/oauth";
import { MICROSOFT365_TEST_DEFINITIONS } from "@/lib/integrations/microsoft365/test-definitions";

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "nikdy";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function loadMicrosoft365Data() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured) {
    return {
      authUrl: null,
      detail: null,
    };
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      authUrl: null,
      detail: null,
    };
  }

  const redirectUri = `${getAppUrl()}/api/integrations/microsoft/callback`;
  const authUrl =
    process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET
      ? getMicrosoft365AuthUrl(session.orgId, redirectUri)
      : null;
  const detail = hasDatabaseUrl()
    ? await getIntegrationDetail({
        clerkOrgId: session.orgId,
        provider: "microsoft365",
      }).catch(() => null)
    : null;

  return {
    authUrl,
    detail,
  };
}

export default async function Microsoft365IntegrationPage() {
  const { authUrl, detail } = await loadMicrosoft365Data();
  const integration = detail?.integration ?? null;
  const runs = detail?.runs ?? [];
  const tests = detail?.tests.length ? detail.tests : MICROSOFT365_TEST_DEFINITIONS;
  const connected = integration?.status === "connected";

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Microsoft Graph
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Microsoft 365 integrace
          </h1>
          <p className="mt-3 text-base leading-7 text-foreground/68">
            OAuth připojení spouští kontroly MFA, Conditional Access, hostů, privilegovaných rolí, sensitivity labels a školení.
          </p>
        </div>
        {authUrl ? (
          <Link
            href={authUrl}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
          >
            {connected ? "Znovu připojit" : "Připojit Microsoft 365"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground opacity-50"
          >
            Připojit Microsoft 365
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
              <Plug className="h-5 w-5 text-primary" aria-hidden="true" />
            )}
            <h2 className="text-lg font-semibold">Stav</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">
            {integration?.status ?? "not_connected"}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            Token expiruje {formatDate(integration?.tokenExpiresAt)}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Poslední sync</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">
            {formatDate(integration?.lastSyncedAt)}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            {integration?.lastErrorMsg ?? "Bez poslední chyby"}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Automatické testy</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">{tests.length}</p>
          <p className="mt-2 text-sm text-foreground/58">
            Mapované na NIS2, ISO 27001 a GDPR kontroly.
          </p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold">Test suite</h2>
          </div>
          <div className="divide-y divide-border">
            {tests.map((test) => (
              <article key={test.checkLogic} className="p-5">
                <p className="font-medium">{test.name}</p>
                <p className="mt-1 text-sm text-foreground/58">
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
    </section>
  );
}
