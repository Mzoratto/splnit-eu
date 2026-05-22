import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import {
  ArrowRight,
  BriefcaseBusiness,
  Filter,
  MessageSquareText,
  Settings,
} from "lucide-react";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import {
  listAgencyClients,
  requireAgencyConsultant,
  type AgencyClientListItem,
} from "@/lib/db/queries/agencies";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function parseNumberFilter(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function activityCutoff(value: string | undefined) {
  const now = Date.now();

  if (value === "7d") {
    return new Date(now - 7 * 86_400_000);
  }

  if (value === "30d") {
    return new Date(now - 30 * 86_400_000);
  }

  return null;
}

function filterClients(
  clients: AgencyClientListItem[],
  searchParams: Record<string, string | string[] | undefined>,
) {
  const minScore = parseNumberFilter(getParam(searchParams, "minScore"));
  const maxScore = parseNumberFilter(getParam(searchParams, "maxScore"));
  const minOpenGaps = parseNumberFilter(getParam(searchParams, "minOpenGaps"));
  const activity = getParam(searchParams, "activity");
  const cutoff = activityCutoff(activity);

  return clients.filter((client) => {
    if (minScore !== null && client.score < minScore) {
      return false;
    }

    if (maxScore !== null && client.score > maxScore) {
      return false;
    }

    if (minOpenGaps !== null && client.openGaps < minOpenGaps) {
      return false;
    }

    if (cutoff && (!client.lastActivityAt || client.lastActivityAt < cutoff)) {
      return false;
    }

    if (activity === "stale" && client.lastActivityAt) {
      const staleCutoff = new Date(Date.now() - 30 * 86_400_000);
      return client.lastActivityAt < staleCutoff;
    }

    return true;
  });
}

function formatDate(value: Date | string | null, locale: Locale, emptyLabel: string) {
  if (!value) {
    return emptyLabel;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function AgencyDashboardPage({ searchParams }: PageProps) {
  const session = await auth();
  const membership = await requireAgencyConsultant(session.userId ?? "");
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = getMessagesForLocale(requestLocale).agency.dashboard;
  const clients = await listAgencyClients(membership.agency.id);
  const filteredClients = filterClients(clients, resolvedSearchParams);
  const totalOpenGaps = clients.reduce((total, client) => total + client.openGaps, 0);
  const averageScore = clients.length
    ? Math.round(
        clients.reduce((total, client) => total + client.score, 0) / clients.length,
      )
    : 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
            {copy.eyebrow}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal">
            {copy.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
            {copy.subtitle}
          </p>
        </div>
        <Link href="/agency/settings" className="btn btn-secondary">
          <Settings className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          {copy.settings}
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <article className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-foreground/58">{copy.metrics.clients}</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-primary">
            {clients.length}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-foreground/58">{copy.metrics.openGaps}</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-primary">
            {totalOpenGaps}
          </p>
        </article>
        <article className="rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-foreground/58">{copy.metrics.averageScore}</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-primary">
            {averageScore}%
          </p>
        </article>
      </div>

      <form className="rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" aria-hidden="true" strokeWidth={1.5} />
          <h2 className="font-medium">{copy.filters.title}</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="grid gap-1.5 text-sm">
            {copy.filters.minScore}
            <input
              name="minScore"
              type="number"
              min="0"
              max="100"
              defaultValue={getParam(resolvedSearchParams, "minScore") ?? ""}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            {copy.filters.maxScore}
            <input
              name="maxScore"
              type="number"
              min="0"
              max="100"
              defaultValue={getParam(resolvedSearchParams, "maxScore") ?? ""}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            {copy.filters.minOpenGaps}
            <input
              name="minOpenGaps"
              type="number"
              min="0"
              defaultValue={getParam(resolvedSearchParams, "minOpenGaps") ?? ""}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            {copy.filters.activity}
            <select
              name="activity"
              defaultValue={getParam(resolvedSearchParams, "activity") ?? "all"}
              className="rounded-md border border-border bg-background px-3 py-2"
            >
              <option value="all">{copy.filters.activityOptions.all}</option>
              <option value="7d">{copy.filters.activityOptions.sevenDays}</option>
              <option value="30d">{copy.filters.activityOptions.thirtyDays}</option>
              <option value="stale">{copy.filters.activityOptions.stale}</option>
            </select>
          </label>
        </div>
        <button type="submit" className="btn btn-primary mt-4">
          {copy.filters.apply}
        </button>
      </form>

      <section className="rounded-lg border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <BriefcaseBusiness className="h-4 w-4 text-primary" aria-hidden="true" strokeWidth={1.5} />
          <h2 className="font-medium">{copy.clientsTitle}</h2>
        </div>
        <div className="divide-y divide-border">
          {filteredClients.length ? (
            filteredClients.map((client) => (
              <Link
                key={client.clientOrgId}
                href={`/agency/clients/${client.clientOrgId}`}
                className="grid gap-4 p-4 hover:bg-surface-muted md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{client.name}</h3>
                    <span className="rounded-sm bg-surface-muted px-2 py-1 text-xs text-foreground/58">
                      {client.country}
                    </span>
                    {client.sector ? (
                      <span className="rounded-sm bg-surface-muted px-2 py-1 text-xs text-foreground/58">
                        {client.sector}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-foreground/58">
                    {copy.lastActivity}:{" "}
                    {formatDate(client.lastActivityAt, requestLocale, copy.never)}
                  </p>
                </div>
                <div className="flex items-center gap-3 md:justify-end">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-muted px-2.5 py-1.5 text-sm">
                    <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
                    {copy.openGaps.replace("{count}", String(client.openGaps))}
                  </span>
                  <span className="font-mono text-2xl font-semibold text-primary">
                    {client.score}%
                  </span>
                  <ArrowRight className="h-4 w-4 text-foreground/40" aria-hidden="true" />
                </div>
              </Link>
            ))
          ) : (
            <p className="p-4 text-sm text-foreground/58">{copy.empty}</p>
          )}
        </div>
      </section>
    </section>
  );
}
