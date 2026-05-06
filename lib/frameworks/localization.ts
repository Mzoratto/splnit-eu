import type { Locale } from "@/i18n/routing";

type FrameworkDisplay = {
  descriptionCs?: string | null;
  descriptionEn?: string | null;
  descriptionIt?: string | null;
  nameCs: string;
  nameEn: string;
  nameIt?: string | null;
  regulator?: string | null;
  regulatorIt?: string | null;
  slug: string;
};

export function getFrameworkDisplayName(
  framework: FrameworkDisplay,
  locale: Locale,
) {
  const names: Record<Locale, string | null | undefined> = {
    "cs-CZ": framework.nameCs,
    "en-EU": framework.nameEn,
    "it-IT": framework.nameIt ?? framework.nameEn,
  };

  return names[locale] ?? framework.nameEn;
}

export function getFrameworkDisplayDescription(
  framework: FrameworkDisplay,
  locale: Locale,
  descriptions: Record<string, string>,
) {
  const localizedMessage = descriptions[framework.slug];
  const descriptionsByLocale: Record<Locale, string | null | undefined> = {
    "cs-CZ": framework.descriptionCs,
    "en-EU": framework.descriptionEn ?? localizedMessage,
    "it-IT": framework.descriptionIt ?? localizedMessage,
  };

  return (
    descriptionsByLocale[locale] ??
    localizedMessage ??
    framework.descriptionCs ??
    framework.nameEn
  );
}

export function getFrameworkDisplayRegulator(
  framework: FrameworkDisplay,
  locale: Locale,
  regulators: Record<string, string>,
) {
  const localizedMessage = regulators[framework.slug];
  const regulatorsByLocale: Record<Locale, string | null | undefined> = {
    "cs-CZ": framework.regulator,
    "en-EU": localizedMessage,
    "it-IT": framework.regulatorIt ?? localizedMessage,
  };

  return regulatorsByLocale[locale] ?? localizedMessage ?? framework.regulator ?? "";
}
