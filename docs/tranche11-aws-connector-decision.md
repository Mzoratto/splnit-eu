# Tranche 11 AWS Connector Decision

Date: 2026-05-22
Status: Phase 2 credential extension implemented; Phase 3 not started

This document captures the pre-implementation decisions for the Tranche 11 AWS connector workspace.

Reviewer sign-off, 2026-05-22:
- Proceed with option 1: replace the existing role-based AWS integration with the API-key connector under provider/platform id `aws`.
- Do not keep a second `aws-api-key` provider.
- Proceed with Phase 2 using the API-key connector base.
- Phase 3 uses `backupBucketName` only. Do not include `backupPrefix` in the AWS workspace config or credential shape.
- Rationale: Splnit.eu users are small companies that can realistically create IAM access keys with read-only policy; CloudFormation plus external ID role onboarding is enterprise-heavy and inconsistent with Hetzner, OVHcloud, and ABRA Flexi.

## Existing Repo State

- AWS SDK packages are already installed in `package.json`: `@aws-sdk/client-ec2`, `@aws-sdk/client-s3`, `@aws-sdk/client-iam`, `@aws-sdk/client-cloudtrail`, and `@aws-sdk/client-sts`.
- The generic API-key connector base currently supports `hetzner`, `ovhcloud`, and `abra-flexi` in `lib/connectors/api-key-base/types.ts`, `storage.ts`, `actions.ts`, and `health.ts`.
- Existing multi-field credential storage is proven by OVHcloud: primary key material in `accessTokenEnc`, secondary secret in `refreshTokenEnc`, and extra encrypted/plain config in `integrations.config`.
- There is already an AWS integration under `app/(app)/integrations/aws` and `lib/integrations/aws`, but it is role-based: `roleArn` + `externalId` + `AssumeRole`, not direct IAM access keys. It already owns provider id `aws` in the integrations runner registry.
- Evidence source currently uses `EvidenceSource = "connector" | "manual" | "intake" | "imported"`. There is no existing `api` source value. Automated connector evidence should therefore continue to use `source="connector"` with `confidence="high"` unless a separate schema/type migration is explicitly approved.

## Phase 0 AWS API Decisions

### STS Health Probe

Decision: use `STSClient.send(new GetCallerIdentityCommand({}))` as the pre-storage health probe.

Behavior:
- Success returns `Account`, `Arn`, and `UserId`; store `accountId` and `principalArn` in non-secret config for display/audit if needed.
- AWS documents that no IAM permission is required for `sts:GetCallerIdentity`. That means insufficient read permissions for EC2/S3/CloudTrail cannot be fully detected by the health probe.
- Map credential/signing failures such as `UnrecognizedClientException`, `InvalidClientTokenId`, `AuthFailure`, `IncompleteSignature`, `MissingAuthenticationToken`, and `SignatureDoesNotMatch` to `invalid_key`.
- Map `AccessDenied`, `AccessDeniedException`, `UnauthorizedOperation`, or `NotAuthorized` to `insufficient_scope` when any AWS SDK call returns them. This will usually surface during Layer 1 checks, not STS.
- Map timeout, DNS, network errors, AWS 5xx service failures, and SDK aborts to `unreachable`.

### EC2 Instance Running Check

Decision: call `DescribeInstancesCommand` with pagination.

Implementation contract:
- Use `MaxResults` and iterate `NextToken` until absent.
- Treat pass as any `Reservations[].Instances[].State.Name === "running"`.
- Treat no running instances as `gap`.
- Treat SDK/access/network failures as `error`, letting the workspace show manual fallback.

### Security Group Rules Check

Decision: call `DescribeSecurityGroupsCommand` with pagination.

Implementation contract:
- Use `MaxResults` and iterate `NextToken` until absent.
- Treat pass as any security group with `IpPermissions.length > 0` or `IpPermissionsEgress.length > 0`.
- This is a presence check, not a firewall quality check. The default allow-all egress rule can satisfy it. A stricter exposure check should be a later tranche if needed.
- Treat no non-empty rules as `gap`; treat SDK/access/network failures as `error`.

### S3 Backup Recency Check

Decision: the user must provide a target S3 bucket name. Do not scan all buckets.

Implementation contract:
- `backupBucketName` is optional in the credential config. If absent, skip the API check and leave the control on manual fallback.
- Do not add `backupPrefix` in Phase 3; the check lists the configured bucket root.
- Use `ListObjectsV2Command({ Bucket, ContinuationToken })`.
- Iterate `NextContinuationToken` until absent or until a recent object is found.
- Treat pass as any `Contents[].LastModified` within the configured window, default 7 days.
- Treat no recent object as `gap`; treat missing bucket permission or network failure as `error`.

