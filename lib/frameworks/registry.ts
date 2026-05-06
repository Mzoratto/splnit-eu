import type { FrameworkSlug } from "@/lib/controls/library";

export type FrameworkSeed = {
  slug: FrameworkSlug;
  nameCs: string;
  nameEn: string;
  descriptionCs: string;
  regulator: string;
  mandatoryDeadline: string | null;
  version: string;
};

export const FRAMEWORK_LIBRARY: FrameworkSeed[] = [
  {
    slug: "nis2",
    nameCs: "NIS2",
    nameEn: "NIS2",
    descriptionCs:
      "Kybernetická bezpečnost, řízení rizik, incident reporting a odpovědnost managementu.",
    regulator: "NÚKIB",
    mandatoryDeadline: "2024-10-18",
    version: "Directive (EU) 2022/2555",
  },
  {
    slug: "ai-act",
    nameCs: "EU AI Act",
    nameEn: "EU AI Act",
    descriptionCs:
      "Povinnosti nasazovatelů AI systémů, AI gramotnost, vysoce riziková AI a transparentnost.",
    regulator: "EU / národní orgány (bude potvrzeno)",
    mandatoryDeadline: "2026-08-02",
    version: "Regulation (EU) 2024/1689",
  },
  {
    slug: "gdpr",
    nameCs: "GDPR",
    nameEn: "GDPR",
    descriptionCs:
      "Ochrana osobních údajů, záznamy o činnostech zpracování, bezpečnost a oznamování porušení.",
    regulator: "ÚOOÚ",
    mandatoryDeadline: "2018-05-25",
    version: "Regulation (EU) 2016/679",
  },
  {
    slug: "iso27001",
    nameCs: "ISO 27001",
    nameEn: "ISO 27001",
    descriptionCs:
      "Systém řízení bezpečnosti informací a katalog bezpečnostních opatření.",
    regulator: "ISO",
    mandatoryDeadline: null,
    version: "ISO/IEC 27001:2022",
  },
  {
    slug: "csrd",
    nameCs: "CSRD",
    nameEn: "CSRD",
    descriptionCs:
      "ESG reporting, dvojí materialita, datová evidence a dodavatelské dotazníky.",
    regulator: "Národní ESG dohled",
    mandatoryDeadline: null,
    version: "Directive (EU) 2022/2464",
  },
];
