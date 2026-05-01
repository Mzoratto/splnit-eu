import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { SoftwareApplicationJsonLd } from "@/components/marketing/software-json-ld";

export const metadata: Metadata = {
  title:
    "Platforma | Splnit.eu — 200+ automatických testů, integrace Microsoft 365 a NÚKIB",
  description:
    "Technická platforma Splnit.eu pro automatické testování kontrol, integrace Microsoft 365, GitHub, AWS a NÚKIB feed.",
  openGraph: {
    locale: "cs_CZ",
  },
};

const steps = [
  {
    icon: "solar:plug-linear",
    title: "Připojte nástroje",
    body: "Microsoft 365, GitHub, AWS nebo Google Workspace. Nastavení za 5 minut.",
  },
  {
    icon: "solar:cpu-linear",
    title: "Testy běží automaticky",
    body: "200+ kontrol každou hodinu. Vy spíte. Systém hlídá.",
  },
  {
    icon: "solar:document-check-linear",
    title: "Dostanete výsledky",
    body: "Dashboard, upozornění na selhání a dokumentace pro auditora — vše na jednom místě.",
  },
];

const evidence = [
  {
    icon: "solar:cloud-download-linear",
    title: "Automatický sběr",
    body: "API snapshoty z každé integrace uloženy jako důkaz.",
  },
  {
    icon: "solar:folder-with-files-linear",
    title: "Manuální nahrávání",
    body: "Nahrajte PDF, screenshoty nebo podepsané záznamy.",
  },
  {
    icon: "solar:calendar-check-linear",
    title: "Hlídání vypršení",
    body: "Upozornění 30 a 7 dní před vypršením platnosti důkazu.",
  },
];

