import { readFile } from "node:fs/promises";
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
import { extractOfficialJournalArticle } from "../lib/regulations/official-journal";
import { NIS2_EU_ARTICLES, NIS2_EU_SOURCE } from "../lib/regulations/nis2-eu";

loadEnvConfig(process.cwd());

function getFileArg() {
  const index = process.argv.indexOf("--file");
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function loadOfficialXhtml() {
  const file = getFileArg();

  if (file) {
    return readFile(file, "utf8");
  }

  const sourceUrl = process.env.NIS2_EU_XHTML_URL ?? NIS2_EU_SOURCE.url;
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`NIS2 EU source fetch failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function upsertSourceDocument() {
  const db = getDb();
  const effectiveDate = new Date(`${NIS2_EU_SOURCE.effectiveDate}T00:00:00.000Z`);
  const lastReviewed = new Date("2026-05-05T00:00:00.000Z");
  const [row] = await db
    .insert(sourceDocuments)
    .values({
      citation: NIS2_EU_SOURCE.citation,
      effectiveDate,
      filename: NIS2_EU_SOURCE.filename,
      jurisdiction: NIS2_EU_SOURCE.jurisdiction,
      lastReviewed,
      locale: NIS2_EU_SOURCE.locale,
      title: NIS2_EU_SOURCE.title,
      url: NIS2_EU_SOURCE.url,
    })
    .onConflictDoUpdate({
      target: sourceDocuments.filename,
      set: {
        citation: NIS2_EU_SOURCE.citation,
        effectiveDate,
        jurisdiction: NIS2_EU_SOURCE.jurisdiction,
        lastReviewed,
        locale: NIS2_EU_SOURCE.locale,
        title: NIS2_EU_SOURCE.title,
        url: NIS2_EU_SOURCE.url,
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

async function upsertArticles(xhtml: string, sourceDocumentId: string, frameworkId: string) {
  const db = getDb();
  const effectiveDate = new Date(`${NIS2_EU_SOURCE.effectiveDate}T00:00:00.000Z`);
  const articleIds = new Map<string, string>();

  for (const definition of NIS2_EU_ARTICLES) {
    const extracted = extractOfficialJournalArticle(xhtml, definition.articleId);
    const [row] = await db
      .insert(articles)
      .values({
        articleKey: extracted.articleKey,
        citation: definition.citation,
        effectiveDate,
        frameworkId,
        jurisdiction: NIS2_EU_SOURCE.jurisdiction,
        locale: NIS2_EU_SOURCE.locale,
        officialText: extracted.officialText,
        reviewStatus: "draft",
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
          jurisdiction: NIS2_EU_SOURCE.jurisdiction,
          officialText: extracted.officialText,
          reviewStatus: "draft",
          title: extracted.title,
          updatedAt: new Date(),
        },
      })
      .returning({ articleKey: articles.articleKey, id: articles.id });

    articleIds.set(row.articleKey, row.id);
  }

  return articleIds;
}

function resolveNis2ArticleKey(articleRef: string | null) {
  if (!articleRef) {
    return null;
  }

  if (articleRef.startsWith("Article 21")) {
    return "Article 21";
  }

  if (articleRef === "Article 23") {
    return "Article 23";
  }

  return null;
}

async function linkNis2FrameworkControls(
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
    const articleKey = resolveNis2ArticleKey(row.articleRef);
    const articleId = articleKey ? articleIds.get(articleKey) : null;

    if (!articleId) {
      continue;
    }

    await db
      .insert(frameworkControlArticles)
      .values({
        articleId,
        citationNote: row.articleRef,
        confidence: "draft",
        frameworkControlId: row.id,
      })
      .onConflictDoUpdate({
        target: [
          frameworkControlArticles.frameworkControlId,
          frameworkControlArticles.articleId,
        ],
        set: {
          citationNote: row.articleRef,
          confidence: "draft",
        },
      });
    count += 1;
  }

  return count;
}

async function main() {
  const xhtml = await loadOfficialXhtml();
  const sourceDocumentId = await upsertSourceDocument();
  const frameworkId = await getNis2FrameworkId();
  const articleIds = await upsertArticles(xhtml, sourceDocumentId, frameworkId);
  const linkedMappings = await linkNis2FrameworkControls(frameworkId, articleIds);

  console.log(
    `Imported ${articleIds.size} draft NIS2 EU articles and linked ${linkedMappings} NIS2 framework-control mappings.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
