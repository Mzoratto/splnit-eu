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
  {
    href: "/predpisy/nis2",
    icon: "solar:download-minimalistic-linear",
    key: "templates",
  },
  {
    icon: "solar:document-add-linear",
    key: "smartDocuments",
  },
  {
    icon: "solar:link-round-angle-linear",
    key: "clientAccess",
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
                    className="flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[var(--color-brand-700)] px-8 py-3 font-semibold text-white shadow-[var(--shadow-sm)] transition-colors duration-[var(--duration-base)] hover:bg-[var(--color-brand-600)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-400)] focus-visible:ring-offset-2"
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
              {steps.map((step, index) => (
                <article
                  key={step.key}
                  className="scroll-animate relative rounded-lg border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)]"
                >
                  {index < steps.length - 1 ? (
                    <div className="pointer-events-none absolute right-[-24px] top-1/2 hidden w-12 border-t-2 border-dashed border-[var(--color-border)] md:block" />
                  ) : null}
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-800)] text-sm font-semibold text-white shadow-[var(--shadow-sm)]">
                      {index + 1}
                    </div>
                    <span className="text-xs font-bold uppercase text-foreground/38">
                      0{index + 1}
                    </span>
                  </div>
                  <StepVisual index={index} />
                  <h3 className="mt-6 mb-2 text-base font-semibold text-zinc-900">
                    {t(`steps.${step.key}Title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-500">
                    {t(`steps.${step.key}Body`)}
                  </p>
                </article>
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
                    {feature.href ? (
                      <Link
                        href={feature.href}
                        className="mt-5 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {t(`features.${feature.key}Link`)}
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href={getLocalizedMarketingPath("/srovnani", locale)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-[var(--accent-hover)]"
              >
                {t("compareCta")}
                <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-20">
          <div className="mx-auto max-w-3xl px-5">
            <div className="scroll-animate">
              <LeadCapture />
              <div className="mt-6 text-center">
                <Link
                  href={getLocalizedMarketingPath("/nastroje/nis2-kalkulator", locale)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-[var(--accent-hover)]"
                >
                  {t("regulatoryProfileCta")}
                  <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
                </Link>
              </div>
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

function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="flex min-h-32 items-center justify-between gap-4 rounded-lg bg-[var(--color-brand-050)] px-4 py-5">
        <div className="grid gap-2 text-sm font-bold">
          <span className="inline-flex items-center gap-2 text-[#2563eb]">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-[#2563eb] text-[10px] text-white">
              M
            </span>
            M365
          </span>
          <span className="text-[var(--color-brand-700)]">Pohoda</span>
          <span className="text-[#f59e0b]">aws</span>
        </div>
        <div className="h-px flex-1 border-t-2 border-dashed border-[var(--color-brand-400)]" />
        <div className="grid h-14 w-14 place-items-center rounded-xl border border-[var(--color-brand-400)] bg-white text-[var(--color-brand-700)] shadow-[var(--shadow-sm)]">
          <Icon icon="solar:shield-check-linear" className="text-3xl" aria-hidden="true" />
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="relative grid min-h-32 place-items-center overflow-hidden rounded-lg bg-[var(--color-brand-050)]">
        <div
          className="scan-line absolute left-8 right-8 h-px"
          style={{ backgroundColor: "rgb(202 138 4 / 0.3)" }}
        />
        <svg
          viewBox="0 0 100 100"
          className="h-24 w-24 text-[var(--color-warn)]"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            fill="none"
            r="36"
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeWidth="8"
          />
          <circle
            className="scan-arc"
            cx="50"
            cy="50"
            fill="none"
            r="36"
            stroke="currentColor"
            strokeDasharray="82 226"
            strokeLinecap="round"
            strokeWidth="8"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="grid min-h-32 gap-2 rounded-lg bg-[var(--color-brand-050)] p-4">
      {[
        ["GDPR", "PASS", "w-10/12", "var(--color-pass)", "var(--color-pass-bg)"],
        ["NIS2", "WARN", "w-8/12", "var(--color-warn)", "var(--color-warn-bg)"],
        ["27001", "PASS", "w-10/12", "var(--color-pass)", "var(--color-pass-bg)"],
      ].map(([label, status, width, color, background]) => (
        <div
          key={label}
          className="grid grid-cols-[44px_1fr_auto] items-center gap-2 rounded-md bg-white px-3 py-2 text-[11px] font-bold shadow-[var(--shadow-sm)]"
        >
          <span className="text-foreground/72">{label}</span>
          <span className="h-2 rounded-full bg-gray-100">
            <span
              className={`block h-full rounded-full ${width}`}
              style={{ backgroundColor: color }}
            />
          </span>
          <span
            className="rounded px-1.5 py-0.5"
            style={{ backgroundColor: background, color }}
          >
            {status}
          </span>
        </div>
      ))}
    </div>
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
