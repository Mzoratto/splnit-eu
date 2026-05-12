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
  "SMOKE_LIVE_OPENAI_QUESTIONNAIRE",
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
assert.match(source, /assert\.deepEqual\(browserConsoleErrors, \[\]/, "script must fail on browser console errors.");
assert.match(source, /JSON\.stringify/, "script must emit machine-readable redacted JSON.");
assert.match(source, /seedQuestionnaireSupportContext/, "script must seed questionnaire support context without seeding the generated artifact.");
assert.match(source, /questionnaireGeneratedLive/, "script must report live questionnaire generation proof.");
assert.match(source, /questionnaire_ai/, "script must require a live questionnaire_ai generated artifact.");
assert.match(source, /fallback:no-supported-context/, "script must reject no-context fallback as live OpenAI proof.");
assert.match(source, /textarea\[name=\"questionnaire\"\]/, "script must trigger questionnaire generation through the production form.");
assert.match(source, /artifactId=\$\{questionnaire\.artifactId\}/, "script must open the authenticated questionnaire review URL for the generated artifact.");
assert.match(source, /button\[name=\"reviewStatus\"\]\[value=\"approved\"\]/, "script must exercise the questionnaire approval action.");
assert.match(source, /expectQuestionnaireReviewPersisted/, "script must verify reviewed questionnaire persistence by reading the saved artifact.");
assert.match(source, /questionnaireReviewPersisted/, "script must report questionnaire review persistence in redacted JSON.");
assert.match(source, /expectVendorAssessmentSubmitted/, "script must verify submitted vendor assessment persistence.");
assert.match(source, /vendorSubmitPersisted/, "script must report vendor submit persistence in redacted JSON.");
assert.match(source, /vendorStatusPropagated/, "script must report vendor status propagation in redacted JSON.");
assert.match(source, /submitted=1/, "script must assert the vendor assessment submitted redirect.");
assert.match(source, /select\[name=\"\$\{questionId\}\"\]/, "script must fill vendor assessment token selects.");
assert.match(source, /button\[type=\"submit\"\]/, "script must submit the vendor assessment token form.");
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
