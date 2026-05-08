import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LegalPage } from "@/components/legal/legal-page";
import { normalizeLocale } from "@/i18n/routing";
import { getLegalPageCopy } from "@/lib/legal/legal-page-copy";
import { createMarketingMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const metadata = getLegalPageCopy("terms", locale).metadata;

  return createMarketingMetadata({
    description: metadata.description ?? "",
    locale,
    path: "/podminky",
    title: String(metadata.title),
  });
}

export default async function TermsPage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = getLegalPageCopy("terms", locale);

  return (
    <LegalPage
      title={copy.title}
      intro={copy.intro}
      sections={copy.sections}
    />
  );
}
