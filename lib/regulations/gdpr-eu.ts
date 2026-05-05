import { EU_CANONICAL_SOURCE_DOCUMENTS } from "./authoritative-sources";

const gdprEuItSource = EU_CANONICAL_SOURCE_DOCUMENTS.find(
  (source) => source.filename === "eu/gdpr-2016-679-it.pdf",
);

if (!gdprEuItSource) {
  throw new Error("Missing Italian GDPR EUR-Lex source document definition.");
}

export const GDPR_EU_IT_SOURCE = gdprEuItSource;

export const GDPR_EU_IT_FORMEX_MANIFESTATION_URL =
  "https://publications.europa.eu/resource/oj/JOL_2016_119_R_0001.ITA.fmx4";

export const GDPR_EU_ARTICLES = Array.from({ length: 99 }, (_, index) => {
  const articleId = index + 1;

  return {
    articleId,
    citation: `Regolamento (UE) 2016/679, Art. ${articleId}`,
  };
});
