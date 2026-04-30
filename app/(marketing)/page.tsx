import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { DashboardMockup } from "@/components/marketing/dashboard-mockup";
import { LeadCapture } from "@/components/marketing/lead-capture";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title:
    "Splnit.eu — Automatizace souladu s NIS2, EU AI Act a GDPR pro české firmy",
  description:
    "Splnit.eu propojí vaše systémy, prověří bezpečnostní kontroly každou hodinu a udržuje vás v souladu s NIS2, EU AI Act, GDPR a ISO 27001.",
  openGraph: {
    locale: "cs_CZ",
  },
};

const features = [
  {
    icon: "solar:shield-network-linear",
    title: "Data v EU",
    body: "Veškeré důkazy a záznamy zůstávají na evropských serverech — izolované a šifrované.",
  },
  {
    icon: "solar:bolt-circle-linear",
    title: "Kontinuální monitoring",
    body: "Zapomeňte na jednorázové audity. Zachyťte výpadky konfigurace ve vašem Microsoft 365 nebo AWS okamžitě.",
  },
  {
    icon: "solar:documents-linear",
    title: "Automatické dokumenty",
    body: "Generujte dokumenty schválené auditory přizpůsobené českému právu — připravené k nasazení.",
  },
];

const steps = [
  {
    icon: "solar:plug-circle-linear",
    title: "Připojte nástroje",
    body: "Propojte Microsoft 365, GitHub nebo AWS. Nastavení trvá 5 minut.",
  },
  {
    icon: "solar:cpu-linear",
    title: "Testy běží automaticky",
    body: "200+ bezpečnostních kontrol každou hodinu. Vy spíte. Systém hlídá.",
  },
  {
    icon: "solar:document-check-linear",
    title: "Dostanete výsledky",
    body: "Dashboard, upozornění na selhání a auditní dokumentace připravená pro auditora.",
  },
];

