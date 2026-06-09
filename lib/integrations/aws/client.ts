import {
  CloudTrailClient,
  DescribeTrailsCommand,
  GetTrailStatusCommand,
  type DescribeTrailsCommandOutput,
  type GetTrailStatusCommandOutput,
} from "@aws-sdk/client-cloudtrail";
import {
  DescribeInstancesCommand,
  DescribeSecurityGroupsCommand,
  EC2Client,
  type DescribeInstancesCommandOutput,
  type DescribeSecurityGroupsCommandOutput,
} from "@aws-sdk/client-ec2";
import { IAMClient } from "@aws-sdk/client-iam";
import {
  ListObjectsV2Command,
  S3Client,
  type ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import {
  GetCallerIdentityCommand,
  STSClient,
  type GetCallerIdentityCommandOutput,
} from "@aws-sdk/client-sts";
import type { StoredConnectorCredential } from "@/lib/connectors/api-key-base/types";
import { decryptSecret } from "@/lib/crypto";
import type { Integration } from "@/lib/db/schema";

export type AwsStoredCredential = StoredConnectorCredential & { platform: "aws" };

export type AwsSendOptions = {
  abortSignal?: AbortSignal;
};

export type AwsStsSend = (
  command: GetCallerIdentityCommand,
  options?: AwsSendOptions,
) => Promise<GetCallerIdentityCommandOutput>;

type AwsEc2Command = DescribeInstancesCommand | DescribeSecurityGroupsCommand;
export type AwsEc2Send = (
  command: AwsEc2Command,
  options?: AwsSendOptions,
) => Promise<DescribeInstancesCommandOutput | DescribeSecurityGroupsCommandOutput>;

export type AwsS3Send = (
  command: ListObjectsV2Command,
  options?: AwsSendOptions,
) => Promise<ListObjectsV2CommandOutput>;

type AwsCloudTrailCommand = DescribeTrailsCommand | GetTrailStatusCommand;
export type AwsCloudTrailSend = (
  command: AwsCloudTrailCommand,
  options?: AwsSendOptions,
) => Promise<DescribeTrailsCommandOutput | GetTrailStatusCommandOutput>;

export type AwsClient = {
  cloudTrail: CloudTrailClient;
  cloudTrailSend: AwsCloudTrailSend;
  credential: AwsStoredCredential;
  ec2: EC2Client;
  ec2Send: AwsEc2Send;
  iam: IAMClient;
  s3: S3Client;
  s3Send: AwsS3Send;
  sts: STSClient;
  stsSend: AwsStsSend;
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function getConfigString(config: Record<string, unknown>, key: string) {
  const value = config[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function getAwsCredential(integration: Integration): AwsStoredCredential {
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

function awsClientConfig(credentials: AwsStoredCredential) {
  return {
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
    region: credentials.region,
  };
}

export function createAwsStsSend(credentials: AwsStoredCredential): AwsStsSend {
  const sts = new STSClient({
    ...awsClientConfig(credentials),
  });

  return sts.send.bind(sts) as AwsStsSend;
}

export function createAwsEc2Send(credentials: AwsStoredCredential): AwsEc2Send {
  const ec2 = new EC2Client({
    ...awsClientConfig(credentials),
  });

  return ec2.send.bind(ec2) as AwsEc2Send;
}

export function createAwsS3Send(credentials: AwsStoredCredential): AwsS3Send {
  const s3 = new S3Client({
    ...awsClientConfig(credentials),
  });

  return s3.send.bind(s3) as AwsS3Send;
}

export function createAwsCloudTrailSend(credentials: AwsStoredCredential): AwsCloudTrailSend {
  const cloudTrail = new CloudTrailClient({
    ...awsClientConfig(credentials),
  });

  return cloudTrail.send.bind(cloudTrail) as AwsCloudTrailSend;
}

export async function getAwsClient(integration: Integration): Promise<AwsClient> {
  const credential = getAwsCredential(integration);
  const sts = new STSClient({
    ...awsClientConfig(credential),
  });
  const ec2 = new EC2Client({
    ...awsClientConfig(credential),
  });
  const s3 = new S3Client({
    ...awsClientConfig(credential),
  });
  const cloudTrail = new CloudTrailClient({
    ...awsClientConfig(credential),
  });
  const iam = new IAMClient({
    ...awsClientConfig(credential),
  });

  return {
    cloudTrail,
    cloudTrailSend: cloudTrail.send.bind(cloudTrail) as AwsCloudTrailSend,
    credential,
    ec2,
    ec2Send: ec2.send.bind(ec2) as AwsEc2Send,
    iam,
    s3,
    s3Send: s3.send.bind(s3) as AwsS3Send,
    sts,
    stsSend: sts.send.bind(sts) as AwsStsSend,
  };
}
