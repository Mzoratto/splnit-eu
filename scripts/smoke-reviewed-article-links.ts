import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL?.trim();

assert.ok(databaseUrl, "DATABASE_URL is required for reviewed article link smoke test.");

type MissingLinkRow = {
  article_key: string;
  article_ref: string;
  framework_control_id: string;
};

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const missingLinks = await pool.query<MissingLinkRow>(`
      WITH nis2_framework_controls AS (
        SELECT
          fc.id AS framework_control_id,
          fc.article_ref,
          CASE
            WHEN fc.article_ref LIKE 'Article 21%' THEN 'Article 21'
            WHEN fc.article_ref = 'Article 23' THEN 'Article 23'
            ELSE NULL
          END AS article_key,
          fc.framework_id
        FROM framework_controls fc
        JOIN frameworks f ON f.id = fc.framework_id
        WHERE f.slug = 'nis2'
      )
      SELECT nfc.framework_control_id, nfc.article_ref, nfc.article_key
      FROM nis2_framework_controls nfc
      WHERE nfc.article_key IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM articles a
          WHERE a.framework_id = nfc.framework_id
            AND a.article_key = nfc.article_key
            AND a.review_status = 'reviewed'
        )
        AND NOT EXISTS (
          SELECT 1
          FROM framework_control_articles fca
          JOIN articles a ON a.id = fca.article_id
          WHERE fca.framework_control_id = nfc.framework_control_id
            AND a.article_key = nfc.article_key
            AND a.review_status = 'reviewed'
        )
      ORDER BY nfc.article_ref, nfc.framework_control_id
    `);

    assert.deepEqual(
      missingLinks.rows,
      [],
      `Reviewed article links are missing: ${JSON.stringify(missingLinks.rows, null, 2)}`,
    );
  } finally {
    await pool.end();
  }
}

main()
  .then(() => {
    console.log("Reviewed article link smoke test passed.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
