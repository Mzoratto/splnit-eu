import { defineRouting } from "next-intl/routing";

export const locales = ["cs", "en"] as const;

export const routing = defineRouting({
  locales,
  defaultLocale: "cs",
  localeDetection: true,
  localePrefix: "never",
});

export type Locale = (typeof locales)[number];
