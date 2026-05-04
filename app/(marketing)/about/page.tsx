import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "About | Splnit.eu",
  description:
    "Kdo stojí za Splnit.eu a co je v early access produktu dnes skutečně hotové.",
  openGraph: {
    locale: "cs_CZ",
  },
};

const realTodayKeys = ["solo", "focus", "legalReview", "noFakeProof"];
const notYetKeys = ["legalAdvice", "enterprise", "certification", "entity"];

export default async function AboutPage() {
  const t = await getTranslations("marketing.about");

  return (
    <MarketingShell>
      <main>
        <section data-hero className="px-5 pb-20 pt-32">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1fr] lg:items-center">
            <div className="aspect-[4/5] overflow-hidden rounded-[28px] border border-zinc-200 bg-zinc-100">
              <div className="flex h-full flex-col items-center justify-center gap-4 text-zinc-400">
                <Icon icon="solar:user-rounded-linear" className="text-6xl" />
                <span className="text-sm font-medium">
                  {t("photoPlaceholder")}
                </span>
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
                  href="/early-access"
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
          <div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-2">
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

            <article className="rounded-[24px] border border-zinc-200 bg-white p-8">
              <h2 className="text-2xl font-semibold text-zinc-900">
                {t("notYetTitle")}
              </h2>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-zinc-600">
                {notYetKeys.map((key) => (
                  <li key={key} className="flex gap-3">
                    <Icon
                      icon="solar:forbidden-circle-linear"
                      className="mt-0.5 shrink-0 text-lg text-zinc-400"
                    />
                    <span>{t(`notYet.${key}`)}</span>
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
      </main>
    </MarketingShell>
  );
}
