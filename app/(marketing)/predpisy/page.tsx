import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { LeadCapture } from "@/components/marketing/lead-capture";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { RegulationSelector } from "@/components/marketing/regulation-selector";
import { SoftwareApplicationJsonLd } from "@/components/marketing/software-json-ld";
import { frameworkCards, timeline } from "@/lib/marketing/frameworks";

export const metadata: Metadata = {
  title:
    "EU Předpisy | NIS2, EU AI Act, GDPR, ISO 27001 — přehled povinností pro česká MSP",
  description:
    "Průvodce EU předpisy pro české firmy: NIS2, EU AI Act, GDPR, ISO 27001, CSRD a DORA s termíny, pokutami a kroky k souladu.",
  openGraph: {
    locale: "cs_CZ",
  },
};

export default function RegulationsPage() {
  return (
    <MarketingShell>
      <SoftwareApplicationJsonLd
        pageName="Splnit.eu EU Předpisy"
        path="/predpisy"
        description="Přehled EU předpisů pro české firmy a automatizace souladu v platformě Splnit.eu."
      />
      <main>
        <section data-hero className="px-5 pb-20 pt-32 text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-900 md:text-[68px]">
              Které EU předpisy se vás týkají?
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-500">
              Průvodce všemi EU předpisy, které platí pro česká MSP — s
              konkrétními termíny, pokutami a kroky k souladu.
            </p>
            <RegulationSelector />
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {frameworkCards.map((framework) => (
                <article
                  key={framework.slug}
                  id={framework.slug}
                  className="scroll-animate translate-y-6 rounded-[22px] p-px opacity-0 grad-border"
                >
                  <div className="flex h-full flex-col rounded-[21px] bg-white p-7">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon
                          icon={framework.icon}
                          className="text-2xl"
                          aria-hidden="true"
                        />
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                          framework.status === "Dostupné"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : "border-amber-100 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {framework.status}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-zinc-900">
                      {framework.name}
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
                        {framework.regulator}
                      </span>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                        {framework.deadline}
                      </span>
                    </div>
                    <p className="mt-5 flex-1 text-sm leading-6 text-zinc-500">
                      {framework.description}
                    </p>
                    <Link
                      href={`/predpisy/${framework.slug}`}
                      className="mt-6 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Zjistit více →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-zinc-950 py-24">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-12 text-center">
              <span className="section-tag mb-5 border-blue-500/30 bg-blue-500/10 text-blue-300">
                Regulatorní timeline
              </span>
              <h2 className="text-4xl font-semibold tracking-[-0.04em] text-white">
                Termíny, které nesmíte minout.
              </h2>
            </div>
            <div className="relative grid gap-5 md:grid-cols-5">
              <div className="absolute left-0 right-0 top-10 hidden h-px bg-zinc-800 md:block" />
              {timeline.map((item, index) => (
                <article
                  key={`${item.date}-${item.title}`}
                  className="relative rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                >
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Icon icon={item.icon} aria-hidden="true" />
                  </div>
                  <p className="mono text-xs text-blue-300">{item.date}</p>
                  <h3 className="mt-2 text-sm font-semibold leading-6 text-white">
                    {item.title}
                  </h3>
                  {index === 2 ? (
                    <span className="mt-4 inline-flex rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-300">
                      Aktuální milník
                    </span>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-20">
          <div className="mx-auto max-w-4xl px-5">
            <LeadCapture
              title="Stáhněte si zdarma"
              subtitle="Kompletní přehled povinností, šablony dokumentů a checklist pro každý předpis."
              cta="Stáhnout vše zdarma"
              resources={[
                "NIS2 checklist",
                "EU AI Act přehled",
                "Politika AI (šablona)",
                "Školení AI gramotnosti",
                "Záznam o používání AI",
                "Annex III reference",
              ]}
            />
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
