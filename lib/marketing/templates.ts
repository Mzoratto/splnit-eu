export type TemplateFormat = "docx" | "xlsx";
export type TemplateStatus = "available" | "coming-soon";

type RegulationSlug = "nis2" | "gdpr" | "eu-ai-act" | "iso-27001";
type AppFrameworkSlug = "nis2" | "ai-act" | "gdpr" | "iso27001";

export interface ComplianceTemplate {
  id: string;
  title: string;
  description: string;
  format: TemplateFormat;
  status: TemplateStatus;
  filePath?: string;
  regulations: RegulationSlug[];
  appFrameworks: AppFrameworkSlug[];
}

export const complianceTemplates: ComplianceTemplate[] = [
  {
    id: "ropa-gdpr",
    title: "Záznamy o zpracovatelských činnostech (ROPA)",
    description:
      "Šablona pro evidenci všech zpracovatelských činností dle čl. 30 GDPR.",
    format: "docx",
    status: "coming-soon",
    regulations: ["gdpr"],
    appFrameworks: ["gdpr"],
  },
  {
    id: "pristupova-politika-nzkb",
    title: "Politika řízení přístupů",
    description:
      "Šablona definující pravidla pro udělování, změnu a odebírání přístupových oprávnění.",
    format: "docx",
    status: "coming-soon",
    regulations: ["nis2"],
    appFrameworks: ["nis2"],
  },
  {
    id: "politika-rizeni-rizik",
    title: "Politika řízení rizik",
    description:
      "Metodika hodnocení a zvládání kybernetických rizik dle nZKB a ISO 27001.",
    format: "docx",
    status: "coming-soon",
    regulations: ["nis2", "iso-27001"],
    appFrameworks: ["nis2", "iso27001"],
  },
  {
    id: "incident-response-plan",
    title: "Plán řízení bezpečnostních incidentů",
    description:
      "Postup detekce, eskalace, hlášení a řešení kybernetických incidentů.",
    format: "docx",
    status: "coming-soon",
    regulations: ["nis2", "gdpr"],
    appFrameworks: ["nis2", "gdpr"],
  },
  {
    id: "politika-dodavatelu",
    title: "Politika řízení dodavatelů",
    description:
      "Šablona hodnocení bezpečnostně významných dodavatelů dle nZKB.",
    format: "docx",
    status: "coming-soon",
    regulations: ["nis2", "iso-27001"],
    appFrameworks: ["nis2", "iso27001"],
  },
  {
    id: "vendor-assessment-dotaznik",
    title: "Vendor assessment dotazník",
    description:
      "Dotazník pro hodnocení kybernetické způsobilosti klíčových dodavatelů.",
    format: "docx",
    status: "coming-soon",
    regulations: ["nis2"],
    appFrameworks: ["nis2"],
  },
  {
    id: "bcp-plan-kontinuity",
    title: "Plán kontinuity činností (BCP)",
    description:
      "Šablona pro zajištění nepřetržitosti provozu při výpadku nebo incidentu.",
    format: "docx",
    status: "coming-soon",
    regulations: ["nis2", "iso-27001"],
    appFrameworks: ["nis2", "iso27001"],
  },
  {
    id: "dpia-sablona",
    title: "Posouzení vlivu na ochranu osobních údajů (DPIA)",
    description:
      "Šablona hodnocení rizik pro zpracování s vysokým dopadem dle čl. 35 GDPR.",
    format: "docx",
    status: "coming-soon",
    regulations: ["gdpr"],
    appFrameworks: ["gdpr"],
  },
  {
    id: "soa-iso27001",
    title: "Prohlášení o aplikovatelnosti (SoA)",
    description:
      "Přehled 93 kontrol ISO 27001:2022 s hodnocením aplikovatelnosti.",
    format: "xlsx",
    status: "coming-soon",
    regulations: ["iso-27001"],
    appFrameworks: ["iso27001"],
  },
  {
    id: "gap-analyza-nizsi-rezim",
    title: "GAP analýza — nižší režim (13 opatření)",
    description: "Checklist pro posouzení souladu s vyhláškou č. 410/2025 Sb.",
    format: "xlsx",
    status: "coming-soon",
    regulations: ["nis2"],
    appFrameworks: ["nis2"],
  },
  {
    id: "gap-analyza-vyssi-rezim",
    title: "GAP analýza — vyšší režim (25 opatření)",
    description: "Checklist pro posouzení souladu s vyhláškou č. 409/2025 Sb.",
    format: "xlsx",
    status: "coming-soon",
    regulations: ["nis2"],
    appFrameworks: ["nis2"],
  },
];

export function getTemplatesByRegulation(slug: string): ComplianceTemplate[] {
  return complianceTemplates.filter((template) =>
    template.regulations.includes(slug as RegulationSlug),
  );
}

export function getTemplatesByFramework(
  frameworkSlug: string,
): ComplianceTemplate[] {
  return complianceTemplates.filter((template) =>
    template.appFrameworks.includes(frameworkSlug as AppFrameworkSlug),
  );
}
