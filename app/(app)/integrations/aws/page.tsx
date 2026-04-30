import { auth } from "@clerk/nextjs/server";
import {
  CheckCircle2,
  Cloud,
  KeyRound,
  ServerCog,
  ShieldAlert,
} from "lucide-react";
import { hasDatabaseUrl } from "@/lib/db";
import { getIntegrationDetail } from "@/lib/db/queries/integrations";
import { getAwsCloudFormationTemplate } from "@/lib/integrations/aws/cloudformation";
import {
  type AwsIntegrationConfig,
  getAwsExternalId,
  getAwsRegion,
} from "@/lib/integrations/aws/client";
import { AWS_TEST_DEFINITIONS } from "@/lib/integrations/aws/test-definitions";
import { connectAwsIntegrationAction } from "./actions";

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "nikdy";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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
    };
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      canMutate: false,
      detail: null,
      externalId: "splnit-preview",
    };
  }

  const detail = hasDatabaseUrl()
    ? await getIntegrationDetail({
        clerkOrgId: session.orgId,
        provider: "aws",
      }).catch(() => null)
    : null;

  return {
    canMutate: true,
    detail,
    externalId: getAwsExternalId(session.orgId),
  };
}

export default async function AwsIntegrationPage() {
  const { canMutate, detail, externalId } = await loadAwsData();
  const integration = detail?.integration ?? null;
  const runs = detail?.runs ?? [];
  const tests = detail?.tests.length ? detail.tests : AWS_TEST_DEFINITIONS;
  const connected = integration?.status === "connected";
  const config = (integration?.config ?? {}) as AwsIntegrationConfig;
  const selectedExternalId = config.externalId ?? externalId;
  const selectedRegion = getAwsRegion(config);
  const template = getAwsCloudFormationTemplate(selectedExternalId);

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            AWS SecurityAudit
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            AWS integrace
          </h1>
          <p className="mt-3 text-base leading-7 text-foreground/68">
            Cross-account read-only role kontroluje CloudTrail, S3 šifrování, IAM MFA, root MFA a VPC Flow Logs.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            {connected ? (
              <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
            ) : (
              <Cloud className="h-5 w-5 text-primary" aria-hidden="true" />
            )}
            <h2 className="text-lg font-semibold">Stav</h2>
          </div>
          <p className="mt-4 font-mono text-2xl font-semibold">
            {integration?.status ?? "not_connected"}
          </p>
          <p className="mt-2 text-sm text-foreground/58">
            {config.accountId ?? "bez AWS účtu"} · {selectedRegion}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <ServerCog className="h-5 w-5 text-primary" aria-hidden="true" />
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
            Mapované na audit logy, šifrování, MFA a monitoring sítě.
          </p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Připojit roli</h2>
          </div>
          <form action={connectAwsIntegrationAction} className="mt-5 space-y-4">
            <label className="grid gap-2 text-sm">
              Role ARN
              <input
                name="roleArn"
                defaultValue={config.roleArn ?? ""}
                disabled={!canMutate}
                placeholder="arn:aws:iam::123456789012:role/splnit-security-audit"
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                External ID
                <input
                  name="externalId"
                  defaultValue={selectedExternalId}
                  disabled={!canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
              <label className="grid gap-2 text-sm">
                Region
                <input
                  name="region"
                  defaultValue={selectedRegion}
                  disabled={!canMutate}
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={!canMutate}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Validovat a uložit
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold">CloudFormation</h2>
          </div>
          <pre className="max-h-[420px] overflow-auto p-5 text-xs leading-5 text-foreground/70">
            <code>{template}</code>
          </pre>
        </section>
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
