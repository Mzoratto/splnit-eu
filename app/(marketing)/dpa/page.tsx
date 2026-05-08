import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LegalPage } from "@/components/legal/legal-page";
import { normalizeLocale } from "@/i18n/routing";
import { getLegalPageCopy } from "@/lib/legal/legal-page-copy";
import { createMarketingMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const metadata = getLegalPageCopy("dpa", locale).metadata;

  return createMarketingMetadata({
    description: metadata.description ?? "",
    locale,
    path: "/dpa",
    title: String(metadata.title),
  });
}

export default async function DpaPage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = getLegalPageCopy("dpa", locale);

  return (
    <LegalPage
      title={copy.title}
      intro={copy.intro}
      sections={copy.sections}
    />
  );
}
