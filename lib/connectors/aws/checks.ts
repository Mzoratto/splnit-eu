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
} from "@aws-sdk/client-s3";
import {
  GetCallerIdentityCommand,
} from "@aws-sdk/client-sts";
import { registerConnectorHealthProbe } from "@/lib/connectors/api-key-base/health";
import type {
  ConnectorHealthProbe,
  HealthCheckResult,
  StoredConnectorCredential,
} from "@/lib/connectors/api-key-base/types";
import {
  createAwsCloudTrailSend,
  createAwsEc2Send,
  createAwsS3Send,
  createAwsStsSend,
  type AwsCloudTrailSend,
  type AwsEc2Send,
  type AwsS3Send,
  type AwsSendOptions,
  type AwsStoredCredential,
  type AwsStsSend,
} from "@/lib/integrations/aws/client";
import type { AwsCheckResult } from "@/lib/workspaces/aws-checks";

const AWS_PAGE_SIZE = 1_000;
const DEFAULT_BACKUP_WINDOW_DAYS = 7;

export type AwsCheckDeps = {
  cloudTrailSend?: AwsCloudTrailSend;
  ec2Send?: AwsEc2Send;
  now?: () => number;
  s3Send?: AwsS3Send;
  send?: AwsStsSend;
  signal?: AbortSignal;
};

const INVALID_CREDENTIAL_ERROR_NAMES = new Set([
  "AuthFailure",
  "IncompleteSignature",
  "InvalidAccessKeyId",
  "InvalidClientTokenId",
  "InvalidSignatureException",
  "MissingAuthenticationToken",
  "SignatureDoesNotMatch",
  "UnrecognizedClientException",
]);

const INSUFFICIENT_SCOPE_ERROR_NAMES = new Set([
  "AccessDenied",
  "AccessDeniedException",
  "NotAuthorized",
  "UnauthorizedOperation",
]);

function getAwsErrorName(error: unknown) {
  if (error instanceof Error && error.name) {
    return error.name;
  }

  if (typeof error === "object" && error !== null && "Code" in error) {
    const code = (error as { Code?: unknown }).Code;
    return typeof code === "string" ? code : null;
  }

  return null;
}

function getAwsStatusCode(error: unknown) {
  if (typeof error !== "object" || error === null || !("$metadata" in error)) {
    return null;
  }

  const statusCode = (error as { $metadata?: { httpStatusCode?: unknown } }).$metadata
    ?.httpStatusCode;

  return typeof statusCode === "number" ? statusCode : null;
}

export function mapAwsErrorToHealthCheck(error: unknown): HealthCheckResult {
  const name = getAwsErrorName(error);
  const statusCode = getAwsStatusCode(error);

  if (name && INVALID_CREDENTIAL_ERROR_NAMES.has(name)) {
    return "invalid_key";
  }

  if (name && INSUFFICIENT_SCOPE_ERROR_NAMES.has(name)) {
    return "insufficient_scope";
  }

  if (statusCode === 401) {
    return "invalid_key";
  }

  if (statusCode === 403) {
    return "insufficient_scope";
  }

  return "unreachable";
}

function isAwsCredential(
  credentials: StoredConnectorCredential,
): credentials is AwsStoredCredential {
  return credentials.platform === "aws";
}

function commandOptions(signal?: AbortSignal): AwsSendOptions | undefined {
  return signal ? { abortSignal: signal } : undefined;
}

function createdWithinWindow(
  value: Date | string | undefined,
  windowDays: number,
  now: number,
) {
  if (!value) {
    return false;
  }

  const createdAt = new Date(value).getTime();

  if (!Number.isFinite(createdAt)) {
    return false;
  }

  return now - createdAt <= windowDays * 24 * 60 * 60 * 1000;
}

function hasSecurityGroupRules(group: {
  IpPermissions?: unknown[];
  IpPermissionsEgress?: unknown[];
}) {
  return (
    (Array.isArray(group.IpPermissions) && group.IpPermissions.length > 0) ||
    (Array.isArray(group.IpPermissionsEgress) && group.IpPermissionsEgress.length > 0)
  );
}

