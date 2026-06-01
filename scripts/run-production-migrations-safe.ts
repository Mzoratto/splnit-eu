import { loadEnvConfig } from "@next/env";
import { Client } from "pg";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import * as path from "node:path";
import { parse } from "dotenv";

loadEnvConfig(process.cwd());

const confirmationValue = "I_UNDERSTAND_PRODUCTION_MIGRATIONS";
const migrationTableSchema = "drizzle";
const migrationTableName = "__drizzle_migrations";
const journalPath = path.join(process.cwd(), "lib/db/migrations/meta/_journal.json");
const migrationRelevantPaths = [
  "drizzle.config.ts",
  "lib/db/schema.ts",
  "lib/db/migrations",
  "package.json",
  "package-lock.json",
  "scripts/check-production-migration-drift.ts",
  "scripts/run-production-migrations-safe.ts",
];

type JournalEntry = {
  idx: number;
  tag: string;
};

type Journal = {
  entries: JournalEntry[];
};

type AppliedMigration = {
  id: number;
  hash: string;
  created_at: string | null;
};

function runGit(args: string[]) {
  const result = spawnSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    throw new Error(
      `git ${args.join(" ")} failed: ${(result.stderr || result.stdout).trim()}`,
    );
  }

  return result.stdout.trim();
}

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
    || process.env.PRODUCTION_DATABASE_URL?.trim()
    || ""
  );
}

