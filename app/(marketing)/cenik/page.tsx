import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import {
  ComparisonTable,
  FaqAccordion,
  PricingCards,
  RoiCalculator,
} from "@/components/marketing/pricing-widgets";

export const metadata: Metadata = {
  title:
    "Ceník | Splnit.eu — od 0 Kč/měsíc, transparentní ceny, žádné závazky",
  description:
    "Transparentní ceny Splnit.eu pro české firmy: zdarma, Starter a Business s roční nebo měsíční fakturací.",
  openGraph: {
    locale: "cs_CZ",
  },
};

export default function PricingPage() {
  return (
    <MarketingShell>
      <main>
        <section data-hero className="px-5 pb-16 pt-32 text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-900 md:text-[68px]">
              Transparentní ceny. Žádná překvapení.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-500">
              Méně než jedna hodina konzultanta měsíčně.
            </p>
            <PricingCards />
            <p className="mt-6 text-xs text-zinc-400">
              Všechny plány zahrnují EU datové úložiště · Bez skrytých poplatků ·
              Zrušení kdykoliv
            </p>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 px-5 py-12">
          <div className="mx-auto max-w-5xl rounded-[28px] bg-zinc-950 p-8 text-white md:flex md:items-center md:justify-between md:gap-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                <Icon
                  icon="solar:users-group-rounded-linear"
                  className="text-2xl"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Jste poradce nebo MSP?</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                  Neomezený počet klientů, white-label možnost, partnerský
                  odznak.
                </p>
              </div>
            </div>
            <div className="mt-6 shrink-0 md:mt-0 md:text-right">
              <p className="mono text-3xl font-semibold">7 475 Kč/měsíc</p>
              <Link
                href="mailto:hello@splnit.eu?subject=Partner%20Splnit.eu"
                className="mt-3 inline-flex text-sm font-medium text-blue-300 hover:text-blue-200"
              >
                Zjistit více →
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-10 text-center">
              <span className="section-tag mb-5">Srovnání funkcí</span>
              <h2 className="text-4xl font-semibold tracking-[-0.04em] text-zinc-900">
                Vyberte podle hloubky automatizace.
              </h2>
            </div>
            <ComparisonTable />
          </div>
        </section>

        <section className="border-t border-zinc-200/50 py-20">
          <div className="mx-auto max-w-5xl px-5">
            <RoiCalculator />
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-20">
          <div className="mx-auto max-w-3xl px-5">
            <div className="mb-10 text-center">
              <span className="section-tag mb-5">FAQ</span>
              <h2 className="text-4xl font-semibold tracking-[-0.04em] text-zinc-900">
                Časté otázky
              </h2>
            </div>
            <FaqAccordion />
          </div>
        </section>

        <section className="relative overflow-hidden py-28">
          <div
            className="bg-grid pointer-events-none absolute inset-0 z-0"
            style={{
              maskImage:
                "linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.8))",
            }}
          />
          <div className="relative z-10 mx-auto max-w-3xl px-5 text-center">
            <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-900 md:text-5xl">
              Začněte plnit předpisy ještě dnes.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-500">
              Připojte se k českým firmám, které řeší soulad automaticky — ne v
              tabulkách.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Zahájit 14denní zkušební verzi
              </Link>
              <Link
                href="/platform"
                className="rounded-full border border-zinc-200 bg-white px-8 py-3 text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50"
              >
                Prohlédnout dokumentaci
              </Link>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
