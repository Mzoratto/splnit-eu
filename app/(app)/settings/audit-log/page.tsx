import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { Download, Filter, ScrollText } from "lucide-react";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import {
  listAuditLogs,
  MAX_AUDIT_LOG_EXPORT_LIMIT,
} from "@/lib/db/queries/audit-logs";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";

type SearchParams = {
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
};

const actionOptions = [
  "control.status_changed",
  "evidence.uploaded",
  "policy.generated",
  "integration.connected",
  "integration.disconnected",
  "user.invited",
  "consultant_client.linked",
];

const entityTypeOptions = [
  "control",
  "evidence",
  "policy",
  "integration",
  "consultant_client",
];

type AuditLogCopy = ReturnType<typeof getMessagesForLocale>["auditLogPage"];

function formatDateTime(
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

function formatMetadata(
  metadata: Record<string, unknown> | null | undefined,
  emptyLabel: string,
) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return emptyLabel;
  }

  return Object.entries(metadata)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(", ");
}

function buildExportHref(filters: SearchParams) {
  const params = new URLSearchParams();

  if (filters.action) {
    params.set("action", filters.action);
  }

  if (filters.entityType) {
    params.set("entityType", filters.entityType);
  }

  if (filters.from) {
    params.set("from", filters.from);
  }

  if (filters.to) {
    params.set("to", filters.to);
  }

  params.set("limit", String(MAX_AUDIT_LOG_EXPORT_LIMIT));

  const query = params.toString();
  return query ? `/api/audit-log/export?${query}` : "/api/audit-log/export";
}

function parseDateFilter(value: string | undefined, boundary: "start" | "end") {
  if (!value) {
    return undefined;
  }

  const normalized =
    boundary === "start" ? `${value}T00:00:00.000Z` : `${value}T23:59:59.999Z`;
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

async function loadAuditLogs(filters: SearchParams) {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return {
      organisationLocale: null,
      rows: [],
    };
  }

  const session = await auth();

  if (!session.orgId) {
    return {
      organisationLocale: null,
      rows: [],
    };
  }

  try {
    const [organisation, rows] = await Promise.all([
      getOrganisationByClerkOrgId(session.orgId).catch(() => null),
      listAuditLogs({
        action: filters.action,
        clerkOrgId: session.orgId,
        entityType: filters.entityType,
        from: parseDateFilter(filters.from, "start"),
        limit: 100,
        to: parseDateFilter(filters.to, "end"),
      }),
    ]);

    return {
      organisationLocale: organisation?.locale ?? null,
      rows,
    };
  } catch {
    return {
      organisationLocale: null,
      rows: [],
    };
  }
}

function actionLabel(action: string, copy: AuditLogCopy) {
  return copy.actions[action as keyof typeof copy.actions] ?? action;
}

function entityTypeLabel(entityType: string, copy: AuditLogCopy) {
  return copy.entityTypes[entityType as keyof typeof copy.entityTypes] ?? entityType;
}

export default async function AuditLogSettingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const filters = await searchParams;
  const data = await loadAuditLogs(filters);
  const locale = normalizeLocale(data.organisationLocale) ?? requestLocale;
  const copy = getMessagesForLocale(locale).auditLogPage;
  const rows = data.rows;
  const exportHref = buildExportHref(filters);

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            {copy.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            {copy.title}
          </h1>
          <p className="mt-3 text-base leading-7 text-foreground/68">
            {copy.subtitle}
          </p>
        </div>
        <Link
          href={exportHref}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
        >
          {copy.exportCsv}
          <Download className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <form className="rounded-lg border border-border bg-surface p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">{copy.filters.title}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_160px_160px_auto]">
          <label className="grid gap-2 text-sm">
            {copy.filters.action}
            <select
              name="action"
              defaultValue={filters.action ?? ""}
              className="rounded-md border border-border bg-background px-3 py-2"
            >
              <option value="">{copy.filters.all}</option>
              {actionOptions.map((action) => (
                <option key={action} value={action}>
                  {actionLabel(action, copy)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            {copy.filters.entity}
            <select
              name="entityType"
              defaultValue={filters.entityType ?? ""}
              className="rounded-md border border-border bg-background px-3 py-2"
            >
              <option value="">{copy.filters.all}</option>
              {entityTypeOptions.map((entityType) => (
                <option key={entityType} value={entityType}>
                  {entityTypeLabel(entityType, copy)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            {copy.filters.from}
            <input
              type="date"
              name="from"
              defaultValue={filters.from ?? ""}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm">
            {copy.filters.to}
            <input
              type="date"
              name="to"
              defaultValue={filters.to ?? ""}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground md:w-auto"
            >
              {copy.filters.apply}
              <Filter className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>

      <section className="rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between gap-4 border-b border-border p-5">
          <div className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">{copy.records.title}</h2>
          </div>
          <span className="rounded-md bg-surface-muted px-2 py-1 text-xs text-foreground/64">
            {rows.length}
          </span>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-[0.12em] text-foreground/54">
              <tr>
                <th className="px-5 py-3 font-medium">{copy.records.time}</th>
                <th className="px-5 py-3 font-medium">{copy.records.action}</th>
                <th className="px-5 py-3 font-medium">{copy.records.entity}</th>
                <th className="px-5 py-3 font-medium">{copy.records.user}</th>
                <th className="px-5 py-3 font-medium">{copy.records.metadata}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-foreground/64">
                    {formatDateTime(row.createdAt, locale, copy.noDate)}
                  </td>
                  <td className="px-5 py-4 font-medium">
                    {actionLabel(row.action, copy)}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-md bg-surface-muted px-2 py-1 text-xs">
                      {entityTypeLabel(row.entityType, copy)}
                    </span>
                  </td>
                  <td className="max-w-[180px] truncate px-5 py-4 font-mono text-xs text-foreground/64">
                    {row.clerkUserId ?? "system"}
                  </td>
                  <td className="max-w-[320px] truncate px-5 py-4 text-foreground/64">
                    {formatMetadata(row.metadata, copy.noMetadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-border md:hidden">
          {rows.map((row) => (
            <article key={row.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">{actionLabel(row.action, copy)}</h3>
                  <p className="mt-1 font-mono text-xs text-foreground/58">
                    {formatDateTime(row.createdAt, locale, copy.noDate)}
                  </p>
                </div>
                <span className="rounded-md bg-surface-muted px-2 py-1 text-xs">
                  {entityTypeLabel(row.entityType, copy)}
                </span>
              </div>
              <p className="mt-3 text-sm text-foreground/64">
                {formatMetadata(row.metadata, copy.noMetadata)}
              </p>
              <p className="mt-3 truncate font-mono text-xs text-foreground/50">
                {row.clerkUserId ?? "system"}
              </p>
            </article>
          ))}
        </div>

        {rows.length === 0 ? (
          <p className="border-t border-border p-5 text-sm text-foreground/58">
            {copy.records.empty}
          </p>
        ) : null}
      </section>
    </section>
  );
}
