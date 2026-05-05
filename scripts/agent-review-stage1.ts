import { readFile } from "node:fs/promises";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import { parseMappingReviewMarkdown } from "../lib/agents/mapping-review/markdown";
import {
  cosineSimilarity,
  createEmbeddings,
  formatPgVector,
} from "../lib/agents/mapping-review/openai-embeddings";

loadEnvConfig(process.cwd());

const VALID_FRAMEWORKS = ["nis2", "eu_ai_act", "gdpr", "iso27001"] as const;
const VALID_JURISDICTIONS = ["it", "cz", "eu", "de", "fr", "es", "other"] as const;
const VALID_LANGUAGES = ["it", "cs", "en", "de", "fr", "es"] as const;

type MappingReviewFramework = (typeof VALID_FRAMEWORKS)[number];
type MappingReviewJurisdiction = (typeof VALID_JURISDICTIONS)[number];
type MappingReviewLanguage = (typeof VALID_LANGUAGES)[number];

type HydratedMappingRow = {
  article_citation: string;
  article_locale: string;
  article_text: string;
  control_description: string | null;
  control_key: string;
  control_title: string;
  framework_slug: string;
  mapping_id: string;
  regulator: string | null;
};

type QueueRow = {
  citation: string;
  controlDescription: string | null;
  controlId: string;
  controlTitle: string;
  framework: MappingReviewFramework;
  jurisdiction: MappingReviewJurisdiction;
  language: MappingReviewLanguage;
  mappingId: string;
  regulator: string | null;
  sourceText: string;
};

type QueueEmbeddingRow = {
  control_description: string | null;
  control_id: string;
  control_title: string;
  id: string;
  source_text: string;
};

