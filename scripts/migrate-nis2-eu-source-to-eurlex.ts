import { loadEnvConfig } from "@next/env";
import { Pool, type PoolClient } from "pg";
import {
  LEGACY_NIS2_EU_SOURCE_FILENAME,
  NIS2_EU_SOURCE,
} from "../lib/regulations/nis2-eu";

loadEnvConfig(process.cwd());

const REVIEWED_AT = new Date("2026-05-05T00:00:00.000Z");

type LegacyArticleRow = {
  article_key: string;
  citation: string;
  effective_date: Date | null;
  framework_id: string;
  id: string;
  jurisdiction: string;
  last_reviewed: Date | null;
  locale: string;
  official_text: string;
  review_status: string;
  title: string | null;
};

type Queryable = {
  query: Pool["query"];
};

type MigrationResult = {
  legacyArticleId: string;
  migratedLinks: number;
  targetArticleId: string;
};

async function upsertCanonicalSourceDocument(client: PoolClient) {
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO source_documents (
        citation,
        effective_date,
        filename,
        jurisdiction,
        last_reviewed,
        locale,
        title,
        url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (filename) DO UPDATE SET
        citation = EXCLUDED.citation,
        effective_date = EXCLUDED.effective_date,
        jurisdiction = EXCLUDED.jurisdiction,
        last_reviewed = EXCLUDED.last_reviewed,
        locale = EXCLUDED.locale,
        title = EXCLUDED.title,
        url = EXCLUDED.url
      RETURNING id
    `,
    [
      NIS2_EU_SOURCE.citation,
      new Date(`${NIS2_EU_SOURCE.effectiveDate}T00:00:00.000Z`),
      NIS2_EU_SOURCE.filename,
      NIS2_EU_SOURCE.jurisdiction,
      REVIEWED_AT,
      NIS2_EU_SOURCE.locale,
      NIS2_EU_SOURCE.title,
      NIS2_EU_SOURCE.url,
    ],
  );

  return result.rows[0].id;
}

async function listLegacyArticles(client: Queryable) {
  const result = await client.query<LegacyArticleRow>(
    `
      SELECT
        a.id::text,
        a.source_document_id::text,
        a.framework_id::text,
        a.jurisdiction,
        a.locale,
        a.article_key,
        a.title,
        a.official_text,
        a.citation,
        a.effective_date,
        a.last_reviewed,
        a.review_status
      FROM articles a
      JOIN source_documents sd ON sd.id = a.source_document_id
      WHERE sd.filename = $1
        AND a.jurisdiction = 'EU'
        AND a.locale = $2
      ORDER BY a.article_key
    `,
    [LEGACY_NIS2_EU_SOURCE_FILENAME, NIS2_EU_SOURCE.locale],
  );

  return result.rows;
}

async function upsertCanonicalArticle(
  client: PoolClient,
  input: {
    article: LegacyArticleRow;
    sourceDocumentId: string;
  },
) {
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO articles (
        article_key,
        citation,
        effective_date,
        framework_id,
        jurisdiction,
        last_reviewed,
        locale,
        official_text,
        review_status,
        source_document_id,
        title,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $6)
      ON CONFLICT (source_document_id, locale, article_key) DO UPDATE SET
        citation = EXCLUDED.citation,
        effective_date = EXCLUDED.effective_date,
        framework_id = EXCLUDED.framework_id,
        jurisdiction = EXCLUDED.jurisdiction,
        last_reviewed = EXCLUDED.last_reviewed,
        official_text = EXCLUDED.official_text,
        review_status = EXCLUDED.review_status,
        title = EXCLUDED.title,
        updated_at = EXCLUDED.updated_at
      RETURNING id::text
    `,
    [
      input.article.article_key,
      input.article.citation,
      input.article.effective_date,
      input.article.framework_id,
      input.article.jurisdiction,
      input.article.last_reviewed ?? REVIEWED_AT,
      input.article.locale,
      input.article.official_text,
      input.article.review_status,
      input.sourceDocumentId,
      input.article.title,
    ],
  );

  return result.rows[0].id;
}

async function migrateArticleLinks(
  client: PoolClient,
  input: {
    legacyArticleId: string;
    targetArticleId: string;
  },
) {
  const insertResult = await client.query<{ id: string }>(
    `
      INSERT INTO framework_control_articles (
        framework_control_id,
        article_id,
        citation_note,
        confidence,
        created_at
      )
      SELECT
        fca.framework_control_id,
        $1::uuid,
        fca.citation_note,
        fca.confidence,
        fca.created_at
      FROM framework_control_articles fca
      WHERE fca.article_id = $2::uuid
      ON CONFLICT (framework_control_id, article_id) DO UPDATE SET
        citation_note = EXCLUDED.citation_note,
        confidence = CASE
          WHEN framework_control_articles.confidence = 'reviewed'
            OR EXCLUDED.confidence = 'reviewed'
            THEN 'reviewed'
          ELSE EXCLUDED.confidence
        END
      RETURNING id::text
    `,
    [input.targetArticleId, input.legacyArticleId],
  );

  await client.query(
    `
      DELETE FROM framework_control_articles
      WHERE article_id = $1::uuid
    `,
    [input.legacyArticleId],
  );

  await client.query(
    `
      UPDATE articles
      SET review_status = 'draft', updated_at = NOW()
      WHERE id = $1::uuid
    `,
    [input.legacyArticleId],
  );

  return insertResult.rows.length;
}

async function applyMigration(pool: Pool) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const canonicalSourceDocumentId = await upsertCanonicalSourceDocument(client);
    const legacyArticles = await listLegacyArticles(client);
    const results: MigrationResult[] = [];

    for (const article of legacyArticles) {
      const targetArticleId = await upsertCanonicalArticle(client, {
        article,
        sourceDocumentId: canonicalSourceDocumentId,
      });
      const migratedLinks = await migrateArticleLinks(client, {
        legacyArticleId: article.id,
        targetArticleId,
      });

      results.push({
        legacyArticleId: article.id,
        migratedLinks,
        targetArticleId,
      });
    }

    await client.query("COMMIT");
    return results;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const shouldApply = process.argv.includes("--apply");

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for NIS2 EU EUR-Lex source migration.");
  }

  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const legacyArticles = await listLegacyArticles(pool);

    if (!shouldApply) {
      console.log(
        JSON.stringify(
          {
            apply: false,
            canonicalFilename: NIS2_EU_SOURCE.filename,
            legacyArticleCount: legacyArticles.length,
            legacyFilename: LEGACY_NIS2_EU_SOURCE_FILENAME,
          },
          null,
          2,
        ),
      );
      return;
    }

    const results = await applyMigration(pool);

    console.log(
      JSON.stringify(
        {
          apply: true,
          canonicalFilename: NIS2_EU_SOURCE.filename,
          legacyFilename: LEGACY_NIS2_EU_SOURCE_FILENAME,
          migratedArticles: results.length,
          migratedLinks: results.reduce((total, row) => total + row.migratedLinks, 0),
          results,
        },
        null,
        2,
      ),
    );
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
