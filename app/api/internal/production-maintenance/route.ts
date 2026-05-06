import { timingSafeEqual } from "node:crypto";
import { access } from "node:fs/promises";
import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { NextRequest, NextResponse } from "next/server";
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { seedDatabase } from "@/scripts/seed";
import * as schema from "@/lib/db/schema";

export const dynamic = "force-dynamic";
export const maxDuration = 300;
export const runtime = "nodejs";

const actions = ["migrate", "seed", "citation-smokes"] as const;

type MaintenanceAction = (typeof actions)[number];

type StepResult = {
  detail?: unknown;
  durationMs: number;
  error?: string;
  finishedAt: string;
  name: string;
  ok: boolean;
  startedAt: string;
};

type EvidenceRow = {
  id: string;
  snapshot_data: unknown;
};

function getPresentedToken(request: NextRequest) {
  const authorization = request.headers.get("authorization")?.trim();

  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim();
  }

  return request.headers.get("x-migration-token")?.trim() ?? "";
}

function tokensMatch(presented: string, expected: string) {
  const presentedBuffer = Buffer.from(presented);
  const expectedBuffer = Buffer.from(expected);

  return (
    presentedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(presentedBuffer, expectedBuffer)
  );
}

function authenticate(request: NextRequest) {
  const expected = process.env.MIGRATION_TOKEN?.trim();

  if (!expected || expected.length < 32) {
    return {
      error: "MIGRATION_TOKEN is not configured strongly enough.",
      status: 503,
    };
  }

  if (!tokensMatch(getPresentedToken(request), expected)) {
    return { error: "Unauthorized.", status: 401 };
  }

  return null;
}

async function parseAction(request: NextRequest): Promise<MaintenanceAction | null> {
  const body = (await request.json().catch(() => null)) as
    | { action?: unknown }
    | null;
  const action = body?.action;

  return typeof action === "string" &&
    actions.includes(action as MaintenanceAction)
    ? (action as MaintenanceAction)
    : null;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const parsed = new URL(databaseUrl);

  if (
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "::1"
  ) {
    throw new Error(
      `Refusing to run production maintenance against local database host ${parsed.hostname}.`,
    );
  }

  return databaseUrl;
}

async function withPool<T>(callback: (pool: Pool) => Promise<T>) {
  const pool = new Pool({ connectionString: getDatabaseUrl(), max: 1 });

  try {
    return await callback(pool);
  } finally {
    await pool.end();
  }
}

async function runMigrations() {
  return withPool(async (pool) => {
    const migrationsFolder = path.join(process.cwd(), "lib/db/migrations");

    await access(path.join(migrationsFolder, "meta/_journal.json"));
    await migrate(drizzle(pool, { schema }), { migrationsFolder });

    const latestMigration = await pool.query<{
      created_at: string | null;
      hash: string;
      id: number;
    }>(`
      SELECT id, hash, created_at::text AS created_at
      FROM "drizzle"."__drizzle_migrations"
      ORDER BY created_at DESC
      LIMIT 1
    `);

    return {
      latestMigration: latestMigration.rows[0] ?? null,
      migrationsFolder,
    };
  });
}

