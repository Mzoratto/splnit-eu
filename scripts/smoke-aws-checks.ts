import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  DescribeTrailsCommand,
  GetTrailStatusCommand,
  type DescribeTrailsCommandOutput,
  type GetTrailStatusCommandOutput,
} from "@aws-sdk/client-cloudtrail";
import {
  DescribeInstancesCommand,
  DescribeSecurityGroupsCommand,
  type DescribeInstancesCommandOutput,
  type DescribeSecurityGroupsCommandOutput,
} from "@aws-sdk/client-ec2";
import {
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import type { GetCallerIdentityCommandOutput } from "@aws-sdk/client-sts";
import { decryptSecret } from "@/lib/crypto";
import {
  awsHealthProbe,
  checkCloudTrailEnabled,
  checkEc2Status,
  checkS3BackupRecency,
  checkSecurityGroupPresent,
  mapAwsErrorToHealthCheck,
} from "@/lib/connectors/aws/checks";
import { encryptedValuesForCredential } from "@/lib/connectors/api-key-base/storage";
import type { StoredConnectorCredential } from "@/lib/connectors/api-key-base/types";
import { runAwsCheckWithCredential } from "@/lib/integrations/aws/tests";
import { AWS_TEST_DEFINITIONS } from "@/lib/integrations/aws/test-definitions";
import { AWS_LAYER1_CHECKS } from "@/lib/workspaces/aws-checks";

process.env.ENCRYPTION_KEY ??= "test-encryption-key";

type AwsStoredCredential = Extract<StoredConnectorCredential, { platform: "aws" }>;

const credential: AwsStoredCredential = {
  accessKeyId: "AKIA_TEST_ACCESS_KEY",
  backupBucketName: "splnit-backups",
  platform: "aws",
  region: "eu-central-1",
  secretAccessKey: "test-secret-access-key",
};

function awsError(name: string) {
  const error = new Error(name);
  error.name = name;
  return error;
}

function stsResponse(): GetCallerIdentityCommandOutput {
  return {
    $metadata: {},
    Account: "123456789012",
    Arn: "arn:aws:iam::123456789012:user/splnit-readonly",
    UserId: "AIDAEXAMPLE",
  };
}

async function main() {
  assert.equal(
    await awsHealthProbe(
      { credentials: credential },
      {
        send: async () => stsResponse(),
      },
    ),
    "connected",
  );

  for (const name of [
    "AuthFailure",
    "InvalidAccessKeyId",
    "InvalidClientTokenId",
    "SignatureDoesNotMatch",
    "UnrecognizedClientException",
  ]) {
    assert.equal(
      await awsHealthProbe(
        { credentials: credential },
        {
          send: async () => {
            throw awsError(name);
          },
        },
      ),
      "invalid_key",
      `${name} should map to invalid_key`,
    );
  }

  for (const name of ["AccessDenied", "AccessDeniedException", "UnauthorizedOperation"]) {
    assert.equal(
      mapAwsErrorToHealthCheck(awsError(name)),
      "insufficient_scope",
      `${name} should map to insufficient_scope`,
    );
  }
  assert.equal(
    mapAwsErrorToHealthCheck({ $metadata: { httpStatusCode: 401 } }),
    "invalid_key",
  );
  assert.equal(
    mapAwsErrorToHealthCheck({ $metadata: { httpStatusCode: 403 } }),
    "insufficient_scope",
  );

  assert.equal(
    await awsHealthProbe(
      { credentials: credential },
      {
        send: async () => {
          throw awsError("TimeoutError");
        },
      },
    ),
    "unreachable",
  );

  assert.equal(
    await awsHealthProbe({
      credentials: {
        apiKey: "not-aws",
        platform: "hetzner",
      },
    }),
    "invalid_key",
  );

  const encrypted = encryptedValuesForCredential(
    {
      accessKeyId: " AKIA_TEST_ACCESS_KEY ",
      backupBucketName: " splnit-backups ",
      platform: "aws",
      region: " eu-central-1 ",
      secretAccessKey: " test-secret-access-key ",
    },
    "org_test",
  );
  const config = encrypted.config as Record<string, unknown>;

  assert.equal(decryptSecret(encrypted.accessTokenEnc, "org_test"), "AKIA_TEST_ACCESS_KEY");
  assert.equal(decryptSecret(encrypted.refreshTokenEnc ?? "", "org_test"), "test-secret-access-key");
  assert.equal(config.credentialType, "aws_iam_access_key");
  assert.equal(config.tokenType, "api_key");
  assert.equal(config.region, "eu-central-1");
  assert.equal(config.backupBucketName, "splnit-backups");
  assert.equal("backupPrefix" in config, false);
  assert.equal("accessKeyId" in config, false);
  assert.equal("secretAccessKey" in config, false);

  const ec2Pages: DescribeInstancesCommandOutput[] = [
    {
      $metadata: {},
      NextToken: "page-2",
      Reservations: [{ Instances: [{ State: { Name: "stopped" } }] }],
    },
    {
      $metadata: {},
      Reservations: [{ Instances: [{ State: { Name: "running" } }] }],
    },
  ];
  const ec2Commands: DescribeInstancesCommand[] = [];

  assert.equal(
    await checkEc2Status(credential, {
      ec2Send: async (command) => {
        assert.ok(command instanceof DescribeInstancesCommand);
        ec2Commands.push(command);
        return ec2Pages.shift() ?? { $metadata: {}, Reservations: [] };
      },
    }),
    "pass",
  );
  assert.equal(ec2Commands.length, 2, "EC2 status check must paginate.");
  assert.equal(ec2Commands[0]?.input.NextToken, undefined);
  assert.equal(ec2Commands[1]?.input.NextToken, "page-2");

  assert.equal(
    await checkEc2Status(credential, {
      ec2Send: async () => ({
        $metadata: {},
        Reservations: [{ Instances: [{ State: { Name: "terminated" } }] }],
      }),
    }),
    "gap",
  );
  assert.equal(
    await checkEc2Status(credential, {
      ec2Send: async () => {
        throw awsError("UnauthorizedOperation");
      },
    }),
    "error",
  );

  const securityGroupPages: DescribeSecurityGroupsCommandOutput[] = [
    {
      $metadata: {},
      NextToken: "page-2",
      SecurityGroups: [{ GroupId: "sg-empty", IpPermissions: [], IpPermissionsEgress: [] }],
    },
    {
      $metadata: {},
      SecurityGroups: [{ GroupId: "sg-present", IpPermissions: [{ IpProtocol: "tcp" }] }],
    },
  ];
  const securityGroupCommands: DescribeSecurityGroupsCommand[] = [];

  assert.equal(
    await checkSecurityGroupPresent(credential, {
      ec2Send: async (command) => {
        assert.ok(command instanceof DescribeSecurityGroupsCommand);
        securityGroupCommands.push(command);
        return securityGroupPages.shift() ?? { $metadata: {}, SecurityGroups: [] };
      },
    }),
    "pass",
  );
  assert.equal(securityGroupCommands.length, 2, "Security group check must paginate.");
  assert.equal(
    await checkSecurityGroupPresent(credential, {
      ec2Send: async () => ({
        $metadata: {},
        SecurityGroups: [{ GroupId: "sg-empty", IpPermissions: [], IpPermissionsEgress: [] }],
      }),
    }),
    "gap",
  );

  const s3Pages: ListObjectsV2CommandOutput[] = [
    {
      $metadata: {},
      Contents: [{ Key: "old.sql.gz", LastModified: new Date("2020-01-01T00:00:00Z") }],
      IsTruncated: true,
      NextContinuationToken: "page-2",
    },
    {
      $metadata: {},
      Contents: [{ Key: "recent.sql.gz", LastModified: new Date() }],
    },
  ];
  const s3Commands: ListObjectsV2Command[] = [];

  assert.equal(
    await checkS3BackupRecency(credential, {
      s3Send: async (command) => {
        assert.ok(command instanceof ListObjectsV2Command);
        s3Commands.push(command);
        return s3Pages.shift() ?? { $metadata: {}, Contents: [] };
      },
    }),
    "pass",
  );
  assert.equal(s3Commands.length, 2, "S3 recency check must paginate.");
  assert.equal(s3Commands[0]?.input.Bucket, "splnit-backups");
  assert.equal(s3Commands[1]?.input.ContinuationToken, "page-2");
  assert.equal(
    await checkS3BackupRecency(
      {
        ...credential,
        backupBucketName: null,
      },
      {
        s3Send: async () => {
          throw new Error("S3 should not be called without backupBucketName.");
        },
      },
    ),
    "error",
  );
  assert.equal(
    await checkS3BackupRecency(credential, {
      s3Send: async () => ({
        $metadata: {},
        Contents: [{ Key: "old.sql.gz", LastModified: new Date("2020-01-01T00:00:00Z") }],
      }),
    }),
    "gap",
  );

  const cloudTrailResponses: Array<
    DescribeTrailsCommandOutput | GetTrailStatusCommandOutput
  > = [
    {
      $metadata: {},
      trailList: [{ TrailARN: "arn:aws:cloudtrail:trail/disabled" }, { Name: "enabled" }],
    },
    { $metadata: {}, IsLogging: false },
    { $metadata: {}, IsLogging: true },
  ];
  const cloudTrailCommands: Array<DescribeTrailsCommand | GetTrailStatusCommand> = [];

  assert.equal(
    await checkCloudTrailEnabled(credential, {
      cloudTrailSend: async (command) => {
        assert.ok(
          command instanceof DescribeTrailsCommand ||
            command instanceof GetTrailStatusCommand,
        );
        cloudTrailCommands.push(command);
        return cloudTrailResponses.shift() ?? { $metadata: {} };
      },
    }),
    "pass",
  );
  assert.ok(cloudTrailCommands[0] instanceof DescribeTrailsCommand);
  const firstTrailStatusCommand = cloudTrailCommands[1];
  const secondTrailStatusCommand = cloudTrailCommands[2];
  assert.ok(firstTrailStatusCommand instanceof GetTrailStatusCommand);
  assert.ok(secondTrailStatusCommand instanceof GetTrailStatusCommand);
  assert.equal(firstTrailStatusCommand.input.Name, "arn:aws:cloudtrail:trail/disabled");
  assert.equal(secondTrailStatusCommand.input.Name, "enabled");
  assert.equal(
    await checkCloudTrailEnabled(credential, {
      cloudTrailSend: async (command) => {
        if (command instanceof DescribeTrailsCommand) {
          return { $metadata: {}, trailList: [{ Name: "disabled" }] };
        }

        return { $metadata: {}, IsLogging: false };
      },
    }),
    "gap",
  );

  const adapterResult = await runAwsCheckWithCredential(
    "aws_ec2_instance_running",
    credential,
    {
      ec2Send: async () => ({
        $metadata: {},
        Reservations: [{ Instances: [{ State: { Name: "running" } }] }],
      }),
    },
  );
  assert.equal(adapterResult.status, "pass");
  assert.equal(adapterResult.data.provider, "aws");
  assert.equal(adapterResult.data.ec2InstanceState, "running");

  const missingBucketResult = await runAwsCheckWithCredential(
    "aws_s3_backup_recent",
    { ...credential, backupBucketName: null },
    {
      s3Send: async () => {
        throw new Error("S3 should not be called without backupBucketName.");
      },
    },
  );
  assert.equal(missingBucketResult.status, "error");
  assert.equal(missingBucketResult.data.blockedReason, "collection_failed");

  assert.deepEqual(
    AWS_TEST_DEFINITIONS.map((definition) => definition.controlKey),
    AWS_LAYER1_CHECKS.map((check) => check.controlKey),
    "AWS test definitions must wire every Layer 1 automated workspace check.",
  );

  const runnerSource = readFileSync("lib/integrations/runner.ts", "utf8");
  const lockIndex = runnerSource.indexOf("const lock = await acquireIntegrationRunLock");
  const runTestIndex = runnerSource.indexOf("adapter.runTest");
  assert.ok(lockIndex >= 0, "Integration runner must acquire a per-org/provider lock.");
  assert.ok(runTestIndex > lockIndex, "Integration runner must acquire the lock before running checks.");
  assert.ok(
    runnerSource.includes("eq(tests.isActive, true)"),
    "Integration runner must ignore inactive integration tests.",
  );

  console.log("aws connector checks smoke passed");
}

void main();
