import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import { CZECH_CYBER_LAW_264_SECTIONS } from "../lib/regulations/czech-cyber-law";
import { CZECH_CYBER_DECREE_SOURCES } from "../lib/regulations/czech-decrees";
import { extractCzechSection } from "../lib/regulations/czech-sections";
import { extractEurLexArticleText } from "../lib/regulations/eur-lex-text";
import { extractOfficialJournalArticle } from "../lib/regulations/official-journal";
import { NIS2_EU_ARTICLES, NIS2_EU_SOURCE } from "../lib/regulations/nis2-eu";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL?.trim();
const SHOULD_PROMOTE = process.argv.includes("--promote-reviewed");
const REVIEWED_AT = new Date("2026-05-05T00:00:00.000Z");
const E_SBIRKA_API_BASE = "https://e-sbirka.gov.cz/sbr-externi";
const E_SBIRKA_FILE_BASE = "https://e-sbirka.gov.cz/souborove-sluzby/soubory";
const DOWNLOAD_DIR = "/tmp/splnit-official";

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for official legal source verification.");
}

type ExistingArticleRow = {
  article_key: string;
  id: string;
  official_text: string;
  review_status: string;
};

type ExtractedArticle = {
  articleKey: string;
  citation: string;
  officialText: string;
  title: string | null;
};

type EuSourceInput = {
  format: "pdf-text" | "xhtml";
  text: string;
};

type CzechOfficialSource = {
  citation: string;
  draftFilename: string;
  effectiveDate: string;
  officialFilename: string;
  sections: readonly {
    articleKey: string;
    citation: string;
    sectionNumber: number;
  }[];
  stableUrl: string;
  title: string;
  url: string;
};

