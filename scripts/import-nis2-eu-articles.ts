import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
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
import { extractEurLexArticleText } from "../lib/regulations/eur-lex-text";
import { extractOfficialJournalArticle } from "../lib/regulations/official-journal";
import { NIS2_EU_ARTICLES, NIS2_EU_SOURCE } from "../lib/regulations/nis2-eu";

loadEnvConfig(process.cwd());

type SourceInput = {
  format: "pdf-text" | "xhtml";
  text: string;
};

function getFileArg() {
  const index = process.argv.indexOf("--file");
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function pdftotext(pdfPath: string) {
  const result = spawnSync("pdftotext", ["-layout", pdfPath, "-"], {
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || `pdftotext failed for ${pdfPath}`);
  }

  return result.stdout;
}

function sourceFormatFromPath(filePath: string): SourceInput["format"] {
  return filePath.toLowerCase().endsWith(".pdf") ? "pdf-text" : "xhtml";
}

async function loadOfficialSource(): Promise<SourceInput> {
  const file = getFileArg();

  if (file) {
    const format = sourceFormatFromPath(file);
    const text = format === "pdf-text" ? pdftotext(file) : await readFile(file, "utf8");

    return { format, text };
  }

  const sourceUrl = process.env.NIS2_EU_PDF_URL ?? NIS2_EU_SOURCE.url;
  const response = await fetch(sourceUrl);

  if (response.status !== 200) {
    throw new Error(
      `NIS2 EU EUR-Lex PDF fetch failed: ${response.status} ${response.statusText}. If EUR-Lex blocks CLI access, download ${NIS2_EU_SOURCE.url} manually and rerun with --file <pdf-path>.`,
    );
  }

  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "splnit-nis2-eu-"));
  const pdfPath = path.join(temporaryDirectory, "nis2-eu.pdf");

  try {
    await writeFile(pdfPath, Buffer.from(await response.arrayBuffer()));
    return {
      format: "pdf-text",
      text: pdftotext(pdfPath),
    };
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true });
  }
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

function extractArticle(source: SourceInput, articleId: string) {
  if (source.format === "xhtml") {
    return extractOfficialJournalArticle(source.text, articleId);
  }

  return extractEurLexArticleText(source.text, articleId);
}

async function upsertArticles(source: SourceInput, sourceDocumentId: string, frameworkId: string) {
  const db = getDb();
  const effectiveDate = new Date(`${NIS2_EU_SOURCE.effectiveDate}T00:00:00.000Z`);
  const articleIds = new Map<string, string>();

  for (const definition of NIS2_EU_ARTICLES) {
    const extracted = extractArticle(source, definition.articleId);
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
  const source = await loadOfficialSource();
  const sourceDocumentId = await upsertSourceDocument();
  const frameworkId = await getNis2FrameworkId();
  const articleIds = await upsertArticles(source, sourceDocumentId, frameworkId);
  const linkedMappings = await linkNis2FrameworkControls(frameworkId, articleIds);

  console.log(
    `Imported ${articleIds.size} draft NIS2 EU articles from ${NIS2_EU_SOURCE.url} and linked ${linkedMappings} NIS2 framework-control mappings.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
