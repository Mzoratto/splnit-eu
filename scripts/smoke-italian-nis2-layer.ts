import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL?.trim();

assert.ok(databaseUrl, "DATABASE_URL is required for Italian NIS2 smoke test.");

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const sourceResult = await pool.query<{
      filename: string;
      last_reviewed: Date | null;
      url: string | null;
    }>(
      `
      SELECT filename, last_reviewed, url
      FROM source_documents
      WHERE filename = 'it/dlgs-138-2024.html'
    `,
    );
    const source = sourceResult.rows[0];

    assert.ok(source, "Italian NIS2 Gazzetta source should exist.");
    assert.equal(
      new URL(source.url ?? "").hostname,
      "www.gazzettaufficiale.it",
      "Italian NIS2 source should use Gazzetta Ufficiale.",
    );
    assert.ok(source.last_reviewed, "Italian NIS2 source should have lastReviewed.");

    const articlesResult = await pool.query<{
      article_key: string;
      official_text: string;
      review_status: string;
      title: string | null;
    }>(
      `
      SELECT article_key, title, official_text, review_status
      FROM articles
      WHERE jurisdiction = 'IT'
        AND locale = 'it-IT'
        AND article_key = ANY($1::text[])
      ORDER BY article_key
    `,
      [["Art. 23", "Art. 24", "Art. 25"]],
    );

    const articlesByKey = new Map(
      articlesResult.rows.map((row) => [row.article_key, row]),
    );

    for (const articleKey of ["Art. 23", "Art. 24", "Art. 25"]) {
      const row = articlesByKey.get(articleKey);

      assert.ok(row, `${articleKey} should be imported for Italian NIS2.`);
      assert.equal(row.review_status, "reviewed", `${articleKey} should be reviewed.`);
      assert.ok(row.title, `${articleKey} should have a title.`);
    }

    assert.match(
      articlesByKey.get("Art. 24")?.official_text ?? "",
      /misure di gestione dei rischi per la sicurezza/i,
      "Art. 24 should contain risk-management measure text.",
    );
    assert.match(
      articlesByKey.get("Art. 25")?.official_text ?? "",
      /notifica di incidente/i,
      "Art. 25 should contain incident notification text.",
    );

    const mappingResult = await pool.query<{
      confidence: string;
      count: number;
    }>(
      `
      SELECT fca.confidence, COUNT(*)::int AS count
      FROM framework_control_articles fca
      JOIN articles a ON a.id = fca.article_id
      WHERE a.jurisdiction = 'IT'
        AND a.locale = 'it-IT'
      GROUP BY fca.confidence
    `,
    );
    const mappingCounts = new Map(
      mappingResult.rows.map((row) => [row.confidence, row.count]),
    );

    assert.ok(
      (mappingCounts.get("draft") ?? 0) > 0,
      "Italian NIS2 framework-control links should be draft pending mapping review.",
    );
    assert.equal(
      mappingCounts.get("reviewed") ?? 0,
      0,
      "Italian NIS2 mappings must not be reviewed before mapping review.",
    );

    const acnGuidanceResult = await pool.query<{
      article_key: string;
      official_text: string;
      review_status: string;
      source_filename: string;
    }>(
      `
      SELECT
        a.article_key,
        a.official_text,
        a.review_status,
        sd.filename AS source_filename
      FROM articles a
      JOIN source_documents sd ON sd.id = a.source_document_id
      WHERE a.jurisdiction = 'IT'
        AND a.locale = 'it-IT'
        AND a.article_key = ANY($1::text[])
      ORDER BY a.article_key
    `,
      [
        [
          "ACN 136117/2025",
          "ACN 164179/2025",
          "ACN 164179/2025 Allegato 1",
          "ACN 164179/2025 Allegato 2",
          "ACN 164179/2025 Allegato 3",
          "ACN 164179/2025 Allegato 4",
        ],
      ],
    );
    const acnGuidanceByKey = new Map(
      acnGuidanceResult.rows.map((row) => [row.article_key, row]),
    );

    for (const articleKey of [
      "ACN 136117/2025",
      "ACN 164179/2025",
      "ACN 164179/2025 Allegato 1",
      "ACN 164179/2025 Allegato 2",
      "ACN 164179/2025 Allegato 3",
      "ACN 164179/2025 Allegato 4",
    ]) {
      const row = acnGuidanceByKey.get(articleKey);

      assert.ok(row, `${articleKey} should be imported as ACN guidance.`);
      assert.equal(row.review_status, "reviewed", `${articleKey} should be reviewed.`);
      assert.match(
        row.source_filename,
        /^it\/acn-/,
        `${articleKey} should come from an ACN source document.`,
      );
    }

    assert.match(
      acnGuidanceByKey.get("ACN 164179/2025 Allegato 1")?.official_text ?? "",
      /Misure di sicurezza di base per i soggetti importanti/i,
      "ACN Allegato 1 should contain important-entity baseline measures.",
    );
  } finally {
    await pool.end();
  }
}

main()
  .then(() => {
    console.log("Italian NIS2 knowledge-layer smoke test passed.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
