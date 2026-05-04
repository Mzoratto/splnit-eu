import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { normalizeLocale, type Locale } from "@/i18n/routing";

const metadataByLocale: Record<
  Locale,
  Required<Pick<Metadata, "title" | "description">> & { locale: string }
> = {
  "cs-CZ": {
    title: "Early access | Splnit.eu",
    description:
      "Splnit.eu hledá prvních 10 design partnerů pro NIS2 a GDPR compliance automation.",
    locale: "cs_CZ",
  },
  "en-EU": {
    title: "Early access | Splnit.eu",
    description:
      "Splnit.eu is looking for the first 10 design partners for NIS2 and GDPR compliance automation.",
    locale: "en_EU",
  },
  "it-IT": {
    title: "Early access | Splnit.eu",
    description:
      "Splnit.eu cerca i primi 10 design partner per l'automazione compliance NIS2 e GDPR.",
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

const benefitKeys = [
  "businessFree",
  "guidedOnboarding",
  "sectorFeatures",
  "directContact",
];

const askKeys = ["realUse", "weeklyFeedback", "referencePermission"];

const weekKeys = ["week1", "week2", "week3"];

export default async function EarlyAccessPage() {
  const t = await getTranslations("marketing.earlyAccess");

  return (
    <MarketingShell>
      <main>
        <section data-hero className="px-5 pb-20 pt-32">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.72fr] lg:items-center">
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
                  href="mailto:hello@splnit.eu?subject=Design%20partner%20Splnit.eu"
                  className="inline-flex justify-center rounded-full bg-blue-600 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  {t("primaryCta")}
                </Link>
                <Link
                  href="/about"
                  className="inline-flex justify-center rounded-full border border-zinc-200 bg-white px-7 py-3 text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50"
                >
                  {t("secondaryCta")}
                </Link>
              </div>
            </div>

            <aside className="rounded-[28px] border border-zinc-200 bg-white p-8 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-zinc-400">
                {t("filledLabel")}
              </p>
              <div className="mt-5 flex items-end gap-3">
                <span className="text-7xl font-semibold tracking-tight text-zinc-900">
                  0
                </span>
                <span className="pb-3 text-2xl font-semibold text-zinc-400">
                  / 10
                </span>
              </div>
              <p className="mt-5 text-sm leading-6 text-zinc-500">
                {t("emptyProof")}
              </p>
            </aside>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-2">
            <div className="rounded-[24px] border border-blue-100 bg-blue-50/40 p-8">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Icon icon="solar:check-circle-linear" className="text-2xl" />
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900">
                {t("benefitsTitle")}
              </h2>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-zinc-600">
                {benefitKeys.map((key) => (
                  <li key={key} className="flex gap-3">
                    <Icon
                      icon="solar:check-circle-linear"
                      className="mt-0.5 shrink-0 text-lg text-emerald-500"
                    />
                    <span>{t(`benefits.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[24px] border border-zinc-200 bg-white p-8">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-white">
                <Icon icon="solar:users-group-rounded-linear" className="text-2xl" />
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900">
                {t("asksTitle")}
              </h2>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-zinc-600">
                {askKeys.map((key) => (
                  <li key={key} className="flex gap-3">
                    <Icon
                      icon="solar:arrow-right-linear"
                      className="mt-0.5 shrink-0 text-lg text-blue-600"
                    />
                    <span>{t(`asks.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-10 max-w-3xl">
              <span className="section-tag mb-5">{t("onboardingTag")}</span>
              <h2 className="text-4xl font-semibold tracking-normal text-zinc-900">
                {t("onboardingTitle")}
              </h2>
              <p className="mt-4 text-base leading-7 text-zinc-500">
                {t("onboardingBody")}
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {weekKeys.map((key) => (
                <article key={key} className="rounded-[22px] p-px grad-border">
                  <div className="h-full rounded-[21px] bg-white p-7">
                    <p className="text-sm font-medium text-blue-600">
                      {t(`weeks.${key}Title`)}
                    </p>
                    <h3 className="mt-3 text-lg font-semibold text-zinc-900">
                      {t(`weeks.${key}Heading`)}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-500">
                      {t(`weeks.${key}Body`)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
