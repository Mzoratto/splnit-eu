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
    citation:
      "D.Lgs. 30 giugno 2003, n. 196 - Codice in materia di protezione dei dati personali",
    effectiveDate: "2004-01-01",
    filename: "it/codice-privacy-dlgs-196-2003.html",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "Codice Privacy - testo consolidato Normattiva",
    url: "https://www.normattiva.it/eli/id/2003/07/29/003G0218/CONSOLIDATED/20240319",
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

export const REGULATOR_GUIDANCE_SOURCE_DOCUMENTS = [
  {
    citation:
      "ACN, Determinazione n. 38565 del 26 novembre 2024 - piattaforma NIS; sostituita dalla Determinazione n. 136117/2025",
    effectiveDate: null,
    filename: "it/acn-nis-piattaforma-2024-38565.pdf",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "ACN - Determinazione NIS piattaforma 2024 (sostituita)",
    url: "https://www.acn.gov.it/portale/documents/d/guest/detacn_nis_piattaforma_2024_38565",
  },
  {
    citation:
      "ACN, Determinazione n. 136117 del 10 aprile 2025 - piattaforma digitale NIS",
    effectiveDate: "2025-04-15",
    filename: "it/acn-nis-piattaforma-2025-136117.pdf",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "ACN - Determinazione NIS piattaforma 2025",
    url: "https://www.acn.gov.it/portale/documents/d/guest/detacn_nis_piattaforma_2025_136117_signed",
  },
  {
    citation:
      "ACN, Determinazione n. 164179 del 10 aprile 2025 - specifiche di base NIS",
    effectiveDate: "2025-04-30",
    filename: "it/acn-nis-specifiche-2025-164179.pdf",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "ACN - Determinazione NIS specifiche di base",
    url: "https://www.acn.gov.it/portale/documents/d/guest/detacn_nis_specifiche_2025_164179_signed",
  },
  {
    citation:
      "ACN, Determinazione n. 164179/2025, allegato 1 - misure di sicurezza di base per soggetti importanti",
    effectiveDate: "2025-04-30",
    filename: "it/acn-nis-specifiche-2025-164179-allegato1.pdf",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "ACN - Allegato 1 misure per soggetti importanti",
    url: "https://www.acn.gov.it/portale/documents/d/guest/detacn_nis_specifiche_2025_164179_allegato1",
  },
  {
    citation:
      "ACN, Determinazione n. 164179/2025, allegato 2 - misure di sicurezza di base per soggetti essenziali",
    effectiveDate: "2025-04-30",
    filename: "it/acn-nis-specifiche-2025-164179-allegato2.pdf",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "ACN - Allegato 2 misure per soggetti essenziali",
    url: "https://www.acn.gov.it/portale/documents/d/guest/detacn_nis_specifiche_2025_164179_allegato2",
  },
  {
    citation:
      "ACN, Determinazione n. 164179/2025, allegato 3 - incidenti significativi di base per soggetti importanti",
    effectiveDate: "2025-04-30",
    filename: "it/acn-nis-specifiche-2025-164179-allegato3.pdf",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "ACN - Allegato 3 incidenti per soggetti importanti",
    url: "https://www.acn.gov.it/portale/documents/d/guest/detacn_nis_specifiche_2025_164179_allegato3",
  },
  {
    citation:
      "ACN, Determinazione n. 164179/2025, allegato 4 - incidenti significativi di base per soggetti essenziali",
    effectiveDate: "2025-04-30",
    filename: "it/acn-nis-specifiche-2025-164179-allegato4.pdf",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "ACN - Allegato 4 incidenti per soggetti essenziali",
    url: "https://www.acn.gov.it/portale/documents/d/guest/detacn_nis_specifiche_2025_164179_allegato4",
  },
  {
    citation:
      "ACN, Determinazione n. 112335/2026 - composizione del Tavolo per l'attuazione della disciplina NIS",
    effectiveDate: null,
    filename: "it/acn-nis-tavolo-competenze-2026-112335.pdf",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "ACN - Determinazione NIS composizione Tavolo",
    url: "https://www.acn.gov.it/portale/documents/d/guest/2026_112335_detacn_comptavolo_signed",
  },
  {
    citation:
      "ACN, Determinazione n. 276206 del 16 luglio 2025 - funzionamento del Tavolo NIS",
    effectiveDate: null,
    filename: "it/acn-nis-tavolo-funzionamento-2025-276206.pdf",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "ACN - Determinazione NIS funzionamento Tavolo",
    url: "https://www.acn.gov.it/portale/documents/d/guest/2025_276206_determinazioneacn_tavolonis_funzionamento-v4-clean-v1_signed",
  },
  {
    citation:
      "ACN, Determinazione n. 127437/2026 - piattaforma digitale NIS",
    effectiveDate: null,
    filename: "it/acn-nis-piattaforma-2026-127437.pdf",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "ACN - Determinazione NIS piattaforma 2026",
    url: "https://www.acn.gov.it/portale/documents/d/guest/detacn_piattaformanis_251218-v9_signed",
  },
  {
    citation:
      "ACN, Determinazione n. 136118 del 10 aprile 2025 - accordi di condivisione delle informazioni",
    effectiveDate: null,
    filename: "it/acn-nis-accordi-condivisione-2025-136118.pdf",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "ACN - Determinazione NIS accordi di condivisione",
    url: "https://www.acn.gov.it/portale/documents/d/guest/detacn_nis_accordi_2025_136118_signed",
  },
  {
    citation:
      "ACN, Determinazione n. 379907/2025 - specifiche di base per obblighi NIS",
    effectiveDate: null,
    filename: "it/acn-nis-obblighi-2025-379907.pdf",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "ACN - Determinazione NIS obblighi 2025",
    url: "https://www.acn.gov.it/portale/documents/d/guest/detacn_obblighi_2511-v3_signed",
  },
  {
    citation:
      "ACN, Determinazione n. 127434/2026 - termini per obblighi NIS per nuovi soggetti",
    effectiveDate: null,
    filename: "it/acn-nis-misure-sicurezza-2026-127434.pdf",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "ACN - Determinazione NIS termini obblighi 2026",
    url: "https://www.acn.gov.it/portale/documents/d/guest/detacn_misuresicurezza-v4_post",
  },
  {
    citation:
      "ACN, Determinazione n. 155238/2026 - categorizzazione attività e servizi",
    effectiveDate: null,
    filename: "it/acn-nis-categorizzazione-2026-155238.pdf",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "ACN - Determinazione NIS categorizzazione",
    url: "https://www.acn.gov.it/portale/documents/d/guest/detacn_categorizzazione_260409-v8_signed",
  },
  {
    citation: "Garante Privacy - Data Breach, violazioni di dati personali",
    effectiveDate: null,
    filename: "it/garante-data-breach.html",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "Garante - Data breach e violazioni di dati personali",
    url: "https://www.garanteprivacy.it/data-breach",
  },
  {
    citation:
      "Garante Privacy - Valutazione d'impatto della protezione dei dati (DPIA)",
    effectiveDate: null,
    filename: "it/garante-dpia.html",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "Garante - DPIA",
    url: "https://www.garanteprivacy.it/valutazione-d-impatto-della-protezione-dei-dati-dpia-",
  },
  {
    citation: "Garante Privacy - FAQ sul registro delle attività di trattamento",
    effectiveDate: null,
    filename: "it/garante-ropa-faq.html",
    jurisdiction: "IT",
    locale: "it-IT",
    title: "Garante - FAQ registro delle attività di trattamento",
    url: "https://www.garanteprivacy.it/home/faq/registro-delle-attivita-di-trattamento",
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
  ...REGULATOR_GUIDANCE_SOURCE_DOCUMENTS,
  ...ISO_REFERENCE_SOURCE_DOCUMENTS,
] as const satisfies readonly AuthoritativeSourceDocument[];
