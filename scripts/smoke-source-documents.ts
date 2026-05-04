import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL?.trim();

assert.ok(databaseUrl, "DATABASE_URL is required for source document smoke test.");

const requiredItalianSources = [
  "it/dlgs-138-2024.html",
  "it/acn-nis-piattaforma-2025-136117.pdf",
  "it/acn-nis-specifiche-2025-164179.pdf",
  "it/acn-nis-specifiche-2025-164179-allegato1.pdf",
  "it/acn-nis-specifiche-2025-164179-allegato2.pdf",
  "it/acn-nis-specifiche-2025-164179-allegato3.pdf",
  "it/acn-nis-specifiche-2025-164179-allegato4.pdf",
  "eu/gdpr-2016-679-it.html",
  "it/codice-privacy-dlgs-196-2003.pdf",
  "it/garante-data-breach.html",
  "it/garante-dpia.html",
  "it/garante-ropa-faq.html",
] as const;

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const result = await pool.query<{
      effective_date: Date | null;
      filename: string;
      last_reviewed: Date | null;
      url: string | null;
    }>(
      `
      SELECT filename, effective_date, last_reviewed, url
      FROM source_documents
      WHERE filename = ANY($1::text[])
    `,
      [requiredItalianSources],
    );

    const rowsByFilename = new Map(
      result.rows.map((row) => [row.filename, row]),
    );

    for (const filename of requiredItalianSources) {
      const row = rowsByFilename.get(filename);

      assert.ok(row, `${filename} should be seeded in source_documents.`);
      assert.ok(row.url, `${filename} should have an official source URL.`);
      assert.ok(row.last_reviewed, `${filename} should have lastReviewed set.`);
    }

    for (const filename of [
      "it/dlgs-138-2024.html",
      "it/acn-nis-piattaforma-2025-136117.pdf",
      "it/acn-nis-specifiche-2025-164179.pdf",
      "eu/gdpr-2016-679-it.html",
      "it/codice-privacy-dlgs-196-2003.pdf",
    ]) {
      assert.ok(
        rowsByFilename.get(filename)?.effective_date,
        `${filename} should have an effective date.`,
      );
    }
  } finally {
    await pool.end();
  }
}

main()
  .then(() => {
    console.log("Source document smoke test passed.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
