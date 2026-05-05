import { loadEnvConfig } from "@next/env";
import { sql } from "drizzle-orm";
import { getDb } from "../lib/db";
import { sourceDocuments } from "../lib/db/schema";
import { AUTHORITATIVE_SOURCE_DOCUMENTS } from "../lib/regulations/authoritative-sources";

loadEnvConfig(process.cwd());

const lastReviewed = new Date("2026-05-05T00:00:00.000Z");
const legacySourceDocumentFilenames = [
  "eu/gdpr-2016-679-it.html",
  "it/codice-privacy-dlgs-196-2003.pdf",
] as const;

function toEffectiveDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

async function main() {
  const db = getDb();
  let count = 0;

  for (const sourceDocument of AUTHORITATIVE_SOURCE_DOCUMENTS) {
    const effectiveDate = toEffectiveDate(sourceDocument.effectiveDate);

    await db
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
      });

    count += 1;
  }

  await db.execute(sql`
    DELETE FROM source_documents sd
    WHERE sd.filename IN (${sql.join(
      legacySourceDocumentFilenames.map((filename) => sql`${filename}`),
      sql`, `,
    )})
      AND NOT EXISTS (
        SELECT 1
        FROM articles a
        WHERE a.source_document_id = sd.id
      )
  `);

  console.log(`Imported ${count} authoritative source document rows.`);
  console.log("Retired unreferenced legacy source document rows when present.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
