import { eq } from "drizzle-orm";
import { loadEnvConfig } from "@next/env";
import { getDb } from "../lib/db";
import { articles, frameworks, sourceDocuments } from "../lib/db/schema";
import { ITALIAN_GDPR_GARANTE_GUIDANCE_DOCUMENTS } from "../lib/regulations/italian-gdpr-garante";
import { htmlToSourceText } from "../lib/regulations/html-source-text";
import type { AuthoritativeSourceDocument } from "../lib/regulations/authoritative-sources";

loadEnvConfig(process.cwd());

const lastReviewed = new Date("2026-05-05T00:00:00.000Z");

function toEffectiveDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

async function fetchHtmlText(url: string, filename: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Splnit.eu source ingestion (+https://splnit.eu)",
    },
  });

  if (response.status !== 200) {
    throw new Error(
      `Garante source fetch failed for ${filename}: ${response.status} ${response.statusText}.`,
    );
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("html")) {
    throw new Error(
      `Garante source ${filename} returned unexpected content-type: ${contentType}`,
    );
  }

  const text = htmlToSourceText(await response.text());

  if (text.length < 1_000) {
    throw new Error(
      `Garante source ${filename} produced unexpectedly short text (${text.length} chars).`,
    );
  }

  return text;
}

async function upsertSourceDocument(sourceDocument: AuthoritativeSourceDocument) {
  const db = getDb();
  const effectiveDate = toEffectiveDate(sourceDocument.effectiveDate);
  const [row] = await db
    .insert(sourceDocuments)
    .values({
      citation: sourceDocument.citation,
      effectiveDate,
      filename: sourceDocument.filename,
      jurisdiction: sourceDocument.jurisdiction,
      lastReviewed,
      locale: sourceDocument.locale,
      title: sourceDocument.title,
      url: sourceDocument.url,
    })
    .onConflictDoUpdate({
      target: sourceDocuments.filename,
      set: {
        citation: sourceDocument.citation,
        effectiveDate,
        jurisdiction: sourceDocument.jurisdiction,
        lastReviewed,
        locale: sourceDocument.locale,
        title: sourceDocument.title,
        url: sourceDocument.url,
      },
    })
    .returning({ id: sourceDocuments.id });

  return row.id;
}

async function getGdprFrameworkId() {
  const db = getDb();
  const rows = await db
    .select({ id: frameworks.id })
    .from(frameworks)
    .where(eq(frameworks.slug, "gdpr"))
    .limit(1);
  const row = rows[0];

  if (!row) {
    throw new Error("Missing GDPR framework. Run npm run db:seed first.");
  }

  return row.id;
}

async function main() {
  const db = getDb();
  const frameworkId = await getGdprFrameworkId();
  let imported = 0;

  for (const definition of ITALIAN_GDPR_GARANTE_GUIDANCE_DOCUMENTS) {
    const sourceDocumentId = await upsertSourceDocument(definition.sourceDocument);
    const officialText = await fetchHtmlText(
      definition.sourceDocument.url,
      definition.sourceDocument.filename,
    );

    if (!definition.requiredTextPattern.test(officialText)) {
      throw new Error(
        `Garante source ${definition.sourceDocument.filename} did not contain expected text pattern ${definition.requiredTextPattern}.`,
      );
    }

    await db
      .insert(articles)
      .values({
        articleKey: definition.articleKey,
        citation: definition.citation,
        effectiveDate: toEffectiveDate(definition.sourceDocument.effectiveDate),
        frameworkId,
        jurisdiction: definition.sourceDocument.jurisdiction,
        lastReviewed,
        locale: definition.sourceDocument.locale,
        officialText,
        reviewStatus: "reviewed",
        sourceDocumentId,
        title: definition.sourceDocument.title,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [articles.sourceDocumentId, articles.locale, articles.articleKey],
        set: {
          citation: definition.citation,
          effectiveDate: toEffectiveDate(definition.sourceDocument.effectiveDate),
          frameworkId,
          jurisdiction: definition.sourceDocument.jurisdiction,
          lastReviewed,
          officialText,
          reviewStatus: "reviewed",
          title: definition.sourceDocument.title,
          updatedAt: new Date(),
        },
      });

    imported += 1;
  }

  console.log(`Imported ${imported} reviewed Italian GDPR Garante guidance rows.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
