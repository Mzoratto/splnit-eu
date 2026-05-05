import {
  type AuthoritativeSourceDocument,
  AUTHORITATIVE_SOURCE_DOCUMENTS,
} from "./authoritative-sources";

function getSourceDocument(filename: string) {
  const sourceDocument = AUTHORITATIVE_SOURCE_DOCUMENTS.find(
    (source) => source.filename === filename,
  );

  if (!sourceDocument) {
    throw new Error(`Missing authoritative source document definition for ${filename}.`);
  }

  return sourceDocument;
}

export type ItalianNis2AcnGuidanceDocument = {
  articleKey: string;
  citation: string;
  requiredTextPattern: RegExp;
  sourceDocument: AuthoritativeSourceDocument;
};

export const ITALIAN_NIS2_ACN_GUIDANCE_DOCUMENTS = [
  {
    articleKey: "ACN 136117/2025",
    citation: "ACN Determinazione n. 136117/2025",
    requiredTextPattern: /piattaforma digitale/i,
    sourceDocument: getSourceDocument("it/acn-nis-piattaforma-2025-136117.pdf"),
  },
  {
    articleKey: "ACN 164179/2025",
    citation: "ACN Determinazione n. 164179/2025",
    requiredTextPattern: /specifiche di base/i,
    sourceDocument: getSourceDocument("it/acn-nis-specifiche-2025-164179.pdf"),
  },
  {
    articleKey: "ACN 164179/2025 Allegato 1",
    citation: "ACN Determinazione n. 164179/2025, Allegato 1",
    requiredTextPattern: /Misure di sicurezza di base per i soggetti importanti/i,
    sourceDocument: getSourceDocument(
      "it/acn-nis-specifiche-2025-164179-allegato1.pdf",
    ),
  },
  {
    articleKey: "ACN 164179/2025 Allegato 2",
    citation: "ACN Determinazione n. 164179/2025, Allegato 2",
    requiredTextPattern: /Misure di sicurezza di base per i soggetti essenziali/i,
    sourceDocument: getSourceDocument(
      "it/acn-nis-specifiche-2025-164179-allegato2.pdf",
    ),
  },
  {
    articleKey: "ACN 164179/2025 Allegato 3",
    citation: "ACN Determinazione n. 164179/2025, Allegato 3",
    requiredTextPattern: /Incidenti significativi di base per i soggetti importanti/i,
    sourceDocument: getSourceDocument(
      "it/acn-nis-specifiche-2025-164179-allegato3.pdf",
    ),
  },
  {
    articleKey: "ACN 164179/2025 Allegato 4",
    citation: "ACN Determinazione n. 164179/2025, Allegato 4",
    requiredTextPattern: /Incidenti significativi di base per i soggetti essenziali/i,
    sourceDocument: getSourceDocument(
      "it/acn-nis-specifiche-2025-164179-allegato4.pdf",
    ),
  },
] as const satisfies readonly ItalianNis2AcnGuidanceDocument[];
