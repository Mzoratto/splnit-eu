import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LegalPage } from "@/components/legal/legal-page";
import { normalizeLocale } from "@/i18n/routing";
import { getLegalPageCopy } from "@/lib/legal/legal-page-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  return getLegalPageCopy("dpa", locale).metadata;
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
