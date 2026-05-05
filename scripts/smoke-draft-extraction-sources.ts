import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL?.trim();

assert.ok(databaseUrl, "DATABASE_URL is required for draft extraction source smoke test.");

type PromotedDraftRow = {
  article_key: string;
  filename: string;
  review_status: string;
  title: string | null;
};

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const promotedDrafts = await pool.query<PromotedDraftRow>(`
      SELECT
        a.article_key,
        a.review_status,
        a.title,
        sd.filename
      FROM articles a
      JOIN source_documents sd ON sd.id = a.source_document_id
      WHERE sd.filename IN (
        'cz/zakonyprolidi_cs_2025_264_v20251101.pdf',
        'cz/zakonyprolidi_cs_2025_409_v20251101.pdf',
        'cz/zakonyprolidi_cs_2025_410_v20251101.pdf'
      )
        AND a.review_status <> 'draft'
      ORDER BY sd.filename, a.article_key
    `);

    assert.deepEqual(
      promotedDrafts.rows,
      [],
      `Zákony pro lidi extraction rows must stay draft until checked against an official source: ${JSON.stringify(promotedDrafts.rows, null, 2)}`,
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
