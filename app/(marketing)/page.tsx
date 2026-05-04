import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Icon } from "@/components/marketing/local-icon";
import { DashboardMockup } from "@/components/marketing/dashboard-mockup";
import { LeadCapture } from "@/components/marketing/lead-capture";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { normalizeLocale } from "@/i18n/routing";

export const metadata: Metadata = {
  title:
    "Splnit.eu — Compliance automation pro evropské SMB týmy",
  description:
    "Splnit.eu propojí Microsoft 365, AWS nebo GitHub a pomůže připravit auditní důkazy pro NIS2, GDPR a ISO 27001.",
  openGraph: {
    locale: "cs_CZ",
  },
};

const features = [
  {
    icon: "solar:shield-network-linear",
    key: "residency",
  },
  {
    icon: "solar:bolt-circle-linear",
    key: "monitoring",
  },
  {
    icon: "solar:documents-linear",
    key: "documents",
  },
];

const steps = [
  {
    icon: "solar:plug-circle-linear",
    key: "connect",
  },
  {
    icon: "solar:cpu-linear",
    key: "tests",
  },
  {
    icon: "solar:document-check-linear",
    key: "results",
  },
];

const trustBadges = [
  ["solar:shield-check-linear", "early"],
  ["solar:lock-password-linear", "dpa"],
  ["solar:map-point-linear", "residency"],
  ["solar:document-check-linear", "onboarding"],
] as const;

