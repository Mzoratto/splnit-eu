import { defineRouting } from "next-intl/routing";

export const locales = ["cs-CZ", "en-EU", "it-IT"] as const;
export const localeCookieName = "NEXT_LOCALE";

export const routing = defineRouting({
  locales,
  defaultLocale: "cs-CZ",
  localeDetection: true,
  localePrefix: "never",
});

export type Locale = (typeof locales)[number];

export function normalizeLocale(value: string | null | undefined): Locale | null {
  switch (value?.toLowerCase()) {
    case "cs":
    case "cs-cz":
      return "cs-CZ";
    case "en":
    case "en-eu":
    case "en-gb":
    case "en-us":
      return "en-EU";
    case "it":
    case "it-it":
      return "it-IT";
    default:
      return null;
  }
}