export default function PlatformPage() {
  return (
    <MarketingShell>
      <SoftwareApplicationJsonLd
        pageName="Splnit.eu Platforma"
        path="/platform"
        description="Platforma Splnit.eu automatizuje compliance testy, evidence vault a Trust Center pro NIS2, EU AI Act, GDPR a ISO 27001."
      />
      <main>
        <section data-hero className="bg-white px-5 pb-20 pt-32">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <span className="section-tag mb-5">Developer First</span>
              <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-900 md:text-[68px]">
                200+ automatických testů. Každou hodinu.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-500">
                Připojte Microsoft 365, GitHub nebo AWS jednou. Splnit.eu
                testuje vaše bezpečnostní kontroly nepřetržitě a generuje
                auditní záznamy automaticky.
              </p>
              <Link
                href="mailto:hello@splnit.eu?subject=Demo%20Splnit.eu"
                className="mt-8 inline-flex rounded-full bg-zinc-900 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Rezervovat demo
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <article
                  key={step.title}
                  className="scroll-animate translate-y-6 opacity-0"
                >
                  <div className="mb-5 flex items-center">
                    <div className="z-10 flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-200">
                      {index + 1}
                    </div>
                    {index < steps.length - 1 ? (
                      <div className="mx-3 hidden h-px flex-1 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 md:block" />
                    ) : null}
                  </div>
                  <div className="rounded-[22px] p-px grad-border">
                    <div className="h-full rounded-[21px] bg-white p-7">
                      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon icon={step.icon} className="text-2xl" aria-hidden="true" />
                      </div>
                      <h2 className="mb-2 text-lg font-semibold text-zinc-900">
                        {step.title}
                      </h2>
                      <p className="text-sm leading-6 text-zinc-500">{step.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="integrace" className="overflow-hidden border-t border-zinc-200/50 py-20">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-5 lg:flex-row">
            <div className="scroll-animate w-full -translate-x-6 opacity-0 lg:w-1/2">
              <div className="rounded-[26px] p-px grad-border">
                <div className="overflow-hidden rounded-[25px] bg-zinc-50 p-8">
                  <p className="mono mb-6 text-[11px] font-medium uppercase tracking-widest text-zinc-400">
                    Dostupné integrace
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      ["logos:microsoft", "Microsoft 365"],
                      ["logos:github-icon", "GitHub"],
                      ["logos:aws", "AWS"],
                      ["logos:google-cloud", "Google WS"],
                      ["logos:azure-icon", "Azure"],
                      ["logos:slack-icon", "Slack"],
                    ].map(([icon, label]) => (
                      <div
                        key={label}
                        className="int-item flex cursor-default flex-col items-center gap-2 rounded-xl border border-zinc-100 bg-white p-3.5"
                      >
                        <Icon icon={icon} className="text-2xl" aria-hidden="true" />
                        <span className="text-center text-[10px] font-medium text-zinc-500">
                          {label}
                        </span>
                      </div>
                    ))}
                    <div className="int-item col-span-3 flex cursor-default items-center gap-3 rounded-xl border border-emerald-800/50 bg-emerald-950 p-3.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-900">
                        <Icon
                          icon="solar:shield-network-linear"
                          className="text-lg text-emerald-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-emerald-100">
                            NÚKIB Vulnerability Feed
                          </span>
                          <span className="nukib-chip">🇨🇿 Pouze pro ČR</span>
                        </div>
                        <span className="text-[10px] text-emerald-500">
                          Národní kybernetická bezpečnostní agentura
                        </span>
                      </div>
                      <div className="pulse-dot h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="scroll-animate w-full translate-x-6 opacity-0 lg:w-1/2">
              <span className="section-tag mb-5">Integrace</span>
              <h2 className="mb-5 text-3xl font-semibold leading-[1.1] tracking-[-0.04em] text-zinc-900 lg:text-[44px]">
                Připojte nástroje, které již používáte.
              </h2>
              <p className="mb-7 max-w-lg text-base leading-relaxed text-zinc-500">
                Nevěříme na ruční sběr důkazů. Splnit.eu se nativně připojuje k
                vašim identity providerům, cloudovým hostingům a HR systémům.
              </p>
              <ul className="space-y-3.5">
                {[
                  "Nativní integrace pro Microsoft 365, GitHub a AWS",
                  "Slack a Microsoft Teams upozornění v reálném čase",
                  "NÚKIB feed zranitelností — výlučně pro český trh 🇨🇿",
                  "API-first architektura pro vlastní interní nástroje",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Icon
                      icon="solar:check-circle-linear"
                      className="mt-0.5 shrink-0 text-xl text-blue-600"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-zinc-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-zinc-950 py-24">
          <div className="mx-auto max-w-5xl px-5 text-center">
            <span className="section-tag mb-5 border-blue-500/30 bg-blue-500/10 text-blue-300">
              Křížové mapování
            </span>
            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
              Jeden test. Tři předpisy.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-zinc-400">
              MFA kontrola pro všechny uživatele splňuje NIS2 čl. 21(2)(j), ISO
              27001 A.9.4.2 a GDPR čl. 32(1)(b) najednou. Přidání každého
              dalšího předpisu stojí 20 % původního úsilí.
            </p>
            <div className="mono mx-auto mt-10 max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-left text-sm text-zinc-300">
              <p className="text-blue-300">ctrl_mfa_all_users</p>
              <p className="mt-3 text-emerald-400">✓ NIS2 čl. 21(2)(j)</p>
              <p className="text-emerald-400">✓ ISO 27001 A.9.4.2</p>
              <p className="text-emerald-400">✓ GDPR čl. 32(1)(b)</p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {["80% úspora", "1 test → 3 předpisy", "200+ kontrol"].map((stat) => (
                <div
                  key={stat}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 text-xl font-semibold text-white"
                >
                  {stat}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="monitoring" className="border-t border-zinc-200/50 py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-12 max-w-3xl">
              <span className="section-tag mb-5">Evidence vault</span>
              <h2 className="text-4xl font-semibold tracking-[-0.04em] text-zinc-900">
                Auditní záznamy. Automaticky.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {evidence.map((item) => (
                <article key={item.title} className="rounded-[22px] p-px grad-border">
                  <div className="h-full rounded-[21px] bg-white p-7">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon icon={item.icon} className="text-2xl" aria-hidden="true" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-6 text-zinc-500">{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="trust-center" className="border-t border-zinc-200/50 bg-white py-20">
          <div className="mx-auto max-w-4xl px-5">
            <div className="rounded-[2rem] border border-blue-100 bg-blue-50/40 p-8 md:p-12">
              <h3 className="text-3xl font-semibold tracking-[-0.03em] text-zinc-900">
                Trust Center — zveřejněte svůj soulad.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                Zákazníci a partneři vidí váš compliance status v reálném čase.
                Méně dotazníků. Rychlejší obchody.
              </p>
              <div className="mono mt-6 w-fit rounded-full border border-blue-100 bg-white px-4 py-2 text-xs text-blue-700">
                trust.splnit.eu/acme-sro
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {["NIS2 91%", "GDPR 88%", "ISO 27001 84%", "EU AI Act 67%"].map(
                  (badge) => (
                    <span
                      key={badge}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                        badge.includes("67")
                          ? "border-amber-100 bg-amber-50 text-amber-700"
                          : "border-emerald-100 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {badge}
                    </span>
                  ),
                )}
              </div>
              <Link
                href="/trust/demo"
                className="mt-8 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Spustit Trust Center →
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-200/50 bg-white py-10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-5 text-sm font-medium text-zinc-600 md:gap-16">
            {[
              "Data v EU (eu-west-1)",
              "Šifrování AES-256",
              "SOC 2 Type II",
              "GDPR Compliant",
            ].map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-zinc-500">
            Naše platforma sama splňuje předpisy, které vám pomáhá dodržovat.
          </p>
        </section>
      </main>
    </MarketingShell>
  );
}
