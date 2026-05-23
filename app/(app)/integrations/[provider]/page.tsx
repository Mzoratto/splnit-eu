import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  KeyRound,
  PlugZap,
  ServerCog,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { getIntegrationDetail } from "@/lib/db/queries/integrations";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { HETZNER_TEST_DEFINITIONS } from "@/lib/integrations/hetzner/test-definitions";
import { OVHCLOUD_TEST_DEFINITIONS } from "@/lib/integrations/ovhcloud/test-definitions";
import { disconnectIntegrationAction } from "../actions";
import { connectApiKeyIntegrationAction } from "./actions";

type PlannedProvider = {
  description: string;
  name: string;
  plannedChecks: string[];
};

type ApiKeyProviderKey = "hetzner" | "ovhcloud";
type ProviderCopy = ReturnType<typeof getMessagesForLocale>["integrations"]["providerPages"];
type CommonCopy = ProviderCopy["common"];
type IntegrationDetail = Awaited<ReturnType<typeof getIntegrationDetail>>;
type ApiKeyField = {
  autoComplete: string;
  label: string;
  name: string;
  required?: boolean;
  type: "password" | "text";
};
type TestDefinition = {
  checkLogic: string;
  name: string;
  passCriteria?: string | null;
};

const apiKeyProviderKeys = ["hetzner", "ovhcloud"] as const;

function isApiKeyProviderKey(provider: string): provider is ApiKeyProviderKey {
  return apiKeyProviderKeys.includes(provider as ApiKeyProviderKey);
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
  status: string | null | undefined,
  labels: CommonCopy,
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

  if (
    status === "invalid_key" ||
    status === "insufficient_scope" ||
    status === "unreachable" ||
    status === "error"
  ) {
    return { label: labels.statusActionNeeded, tone: "fail" };
  }

  if (status === "manual_review" || status === "warning") {
    return { label: "WARN", tone: "warn" };
  }

  if (status === "fail") {
    return { label: "FAIL", tone: "fail" };
  }

  return { label: labels.statusNotConnected, tone: "neutral" };
}

function getQueryValue(
  query: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = query[key];
  return Array.isArray(value) ? value[0] : value ?? null;
}

function hasExpectedCredential(provider: ApiKeyProviderKey, config: unknown) {
  const value = typeof config === "object" && config !== null
    ? (config as Record<string, unknown>).credentialType
    : null;

  return provider === "hetzner"
    ? value === "api_key"
    : value === "ovhcloud_three_part";
}

function apiKeyProviderMeta(provider: ApiKeyProviderKey, copy: ProviderCopy) {
  if (provider === "hetzner") {
    return {
      accountConnected: copy.hetzner.apiKeyConnected,
      accountMissing: copy.hetzner.accountMissing,
      connectAction: copy.hetzner.connectApiKeyAction,
      connectTitle: copy.hetzner.connectApiKey,
      errors: copy.hetzner.errors,
      eyebrow: "Hetzner Cloud API",
      fields: [
        {
          autoComplete: "off",
          label: copy.hetzner.apiKey,
          name: "apiKey",
          type: "password",
        },
      ] as ApiKeyField[],
      permissions: [
        "Read-only project API token",
        "GET /servers",
        "GET /firewalls",
        "GET /images?type=snapshot",
      ],
      permissionsBody: copy.hetzner.permissionsBody,
      permissionsTitle: copy.hetzner.permissionsTitle,
      rotateAction: copy.hetzner.rotateApiKey,
      subtitle: copy.hetzner.subtitle,
      testDefinitions: HETZNER_TEST_DEFINITIONS,
      testsBody: copy.hetzner.testsBody,
      title: copy.hetzner.title,
    };
  }

  return {
    accountConnected: copy.ovhcloud.apiKeyConnected,
    accountMissing: copy.ovhcloud.accountMissing,
    connectAction: copy.ovhcloud.connectApiKeyAction,
    connectTitle: copy.ovhcloud.connectApiKey,
    errors: copy.ovhcloud.errors,
    eyebrow: "OVHcloud API",
    fields: [
      {
        autoComplete: "off",
        label: copy.ovhcloud.appKey,
        name: "appKey",
        type: "text",
      },
      {
        autoComplete: "new-password",
        label: copy.ovhcloud.appSecret,
        name: "appSecret",
        type: "password",
      },
      {
        autoComplete: "off",
        label: copy.ovhcloud.consumerKey,
        name: "consumerKey",
        type: "password",
      },
      {
        autoComplete: "off",
        label: copy.ovhcloud.serviceName,
        name: "serviceName",
        required: false,
        type: "text",
      },
    ] as ApiKeyField[],
    permissions: [
      "GET /dedicated/server/*",
      "GET /dedicated/server/*/firewall",
      "GET /dedicated/server/*/backupStorage",
    ],
    permissionsBody: copy.ovhcloud.permissionsBody,
    permissionsTitle: copy.ovhcloud.permissionsTitle,
    rotateAction: copy.ovhcloud.rotateApiKey,
    subtitle: copy.ovhcloud.subtitle,
    testDefinitions: OVHCLOUD_TEST_DEFINITIONS,
    testsBody: copy.ovhcloud.testsBody,
    title: copy.ovhcloud.title,
  };
}