export default async function HomePage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const t = await getTranslations("home");

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
          <div className="relative z-10 mx-auto max-w-7xl px-5">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3.5 py-1.5 text-blue-700">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="text-xs font-medium">
                  {t("badge")}
                </span>
              </div>

              <h1 className="mb-6 text-5xl font-semibold leading-[1.05] tracking-[-0.04em] [font-family:ui-sans-serif,system-ui,sans-serif] md:text-[72px]">
                <span className="block text-zinc-900">
                  {t("titleLine1")}
                </span>
                <span className="mt-1 block text-zinc-400">
                  {t("titleLine2")}
                </span>
              </h1>

              <p className="mx-auto mb-10 max-w-lg text-sm leading-6 text-zinc-600 md:max-w-2xl md:text-xl md:leading-relaxed">
                <span className="md:hidden">
                  {t("mobileLead")}
                </span>
                <span className="hidden md:inline">
                  {t("lead")}
                </span>
              </p>

              <div className="mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <div className="rounded-full bg-gradient-to-b from-blue-400 to-blue-700 p-px shadow-md shadow-blue-200/50 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-200/70">
                  <Link
                    href="/early-access"
                    className="flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3 font-medium text-white transition-colors hover:bg-blue-500"
                  >
                    {t("primaryCta")}
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
                  {t("secondaryCta")}
                </Link>
              </div>
              <p className="text-xs text-zinc-400">
                {t("trustLine")}
              </p>
            </div>

            <DashboardMockup locale={locale} />

            <div className="fade-up mt-12 text-center">
              <p className="mb-6 text-xs font-medium uppercase tracking-widest text-zinc-400">
                {t("partnerTag")}
              </p>
              <div className="mx-auto grid max-w-3xl gap-3 text-sm text-zinc-500 sm:grid-cols-3">
                <span className="rounded-full border border-zinc-200 bg-white px-4 py-2">
                  {t("partnerFilled")}
                </span>
                <span className="rounded-full border border-zinc-200 bg-white px-4 py-2">
                  {t("partnerFree")}
                </span>
                <span className="rounded-full border border-zinc-200 bg-white px-4 py-2">
                  {t("partnerOnboarding")}
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="border-t border-zinc-200/50 py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="scroll-animate mb-14 text-center">
              <div className="section-tag mb-4">
                <Icon icon="solar:bolt-circle-linear" aria-hidden="true" />
                {t("stepsTag")}
              </div>
              <h2 className="mb-4 text-3xl font-semibold tracking-[-0.03em] text-zinc-900 md:text-4xl">
                {t("stepsTitle")}
              </h2>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-500">
                {t("stepsBody")}
              </p>
            </div>

            <div className="relative grid gap-6 md:grid-cols-3">
              <div className="pointer-events-none absolute left-[16.666%] right-[16.666%] top-5 hidden h-px bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 md:block" />
              {steps.map((step, index) => (
                <div
                  key={step.key}
                  className="scroll-animate relative z-10 flex flex-col items-center gap-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-200">
                    {index + 1}
                  </div>
                  <div className={`w-full rounded-2xl p-px ${index === 1 ? "grad-border-blue" : "grad-border"}`}>
                    <div className="h-full rounded-[15px] bg-white p-6">
                      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon icon={step.icon} className="text-xl" aria-hidden="true" />
                      </div>
                      <h3 className="mb-2 text-base font-semibold text-zinc-900">
                        {t(`steps.${step.key}Title`)}
                      </h3>
                      <p className="text-sm leading-relaxed text-zinc-500">
                        {t(`steps.${step.key}Body`)}
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
            <div className="scroll-animate mb-14 text-center">
              <div className="section-tag mb-4">
                <Icon icon="solar:star-linear" aria-hidden="true" />
                {t("featuresTag")}
              </div>
              <h2 className="mb-4 text-3xl font-semibold tracking-[-0.03em] text-zinc-900 md:text-4xl">
                {t("featuresTitle")}
              </h2>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-500">
                {t("featuresBody")}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.key}
                  className="scroll-animate group rounded-[22px] p-px grad-border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-full flex-col rounded-[21px] bg-white p-7">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                      <Icon icon={feature.icon} className="text-2xl" aria-hidden="true" />
                    </div>
                    <h3 className="mb-2.5 text-base font-semibold text-zinc-900">
                      {t(`features.${feature.key}Title`)}
                    </h3>
                    <p className="flex-1 text-sm leading-relaxed text-zinc-500">
                      {t(`features.${feature.key}Body`)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-20">
          <div className="mx-auto max-w-3xl px-5">
            <div className="scroll-animate">
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
              <div className="scroll-animate flex-1">
                <Icon
                  icon="solar:users-group-rounded-linear"
                  className="mb-7 block text-5xl text-zinc-700"
                  aria-hidden="true"
                />
                <h2 className="mb-8 text-3xl font-semibold leading-snug tracking-normal text-white md:text-[44px]">
                  {t("offerTitle")}
                </h2>
                <p className="mb-8 max-w-xl text-base leading-7 text-zinc-400">
                  {t("offerBody")}
                </p>
                <Link
                  href="/early-access"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-100"
                >
                  {t("offerCta")}
                  <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
                </Link>
              </div>

              <div className="testimonial-float scroll-animate w-full shrink-0 md:w-[360px]">
                <div
                  className="rounded-[26px] p-px"
                  style={{ background: "linear-gradient(180deg,#3F3F46,#18181B)" }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[25px] bg-zinc-900 grayscale transition-all hover:grayscale-0">
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
                        <Icon
                          icon="solar:document-check-linear"
                          className="text-4xl text-zinc-600"
                          aria-hidden="true"
                        />
                      </div>
                      <span className="text-sm font-medium leading-6 text-zinc-400">
                        {t("referencePlaceholder")}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/90 p-3 backdrop-blur">
                        <div className="mono mb-1 text-[10px] text-zinc-400">
                          Early access
                        </div>
                        <div className="text-sm font-semibold text-white">
                          {t("referenceCount")}
                        </div>
                        <div className="mt-0.5 text-[10px] text-emerald-400">
                          {t("referenceNote")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <TrustBar badges={trustBadges.map(([icon, key]) => [icon, t(`trustBadges.${key}`)] as const)} />
        <FinalCta
          title={t("finalTitle")}
          body={t("finalBody")}
          primaryCta={t("primaryCta")}
          secondaryCta={t("docsCta")}
        />
      </main>
    </MarketingShell>
  );
}

function TrustBar({
  badges,
}: {
  badges: ReadonlyArray<readonly [string, string]>;
}) {
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

function FinalCta({
  body,
  primaryCta,
  secondaryCta,
  title,
}: {
  body: string;
  primaryCta: string;
  secondaryCta: string;
  title: string;
}) {
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
      <div className="scroll-animate relative z-10 mx-auto max-w-3xl px-5 text-center">
        <h2 className="mb-5 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-900 md:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-zinc-500">
          {body}
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <div className="rounded-full bg-gradient-to-b from-zinc-600 to-zinc-900 p-px shadow-md transition-all hover:scale-[1.02] hover:shadow-lg">
            <Link
              href="/early-access"
              className="flex items-center gap-2 rounded-full bg-zinc-900 px-8 py-3 font-medium text-white transition-colors hover:bg-zinc-800"
            >
              {primaryCta}
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
            {secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
