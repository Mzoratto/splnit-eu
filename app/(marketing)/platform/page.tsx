import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { SoftwareApplicationJsonLd } from "@/components/marketing/software-json-ld";
import { normalizeLocale } from "@/i18n/routing";
import { getPlatformCopy } from "@/lib/marketing/platform-copy";
import { createMarketingMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = getPlatformCopy(locale);

  return createMarketingMetadata({
    description: copy.metadata.description,
    locale,
    path: "/platform",
    title: copy.metadata.title,
  });
}

export default async function PlatformPage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = getPlatformCopy(locale);

  return (
    <MarketingShell>
      <SoftwareApplicationJsonLd
        pageName={copy.pageName}
        path="/platform"
        description={copy.jsonLdDescription}
        locale={locale}
      />
      <main>
        <section data-hero className="bg-white px-5 pb-20 pt-32">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <span className="section-tag mb-5">{copy.hero.tag}</span>
              <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-900 md:text-[68px]">
                {copy.hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-500">
                {copy.hero.body}
              </p>
              <Link
                href="mailto:hello@splnit.eu?subject=Demo%20Splnit.eu"
                className="mt-8 inline-flex rounded-full bg-zinc-900 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                {copy.hero.cta}
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="grid gap-6 md:grid-cols-3">
              {copy.steps.map((step, index) => (
                <article
                  key={step.title}
                  className="scroll-animate"
                >
                  <div className="mb-5 flex items-center">
                    <div className="z-10 flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-200">
                      {index + 1}
                    </div>
                    {index < copy.steps.length - 1 ? (
                      <div className="mx-3 hidden h-px flex-1 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 md:block" />
                    ) : null}
                  </div>
                  <div className="rounded-[22px] p-px grad-border">
                    <div className="h-full rounded-[21px] bg-white p-7">
                      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon icon={step.icon} className="text-2xl" aria-hidden="true" />
                      </div>
                      <h2 className="mb-2 text-lg font-semibold text-zinc-900">
                        {step.title}
                      </h2>
                      <p className="text-sm leading-6 text-zinc-500">{step.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="integrations" className="overflow-hidden border-t border-zinc-200/50 py-20">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-5 lg:flex-row">
            <div className="scroll-animate w-full lg:w-1/2">
              <div className="rounded-[26px] p-px grad-border">
                <div className="overflow-hidden rounded-[25px] bg-zinc-50 p-8">
                  <p className="mono mb-6 text-[11px] font-medium uppercase tracking-widest text-zinc-400">
                    {copy.integrations.available}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      ["logos:microsoft", "Microsoft 365"],
                      ["logos:github-icon", "GitHub"],
                      ["logos:aws", "AWS"],
                    ].map(([icon, label]) => (
                      <div
                        key={label}
                        className="int-item flex cursor-default flex-col items-center gap-2 rounded-xl border border-zinc-100 bg-white p-3.5"
                      >
                        <Icon icon={icon} className="text-2xl" aria-hidden="true" />
                        <span className="text-center text-[10px] font-medium text-zinc-500">
                          {label}
                        </span>
                      </div>
                    ))}
                    <div className="int-item col-span-3 flex cursor-default items-center gap-3 rounded-xl border border-emerald-800/50 bg-emerald-950 p-3.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-900">
                        <Icon
                          icon="solar:shield-network-linear"
                          className="text-lg text-emerald-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-emerald-100">
                            {copy.integrations.localSourcesTitle}
                          </span>
                          <span className="nukib-chip">
                            {copy.integrations.localSourcesBadge}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-500">
                          {copy.integrations.localSourcesBody}
                        </span>
                      </div>
                      <div className="pulse-dot h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="scroll-animate w-full lg:w-1/2">
              <span className="section-tag mb-5">{copy.integrations.tag}</span>
              <h2 className="mb-5 text-3xl font-semibold leading-[1.1] tracking-[-0.04em] text-zinc-900 lg:text-[44px]">
                {copy.integrations.title}
              </h2>
              <p className="mb-7 max-w-lg text-base leading-relaxed text-zinc-500">
                {copy.integrations.body}
              </p>
              <ul className="space-y-3.5">
                {copy.integrations.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Icon
                      icon="solar:check-circle-linear"
                      className="mt-0.5 shrink-0 text-xl text-blue-600"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-zinc-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-zinc-950 py-24">
          <div className="mx-auto max-w-5xl px-5 text-center">
            <span className="section-tag mb-5 border-blue-500/30 bg-blue-500/10 text-blue-300">
              {copy.crossMapping.tag}
            </span>
            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
              {copy.crossMapping.title}
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-zinc-400">
              {copy.crossMapping.body}
            </p>
            <div className="mono mx-auto mt-10 max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-left text-sm text-zinc-300">
              <p className="text-blue-300">ctrl_mfa_all_users</p>
              {copy.crossMapping.references.map((reference, index) => (
                <p
                  key={reference}
                  className={index === 0 ? "mt-3 text-emerald-400" : "text-emerald-400"}
                >
                  ✓ {reference}
                </p>
              ))}
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {copy.crossMapping.stats.map((stat) => (
                <div
                  key={stat}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 text-xl font-semibold text-white"
                >
                  {stat}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="monitoring" className="border-t border-zinc-200/50 py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-12 max-w-3xl">
              <span className="section-tag mb-5">{copy.evidence.tag}</span>
              <h2 className="text-4xl font-semibold tracking-[-0.04em] text-zinc-900">
                {copy.evidence.title}
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {copy.evidence.cards.map((item) => (
                <article key={item.title} className="rounded-[22px] p-px grad-border">
                  <div className="h-full rounded-[21px] bg-white p-7">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon icon={item.icon} className="text-2xl" aria-hidden="true" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-6 text-zinc-500">{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="trust-center" className="border-t border-zinc-200/50 bg-white py-20">
          <div className="mx-auto max-w-4xl px-5">
            <div className="rounded-[2rem] border border-blue-100 bg-blue-50/40 p-8 md:p-12">
              <h3 className="text-3xl font-semibold tracking-[-0.03em] text-zinc-900">
                {copy.trustCenter.title}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                {copy.trustCenter.body}
              </p>
              <div className="mono mt-6 w-fit rounded-full border border-blue-100 bg-white px-4 py-2 text-xs text-blue-700">
                splnit.eu/trust/demo
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {copy.trustCenter.badges.map((badge) => (
                    <span
                      key={badge}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                        badge.includes("EU AI Act")
                          ? "border-amber-100 bg-amber-50 text-amber-700"
                          : "border-emerald-100 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {badge}
                    </span>
                ))}
              </div>
              <Link
                href="/trust/demo"
                className="mt-8 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {copy.trustCenter.cta}
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-200/50 bg-white py-10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-5 text-sm font-medium text-zinc-600 md:gap-16">
            {copy.trustBadges.map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-zinc-500">
            {copy.finalNote}
          </p>
        </section>
      </main>
    </MarketingShell>
  );
}
