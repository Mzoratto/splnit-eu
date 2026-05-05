import { spawnSync } from "node:child_process";
import { basename, join } from "node:path";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import { eq } from "drizzle-orm";
import { loadEnvConfig } from "@next/env";
import { getDb } from "../lib/db";
import { articles, frameworks, sourceDocuments } from "../lib/db/schema";
import { ITALIAN_NIS2_ACN_GUIDANCE_DOCUMENTS } from "../lib/regulations/italian-nis2-acn";
import type { AuthoritativeSourceDocument } from "../lib/regulations/authoritative-sources";

loadEnvConfig(process.cwd());

const lastReviewed = new Date("2026-05-05T00:00:00.000Z");

function getArg(name: string) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function toEffectiveDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function pdftotext(pdfPath: string) {
  const result = spawnSync("pdftotext", ["-layout", pdfPath, "-"], {
    encoding: "utf8",
    maxBuffer: 80 * 1024 * 1024,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || `pdftotext failed for ${pdfPath}`);
  }

  return normalizePdfText(result.stdout);
}

function normalizePdfText(value: string) {
  return value
    .normalize("NFKC")
    .replace(/\r/g, "")
    .replace(/[ \t\f\v]+$/gm, "")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

async function fetchPdfText(url: string, filename: string) {
  const fileDirectory = getArg("--file-dir");
  const localPath = fileDirectory ? join(fileDirectory, basename(filename)) : null;

  if (localPath) {
    await readFile(localPath);
    return pdftotext(localPath);
  }

  const response = await fetch(url, {
    headers: {
      "user-agent": "Splnit.eu source ingestion (+https://splnit.eu)",
    },
  });

  if (response.status !== 200) {
    throw new Error(
      `ACN PDF fetch failed for ${filename}: ${response.status} ${response.statusText}. Download ${url} manually and rerun with --file-dir <directory>.`,
    );
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("pdf")) {
    throw new Error(
      `ACN source ${filename} returned unexpected content-type: ${contentType}`,
    );
  }

  const temporaryDirectory = await mkdtemp(pathPrefix());
  const pdfPath = join(temporaryDirectory, basename(filename));

  try {
    await writeFile(pdfPath, Buffer.from(await response.arrayBuffer()));
    return pdftotext(pdfPath);
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true });
  }
}

function pathPrefix() {
  return join(os.tmpdir(), "splnit-acn-");
}

async function upsertSourceDocument(sourceDocument: AuthoritativeSourceDocument) {
  const db = getDb();
  const effectiveDate = toEffectiveDate(sourceDocument.effectiveDate);
  const [row] = await db
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
    })
    .returning({ id: sourceDocuments.id });

  return row.id;
}

async function getNis2FrameworkId() {
  const db = getDb();
  const rows = await db
    .select({ id: frameworks.id })
    .from(frameworks)
    .where(eq(frameworks.slug, "nis2"))
    .limit(1);
  const row = rows[0];

  if (!row) {
    throw new Error("Missing NIS2 framework. Run npm run db:seed first.");
  }

  return row.id;
}

async function main() {
  const db = getDb();
  const frameworkId = await getNis2FrameworkId();
  let imported = 0;

  for (const definition of ITALIAN_NIS2_ACN_GUIDANCE_DOCUMENTS) {
    const sourceDocumentId = await upsertSourceDocument(definition.sourceDocument);
    const officialText = await fetchPdfText(
      definition.sourceDocument.url,
      definition.sourceDocument.filename,
    );

    if (!definition.requiredTextPattern.test(officialText)) {
      throw new Error(
        `ACN source ${definition.sourceDocument.filename} did not contain expected text pattern ${definition.requiredTextPattern}.`,
      );
    }

    await db
      .insert(articles)
      .values({
        articleKey: definition.articleKey,
        citation: definition.citation,
        effectiveDate: toEffectiveDate(definition.sourceDocument.effectiveDate),
        frameworkId,
        jurisdiction: definition.sourceDocument.jurisdiction,
        lastReviewed,
        locale: definition.sourceDocument.locale,
        officialText,
        reviewStatus: "reviewed",
        sourceDocumentId,
        title: definition.sourceDocument.title,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [articles.sourceDocumentId, articles.locale, articles.articleKey],
        set: {
          citation: definition.citation,
          effectiveDate: toEffectiveDate(definition.sourceDocument.effectiveDate),
          frameworkId,
          jurisdiction: definition.sourceDocument.jurisdiction,
          lastReviewed,
          officialText,
          reviewStatus: "reviewed",
          title: definition.sourceDocument.title,
          updatedAt: new Date(),
        },
      });

    imported += 1;
  }

  console.log(`Imported ${imported} reviewed Italian NIS2 ACN guidance rows.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
