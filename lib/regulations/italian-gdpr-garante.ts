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

export type ItalianGdprGaranteGuidanceDocument = {
  articleKey: string;
  citation: string;
  requiredTextPattern: RegExp;
  sourceDocument: AuthoritativeSourceDocument;
};

export const ITALIAN_GDPR_GARANTE_GUIDANCE_DOCUMENTS = [
  {
    articleKey: "Garante Data Breach",
    citation: "Garante Privacy - Data Breach",
    requiredTextPattern: /Violazioni di dati personali|Data Breach/i,
    sourceDocument: getSourceDocument("it/garante-data-breach.html"),
  },
  {
    articleKey: "Garante DPIA",
    citation: "Garante Privacy - DPIA",
    requiredTextPattern: /Valutazione d'impatto|valutazione di impatto/i,
    sourceDocument: getSourceDocument("it/garante-dpia.html"),
  },
  {
    articleKey: "Garante Registro Trattamenti FAQ",
    citation: "Garante Privacy - FAQ registro delle attività di trattamento",
    requiredTextPattern: /registro delle attività di trattamento/i,
    sourceDocument: getSourceDocument("it/garante-ropa-faq.html"),
  },
] as const satisfies readonly ItalianGdprGaranteGuidanceDocument[];