export default function HomePage() {
  return (
    <MarketingShell>
      <main>
        <header
          data-hero
          className="relative overflow-hidden pb-20 pt-28 md:pb-28 md:pt-36"
        >
          <div
            className="bg-grid pointer-events-none absolute inset-0 z-0"
            style={{
              maskImage:
                "linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute left-1/2 top-0 z-0 h-[500px] w-[900px] -translate-x-1/2 opacity-[0.055] blur-[80px]"
            style={{
              background: "radial-gradient(ellipse at center, #3B82F6 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 mx-auto max-w-7xl px-5">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3.5 py-1.5 text-blue-700">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="text-xs font-medium">
                  🇨🇿 Narozeno v Česku · Vytvořeno pro EU předpisy
                </span>
              </div>

              <h1 className="mb-6 text-5xl font-semibold leading-[1.05] tracking-[-0.04em] [font-family:ui-sans-serif,system-ui,sans-serif] md:text-[72px]">
                <span className="block text-zinc-900">
                  Splňte EU předpisy.
                </span>
                <span className="mt-1 block text-zinc-400">
                  Automaticky.
                </span>
              </h1>

              <p className="mx-auto mb-10 max-w-lg text-sm leading-6 text-zinc-600 md:max-w-2xl md:text-xl md:leading-relaxed">
                <span className="md:hidden">
                  Automatizujte GDPR, NIS2 a ISO 27001 bez tabulek.
                </span>
                <span className="hidden md:inline">
                  Centralizovaná platforma pro české firmy. Automatizujte soulad s{" "}
                  <strong className="font-medium text-zinc-900">GDPR</strong>,{" "}
                  <strong className="font-medium text-zinc-900">NIS2</strong> a{" "}
                  <strong className="font-medium text-zinc-900">ISO 27001</strong>{" "}
                  bez tabulek a bez konzultantů.
                </span>
              </p>

              <div className="mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <div className="rounded-full bg-gradient-to-b from-blue-400 to-blue-700 p-px shadow-md shadow-blue-200/50 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-200/70">
                  <Link
                    href="/sign-up"
                    className="flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3 font-medium text-white transition-colors hover:bg-blue-500"
                  >
                    Začít zdarma
                    <Icon
                      icon="solar:arrow-right-linear"
                      className="text-sm opacity-80"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
                <Link
                  href="/platform"
                  className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-7 py-3 font-medium text-zinc-800 shadow-sm transition-all hover:scale-[1.02] hover:bg-zinc-50 hover:shadow-md"
                >
                  <Icon
                    icon="solar:play-circle-linear"
                    className="text-zinc-400"
                    aria-hidden="true"
                  />
                  Zobrazit demo
                </Link>
              </div>
              <p className="text-xs text-zinc-400">
                Žádná kreditní karta · Okamžité spuštění · Zrušení kdykoliv
              </p>
            </div>

            <DashboardMockup />

            <div className="fade-up mt-12 translate-y-4 text-center opacity-0">
              <p className="mb-6 text-xs font-medium uppercase tracking-widest text-zinc-400">
                Chrání nejrychleji rostoucí české firmy
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
                {["Acme s.r.o.", "TechBrno", "DataFlow CZ", "Pragma Dev", "FinEdge CZ"].map(
                  (company) => (
                    <span
                      key={company}
                      className="cursor-default text-sm font-semibold tracking-tight text-zinc-300 opacity-70 grayscale transition-all hover:text-blue-600 hover:opacity-100 hover:grayscale-0"
                    >
                      {company}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </header>

        <section className="border-t border-zinc-200/50 py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="scroll-animate mb-14 translate-y-6 text-center opacity-0">
              <div className="section-tag mb-4">
                <Icon icon="solar:bolt-circle-linear" aria-hidden="true" />
                Jak to funguje
              </div>
              <h2 className="mb-4 text-3xl font-semibold tracking-[-0.03em] text-zinc-900 md:text-4xl">
                Nastavte jednou. Funguje navždy.
              </h2>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-500">
                Tři kroky oddělují vaši firmu od automatického souladu s každým
                EU předpisem.
              </p>
            </div>

            <div className="relative grid gap-6 md:grid-cols-3">
              <div className="pointer-events-none absolute left-[calc(33.33%-24px)] right-[calc(33.33%-24px)] top-10 hidden h-px bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 md:block" />
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="scroll-animate flex translate-y-6 flex-col gap-4 opacity-0"
                >
                  <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-200">
                    {index + 1}
                  </div>
                  <div className={`rounded-2xl p-px ${index === 1 ? "grad-border-blue" : "grad-border"}`}>
                    <div className="h-full rounded-[15px] bg-white p-6">
                      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon icon={step.icon} className="text-xl" aria-hidden="true" />
                      </div>
                      <h3 className="mb-2 text-base font-semibold text-zinc-900">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-zinc-500">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="scroll-animate mb-14 translate-y-6 text-center opacity-0">
              <div className="section-tag mb-4">
                <Icon icon="solar:star-linear" aria-hidden="true" />
                Klíčové funkce
              </div>
              <h2 className="mb-4 text-3xl font-semibold tracking-[-0.03em] text-zinc-900 md:text-4xl">
                Compliance vytvořené pro moderní týmy.
              </h2>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-500">
                Propojte lokální i globální infrastrukturu. Mapujeme kontroly
                automaticky na české i mezinárodní standardy.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="scroll-animate group rounded-[22px] p-px grad-border translate-y-6 opacity-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-full flex-col rounded-[21px] bg-white p-7">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                      <Icon icon={feature.icon} className="text-2xl" aria-hidden="true" />
                    </div>
                    <h3 className="mb-2.5 text-base font-semibold text-zinc-900">
                      {feature.title}
                    </h3>
                    <p className="flex-1 text-sm leading-relaxed text-zinc-500">
                      {feature.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-20">
          <div className="mx-auto max-w-3xl px-5">
            <div className="scroll-animate translate-y-6 opacity-0">
              <LeadCapture />
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-zinc-950 py-24">
          <div
            className="bg-grid-dark pointer-events-none absolute inset-0 opacity-100"
            style={{
              maskImage:
                "radial-gradient(ellipse 80% 80% at 50% 50%, white, transparent)",
            }}
          />
          <div
            className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full opacity-[0.06] blur-[80px]"
            style={{ background: "#3B82F6" }}
          />
          <div className="relative z-10 mx-auto max-w-7xl px-5">
            <div className="flex flex-col items-start gap-16 md:flex-row">
              <div className="scroll-animate flex-1 -translate-x-6 opacity-0">
                <Icon
                  icon="solar:quote-left-linear"
                  className="mb-7 block text-5xl text-zinc-700"
                  aria-hidden="true"
                />
                <blockquote className="mb-8 text-2xl font-medium leading-snug tracking-[-0.02em] text-white md:text-[34px]">
                  „Jako pražský fintech škálující do Německa byl soulad naším
                  největším bottleneckem. Splnit.eu automatizovalo 90 % přípravy
                  na ISO 27001 a průběžně řeší vendor risk.“
                </blockquote>
                <div className="mb-6">
                  <div className="text-sm font-semibold text-white">
                    Jakub Novák
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    Chief Technology Officer · FinEdge CZ
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                  <Icon icon="solar:check-circle-linear" aria-hidden="true" />
                  ISO 27001 za 3 týdny
                </span>
              </div>

              <div className="testimonial-float scroll-animate w-full shrink-0 translate-x-6 opacity-0 md:w-[360px]">
                <div
                  className="rounded-[26px] p-px"
                  style={{ background: "linear-gradient(180deg,#3F3F46,#18181B)" }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[25px] bg-zinc-900 grayscale transition-all hover:grayscale-0">
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
                        <Icon
                          icon="solar:user-rounded-linear"
                          className="text-4xl text-zinc-600"
                          aria-hidden="true"
                        />
                      </div>
                      <span className="text-xs font-medium text-zinc-600">
                        Jakub Novák
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/90 p-3 backdrop-blur">
                        <div className="mono mb-1 text-[10px] text-zinc-400">
                          ISO 27001 · certifikace
                        </div>
                        <div className="text-sm font-semibold text-white">
                          ✓ Audit prošel
                        </div>
                        <div className="mt-0.5 text-[10px] text-emerald-400">
                          3 týdny přípravy místo 4 měsíců
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <TrustBar />
        <FinalCta />
      </main>
    </MarketingShell>
  );
}

function TrustBar() {
  const badges = [
    ["solar:shield-check-linear", "ISO 27001 Certified"],
    ["solar:lock-password-linear", "GDPR Compliant"],
    ["solar:map-point-linear", "Data v EU"],
    ["solar:document-check-linear", "SOC 2 Type II"],
  ];

  return (
    <section className="border-b border-zinc-200/50 bg-white py-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-5 md:gap-16">
        {badges.map(([icon, label]) => (
          <div
            key={label}
            className="flex items-center gap-2 text-sm font-medium text-zinc-600"
          >
            <Icon icon={icon} className="text-xl text-zinc-400" aria-hidden="true" />
            {label}
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden py-28">
      <div
        className="bg-grid pointer-events-none absolute inset-0 z-0"
        style={{
          maskImage:
            "linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.8))",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.06), transparent)",
        }}
      />
      <div className="scroll-animate relative z-10 mx-auto max-w-3xl translate-y-6 px-5 text-center opacity-0">
        <h2 className="mb-5 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-900 md:text-5xl">
          Zabezpečte svou infrastrukturu ještě dnes.
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-zinc-500">
          Připojte se k předním evropským startupům, které používají Splnit.eu k
          budování důvěry, uzavírání enterprise obchodů a dodržování předpisů.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <div className="rounded-full bg-gradient-to-b from-zinc-600 to-zinc-900 p-px shadow-md transition-all hover:scale-[1.02] hover:shadow-lg">
            <Link
              href="/sign-up"
              className="flex items-center gap-2 rounded-full bg-zinc-900 px-8 py-3 font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Zahájit zkušební verzi
              <Icon
                icon="solar:arrow-right-linear"
                className="text-sm opacity-70"
                aria-hidden="true"
              />
            </Link>
          </div>
          <Link
            href="/platform"
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-8 py-3 font-medium text-zinc-800 shadow-sm transition-all hover:scale-[1.02] hover:bg-zinc-50 hover:shadow-md"
          >
            <Icon icon="solar:book-linear" className="text-zinc-400" aria-hidden="true" />
            Zobrazit dokumentaci
          </Link>
        </div>
      </div>
    </section>
  );
}
