import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");

function assertIncludes(source: string, needle: string, message: string) {
  assert.ok(source.includes(needle), message);
}

function assertNotIncludes(source: string, needle: string, message: string) {
  assert.ok(!source.includes(needle), message);
}

function assertRegex(source: string, pattern: RegExp, message: string) {
  assert.ok(pattern.test(source), message);
}

function assertEvidenceExpiryPersistenceGate() {
  const schema = read("lib/db/schema.ts");
  const evidenceTable = schema.slice(
    schema.indexOf("export const evidence = pgTable"),
    schema.indexOf("export const generatedArtifacts"),
  );
  assertNotIncludes(
    evidenceTable,
    "expiresAt",
    "This T4-D gate assumes Lane 02 has not added evidence.expiresAt persistence; update the gate and implement listExpiringEvidenceAlerts when persistence exists.",
  );

  const expiryAlerts = read("lib/evidence/expiry-alerts.ts");
  assertIncludes(
    expiryAlerts,
    "SPLNIT_ENABLE_EVIDENCE_EXPIRY_ALERTS",
    "Evidence expiry alerts must be explicitly disabled/gated until evidence expiry persistence exists.",
  );
  assertIncludes(
    expiryAlerts,
    "Evidence expiry persistence is not implemented.",
    "Evidence expiry disabled path must document the persistence blocker.",
  );
}

function assertMicrosoftRefreshWired() {
  const client = read("lib/integrations/microsoft365/client.ts");
  assertIncludes(
    client,
    "refreshMicrosoftToken",
    "Microsoft Graph client must call the OAuth refresh helper.",
  );
  assertIncludes(
    client,
    "updateMicrosoftIntegrationTokens",
    "Microsoft Graph client must persist refreshed OAuth tokens before checks use Graph.",
  );
  assertIncludes(
    client,
    "refreshSkewMs",
    "Microsoft Graph client must refresh before exact expiry, not only after failures.",
  );
  assertRegex(
    client,
    /export async function getGraphClient/,
    "Graph client construction must be async so refresh persistence can complete before Graph checks.",
  );

  const microsoftTests = read("lib/integrations/microsoft365/tests.ts");
  assertRegex(
    microsoftTests,
    /const client = await getGraphClient\(integration\)/,
    "Microsoft integration runner path must await refreshed Graph client.",
  );

  const accessReviewProviders = read("lib/access-reviews/providers.ts");
  assertRegex(
    accessReviewProviders,
    /const client = await getGraphClient\(integration\)/,
    "Access-review Microsoft Graph path must await refreshed Graph client.",
  );
}

function assertApiKeyFirstRunWired() {
  const firstRun = read("lib/integrations/first-run-enqueue.ts");
  assertIncludes(
    firstRun,
    "api_key_connect_first_run",
    "First-run enqueue event type must support API-key connector connect triggers.",
  );
  assertIncludes(
    firstRun,
    "credential_rotation_first_run",
    "First-run enqueue event type must support API-key connector rotation triggers.",
  );

  const actions = read("lib/connectors/api-key-base/actions.ts");
  assertIncludes(
    actions,
    "enqueueIntegrationFirstRun",
    "API-key connect/rotate path must enqueue a first-run after successful health check and credential save.",
  );
  assertIncludes(
    actions,
    "integration.first_run_queued",
    "API-key connect/rotate path must audit successful first-run enqueue.",
  );
  assertIncludes(
    actions,
    "integration.first_run_skipped",
    "API-key connect/rotate path must audit deduped/skipped first-run enqueue.",
  );
  assertRegex(
    actions,
    /trigger:\s*input\.action === "connect"\s*\? "api_key_connect_first_run"\s*:\s*"credential_rotation_first_run"/,
    "API-key connect/rotate path must send the correct first-run trigger for connect vs rotate.",
  );
}

function assertOVHcloudServiceNameRequired() {
  const actions = read("lib/connectors/api-key-base/actions.ts");
  assertRegex(
    actions,
    /serviceName:\s*z\.string\(\)[\s\S]*\.trim\(\)[\s\S]*\.min\(1\)/,
    "OVHcloud serviceName must be required at connect time because adapter checks require it.",
  );

  const types = read("lib/connectors/api-key-base/types.ts");
  assertRegex(
    types,
    /export type OVHcloudCredentialInput = \{[\s\S]*serviceName: string;[\s\S]*\};/,
    "OVHcloud credential type must require serviceName.",
  );
}

function assertVercelCronSchedulerOfRecord() {
  const vercel = read("vercel.json");
  for (const route of [
    "/api/cron/regulation-sync",
    "/api/cron/evidence-expiry",
    "/api/cron/policy-review-reminders",
    "/api/cron/access-review-reminders",
  ]) {
    assertIncludes(vercel, route, `${route} must remain scheduled by Vercel Cron as scheduler of record.`);
  }

  for (const inngestFile of [
    "inngest/regulation-updates.ts",
    "inngest/evidence-expiry-alerts.ts",
    "inngest/policy-review-reminders.ts",
    "inngest/access-review-reminders.ts",
  ]) {
    const source = read(inngestFile);
    assertNotIncludes(
      source,
      "triggers: { cron:",
      `${inngestFile} must not define a cron trigger for jobs owned by Vercel Cron.`,
    );
    assertIncludes(
      source,
      "triggers: { event:",
      `${inngestFile} should remain event-triggerable for manual/emergency enqueue without duplicate scheduling.`,
    );
  }
}

assertMicrosoftRefreshWired();
assertApiKeyFirstRunWired();
assertOVHcloudServiceNameRequired();
assertVercelCronSchedulerOfRecord();
assertEvidenceExpiryPersistenceGate();

console.log("T4-D integration/workspace correctness source smoke passed");
