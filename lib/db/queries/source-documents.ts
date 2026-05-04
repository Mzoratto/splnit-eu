import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { sourceDocuments } from "@/lib/db/schema";

export type SourceDocument = typeof sourceDocuments.$inferSelect;

export async function getSourceDocumentByFilename(filename: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(sourceDocuments)
    .where(eq(sourceDocuments.filename, filename))
    .limit(1);

  return rows[0] ?? null;
}

export async function listSourceDocumentsByFilenames(filenames: string[]) {
  if (filenames.length === 0) {
    return [];
  }

  const db = getDb();

  return db
    .select()
    .from(sourceDocuments)
    .where(inArray(sourceDocuments.filename, filenames));
}