async function loadApiKeyData(provider: ApiKeyProviderKey) {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured) {
    return {
      canMutate: false,
      detail: null,
      organisationLocale: null,
    };
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      canMutate: false,
      detail: null,
      organisationLocale: null,
    };
  }

  const [detail, organisation] = hasDatabaseUrl()
    ? await Promise.all([
        getIntegrationDetail({
          clerkOrgId: session.orgId,
          provider,
        }).catch(() => null),
        getOrganisationByClerkOrgId(session.orgId).catch(() => null),
      ])
    : [null, null];

  return {
    canMutate: true,
    detail,
    organisationLocale: organisation?.locale ?? null,
  };
}

async function ApiKeyProviderPage({
  provider,
  query,
}: {
  provider: ApiKeyProviderKey;
  query: Record<string, string | string[] | undefined>;
}) {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const { canMutate, detail, organisationLocale } = await loadApiKeyData(provider);
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).integrations;
  const providerCopy = copy.providerPages;
  const meta = apiKeyProviderMeta(provider, providerCopy);
  const rawIntegration = detail?.integration ?? null;
  const credentialMatches = hasExpectedCredential(provider, rawIntegration?.config);
  const integration = credentialMatches ? rawIntegration : null;
  const connected = integration?.status === "connected";
  const tests: TestDefinition[] = ((credentialMatches && detail?.tests.length)
    ? detail.tests
    : meta.testDefinitions) as TestDefinition[];
  const runs: NonNullable<IntegrationDetail["runs"]> = credentialMatches
    ? detail?.runs ?? []
    : [];
  const connectionStatus = statusMeta(
    credentialMatches ? integration?.status : null,
    providerCopy.common,
  );
  const error = getQueryValue(query, "error");
  const errorMessage =
    error && error in meta.errors
      ? meta.errors[error as keyof typeof meta.errors]
      : null;

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow={meta.eyebrow}
        title={meta.title}
        subtitle={meta.subtitle}
        actions={
          connected ? (
            <form action={disconnectIntegrationAction.bind(null, provider)}>
              <button type="submit" className="btn btn-danger">
                {providerCopy.common.disconnect}
                <XCircle className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              </button>
            </form>
          ) : null
        }
      />

      {!canMutate ? (
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
              <ServerCog className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            )}
            <h2 className="text-lg font-medium">{providerCopy.common.status}</h2>
          </div>
          <div className="mt-4">
            <StatusPill tone={connectionStatus.tone}>
              {connectionStatus.label}
            </StatusPill>
          </div>
          <p className="mt-2 text-sm text-foreground/58">
            {connected ? meta.accountConnected : meta.accountMissing}
          </p>
        </article>
        <article className="card">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
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
            {meta.testsBody}
          </p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="card">
          <div className="flex items-center gap-2">
            <PlugZap className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">{meta.connectTitle}</h2>
          </div>
          <form action={connectApiKeyIntegrationAction} className="mt-5 space-y-4">
            <input type="hidden" name="mode" value={connected ? "rotate" : "connect"} />
            <input type="hidden" name="platform" value={provider} />
            <div className="grid gap-4 md:grid-cols-2">
              {meta.fields.map((field) => (
                <label
                  key={field.name}
                  className="grid gap-2 text-xs font-medium text-foreground/68"
                >
                  {field.label}
                  <input
                    name={field.name}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    disabled={!canMutate}
                    required={field.required ?? true}
                    className="h-9 rounded-md border border-border-default bg-[var(--bg-input)] px-3 font-mono text-sm text-foreground"
                  />
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={!canMutate}
              className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {connected ? meta.rotateAction : meta.connectAction}
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </button>
          </form>
          {errorMessage ? (
            <p className="mt-4 rounded-md border border-[var(--status-fail-border)] bg-[var(--status-fail-subtle)] p-3 text-sm text-[var(--status-fail)]">
              {errorMessage}
            </p>
          ) : null}
        </section>

        <section className="card">
          <h2 className="text-lg font-medium">{meta.permissionsTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-foreground/64">
            {meta.permissionsBody}
          </p>
          <ul className="mt-4 grid gap-2 font-mono text-xs text-foreground/68">
            {meta.permissions.map((permission) => (
              <li
                key={permission}
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                {permission}
              </li>
            ))}
          </ul>
        </section>
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
                {test.passCriteria ? (
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

function PlannedProviderPage({
  copy,
  plannedProvider,
}: {
  copy: ReturnType<typeof getMessagesForLocale>["integrations"];
  plannedProvider: PlannedProvider;
}) {
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow={copy.planned.eyebrow}
        title={plannedProvider.name}
        subtitle={plannedProvider.description}
        actions={
          <Link href="/integrations" className="btn btn-secondary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            {copy.planned.back}
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="card">
          <div className="flex items-center gap-2">
            <CircleDashed className="h-5 w-5 text-foreground/50" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">{copy.planned.statusTitle}</h2>
          </div>
          <div className="mt-4">
            <StatusPill tone="neutral">{copy.index.comingSoon}</StatusPill>
          </div>
          <p className="mt-2 text-sm text-foreground/58">
            {copy.planned.statusBody}
          </p>
        </article>

        <article className="card">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">
              {copy.planned.plannedChecksTitle}
            </h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">
            {plannedProvider.plannedChecks.length}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            {copy.planned.plannedChecksBody}
          </p>
        </article>

        <article className="card">
          <div className="flex items-center gap-2">
            <PlugZap className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">
              {copy.planned.dependencyTitle}
            </h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-medium">
            {copy.planned.dependencyPhase}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            {copy.planned.dependencyBody}
          </p>
        </article>
      </div>

      <section className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h2 className="text-lg font-medium">{copy.planned.scopeTitle}</h2>
        </div>
        <div className="divide-y divide-border">
          {plannedProvider.plannedChecks.map((check) => (
            <article key={check} className="p-5">
              <p className="font-medium">{check}</p>
              <p className="mt-1 text-sm text-foreground/58">
                {copy.planned.scopeItemStatus}
              </p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default async function IntegrationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ provider: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = getMessagesForLocale(locale).integrations;
  const plannedProviders: Record<string, PlannedProvider> = {
    "google-workspace": {
      description: copy.planned.googleWorkspace.description,
      name: "Google Workspace",
      plannedChecks: copy.planned.googleWorkspace.checks,
    },
  };
  const { provider } = await params;

  if (isApiKeyProviderKey(provider)) {
    return (
      <ApiKeyProviderPage
        provider={provider}
        query={searchParams ? await searchParams : {}}
      />
    );
  }

  const plannedProvider = plannedProviders[provider];

  if (!plannedProvider) {
    notFound();
  }

  return <PlannedProviderPage copy={copy} plannedProvider={plannedProvider} />;
}
