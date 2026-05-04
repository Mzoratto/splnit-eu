import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import csCZ from "../messages/cs-CZ.json";
import enEU from "../messages/en-EU.json";
import itIT from "../messages/it-IT.json";
import { routing, type Locale } from "./routing";

const messages: Record<Locale, typeof csCZ> = {
  "cs-CZ": csCZ,
  "en-EU": enEU,
  "it-IT": itIT,
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  return {
    locale,
    messages: messages[locale],
  };
});
