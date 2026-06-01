import { absoluteUrl } from "@/lib/seo/metadata";
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
  }
> = {
  "cs-CZ": {
    areaServed: ["CZ", "EU"],
    description:
      "Splnit.eu pomáhá českým firmám řídit compliance pro NIS2, EU AI Act, GDPR a ISO 27001 — s automatickým sběrem důkazů z připojených integrací a manuálními workspace pro lokální systémy.",
    featureList: [
      "Automatický sběr důkazů z připojených integrací (Microsoft 365, GitHub, AWS)",
      "Manuální a CSV sběr důkazů pro lokální systémy",
      "Mapování kontrol na NIS2, EU AI Act, GDPR a ISO 27001",
      "Evidence vault",
      "Trust Center",
      "Generování politik",
    ],
  },
  "en-EU": {
    areaServed: ["EU"],
    description:
      "Splnit.eu helps European SMBs manage NIS2, EU AI Act, GDPR, and ISO 27001 compliance, with automated evidence collection for connected integrations and guided manual workspaces for local systems.",
    featureList: [
      "Automated evidence collection for connected integrations (Microsoft 365, GitHub, AWS)",
      "Manual and CSV-assisted evidence collection for local systems",
      "Control mapping for NIS2, EU AI Act, GDPR, and ISO 27001",
      "Evidence vault",
      "Trust Center",
      "Policy generation",
    ],
  },
  "it-IT": {
    areaServed: ["IT", "EU"],
    description:
      "Splnit.eu aiuta le PMI europee a gestire la compliance per NIS2, EU AI Act, GDPR e ISO 27001, con raccolta automatica delle prove dalle integrazioni collegate e workspace manuali guidati per i sistemi locali.",
    featureList: [
      "Raccolta automatica delle prove dalle integrazioni collegate (Microsoft 365, GitHub, AWS)",
      "Raccolta manuale e assistita da CSV per i sistemi locali",
      "Mappatura controlli per NIS2, EU AI Act, GDPR e ISO 27001",
      "Evidence vault",
      "Trust Center",
      "Generazione policy",
    ],
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
    url: absoluteUrl(path),
    description: description ?? defaults.description,
    areaServed: defaults.areaServed,
    featureList: defaults.featureList,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
