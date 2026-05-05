import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL?.trim();

assert.ok(databaseUrl, "DATABASE_URL is required for NIS2 evidence template smoke test.");

type MissingEvidenceRequirementRow = {
  article_ref: string;
  control_key: string;
};

type MissingEvidenceTemplateRow = {
  article_ref: string;
  control_key: string;
  framework_control_id: string;
};

type CountRow = {
  count: number;
};

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const nis2Mappings = await pool.query<CountRow>(`
      SELECT COUNT(*)::int AS count
      FROM framework_controls fc
      JOIN frameworks f ON f.id = fc.framework_id
      WHERE f.slug = 'nis2'
    `);

    assert.ok(
      (nis2Mappings.rows[0]?.count ?? 0) > 0,
      "NIS2 framework-control mappings should be seeded before checking evidence templates.",
    );

    const missingEvidenceRequirements = await pool.query<MissingEvidenceRequirementRow>(`
      SELECT
        c.key AS control_key,
        fc.article_ref
      FROM framework_controls fc
      JOIN frameworks f ON f.id = fc.framework_id
      JOIN controls c ON c.id = fc.control_id
      WHERE f.slug = 'nis2'
        AND NULLIF(BTRIM(fc.evidence_requirements), '') IS NULL
      ORDER BY c.key, fc.article_ref
    `);

    assert.deepEqual(
      missingEvidenceRequirements.rows,
      [],
      `NIS2 framework-control mappings missing evidence requirements: ${JSON.stringify(
        missingEvidenceRequirements.rows,
        null,
        2,
      )}`,
    );

    const missingEvidenceTemplates = await pool.query<MissingEvidenceTemplateRow>(`
      SELECT
        c.key AS control_key,
        fc.article_ref,
        fc.id AS framework_control_id
      FROM framework_controls fc
      JOIN frameworks f ON f.id = fc.framework_id
      JOIN controls c ON c.id = fc.control_id
      WHERE f.slug = 'nis2'
        AND NOT EXISTS (
          SELECT 1
          FROM evidence_templates et
          WHERE et.framework_control_id = fc.id
            AND et.control_id = c.id
            AND et.locale = 'en-EU'
            AND et.is_active = TRUE
        )
      ORDER BY c.key, fc.article_ref
    `);

    assert.deepEqual(
      missingEvidenceTemplates.rows,
      [],
      `NIS2 framework-control mappings missing evidence templates: ${JSON.stringify(
        missingEvidenceTemplates.rows,
        null,
        2,
      )}`,
    );
  } finally {
    await pool.end();
  }
}

main()
  .then(() => {
    console.log("NIS2 evidence template smoke test passed.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
