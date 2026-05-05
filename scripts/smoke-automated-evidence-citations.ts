import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL?.trim();

assert.ok(databaseUrl, "DATABASE_URL is required for automated evidence citation smoke test.");

type EvidenceRow = {
  id: string;
  snapshot_data: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function main() {
  const pool = new Pool({ connectionString: databaseUrl, max: 1 });

  try {
    const evidenceRows = await pool.query<EvidenceRow>(`
      SELECT id, snapshot_data
      FROM evidence
      WHERE type = 'automated_snapshot'
      ORDER BY collected_at DESC
    `);
    const invalidRows = evidenceRows.rows.filter((row) => {
      if (!isRecord(row.snapshot_data)) {
        return true;
      }

      if (
        row.snapshot_data.citationStatus !== "reviewed_citations_available" &&
        row.snapshot_data.citationStatus !== "no_reviewed_citations"
      ) {
        return true;
      }

      if (!Array.isArray(row.snapshot_data.reviewedCitations)) {
        return true;
      }

      return row.snapshot_data.reviewedCitations.some(
        (citation) =>
          !isRecord(citation) ||
          citation.reviewStatus !== "reviewed" ||
          citation.confidence !== "reviewed",
      );
    });

    assert.deepEqual(
      invalidRows,
      [],
      `Automated evidence snapshots must include only reviewed citations, reviewed mapping confidence, and an explicit citation status: ${JSON.stringify(
        invalidRows,
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
    console.log("Automated evidence citation smoke test passed.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
