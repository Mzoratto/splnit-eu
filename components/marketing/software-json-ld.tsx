import type { Locale } from "@/i18n/routing";

type SoftwareApplicationJsonLdProps = {
  description?: string;
  locale?: Locale;
  pageName?: string;
  path?: string;
};

const localizedDefaults: Record<
  Locale,
  {
    areaServed: string[];
    description: string;
    featureList: string[];
    priceCurrency: string;
  }
> = {
  "cs-CZ": {
    areaServed: ["CZ", "EU"],
    description:
      "Splnit.eu automatizuje compliance pro NIS2, EU AI Act, GDPR a ISO 27001 pro české firmy.",
    featureList: [
      "Automatické compliance testy",
      "Mapování kontrol na NIS2, EU AI Act, GDPR a ISO 27001",
      "Evidence vault",
      "Trust Center",
      "Generování politik",
    ],
    priceCurrency: "CZK",
  },
  "en-EU": {
    areaServed: ["EU"],
    description:
      "Splnit.eu automates compliance work for NIS2, EU AI Act, GDPR, and ISO 27001 for European SMBs.",
    featureList: [
      "Automated compliance tests",
      "Control mapping for NIS2, EU AI Act, GDPR, and ISO 27001",
      "Evidence vault",
      "Trust Center",
      "Policy generation",
    ],
    priceCurrency: "EUR",
  },
  "it-IT": {
    areaServed: ["IT", "EU"],
    description:
      "Splnit.eu automatizza il lavoro di compliance per NIS2, EU AI Act, GDPR e ISO 27001 per PMI europee.",
    featureList: [
      "Test compliance automatici",
      "Mappatura controlli per NIS2, EU AI Act, GDPR e ISO 27001",
      "Evidence vault",
      "Trust Center",
      "Generazione policy",
    ],
    priceCurrency: "EUR",
  },
};

export function SoftwareApplicationJsonLd({
  description,
  locale = "cs-CZ",
  pageName = "Splnit.eu",
  path = "",
}: SoftwareApplicationJsonLdProps) {
  const defaults = localizedDefaults[locale] ?? localizedDefaults["cs-CZ"];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: pageName,
    applicationCategory: "ComplianceManagementSoftware",
    operatingSystem: "Web",
    url: `https://splnit.eu${path}`,
    description: description ?? defaults.description,
    areaServed: defaults.areaServed,
    featureList: defaults.featureList,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: defaults.priceCurrency,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
