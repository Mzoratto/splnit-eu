import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";
import { getMessagesForLocale } from "./messages";
import { normalizeLocale, routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const headerLocale = normalizeLocale(
    (await headers()).get("X-NEXT-INTL-LOCALE"),
  );
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : (headerLocale ?? routing.defaultLocale);

  return {
    locale,
    messages: getMessagesForLocale(locale),
  };
});
