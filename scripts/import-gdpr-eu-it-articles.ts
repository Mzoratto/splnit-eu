import { eq } from "drizzle-orm";
import { loadEnvConfig } from "@next/env";
import { getDb } from "../lib/db";
import { articles, frameworks, sourceDocuments } from "../lib/db/schema";
import { extractFormexArticles } from "../lib/regulations/formex";
import {
  GDPR_EU_ARTICLES,
  GDPR_EU_IT_FORMEX_MANIFESTATION_URL,
  GDPR_EU_IT_SOURCE,
} from "../lib/regulations/gdpr-eu";

loadEnvConfig(process.cwd());

const lastReviewed = new Date("2026-05-05T00:00:00.000Z");
const officialFetchHeaders = {
  accept: "application/rdf+xml,application/xml,text/xml,*/*",
  "user-agent": "Mozilla/5.0 splnit.eu compliance source importer",
};

async function fetchText(url: string) {
  const response = await fetch(url, { headers: officialFetchHeaders });

  if (!response.ok) {
    throw new Error(
      `Official GDPR source fetch failed for ${url}: ${response.status} ${response.statusText}`,
    );
  }

  const text = await response.text();

  if (text.length < 1_000) {
    throw new Error(`Official GDPR source ${url} produced unexpectedly short text.`);
  }

  return text;
}

function resolveFormexDocumentUrl(manifestationRdf: string) {
  const match = manifestationRdf.match(/rdf:about="([^"]+\/DOC_2)"/);

  if (!match?.[1]) {
    throw new Error(
      `Could not resolve DOC_2 from GDPR Formex manifestation ${GDPR_EU_IT_FORMEX_MANIFESTATION_URL}.`,
    );
  }

  return match[1];
}

async function loadOfficialFormex() {
  const manifestationRdf = await fetchText(GDPR_EU_IT_FORMEX_MANIFESTATION_URL);
  const documentUrl = resolveFormexDocumentUrl(manifestationRdf);

  return fetchText(documentUrl);
}

function toEffectiveDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

async function upsertSourceDocument() {
  const db = getDb();
  const effectiveDate = toEffectiveDate(GDPR_EU_IT_SOURCE.effectiveDate);
  const [row] = await db
    .insert(sourceDocuments)
    .values({
      citation: GDPR_EU_IT_SOURCE.citation,
      effectiveDate,
      filename: GDPR_EU_IT_SOURCE.filename,
      jurisdiction: GDPR_EU_IT_SOURCE.jurisdiction,
      lastReviewed,
      locale: GDPR_EU_IT_SOURCE.locale,
      title: GDPR_EU_IT_SOURCE.title,
      url: GDPR_EU_IT_SOURCE.url,
    })
    .onConflictDoUpdate({
      target: sourceDocuments.filename,
      set: {
        citation: GDPR_EU_IT_SOURCE.citation,
        effectiveDate,
        jurisdiction: GDPR_EU_IT_SOURCE.jurisdiction,
        lastReviewed,
        locale: GDPR_EU_IT_SOURCE.locale,
        title: GDPR_EU_IT_SOURCE.title,
        url: GDPR_EU_IT_SOURCE.url,
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

async function upsertArticles(sourceDocumentId: string, frameworkId: string, formexXml: string) {
  const db = getDb();
  const effectiveDate = toEffectiveDate(GDPR_EU_IT_SOURCE.effectiveDate);
  const extractedByNumber = new Map(
    extractFormexArticles(formexXml).map((article) => [
      article.articleNumber,
      article,
    ]),
  );

  if (extractedByNumber.size !== GDPR_EU_ARTICLES.length) {
    throw new Error(
      `Expected ${GDPR_EU_ARTICLES.length} GDPR articles, found ${extractedByNumber.size}.`,
    );
  }

  let imported = 0;

  for (const definition of GDPR_EU_ARTICLES) {
    const extracted = extractedByNumber.get(definition.articleId);

    if (!extracted) {
      throw new Error(`Missing GDPR Article ${definition.articleId} in Formex source.`);
    }

    await db
      .insert(articles)
      .values({
        articleKey: extracted.articleKey,
        citation: definition.citation,
        effectiveDate,
        frameworkId,
        jurisdiction: GDPR_EU_IT_SOURCE.jurisdiction,
        lastReviewed,
        locale: GDPR_EU_IT_SOURCE.locale,
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
          jurisdiction: GDPR_EU_IT_SOURCE.jurisdiction,
          lastReviewed,
          officialText: extracted.officialText,
          reviewStatus: "draft",
          title: extracted.title,
          updatedAt: new Date(),
        },
      });

    imported += 1;
  }

  return imported;
}

async function main() {
  const formexXml = await loadOfficialFormex();
  const sourceDocumentId = await upsertSourceDocument();
  const frameworkId = await getGdprFrameworkId();
  const imported = await upsertArticles(sourceDocumentId, frameworkId, formexXml);

  console.log(
    `Imported ${imported} draft Italian GDPR articles from official EUR-Lex/CELLAR Formex source.`,
  );
  console.log("No framework-control mapping links were created or promoted.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
