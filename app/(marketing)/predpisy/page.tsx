import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Icon } from "@/components/marketing/local-icon";
import { LeadCapture } from "@/components/marketing/lead-capture";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { RegulationSelector } from "@/components/marketing/regulation-selector";
import { SoftwareApplicationJsonLd } from "@/components/marketing/software-json-ld";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { frameworkCards, timeline } from "@/lib/marketing/frameworks";

const metadataByLocale: Record<
  Locale,
  Required<Pick<Metadata, "title" | "description">> & { locale: string }
> = {
  "cs-CZ": {
    description:
      "Průvodce EU předpisy pro české firmy: NIS2, EU AI Act, GDPR, ISO 27001, CSRD a DORA s termíny, pokutami a kroky k souladu.",
    locale: "cs_CZ",
    title:
      "EU Předpisy | NIS2, EU AI Act, GDPR, ISO 27001 - přehled povinností pro česká MSP",
  },
  "en-EU": {
    description:
      "Plain-language guide to EU regulations for SMBs: NIS2, EU AI Act, GDPR, ISO 27001, CSRD, and DORA with deadlines, sanctions, and practical compliance steps.",
    locale: "en_EU",
    title:
      "EU Regulations | NIS2, EU AI Act, GDPR, ISO 27001 - SMB compliance guide",
  },
  "it-IT": {
    description:
      "Guida in linguaggio semplice alle normative UE per PMI: NIS2, EU AI Act, GDPR, ISO 27001, CSRD e DORA con scadenze, sanzioni e passi pratici.",
    locale: "it_IT",
    title:
      "Normative UE | NIS2, EU AI Act, GDPR, ISO 27001 - guida compliance per PMI",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const metadata = metadataByLocale[locale];

  return {
    description: metadata.description,
    openGraph: {
      locale: metadata.locale,
    },
    title: metadata.title,
  };
}

export default async function RegulationsPage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const t = await getTranslations("regulations");
  const resources = t.raw("resources") as string[];
  const timelineItems = t.raw("timeline") as Array<{
    date: string;
    title: string;
  }>;

  return (
    <MarketingShell>
      <SoftwareApplicationJsonLd
        pageName={t("pageName")}
        path={getLocalizedMarketingPath("/predpisy", locale)}
        description={t("jsonLdDescription")}
        locale={locale}
      />
      <main>
        <section data-hero className="px-5 pb-20 pt-32 text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-900 md:text-[68px]">
              {t("title")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-500">
              {t("subtitle")}
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
                  className="scroll-animate rounded-[22px] p-px grad-border"
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
                          framework.status === "available"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : "border-amber-100 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {framework.status === "available"
                          ? t("cards.available")
                          : t("cards.soon")}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-zinc-900">
                        {framework.name}
                      </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
                        {t(`cards.${framework.slug}.regulator`)}
                      </span>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                        {t(`cards.${framework.slug}.deadline`)}
                      </span>
                    </div>
                    <p className="mt-5 flex-1 text-sm leading-6 text-zinc-500">
                      {t(`cards.${framework.slug}.description`)}
                    </p>
                    <Link
                      href={getLocalizedMarketingPath(
                        `/predpisy/${framework.slug}`,
                        locale,
                      )}
                      className="mt-6 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      {t("learnMore")}
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
                {t("timelineTag")}
              </span>
              <h2 className="text-4xl font-semibold tracking-[-0.04em] text-white">
                {t("timelineTitle")}
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
                  <p className="mono text-xs text-blue-300">
                    {timelineItems[index]?.date ?? item.date}
                  </p>
                  <h3 className="mt-2 text-sm font-semibold leading-6 text-white">
                    {timelineItems[index]?.title ?? item.title}
                  </h3>
                  {index === 2 ? (
                    <span className="mt-4 inline-flex rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-300">
                      {t("currentMilestone")}
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
              title={t("downloadTitle")}
              subtitle={t("downloadSubtitle")}
              cta={t("downloadCta")}
              resources={resources}
            />
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
