import { loadEnvConfig } from "@next/env";
import { Client } from "pg";
import { existsSync, readFileSync } from "node:fs";
import * as path from "node:path";
import { parse } from "dotenv";

loadEnvConfig(process.cwd());

const journalPath = path.join(process.cwd(), "lib/db/migrations/meta/_journal.json");
const migrationTableSchema = "drizzle";
const migrationTableName = "__drizzle_migrations";

function loadLocalEnvForMissingValues() {
  const envLocalPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envLocalPath)) {
    return;
  }

  const parsed = parse(readFileSync(envLocalPath));
  for (const [key, value] of Object.entries(parsed)) {
    if (!process.env[key]?.trim() && value.trim()) {
      process.env[key] = value;
    }
  }
}

type JournalEntry = {
  idx: number;
  tag: string;
};

type Journal = {
  entries: JournalEntry[];
};

function readExpectedMigrations() {
  if (!existsSync(journalPath)) {
    throw new Error(`Drizzle journal not found at ${journalPath}`);
  }

  const journal = JSON.parse(readFileSync(journalPath, "utf8")) as Journal;
  if (!Array.isArray(journal.entries)) {
    throw new Error("Drizzle journal has no entries array.");
  }

  return [...journal.entries]
    .sort((a, b) => a.idx - b.idx)
    .map((entry) => entry.tag);
}

function databaseUrl() {
  return (
    process.env.PRODUCTION_DATABASE_URL_UNPOOLED?.trim()
    || process.env.PRODUCTION_POSTGRES_URL_NON_POOLING?.trim()
    || process.env.DATABASE_URL_UNPOOLED?.trim()
    || process.env.POSTGRES_URL_NON_POOLING?.trim()
    || process.env.PRODUCTION_DATABASE_URL?.trim()
    || process.env.DATABASE_URL?.trim()
    || ""
  );
}

function classifyDatabaseHost(url: string) {
  try {
    const parsed = new URL(url);
    if (["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)) {
      return "local";
    }
    if (parsed.hostname.includes("neon.tech")) {
      return "neon";
    }
    return "non_local_other";
  } catch {
    return "invalid_url";
  }
}

async function productionMigrationCount(client: Client) {
  const table = await client.query<{ exists: boolean }>(`
    select exists (
      select 1 from information_schema.tables
      where table_schema = $1 and table_name = $2
    ) as exists
  `, [migrationTableSchema, migrationTableName]);

  if (!table.rows[0]?.exists) {
    return { migrationTableExists: false, count: 0, latestCreatedAt: null as string | null };
  }

  const count = await client.query<{ count: string; latest_created_at: string | null }>(`
    select count(*)::text as count, max(created_at)::text as latest_created_at
    from drizzle.__drizzle_migrations
  `);

  return {
    migrationTableExists: true,
    count: Number(count.rows[0]?.count ?? 0),
    latestCreatedAt: count.rows[0]?.latest_created_at ?? null,
  };
}

function formatMigrationList(tags: string[], startIndex = 0) {
  if (tags.length === 0) {
    return [];
  }

  return tags.map((tag, index) => `${startIndex + index}: ${tag}`);
}

async function main() {
  loadLocalEnvForMissingValues();

  const expectedMigrations = readExpectedMigrations();
  const url = databaseUrl();
  if (!url) {
    throw new Error(
      "Production database URL is required. Set PRODUCTION_DATABASE_URL_UNPOOLED, PRODUCTION_POSTGRES_URL_NON_POOLING, DATABASE_URL_UNPOOLED, POSTGRES_URL_NON_POOLING, PRODUCTION_DATABASE_URL, or DATABASE_URL.",
    );
  }

  const hostClass = classifyDatabaseHost(url);
  if (hostClass === "invalid_url") {
    throw new Error("Production database URL is not a valid URL.");
  }
  if (hostClass === "local" && !process.argv.includes("--allow-local")) {
    throw new Error("Refusing to run migration drift check against a local database URL.");
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query("begin transaction read only");
    const actual = await productionMigrationCount(client);
    await client.query("rollback");

    const appliedExpectedTags = expectedMigrations.slice(0, actual.count);
    const missingExpectedTags = expectedMigrations.slice(actual.count);
    const extraAppliedCount = Math.max(0, actual.count - expectedMigrations.length);
    const isBehind = actual.count < expectedMigrations.length;
    const isAhead = actual.count > expectedMigrations.length;
    const migrationTableMissing = !actual.migrationTableExists;
    const ok = !migrationTableMissing && !isBehind && !isAhead;

    console.log(JSON.stringify({
      databaseHostClass: hostClass,
      expectedMigrationCount: expectedMigrations.length,
      productionMigrationCount: actual.count,
      migrationTableExists: actual.migrationTableExists,
      latestProductionMigrationCreatedAt: actual.latestCreatedAt,
      latestExpectedMigration: expectedMigrations.at(-1) ?? null,
      latestProductionMigrationInferredFromJournal: appliedExpectedTags.at(-1) ?? null,
      missingExpectedMigrations: missingExpectedTags,
      extraAppliedMigrationCount: extraAppliedCount,
      ok,
    }, null, 2));

    if (migrationTableMissing) {
      console.error(`Production migration table ${migrationTableSchema}.${migrationTableName} is missing.`);
      process.exitCode = 1;
      return;
    }

    if (isBehind) {
      console.error("Production database is behind repo migrations:");
      for (const line of formatMigrationList(missingExpectedTags, actual.count)) {
        console.error(`- ${line}`);
      }
      process.exitCode = 1;
      return;
    }

    if (isAhead) {
      console.error("Production database has more applied migrations than this checkout knows about.");
      console.error("Check that CI is running against the current main branch and migration journal.");
      process.exitCode = 1;
    }
  } catch (error) {
    try {
      await client.query("rollback");
    } catch {
      // Ignore rollback failures after connection/query errors.
    }
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
