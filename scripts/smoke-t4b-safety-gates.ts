import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  assertLocalDatabaseUrl,
  databaseUrlSafety,
  normalizeDatabaseUrlForPg,
} from "../lib/db/url-policy";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as {
  scripts: Record<string, string>;
};

function read(relativePath: string) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function assertNoBareWoodpeckerMigration() {
  const woodpecker = read(".woodpecker/vercel.yml");
  assert.ok(
    woodpecker.includes("npm run db:migrate:production"),
    "Woodpecker production deploy must use npm run db:migrate:production.",
  );
  assert.ok(
    !/^\s*-\s*npm run db:migrate\s*$/m.test(woodpecker),
    "Woodpecker production deploy must not run bare npm run db:migrate.",
  );
}

function assertManifestExistsAndCoversSmokeScripts() {
  const manifestPath = path.join(root, "scripts/smoke-manifest.json");
  assert.ok(existsSync(manifestPath), "scripts/smoke-manifest.json is required.");

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    version?: number;
    scripts?: Record<string, { safetyClass?: string; status?: string; rationale?: string }>;
  };

  assert.equal(manifest.version, 1, "smoke manifest must declare version 1.");
  assert.ok(manifest.scripts, "smoke manifest must contain scripts map.");

  const smokeScriptNames = Object.keys(packageJson.scripts).filter((name) => name.startsWith("smoke:"));
  const missing = smokeScriptNames.filter((name) => !manifest.scripts?.[name]);
  assert.deepEqual(missing, [], `smoke manifest missing scripts: ${missing.join(", ")}`);

  const reviewed = manifest.scripts["smoke:reviewed-article-links"];
  assert.equal(
    reviewed?.status,
    "weak_green",
    "smoke:reviewed-article-links must be labeled weak_green until it proves reviewed rows exist.",
  );
  assert.equal(
    reviewed?.safetyClass,
    "db_local_only",
    "smoke:reviewed-article-links must be db_local_only.",
  );

  for (const [name, entry] of Object.entries(manifest.scripts)) {
    assert.ok(entry.safetyClass, `${name} missing safetyClass.`);
    assert.ok(entry.status, `${name} missing status.`);
    assert.ok(entry.rationale, `${name} missing rationale.`);
  }
}

function assertReviewedArticleSmokeIsNotVacuous() {
  const reviewedSmoke = read("scripts/smoke-reviewed-article-links.ts");
  assert.match(
    reviewedSmoke,
    /reviewedArticleCount|reviewed_article_count|reviewedRows/i,
    "reviewed article smoke must count reviewed article rows before checking links.",
  );
  assert.match(
    reviewedSmoke,
    /reviewed[^\n]+>\s*0|reviewed[^\n]+greater than 0|at least one reviewed/i,
    "reviewed article smoke must fail when zero reviewed article rows exist.",
  );
}

function assertDbUrlPolicyExists() {
  const policyPath = path.join(root, "lib/db/url-policy.ts");
  assert.ok(existsSync(policyPath), "lib/db/url-policy.ts is required for DB URL safety/SSL normalization.");
  const policy = read("lib/db/url-policy.ts");
  assert.match(policy, /normalizeDatabaseUrlForPg/, "DB URL policy must export normalizeDatabaseUrlForPg.");
  assert.match(policy, /assertLocalDatabaseUrl/, "DB URL policy must export assertLocalDatabaseUrl.");
  assert.match(policy, /sslmode=verify-full|set\("sslmode",\s*"verify-full"\)/, "DB URL policy must normalize non-local pg URLs to sslmode=verify-full where appropriate.");

  const reviewedSmoke = read("scripts/smoke-reviewed-article-links.ts");
  assert.match(
    reviewedSmoke,
    /normalizeDatabaseUrlForPg/,
    "DB-backed reviewed article smoke must use normalizeDatabaseUrlForPg to avoid pg SSL warning drift.",
  );
  const localGuardIndex = reviewedSmoke.indexOf("assertLocalDatabaseUrl(");
  const poolIndex = reviewedSmoke.indexOf("new Pool");
  assert.ok(
    localGuardIndex >= 0,
    "db_local_only reviewed article smoke must call assertLocalDatabaseUrl.",
  );
  assert.ok(
    poolIndex >= 0 && localGuardIndex < poolIndex,
    "db_local_only reviewed article smoke must call assertLocalDatabaseUrl before creating a Pool.",
  );
}

function assertDbUrlPolicyBehavior() {
  const noSsl = normalizeDatabaseUrlForPg("postgresql://user:pass@example.neon.tech/db");
  assert.match(noSsl, /sslmode=verify-full/, "non-local pg URL without sslmode must normalize to verify-full.");

  const disabled = normalizeDatabaseUrlForPg(
    "postgresql://user:pass@example.neon.tech/db?sslmode=disable",
  );
  assert.match(disabled, /sslmode=verify-full/, "non-local pg URL must not preserve sslmode=disable.");

  const local = normalizeDatabaseUrlForPg("postgresql://user:pass@localhost:5432/db");
  assert.equal(local, "postgresql://user:pass@localhost:5432/db", "local DB URL must not be rewritten.");

  assert.equal(databaseUrlSafety("postgresql://user:pass@[::1]:5432/db"), "local");
  assert.throws(
    () => assertLocalDatabaseUrl("postgresql://user:pass@example.neon.tech/db", "source gate self-test"),
    /requires a local\/disposable DATABASE_URL/,
  );
}

function main() {
  assert.ok(
    packageJson.scripts["smoke:t4b-safety-gates"],
    "package.json must expose smoke:t4b-safety-gates.",
  );
  assertNoBareWoodpeckerMigration();
  assertManifestExistsAndCoversSmokeScripts();
  assertReviewedArticleSmokeIsNotVacuous();
  assertDbUrlPolicyExists();
  assertDbUrlPolicyBehavior();
  console.log("T4-B safety gate source smoke passed.");
}

main();
