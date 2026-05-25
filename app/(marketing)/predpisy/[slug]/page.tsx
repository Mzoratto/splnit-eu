import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { WebPageJsonLd } from "@/components/marketing/structured-data";
import { TemplateSection } from "@/components/templates/template-section";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { normalizeLocale } from "@/i18n/routing";
import { localizeFrameworkDetail } from "@/lib/marketing/framework-detail-copy";
import {
  frameworkDetails,
  getFrameworkDetail,
} from "@/lib/marketing/frameworks";
import { createMarketingMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return frameworkDetails.map((framework) => ({ slug: framework.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const baseFramework = getFrameworkDetail(slug);

  if (!baseFramework) {
    return {};
  }

  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const framework = localizeFrameworkDetail(baseFramework, locale);
  const t = await getTranslations("regulations.detail");

  const title = `${framework.name} | ${t("metadataTitleSuffix")}`;
  const description = t("metadataDescription", { name: framework.name });

  return createMarketingMetadata({
    description,
    locale,
    path: `/predpisy/${framework.slug}`,
    title,
    type: "article",
  });
}

export default async function RegulationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseFramework = getFrameworkDetail(slug);

  if (!baseFramework) {
    notFound();
  }

  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const framework = localizeFrameworkDetail(baseFramework, locale);
  const t = await getTranslations("regulations.detail");

  return (
    <MarketingShell>
      <WebPageJsonLd
        name={`Splnit.eu ${framework.name}`}
        path={getLocalizedMarketingPath(`/predpisy/${framework.slug}`, locale)}
        description={t("jsonLdDescription", { name: framework.name })}
      />
      <main>
        <section data-hero className="px-5 pb-16 pt-32">
          <div className="mx-auto max-w-5xl">
            <Link
              href={getLocalizedMarketingPath("/predpisy", locale)}
              className="mb-8 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {t("backLink")}
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {framework.regulator}
              </span>
              <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
                {framework.deadline}
              </span>
              <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
                {framework.law}
              </span>
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-900 md:text-[72px]">
              {framework.name}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-500">
              {framework.hero}
            </p>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-16">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <span className="section-tag mb-5">{t("appliesTag")}</span>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-zinc-900">
                {t("appliesTitle")}
              </h2>
            </div>
            <ul className="grid gap-3">
              {framework.appliesTo.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600"
                >
                  <Icon
                    icon="solar:check-circle-linear"
                    className="mt-0.5 shrink-0 text-xl text-blue-600"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 py-16">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-10">
              <span className="section-tag mb-5">{t("obligationsTag")}</span>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-zinc-900">
                {t("obligationsTitle")}
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {framework.obligations.map((obligation) => (
                <article
                  key={obligation.title}
                  className="rounded-[22px] p-px grad-border"
                >
                  <div className="h-full rounded-[21px] bg-white p-6">
                    <p className="mono mb-3 text-xs text-blue-600">
                      {obligation.reference}
                    </p>
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {obligation.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {obligation.description}
                    </p>
                    <p className="mt-5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                      {t("deadlineLabel")}: {obligation.deadline}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 bg-white py-16">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-10">
              <span className="section-tag mb-5">
                {framework.riskSection?.tag ?? t("finesTag")}
              </span>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-zinc-900">
                {framework.riskSection?.title ?? t("finesTitle")}
              </h2>
            </div>
            <div className="overflow-hidden rounded-[24px] border border-zinc-200">
              <div className="grid grid-cols-3 bg-zinc-50 px-5 py-3 text-xs font-semibold text-zinc-600">
                <span>{framework.riskSection?.violationHeader ?? t("violationHeader")}</span>
                <span>{framework.riskSection?.maximumHeader ?? t("maximumHeader")}</span>
                <span>{framework.riskSection?.enforcerHeader ?? t("enforcerHeader")}</span>
              </div>
              {framework.fines.map((fine) => (
                <div
                  key={fine.violation}
                  className="grid grid-cols-3 border-t border-zinc-100 px-5 py-4 text-sm text-zinc-600"
                >
                  <span className="font-medium text-zinc-900">{fine.violation}</span>
                  <span>{fine.maximum}</span>
                  <span>{fine.enforcer}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200/50 py-16">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-10">
              <span className="section-tag mb-5">{t("helpsTag")}</span>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-zinc-900">
                {t("helpsTitle")}
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {framework.splnitHelps.map((item) => (
                <article key={item.title} className="rounded-[22px] p-px grad-border">
                  <div className="h-full rounded-[21px] bg-white p-7">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon icon={item.icon} className="text-2xl" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
            <Link
              href={getLocalizedMarketingPath("/platform", locale)}
              className="mt-8 inline-flex rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              {t("platformCta")}
            </Link>
          </div>
        </section>

        {framework.relatedFrameworks?.length ? (
          <section className="border-t border-zinc-200/50 bg-white py-16">
            <div className="mx-auto max-w-5xl px-5">
              <span className="section-tag mb-5">{t("relatedTag")}</span>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-zinc-900">
                {t("relatedTitle", { name: framework.name })}
              </h2>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {framework.relatedFrameworks.map((related) => (
                  <Link
                    key={related.slug}
                    href={getLocalizedMarketingPath(`/predpisy/${related.slug}`, locale)}
                    className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <span className="text-sm font-semibold text-blue-700">
                      {related.name} →
                    </span>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      {related.reason}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {framework.relatedArticles?.length ? (
          <section className="border-t border-zinc-200/50 bg-white py-16">
            <div className="mx-auto max-w-5xl px-5">
              <span className="section-tag mb-5">{t("relatedArticlesTag")}</span>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-zinc-900">
                {t("relatedArticlesTitle")}
              </h2>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {framework.relatedArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={getLocalizedMarketingPath(`/blog/${article.slug}`, locale)}
                    className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <span className="text-sm font-semibold text-blue-700">
                      {article.title} →
                    </span>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      {article.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <TemplateSection regulationSlug={slug} variant="public" />

        <section className="border-t border-zinc-200/50 bg-white py-16">
          <div className="mx-auto max-w-5xl px-5">
            <div className="rounded-[2rem] border border-blue-100 bg-blue-50/40 p-8 md:p-10">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-900">
                {t("resourcesTitle")}
              </h2>
              <div className="mt-6 flex flex-wrap gap-2">
                {framework.resources.map((resource) => (
                  <Link
                    key={resource}
                    href={`mailto:hello@splnit.eu?subject=${encodeURIComponent(resource)}`}
                    className="rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-blue-200 hover:text-blue-700"
                  >
                    {resource}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
