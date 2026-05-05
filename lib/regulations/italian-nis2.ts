import { buildGazzettaArticleUrl } from "./gazzetta";

export const ITALIAN_NIS2_SOURCE = {
  citation:
    "D.Lgs. 4 settembre 2024, n. 138 (GU Serie Generale n. 230 del 01-10-2024)",
  effectiveDate: "2024-10-16",
  filename: "it/dlgs-138-2024.html",
  jurisdiction: "IT",
  locale: "it-IT",
  title: "D.Lgs. 138/2024 - Recepimento direttiva NIS2",
  url: "https://www.gazzettaufficiale.it/eli/id/2024/10/01/24G00155/SG",
} as const;

export const ITALIAN_NIS2_ARTICLES = [
  {
    articleId: 23,
    citation: "D.Lgs. 138/2024, Art. 23",
    groupId: 4,
    url: buildGazzettaArticleUrl(23, 4),
  },
  {
    articleId: 24,
    citation: "D.Lgs. 138/2024, Art. 24",
    groupId: 4,
    url: buildGazzettaArticleUrl(24, 4),
  },
  {
    articleId: 25,
    citation: "D.Lgs. 138/2024, Art. 25",
    groupId: 4,
    url: buildGazzettaArticleUrl(25, 4),
  },
] as const;
