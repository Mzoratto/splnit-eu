import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import {
  CheckCircle2,
  Cloud,
  KeyRound,
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
import { getAwsCloudFormationTemplate } from "@/lib/integrations/aws/cloudformation";
import {
  type AwsIntegrationConfig,
  getAwsExternalId,
  getAwsRegion,
} from "@/lib/integrations/aws/client";
import { AWS_TEST_DEFINITIONS } from "@/lib/integrations/aws/test-definitions";
import { disconnectIntegrationAction } from "../actions";
import { connectAwsIntegrationAction } from "./actions";

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

async function loadAwsData() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured) {
    return {
      canMutate: false,
      detail: null,
      externalId: "splnit-preview",
      organisationLocale: null,
    };
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      canMutate: false,
      detail: null,
      externalId: "splnit-preview",
      organisationLocale: null,
    };
  }

  const [detail, organisation] = hasDatabaseUrl()
    ? await Promise.all([
        getIntegrationDetail({
          clerkOrgId: session.orgId,
          provider: "aws",
        }).catch(() => null),
        getOrganisationByClerkOrgId(session.orgId).catch(() => null),
      ])
    : [null, null];

  return {
    canMutate: true,
    detail,
    externalId: getAwsExternalId(session.orgId),
    organisationLocale: organisation?.locale ?? null,
  };
}

export default async function AwsIntegrationPage() {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const { canMutate, detail, externalId, organisationLocale } = await loadAwsData();
  const locale = normalizeLocale(organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).integrations;
  const providerCopy = copy.providerPages;
  const integration = detail?.integration ?? null;
  const runs = detail?.runs ?? [];
  const tests = detail?.tests.length ? detail.tests : AWS_TEST_DEFINITIONS;
  const connected = integration?.status === "connected";
  const connectionStatus = statusMeta(integration?.status, providerCopy.common);
  const config = (integration?.config ?? {}) as AwsIntegrationConfig;
  const selectedExternalId = config.externalId ?? externalId;
  const selectedRegion = getAwsRegion(config);
  const template = getAwsCloudFormationTemplate(selectedExternalId);

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="AWS SecurityAudit"
        title={providerCopy.aws.title}
        subtitle={providerCopy.aws.subtitle}
        actions={
          connected ? (
            <form action={disconnectIntegrationAction.bind(null, "aws")}>
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
              <Cloud className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            )}
            <h2 className="text-lg font-medium">{providerCopy.common.status}</h2>
          </div>
          <div className="mt-4">
            <StatusPill tone={connectionStatus.tone}>
              {connectionStatus.label}
            </StatusPill>
          </div>
          <p className="mt-2 text-sm text-foreground/58">
            {config.accountId ?? providerCopy.aws.accountMissing} · {selectedRegion}
          </p>
        </article>
        <article className="card">
          <div className="flex items-center gap-2">
            <ServerCog className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
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
            {providerCopy.aws.testsBody}
          </p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="card">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
            <h2 className="text-lg font-medium">{providerCopy.aws.connectRole}</h2>
          </div>
          <form action={connectAwsIntegrationAction} className="mt-5 space-y-4">
            <label className="grid gap-2 text-xs font-medium text-foreground/68">
              Role ARN
              <input
                name="roleArn"
                defaultValue={config.roleArn ?? ""}
                disabled={!canMutate}
                placeholder="arn:aws:iam::123456789012:role/splnit-security-audit"
                className="h-9 rounded-md border border-border-default bg-[var(--bg-input)] px-3 font-mono text-sm text-foreground"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-xs font-medium text-foreground/68">
                External ID
                <input
                  name="externalId"
                  defaultValue={selectedExternalId}
                  disabled={!canMutate}
                  className="h-9 rounded-md border border-border-default bg-[var(--bg-input)] px-3 font-mono text-sm text-foreground"
                />
              </label>
              <label className="grid gap-2 text-xs font-medium text-foreground/68">
                Region
                <input
                  name="region"
                  defaultValue={selectedRegion}
                  disabled={!canMutate}
                  className="h-9 rounded-md border border-border-default bg-[var(--bg-input)] px-3 font-mono text-sm text-foreground"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={!canMutate}
              className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {connected ? providerCopy.aws.updateRole : providerCopy.aws.connectRoleAction}
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-medium">CloudFormation</h2>
          </div>
          <pre className="max-h-[420px] overflow-auto bg-background p-5 font-mono text-xs leading-5 text-foreground/70">
            <code>{template}</code>
          </pre>
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
