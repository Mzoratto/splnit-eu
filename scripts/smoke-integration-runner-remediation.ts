import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { and, eq } from "drizzle-orm";
import { encryptSecret } from "@/lib/crypto";
import { getDb } from "@/lib/db";
import {
  controls,
  evidence,
  integrationRuns,
  integrations,
  orgControlStatuses,
  organisations,
  remediationTasks,
  tests,
} from "@/lib/db/schema";
import { runTestsForOrg } from "@/lib/integrations/runner";

loadEnvConfig(process.cwd());
assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required.");
process.env.ENCRYPTION_KEY ??= "smoke-evidence-runner-remediation-key";

const db = getDb();
const runId = `runner_remediation_${Date.now()}`;
const clerkOrgId = `${runId}_org`;
const controlKey = `${runId}_control`;
const awsControlKey = `${runId}_aws_control`;
const testName = `${runId} ABRA Flexi HTTPS transport`;
const awsTestName = `${runId} AWS S3 backup recency`;
const sourceKey = "connector:abra-flexi:abra_flexi_https_transport";
const awsSourceKey = "connector:aws:aws_s3_backup_recent";

async function cleanup() {
  await db.delete(remediationTasks).where(eq(remediationTasks.clerkOrgId, clerkOrgId));
  await db.delete(evidence).where(eq(evidence.clerkOrgId, clerkOrgId));
  await db.delete(integrationRuns).where(eq(integrationRuns.clerkOrgId, clerkOrgId));
  await db.delete(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
  await db.delete(integrations).where(eq(integrations.clerkOrgId, clerkOrgId));
  await db.delete(tests).where(eq(tests.name, testName));
  await db.delete(tests).where(eq(tests.name, awsTestName));
  await db.delete(controls).where(eq(controls.key, controlKey));
  await db.delete(controls).where(eq(controls.key, awsControlKey));
  await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
}

async function seed() {
  await db.insert(organisations).values({
    clerkOrgId,
    country: "CZ",
    locale: "cs-CZ",
    name: runId,
    primaryJurisdiction: "CZ",
  });

  const [control] = await db
    .insert(controls)
    .values({
      key: controlKey,
      titleCs: "Runner remediation smoke",
      titleEn: "Runner remediation smoke",
      testType: "integration",
    })
    .returning({ id: controls.id });
  assert.ok(control?.id, "control should be inserted.");

  const [awsControl] = await db
    .insert(controls)
    .values({
      key: awsControlKey,
      titleCs: "Runner remediation AWS smoke",
      titleEn: "Runner remediation AWS smoke",
      testType: "integration",
    })
    .returning({ id: controls.id });
  assert.ok(awsControl?.id, "AWS control should be inserted.");

  await db.insert(tests).values({
    checkLogic: "abra_flexi_https_transport",
    controlId: control.id,
    integrationType: "abra-flexi",
    isActive: true,
    name: testName,
    passCriteria: "ABRA Flexi connector must use HTTPS transport.",
  });

  await db.insert(tests).values({
    checkLogic: "aws_s3_backup_recent",
    controlId: awsControl.id,
    integrationType: "aws",
    isActive: true,
    name: awsTestName,
    passCriteria: "AWS backup bucket must contain a recent backup object.",
  });

  const usernameEnc = encryptSecret(`${runId}_user`, clerkOrgId);
  const passwordEnc = encryptSecret(`${runId}_password`, clerkOrgId);
  await db.insert(integrations).values({
    accessTokenEnc: passwordEnc,
    clerkOrgId,
    config: {
      baseUrl: "http://example.test",
      companyName: `${runId}_company`,
      usernameEnc,
    },
    provider: "abra-flexi",
    status: "connected",
  });

  await db.insert(integrations).values({
    accessTokenEnc: encryptSecret(`${runId}_aws_access_key`, clerkOrgId),
    clerkOrgId,
    config: {
      region: "eu-central-1",
    },
    provider: "aws",
    refreshTokenEnc: encryptSecret(`${runId}_aws_secret_key`, clerkOrgId),
    status: "connected",
  });
}

async function main() {
  await cleanup();
  await seed();

  const firstRun = await runTestsForOrg(clerkOrgId, { provider: "abra-flexi" });
  assert.equal(firstRun.providers.length, 1);
  assert.equal(firstRun.providers[0]?.testsRun, 1);
  assert.equal(firstRun.providers[0]?.evidenceCreated, 1);

  let tasks = await db
    .select()
    .from(remediationTasks)
    .where(eq(remediationTasks.clerkOrgId, clerkOrgId));
  assert.equal(tasks.length, 1, "runner should create one connector remediation task.");
  assert.equal(tasks[0]?.sourceType, "connector_gap");
  assert.equal(tasks[0]?.sourceKey, sourceKey);
  assert.equal(tasks[0]?.status, "open");

  const [statusAfterGap] = await db
    .select({ status: orgControlStatuses.status })
    .from(orgControlStatuses)
    .where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
  assert.equal(statusAfterGap?.status, "fail");

  await db
    .update(integrations)
    .set({
      config: {
        baseUrl: "https://example.test",
        companyName: `${runId}_company`,
        usernameEnc: encryptSecret(`${runId}_user`, clerkOrgId),
      },
    })
    .where(
      and(
        eq(integrations.clerkOrgId, clerkOrgId),
        eq(integrations.provider, "abra-flexi"),
      ),
    );

  const secondRun = await runTestsForOrg(clerkOrgId, { provider: "abra-flexi" });
  assert.equal(secondRun.providers.length, 1);
  assert.equal(secondRun.providers[0]?.testsRun, 1);
  assert.equal(secondRun.providers[0]?.evidenceCreated, 1);

  tasks = await db
    .select()
    .from(remediationTasks)
    .where(eq(remediationTasks.clerkOrgId, clerkOrgId));
  assert.equal(tasks.length, 1, "passing rerun should resolve, not duplicate, connector task.");
  assert.equal(tasks[0]?.status, "resolved");

  const runRows = await db
    .select({ id: integrationRuns.id, status: integrationRuns.status })
    .from(integrationRuns)
    .where(eq(integrationRuns.clerkOrgId, clerkOrgId));
  assert.deepEqual(runRows.map((row) => row.status).sort(), ["fail", "pass"]);

  const evidenceRows = await db
    .select({ assessmentResult: evidence.assessmentResult })
    .from(evidence)
    .where(eq(evidence.clerkOrgId, clerkOrgId));
  assert.deepEqual(
    evidenceRows.map((row) => row.assessmentResult).sort(),
    ["gap", "pass"],
  );

  const errorRun = await runTestsForOrg(clerkOrgId, { provider: "aws" });
  assert.equal(errorRun.providers.length, 1);
  assert.equal(errorRun.providers[0]?.testsRun, 1);
  assert.equal(
    errorRun.providers[0]?.evidenceCreated,
    1,
    "runner should collect blocked evidence for explicit connector error results.",
  );

  const [blockedTask] = await db
    .select()
    .from(remediationTasks)
    .where(
      and(
        eq(remediationTasks.clerkOrgId, clerkOrgId),
        eq(remediationTasks.sourceKey, awsSourceKey),
      ),
    );
  assert.equal(blockedTask?.sourceType, "connector_blocked");
  assert.equal(blockedTask?.status, "open");

  const [awsControlRow] = await db
    .select({ id: controls.id })
    .from(controls)
    .where(eq(controls.key, awsControlKey));
  assert.ok(awsControlRow?.id, "AWS control should still exist for evidence assertion.");

  const [blockedEvidence] = await db
    .select({
      assessmentResult: evidence.assessmentResult,
      blockedReason: evidence.blockedReason,
      collectionStatus: evidence.collectionStatus,
    })
    .from(evidence)
    .where(
      and(
        eq(evidence.clerkOrgId, clerkOrgId),
        eq(evidence.controlId, awsControlRow.id),
      ),
    );
  assert.equal(blockedEvidence?.assessmentResult, "unknown");
  assert.equal(blockedEvidence?.blockedReason, "collection_failed");
  assert.equal(blockedEvidence?.collectionStatus, "failed");

  await cleanup();
  console.log("Integration runner remediation smoke passed.");
}

main().catch(async (error) => {
  await cleanup().catch(() => undefined);
  console.error(error);
  process.exit(1);
});
