import csCZ from "../messages/cs-CZ.json";
import enEU from "../messages/en-EU.json";
import itIT from "../messages/it-IT.json";
import type { Locale } from "./routing";

export const messagesByLocale: Record<Locale, typeof csCZ> = {
  "cs-CZ": csCZ,
  "en-EU": enEU,
  "it-IT": itIT,
};

export function getMessagesForLocale(locale: Locale) {
  return messagesByLocale[locale];
}
