import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

import { LogoMark } from "@/components/brand/logo-mark";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import {
  DEMO_CONTROLS,
  DEMO_EXPORT,
  DEMO_ORG,
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

export default function DemoExportPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-primary">PDF export demo</p>
          <h1 className="mt-2 text-[22px] font-medium tracking-normal">
            {DEMO_EXPORT.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground/64">
            Náhled první stránky exportu pro fiktivní firmu {DEMO_ORG.name}.
            Skutečný export se vytvoří až po registraci pro vaši organizaci.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
        <div className="mx-auto min-h-[900px] max-w-[794px] bg-white p-8 text-slate-900 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200 sm:p-10">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="flex items-center gap-2">
              <LogoMark className="h-7 w-7" />
              <span className="text-lg font-semibold tracking-tight">
                Splnit.eu
              </span>
            </div>
            <span className="rounded-sm bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              Demo náhled
            </span>
          </div>

          <div className="pt-10">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-teal-700 text-white">
                <FileText className="h-5 w-5" aria-hidden="true" strokeWidth={1.7} />
              </span>
              <div>
                <h2 className="text-3xl font-semibold leading-tight">
                  {DEMO_ORG.name}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  {DEMO_EXPORT.subtitle}
                </p>
              </div>
            </div>

            <dl className="mt-8 grid gap-3 border-y border-slate-200 py-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-slate-500">IČO</dt>
                <dd className="mt-1 text-slate-900">{DEMO_ORG.ico}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Datum vygenerování</dt>
                <dd className="mt-1 text-slate-900">{DEMO_EXPORT.generatedAtLabel}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Režim</dt>
                <dd className="mt-1 text-slate-900">
                  Nižší povinnosti (vyhl. č. 410/2025 Sb.)
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Rozsah</dt>
                <dd className="mt-1 text-slate-900">
                  Pohoda, Hetzner Cloud, Microsoft 365
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              <h3 className="text-lg font-semibold">Souhrn opatření</h3>
              <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Ref.</th>
                      <th className="px-3 py-2 font-semibold">Opatření</th>
                      <th className="px-3 py-2 font-semibold">Stav</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {DEMO_CONTROLS.map((control) => (
                      <tr key={control.controlKey}>
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-500">
                          {control.reference}
                        </td>
                        <td className="px-3 py-2 text-slate-800">{control.title}</td>
                        <td className="px-3 py-2">
                          <StatusPill tone={statusTone(control.status)}>
                            {statusLabel(control.status)}
                          </StatusPill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="relative mt-8 min-h-72 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <div className="space-y-4 p-5 blur-[3px]">
                <div className="h-4 w-2/3 rounded bg-slate-300" />
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-11/12 rounded bg-slate-200" />
                <div className="h-24 rounded border border-slate-200 bg-white" />
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-5/6 rounded bg-slate-200" />
              </div>
              <div className="absolute inset-0 grid place-items-center bg-white/70 px-5 backdrop-blur-[2px]">
                <div className="max-w-sm rounded-lg border border-slate-200 bg-white p-5 text-center shadow-lg">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Exportujte přehled pro vaši firmu
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Vlastní report se vyplní z vašich integrací a doložených
                    opatření.
                  </p>
                  <Link
                    href="/sign-up?ref=demo"
                    className="mt-4 inline-flex items-center gap-2 rounded-md bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
                    data-demo-cta="export-blur"
                  >
                    Vytvořit účet zdarma
                    <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.6} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
