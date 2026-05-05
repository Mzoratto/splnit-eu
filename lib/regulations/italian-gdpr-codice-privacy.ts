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

export type ItalianGdprCodicePrivacyDocument = {
  articleKey: string;
  citation: string;
  requiredTextPattern: RegExp;
  sourceDocument: AuthoritativeSourceDocument;
};

export const ITALIAN_GDPR_CODICE_PRIVACY_DOCUMENT = {
  articleKey: "D.Lgs. 196/2003",
  citation: "D.Lgs. 30 giugno 2003, n. 196",
  requiredTextPattern:
    /Codice in materia di protezione dei dati personali|regolamento \(UE\) n\. 2016\/679/i,
  sourceDocument: getSourceDocument("it/codice-privacy-dlgs-196-2003.html"),
} as const satisfies ItalianGdprCodicePrivacyDocument;
