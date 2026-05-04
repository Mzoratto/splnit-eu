import type { CSSProperties } from "react";
import type { Metadata } from "next";
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
  const { orgSlug } = await params;
  const trustCenter = await getPublicTrustCenterModel({ orgSlug });

  if (!trustCenter) {
    return {
      title: "Trust Center",
    };
  }

  return {
    description: `${trustCenter.organisationName} průběžně ověřuje bezpečnostní kontroly, dokumenty a stav souladu s EU předpisy.`,
    title: `${trustCenter.organisationName} · Trust Center`,
  };
}

export default async function TrustCenterPage({
  params,
  searchParams,
}: PageProps) {
  const [{ orgSlug }, query] = await Promise.all([params, searchParams]);
  const trustCenter = await getPublicTrustCenterModel({
    accessToken: query.access ?? null,
    orgSlug,
  });

  if (!trustCenter) {
    notFound();
  }

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
      <TrustTopbar trustCenter={trustCenter} />

      <section className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:pt-16">
        <div className="max-w-4xl">
          <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            TRUST CENTER · VERIFIED CONTINUOUSLY
          </p>
          <h1 className="mt-5 max-w-4xl text-[32px] font-medium leading-tight tracking-normal text-foreground sm:text-[40px]">
            {`${trustCenter.organisationName} průběžně testuje ${controlCount} bezpečnostních kontrol napříč ${frameworkCount} EU předpisy.`}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-foreground/62">
            Tento Trust Center ukazuje veřejný souhrn automatických kontrol,
            regulatorních frameworků a dokumentů. Detaily důkazů a konkrétní
            control IDs zůstávají chráněné a jsou dostupné pouze po schválení
            přístupu.
          </p>
          <LiveIndicator
            lastTestedAt={trustCenter.lastTestedAt}
            nextTestAt={trustCenter.nextTestAt}
          />
          <HeroActions orgName={trustCenter.organisationName} />
        </div>
      </section>

      <TrustSignalsStrip signals={trustCenter.trustSignals} />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-foreground/48">
              FRAMEWORKS
            </p>
            <h2 className="mt-2 text-2xl font-medium tracking-normal">
              Stav EU předpisů
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-foreground/58">
            Skóre je agregované z kontrol v rozsahu. Veřejná stránka zobrazuje
            souhrny kategorií, ne jednotlivé testy nebo názvy důkazů.
          </p>
        </div>
        <div className="mt-6 grid gap-4">
          {trustCenter.frameworks.map((framework) => (
            <FrameworkCard
              key={framework.framework.slug}
              framework={framework}
              href={`/trust/${trustCenter.orgSlug}/frameworks/${framework.framework.slug}`}
              showDrilldown={trustCenter.showFrameworkDrilldown}
              showPercentages={trustCenter.showFrameworkPercentages}
            />
          ))}
        </div>
      </section>

      <DocumentsSection documents={trustCenter.documents} />
      <ContactSection orgName={trustCenter.organisationName} />
      <TrustFooter trustCenter={trustCenter} />
    </main>
  );
}