function normalizeForComparison(value: string) {
  return value
    .normalize("NFKC")
    .replace(/\u00a0/g, " ")
    .replace(/\bStrana\s+\d+\s+Akt č\.\s+\d+\s*\/\s*2025 Sb\.\b/g, " ")
    .replace(/\bAkt č\.\s+\d+\s*\/\s*2025 Sb\.\s+Strana\s+\d+\b/g, " ")
    .replace(/([\p{L}])-\s+([\p{Ll}])/gu, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}

function getArg(name: string) {
  const inlineValue = process.argv.find((arg) => arg.startsWith(`${name}=`));

  if (inlineValue) {
    return inlineValue.slice(name.length + 1) || null;
  }

  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function repairCzechPdfHyphenation(value: string) {
  return value.replace(/([\p{L}])-\n\s*([\p{Ll}])/gu, "$1$2");
}

function stripCzechPdfPageArtifacts(value: string) {
  return value
    .split("\n")
    .filter((line) => {
      const normalized = line.normalize("NFKC").trim();

      return (
        !/^Strana\s+\d+\s+Akt č\.\s+\d+\s*\/\s*2025 Sb\.$/.test(normalized) &&
        !/^Akt č\.\s+\d+\s*\/\s*2025 Sb\.\s+Strana\s+\d+$/.test(normalized)
      );
    })
    .join("\n");
}

async function fetchText(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Fetch failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json" } });

  if (!response.ok) {
    throw new Error(`Fetch failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

async function fetchFile(url: string, destination: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`File fetch failed for ${url}: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, buffer);
}

function pdftotext(pdfPath: string) {
  const result = spawnSync("pdftotext", ["-layout", pdfPath, "-"], {
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || `pdftotext failed for ${pdfPath}`);
  }

  return result.stdout;
}

function euSourceFormatFromPath(filePath: string): EuSourceInput["format"] {
  return filePath.toLowerCase().endsWith(".pdf") ? "pdf-text" : "xhtml";
}

async function loadEuOfficialSource(): Promise<EuSourceInput> {
  const file = getArg("--nis2-eu-file") ?? process.env.NIS2_EU_SOURCE_FILE ?? null;

  if (file) {
    const format = euSourceFormatFromPath(file);
    const text = format === "pdf-text" ? pdftotext(file) : await readFile(file, "utf8");

    return { format, text };
  }

  await mkdir(DOWNLOAD_DIR, { recursive: true });
  const pdfPath = path.join(DOWNLOAD_DIR, "nis2-eu-eurlex.pdf");
  const response = await fetch(NIS2_EU_SOURCE.url);

  if (response.status !== 200) {
    throw new Error(
      `NIS2 EU EUR-Lex PDF fetch failed: ${response.status} ${response.statusText}. If EUR-Lex blocks CLI access, download ${NIS2_EU_SOURCE.url} manually and rerun with --nis2-eu-file <pdf-path>.`,
    );
  }

  await writeFile(pdfPath, Buffer.from(await response.arrayBuffer()));

  return {
    format: "pdf-text",
    text: pdftotext(pdfPath),
  };
}

function extractEuArticle(source: EuSourceInput, articleId: string) {
  if (source.format === "xhtml") {
    return extractOfficialJournalArticle(source.text, articleId);
  }

  return extractEurLexArticleText(source.text, articleId);
}

function czechSources(): CzechOfficialSource[] {
  return [
    {
      citation: "Zákon č. 264/2025 Sb., o kybernetické bezpečnosti",
      draftFilename: "cz/zakonyprolidi_cs_2025_264_v20251101.pdf",
      effectiveDate: "2025-11-01",
      officialFilename: "cz/esbirka_sb_2025_264_pzz.pdf",
      sections: CZECH_CYBER_LAW_264_SECTIONS.map((section) => ({
        ...section,
        articleKey: `§ ${section.sectionNumber}`,
      })),
      stableUrl: "/sb/2025/264",
      title: "Zákon č. 264/2025 Sb. - o kybernetické bezpečnosti",
      url: "https://e-sbirka.cz/sb/2025/264",
    },
    ...CZECH_CYBER_DECREE_SOURCES.map((source) => ({
      citation:
        source.number === "409"
          ? "Vyhláška č. 409/2025 Sb., o bezpečnostních opatřeních poskytovatele regulované služby v režimu vyšších povinností"
          : "Vyhláška č. 410/2025 Sb., o bezpečnostních opatřeních poskytovatele regulované služby v režimu nižších povinností",
      draftFilename: source.filename,
      effectiveDate: source.effectiveDate,
      officialFilename: `cz/esbirka_sb_2025_${source.number}_pzz.pdf`,
      sections: source.sections.map((section) => ({
        ...section,
        articleKey: `${source.number} § ${section.sectionNumber}`,
      })),
      stableUrl: `/sb/2025/${source.number}`,
      title: `${source.title} - official e-Sbírka verified source`,
      url: `https://e-sbirka.cz/sb/2025/${source.number}`,
    })),
  ];
}

async function downloadOfficialCzechPdf(source: CzechOfficialSource) {
  await mkdir(DOWNLOAD_DIR, { recursive: true });
  const encodedStableUrl = encodeURIComponent(source.stableUrl);
  const documentId = await fetchText(
    `${E_SBIRKA_API_BASE}/dokumenty-sbirky/${encodedStableUrl}/id`,
  );
  const request = await fetchJson<{
    id?: string;
    nazevDokumentu?: string;
    stavPozadavku?: string;
  }>(
    `${E_SBIRKA_API_BASE}/stahni/pravne-zavazne-zneni-vcetne-uplnych/${documentId.trim()}`,
  );

  if (request.stavPozadavku !== "OK" || !request.id) {
    throw new Error(
      `e-Sbírka did not prepare ${source.stableUrl}: ${JSON.stringify(request)}`,
    );
  }

  const pdfPath = path.join(DOWNLOAD_DIR, request.nazevDokumentu ?? path.basename(source.officialFilename));
  await fetchFile(`${E_SBIRKA_FILE_BASE}/${request.id}`, pdfPath);

  return pdfPath;
}

async function queryExistingArticles(
  pool: Pool,
  filename: string,
  articleKeys: string[],
) {
  const result = await pool.query<ExistingArticleRow>(
    `
      SELECT a.id, a.article_key, a.official_text, a.review_status
      FROM articles a
      JOIN source_documents sd ON sd.id = a.source_document_id
      WHERE sd.filename = $1
        AND a.article_key = ANY($2::text[])
      ORDER BY a.article_key
    `,
    [filename, articleKeys],
  );

  return new Map(result.rows.map((row) => [row.article_key, row]));
}

function compareArticles(input: {
  existingByKey: Map<string, ExistingArticleRow>;
  extracted: ExtractedArticle[];
  sourceLabel: string;
}) {
  const mismatches: string[] = [];

  for (const article of input.extracted) {
    const existing = input.existingByKey.get(article.articleKey);

    if (!existing) {
      mismatches.push(`${input.sourceLabel} ${article.articleKey}: missing database row`);
      continue;
    }

    if (
      normalizeForComparison(existing.official_text) !==
      normalizeForComparison(article.officialText)
    ) {
      mismatches.push(`${input.sourceLabel} ${article.articleKey}: official text mismatch`);
    }
  }

  if (mismatches.length > 0) {
    throw new Error(
      `Official source verification failed:\n${mismatches
        .map((mismatch) => `- ${mismatch}`)
        .join("\n")}`,
    );
  }
}

async function upsertOfficialSourceDocument(
  pool: Pool,
  source: {
    citation: string;
    effectiveDate: string;
    filename: string;
    jurisdiction: string;
    locale: string;
    title: string;
    url: string;
  },
) {
  const result = await pool.query<{ id: string }>(
    `
      INSERT INTO source_documents (
        citation,
        effective_date,
        filename,
        jurisdiction,
        last_reviewed,
        locale,
        title,
        url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (filename) DO UPDATE SET
        citation = EXCLUDED.citation,
        effective_date = EXCLUDED.effective_date,
        jurisdiction = EXCLUDED.jurisdiction,
        last_reviewed = EXCLUDED.last_reviewed,
        locale = EXCLUDED.locale,
        title = EXCLUDED.title,
        url = EXCLUDED.url
      RETURNING id
    `,
    [
      source.citation,
      new Date(`${source.effectiveDate}T00:00:00.000Z`),
      source.filename,
      source.jurisdiction,
      REVIEWED_AT,
      source.locale,
      source.title,
      source.url,
    ],
  );

  return result.rows[0].id;
}

async function upsertOfficialArticle(
  pool: Pool,
  input: {
    article: ExtractedArticle;
    effectiveDate: string;
    frameworkId: string;
    jurisdiction: string;
    locale: string;
    sourceDocumentId: string;
  },
) {
  const result = await pool.query<{ id: string }>(
    `
      INSERT INTO articles (
        article_key,
        citation,
        effective_date,
        framework_id,
        jurisdiction,
        last_reviewed,
        locale,
        official_text,
        review_status,
        source_document_id,
        title,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'reviewed', $9, $10, $6)
      ON CONFLICT (source_document_id, locale, article_key) DO UPDATE SET
        citation = EXCLUDED.citation,
        effective_date = EXCLUDED.effective_date,
        framework_id = EXCLUDED.framework_id,
        jurisdiction = EXCLUDED.jurisdiction,
        last_reviewed = EXCLUDED.last_reviewed,
        official_text = EXCLUDED.official_text,
        review_status = 'reviewed',
        title = EXCLUDED.title,
        updated_at = EXCLUDED.updated_at
      RETURNING id
    `,
    [
      input.article.articleKey,
      input.article.citation,
      new Date(`${input.effectiveDate}T00:00:00.000Z`),
      input.frameworkId,
      input.jurisdiction,
      REVIEWED_AT,
      input.locale,
      input.article.officialText,
      input.sourceDocumentId,
      input.article.title,
    ],
  );

  return result.rows[0].id;
}

async function promoteEuArticles(pool: Pool, extracted: ExtractedArticle[]) {
  const sourceResult = await pool.query<{ id: string }>(
    `
      UPDATE source_documents
      SET
        citation = $1,
        effective_date = $2,
        last_reviewed = $3,
        title = $4,
        url = $5
      WHERE filename = $6
      RETURNING id
    `,
    [
      NIS2_EU_SOURCE.citation,
      new Date(`${NIS2_EU_SOURCE.effectiveDate}T00:00:00.000Z`),
      REVIEWED_AT,
      NIS2_EU_SOURCE.title,
      NIS2_EU_SOURCE.url,
      NIS2_EU_SOURCE.filename,
    ],
  );

  const sourceDocumentId = sourceResult.rows[0]?.id;

  if (!sourceDocumentId) {
    throw new Error("Missing NIS2 EU source document. Run knowledge:import:nis2-eu first.");
  }

  for (const article of extracted) {
    await pool.query(
      `
        UPDATE articles
        SET
          citation = $1,
          official_text = $2,
          review_status = 'reviewed',
          last_reviewed = $3,
          title = $4,
          updated_at = $3
        WHERE source_document_id = $5
          AND locale = $6
          AND article_key = $7
      `,
      [
        article.citation,
        article.officialText,
        REVIEWED_AT,
        article.title,
        sourceDocumentId,
        NIS2_EU_SOURCE.locale,
        article.articleKey,
      ],
    );
  }

  await pool.query(
    `
      UPDATE framework_control_articles fca
      SET confidence = 'reviewed'
      FROM articles a
      WHERE a.id = fca.article_id
        AND a.source_document_id = $1
        AND a.locale = $2
        AND a.article_key = ANY($3::text[])
    `,
    [
      sourceDocumentId,
      NIS2_EU_SOURCE.locale,
      extracted.map((article) => article.articleKey),
    ],
  );
}

async function copyDraftMappingsToOfficialArticles(
  pool: Pool,
  input: {
    draftArticleId: string;
    officialArticleId: string;
  },
) {
  await pool.query(
    `
      INSERT INTO framework_control_articles (
        framework_control_id,
        article_id,
        citation_note,
        confidence
      )
      SELECT
        fca.framework_control_id,
        $1,
        CONCAT(fca.citation_note, ' · official source verified; mapping still draft'),
        'draft'
      FROM framework_control_articles fca
      WHERE fca.article_id = $2
      ON CONFLICT (framework_control_id, article_id) DO UPDATE SET
        citation_note = EXCLUDED.citation_note,
        confidence = 'draft'
    `,
    [input.officialArticleId, input.draftArticleId],
  );
}

async function verifyEu(pool: Pool) {
  const officialSource = await loadEuOfficialSource();
  const extracted = NIS2_EU_ARTICLES.map((definition) => {
    const article = extractEuArticle(officialSource, definition.articleId);

    return {
      articleKey: article.articleKey,
      citation: definition.citation,
      officialText: article.officialText,
      title: article.title,
    };
  });
  const existingByKey = await queryExistingArticles(
    pool,
    NIS2_EU_SOURCE.filename,
    extracted.map((article) => article.articleKey),
  );

  compareArticles({
    existingByKey,
    extracted,
    sourceLabel: NIS2_EU_SOURCE.citation,
  });

  if (SHOULD_PROMOTE) {
    await promoteEuArticles(pool, extracted);
  }

  console.log(
    `Verified ${extracted.length} NIS2 EU article rows against the official EUR-Lex CELEX source.`,
  );
}

async function verifyCzech(pool: Pool) {
  const frameworkResult = await pool.query<{ id: string }>(
    "SELECT id FROM frameworks WHERE slug = 'nis2' LIMIT 1",
  );
  const frameworkId = frameworkResult.rows[0]?.id;

  if (!frameworkId) {
    throw new Error("Missing NIS2 framework. Run npm run db:seed first.");
  }

  for (const source of czechSources()) {
    const pdfPath = await downloadOfficialCzechPdf(source);
    const text = stripCzechPdfPageArtifacts(pdftotext(pdfPath));
    const extracted = source.sections.map((section) => {
      const article = extractCzechSection(text, section.sectionNumber);

      return {
        articleKey: section.articleKey,
        citation: section.citation,
        officialText: repairCzechPdfHyphenation(article.officialText),
        title: article.title,
      };
    });
    const existingByKey = await queryExistingArticles(
      pool,
      source.draftFilename,
      extracted.map((article) => article.articleKey),
    );

    compareArticles({
      existingByKey,
      extracted,
      sourceLabel: source.citation,
    });

    if (SHOULD_PROMOTE) {
      const officialSourceDocumentId = await upsertOfficialSourceDocument(pool, {
        citation: source.citation,
        effectiveDate: source.effectiveDate,
        filename: source.officialFilename,
        jurisdiction: "CZ",
        locale: "cs-CZ",
        title: source.title,
        url: source.url,
      });

      for (const article of extracted) {
        const officialArticleId = await upsertOfficialArticle(pool, {
          article,
          effectiveDate: source.effectiveDate,
          frameworkId,
          jurisdiction: "CZ",
          locale: "cs-CZ",
          sourceDocumentId: officialSourceDocumentId,
        });
        const draftArticleId = existingByKey.get(article.articleKey)?.id;

        if (draftArticleId) {
          await copyDraftMappingsToOfficialArticles(pool, {
            draftArticleId,
            officialArticleId,
          });
        }
      }
    }

    console.log(
      `Verified ${extracted.length} Czech rows against official e-Sbírka ${source.stableUrl}.`,
    );
  }
}

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    await verifyEu(pool);
    await verifyCzech(pool);
  } finally {
    await pool.end();
  }

  console.log(
    SHOULD_PROMOTE
      ? "Official source verification passed and reviewed article rows were promoted."
      : "Official source verification passed. Re-run with --promote-reviewed to write reviewed rows.",
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
