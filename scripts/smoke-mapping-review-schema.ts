import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL?.trim();

assert.ok(databaseUrl, "DATABASE_URL is required for mapping review schema smoke test.");

type ExtensionRow = {
  extversion: string;
};

type TableRow = {
  table_name: string;
};

type ColumnRow = {
  column_name: string;
  data_type: string;
  udt_name: string;
};

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const extension = await pool.query<ExtensionRow>(
      "SELECT extversion FROM pg_extension WHERE extname = 'vector'",
    );

    assert.equal(extension.rows.length, 1, "pgvector extension must be installed.");

    const tables = await pool.query<TableRow>(
      `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN ('mapping_review_queue', 'mapping_promotion_audit')
        ORDER BY table_name
      `,
    );

    assert.deepEqual(
      tables.rows.map((row) => row.table_name),
      ["mapping_promotion_audit", "mapping_review_queue"],
      "Mapping review tables are missing.",
    );

    const columns = await pool.query<ColumnRow>(
      `
        SELECT column_name, data_type, udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'mapping_review_queue'
          AND column_name IN (
            'framework',
            'jurisdiction',
            'language',
            'control_embedding',
            'source_embedding'
          )
        ORDER BY column_name
      `,
    );

    const columnTypes = Object.fromEntries(
      columns.rows.map((row) => [row.column_name, row.udt_name]),
    );

    assert.equal(columnTypes.framework, "mapping_review_framework");
    assert.equal(columnTypes.jurisdiction, "mapping_review_jurisdiction");
    assert.equal(columnTypes.language, "mapping_review_language");
    assert.equal(columnTypes.control_embedding, "vector");
    assert.equal(columnTypes.source_embedding, "vector");
  } finally {
    await pool.end();
  }
}

main()
  .then(() => {
    console.log("Mapping review schema smoke test passed.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
