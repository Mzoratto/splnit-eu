import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  ContactSection,
  DocumentsSection,
  FrameworkCard,
  HeroActions,
  LiveIndicator,
  TrustFooter,
  TrustSignalsStrip,
  TrustTopbar,
} from "@/components/trust-center/public-trust-ui";
import { getPublicTrustCenterModel } from "@/lib/trust-center/public-model";
import {
  getPublicTrustCopy,
  normalizeTrustLocale,
} from "@/lib/trust-center/public-copy";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ access?: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}): Promise<Metadata> {
  const [{ orgSlug }, requestLocale] = await Promise.all([params, getLocale()]);
  const locale = normalizeTrustLocale(requestLocale);
  const copy = getPublicTrustCopy(locale);
  const trustCenter = await getPublicTrustCenterModel({ locale, orgSlug });

  if (!trustCenter) {
    return {
      title: "Trust Center",
    };
  }

  return {
    description: copy.main.metadataDescription(trustCenter.organisationName),
    title: `${trustCenter.organisationName} · Trust Center`,
  };
}

export default async function TrustCenterPage({
  params,
  searchParams,
}: PageProps) {
  const [{ orgSlug }, query, requestLocale] = await Promise.all([
    params,
    searchParams,
    getLocale(),
  ]);
  const locale = normalizeTrustLocale(requestLocale);
  const copy = getPublicTrustCopy(locale);
  const trustCenter = await getPublicTrustCenterModel({
    accessToken: query.access ?? null,
    locale,
    orgSlug,
  });

  if (!trustCenter) {
    notFound();
  }

  const accessQuery = query.access ? `?access=${encodeURIComponent(query.access)}` : "";
  const frameworkCount = trustCenter.frameworks.length;
  const controlCount = trustCenter.frameworks.reduce(
    (total, item) => total + item.totalControls,
    0,
  );

  return (
    <main
      className="min-h-screen bg-background text-foreground"
      style={{ "--accent": trustCenter.accentColor } as CSSProperties}
    >
      <TrustTopbar copy={copy} trustCenter={trustCenter} />

      <section className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:pt-16">
        <div className="max-w-4xl">
          <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {trustCenter.heroEyebrowOverride ?? copy.main.heroEyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl text-[32px] font-medium leading-tight tracking-normal text-foreground sm:text-[40px]">
            {trustCenter.heroTitleOverride ??
              copy.main.heroTitle(
                trustCenter.organisationName,
                controlCount,
                frameworkCount,
              )}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-foreground/62">
            {trustCenter.descriptionOverride ?? copy.main.description}
          </p>
          {trustCenter.showLiveIndicator === false ? null : (
            <LiveIndicator
              copy={copy}
              lastTestedAt={trustCenter.lastTestedAt}
              locale={locale}
              nextTestAt={trustCenter.nextTestAt}
            />
          )}
          <HeroActions copy={copy} orgName={trustCenter.organisationName} />
        </div>
      </section>

      <TrustSignalsStrip signals={trustCenter.trustSignals} />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-foreground/48">
              {copy.main.frameworksEyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-medium tracking-normal">
              {copy.main.frameworksTitle}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-foreground/58">
            {copy.main.frameworksBody}
          </p>
        </div>
        <div className="mt-6 grid gap-4">
          {trustCenter.frameworks.map((framework) => (
            <FrameworkCard
              copy={copy}
              key={framework.framework.slug}
              framework={framework}
              href={`/trust/${trustCenter.orgSlug}/frameworks/${framework.framework.slug}${accessQuery}`}
              locale={locale}
              showDrilldown={trustCenter.showFrameworkDrilldown}
              showPercentages={trustCenter.showFrameworkPercentages}
            />
          ))}
        </div>
      </section>

      <DocumentsSection copy={copy} documents={trustCenter.documents} />
      <ContactSection
        contactEmails={trustCenter.contactEmails}
        copy={copy}
        orgName={trustCenter.organisationName}
      />
      <TrustFooter copy={copy} locale={locale} trustCenter={trustCenter} />
    </main>
  );
}
