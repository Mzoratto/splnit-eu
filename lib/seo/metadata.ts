import type { Metadata } from "next";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { locales, type Locale } from "@/i18n/routing";

export const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL || "https://splnit.eu"
).replace(/\/$/, "");

export const defaultOgImage = {
  alt: "Splnit.eu compliance automation dashboard",
  height: 630,
  url: "/opengraph-image",
  width: 1200,
};

const openGraphLocales: Record<Locale, string> = {
  "cs-CZ": "cs_CZ",
  "en-EU": "en_EU",
  "it-IT": "it_IT",
};

const hreflangLocales: Record<Locale, string> = {
  "cs-CZ": "cs-CZ",
  "en-EU": "en",
  "it-IT": "it-IT",
};

export function absoluteUrl(path = "/") {
  return `${siteUrl}${path === "/" ? "" : path}`;
}

export function getMarketingAlternates(path: string) {
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    languages[hreflangLocales[locale]] = absoluteUrl(
      getLocalizedMarketingPath(path, locale),
    );
  }

  languages["x-default"] = absoluteUrl("/");
  return languages;
}

export function getCanonicalUrl(path: string, locale: Locale) {
  return absoluteUrl(getLocalizedMarketingPath(path, locale));
}

type MarketingMetadataOptions = {
  description: string;
  locale: Locale;
  path: string;
  title: string;
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
};

export function createMarketingMetadata({
  description,
  locale,
  noIndex = false,
  path,
  publishedTime,
  title,
  type = "website",
}: MarketingMetadataOptions): Metadata {
  const canonical = getCanonicalUrl(path, locale);
  const metadata: Metadata = {
    alternates: {
      canonical,
      languages: getMarketingAlternates(path),
    },
    description,
    openGraph: {
      description,
      images: [defaultOgImage],
      locale: openGraphLocales[locale],
      publishedTime,
      title,
      type,
      url: canonical,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [defaultOgImage.url],
      title,
    },
  };

  if (noIndex) {
    metadata.robots = {
      follow: false,
      index: false,
    };
  }

  return metadata;
}

export function createNoIndexMetadata(title: string): Metadata {
  return {
    robots: {
      follow: false,
      index: false,
    },
    title,
  };
}
