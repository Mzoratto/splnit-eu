import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import {
  AUTHORITATIVE_SOURCE_DOCUMENTS,
  EU_CANONICAL_SOURCE_DOCUMENTS,
} from "../lib/regulations/authoritative-sources";

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

const requiredSourceDocuments = [
  ...new Set([
    ...AUTHORITATIVE_SOURCE_DOCUMENTS.map((source) => source.filename),
    ...requiredItalianSources,
  ]),
];

type ReviewedEuArticleSourceRow = {
  article_key: string;
  citation: string;
  filename: string | null;
  url: string | null;
};

function assertOfficialAuthority(filename: string, url: string) {
  const host = new URL(url).hostname.toLowerCase();

  if (filename.startsWith("eu/")) {
    assert.equal(host, "eur-lex.europa.eu", `${filename} should use EUR-Lex.`);
    return;
  }

  if (filename.startsWith("it/acn-")) {
    assert.equal(host, "www.acn.gov.it", `${filename} should use ACN.`);
    return;
  }

  if (
    filename.startsWith("it/garante-") ||
    filename === "it/codice-privacy-dlgs-196-2003.pdf"
  ) {
    assert.equal(
      host,
      "www.garanteprivacy.it",
      `${filename} should use Garante Privacy.`,
    );
    return;
  }

  if (filename === "it/dlgs-138-2024.html") {
    assert.equal(
      host,
      "www.gazzettaufficiale.it",
      `${filename} should use Gazzetta Ufficiale.`,
    );
    return;
  }

  if (filename.startsWith("cz/")) {
    assert.ok(
      host === "e-sbirka.gov.cz" ||
        host === "www.psp.cz" ||
        host === "nukib.gov.cz" ||
        host === "uoou.gov.cz",
      `${filename} should use e-Sbírka, PSP Sbírka, NÚKIB, or ÚOOÚ.`,
    );
    return;
  }

  if (filename.startsWith("iso/")) {
    assert.equal(host, "www.iso.org", `${filename} should use ISO Store.`);
  }
}

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
      [requiredSourceDocuments],
    );

    const rowsByFilename = new Map(
      result.rows.map((row) => [row.filename, row]),
    );

    for (const filename of requiredSourceDocuments) {
      const row = rowsByFilename.get(filename);

      assert.ok(row, `${filename} should be seeded in source_documents.`);
      assert.ok(row.url, `${filename} should have an official source URL.`);
      assert.ok(row.last_reviewed, `${filename} should have lastReviewed set.`);
      assertOfficialAuthority(filename, row.url);
    }

    for (const source of EU_CANONICAL_SOURCE_DOCUMENTS) {
      const row = rowsByFilename.get(source.filename);
      assert.ok(
        row?.url?.includes("/TXT/PDF/"),
        `${source.filename} should use EUR-Lex PDF.`,
      );
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

    const reviewedEuArticleSources = await pool.query<ReviewedEuArticleSourceRow>(
      `
        SELECT
          a.article_key,
          a.citation,
          sd.filename,
          sd.url
        FROM articles a
        JOIN source_documents sd ON sd.id = a.source_document_id
        WHERE a.jurisdiction = 'EU'
          AND a.review_status = 'reviewed'
        ORDER BY sd.filename, a.article_key
      `,
    );

    for (const row of reviewedEuArticleSources.rows) {
      assert.ok(row.url, `${row.citation} should have a source URL.`);
      assert.equal(
        new URL(row.url).hostname.toLowerCase(),
        "eur-lex.europa.eu",
        `${row.citation} (${row.filename ?? "no filename"}) should use EUR-Lex as authoritative EU source.`,
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
