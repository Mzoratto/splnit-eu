import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL?.trim();

assert.ok(databaseUrl, "DATABASE_URL is required for draft extraction source smoke test.");

type PromotedDraftRow = {
  article_key: string;
  citation: string;
  filename: string;
  review_status: string;
  source_title: string;
  title: string | null;
};

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const promotedDrafts = await pool.query<PromotedDraftRow>(`
      SELECT
        a.article_key,
        a.citation,
        a.review_status,
        a.title,
        sd.filename,
        sd.title AS source_title
      FROM articles a
      JOIN source_documents sd ON sd.id = a.source_document_id
      WHERE (
        lower(coalesce(sd.filename, '')) LIKE '%zakonyprolidi%'
        OR lower(coalesce(sd.filename, '')) LIKE '%draft%'
        OR lower(coalesce(sd.filename, '')) LIKE '%extraction%'
        OR lower(sd.title) LIKE '%draft%'
        OR lower(sd.title) LIKE '%extraction%'
        OR lower(sd.citation) LIKE '%draft%'
        OR lower(sd.citation) LIKE '%extraction%'
      )
        AND a.review_status <> 'draft'
      ORDER BY sd.filename, a.article_key
    `);

    assert.deepEqual(
      promotedDrafts.rows,
      [],
      `Draft/extraction source rows must stay draft until checked against an official source: ${JSON.stringify(promotedDrafts.rows, null, 2)}`,
    );
  } finally {
    await pool.end();
  }
}

main()
  .then(() => {
    console.log("Draft extraction source smoke test passed.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
