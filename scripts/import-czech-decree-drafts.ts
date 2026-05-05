import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
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
import {
  CZECH_CYBER_DECREE_SOURCES,
  type CzechCyberDecreeSource,
} from "../lib/regulations/czech-decrees";
import { extractCzechSection } from "../lib/regulations/czech-sections";

loadEnvConfig(process.cwd());

function getArg(name: string) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function readTextFromPdfOrText(
  source: CzechCyberDecreeSource,
  pdfArg: string,
  textArg: string,
) {
  const textFile = getArg(textArg);

  if (textFile) {
    return readFile(textFile, "utf8");
  }

  const pdfFile =
    getArg(pdfArg) ?? process.env[`CZECH_CYBER_DECREE_${source.number}_PDF`];

  if (!pdfFile) {
    throw new Error(
      `Provide ${pdfArg}, ${textArg}, or CZECH_CYBER_DECREE_${source.number}_PDF.`,
    );
  }

  const result = spawnSync("pdftotext", ["-layout", pdfFile, "-"], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || `pdftotext failed with status ${result.status}.`);
  }

  return result.stdout;
}

async function upsertSourceDocument(source: CzechCyberDecreeSource) {
  const db = getDb();
  const effectiveDate = new Date(`${source.effectiveDate}T00:00:00.000Z`);
  const lastReviewed = new Date("2026-05-05T00:00:00.000Z");
  const [row] = await db
    .insert(sourceDocuments)
    .values({
      citation: source.citation,
      effectiveDate,
      filename: source.filename,
      jurisdiction: source.jurisdiction,
      lastReviewed,
      locale: source.locale,
      title: source.title,
      url: source.url,
    })
    .onConflictDoUpdate({
      target: sourceDocuments.filename,
      set: {
        citation: source.citation,
        effectiveDate,
        jurisdiction: source.jurisdiction,
        lastReviewed,
        locale: source.locale,
        title: source.title,
        url: source.url,
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

async function upsertDecreeArticles(
  source: CzechCyberDecreeSource,
  sourceDocumentId: string,
  frameworkId: string,
  text: string,
) {
  const db = getDb();
  const effectiveDate = new Date(`${source.effectiveDate}T00:00:00.000Z`);
  const articleIds = new Map<string, string>();

  for (const definition of source.sections) {
    const extracted = extractCzechSection(text, definition.sectionNumber);
    const articleKey = `${source.number} § ${definition.sectionNumber}`;
    const [row] = await db
      .insert(articles)
      .values({
        articleKey,
        citation: definition.citation,
        effectiveDate,
        frameworkId,
        jurisdiction: source.jurisdiction,
        locale: source.locale,
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
          jurisdiction: source.jurisdiction,
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

function resolveDraftDecreeKeys(articleRef: string | null) {
  if (!articleRef) {
    return [];
  }

  if (articleRef === "Article 21(2)(a)") {
    return ["409 § 3", "409 § 6", "409 § 8", "410 § 3"];
  }

  if (articleRef === "Article 21(2)(b)") {
    return ["409 § 14", "409 § 21", "409 § 22", "409 § 23", "410 § 9", "410 § 10"];
  }

  if (articleRef === "Article 21(2)(c)") {
    return ["409 § 15", "409 § 26", "410 § 6"];
  }

  if (articleRef === "Article 21(2)(d)") {
    return ["409 § 9", "410 § 3"];
  }

  if (articleRef === "Article 21(2)(e)") {
    return ["409 § 11", "409 § 12", "409 § 24", "410 § 12"];
  }

  if (articleRef === "Article 21(2)(g)") {
    return ["409 § 10", "410 § 5"];
  }

  if (articleRef === "Article 21(2)(h)") {
    return ["409 § 25", "410 § 13"];
  }

  if (articleRef === "Article 21(2)(i)") {
    return ["409 § 7", "409 § 13", "409 § 19", "409 § 20", "410 § 7", "410 § 8"];
  }

  if (articleRef === "Article 21(2)(j)") {
    return ["409 § 19", "409 § 25", "410 § 8", "410 § 13"];
  }

  if (articleRef === "Article 23") {
    return ["409 § 14", "410 § 10", "410 § 14"];
  }

  return [];
}

async function linkDraftDecreeSections(
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
    for (const articleKey of resolveDraftDecreeKeys(row.articleRef)) {
      const articleId = articleIds.get(articleKey);

      if (!articleId) {
        continue;
      }

      await db
        .insert(frameworkControlArticles)
        .values({
          articleId,
          citationNote: `${row.articleRef} draft Czech implementing decree reference`,
          confidence: "draft",
          frameworkControlId: row.id,
        })
        .onConflictDoUpdate({
          target: [
            frameworkControlArticles.frameworkControlId,
            frameworkControlArticles.articleId,
          ],
          set: {
            citationNote: `${row.articleRef} draft Czech implementing decree reference`,
            confidence: "draft",
          },
        });
      count += 1;
    }
  }

  return count;
}

async function main() {
  const frameworkId = await getNis2FrameworkId();
  const articleIds = new Map<string, string>();
  let articleCount = 0;

  for (const source of CZECH_CYBER_DECREE_SOURCES) {
    const text = await readTextFromPdfOrText(
      source,
      `--decree-${source.number}-pdf`,
      `--decree-${source.number}-text`,
    );
    const sourceDocumentId = await upsertSourceDocument(source);
    const imported = await upsertDecreeArticles(
      source,
      sourceDocumentId,
      frameworkId,
      text,
    );

    for (const [articleKey, articleId] of imported) {
      articleIds.set(articleKey, articleId);
    }

    articleCount += imported.size;
  }

  const linkedMappings = await linkDraftDecreeSections(frameworkId, articleIds);

  console.warn(
    "Imported Czech decree rows are draft extraction rows from the provided Zákony pro lidi PDFs. Do not promote them to reviewed until checked against e-Sbírka or another official source.",
  );
  console.log(
    `Imported ${articleCount} draft Czech decree sections and linked ${linkedMappings} NIS2 framework-control mappings.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