function getArg(name: string) {
  const inlineValue = process.argv.find((arg) => arg.startsWith(`${name}=`));

  if (inlineValue) {
    return inlineValue.slice(name.length + 1) || null;
  }

  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function requireEnum<T extends readonly string[]>(
  value: string | null,
  validValues: T,
  name: string,
): T[number] {
  if (value && validValues.includes(value)) {
    return value as T[number];
  }

  throw new Error(
    `${name} must be one of ${validValues.join(", ")}. Received: ${value ?? "(missing)"}`,
  );
}

function getDefaultInputPath(
  framework: MappingReviewFramework,
  jurisdiction: MappingReviewJurisdiction,
) {
  if (framework === "iso27001") {
    return "docs/legal-reviews/iso27001-mapping-review.md";
  }

  return `docs/legal-reviews/${framework.replaceAll("_", "-")}-${jurisdiction}-mapping-review.md`;
}

function getFrameworkSlug(framework: MappingReviewFramework) {
  return framework === "eu_ai_act" ? "ai-act" : framework;
}

function getJurisdictionRegulator(
  framework: MappingReviewFramework,
  jurisdiction: MappingReviewJurisdiction,
  fallback: string | null,
) {
  if (framework === "nis2") {
    if (jurisdiction === "it") return "ACN - Agenzia per la Cybersicurezza Nazionale";
    if (jurisdiction === "cz") return "NÚKIB";
  }

  if (framework === "gdpr") {
    if (jurisdiction === "it") return "Garante per la protezione dei dati personali";
    if (jurisdiction === "cz") return "ÚOOÚ";
  }

  if (framework === "eu_ai_act") {
    if (jurisdiction === "it") return "AGCOM/MIMIT (da confermare)";
    if (jurisdiction === "cz") return "ČTÚ (k potvrzení)";
  }

  return fallback;
}

function inferLanguage(jurisdiction: MappingReviewJurisdiction): MappingReviewLanguage {
  if (jurisdiction === "it") return "it";
  if (jurisdiction === "cz") return "cs";
  if (jurisdiction === "de") return "de";
  if (jurisdiction === "fr") return "fr";
  if (jurisdiction === "es") return "es";
  return "en";
}

async function hydrateMappingRows(pool: Pool, mappingIds: string[]) {
  const result = await pool.query<HydratedMappingRow>(
    `
      SELECT
        fca.id::text AS mapping_id,
        f.slug AS framework_slug,
        f.regulator,
        c.key AS control_key,
        c.title_en AS control_title,
        c.description_cs AS control_description,
        a.official_text AS article_text,
        a.citation AS article_citation,
        a.locale AS article_locale
      FROM framework_control_articles fca
      JOIN articles a ON a.id = fca.article_id
      JOIN framework_controls fc ON fc.id = fca.framework_control_id
      JOIN frameworks f ON f.id = fc.framework_id
      JOIN controls c ON c.id = fc.control_id
      WHERE fca.id = ANY($1::uuid[])
    `,
    [mappingIds],
  );

  return result.rows;
}

async function listExistingQueueMappingIds(
  pool: Pool,
  input: {
    framework: MappingReviewFramework;
    jurisdiction: MappingReviewJurisdiction;
    language: MappingReviewLanguage;
    mappingIds: string[];
  },
) {
  const result = await pool.query<{ mapping_id: string }>(
    `
      SELECT mapping_id::text
      FROM mapping_review_queue
      WHERE framework = $1
        AND jurisdiction = $2
        AND language = $3
        AND mapping_id = ANY($4::uuid[])
    `,
    [input.framework, input.jurisdiction, input.language, input.mappingIds],
  );

  return new Set(result.rows.map((row) => row.mapping_id));
}

async function deleteExistingQueueRows(
  pool: Pool,
  input: {
    framework: MappingReviewFramework;
    jurisdiction: MappingReviewJurisdiction;
    language: MappingReviewLanguage;
    mappingIds: string[];
  },
) {
  const result = await pool.query<{ id: string }>(
    `
      DELETE FROM mapping_review_queue
      WHERE framework = $1
        AND jurisdiction = $2
        AND language = $3
        AND mapping_id = ANY($4::uuid[])
      RETURNING id::text
    `,
    [input.framework, input.jurisdiction, input.language, input.mappingIds],
  );

  return result.rowCount ?? 0;
}

async function insertQueueRows(pool: Pool, rows: QueueRow[]) {
  if (rows.length === 0) {
    return 0;
  }

  const values: unknown[] = [];
  const placeholders = rows.map((row, index) => {
    const offset = index * 10;

    values.push(
      row.framework,
      row.jurisdiction,
      row.language,
      row.mappingId,
      row.controlId,
      row.controlTitle,
      row.controlDescription,
      row.sourceText,
      row.citation,
      row.regulator,
    );

    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10})`;
  });

  const result = await pool.query(
    `
      INSERT INTO mapping_review_queue (
        framework,
        jurisdiction,
        language,
        mapping_id,
        control_id,
        control_title,
        control_description,
        source_text,
        citation,
        regulator
      )
      VALUES ${placeholders.join(", ")}
    `,
    values,
  );

  return result.rowCount ?? 0;
}

async function listQueueRowsForEmbedding(
  pool: Pool,
  input: {
    framework: MappingReviewFramework;
    jurisdiction: MappingReviewJurisdiction;
    language: MappingReviewLanguage;
    mappingIds: string[];
  },
) {
  const result = await pool.query<QueueEmbeddingRow>(
    `
      SELECT
        id::text,
        control_id,
        control_title,
        control_description,
        source_text
      FROM mapping_review_queue
      WHERE framework = $1
        AND jurisdiction = $2
        AND language = $3
        AND mapping_id = ANY($4::uuid[])
      ORDER BY mapping_id
    `,
    [input.framework, input.jurisdiction, input.language, input.mappingIds],
  );

  return result.rows;
}

async function updateQueueEmbeddings(
  pool: Pool,
  rows: QueueEmbeddingRow[],
  controlVectors: number[][],
  sourceVectors: number[][],
) {
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const controlVector = controlVectors[index];
    const sourceVector = sourceVectors[index];

    if (!row || !controlVector || !sourceVector) {
      throw new Error(`Missing embedding payload for row index ${index}.`);
    }

    await pool.query(
      `
        UPDATE mapping_review_queue
        SET
          control_embedding = $2::vector,
          source_embedding = $3::vector,
          similarity_score = $4,
          updated_at = NOW()
        WHERE id = $1::uuid
      `,
      [
        row.id,
        formatPgVector(controlVector),
        formatPgVector(sourceVector),
        cosineSimilarity(controlVector, sourceVector),
      ],
    );
  }

  return rows.length;
}

async function embedQueueRows(
  pool: Pool,
  input: {
    framework: MappingReviewFramework;
    jurisdiction: MappingReviewJurisdiction;
    language: MappingReviewLanguage;
    mappingIds: string[];
    openaiApiKey: string;
  },
) {
  const rows = await listQueueRowsForEmbedding(pool, input);

  if (rows.length === 0) {
    return 0;
  }

  const controlInputs = rows.map((row) =>
    [
      `Control ID: ${row.control_id}`,
      `Title: ${row.control_title}`,
      row.control_description ? `Description: ${row.control_description}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  const sourceInputs = rows.map((row) => row.source_text);
  const controlVectors = await createEmbeddings({
    apiKey: input.openaiApiKey,
    inputs: controlInputs,
  });
  const sourceVectors = await createEmbeddings({
    apiKey: input.openaiApiKey,
    inputs: sourceInputs,
  });

  return updateQueueEmbeddings(pool, rows, controlVectors, sourceVectors);
}

function buildQueueRows(input: {
  framework: MappingReviewFramework;
  hydratedRows: HydratedMappingRow[];
  jurisdiction: MappingReviewJurisdiction;
  language: MappingReviewLanguage;
  mappingIds: string[];
}) {
  const expectedFrameworkSlug = getFrameworkSlug(input.framework);
  const rowById = new Map(input.hydratedRows.map((row) => [row.mapping_id, row]));
  const missingRows = input.mappingIds.filter((id) => !rowById.has(id));

  if (missingRows.length > 0) {
    throw new Error(`Mapping IDs not found in database: ${missingRows.join(", ")}`);
  }

  const wrongFrameworkRows = input.hydratedRows.filter(
    (row) => row.framework_slug !== expectedFrameworkSlug,
  );

  if (wrongFrameworkRows.length > 0) {
    throw new Error(
      `Review file contains mappings outside ${expectedFrameworkSlug}: ${JSON.stringify(
        wrongFrameworkRows.map((row) => ({
          framework: row.framework_slug,
          mappingId: row.mapping_id,
        })),
        null,
        2,
      )}`,
    );
  }

  return input.mappingIds.map((mappingId) => {
    const row = rowById.get(mappingId);

    if (!row) {
      throw new Error(`Mapping ID not found after validation: ${mappingId}`);
    }

    return {
      citation: row.article_citation,
      controlDescription: row.control_description,
      controlId: row.control_key,
      controlTitle: row.control_title,
      framework: input.framework,
      jurisdiction: input.jurisdiction,
      language: input.language,
      mappingId: row.mapping_id,
      regulator: getJurisdictionRegulator(
        input.framework,
        input.jurisdiction,
        row.regulator,
      ),
      sourceText: row.article_text,
    };
  });
}

async function main() {
  const framework = requireEnum(
    getArg("--framework"),
    VALID_FRAMEWORKS,
    "--framework",
  );
  const jurisdiction =
    framework === "iso27001"
      ? "eu"
      : requireEnum(getArg("--jurisdiction"), VALID_JURISDICTIONS, "--jurisdiction");
  const language = getArg("--language")
    ? requireEnum(getArg("--language"), VALID_LANGUAGES, "--language")
    : inferLanguage(jurisdiction);
  const inputPath = getArg("--input") ?? getDefaultInputPath(framework, jurisdiction);
  const shouldApply = process.argv.includes("--apply");
  const shouldEmbed = process.argv.includes("--embed");
  const shouldReplace = process.argv.includes("--replace");
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const openaiApiKey = process.env.OPENAI_API_KEY?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Stage 1 extraction.");
  }

  if (shouldApply && shouldEmbed && !openaiApiKey) {
    throw new Error("OPENAI_API_KEY is required when Stage 1 is run with --embed.");
  }

  const markdown = await readFile(inputPath, "utf8");
  const parsedRows = parseMappingReviewMarkdown(markdown);
  const mappingIds = Array.from(new Set(parsedRows.map((row) => row.mappingId)));

  if (mappingIds.length === 0) {
    throw new Error(`No mapping review rows found in ${inputPath}.`);
  }

  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const hydratedRows = await hydrateMappingRows(pool, mappingIds);
    const queueRows = buildQueueRows({
      framework,
      hydratedRows,
      jurisdiction,
      language,
      mappingIds,
    });
    const existingMappingIds = await listExistingQueueMappingIds(pool, {
      framework,
      jurisdiction,
      language,
      mappingIds,
    });
    const rowsToInsert = shouldReplace
      ? queueRows
      : queueRows.filter((row) => !existingMappingIds.has(row.mappingId));

    if (!shouldApply) {
      console.log(
        JSON.stringify(
          {
            apply: false,
            existingRows: existingMappingIds.size,
            embed: false,
            embedRequested: shouldEmbed,
            framework,
            inputPath,
            jurisdiction,
            language,
            parsedRows: parsedRows.length,
            rowsToInsert: rowsToInsert.length,
            wouldReplace: shouldReplace,
          },
          null,
          2,
        ),
      );
      return;
    }

    let deletedRows = 0;

    if (shouldReplace) {
      deletedRows = await deleteExistingQueueRows(pool, {
        framework,
        jurisdiction,
        language,
        mappingIds,
      });
    }

    const insertedRows = await insertQueueRows(pool, rowsToInsert);
    const embeddedRows =
      shouldEmbed && openaiApiKey
        ? await embedQueueRows(pool, {
            framework,
            jurisdiction,
            language,
            mappingIds,
            openaiApiKey,
          })
        : 0;

    console.log(
      JSON.stringify(
        {
          deletedRows,
          embeddedRows,
          framework,
          inputPath,
          insertedRows,
          jurisdiction,
          language,
          skippedExistingRows: shouldReplace ? 0 : existingMappingIds.size,
        },
        null,
        2,
      ),
    );
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
