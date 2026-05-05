import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL?.trim();

assert.ok(databaseUrl, "DATABASE_URL is required for Italian GDPR smoke test.");

const requiredGaranteArticleKeys = [
  "Garante Data Breach",
  "Garante DPIA",
  "Garante Registro Trattamenti FAQ",
] as const;

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
      WHERE filename = ANY($1::text[])
      ORDER BY filename
    `,
      [
        [
          "it/codice-privacy-dlgs-196-2003.html",
          "it/garante-data-breach.html",
          "it/garante-dpia.html",
          "it/garante-ropa-faq.html",
        ],
      ],
    );

    assert.equal(
      sourceResult.rows.length,
      4,
      "Italian GDPR source documents should exist.",
    );

    for (const source of sourceResult.rows) {
      assert.ok(source.last_reviewed, `${source.filename} should have lastReviewed.`);
      const hostname = new URL(source.url ?? "").hostname;

      if (source.filename === "it/codice-privacy-dlgs-196-2003.html") {
        assert.equal(
          hostname,
          "www.normattiva.it",
          `${source.filename} should use the official Normattiva hostname.`,
        );
      } else {
        assert.equal(
          hostname,
          "www.garanteprivacy.it",
          `${source.filename} should use the official Garante hostname.`,
        );
      }
    }

    const articlesResult = await pool.query<{
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
      [["D.Lgs. 196/2003", ...requiredGaranteArticleKeys]],
    );

    const articlesByKey = new Map(
      articlesResult.rows.map((row) => [row.article_key, row]),
    );

    for (const articleKey of requiredGaranteArticleKeys) {
      const row = articlesByKey.get(articleKey);

      assert.ok(row, `${articleKey} should be imported as Garante guidance.`);
      assert.equal(row.review_status, "reviewed", `${articleKey} should be reviewed.`);
      assert.match(
        row.source_filename,
        /^it\/garante-/,
        `${articleKey} should come from a Garante source document.`,
      );
    }

    const codice = articlesByKey.get("D.Lgs. 196/2003");

    assert.ok(codice, "D.Lgs. 196/2003 should be imported as Codice Privacy.");
    assert.equal(
      codice.review_status,
      "reviewed",
      "D.Lgs. 196/2003 should be reviewed.",
    );
    assert.equal(
      codice.source_filename,
      "it/codice-privacy-dlgs-196-2003.html",
      "D.Lgs. 196/2003 should come from the Normattiva source document.",
    );
    assert.match(
      codice.official_text,
      /Codice in materia di protezione dei dati personali|regolamento \(UE\) n\. 2016\/679/i,
      "Codice Privacy source text should contain the consolidated privacy-code title.",
    );

    assert.match(
      articlesByKey.get("Garante Data Breach")?.official_text ?? "",
      /entro 72 ore|violazione dei dati personali/i,
      "Garante data breach guidance should contain breach notification text.",
    );
    assert.match(
      articlesByKey.get("Garante DPIA")?.official_text ?? "",
      /valutazione di impatto|art\.?\s*35/i,
      "Garante DPIA guidance should contain DPIA text.",
    );
    assert.match(
      articlesByKey.get("Garante Registro Trattamenti FAQ")?.official_text ?? "",
      /art\.?\s*30|registro delle attività di trattamento/i,
      "Garante ROPA FAQ should contain processing-record text.",
    );

    const linkedMappings = await pool.query<{ count: number }>(
      `
      SELECT COUNT(*)::int AS count
      FROM framework_control_articles fca
      JOIN articles a ON a.id = fca.article_id
      WHERE a.article_key = ANY($1::text[])
    `,
      [["D.Lgs. 196/2003", ...requiredGaranteArticleKeys]],
    );

    assert.equal(
      linkedMappings.rows[0]?.count ?? 0,
      0,
      "Italian GDPR source import should not create or promote mapping links.",
    );
  } finally {
    await pool.end();
  }
}

main()
  .then(() => {
    console.log("Italian GDPR source-layer smoke test passed.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
