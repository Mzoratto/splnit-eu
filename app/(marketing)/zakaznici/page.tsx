import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { QualificationForm } from "@/components/marketing/qualification-form";

export const metadata: Metadata = {
  title:
    "Zákazníci | Splnit.eu — Jak české firmy dosahují souladu automaticky",
  description:
    "Příklady českých firem, které používají Splnit.eu pro ISO 27001, NIS2, GDPR a vendor risk.",
  openGraph: {
    locale: "cs_CZ",
  },
};

const personas = [
  {
    icon: "solar:code-square-linear",
    type: "Technologický startup",
    before: "Německý enterprise zákazník požaduje ISO 27001. 3 měsíce práce navíc.",
    after: "ISO 27001 gap analýza za 1 hodinu. Certifikace za 3 týdny.",
    quote: "Konečně jsme mohli uzavřít ten enterprise kontrakt.",
    person: "Jan K., CTO, Praha",
  },
  {
    icon: "solar:settings-linear",
    type: "Výrobní firma",
    before: "NIS2 — nevěděli jsme ani jestli nás to týká.",
    after: "Za 20 minut jsme věděli přesně co musíme udělat a do kdy.",
    quote: "Audit proběhl hladce. Auditor byl příjemně překvapen.",
    person: "Petra M., IT Manager, Brno",
  },
  {
    icon: "solar:users-group-rounded-linear",
    type: "IT poradenská firma",
    before: "10 klientů, 10 tabulek, 10× stejná práce.",
    after: "Jeden dashboard pro všechny klienty. 80 % méně manuální práce.",
    quote: "Přidali jsme compliance jako novou službu bez nových zaměstnanců.",
    person: "Tomáš V., jednatel, Ostrava",
  },
];

const industries = [
  {
    icon: "solar:cpu-linear",
    name: "Technologie a SaaS",
    body: "ISO 27001 pro enterprise sales, GDPR pro uživatelská data, NIS2 pro digitální infrastrukturu.",
  },
  {
    icon: "solar:settings-minimalistic-linear",
    name: "Výroba",
    body: "NIS2 pro průmyslové systémy, GDPR pro zaměstnanecká data, ISO 27001 pro dodavatelský řetězec.",
  },
  {
    icon: "solar:banknote-2-linear",
    name: "Finance",
    body: "DORA pro digitální odolnost, GDPR pro klientská data, NIS2 pro kritickou infrastrukturu.",
  },
  {
    icon: "solar:hospital-linear",
    name: "Zdravotnictví",
    body: "GDPR pro citlivá data pacientů, NIS2 pro zdravotnické systémy, ISO 27001 pro certifikaci.",
  },
];

