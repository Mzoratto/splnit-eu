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
  CZECH_CYBER_LAW_264_SECTIONS,
  CZECH_CYBER_LAW_264_SOURCE,
} from "../lib/regulations/czech-cyber-law";
import { extractCzechSection } from "../lib/regulations/czech-sections";

loadEnvConfig(process.cwd());

function getArg(name: string) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function readLawText() {
  const textFile = getArg("--law-264-text");

  if (textFile) {
    return readFile(textFile, "utf8");
  }

  const pdfFile = getArg("--law-264-pdf") ?? process.env.CZECH_CYBER_LAW_264_PDF;

  if (!pdfFile) {
    throw new Error(
      "Provide --law-264-pdf, --law-264-text, or CZECH_CYBER_LAW_264_PDF.",
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

async function upsertSourceDocument() {
  const db = getDb();
  const effectiveDate = new Date(`${CZECH_CYBER_LAW_264_SOURCE.effectiveDate}T00:00:00.000Z`);
  const lastReviewed = new Date("2026-05-05T00:00:00.000Z");
  const [row] = await db
    .insert(sourceDocuments)
    .values({
      citation: CZECH_CYBER_LAW_264_SOURCE.citation,
      effectiveDate,
      filename: CZECH_CYBER_LAW_264_SOURCE.filename,
      jurisdiction: CZECH_CYBER_LAW_264_SOURCE.jurisdiction,
      lastReviewed,
      locale: CZECH_CYBER_LAW_264_SOURCE.locale,
      title: CZECH_CYBER_LAW_264_SOURCE.title,
      url: CZECH_CYBER_LAW_264_SOURCE.url,
    })
    .onConflictDoUpdate({
      target: sourceDocuments.filename,
      set: {
        citation: CZECH_CYBER_LAW_264_SOURCE.citation,
        effectiveDate,
        jurisdiction: CZECH_CYBER_LAW_264_SOURCE.jurisdiction,
        lastReviewed,
        locale: CZECH_CYBER_LAW_264_SOURCE.locale,
        title: CZECH_CYBER_LAW_264_SOURCE.title,
        url: CZECH_CYBER_LAW_264_SOURCE.url,
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

async function upsertArticles(text: string, sourceDocumentId: string, frameworkId: string) {
  const db = getDb();
  const effectiveDate = new Date(`${CZECH_CYBER_LAW_264_SOURCE.effectiveDate}T00:00:00.000Z`);
  const articleIds = new Map<string, string>();

  for (const definition of CZECH_CYBER_LAW_264_SECTIONS) {
    const extracted = extractCzechSection(text, definition.sectionNumber);
    const [row] = await db
      .insert(articles)
      .values({
        articleKey: extracted.articleKey,
        citation: definition.citation,
        effectiveDate,
        frameworkId,
        jurisdiction: CZECH_CYBER_LAW_264_SOURCE.jurisdiction,
        locale: CZECH_CYBER_LAW_264_SOURCE.locale,
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
          jurisdiction: CZECH_CYBER_LAW_264_SOURCE.jurisdiction,
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

function resolveCzechSectionKeys(articleRef: string | null) {
  if (!articleRef) {
    return [];
  }

  if (articleRef.startsWith("Article 21")) {
    return ["§ 13", "§ 14"];
  }

  if (articleRef === "Article 23") {
    return ["§ 15", "§ 16"];
  }

  return [];
}

async function linkCzechDraftSections(
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
    for (const sectionKey of resolveCzechSectionKeys(row.articleRef)) {
      const articleId = articleIds.get(sectionKey);

      if (!articleId) {
        continue;
      }

      await db
        .insert(frameworkControlArticles)
        .values({
          articleId,
          citationNote: `${row.articleRef} draft Czech transposition reference`,
          confidence: "draft",
          frameworkControlId: row.id,
        })
        .onConflictDoUpdate({
          target: [
            frameworkControlArticles.frameworkControlId,
            frameworkControlArticles.articleId,
          ],
          set: {
            citationNote: `${row.articleRef} draft Czech transposition reference`,
            confidence: "draft",
          },
        });
      count += 1;
    }
  }

  return count;
}

async function main() {
  const lawText = await readLawText();
  const sourceDocumentId = await upsertSourceDocument();
  const frameworkId = await getNis2FrameworkId();
  const articleIds = await upsertArticles(lawText, sourceDocumentId, frameworkId);
  const linkedMappings = await linkCzechDraftSections(frameworkId, articleIds);

  console.warn(
    "Imported Czech law rows are draft extraction rows from the provided Zákony pro lidi PDF. Do not promote them to reviewed until checked against e-Sbírka or another official source.",
  );
  console.log(
    `Imported ${articleIds.size} draft Czech cyber law sections and linked ${linkedMappings} NIS2 framework-control mappings.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
