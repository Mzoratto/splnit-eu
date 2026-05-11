import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts?: Record<string, string>;
};
const scriptPath = "scripts/smoke-production-tenant-readiness.ts";
const prereqScriptPath = "scripts/smoke-production-tenant-readiness-prereqs.ts";
const source = readFileSync(scriptPath, "utf8");
const prereqSource = readFileSync(prereqScriptPath, "utf8");

assert.equal(
  packageJson.scripts?.["smoke:production-tenant-readiness"],
  `tsx ${scriptPath}`,
  "package.json must expose the production tenant readiness smoke command.",
);
assert.equal(
  packageJson.scripts?.["smoke:production-tenant-readiness-prereqs"],
  `tsx ${prereqScriptPath}`,
  "package.json must expose the production tenant readiness prerequisite check.",
);

for (const requiredEnv of [
  "AUTH_PRIMARY_FLOW_BASE_URL",
  "DATABASE_URL",
  "BLOB_READ_WRITE_TOKEN",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "SMOKE_USER_EMAIL",
  "SMOKE_USER_PASSWORD",
]) {
  assert.match(source, new RegExp(requiredEnv), `script must check ${requiredEnv}.`);
}

assert.doesNotMatch(
  source,
  /users\.createUser\(/,
  "production tenant smoke must use a pre-existing verified smoke user, not create an unverified throwaway user.",
);
assert.doesNotMatch(source, /deleteUser\(/, "production tenant smoke must not delete the dedicated smoke user.");
assert.match(source, /users\.getUserList/, "production tenant smoke must resolve the dedicated smoke user from Clerk.");

for (const route of [
  "/dashboard",
  "/evidence",
  "/integrations",
  "/integrations/microsoft365",
  "/integrations/github",
  "/integrations/aws",
  "/trust-center",
  "/vendors",
  "/questionnaires",
]) {
  assert.match(source, new RegExp(JSON.stringify(route)), `script must smoke ${route}.`);
}

for (const optionalEmailEnv of ["RESEND_API_KEY", "RESEND_FROM", "SMOKE_RECIPIENT_EMAIL"]) {
  assert.match(source, new RegExp(optionalEmailEnv), `script must gate mailbox smoke on ${optionalEmailEnv}.`);
}

assert.match(source, /cleanupDatabase/, "script must clean up smoke database rows.");
assert.match(source, /loadLocalEnvForMissingValues/, "script must load .env.local for missing shell env values.");
assert.match(source, /deleteOrganization/, "script must delete the smoke Clerk organization.");
assert.match(source, /browserConsoleErrors/, "script must report browser console errors.");
assert.match(source, /JSON\.stringify/, "script must emit machine-readable redacted JSON.");
assert.match(source, /databaseHostClass/, "script must classify database host without printing the hostname.");
assert.doesNotMatch(source, /databaseHost: parsedDatabaseUrl\.hostname/, "script must not print the database hostname.");
assert.match(prereqSource, /databaseHostClass/, "prereq check must classify database host without printing the hostname.");
assert.doesNotMatch(prereqSource, /databaseHost: parsed\.hostname/, "prereq check must not print the database hostname.");
assert.match(prereqSource, /readyForTenantSmoke/, "prereq check must report tenant smoke readiness.");
assert.match(prereqSource, /readyForMailboxSendAttempt/, "prereq check must report mailbox send readiness.");
assert.match(prereqSource, /loadLocalEnvForMissingValues/, "prereq check must load .env.local for missing shell env values.");
assert.match(prereqSource, /missingRequired/, "prereq check must report missing required env names only.");
assert.match(prereqSource, /process\.exitCode = 1/, "prereq check must fail when tenant smoke prerequisites are missing.");

console.log("production tenant readiness smoke source guard passed");
