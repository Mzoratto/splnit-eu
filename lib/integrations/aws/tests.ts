import {
  CloudTrailClient,
  DescribeTrailsCommand,
  GetTrailStatusCommand,
} from "@aws-sdk/client-cloudtrail";
import {
  DescribeFlowLogsCommand,
  DescribeVpcsCommand,
  EC2Client,
} from "@aws-sdk/client-ec2";
import {
  GetAccountSummaryCommand,
  IAMClient,
  ListMFADevicesCommand,
  ListUsersCommand,
} from "@aws-sdk/client-iam";
import {
  GetBucketEncryptionCommand,
  ListBucketsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { Integration } from "@/lib/db/schema";
import type { IntegrationAdapter, TestResult } from "../types";
import { assumeAwsRole, getAwsConfig } from "./client";

type AwsClients = {
  cloudtrail: CloudTrailClient;
  ec2: EC2Client;
  iam: IAMClient;
  s3: S3Client;
};

function isAwsError(error: unknown, names: string[]) {
  return (
    error instanceof Error &&
    names.some((name) => error.name === name || error.message.includes(name))
  );
}

function summarize(values: string[]) {
  return values.slice(0, 5).join(", ");
}

async function createAwsClients(integration: Integration): Promise<AwsClients> {
  const config = getAwsConfig(integration);
  const assumed = await assumeAwsRole(config);
  const options = {
    credentials: assumed.credentials,
    region: assumed.region,
  };

  return {
    cloudtrail: new CloudTrailClient(options),
    ec2: new EC2Client(options),
    iam: new IAMClient(options),
    s3: new S3Client(options),
  };
}

async function listIamUsers(iam: IAMClient) {
  const users: { UserName?: string }[] = [];
  let marker: string | undefined;

  do {
    const response = await iam.send(new ListUsersCommand({ Marker: marker }));
    users.push(...(response.Users ?? []));
    marker = response.IsTruncated ? response.Marker : undefined;
  } while (marker);

  return users;
}

async function listVpcIds(ec2: EC2Client) {
  const vpcIds: string[] = [];
  let nextToken: string | undefined;

  do {
    const response = await ec2.send(new DescribeVpcsCommand({ NextToken: nextToken }));
    vpcIds.push(
      ...(response.Vpcs ?? [])
        .map((vpc) => vpc.VpcId)
        .filter((value): value is string => Boolean(value)),
    );
    nextToken = response.NextToken;
  } while (nextToken);

  return vpcIds;
}

export const awsAdapter: IntegrationAdapter = {
  provider: "aws",

  async runTest(checkLogic, integration): Promise<TestResult> {
    const clients = await createAwsClients(integration);

    switch (checkLogic) {
      case "check_cloudtrail_enabled": {
        const trails = await clients.cloudtrail.send(
          new DescribeTrailsCommand({ includeShadowTrails: true }),
        );
        const loggingTrails = [];

        for (const trail of trails.trailList ?? []) {
          if (!trail.Name) {
            continue;
          }

          const status = await clients.cloudtrail.send(
            new GetTrailStatusCommand({ Name: trail.TrailARN ?? trail.Name }),
          );

          if (trail.IsMultiRegionTrail && status.IsLogging) {
            loggingTrails.push(trail.Name);
          }
        }

        return loggingTrails.length > 0
          ? {
              data: { loggingTrails },
              status: "pass",
            }
          : {
              data: { trailCount: trails.trailList?.length ?? 0 },
              failureReason: "No multi-region CloudTrail trail is actively logging.",
              status: "fail",
            };
      }

      case "check_s3_encryption": {
        const buckets = await clients.s3.send(new ListBucketsCommand({}));
        const unencrypted = [];

        for (const bucket of (buckets.Buckets ?? []).slice(0, 50)) {
          if (!bucket.Name) {
            continue;
          }

          try {
            await clients.s3.send(
              new GetBucketEncryptionCommand({ Bucket: bucket.Name }),
            );
          } catch (error) {
            if (
              isAwsError(error, [
                "ServerSideEncryptionConfigurationNotFoundError",
                "NoSuchServerSideEncryptionConfiguration",
              ])
            ) {
              unencrypted.push(bucket.Name);
              continue;
            }

            throw error;
          }
        }

        return unencrypted.length === 0
          ? {
              data: { checkedBuckets: Math.min(buckets.Buckets?.length ?? 0, 50) },
              status: "pass",
            }
          : {
              data: {
                checkedBuckets: Math.min(buckets.Buckets?.length ?? 0, 50),
                unencryptedCount: unencrypted.length,
              },
              failureReason: `S3 buckets without default encryption: ${summarize(
                unencrypted,
              )}`,
              status: "fail",
            };
      }

      case "check_iam_mfa": {
        const users = await listIamUsers(clients.iam);
        const withoutMfa = [];

        for (const user of users.slice(0, 100)) {
          if (!user.UserName) {
            continue;
          }

          const mfaDevices = await clients.iam.send(
            new ListMFADevicesCommand({ UserName: user.UserName }),
          );

          if ((mfaDevices.MFADevices ?? []).length === 0) {
            withoutMfa.push(user.UserName);
          }
        }

        return withoutMfa.length === 0
          ? {
              data: { checkedUsers: Math.min(users.length, 100) },
              status: "pass",
            }
          : {
              data: {
                checkedUsers: Math.min(users.length, 100),
                withoutMfaCount: withoutMfa.length,
              },
              failureReason: `IAM users without MFA: ${summarize(withoutMfa)}`,
              status: "fail",
            };
      }

      case "check_root_account_mfa": {
        const summary = await clients.iam.send(new GetAccountSummaryCommand({}));
        const enabled = summary.SummaryMap?.AccountMFAEnabled === 1;

        return enabled
          ? {
              data: { accountMfaEnabled: true },
              status: "pass",
            }
          : {
              data: { accountMfaEnabled: false },
              failureReason: "AWS root account MFA is not enabled.",
              status: "fail",
            };
      }

      case "check_vpc_flow_logs": {
        const vpcIds = await listVpcIds(clients.ec2);

        if (vpcIds.length === 0) {
          return {
            data: { vpcCount: 0 },
            status: "not_applicable",
          };
        }

        const flowLogs = await clients.ec2.send(
          new DescribeFlowLogsCommand({
            Filter: [
              {
                Name: "resource-id",
                Values: vpcIds,
              },
            ],
          }),
        );
        const loggedVpcIds = new Set(
          (flowLogs.FlowLogs ?? [])
            .filter((log) => log.FlowLogStatus === "ACTIVE")
            .map((log) => log.ResourceId)
            .filter((value): value is string => Boolean(value)),
        );
        const missing = vpcIds.filter((vpcId) => !loggedVpcIds.has(vpcId));

        return missing.length === 0
          ? {
              data: { checkedVpcs: vpcIds.length },
              status: "pass",
            }
          : {
              data: {
                checkedVpcs: vpcIds.length,
                missingCount: missing.length,
              },
              failureReason: `VPCs without active flow logs: ${summarize(missing)}`,
              status: "warning",
            };
      }

      default:
        return {
          data: {},
          failureReason: `Unknown check: ${checkLogic}`,
          status: "not_applicable",
        };
    }
  },
};
