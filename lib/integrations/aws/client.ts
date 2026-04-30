import {
  AssumeRoleCommand,
  GetCallerIdentityCommand,
  STSClient,
} from "@aws-sdk/client-sts";
import type { Integration } from "@/lib/db/schema";

export type AwsIntegrationConfig = {
  accountId?: string | null;
  assumedArn?: string | null;
  externalId?: string;
  region?: string;
  roleArn?: string;
};

const roleArnPattern = /^arn:aws[a-z-]*:iam::\d{12}:role\/[\w+=,.@/-]{1,512}$/;

export function getAwsExternalId(clerkOrgId: string) {
  return `splnit-${clerkOrgId}`;
}

export function getAwsRegion(config: AwsIntegrationConfig = {}) {
  return (
    config.region ??
    process.env.AWS_REGION ??
    process.env.AWS_DEFAULT_REGION ??
    "eu-central-1"
  );
}

export function assertAwsConfig(
  config: AwsIntegrationConfig,
): asserts config is AwsIntegrationConfig & { roleArn: string } {
  if (!config.roleArn || !roleArnPattern.test(config.roleArn)) {
    throw new Error("AWS integration requires a valid IAM role ARN.");
  }
}

export function getAwsConfig(integration: Integration) {
  const config = (integration.config ?? {}) as AwsIntegrationConfig;
  assertAwsConfig(config);

  return config;
}

export async function assumeAwsRole(config: AwsIntegrationConfig) {
  assertAwsConfig(config);

  const region = getAwsRegion(config);
  const sts = new STSClient({ region });
  const assumed = await sts.send(
    new AssumeRoleCommand({
      DurationSeconds: 900,
      ExternalId: config.externalId,
      RoleArn: config.roleArn,
      RoleSessionName: "splnit-compliance-check",
    }),
  );
  const credentials = assumed.Credentials;

  if (
    !credentials?.AccessKeyId ||
    !credentials.SecretAccessKey ||
    !credentials.SessionToken
  ) {
    throw new Error("AWS STS did not return temporary credentials.");
  }

  return {
    credentials: {
      accessKeyId: credentials.AccessKeyId,
      expiration: credentials.Expiration,
      secretAccessKey: credentials.SecretAccessKey,
      sessionToken: credentials.SessionToken,
    },
    region,
  };
}

export async function validateAwsRoleConnection(config: AwsIntegrationConfig) {
  const assumed = await assumeAwsRole(config);
  const sts = new STSClient({
    credentials: assumed.credentials,
    region: assumed.region,
  });
  const identity = await sts.send(new GetCallerIdentityCommand({}));

  return {
    accountId: identity.Account ?? null,
    assumedArn: identity.Arn ?? null,
    region: assumed.region,
  };
}
