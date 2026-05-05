import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL?.trim();
const smokeMode = process.argv.includes("--smoke");

assert.ok(databaseUrl, "DATABASE_URL is required for knowledge layer reporting.");

const countQueries = [
  ["frameworks", "SELECT COUNT(*)::int AS count FROM frameworks"],
  ["controls", "SELECT COUNT(*)::int AS count FROM controls"],
  ["frameworkControlMappings", "SELECT COUNT(*)::int AS count FROM framework_controls"],
  ["articles", "SELECT COUNT(*)::int AS count FROM articles"],
  [
    "frameworkControlArticleMappings",
    "SELECT COUNT(*)::int AS count FROM framework_control_articles",
  ],
  ["sourceDocuments", "SELECT COUNT(*)::int AS count FROM source_documents"],
  ["evidenceTemplates", "SELECT COUNT(*)::int AS count FROM evidence_templates"],
  ["integrationTests", "SELECT COUNT(*)::int AS count FROM tests"],
] as const;

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const counts: Record<string, number> = {};

    for (const [name, query] of countQueries) {
      const result = await pool.query<{ count: number }>(query);
      counts[name] = result.rows[0]?.count ?? 0;
    }

    if (smokeMode) {
      assert.ok(counts.frameworks > 0, "frameworks should be seeded.");
      assert.ok(counts.controls > 0, "controls should be seeded.");
      assert.ok(
        counts.frameworkControlMappings > 0,
        "framework_controls should be seeded.",
      );
      assert.ok(counts.sourceDocuments > 0, "source_documents should be seeded.");
      assert.ok(counts.integrationTests > 0, "tests should be seeded.");
    }

    console.log(JSON.stringify(counts, null, 2));
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
