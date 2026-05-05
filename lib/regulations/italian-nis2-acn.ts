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
  {
    articleKey: "ACN 112335/2026",
    citation: "ACN Determinazione n. 112335/2026",
    requiredTextPattern: /Tavolo per l.?attuazione della disciplina NIS/i,
    sourceDocument: getSourceDocument(
      "it/acn-nis-tavolo-competenze-2026-112335.pdf",
    ),
  },
  {
    articleKey: "ACN 276206/2025",
    citation: "ACN Determinazione n. 276206/2025",
    requiredTextPattern: /funzionamento del Tavolo per l.?attuazione della disciplina NIS/i,
    sourceDocument: getSourceDocument(
      "it/acn-nis-tavolo-funzionamento-2025-276206.pdf",
    ),
  },
  {
    articleKey: "ACN 127437/2026",
    citation: "ACN Determinazione n. 127437/2026",
    requiredTextPattern: /piattaforma digitale|designazione dei rappresentanti NIS/i,
    sourceDocument: getSourceDocument("it/acn-nis-piattaforma-2026-127437.pdf"),
  },
  {
    articleKey: "ACN 136118/2025",
    citation: "ACN Determinazione n. 136118/2025",
    requiredTextPattern: /accordi di condivisione delle informazioni/i,
    sourceDocument: getSourceDocument(
      "it/acn-nis-accordi-condivisione-2025-136118.pdf",
    ),
  },
  {
    articleKey: "ACN 379907/2025",
    citation: "ACN Determinazione n. 379907/2025",
    requiredTextPattern: /specifiche di base|articoli 23, 24, 25, 29 e 32/i,
    sourceDocument: getSourceDocument("it/acn-nis-obblighi-2025-379907.pdf"),
  },
  {
    articleKey: "ACN 127434/2026",
    citation: "ACN Determinazione n. 127434/2026",
    requiredTextPattern:
      /soggetti inseriti per la prima volta nell.?elenco nell.?anno solare 2026/i,
    sourceDocument: getSourceDocument(
      "it/acn-nis-misure-sicurezza-2026-127434.pdf",
    ),
  },
  {
    articleKey: "ACN 155238/2026",
    citation: "ACN Determinazione n. 155238/2026",
    requiredTextPattern: /elencazione, caratterizzazione e categorizzazione/i,
    sourceDocument: getSourceDocument(
      "it/acn-nis-categorizzazione-2026-155238.pdf",
    ),
  },
] as const satisfies readonly ItalianNis2AcnGuidanceDocument[];
