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

const ITALIAN_NIS2_ARTICLE_GROUPS = [
  { from: 1, groupId: 1, to: 8 },
  { from: 9, groupId: 2, to: 17 },
  { from: 18, groupId: 3, to: 22 },
  { from: 23, groupId: 4, to: 33 },
  { from: 34, groupId: 5, to: 39 },
  { from: 40, groupId: 6, to: 44 },
] as const;

function getItalianNis2ArticleGroupId(articleId: number) {
  const group = ITALIAN_NIS2_ARTICLE_GROUPS.find(
    (item) => articleId >= item.from && articleId <= item.to,
  );

  if (!group) {
    throw new Error(`Missing D.Lgs. 138/2024 Gazzetta group for Art. ${articleId}.`);
  }

  return group.groupId;
}

export const ITALIAN_NIS2_ARTICLES = Array.from({ length: 44 }, (_, index) => {
  const articleId = index + 1;
  const groupId = getItalianNis2ArticleGroupId(articleId);

  return {
    articleId,
    citation: `D.Lgs. 138/2024, Art. ${articleId}`,
    groupId,
    url: buildGazzettaArticleUrl(articleId, groupId),
  };
});