async function runSeed() {
  return seedDatabase();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function queryReadOnly<T extends QueryResultRow>(
  client: PoolClient,
  query: string,
): Promise<T[]> {
  const result = await client.query<T>(query);

  return result.rows;
}

async function runCitationSmokes() {
  return withPool(async (pool) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query("SET TRANSACTION READ ONLY");

      const promotedDrafts = await queryReadOnly(client, `
        SELECT
          a.article_key,
          a.citation,
          a.review_status,
          a.title,
          sd.filename,
          sd.title AS source_title
        FROM articles a
        JOIN source_documents sd ON sd.id = a.source_document_id
        WHERE (
          lower(coalesce(sd.filename, '')) LIKE '%zakonyprolidi%'
          OR lower(coalesce(sd.filename, '')) LIKE '%draft%'
          OR lower(coalesce(sd.filename, '')) LIKE '%extraction%'
          OR lower(sd.title) LIKE '%draft%'
          OR lower(sd.title) LIKE '%extraction%'
          OR lower(sd.citation) LIKE '%draft%'
          OR lower(sd.citation) LIKE '%extraction%'
        )
          AND a.review_status <> 'draft'
        ORDER BY sd.filename, a.article_key
      `);

      if (promotedDrafts.length > 0) {
        throw new Error(
          `Draft/extraction source rows must stay draft: ${JSON.stringify(promotedDrafts)}`,
        );
      }

      const missingReviewedLinks = await queryReadOnly(client, `
        WITH nis2_framework_controls AS (
          SELECT
            fc.id AS framework_control_id,
            fc.article_ref,
            CASE
              WHEN fc.article_ref LIKE 'Article 21%' THEN 'Article 21'
              WHEN fc.article_ref = 'Article 23' THEN 'Article 23'
              ELSE NULL
            END AS article_key,
            fc.framework_id
          FROM framework_controls fc
          JOIN frameworks f ON f.id = fc.framework_id
          WHERE f.slug = 'nis2'
        )
        SELECT nfc.framework_control_id, nfc.article_ref, nfc.article_key
        FROM nis2_framework_controls nfc
        WHERE nfc.article_key IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM articles a
            WHERE a.framework_id = nfc.framework_id
              AND a.article_key = nfc.article_key
              AND a.review_status = 'reviewed'
          )
          AND NOT EXISTS (
            SELECT 1
            FROM framework_control_articles fca
            JOIN articles a ON a.id = fca.article_id
            WHERE fca.framework_control_id = nfc.framework_control_id
              AND a.article_key = nfc.article_key
              AND a.review_status = 'reviewed'
          )
        ORDER BY nfc.article_ref, nfc.framework_control_id
      `);

      if (missingReviewedLinks.length > 0) {
        throw new Error(
          `Reviewed article links are missing: ${JSON.stringify(missingReviewedLinks)}`,
        );
      }

      const evidenceRows = await queryReadOnly<EvidenceRow>(client, `
        SELECT id, snapshot_data
        FROM evidence
        WHERE type = 'automated_snapshot'
        ORDER BY collected_at DESC
      `);
      const invalidEvidenceRows = evidenceRows.filter((row) => {
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

      if (invalidEvidenceRows.length > 0) {
        throw new Error(
          `Automated evidence snapshots have invalid citations: ${JSON.stringify(
            invalidEvidenceRows,
          )}`,
        );
      }

      await client.query("COMMIT");

      return {
        automatedEvidenceRows: evidenceRows.length,
        invalidEvidenceRows: invalidEvidenceRows.length,
        missingReviewedLinks: missingReviewedLinks.length,
        promotedDrafts: promotedDrafts.length,
      };
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  });
}

async function runStep(
  name: MaintenanceAction,
  callback: () => Promise<unknown>,
): Promise<StepResult> {
  const startedAt = new Date();

  try {
    const detail = await callback();
    const finishedAt = new Date();

    return {
      detail,
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      finishedAt: finishedAt.toISOString(),
      name,
      ok: true,
      startedAt: startedAt.toISOString(),
    };
  } catch (error) {
    const finishedAt = new Date();

    return {
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      error: error instanceof Error ? error.message : "Unknown error",
      finishedAt: finishedAt.toISOString(),
      name,
      ok: false,
      startedAt: startedAt.toISOString(),
    };
  }
}

export async function POST(request: NextRequest) {
  const authError = authenticate(request);

  if (authError) {
    return NextResponse.json(
      { error: authError.error, ok: false },
      { status: authError.status },
    );
  }

  const action = await parseAction(request);

  if (!action) {
    return NextResponse.json(
      {
        allowedActions: actions,
        error: "Request body must include a valid action.",
        ok: false,
      },
      { status: 422 },
    );
  }

  const step = await runStep(
    action,
    action === "migrate"
      ? runMigrations
      : action === "seed"
        ? runSeed
        : runCitationSmokes,
  );

  return NextResponse.json(
    {
      action,
      ok: step.ok,
      steps: [step],
      timestamp: new Date().toISOString(),
    },
    { status: step.ok ? 200 : 500 },
  );
}
