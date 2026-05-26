import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Icon } from "@/components/marketing/local-icon";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { CollectionPageJsonLd } from "@/components/marketing/structured-data";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { normalizeLocale } from "@/i18n/routing";
import { createMarketingMetadata } from "@/lib/seo/metadata";

type ComparisonCell = {
  status: "yes" | "partial" | "manual" | "notPublic";
  text: string;
};

type ComparisonRow = {
  feature: string;
  splnit: ComparisonCell;
  regfor: ComparisonCell;
  cybreg: ComparisonCell;
  vantaDrata: ComparisonCell;
  manual: ComparisonCell;
};

const columns = ["splnit", "regfor", "cybreg", "vantaDrata", "manual"] as const;

const statusClassName: Record<ComparisonCell["status"], string> = {
  manual: "border-zinc-200 bg-zinc-50 text-zinc-600",
  notPublic: "border-zinc-200 bg-white text-zinc-500",
  partial: "border-amber-200 bg-amber-50 text-amber-700",
  yes: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const statusIcon: Record<ComparisonCell["status"], string> = {
  manual: "solar:document-text-linear",
  notPublic: "solar:shield-warning-linear",
  partial: "solar:calendar-check-linear",
  yes: "solar:check-circle-linear",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const t = await getTranslations("compare.metadata");

  return createMarketingMetadata({
    description: t("description"),
    locale,
    path: "/srovnani",
    title: t("title"),
  });
}

export default async function ComparisonPage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const t = await getTranslations("compare");
  const rows = t.raw("rows") as ComparisonRow[];

  return (
    <MarketingShell>
      <CollectionPageJsonLd
        name={t("jsonLdName")}
        path={getLocalizedMarketingPath("/srovnani", locale)}
        description={t("metadata.description")}
      />
      <main>
        <section data-hero className="border-b border-border bg-white px-5 pb-16 pt-36">
          <div className="mx-auto max-w-5xl">
            <span className="section-tag mb-5">
              <Icon icon="solar:clipboard-check-linear" aria-hidden="true" />
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
                href={getLocalizedMarketingPath("/cenik", locale)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
              >
                {t("primaryCta")}
                <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
              </Link>
              <Link
                href={getLocalizedMarketingPath("/predpisy/nis2", locale)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-muted"
              >
                <Icon icon="solar:book-linear" className="text-zinc-400" aria-hidden="true" />
                {t("secondaryCta")}
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-background px-5 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="overflow-x-auto rounded-lg border border-border bg-white shadow-sm">
              <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase text-foreground/50">
                  <tr>
                    <th className="w-[240px] px-5 py-4 font-semibold">
                      {t("featureColumn")}
                    </th>
                    {columns.map((column) => (
                      <th key={column} className="px-5 py-4 font-semibold">
                        {t(`columns.${column}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row) => (
                    <tr key={row.feature} className="align-top">
                      <th className="px-5 py-5 text-sm font-semibold leading-6 text-foreground">
                        {row.feature}
                      </th>
                      {columns.map((column) => (
                        <td key={column} className="px-5 py-5">
                          <StatusCell cell={row[column]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-5 max-w-4xl text-sm leading-6 text-foreground/58">
              {t("evidenceNote")}
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-white px-5 py-20">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <span className="section-tag mb-5">
                <Icon icon="solar:plug-circle-linear" aria-hidden="true" />
                {t("whyTag")}
              </span>
              <h2 className="text-4xl font-bold tracking-normal text-foreground">
                {t("whyTitle")}
              </h2>
              <p className="mt-5 text-base leading-7 text-foreground/62">
                {t("whyBody")}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(t.raw("proofPoints") as string[]).map((point) => (
                <div key={point} className="rounded-lg border border-border bg-surface-muted p-5">
                  <Icon
                    icon="solar:check-circle-linear"
                    className="mb-4 text-2xl text-emerald-600"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-semibold leading-6 text-foreground">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}

function StatusCell({ cell }: { cell: ComparisonCell }) {
  return (
    <span
      className={`inline-flex min-h-10 items-start gap-2 rounded-lg border px-3 py-2 text-sm font-medium leading-5 ${statusClassName[cell.status]}`}
    >
      <Icon
        icon={statusIcon[cell.status]}
        className="mt-0.5 shrink-0 text-base"
        aria-hidden="true"
      />
      {cell.text}
    </span>
  );
}
