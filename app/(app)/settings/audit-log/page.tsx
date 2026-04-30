import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Download, Filter, ScrollText } from "lucide-react";
import { hasDatabaseUrl } from "@/lib/db";
import { listAuditLogs } from "@/lib/db/queries/audit-logs";

type SearchParams = {
  action?: string;
  entityType?: string;
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

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) {
    return "bez data";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMetadata(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return "bez metadat";
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

  const query = params.toString();
  return query ? `/api/audit-log/export?${query}` : "/api/audit-log/export";
}

async function loadAuditLogs(filters: SearchParams) {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return [];
  }

  const session = await auth();

  if (!session.orgId) {
    return [];
  }

  try {
    return listAuditLogs({
      action: filters.action,
      clerkOrgId: session.orgId,
      entityType: filters.entityType,
      limit: 100,
    });
  } catch {
    return [];
  }
}

export default async function AuditLogSettingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = await searchParams;
  const rows = await loadAuditLogs(filters);
  const exportHref = buildExportHref(filters);

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Audit
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Activity log
          </h1>
          <p className="mt-3 text-base leading-7 text-foreground/68">
            Append-only history of compliance actions for the active Clerk organisation.
          </p>
        </div>
        <Link
          href={exportHref}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-medium hover:bg-surface-muted"
        >
          CSV export
          <Download className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <form className="rounded-lg border border-border bg-surface p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Filtry</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <label className="grid gap-2 text-sm">
            Akce
            <select
              name="action"
              defaultValue={filters.action ?? ""}
              className="rounded-md border border-border bg-background px-3 py-2"
            >
              <option value="">Všechny</option>
              {actionOptions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            Entita
            <select
              name="entityType"
              defaultValue={filters.entityType ?? ""}
              className="rounded-md border border-border bg-background px-3 py-2"
            >
              <option value="">Všechny</option>
              {entityTypeOptions.map((entityType) => (
                <option key={entityType} value={entityType}>
                  {entityType}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground md:w-auto"
            >
              Použít
              <Filter className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>

      <section className="rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between gap-4 border-b border-border p-5">
          <div className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Záznamy</h2>
          </div>
          <span className="rounded-md bg-surface-muted px-2 py-1 text-xs text-foreground/64">
            {rows.length}
          </span>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-[0.12em] text-foreground/54">
              <tr>
                <th className="px-5 py-3 font-medium">Čas</th>
                <th className="px-5 py-3 font-medium">Akce</th>
                <th className="px-5 py-3 font-medium">Entita</th>
                <th className="px-5 py-3 font-medium">Uživatel</th>
                <th className="px-5 py-3 font-medium">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-foreground/64">
                    {formatDateTime(row.createdAt)}
                  </td>
                  <td className="px-5 py-4 font-medium">{row.action}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-md bg-surface-muted px-2 py-1 text-xs">
                      {row.entityType}
                    </span>
                  </td>
                  <td className="max-w-[180px] truncate px-5 py-4 font-mono text-xs text-foreground/64">
                    {row.clerkUserId ?? "system"}
                  </td>
                  <td className="max-w-[320px] truncate px-5 py-4 text-foreground/64">
                    {formatMetadata(row.metadata)}
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
                  <h3 className="font-medium">{row.action}</h3>
                  <p className="mt-1 font-mono text-xs text-foreground/58">
                    {formatDateTime(row.createdAt)}
                  </p>
                </div>
                <span className="rounded-md bg-surface-muted px-2 py-1 text-xs">
                  {row.entityType}
                </span>
              </div>
              <p className="mt-3 text-sm text-foreground/64">
                {formatMetadata(row.metadata)}
              </p>
              <p className="mt-3 truncate font-mono text-xs text-foreground/50">
                {row.clerkUserId ?? "system"}
              </p>
            </article>
          ))}
        </div>

        {rows.length === 0 ? (
          <p className="border-t border-border p-5 text-sm text-foreground/58">
            Žádné auditní záznamy neodpovídají aktuálním filtrům.
          </p>
        ) : null}
      </section>
    </section>
  );
}
