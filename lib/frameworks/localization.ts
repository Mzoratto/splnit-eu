import type { Locale } from "@/i18n/routing";

type FrameworkDisplay = {
  descriptionCs?: string | null;
  nameCs: string;
  nameEn: string;
  regulator?: string | null;
  slug: string;
};

export function getFrameworkDisplayName(
  framework: FrameworkDisplay,
  locale: Locale,
) {
  return locale === "cs-CZ" ? framework.nameCs : framework.nameEn;
}

export function getFrameworkDisplayDescription(
  framework: FrameworkDisplay,
  locale: Locale,
  descriptions: Record<string, string>,
) {
  return locale === "cs-CZ"
    ? framework.descriptionCs ?? framework.nameEn
    : descriptions[framework.slug] ?? framework.descriptionCs ?? framework.nameEn;
}

export function getFrameworkDisplayRegulator(
  framework: FrameworkDisplay,
  locale: Locale,
  regulators: Record<string, string>,
) {
  return locale === "cs-CZ"
    ? framework.regulator ?? ""
    : regulators[framework.slug] ?? framework.regulator ?? "";
}
