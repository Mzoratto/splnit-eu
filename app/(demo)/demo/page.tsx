import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Factory,
  Plug,
  ShieldCheck,
} from "lucide-react";

import { AnimatedScoreRing } from "@/components/app/animated-score-ring";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import {
  DEMO_ORG,
  DEMO_PRIORITY_GAPS,
  DEMO_SCORE,
  type DemoControlStatus,
} from "@/lib/demo/data";

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

export default function DemoDashboardPage() {
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Live demo"
        title={DEMO_ORG.name}
        subtitle={`${DEMO_ORG.sector} · ${DEMO_ORG.employees} zaměstnanců · IČO ${DEMO_ORG.ico}`}
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-primary">
                  Stav kybernetické bezpečnosti
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {DEMO_SCORE.overall}% celková shoda
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
                  Firma je tři měsíce po registraci u NÚKIB. Základní
                  odpovědnosti jsou nastartované, ale zálohy Pohody, politika a
                  incidentní postup zatím blokují připravenost.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {DEMO_ORG.tools.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] px-3 py-1 text-xs font-medium text-[var(--status-pass)]"
                  >
                    <Plug className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.7} />
                    {tool}
                  </span>
                ))}
              </div>
            </div>
            <AnimatedScoreRing label="Shoda" locale={DEMO_ORG.locale} score={DEMO_SCORE.overall} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">
                  {DEMO_ORG.daysUntilDeadline} dní do termínu splnění
                </p>
                <p className="mt-1 text-xs text-foreground/58">
                  Termín splnění: {DEMO_ORG.complianceDeadlineLabel}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">
                  {DEMO_SCORE.mandatoryComplete} / {DEMO_SCORE.mandatoryTotal} neopominutelných splněno
                </p>
                <p className="mt-1 text-xs text-foreground/58">
                  § 4 splněno, § 6 částečně, ostatní čekají na doplnění.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-[var(--status-fail)]" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">
                  {DEMO_SCORE.openGaps} mezer k řešení
                </p>
                <p className="mt-1 text-xs text-foreground/58">
                  {DEMO_SCORE.criticalGaps} kritické mezery v povinném minimu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-primary">Prioritní mezery</p>
            <h2 className="mt-1 text-lg font-semibold">
              Co musí Kovárna Novák vyřešit jako první
            </h2>
          </div>
          <Link href="/demo/controls?filter=gaps" className="btn btn-secondary">
            Zobrazit všechny mezery
            <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {DEMO_PRIORITY_GAPS.map((control) => (
            <article
              key={control.controlKey}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-sm border border-border px-2 py-1 font-mono text-xs text-foreground/58">
                  {control.reference}
                </span>
                <StatusPill tone={statusTone(control.status)}>
                  {statusLabel(control.status)}
                </StatusPill>
              </div>
              <h3 className="mt-3 text-base font-medium">{control.title}</h3>
              <p className="mt-2 text-sm leading-6 text-foreground/62">
                {control.evidenceSummary}
              </p>
              <Link
                href={`/demo/controls#${encodeURIComponent(control.controlKey)}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80"
              >
                Zobrazit
                <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.6} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-sm sm:p-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-primary text-primary-foreground">
            <Factory className="h-5 w-5" aria-hidden="true" strokeWidth={1.7} />
          </span>
          <h2 className="mt-4 text-xl font-semibold">Jak stojí vaše firma?</h2>
          <p className="mt-2 text-sm leading-6 text-foreground/68">
            Analýza pro Kovárnu Novák trvala 8 minut. Zjistěte stav
            kybernetické bezpečnosti vaší firmy.
          </p>
          <Link
            href="/sign-up?ref=demo"
            className="btn btn-primary mt-5"
            data-demo-cta="dashboard-hero"
          >
            Spustit analýzu zdarma
            <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </section>
  );
}
