type SoftwareApplicationJsonLdProps = {
  description?: string;
  pageName?: string;
  path?: string;
};

export function SoftwareApplicationJsonLd({
  description = "Splnit.eu automatizuje compliance pro NIS2, EU AI Act, GDPR a ISO 27001 pro české firmy.",
  pageName = "Splnit.eu",
  path = "",
}: SoftwareApplicationJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: pageName,
    applicationCategory: "ComplianceManagementSoftware",
    operatingSystem: "Web",
    url: `https://splnit.eu${path}`,
    description,
    areaServed: ["CZ", "EU"],
    featureList: [
      "Automatické compliance testy",
      "Mapování kontrol na NIS2, EU AI Act, GDPR a ISO 27001",
      "Evidence vault",
      "Trust Center",
      "Policy generation",
    ],
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "CZK",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
