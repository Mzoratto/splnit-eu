import { loadEnvConfig } from "@next/env";
import { getDb } from "../lib/db";
import { sourceDocuments } from "../lib/db/schema";
import { AUTHORITATIVE_SOURCE_DOCUMENTS } from "../lib/regulations/authoritative-sources";

loadEnvConfig(process.cwd());

const lastReviewed = new Date("2026-05-05T00:00:00.000Z");

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

  console.log(`Imported ${count} authoritative source document rows.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