export default function CustomersPage() {
  return (
    <MarketingShell>
      <main>
        <section data-hero className="px-5 pb-20 pt-32">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-4xl">
              <span className="section-tag mb-5">Zákazníci</span>
              <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-900 md:text-[68px]">
                ISO 27001 za 3 týdny. NIS2 za jeden víkend.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-500">
                Stovky českých firem používají Splnit.eu k automatizaci souladu,
                uzavírání enterprise obchodů a klidnému spánku před auditem.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/sign-up"
                  className="rounded-full bg-blue-600 px-7 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  Zahájit zkušební verzi
                </Link>
                <Link
                  href="mailto:hello@splnit.eu?subject=Reference%20Splnit.eu"
                  className="rounded-full border border-zinc-200 bg-white px-7 py-3 text-center text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50"
                >
                  Mluvit se zákazníkem
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 md:grid-cols-3">
            {personas.map((persona) => (
              <article key={persona.type} className="rounded-[22px] p-px grad-border">
                <div className="flex h-full flex-col rounded-[21px] bg-white p-7">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon icon={persona.icon} className="text-2xl" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {persona.type}
                  </h2>
                  <div className="mt-6 space-y-4 text-sm leading-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Před Splnit.eu
                      </p>
                      <p className="mt-1 text-zinc-600">{persona.before}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                        Po Splnit.eu
                      </p>
                      <p className="mt-1 text-zinc-900">{persona.after}</p>
                    </div>
                  </div>
                  <blockquote className="mt-6 rounded-2xl bg-zinc-50 p-4 text-sm italic leading-6 text-zinc-600">
                    „{persona.quote}“
                    <footer className="mt-3 text-xs not-italic text-zinc-400">
                      {persona.person}
                    </footer>
                  </blockquote>
                  <Link
                    href="/cenik"
                    className="mt-6 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Zobrazit podobný plán →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-zinc-200/50 py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  Fintech
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                  42 zaměstnanců
                </span>
              </div>
              <h2 className="text-4xl font-semibold tracking-[-0.04em] text-zinc-900">
                Jak FinEdge CZ dosáhlo ISO 27001 za 3 týdny
              </h2>
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl bg-zinc-100 p-6">
                  <h3 className="font-semibold text-zinc-900">Před Splnit.eu</h3>
                  <ul className="mt-4 space-y-2 text-sm text-zinc-600">
                    <li>3 konzultanti</li>
                    <li>300 000 Kč poplatky</li>
                    <li>4 měsíce</li>
                    <li>240 hodin ručního sběru důkazů</li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-6">
                  <h3 className="font-semibold text-emerald-900">Po Splnit.eu</h3>
                  <ul className="mt-4 space-y-2 text-sm text-emerald-800">
                    <li>Automatizace 90 % kontrol</li>
                    <li>17 700 Kč/rok</li>
                    <li>3 týdny</li>
                    <li>0 hodin ručního sběru</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="rounded-[28px] bg-zinc-950 p-8 text-white">
              <div className="grid gap-6">
                <Metric value="90%" label="automatizovaných kontrol" />
                <Metric value="3 týdny" label="do certifikace" />
                <Metric value="282 tis. Kč" label="ušetřeno proti konzultantům" />
              </div>
              <blockquote className="mt-8 border-t border-zinc-800 pt-6 text-sm leading-6 text-zinc-300">
                „Splnit.eu nám dalo přesně ten důkazní materiál, který auditor
                chtěl vidět. Bez tabulek a dohledávání screenshotů.“
              </blockquote>
            </div>
          </div>
        </section>

        <section className="bg-zinc-950 py-24">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-10">
              <span className="section-tag mb-5 border-blue-500/30 bg-blue-500/10 text-blue-300">
                Reference
              </span>
              <h2 className="text-4xl font-semibold tracking-[-0.04em] text-white">
                Firmy, které potřebovaly konkrétní výsledek.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                ["ISO 27001 za 3 týdny", "Audit už nebyl projekt na čtvrt roku.", "Marek S.", "SaaS, Praha"],
                ["NIS2 splněno", "Za víkend jsme věděli, kde jsou díry.", "Lucie H.", "Výroba, Brno"],
                ["GDPR audit prošel", "Konečně máme ROPA a dodavatele na jednom místě.", "Petr V.", "Agentura, Ostrava"],
              ].map(([badge, quote, name, role]) => (
                <article
                  key={badge}
                  className="rounded-[24px] border border-zinc-800 bg-zinc-900 p-6"
                >
                  <Icon
                    icon="solar:quote-left-linear"
                    className="mb-5 text-3xl text-zinc-700"
                    aria-hidden="true"
                  />
                  <p className="text-lg font-medium leading-7 text-white">
                    „{quote}“
                  </p>
                  <p className="mt-5 text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-zinc-500">{role}</p>
                  <span className="mt-5 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                    {badge}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-10 max-w-3xl">
              <span className="section-tag mb-5">Podle odvětví</span>
              <h2 className="text-4xl font-semibold tracking-[-0.04em] text-zinc-900">
                Každé odvětví řeší jiné předpisy.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {industries.map((industry) => (
                <article key={industry.name} className="rounded-[22px] p-px grad-border">
                  <div className="h-full rounded-[21px] bg-white p-6">
                    <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon icon={industry.icon} className="text-xl" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-zinc-900">{industry.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {industry.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 py-20">
          <div className="mx-auto max-w-4xl px-5">
            <QualificationForm />
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="mono text-5xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-zinc-400">{label}</p>
    </div>
  );
}
