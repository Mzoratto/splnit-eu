import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Clock3 } from "lucide-react";
import { StatusPill } from "@/components/app/status-pill";
import {
  CategoryRow,
  ContactSection,
  DocumentsSection,
  FrameworkIcon,
  HeroActions,
  TrustFooter,
  TrustTopbar,
  formatDateTime,
} from "@/components/trust-center/public-trust-ui";
import {
  getLocalizedDocumentsForFramework,
  getPublicFrameworkDetailModel,
} from "@/lib/trust-center/public-model";
import {
  getPublicTrustCopy,
  normalizeTrustLocale,
} from "@/lib/trust-center/public-copy";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ frameworkSlug: string; orgSlug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const [{ frameworkSlug, orgSlug }, requestLocale] = await Promise.all([
    params,
    getLocale(),
  ]);
  const locale = normalizeTrustLocale(requestLocale);
  const data = await getPublicFrameworkDetailModel({
    frameworkSlug,
    locale,
    orgSlug,
  });

  if (!data) {
    return {
      title: "Framework · Trust Center",
    };
  }

  const frameworkName =
    locale === "cs-CZ"
      ? data.framework.framework.nameCs
      : data.framework.framework.nameEn;

  return {
    description: `${data.trustCenter.organisationName} compliance status for ${frameworkName} (${data.framework.regulator}). Last verified ${formatDateTime(data.framework.lastAssessedAt, locale)}.`,
    openGraph: {
      images: [`/api/og/trust/${orgSlug}/${frameworkSlug}`],
    },
    title: `${frameworkName} · ${data.trustCenter.organisationName} · Trust Center`,
  };
}

export default async function TrustFrameworkPage({ params }: PageProps) {
  const [{ frameworkSlug, orgSlug }, requestLocale] = await Promise.all([
    params,
    getLocale(),
  ]);
  const locale = normalizeTrustLocale(requestLocale);
  const copy = getPublicTrustCopy(locale);
  const data = await getPublicFrameworkDetailModel({
    frameworkSlug,
    locale,
    orgSlug,
  });

  if (!data) {
    notFound();
  }

  const { framework, trustCenter } = data;
  const documents = getLocalizedDocumentsForFramework(
    framework.framework.slug,
    locale,
  );
  const passPct = widthFor(framework.verified, framework.totalControls);
  const warnPct = widthFor(framework.inProgress, framework.totalControls);
  const frameworkName =
    locale === "cs-CZ" ? framework.framework.nameCs : framework.framework.nameEn;

  return (
    <main
      className="min-h-screen bg-background text-foreground"
      style={{ "--accent": trustCenter.accentColor } as CSSProperties}
    >
      <TrustTopbar
        backHref={`/trust/${trustCenter.orgSlug}`}
        copy={copy}
        trustCenter={trustCenter}
      />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <p className="font-mono text-xs text-foreground/45">
          Trust Center / {copy.detail.breadcrumbFrameworks} / {frameworkName}
        </p>

        <article className="mt-5 rounded-[var(--r-lg)] border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <FrameworkIcon slug={framework.framework.slug} />
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
                  {copy.detail.statusEyebrow}
                </p>
                <h1 className="mt-2 text-[26px] font-medium tracking-normal">
                  {frameworkName}
                </h1>
                <p className="mt-2 text-sm leading-6 text-foreground/58">
                  {framework.regulator} · {framework.law} · {copy.detail.effective}{" "}
                  {framework.effectiveDate}
                </p>
              </div>
            </div>
            <StatusPill tone={framework.statusTone}>
              {framework.statusLabel}
            </StatusPill>
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex h-3 overflow-hidden rounded-full bg-surface-muted">
                <span
                  className="bg-[var(--status-pass)]"
                  style={{ width: `${passPct}%` }}
                />
                <span
                  className="bg-[var(--status-warn)]"
                  style={{ width: `${warnPct}%` }}
                />
              </div>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-foreground/58">
                <span>
                  {framework.verified} {copy.frameworkCard.verified}
                </span>
                <span>
                  {framework.inProgress} {copy.frameworkCard.inProgress}
                </span>
                <span>
                  {framework.notApplicable} {copy.frameworkCard.notApplicable}
                </span>
              </p>
            </div>
            {trustCenter.showFrameworkPercentages ? (
              <p className="font-mono text-4xl font-semibold">
                {framework.score ?? "-"}%
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-4 font-mono text-xs text-foreground/50">
            <span>
              {copy.detail.lastAssessed}{" "}
              {formatDateTime(framework.lastAssessedAt, locale)}
            </span>
            <span>{copy.detail.autoTested}</span>
            <span>{copy.detail.controlsInScope(framework.totalControls)}</span>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-foreground/48">
              {copy.detail.categoriesEyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-medium tracking-normal">
              {copy.detail.categoriesTitle}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-foreground/58">
            {copy.detail.categoriesDescription}
          </p>
        </div>
        <div className="mt-6 overflow-hidden rounded-[var(--r-lg)] border border-border bg-surface">
          {framework.categories.length ? (
            framework.categories.map((category) => (
              <CategoryRow
                category={category}
                copy={copy}
                key={category.category}
              />
            ))
          ) : (
            <p className="p-5 text-sm text-foreground/58">
              {copy.detail.categoriesEmpty}
            </p>
          )}
        </div>
      </section>

      <DocumentsSection
        copy={copy}
        documents={documents}
        title={copy.detail.relatedDocumentsTitle}
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-foreground/48">
            {copy.detail.aboutEyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-medium tracking-normal">
            {copy.detail.aboutTitle}
          </h2>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <InfoCard label={copy.detail.infoRegulator} value={framework.regulator} />
          <InfoCard label={copy.detail.infoLaw} value={framework.law} />
          <InfoCard label={copy.detail.infoEffective} value={framework.effectiveDate} />
          <InfoCard label={copy.detail.infoMaxPenalty} value={framework.maxPenalty} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="rounded-[var(--r-lg)] border border-border bg-surface p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h2 className="text-xl font-medium tracking-normal">
              {copy.detail.ctaTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground/58">
              {copy.detail.ctaDescription}
            </p>
          </div>
          <HeroActions copy={copy} orgName={trustCenter.organisationName} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="rounded-[var(--r-lg)] border border-border bg-surface-muted p-5">
          <div className="flex items-start gap-3">
            <ShieldNoticeIcon />
            <div>
              <h2 className="text-sm font-semibold">
                {copy.detail.disclosureTitle}
              </h2>
              <p className="mt-2 text-sm leading-6 text-foreground/62">
                {copy.detail.disclosureBody}
              </p>
            </div>
          </div>
        </div>
      </section>

      <ContactSection
        contactEmails={trustCenter.contactEmails}
        copy={copy}
        orgName={trustCenter.organisationName}
      />
      <TrustFooter
        backHref={`/trust/${trustCenter.orgSlug}`}
        copy={copy}
        locale={locale}
        trustCenter={trustCenter}
      />
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--r-lg)] border border-border bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-foreground/45">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function ShieldNoticeIcon() {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--r-md)] bg-[var(--accent-subtle)] text-[var(--accent)]">
      <Clock3 className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}

function widthFor(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 1000) / 10;
}
