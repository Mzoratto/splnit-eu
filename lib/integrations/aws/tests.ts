import { decryptSecret } from "@/lib/crypto";
import type { Integration } from "@/lib/db/schema";
import {
  checkCloudTrailEnabled,
  checkEc2Status,
  checkS3BackupRecency,
  checkSecurityGroupPresent,
  type AwsCheckDeps,
} from "@/lib/connectors/aws/checks";
import type { StoredConnectorCredential } from "@/lib/connectors/api-key-base/types";
import type { AwsCheckResult } from "@/lib/workspaces/aws-checks";
import type { IntegrationAdapter, TestResult } from "../types";

type AwsStoredCredential = StoredConnectorCredential & { platform: "aws" };

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function getConfigString(config: Record<string, unknown>, key: string) {
  const value = config[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function checkResultToTestResult(
  result: AwsCheckResult,
  passData: Record<string, unknown>,
  gapReason: string,
): TestResult {
  if (result === "pass") {
    return {
      data: {
        provider: "aws",
        ...passData,
      },
      status: "pass",
    };
  }

  if (result === "gap") {
    return {
      data: {
        provider: "aws",
      },
      failureReason: gapReason,
      status: "fail",
    };
  }

  return {
    data: {
      blockedReason: "collection_failed",
      provider: "aws",
    },
    failureReason:
      "Automatická kontrola AWS selhala; pro toto opatření se má zobrazit manuální čestné prohlášení.",
    status: "error",
  };
}

function getAwsCredential(integration: Integration): AwsStoredCredential {
  const config = asRecord(integration.config);
  const region = getConfigString(config, "region");

  if (!integration.accessTokenEnc || !integration.refreshTokenEnc || !region) {
    throw new Error("AWS IAM access key credentials are missing.");
  }

  return {
    accessKeyId: decryptSecret(integration.accessTokenEnc, integration.clerkOrgId),
    backupBucketName: getConfigString(config, "backupBucketName"),
    platform: "aws",
    region,
    secretAccessKey: decryptSecret(integration.refreshTokenEnc, integration.clerkOrgId),
  };
}

export async function runAwsCheckWithCredential(
  checkLogic: string,
  credential: AwsStoredCredential,
  deps: AwsCheckDeps = {},
): Promise<TestResult> {
  switch (checkLogic) {
    case "aws_ec2_instance_running": {
      const result = await checkEc2Status(credential, deps);

      return checkResultToTestResult(
        result,
        {
          ec2InstanceState: "running",
          region: credential.region,
        },
        "V AWS nebyla nalezena žádná běžící EC2 instance.",
      );
    }
    case "aws_security_group_rules_present": {
      const result = await checkSecurityGroupPresent(credential, deps);

      return checkResultToTestResult(
        result,
        {
          region: credential.region,
          securityGroupRulesPresent: true,
        },
        "V AWS nebyla nalezena security group s příchozím nebo odchozím pravidlem.",
      );
    }
    case "aws_s3_backup_recent": {
      const backupBucketName = credential.backupBucketName?.trim();

      if (!backupBucketName) {
        return {
          data: {
            backupBucketName: null,
            blockedReason: "collection_failed",
            provider: "aws",
          },
          failureReason:
            "AWS backupBucketName není nastavený; doplňte bucket v konektoru nebo nahrajte manuální důkaz.",
          status: "error",
        };
      }

      const result = await checkS3BackupRecency(credential, deps);

      return checkResultToTestResult(
        result,
        {
          backupBucketName,
          backupObjectWithinWindow: true,
          backupWindowDays: 7,
        },
        "V nakonfigurovaném S3 backup bucketu nebyl nalezen objekt změněný v posledních 7 dnech.",
      );
    }
    case "aws_cloudtrail_logging_enabled": {
      const result = await checkCloudTrailEnabled(credential, deps);

      return checkResultToTestResult(
        result,
        {
          cloudTrailLoggingEnabled: true,
          region: credential.region,
        },
        "V AWS nebyl nalezen žádný CloudTrail trail s aktivním logováním.",
      );
    }
    default:
      return {
        data: {},
        failureReason: `Neznámá kontrola AWS: ${checkLogic}`,
        status: "not_applicable",
      };
  }
}

export const awsAdapter: IntegrationAdapter = {
  provider: "aws",

  async runTest(checkLogic: string, integration: Integration): Promise<TestResult> {
    // The per-org/provider execution lock is acquired by
    // lib/integrations/runner.ts runTestsForOrg via acquireIntegrationRunLock.
    return runAwsCheckWithCredential(checkLogic, getAwsCredential(integration));
  },
};
