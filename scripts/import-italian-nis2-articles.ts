import { eq } from "drizzle-orm";
import { loadEnvConfig } from "@next/env";
import { getDb } from "../lib/db";
import {
  articles,
  frameworkControlArticles,
  frameworkControls,
  frameworks,
  sourceDocuments,
} from "../lib/db/schema";
import { extractGazzettaArticle } from "../lib/regulations/gazzetta";
import {
  ITALIAN_NIS2_ARTICLES,
  ITALIAN_NIS2_SOURCE,
} from "../lib/regulations/italian-nis2";

loadEnvConfig(process.cwd());

const lastReviewed = new Date("2026-05-05T00:00:00.000Z");

function getArticleKeyForExistingNis2Ref(articleRef: string | null) {
  if (!articleRef) {
    return null;
  }

  if (articleRef.startsWith("Article 21")) {
    return "Art. 24";
  }

  if (articleRef === "Article 23") {
    return "Art. 25";
  }

  return null;
}

async function fetchArticleHtml(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Gazzetta article fetch failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function upsertSourceDocument() {
  const db = getDb();
  const effectiveDate = new Date(`${ITALIAN_NIS2_SOURCE.effectiveDate}T00:00:00.000Z`);
  const [row] = await db
    .insert(sourceDocuments)
    .values({
      citation: ITALIAN_NIS2_SOURCE.citation,
      effectiveDate,
      filename: ITALIAN_NIS2_SOURCE.filename,
      jurisdiction: ITALIAN_NIS2_SOURCE.jurisdiction,
      lastReviewed,
      locale: ITALIAN_NIS2_SOURCE.locale,
      title: ITALIAN_NIS2_SOURCE.title,
      url: ITALIAN_NIS2_SOURCE.url,
    })
    .onConflictDoUpdate({
      target: sourceDocuments.filename,
      set: {
        citation: ITALIAN_NIS2_SOURCE.citation,
        effectiveDate,
        jurisdiction: ITALIAN_NIS2_SOURCE.jurisdiction,
        lastReviewed,
        locale: ITALIAN_NIS2_SOURCE.locale,
        title: ITALIAN_NIS2_SOURCE.title,
        url: ITALIAN_NIS2_SOURCE.url,
      },
    })
    .returning({ id: sourceDocuments.id });

  return row.id;
}

async function getNis2FrameworkId() {
  const db = getDb();
  const rows = await db
    .select({ id: frameworks.id })
    .from(frameworks)
    .where(eq(frameworks.slug, "nis2"))
    .limit(1);
  const row = rows[0];

  if (!row) {
    throw new Error("Missing NIS2 framework. Run npm run db:seed first.");
  }

  return row.id;
}

async function upsertArticles(sourceDocumentId: string, frameworkId: string) {
  const db = getDb();
  const effectiveDate = new Date(`${ITALIAN_NIS2_SOURCE.effectiveDate}T00:00:00.000Z`);
  const articleIds = new Map<string, string>();

  for (const definition of ITALIAN_NIS2_ARTICLES) {
    const html = await fetchArticleHtml(definition.url);
    const extracted = extractGazzettaArticle(html, definition.articleId);

    const [row] = await db
      .insert(articles)
      .values({
        articleKey: extracted.articleKey,
        citation: definition.citation,
        effectiveDate,
        frameworkId,
        jurisdiction: ITALIAN_NIS2_SOURCE.jurisdiction,
        lastReviewed,
        locale: ITALIAN_NIS2_SOURCE.locale,
        officialText: extracted.officialText,
        reviewStatus: "reviewed",
        sourceDocumentId,
        title: extracted.title,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [articles.sourceDocumentId, articles.locale, articles.articleKey],
        set: {
          citation: definition.citation,
          effectiveDate,
          frameworkId,
          jurisdiction: ITALIAN_NIS2_SOURCE.jurisdiction,
          lastReviewed,
          officialText: extracted.officialText,
          reviewStatus: "reviewed",
          title: extracted.title,
          updatedAt: new Date(),
        },
      })
      .returning({ articleKey: articles.articleKey, id: articles.id });

    articleIds.set(row.articleKey, row.id);
  }

  return articleIds;
}

async function linkItalianNis2FrameworkControls(
  frameworkId: string,
  articleIds: Map<string, string>,
) {
  const db = getDb();
  const rows = await db
    .select({
      articleRef: frameworkControls.articleRef,
      id: frameworkControls.id,
    })
    .from(frameworkControls)
    .where(eq(frameworkControls.frameworkId, frameworkId));
  let count = 0;

  for (const row of rows) {
    const articleKey = getArticleKeyForExistingNis2Ref(row.articleRef);
    const articleId = articleKey ? articleIds.get(articleKey) : null;

    if (!articleId) {
      continue;
    }

    await db
      .insert(frameworkControlArticles)
      .values({
        articleId,
        citationNote: `${row.articleRef} draft Italian transposition reference · official source verified; mapping still draft`,
        confidence: "draft",
        frameworkControlId: row.id,
      })
      .onConflictDoUpdate({
        target: [
          frameworkControlArticles.frameworkControlId,
          frameworkControlArticles.articleId,
        ],
        set: {
          citationNote: `${row.articleRef} draft Italian transposition reference · official source verified; mapping still draft`,
          confidence: "draft",
        },
      });
    count += 1;
  }

  return count;
}

async function main() {
  const sourceDocumentId = await upsertSourceDocument();
  const frameworkId = await getNis2FrameworkId();
  const articleIds = await upsertArticles(sourceDocumentId, frameworkId);
  const linkedMappings = await linkItalianNis2FrameworkControls(frameworkId, articleIds);

  console.log(
    `Imported ${articleIds.size} reviewed Italian NIS2 articles and linked ${linkedMappings} draft mappings.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
