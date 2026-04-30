import { PlaceholderPage } from "@/components/app/placeholder-page";

export default function EvidencePage() {
  return (
    <PlaceholderPage
      title="Evidence vault"
      description="Úložiště automatických snapshotů, ručních uploadů, PDF politik a screenshotů."
      items={[
        "Vercel Blob pro soubory",
        "Datum expirace pro opakované dokládání",
        "Vazba na kontrolu, integraci a test run",
      ]}
    />
  );
}
