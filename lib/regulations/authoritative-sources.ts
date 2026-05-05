export type AuthoritativeSourceDocument = {
  citation: string;
  effectiveDate: string | null;
  filename: string;
  jurisdiction: string;
  locale: string;
  title: string;
  url: string;
};

const EUR_LEX_PDF_BASE = "https://eur-lex.europa.eu/legal-content";

function eurLexPdfUrl(language: "CS" | "EN" | "IT", celex: string) {
  return `${EUR_LEX_PDF_BASE}/${language}/TXT/PDF/?uri=CELEX:${celex}`;
}

export const EU_CANONICAL_SOURCE_DOCUMENTS = [
  {
    citation: "Directive (EU) 2022/2555, CELEX 32022L2555",
    effectiveDate: "2023-01-16",
    filename: "eu/nis2-directive-2022-2555-en.pdf",
    jurisdiction: "EU",
    locale: "en-EU",
    title: "NIS2 Directive - English EUR-Lex PDF",
    url: eurLexPdfUrl("EN", "32022L2555"),
  },
  {
    citation: "Direttiva (UE) 2022/2555, CELEX 32022L2555",
    effectiveDate: "2023-01-16",
    filename: "eu/nis2-directive-2022-2555-it.pdf",
    jurisdiction: "EU",
    locale: "it-IT",
    title: "Direttiva NIS2 - testo italiano EUR-Lex PDF",
    url: eurLexPdfUrl("IT", "32022L2555"),
  },
  {
    citation: "Směrnice (EU) 2022/2555, CELEX 32022L2555",
    effectiveDate: "2023-01-16",
    filename: "eu/nis2-directive-2022-2555-cs.pdf",
    jurisdiction: "EU",
    locale: "cs-CZ",
    title: "Směrnice NIS2 - české znění EUR-Lex PDF",
    url: eurLexPdfUrl("CS", "32022L2555"),
  },
  {
    citation: "Regulation (EU) 2016/679, CELEX 32016R0679",
    effectiveDate: "2018-05-25",
    filename: "eu/gdpr-2016-679-en.pdf",
    jurisdiction: "EU",
    locale: "en-EU",
    title: "GDPR - English EUR-Lex PDF",
    url: eurLexPdfUrl("EN", "32016R0679"),
  },
  {
    citation: "Regolamento (UE) 2016/679, CELEX 32016R0679",
    effectiveDate: "2018-05-25",
    filename: "eu/gdpr-2016-679-it.pdf",
    jurisdiction: "EU",
    locale: "it-IT",
    title: "GDPR - testo italiano EUR-Lex PDF",
    url: eurLexPdfUrl("IT", "32016R0679"),
  },
  {
    citation: "Nařízení (EU) 2016/679, CELEX 32016R0679",
    effectiveDate: "2018-05-25",
    filename: "eu/gdpr-2016-679-cs.pdf",
    jurisdiction: "EU",
    locale: "cs-CZ",
    title: "GDPR - české znění EUR-Lex PDF",
    url: eurLexPdfUrl("CS", "32016R0679"),
  },
  {
    citation: "Regulation (EU) 2024/1689, CELEX 32024R1689",
    effectiveDate: "2024-08-01",
    filename: "eu/ai-act-2024-1689-en.pdf",
    jurisdiction: "EU",
    locale: "en-EU",
    title: "EU AI Act - English EUR-Lex PDF",
    url: eurLexPdfUrl("EN", "32024R1689"),
  },
  {
    citation: "Regolamento (UE) 2024/1689, CELEX 32024R1689",
    effectiveDate: "2024-08-01",
    filename: "eu/ai-act-2024-1689-it.pdf",
    jurisdiction: "EU",
    locale: "it-IT",
    title: "EU AI Act - testo italiano EUR-Lex PDF",
    url: eurLexPdfUrl("IT", "32024R1689"),
  },
  {
    citation: "Nařízení (EU) 2024/1689, CELEX 32024R1689",
    effectiveDate: "2024-08-01",
    filename: "eu/ai-act-2024-1689-cs.pdf",
    jurisdiction: "EU",
    locale: "cs-CZ",
    title: "EU AI Act - české znění EUR-Lex PDF",
    url: eurLexPdfUrl("CS", "32024R1689"),
  },
] as const satisfies readonly AuthoritativeSourceDocument[];

export const NATIONAL_AUTHORITATIVE_SOURCE_DOCUMENTS = [
  {
    citation:
      "D.Lgs. 4 settembre 2024, n. 138 (GU Serie Generale n. 230 del 01-10-2024)",
    effectiveDate: "2024-10-16",
    filename: "it/dlgs-138-2024.html",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "D.Lgs. 138/2024 - Recepimento direttiva NIS2",
    url: "https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG",
  },
  {
    citation: "Zákon č. 264/2025 Sb., o kybernetické bezpečnosti",
    effectiveDate: "2025-11-01",
    filename: "cz/esbirka_sb_2025_264_pzz.pdf",
    jurisdiction: "CZ",
    locale: "cs-CZ",
    title: "Zákon č. 264/2025 Sb. - official e-Sbírka source",
    url: "https://e-sbirka.gov.cz/sb/2025/264",
  },
  {
    citation: "Zákon č. 110/2019 Sb., o zpracování osobních údajů",
    effectiveDate: "2019-04-24",
    filename: "cz/zakon-110-2019-sb.html",
    jurisdiction: "CZ",
    locale: "cs-CZ",
    title: "Zákon č. 110/2019 Sb. - Czech personal data processing act",
    url: "https://e-sbirka.gov.cz/sb/2019/110",
  },
] as const satisfies readonly AuthoritativeSourceDocument[];

export const ISO_REFERENCE_SOURCE_DOCUMENTS = [
  {
    citation: "ISO/IEC 27001:2022",
    effectiveDate: "2022-10-25",
    filename: "iso/iso-iec-27001-2022-store.html",
    jurisdiction: "ISO",
    locale: "en-EU",
    title: "ISO/IEC 27001:2022 - ISO Store reference",
    url: "https://www.iso.org/standard/27001",
  },
  {
    citation: "ISO/IEC 27002:2022",
    effectiveDate: "2022-02-15",
    filename: "iso/iso-iec-27002-2022-store.html",
    jurisdiction: "ISO",
    locale: "en-EU",
    title: "ISO/IEC 27002:2022 - ISO Store reference",
    url: "https://www.iso.org/standard/75652.html",
  },
] as const satisfies readonly AuthoritativeSourceDocument[];

export const AUTHORITATIVE_SOURCE_DOCUMENTS = [
  ...EU_CANONICAL_SOURCE_DOCUMENTS,
  ...NATIONAL_AUTHORITATIVE_SOURCE_DOCUMENTS,
  ...ISO_REFERENCE_SOURCE_DOCUMENTS,
] as const satisfies readonly AuthoritativeSourceDocument[];
