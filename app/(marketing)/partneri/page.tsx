import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { CollectionPageJsonLd } from "@/components/marketing/structured-data";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { normalizeLocale } from "@/i18n/routing";
import { createMarketingMetadata } from "@/lib/seo/metadata";
import { PLANS } from "@/lib/stripe/plans";

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const t = await getTranslations("partners.metadata");

  return createMarketingMetadata({
    description: t("description"),
    locale,
    path: "/partneri",
    title: t("title"),
  });
}

export default async function PartnersPage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const t = await getTranslations("partners");
  const benefits = t.raw("benefits") as Array<{ icon: string; title: string; body: string }>;
  const workflow = t.raw("workflow") as string[];

  return (
    <MarketingShell>
      <CollectionPageJsonLd
        name={t("jsonLdName")}
        path={getLocalizedMarketingPath("/partneri", locale)}
        description={t("metadata.description")}
      />
      <main>
        <section data-hero className="border-b border-border bg-white px-5 pb-16 pt-36">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <span className="section-tag mb-5">
                <Icon icon="solar:users-group-rounded-linear" aria-hidden="true" />
                {t("eyebrow")}
              </span>
              <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-normal text-foreground md:text-[68px]">
                {t("title")}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-foreground/62">
                {t("subtitle")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={getLocalizedMarketingPath("/agency/signup", locale)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
                >
                  {t("primaryCta")}
                  <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
                </Link>
                <Link
                  href={getLocalizedMarketingPath("/cenik", locale)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-muted"
                >
                  <Icon icon="solar:bill-list-linear" className="text-zinc-400" aria-hidden="true" />
                  {t("secondaryCta")}
                </Link>
              </div>
            </div>

            <aside className="rounded-lg border border-border bg-slate-900 p-6 text-white shadow-sm">
              <p className="text-sm font-medium text-[var(--color-green-200)]">{PLANS.agency.name}</p>
              <p className="mt-3 font-mono text-4xl font-semibold">
                {PLANS.agency.displayPrice}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                {t("planSummary", { clients: PLANS.agency.limits.clients })}
              </p>
            </aside>
          </div>
        </section>

        <section className="bg-background px-5 py-16">
          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-lg border border-border bg-white p-6 shadow-sm">
                <Icon
                  icon={benefit.icon}
                  className="mb-5 text-3xl text-primary"
                  aria-hidden="true"
                />
                <h2 className="text-xl font-semibold text-foreground">{benefit.title}</h2>
                <p className="mt-3 text-sm leading-6 text-foreground/62">{benefit.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-white px-5 py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <span className="section-tag mb-5">
                <Icon icon="solar:checklist-minimalistic-linear" aria-hidden="true" />
                {t("workflowTag")}
              </span>
              <h2 className="text-4xl font-bold tracking-normal text-foreground">
                {t("workflowTitle")}
              </h2>
              <p className="mt-5 text-base leading-7 text-foreground/62">
                {t("workflowBody")}
              </p>
            </div>
            <ol className="grid gap-3">
              {workflow.map((item, index) => (
                <li
                  key={item}
                  className="flex gap-4 rounded-lg border border-border bg-surface-muted p-5 text-sm font-medium leading-6 text-foreground"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
