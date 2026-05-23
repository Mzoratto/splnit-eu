import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Icon } from "@/components/marketing/local-icon";
import { DashboardMockup } from "@/components/marketing/dashboard-mockup";
import { LeadCapture } from "@/components/marketing/lead-capture";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { createMarketingMetadata } from "@/lib/seo/metadata";

const metadataByLocale: Record<
  Locale,
  Required<Pick<Metadata, "title" | "description">> & { locale: string }
> = {
  "cs-CZ": {
    title: "Splnit.eu - Compliance automation pro evropské SMB týmy",
    description:
      "Splnit.eu propojí Microsoft 365, GitHub, AWS, Hetzner Cloud, OVHcloud a české ERP workspaces pro auditní důkazy NIS2, GDPR a ISO 27001.",
    locale: "cs_CZ",
  },
  "en-EU": {
    title: "Splnit.eu - Compliance automation for European SMB teams",
    description:
      "Connect Microsoft 365, GitHub, AWS, Hetzner Cloud, OVHcloud, and Czech ERP workspaces to prepare audit evidence for NIS2, GDPR, and ISO 27001.",
    locale: "en_EU",
  },
  "it-IT": {
    title: "Splnit.eu - Automazione compliance per PMI europee",
    description:
      "Collegate Microsoft 365, GitHub, AWS, Hetzner Cloud, OVHcloud e workspace ERP cechi per preparare evidenze audit per NIS2, GDPR e ISO 27001.",
    locale: "it_IT",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const metadata = metadataByLocale[locale];

  return createMarketingMetadata({
    description: metadata.description ?? "",
    locale,
    path: "/",
    title: String(metadata.title),
  });
}

const features = [
  {
    icon: "solar:magnifer-linear",
    key: "residency",
  },
  {
    icon: "solar:chart-2-linear",
    key: "monitoring",
  },
  {
    icon: "solar:bell-linear",
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

const connectorBadges = [
  ["PO", "Pohoda", "bg-red-600"],
  ["AB", "ABRA Flexi", "bg-purple-600"],
  ["MI", "Microsoft 365", "bg-sky-500"],
  ["HE", "Hetzner Cloud", "bg-orange-500"],
  ["AW", "AWS", "bg-amber-500"],
  ["HL", "Helios", "bg-teal-600"],
  ["MS", "Money S3", "bg-indigo-600"],
] as const;

export default async function HomePage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const t = await getTranslations("home");
  const titleLine2 = t("titleLine2");

  return (
    <MarketingShell>
      <main>
        <header
          data-hero
          className="relative overflow-hidden border-b border-border bg-white pb-20 pt-32 md:pb-24 md:pt-40"
        >
          <div
            className="bg-grid pointer-events-none absolute inset-0 z-0"
            style={{
              maskImage:
                "linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10 mx-auto max-w-7xl px-5">
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.86fr)] xl:grid-cols-[minmax(0,0.9fr)_minmax(600px,1fr)]">
              <div>
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3.5 py-1.5 text-blue-700">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span className="text-xs font-bold">
                  {t("badge")}
                </span>
              </div>

              <h1 className="mb-6 max-w-3xl text-5xl font-bold leading-[1.02] tracking-normal text-foreground md:text-[72px]">
                <span className="block">
                  {t("titleLine1")}
                </span>
                {titleLine2 ? (
                  <span className="mt-1 block text-primary">
                    {titleLine2}
                  </span>
                ) : null}
              </h1>

              <p className="mb-10 max-w-2xl text-lg leading-8 text-foreground/68 md:text-xl">
                {t("lead")}
              </p>

              <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <div>
                  <Link
                    href={getLocalizedMarketingPath("/early-access", locale)}
                    className="flex min-h-14 items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-semibold text-white shadow-[0_14px_24px_rgba(37,99,235,0.22)] transition-colors hover:bg-[var(--accent-hover)]"
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
                  href="/demo"
                  className="flex min-h-14 items-center justify-center gap-2 rounded-lg border border-border bg-white px-8 py-3 font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-muted"
                >
                  <Icon
                    icon="solar:play-circle-linear"
                    className="text-zinc-400"
                    aria-hidden="true"
                  />
                  {t("secondaryCta")}
                </Link>
              </div>
              <p className="text-sm font-medium text-foreground/50">
                {t("trustLine")}
              </p>
            </div>

              <DashboardMockup locale={locale} />
            </div>

            <div className="fade-up mt-20 text-center">
              <p className="mb-6 text-xs font-bold uppercase tracking-normal text-foreground/38">
                {t("partnerTag")}
              </p>
              <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-7">
                {connectorBadges.map(([abbr, name, color]) => (
                  <div
                    key={name}
                    className="flex min-h-28 flex-col items-center justify-center rounded-lg border border-border bg-white p-4 shadow-xs"
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-lg text-sm font-bold text-white ${color}`}>
                      {abbr}
                    </span>
                    <span className="mt-3 text-sm font-semibold text-foreground/72">
                      {name}
                    </span>
                  </div>
                ))}
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
              <h2 className="mb-4 text-3xl font-bold tracking-normal text-foreground md:text-4xl">
                {t("stepsTitle")}
              </h2>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-foreground/62">
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
                  <div className={`w-full rounded-lg border bg-white shadow-sm ${index === 1 ? "border-primary" : "border-border"}`}>
                    <div className="h-full rounded-lg bg-white p-6">
                      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
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
              <h2 className="mb-4 text-3xl font-bold tracking-normal text-foreground md:text-4xl">
                {t("featuresTitle")}
              </h2>
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-foreground/62">
                {t("featuresBody")}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.key}
                  className="scroll-animate group rounded-lg border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-full flex-col rounded-lg bg-white p-7">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                      <Icon icon={feature.icon} className="text-2xl" aria-hidden="true" />
                    </div>
                    <h3 className="mb-2.5 text-base font-semibold text-foreground">
                      {t(`features.${feature.key}Title`)}
                    </h3>
                    <p className="flex-1 text-sm leading-relaxed text-foreground/62">
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
          <div className="relative z-10 mx-auto max-w-7xl px-5">
            <div className="flex flex-col items-start gap-16 md:flex-row">
              <div className="scroll-animate flex-1">
                <Icon
                  icon="solar:users-group-rounded-linear"
                  className="mb-7 block text-5xl text-zinc-700"
                  aria-hidden="true"
                />
                <h2 className="mb-8 text-3xl font-bold leading-snug tracking-normal text-white md:text-[44px]">
                  {t("offerTitle")}
                </h2>
                <p className="mb-8 max-w-xl text-base leading-7 text-zinc-400">
                  {t("offerBody")}
                </p>
                <Link
                  href={getLocalizedMarketingPath("/early-access", locale)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-100"
                >
                  {t("offerCta")}
                  <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
                </Link>
              </div>

              <div className="reference-float scroll-animate w-full shrink-0 md:w-[360px]">
                <div
                  className="rounded-lg border border-zinc-800"
                  style={{ background: "linear-gradient(180deg,#3F3F46,#18181B)" }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-900 grayscale transition-all hover:grayscale-0">
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
                          {t("trustBadges.early")}
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
          primaryHref={getLocalizedMarketingPath("/early-access", locale)}
          secondaryCta={t("docsCta")}
          secondaryHref={getLocalizedMarketingPath("/platform", locale)}
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
  primaryHref,
  secondaryCta,
  secondaryHref,
  title,
}: {
  body: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
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
        <h2 className="mb-5 text-4xl font-bold leading-[1.05] tracking-normal text-foreground md:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-foreground/62">
          {body}
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <div>
            <Link
              href={primaryHref}
              className="flex min-h-12 items-center gap-2 rounded-lg bg-primary px-8 py-3 font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
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
            href={secondaryHref}
            className="flex min-h-12 items-center gap-2 rounded-lg border border-border bg-white px-8 py-3 font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-muted"
          >
            <Icon icon="solar:book-linear" className="text-zinc-400" aria-hidden="true" />
            {secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
