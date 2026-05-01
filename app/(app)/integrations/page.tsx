import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Cloud,
  GitBranch,
  MonitorCog,
  PlugZap,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { hasDatabaseUrl } from "@/lib/db";
import { getIntegrationsHubData } from "@/lib/db/queries/integrations";
import { disconnectIntegrationAction } from "./actions";
import { IntegrationStatusRefresh } from "./status-refresh";

const providers = [
  {
    description:
      "MFA, Conditional Access, hosté, privilegované role a sensitivity labels.",
    href: "/integrations/microsoft365",
    icon: MonitorCog,
    key: "microsoft365",
    name: "Microsoft 365",
    planned: false,
    testCount: 6,
  },
  {
    description:
      "Branch protection, secret scanning, 2FA enforcement a dependency alerts.",
    href: "/integrations/github",
    icon: GitBranch,
    key: "github",
    name: "GitHub",
    planned: false,
    testCount: 5,
  },
  {
    description: "CloudTrail, S3 šifrování, IAM MFA, root MFA a VPC Flow Logs.",
    href: "/integrations/aws",
    icon: Cloud,
    key: "aws",
    name: "AWS",
    planned: false,
    testCount: 5,
  },
  {
    description: "Workspace audit logy, sdílení Drive a administrátorské účty.",
    href: "/integrations/google-workspace",
    icon: PlugZap,
    key: "google_workspace",
    name: "Google Workspace",
    planned: true,
    testCount: 0,
  },
];

type HubData = Awaited<ReturnType<typeof getIntegrationsHubData>>;

async function loadHubData() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return null;
  }

  const session = await auth();

  if (!session.orgId) {
    return null;
  }

  return getIntegrationsHubData(session.orgId).catch(() => null);
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "nikdy";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusMeta(status: string): { label: string; tone: StatusPillTone } {
  if (status === "connected") {
    return { label: "PASS", tone: "pass" };
  }

  if (status === "connecting") {
    return { label: "WARN", tone: "warn" };
  }

  if (status === "coming_soon") {
    return { label: "PENDING", tone: "neutral" };
  }

  return { label: "N/A", tone: "neutral" };
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

export default async function IntegrationsPage() {
  const data = await loadHubData();
  const integrationMap = new Map(
    data?.integrations.map((integration) => [
      integration.provider,
      integration,
    ]) ?? [],
  );
  const hasConnecting = data?.integrations.some(
    (integration) => integration.status === "connecting",
  ) ?? false;

  return (
    <section className="space-y-6">
      <IntegrationStatusRefresh enabled={hasConnecting} />
      <PageHeader
        eyebrow="Integrace"
        title="Automatické testy"
        subtitle="Připojené služby dodávají důkazy a aktualizují stavy kontrol."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {providers.map((provider) => {
          const Icon = provider.icon;
          const integration = integrationMap.get(provider.key);
          const rawStatus =
            integration?.status ?? (provider.planned ? "coming_soon" : "available");
          const connected = rawStatus === "connected";
          const providerStatus = statusMeta(rawStatus);
          const breakdown = getRunBreakdown(provider.key, data);
          const testCount = getTestCount(provider.key, provider.testCount, data);

          return (
            <article
              key={provider.key}
              className="card interactive-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <StatusPill tone={providerStatus.tone}>
                    {providerStatus.label}
                  </StatusPill>
                  <h2 className="mt-3 text-lg font-medium">{provider.name}</h2>
                </div>
                {connected ? (
                  <CheckCircle2
                    className="h-5 w-5 text-status-pass"
                    aria-hidden="true"
                    strokeWidth={1.5}
                  />
                ) : provider.planned ? (
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
                {provider.description}
              </p>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-foreground/52">Testy</dt>
                  <dd className="mt-1 font-mono text-lg font-medium">
                    {testCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/52">Poslední sync</dt>
                  <dd className="mt-1 text-xs text-foreground/68">
                    {formatDate(integration?.lastSyncedAt)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 rounded-md bg-surface-muted p-3">
                <p className="text-xs font-medium text-foreground/60">
                  Výsledky za 24h
                </p>
                <div className="mt-2 grid grid-cols-5 gap-2 text-center font-mono text-xs">
                  <span className="rounded-sm bg-background px-1 py-1 text-status-pass">
                    {breakdown.pass}
                  </span>
                  <span className="rounded-sm bg-background px-1 py-1 text-danger">
                    {breakdown.fail}
                  </span>
                  <span className="rounded-sm bg-background px-1 py-1 text-warning">
                    {breakdown.warning}
                  </span>
                  <span className="rounded-sm bg-background px-1 py-1 text-primary">
                    {breakdown.manual_review}
                  </span>
                  <span className="rounded-sm bg-background px-1 py-1 text-foreground/58">
                    {breakdown.error}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {provider.planned ? (
                  <button
                    type="button"
                    disabled
                    className="btn btn-secondary opacity-50"
                  >
                    Připravuje se
                  </button>
                ) : (
                  <Link
                    href={provider.href}
                    className="btn btn-secondary"
                  >
                    {connected ? "Spravovat" : "Připojit"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                  </Link>
                )}
                {connected ? (
                  <form action={disconnectIntegrationAction.bind(null, provider.key)}>
                    <button
                      type="submit"
                      className="btn btn-danger"
                    >
                      Odpojit
                      <XCircle className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                    </button>
                  </form>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
