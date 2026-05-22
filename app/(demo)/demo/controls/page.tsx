import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import {
  DEMO_CONTROLS,
  DEMO_SCORE,
  type DemoControl,
  type DemoControlStatus,
} from "@/lib/demo/data";

type ControlsFilter = "all" | "gaps" | "mandatory" | "assessable";

function normalizeFilter(value: string | string[] | undefined): ControlsFilter {
  const raw = Array.isArray(value) ? value[0] : value;

  if (raw === "gaps" || raw === "mandatory" || raw === "assessable") {
    return raw;
  }

  return "all";
}

function filterControls(controls: DemoControl[], filter: ControlsFilter) {
  if (filter === "gaps") {
    return controls.filter((control) => control.status === "gap" || control.status === "fail");
  }

  if (filter === "mandatory") {
    return controls.filter((control) => control.tier === "mandatory_minimum");
  }

  if (filter === "assessable") {
    return controls.filter((control) => control.tier === "assessable");
  }

  return controls;
}

function statusTone(status: DemoControlStatus): StatusPillTone {
  if (status === "pass") {
    return "pass";
  }

  if (status === "fail") {
    return "fail";
  }

  if (status === "gap") {
    return "warn";
  }

  return "neutral";
}

function statusLabel(status: DemoControlStatus) {
  const labels: Record<DemoControlStatus, string> = {
    fail: "Nesplněno",
    gap: "Mezera",
    pass: "Splněno",
    pending: "Čeká",
  };

  return labels[status];
}

const filters: Array<{ label: string; value: ControlsFilter }> = [
  { label: "Vše", value: "all" },
  { label: "Mezery", value: "gaps" },
  { label: "Neopominutelné", value: "mandatory" },
  { label: "Vyhodnotitelné", value: "assessable" },
];

export default async function DemoControlsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeFilter = normalizeFilter(resolvedSearchParams.filter);
  const visibleControls = filterControls(DEMO_CONTROLS, activeFilter);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Kontroly ZoKB"
        title="Opatření a mezery"
        subtitle={`${DEMO_SCORE.openGaps} mezer k řešení · ${DEMO_SCORE.mandatoryComplete} / ${DEMO_SCORE.mandatoryTotal} neopominutelných splněno`}
        actions={
          <Link href="/demo/export" className="btn btn-primary">
            <Download className="h-4 w-4" aria-hidden="true" strokeWidth={1.6} />
            PDF export
          </Link>
        }
      />

      <div className="rounded-lg border border-border bg-surface p-3">
        <p className="text-xs font-medium text-foreground/52">Filtr kontrol</p>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Filtr kontrol">
          {filters.map((filter) => {
            const active = filter.value === activeFilter;
            const href =
              filter.value === "all"
                ? "/demo/controls"
                : `/demo/controls?filter=${filter.value}`;

            return (
              <Link
                key={filter.value}
                href={href}
                role="tab"
                aria-selected={active}
                className={
                  active
                    ? "rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                    : "rounded-sm border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/72 hover:text-foreground"
                }
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {visibleControls.map((control) => (
          <article
            key={control.controlKey}
            id={control.controlKey}
            className="scroll-mt-32 rounded-lg border border-border bg-surface p-4"
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-sm border border-border px-2 py-1 font-mono text-xs text-foreground/58">
                    {control.reference}
                  </span>
                  <span className="rounded-sm bg-surface-muted px-2 py-1 text-xs font-medium text-foreground/64">
                    {control.tier === "mandatory_minimum"
                      ? "Neopominutelné"
                      : "Vyhodnotitelné"}
                  </span>
                  <StatusPill tone={statusTone(control.status)}>
                    {statusLabel(control.status)}
                  </StatusPill>
                  {control.source === "api" ? (
                    <span className="rounded-full border border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--status-pass)]">
                      {control.sourceLabel ?? "Ověřeno automaticky"}
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-3 text-lg font-medium">{control.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground/64">
                  {control.evidenceSummary}
                </p>
              </div>
              <Link
                href={
                  control.controlKey.startsWith("pohoda")
                    ? "/demo/workspaces/pohoda"
                    : control.controlKey.startsWith("hetzner")
                      ? "/demo/workspaces/hetzner"
                      : `/demo/controls#${encodeURIComponent(control.controlKey)}`
                }
                className="btn btn-secondary justify-center lg:w-36"
              >
                Zobrazit
                <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
