import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Pool, type QueryResultRow } from "pg";
import { importAuthoritativeSourceDocuments } from "@/scripts/import-authoritative-source-documents";
import { importGdprEuItArticles } from "@/scripts/import-gdpr-eu-it-articles";
import { importItalianGdprCodicePrivacy } from "@/scripts/import-italian-gdpr-codice-privacy";
import { importItalianGdprGaranteGuidance } from "@/scripts/import-italian-gdpr-garante-guidance";
import { importItalianNis2Articles } from "@/scripts/import-italian-nis2-articles";

export const dynamic = "force-dynamic";
export const maxDuration = 300;
export const runtime = "nodejs";

const actions = [
  "authoritative-sources",
  "italian-nis2",
  "gdpr-eu-it",
  "italian-gdpr-garante",
  "italian-gdpr-codice",
  "counts",
] as const;

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

async function query<T extends QueryResultRow>(pool: Pool, text: string) {
  const result = await pool.query<T>(text);

  return result.rows;
}

async function getCounts() {
  return withPool(async (pool) => {
    const totals = await query<{
      articles: string;
      evidence_templates: string;
      framework_control_articles: string;
      framework_controls: string;
      source_documents: string;
      tests: string;
    }>(
      pool,
      `
        SELECT
          (SELECT count(*) FROM source_documents)::text AS source_documents,
          (SELECT count(*) FROM articles)::text AS articles,
          (SELECT count(*) FROM framework_controls)::text AS framework_controls,
          (SELECT count(*) FROM framework_control_articles)::text AS framework_control_articles,
          (SELECT count(*) FROM evidence_templates)::text AS evidence_templates,
          (SELECT count(*) FROM tests)::text AS tests
      `,
    );
    const articlesByScope = await query(pool, `
      SELECT f.slug AS framework, a.jurisdiction, a.locale, a.review_status, count(*)::int AS count
      FROM articles a
      JOIN frameworks f ON f.id = a.framework_id
      GROUP BY f.slug, a.jurisdiction, a.locale, a.review_status
      ORDER BY f.slug, a.jurisdiction, a.locale, a.review_status
    `);
    const linksByConfidence = await query(pool, `
      SELECT confidence, count(*)::int AS count
      FROM framework_control_articles
      GROUP BY confidence
      ORDER BY confidence
    `);

    return {
      articlesByScope,
      linksByConfidence,
      totals: totals[0] ?? null,
    };
  });
}

async function runAction(action: MaintenanceAction) {
  if (action === "authoritative-sources") {
    return importAuthoritativeSourceDocuments();
  }

  if (action === "italian-nis2") {
    return importItalianNis2Articles();
  }

  if (action === "gdpr-eu-it") {
    return importGdprEuItArticles();
  }

  if (action === "italian-gdpr-garante") {
    return importItalianGdprGaranteGuidance();
  }

  if (action === "italian-gdpr-codice") {
    return importItalianGdprCodicePrivacy();
  }

  return getCounts();
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

  const step = await runStep(action, () => runAction(action));

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
