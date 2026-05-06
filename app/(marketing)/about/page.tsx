import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { normalizeLocale, type Locale } from "@/i18n/routing";

const metadataByLocale: Record<
  Locale,
  Required<Pick<Metadata, "title" | "description">> & { locale: string }
> = {
  "cs-CZ": {
    title: "About | Splnit.eu",
    description:
      "Kdo stojí za Splnit.eu a co je v produktu v předběžném přístupu dnes skutečně hotové.",
    locale: "cs_CZ",
  },
  "en-EU": {
    title: "About | Splnit.eu",
    description:
      "Who is behind Splnit.eu and what is actually ready in the early access product today.",
    locale: "en_EU",
  },
  "it-IT": {
    title: "Chi siamo | Splnit.eu",
    description:
      "Chi c'è dietro Splnit.eu e cosa è realmente pronto oggi nel prodotto in accesso anticipato.",
    locale: "it_IT",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const metadata = metadataByLocale[locale];

  return {
    title: metadata.title,
    description: metadata.description,
    openGraph: {
      locale: metadata.locale,
    },
  };
}

const realTodayKeys = ["solo", "focus", "legalReview", "noFakeProof"];
const notYetKeys = ["legalAdvice", "enterprise", "certification"];

export default async function AboutPage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const t = await getTranslations("marketing.about");

  return (
    <MarketingShell>
      <main>
        <section data-hero className="px-5 pb-20 pt-32">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1fr] lg:items-center">
            <div
              className="aspect-[4/5] overflow-hidden rounded-[28px] border border-zinc-200 bg-zinc-100"
              aria-hidden="true"
            >
              <div className="flex h-full items-center justify-center text-zinc-400">
                <Icon icon="solar:user-rounded-linear" className="text-6xl" />
              </div>
            </div>

            <div>
              <span className="section-tag mb-5">{t("tag")}</span>
              <h1 className="text-5xl font-semibold leading-[1.05] tracking-normal text-zinc-900 md:text-[68px]">
                {t("title")}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-500">
                {t("body")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={getLocalizedMarketingPath("/early-access", locale)}
                  className="inline-flex justify-center rounded-full bg-blue-600 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  {t("primaryCta")}
                </Link>
                <Link
                  href="mailto:hello@splnit.eu"
                  className="inline-flex justify-center rounded-full border border-zinc-200 bg-white px-7 py-3 text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50"
                >
                  hello@splnit.eu
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-20">
          <div className="mx-auto max-w-5xl px-5">
            <article className="rounded-[24px] border border-emerald-100 bg-emerald-50/50 p-8">
              <h2 className="text-2xl font-semibold text-zinc-900">
                {t("realTodayTitle")}
              </h2>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-zinc-600">
                {realTodayKeys.map((key) => (
                  <li key={key} className="flex gap-3">
                    <Icon
                      icon="solar:check-circle-linear"
                      className="mt-0.5 shrink-0 text-lg text-emerald-500"
                    />
                    <span>{t(`realToday.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 py-20">
          <div className="mx-auto max-w-4xl px-5">
            <span className="section-tag mb-5">{t("whyTag")}</span>
            <h2 className="text-4xl font-semibold tracking-normal text-zinc-900">
              {t("whyTitle")}
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-zinc-600">
              <p>{t("whyP1")}</p>
              <p>{t("whyP2")}</p>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-zinc-50 py-14">
          <div className="mx-auto max-w-4xl px-5">
            <h2 className="text-lg font-semibold text-zinc-900">
              {t("notYetTitle")}
            </h2>
            <ul className="mt-5 grid gap-3 text-sm leading-6 text-zinc-500 md:grid-cols-2">
              {notYetKeys.map((key) => (
                <li key={key} className="flex gap-3">
                  <Icon
                    icon="solar:forbidden-circle-linear"
                    className="mt-0.5 shrink-0 text-base text-zinc-400"
                    aria-hidden="true"
                  />
                  <span>{t(`notYet.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
