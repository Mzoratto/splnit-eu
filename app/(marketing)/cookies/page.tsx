import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { CookieSettingsButton } from "@/components/legal/cookie-settings-button";
import { LegalPage } from "@/components/legal/legal-page";
import { normalizeLocale } from "@/i18n/routing";
import { getLegalPageCopy } from "@/lib/legal/legal-page-copy";
import { createMarketingMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const metadata = getLegalPageCopy("cookies", locale).metadata;

  return createMarketingMetadata({
    description: metadata.description ?? "",
    locale,
    path: "/cookies",
    title: String(metadata.title),
  });
}

export default async function CookiesPage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = getLegalPageCopy("cookies", locale);
  if (!copy.buttonLabel) {
    throw new Error("Missing cookie settings button label");
  }

  return (
    <LegalPage
      title={copy.title}
      intro={copy.intro}
      sections={copy.sections}
    >
      <CookieSettingsButton label={copy.buttonLabel} />
    </LegalPage>
  );
}