### CloudTrail Logging Check

Decision: `DescribeTrailsCommand` alone is insufficient; use `GetTrailStatusCommand` per trail.

Implementation contract:
- Call `DescribeTrailsCommand({ includeShadowTrails: true })`.
- For each trail with `TrailARN` or `Name`, call `GetTrailStatusCommand({ Name: trail.TrailARN ?? trail.Name })`.
- Treat pass as any trail with `IsLogging === true`.
- Do not require multi-region trails for Tranche 11 because the stated control is "at least one CloudTrail trail is enabled and logging." The existing older AWS adapter requires multi-region trails, but that is not part of this tranche's Layer 1 definition.
- Treat no logging trails as `gap`; treat SDK/access/network failures as `error`.

### S3 Versioning Hybrid Check

Decision: Layer 3 can use `GetBucketVersioningCommand` against the same `backupBucketName` when configured.

Implementation contract:
- `Status === "Enabled"` passes.
- `Status === "Suspended"` or missing `Status` is a gap.
- Missing `backupBucketName` leaves the control on manual attestation.

## Phase 1 Credential Spec

### Connector Platform

Extend the API-key connector platform union:

```ts
export type ConnectorPlatform =
  | "hetzner"
  | "ovhcloud"
  | "abra-flexi"
  | "aws";
```

### Credential Input

Proposed contract:

```ts
export type AwsCredentialInput = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  backupBucketName?: string | null;
};
```

Reviewer decision: `backupBucketName` only. `backupPrefix` is intentionally out of Phase 3.

### Stored Credential

Add an AWS discriminated union variant to both `ConnectorCredentialInput` and `StoredConnectorCredential`:

```ts
| ({
    platform: "aws";
  } & AwsCredentialInput)
```

Storage mapping:
- `accessTokenEnc`: encrypted `accessKeyId`
- `refreshTokenEnc`: encrypted `secretAccessKey`
- `config.region`: normalized AWS region
- `config.backupBucketName`: optional bucket name
- `config.accountId`: STS account id from health probe, optional
- `config.principalArn`: STS ARN from health probe, optional
- `config.credentialType`: `aws_iam_access_key`
- `config.tokenType`: `api_key`

No database migration is expected if `integrations.config` remains the storage location for bucket/prefix metadata.

### Connect Flow

UI:
- Present fields for Access Key ID, Secret Access Key, Region, and optional Backup Bucket Name.
- Secret Access Key uses password input and is never echoed back.
- Show health probe errors using the existing blocked states: `invalid_key`, `insufficient_scope`, `unreachable`, `not_connected`.

Server:
- Validate all fields with Zod before calling AWS.
- Region should match standard region shape, e.g. `/^[a-z]{2}-[a-z-]+-\d$/`.
- Bucket name should be trimmed, optional, and length-limited. Avoid overly strict bucket validation unless AWS SDK rejects it, because legacy bucket naming edge cases exist.
- Run `awsHealthProbe` before storage.
- Store only after STS returns `connected`.
- Acquire the existing per-org/provider lock before validation/storage, as `validateAndStoreCredential` already does for API-key connectors.
- Write audit log metadata without the access key or secret.

### Disconnect Flow

Use `disconnectApiKeyConnectorAction("aws")`.

Expected behavior:
- Remove or mark the AWS integration as disconnected through the existing integration disconnect query.
- Revalidate `/dashboard`, `/controls`, `/integrations`, `/integrations/aws`, `/workspaces/aws`, and `/settings/audit-log`.
- Existing evidence should remain historical, but current automated collection should stop. Workspace controls should show manual fallback where no current connector evidence exists.
- Audit log action: `integration.disconnected` with provider `aws`.

### Rotation Flow

Use `rotateApiKeyConnectorAction({ platform: "aws", ... })`.

Expected behavior:
- Validate the new credentials with STS before replacing stored credentials.
- If health probe fails, keep the existing stored credentials unchanged and return the mapped error.
- If health probe passes, replace encrypted access key id/secret and config fields atomically through existing upsert storage.
- Re-run AWS checks after successful rotation through the existing integration runner path.
- Audit log action: `integration.rotated` with provider `aws`, no key material.

### Blocked Permission States

Use the existing API-key blocked states:

- `not_connected`: no stored AWS credential; show connect form and manual fallback.
- `invalid_key`: AWS rejects the access key, secret, signature, token, or credential identity.
- `insufficient_scope`: credentials are valid but missing one or more required permissions for EC2, S3, CloudTrail, or STS.
- `unreachable`: timeout, DNS/network failure, AWS temporary outage, SDK abort, or lock contention fallback.

