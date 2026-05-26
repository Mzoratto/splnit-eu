import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import {
  ComparisonTable,
  FaqAccordion,
  PricingCards,
} from "@/components/marketing/pricing-widgets";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { createMarketingMetadata } from "@/lib/seo/metadata";

const metadataByLocale: Record<Locale, Required<Pick<Metadata, "title" | "description">> & { locale: string }> = {
  "cs-CZ": {
    description:
      "Transparentní ceny Splnit.eu pro české firmy: Zdarma, SME a Agency s měsíční fakturací v Kč.",
    locale: "cs_CZ",
    title:
      "Ceník | Splnit.eu — od 0 Kč/měsíc, transparentní ceny, žádné závazky",
  },
  "en-EU": {
    description:
      "Transparent Splnit.eu pricing for EU SMBs: Free, SME, and Agency with monthly billing in CZK.",
    locale: "en_EU",
    title:
      "Pricing | Splnit.eu — from 0 Kč/month, transparent pricing, no lock-in",
  },
  "it-IT": {
    description:
      "Prezzi trasparenti Splnit.eu per PMI europee: Gratis, SME e Agency con fatturazione mensile in CZK.",
    locale: "it_IT",
    title:
      "Prezzi | Splnit.eu — da 0 Kč/mese, prezzi trasparenti, nessun vincolo",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const metadata = metadataByLocale[locale];

  return createMarketingMetadata({
    description: metadata.description ?? "",
    locale,
    path: "/cenik",
    title: String(metadata.title),
  });
}

export default async function PricingPage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const t = await getTranslations("pricing");

  return (
    <MarketingShell>
      <main>
        <section data-hero className="border-b border-border bg-white px-5 pb-16 pt-36 text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-5xl font-bold leading-[1.05] tracking-normal text-foreground md:text-[68px]">
              {t("title")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-foreground/62">
              {t("subtitle")}
            </p>
            <PricingCards />
            <p className="mt-6 text-xs text-zinc-400">
              {t("footnote")}
            </p>
          </div>
        </section>

        <section className="px-5 py-12">
          <div className="mx-auto max-w-5xl rounded-lg bg-slate-900 p-8 text-white md:flex md:items-center md:justify-between md:gap-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                <Icon
                  icon="solar:users-group-rounded-linear"
                  className="text-2xl"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{t("partnerTitle")}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                  {t("partnerBody")}
                </p>
              </div>
            </div>
            <div className="mt-6 shrink-0 md:mt-0 md:text-right">
              <p className="mono text-3xl font-semibold">{t("partnerPrice")}</p>
              <Link
                href={getLocalizedMarketingPath("/agency/signup", locale)}
                className="mt-3 inline-flex text-sm font-medium text-blue-300 hover:text-blue-200"
              >
                {t("partnerCta")}
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-white py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-10 text-center">
              <span className="section-tag mb-5">{t("comparisonTag")}</span>
              <h2 className="text-4xl font-bold tracking-normal text-foreground">
                {t("comparisonTitle")}
              </h2>
            </div>
            <ComparisonTable />
            <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-6 text-foreground/58">
              {t("comparisonDocumentsNote")}
            </p>
            <div className="mt-6 text-center">
              <Link
                href={getLocalizedMarketingPath("/srovnani", locale)}
                className="text-sm text-foreground/64 underline underline-offset-4 hover:text-foreground"
              >
                {t("comparisonPageCta")}
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-white py-20">
          <div className="mx-auto max-w-3xl px-5">
            <div className="mb-10 text-center">
              <span className="section-tag mb-5">{t("faqTag")}</span>
              <h2 className="text-4xl font-bold tracking-normal text-foreground">
                {t("faqTitle")}
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
            <h2 className="text-4xl font-bold leading-[1.05] tracking-normal text-foreground md:text-5xl">
              {t("finalTitle")}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-foreground/62">
              {t("finalBody")}
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={getLocalizedMarketingPath("/sign-up", locale)}
                className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
              >
                {t("primaryCta")}
              </Link>
              <Link
                href={getLocalizedMarketingPath("/platform", locale)}
                className="rounded-lg border border-border bg-white px-8 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-muted"
              >
                {t("secondaryCta")}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