export async function awsHealthProbe(
  input: {
    credentials: StoredConnectorCredential;
    signal?: AbortSignal;
  },
  deps: AwsCheckDeps = {},
): Promise<HealthCheckResult> {
  if (!isAwsCredential(input.credentials)) {
    return "invalid_key";
  }

  try {
    const send = deps.send ?? createAwsStsSend(input.credentials);
    await send(new GetCallerIdentityCommand({}), {
      abortSignal: input.signal ?? deps.signal,
    });

    return "connected";
  } catch (error) {
    return mapAwsErrorToHealthCheck(error);
  }
}

export async function checkEc2Status(
  credentials: StoredConnectorCredential,
  deps: AwsCheckDeps = {},
): Promise<AwsCheckResult> {
  if (!isAwsCredential(credentials)) {
    return "error";
  }

  try {
    const send = deps.ec2Send ?? createAwsEc2Send(credentials);
    let nextToken: string | undefined;

    do {
      const response = await send(
        new DescribeInstancesCommand({
          MaxResults: AWS_PAGE_SIZE,
          NextToken: nextToken,
        }),
        commandOptions(deps.signal),
      ) as DescribeInstancesCommandOutput;
      const hasRunningInstance = response.Reservations?.some((reservation) =>
        reservation.Instances?.some((instance) => instance.State?.Name === "running"),
      ) ?? false;

      if (hasRunningInstance) {
        return "pass";
      }

      nextToken = response.NextToken;
    } while (nextToken);

    return "gap";
  } catch {
    return "error";
  }
}

export async function checkSecurityGroupPresent(
  credentials: StoredConnectorCredential,
  deps: AwsCheckDeps = {},
): Promise<AwsCheckResult> {
  if (!isAwsCredential(credentials)) {
    return "error";
  }

  try {
    const send = deps.ec2Send ?? createAwsEc2Send(credentials);
    let nextToken: string | undefined;

    do {
      const response = await send(
        new DescribeSecurityGroupsCommand({
          MaxResults: AWS_PAGE_SIZE,
          NextToken: nextToken,
        }),
        commandOptions(deps.signal),
      ) as DescribeSecurityGroupsCommandOutput;
      const hasRules = response.SecurityGroups?.some(hasSecurityGroupRules) ?? false;

      if (hasRules) {
        return "pass";
      }

      nextToken = response.NextToken;
    } while (nextToken);

    return "gap";
  } catch {
    return "error";
  }
}

export async function checkS3BackupRecency(
  credentials: StoredConnectorCredential,
  deps: AwsCheckDeps = {},
): Promise<AwsCheckResult> {
  if (!isAwsCredential(credentials)) {
    return "error";
  }

  const bucket = credentials.backupBucketName?.trim();

  if (!bucket) {
    return "error";
  }

  try {
    const send = deps.s3Send ?? createAwsS3Send(credentials);
    const now = deps.now?.() ?? Date.now();
    let continuationToken: string | undefined;

    do {
      const response = await send(
        new ListObjectsV2Command({
          Bucket: bucket,
          ContinuationToken: continuationToken,
        }),
        commandOptions(deps.signal),
      );
      const hasRecentBackup = response.Contents?.some((object) =>
        createdWithinWindow(
          object.LastModified,
          DEFAULT_BACKUP_WINDOW_DAYS,
          now,
        ),
      ) ?? false;

      if (hasRecentBackup) {
        return "pass";
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return "gap";
  } catch {
    return "error";
  }
}

export async function checkCloudTrailEnabled(
  credentials: StoredConnectorCredential,
  deps: AwsCheckDeps = {},
): Promise<AwsCheckResult> {
  if (!isAwsCredential(credentials)) {
    return "error";
  }

  try {
    const send = deps.cloudTrailSend ?? createAwsCloudTrailSend(credentials);
    const trailsResponse = await send(
      new DescribeTrailsCommand({ includeShadowTrails: true }),
      commandOptions(deps.signal),
    ) as DescribeTrailsCommandOutput;

    for (const trail of trailsResponse.trailList ?? []) {
      const name = trail.TrailARN ?? trail.Name;

      if (!name) {
        continue;
      }

      const status = await send(
        new GetTrailStatusCommand({ Name: name }),
        commandOptions(deps.signal),
      ) as GetTrailStatusCommandOutput;

      if (status.IsLogging === true) {
        return "pass";
      }
    }

    return "gap";
  } catch {
    return "error";
  }
}

const connectorProbe: ConnectorHealthProbe = awsHealthProbe;
registerConnectorHealthProbe("aws", connectorProbe);