Reviewer note: because `GetCallerIdentity` requires no permission, `insufficient_scope` should be tested mainly through mocked Layer 1 calls, not only the STS health probe.

## Required Permissions

Minimum policy actions for Tranche 11:

- `sts:GetCallerIdentity`
- `ec2:DescribeInstances`
- `ec2:DescribeSecurityGroups`
- `s3:ListBucket` on the configured backup bucket
- `s3:GetBucketVersioning` on the configured backup bucket, if Layer 3 versioning automation is included in this tranche
- `cloudtrail:DescribeTrails`
- `cloudtrail:GetTrailStatus`

## Existing AWS Integration Decision

Reviewer decision: option 1 is approved.

1. Replace the existing role-based AWS integration with the Tranche 11 API-key connector under provider/platform id `aws`.
2. Keep the role-based integration and give the new API-key connector a distinct provider id, such as `aws-api-key`.

The tranche plan explicitly says AWS should follow the API-key connector base. Keeping two AWS providers adds UI ambiguity, doubles test definitions, and conflicts with the existing unique per-org/provider integration storage.

If option 1 is approved, Phase 2 must include cleanup or adaptation of:
- `app/(app)/integrations/aws/page.tsx` - adapted to IAM access key fields.
- `app/(app)/integrations/aws/actions.ts` - adapted to API-key connector actions.
- `lib/integrations/aws/client.ts` - removed with the role-based flow.
- `lib/integrations/aws/cloudformation.ts` - removed with the role-based flow.
- `lib/integrations/aws/tests.ts` - neutralized until Phase 4 check wiring.
- `lib/integrations/aws/test-definitions.ts` - old role-era definitions removed until Phase 4.
- `scripts/seed.ts` - existing import remains compatible with an empty typed definition list.
- provider copy in `messages/*.json` - updated to IAM access key copy.

## Carry-Over Patterns From Hetzner

Directly reusable:
- Per-org/provider lock through `acquireIntegrationRunLock`.
- Health probe registry through `registerConnectorHealthProbe`.
- Check result shape: `pass | gap | error`.
- Adapter mapping from check result to `TestResult`.
- Manual fallback on `error`.
- Workspace config fields: `automatable`, `apiEndpoint`, `apiField`, `apiExpected`, `evidenceType: "both"`.
- Smoke script style from `scripts/smoke-hetzner-checks.ts`.

Needs AWS-specific implementation:
- AWS SDK clients instead of `fetch`.
- Pagination for EC2, security groups, and S3.
- AWS SDK exception-name mapping.
- Bucket/prefix config and no full-account S3 scan.
- CloudTrail status requires a second call per trail.

## Reviewer Sign-Off Checklist

- [x] Credential shape approved for Phase 2/3: `backupBucketName` only, no `backupPrefix`.
- [x] Provider id decision made for existing role-based AWS integration: use `aws`.
- [x] `source="connector"` accepted as the implementation equivalent of the plan's `source=api`, with no schema migration in Phase 2.
- [x] Disconnect and rotation flows accepted.
- [x] Blocked states accepted, including the limitation that STS does not prove EC2/S3/CloudTrail permissions.
- [x] S3 bucket input is optional with manual fallback when absent.
- [x] CloudTrail enabled check uses `GetTrailStatusCommand` and `IsLogging` in Phase 4.

## Sources

- AWS SDK for JavaScript v3 credentials: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials.html
- AWS SDK for JavaScript v3 region configuration: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-region.html
- STS `GetCallerIdentity`: https://docs.aws.amazon.com/STS/latest/APIReference/API_GetCallerIdentity.html
- STS common errors: https://docs.aws.amazon.com/STS/latest/APIReference/CommonErrors.html
- EC2 `DescribeInstances`: https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeInstances.html
- EC2 `DescribeSecurityGroups`: https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeSecurityGroups.html
- EC2 common errors: https://docs.aws.amazon.com/AWSEC2/latest/APIReference/errors-overview.html
- S3 `ListObjectsV2`: https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html
- S3 `GetBucketVersioning`: https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketVersioning.html
- S3 error responses: https://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html
- CloudTrail `DescribeTrails`: https://docs.aws.amazon.com/awscloudtrail/latest/APIReference/API_DescribeTrails.html
- CloudTrail `GetTrailStatus`: https://docs.aws.amazon.com/awscloudtrail/latest/APIReference/API_GetTrailStatus.html
