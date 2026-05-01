import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Download, FileText, Filter } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import { hasDatabaseUrl } from "@/lib/db";
import { listEvidenceVault } from "@/lib/db/queries/evidence";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";

type SearchParams = {
  expiry?: string;
  framework?: string;
  status?: string;
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "bez data";
  }

  return new Intl.DateTimeFormat("cs-CZ").format(new Date(value));
}

function getDaysUntil(value: Date | string | null) {
  if (!value) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(value);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function statusTone(status: string | null | undefined): StatusPillTone {
  if (status === "pass") {
    return "pass";
  }

  if (status === "fail") {
    return "fail";
  }

  if (status === "manual_review" || status === "warning") {
    return "warn";
  }

  return "neutral";
}

function statusLabel(status: string | null | undefined) {
  const labels: Record<string, string> = {
    fail: "FAIL",
    manual_review: "WARN",
    pass: "PASS",
    unknown: "PENDING",
    warning: "WARN",
  };

  return labels[status ?? "unknown"] ?? "PENDING";
}

async function loadEvidenceRows() {
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
    return listEvidenceVault(session.orgId);
  } catch {
    return [];
  }
}

export default async function EvidencePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = await searchParams;
  const rows = await loadEvidenceRows();
  const filteredRows = rows.filter((row) => {
    const status = row.status ?? "unknown";
    const frameworkMatch =
      !filters.framework ||
      row.frameworks.some((framework) => framework.frameworkSlug === filters.framework);
    const statusMatch = !filters.status || status === filters.status;
    const daysUntilExpiry = getDaysUntil(row.expiresAt);
    const expiryMatch =
      !filters.expiry ||
      (filters.expiry === "expired" && daysUntilExpiry !== null && daysUntilExpiry < 0) ||
      (filters.expiry === "30" &&
        daysUntilExpiry !== null &&
        daysUntilExpiry >= 0 &&
        daysUntilExpiry <= 30) ||
      (filters.expiry === "none" && daysUntilExpiry === null);

    return frameworkMatch && statusMatch && expiryMatch;
  });

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Evidence"
        title="Evidence vault"
        subtitle="Úložiště manuálních uploadů a automatických snapshotů napojených na kontroly."
      />

      <form className="card">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" aria-hidden="true" strokeWidth={1.5} />
          <h2 className="text-lg font-medium">Filtry</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <label className="grid gap-2 text-xs font-medium text-foreground/68">
            Framework
            <select
              name="framework"
              defaultValue={filters.framework ?? ""}
              className="h-9 rounded-md border border-border-default bg-[var(--bg-input)] px-3 text-sm text-foreground"
            >
              <option value="">Všechny</option>
              {FRAMEWORK_LIBRARY.map((framework) => (
                <option key={framework.slug} value={framework.slug}>
                  {framework.nameCs}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-xs font-medium text-foreground/68">
            Status
            <select
              name="status"
              defaultValue={filters.status ?? ""}
              className="h-9 rounded-md border border-border-default bg-[var(--bg-input)] px-3 text-sm text-foreground"
            >
              <option value="">Všechny</option>
              <option value="pass">Splněno</option>
              <option value="fail">Nesplněno</option>
              <option value="manual_review">Částečně</option>
              <option value="unknown">Neznámé</option>
            </select>
          </label>
          <label className="grid gap-2 text-xs font-medium text-foreground/68">
            Expirace
            <select
              name="expiry"
              defaultValue={filters.expiry ?? ""}
              className="h-9 rounded-md border border-border-default bg-[var(--bg-input)] px-3 text-sm text-foreground"
            >
              <option value="">Vše</option>
              <option value="30">Do 30 dnů</option>
              <option value="expired">Po expiraci</option>
              <option value="none">Bez expirace</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="btn btn-primary w-full"
            >
              Použít filtry
              <Filter className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </form>

      <section className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between gap-4 border-b border-border p-5">
          <h2 className="text-lg font-medium">Záznamy evidence</h2>
          <span className="rounded-sm bg-surface-muted px-2 py-1 font-mono text-xs text-foreground/64">
            {filteredRows.length} / {rows.length}
          </span>
        </div>
        <div className="divide-y divide-border">
          {filteredRows.length > 0 ? (
            filteredRows.map((item) => {
              const daysUntilExpiry = getDaysUntil(item.expiresAt);

              return (
                <article
                  key={item.evidenceId}
                  className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <FileText className="h-4 w-4 text-status-pass" aria-hidden="true" strokeWidth={1.5} />
                      <h3 className="font-mono text-sm font-medium">
                        {item.description ?? item.controlTitle}
                      </h3>
                      <StatusPill tone={statusTone(item.status)}>
                        {statusLabel(item.status)}
                      </StatusPill>
                    </div>
                    <p className="mt-2 text-sm text-foreground/58">
                      {item.controlTitle} · {item.type} · {formatDate(item.collectedAt)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.frameworks.map((framework) => (
                        <span
                          key={`${item.evidenceId}-${framework.frameworkSlug}`}
                          className="rounded-sm bg-[var(--accent-subtle)] px-2 py-1 text-xs text-primary"
                        >
                          {framework.frameworkName}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 lg:items-end">
                    <span className="rounded-md bg-surface-muted px-2 py-1 text-xs text-foreground/64">
                      Expirace {formatDate(item.expiresAt)}
                      {daysUntilExpiry !== null ? ` (${daysUntilExpiry} dnů)` : ""}
                    </span>
                    {item.blobUrl ? (
                      <Link
                        href={`/api/evidence/${item.evidenceId}/download`}
                        className="btn btn-secondary h-8 px-3"
                      >
                        Soubor
                        <Download className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                      </Link>
                    ) : null}
                    <Link
                      href={`/controls/${item.controlKey}`}
                      className="btn btn-secondary h-8 px-3"
                    >
                      Kontrola
                      <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <p className="p-5 text-sm text-foreground/58">
              Žádné záznamy neodpovídají aktuálním filtrům.
            </p>
          )}
        </div>
      </section>
    </section>
  );
}