function databaseTarget(url: string) {
  const parsed = new URL(url);
  return {
    protocol: parsed.protocol.replace(/:$/, ""),
    host: parsed.hostname,
    portPresent: Boolean(parsed.port),
    databasePresent: Boolean(parsed.pathname.replace(/^\//, "")),
    sslMode: parsed.searchParams.get("sslmode") ?? "unspecified",
  };
}

function isLocalDatabase(url: string) {
  try {
    const parsed = new URL(url);
    return ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function migrationFilePath(tag: string) {
  return path.join(process.cwd(), "lib/db/migrations", `${tag}.sql`);
}

function migrationFileHash(tag: string) {
  const filePath = migrationFilePath(tag);
  if (!existsSync(filePath)) {
    throw new Error(`Expected migration SQL is missing: lib/db/migrations/${tag}.sql`);
  }

  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

function assertCleanMigrationRelevantSource() {
  const status = runGit(["status", "--porcelain", "--", ...migrationRelevantPaths]);
  if (status) {
    throw new Error(
      [
        "Refusing production migration from dirty migration-relevant source.",
        "Commit or discard these paths first:",
        status,
      ].join("\n"),
    );
  }
}

function assertHeadIsLanded() {
  const requiredRef = process.env.PRODUCTION_MIGRATION_BASE_REF?.trim() || "origin/main";
  runGit(["rev-parse", "--verify", requiredRef]);

  const result = spawnSync("git", ["merge-base", "--is-ancestor", "HEAD", requiredRef], {
    cwd: process.cwd(),
    stdio: "ignore",
  });

  if (result.status !== 0) {
    const head = runGit(["rev-parse", "--short", "HEAD"]);
    throw new Error(
      `Refusing production migration from unlanded HEAD ${head}. HEAD must be an ancestor of ${requiredRef}.`,
    );
  }
}

async function readAppliedMigrations(client: Client) {
  const table = await client.query<{ exists: boolean }>(`
    select exists (
      select 1 from information_schema.tables
      where table_schema = $1 and table_name = $2
    ) as exists
  `, [migrationTableSchema, migrationTableName]);

  if (!table.rows[0]?.exists) {
    throw new Error(`Production migration table ${migrationTableSchema}.${migrationTableName} is missing.`);
  }

  const rows = await client.query<AppliedMigration>(`
    select id::int, hash, created_at::text
    from drizzle.__drizzle_migrations
    order by id asc
  `);

  return rows.rows;
}

function assertAppliedHashesMatchSource(expectedTags: string[], applied: AppliedMigration[]) {
  const mismatches: Array<{ tag: string; id: number; expectedHash: string; actualHash: string }> = [];

  for (let index = 0; index < Math.min(expectedTags.length, applied.length); index += 1) {
    const tag = expectedTags[index];
    const expectedHash = migrationFileHash(tag);
    const actualHash = applied[index]?.hash;

    if (actualHash !== expectedHash) {
      mismatches.push({
        tag,
        id: applied[index]?.id ?? index + 1,
        expectedHash,
        actualHash: actualHash ?? "missing",
      });
    }
  }

  if (mismatches.length > 0) {
    throw new Error(
      [
        "Refusing production migration because applied migration hashes do not match committed source.",
        JSON.stringify(mismatches, null, 2),
      ].join("\n"),
    );
  }
}

async function assertProductionBaselineIsReproducible(url: string) {
  const expectedTags = readExpectedMigrations();
  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query("begin transaction read only");
    const applied = await readAppliedMigrations(client);
    await client.query("rollback");

    assertAppliedHashesMatchSource(expectedTags, applied);

    if (applied.length > expectedTags.length) {
      throw new Error(
        `Refusing production migration: production has ${applied.length} applied migrations but committed source only has ${expectedTags.length}.`,
      );
    }

    return {
      appliedCount: applied.length,
      expectedCount: expectedTags.length,
      latestAppliedTag: expectedTags[applied.length - 1] ?? null,
      pendingTags: expectedTags.slice(applied.length),
    };
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

function runCommand(command: string, args: string[], env: NodeJS.ProcessEnv) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status ?? "unknown"}.`);
  }
}

function selfTest() {
  const local = isLocalDatabase("postgresql://user:pass@localhost:5432/db");
  const neon = isLocalDatabase("postgresql://user:pass@example.neon.tech/db?sslmode=require");
  const target = databaseTarget("postgresql://user:pass@example.neon.tech:5432/db?sslmode=require");

  if (!local) {
    throw new Error("Self-test failed: localhost should classify as local.");
  }
  if (neon) {
    throw new Error("Self-test failed: neon host should not classify as local.");
  }
  if (target.host !== "example.neon.tech" || !target.portPresent || target.sslMode !== "require") {
    throw new Error("Self-test failed: redacted target metadata parsing is wrong.");
  }

  console.log("Production migration guard self-test passed.");
}

async function main() {
  if (process.argv.includes("--self-test")) {
    selfTest();
    return;
  }

  loadLocalEnvForMissingValues();

  if (process.env.SPLNIT_CONFIRM_PRODUCTION_MIGRATION !== confirmationValue) {
    throw new Error(
      `Set SPLNIT_CONFIRM_PRODUCTION_MIGRATION=${confirmationValue} to run production migrations.`,
    );
  }

  const url = databaseUrl();
  if (!url) {
    throw new Error(
      "Production database URL is required. Set PRODUCTION_DATABASE_URL_UNPOOLED, PRODUCTION_POSTGRES_URL_NON_POOLING, or PRODUCTION_DATABASE_URL.",
    );
  }

  if (isLocalDatabase(url)) {
    throw new Error("Refusing to run production migration wrapper against a local database URL.");
  }

  assertCleanMigrationRelevantSource();
  assertHeadIsLanded();

  const before = await assertProductionBaselineIsReproducible(url);
  console.log(JSON.stringify({
    phase: "before-production-migration",
    target: databaseTarget(url),
    expectedMigrationCount: before.expectedCount,
    productionMigrationCount: before.appliedCount,
    latestProductionMigrationInferredFromJournal: before.latestAppliedTag,
    pendingMigrationCount: before.pendingTags.length,
    pendingMigrations: before.pendingTags,
  }, null, 2));

  runCommand("npx", ["drizzle-kit", "migrate"], {
    ...process.env,
    DATABASE_URL: url,
  });

  runCommand("npm", ["run", "check:production-migration-drift"], {
    ...process.env,
    PRODUCTION_DATABASE_URL_UNPOOLED: url,
  });

  const after = await assertProductionBaselineIsReproducible(url);
  console.log(JSON.stringify({
    phase: "after-production-migration",
    target: databaseTarget(url),
    expectedMigrationCount: after.expectedCount,
    productionMigrationCount: after.appliedCount,
    pendingMigrationCount: after.pendingTags.length,
    ok: after.pendingTags.length === 0,
  }, null, 2));

  if (after.pendingTags.length > 0) {
    throw new Error("Production migrations completed but production is still behind committed source.");
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
