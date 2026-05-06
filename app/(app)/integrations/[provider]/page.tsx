import Link from "next/link";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleDashed, PlugZap, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale } from "@/i18n/routing";

type PlannedProvider = {
  description: string;
  name: string;
  plannedChecks: string[];
};

export default async function IntegrationDetailPage({
  params,
}: {
  params: Promise<{ provider: string }>;
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
  const plannedProvider = plannedProviders[provider];

  if (!plannedProvider) {
    notFound();
  }

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
