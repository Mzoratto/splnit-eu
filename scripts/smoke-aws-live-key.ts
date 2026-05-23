import assert from "node:assert/strict";
import {
  awsHealthProbe,
  checkCloudTrailEnabled,
  checkEc2Status,
  checkS3BackupRecency,
  checkSecurityGroupPresent,
} from "@/lib/connectors/aws/checks";
import type { StoredConnectorCredential } from "@/lib/connectors/api-key-base/types";

type AwsStoredCredential = Extract<StoredConnectorCredential, { platform: "aws" }>;

function envPresence(name: string) {
  return process.env[name]?.trim() ? "present" : "missing";
}

function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    console.error(
      `${name} is not set.\n` +
      `Visible env: AWS_LIVE_TEST_ACCESS_KEY_ID=${envPresence("AWS_LIVE_TEST_ACCESS_KEY_ID")}, ` +
      `AWS_LIVE_TEST_SECRET_ACCESS_KEY=${envPresence("AWS_LIVE_TEST_SECRET_ACCESS_KEY")}, ` +
      `AWS_LIVE_REGION=${envPresence("AWS_LIVE_REGION")}.\n` +
      "Run with: AWS_LIVE_TEST_ACCESS_KEY_ID=your_key_id " +
      "AWS_LIVE_TEST_SECRET_ACCESS_KEY=your_secret " +
      "AWS_LIVE_REGION=eu-north-1 " +
      "npm run smoke:aws-live-key",
    );
    process.exit(1);
  }

  return value;
}

function optionalEnv(name: string) {
  return process.env[name]?.trim() || null;
}

const credential: AwsStoredCredential = {
  accessKeyId: requireEnv("AWS_LIVE_TEST_ACCESS_KEY_ID"),
  backupBucketName: optionalEnv("AWS_LIVE_TEST_BACKUP_BUCKET_NAME"),
  platform: "aws",
  region: requireEnv("AWS_LIVE_REGION"),
  secretAccessKey: requireEnv("AWS_LIVE_TEST_SECRET_ACCESS_KEY"),
};

async function main() {
  // Health probe must return "connected" for valid live IAM access keys.
  const probeResult = await awsHealthProbe({ credentials: credential });
  assert.equal(
    probeResult,
    "connected",
    `Health probe returned "${probeResult}" - check the key ID, secret, and region`,
  );
  console.log("  OK health probe: connected");

  // Layer 1 checks accept pass or gap; error means the AWS SDK call failed.
  const ec2Status = await checkEc2Status(credential);
  assert.notEqual(ec2Status, "error", "checkEc2Status returned error against live API");
  console.log(`  OK EC2 status: ${ec2Status}`);

  const securityGroupStatus = await checkSecurityGroupPresent(credential);
  assert.notEqual(
    securityGroupStatus,
    "error",
    "checkSecurityGroupPresent returned error against live API",
  );
  console.log(`  OK security group present: ${securityGroupStatus}`);

  if (credential.backupBucketName) {
    const s3BackupStatus = await checkS3BackupRecency(credential);
    assert.notEqual(
      s3BackupStatus,
      "error",
      "checkS3BackupRecency returned error against live API",
    );
    console.log(`  OK S3 backup recency: ${s3BackupStatus}`);
  } else {
    console.log("  SKIP S3 backup recency: AWS_LIVE_TEST_BACKUP_BUCKET_NAME is not set");
  }

  const cloudTrailStatus = await checkCloudTrailEnabled(credential);
  assert.notEqual(
    cloudTrailStatus,
    "error",
    "checkCloudTrailEnabled returned error against live API",
  );
  console.log(`  OK CloudTrail enabled: ${cloudTrailStatus}`);

  console.log("aws live key smoke passed");
}

void main();
