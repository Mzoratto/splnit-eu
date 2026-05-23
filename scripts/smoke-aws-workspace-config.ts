import assert from "node:assert/strict";
import { awsWorkspace } from "@/lib/workspaces/aws";
import { AWS_LAYER1_CHECKS, AWS_LAYER3_CHECKS } from "@/lib/workspaces/aws-checks";

const expectedLayerIds = [
  "infrastructure",
  "iam",
  "backup_dr",
  "api_connectivity",
] as const;

const controls = awsWorkspace.layers.flatMap((layer) =>
  layer.controls.map((control) => ({
    ...control,
    layerId: layer.id,
  })),
);

const serializedWorkspace = JSON.stringify(awsWorkspace);
const excludedBucketField = ["backup", "Prefix"].join("");

assert.equal(awsWorkspace.platformId, "aws");
assert.equal(awsWorkspace.layers.length, 4);
assert.deepEqual(
  awsWorkspace.layers.map((layer) => layer.id),
  expectedLayerIds,
  "AWS workspace must keep the generic four-layer order.",
);
assert.equal(
  serializedWorkspace.includes(excludedBucketField),
  false,
  "AWS workspace must only reference backupBucketName for Phase 3.",
);

for (const control of controls) {
  assert.match(
    control.nis2ArticleRef,
    /^Article 21\(2\)\([chij]\)$/,
    `${control.controlKey} must include a NIS2 article mapping.`,
  );
  assert.ok(control.guidance.length > 40, `${control.controlKey} must include Czech guidance.`);
  assert.ok(
    control.frameworkMappings?.some((mapping) => mapping.frameworkId === "zokb"),
    `${control.controlKey} must include a ZoKB mapping.`,
  );
  assert.ok(
    control.frameworkMappings?.some((mapping) => mapping.frameworkId === "nis2"),
    `${control.controlKey} must include a NIS2 framework mapping.`,
  );
  assert.ok(control.nukibTier, `${control.controlKey} must include NÚKIB tier metadata.`);
}

const layer1 = controls.filter((control) => control.layerId === "infrastructure");
assert.equal(layer1.length, 4, "AWS infrastructure layer must contain four automated controls.");

for (const control of layer1) {
  assert.equal(control.automatable, true, `${control.controlKey} must be automatable.`);
  assert.equal(control.evidenceType, "both", `${control.controlKey} must keep manual fallback.`);
  assert.ok(control.apiEndpoint?.startsWith("@aws-sdk/client-"), `${control.controlKey} must document SDK client.`);
  assert.ok(control.apiField, `${control.controlKey} must document the response field.`);
  assert.ok(control.apiExpected, `${control.controlKey} must document the expected value.`);
}

assert.deepEqual(
  AWS_LAYER1_CHECKS.map((check) => check.controlKey),
  layer1.map((control) => control.controlKey),
);

for (const check of AWS_LAYER1_CHECKS) {
  const control = layer1.find((candidate) => candidate.controlKey === check.controlKey);
  assert.ok(control, `${check.controlKey} must exist in Layer 1.`);
  assert.ok(control.apiEndpoint?.includes(check.sdkClient), `${check.controlKey} must document ${check.sdkClient}.`);
  assert.ok(control.apiEndpoint?.includes(check.command), `${check.controlKey} must document ${check.command}.`);
  assert.equal(control.apiField, check.field, `${check.controlKey} field path must match check contract.`);
  assert.equal(control.apiExpected, check.expected, `${check.controlKey} expected value must match check contract.`);
}

const backupVersioning = controls.find((control) => control.controlKey === "aws-backup-s3-versioning-enabled");
assert.ok(backupVersioning, "AWS workspace must include S3 versioning control.");
assert.equal(backupVersioning.layerId, "backup_dr");
assert.equal(backupVersioning.automatable, true);
assert.equal(backupVersioning.evidenceType, "both");

const [versioningContract] = AWS_LAYER3_CHECKS;
assert.ok(backupVersioning.apiEndpoint?.includes(versioningContract.sdkClient));
assert.ok(backupVersioning.apiEndpoint?.includes(versioningContract.command));
assert.equal(backupVersioning.apiField, versioningContract.field);
assert.equal(backupVersioning.apiExpected, versioningContract.expected);

const bucketControls = controls.filter((control) =>
  [control.apiExpected, control.guidance].some((value) => value?.includes("backupBucketName")),
);

assert.equal(
  bucketControls.length,
  2,
  "Only the S3 recency and versioning controls should depend on backupBucketName.",
);

console.log("aws workspace config smoke passed");
