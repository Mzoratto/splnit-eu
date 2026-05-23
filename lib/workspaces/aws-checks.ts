export type AwsCheckResult = "pass" | "gap" | "error";

export type AwsLayer1CheckId =
  | "ec2_instance_running"
  | "security_group_rules_present"
  | "s3_backup_recent"
  | "cloudtrail_logging_enabled";

export type AwsAutomatedCheckContract = {
  checkId: AwsLayer1CheckId | "s3_bucket_versioning_enabled";
  command: string;
  controlKey: string;
  expected: string;
  field: string;
  sdkClient: string;
};

export const AWS_LAYER1_CHECKS = [
  {
    checkId: "ec2_instance_running",
    command: "DescribeInstancesCommand",
    controlKey: "aws-infra-ec2-running",
    expected: "at least one instance state is running",
    field: "Reservations[*].Instances[*].State.Name",
    sdkClient: "@aws-sdk/client-ec2",
  },
  {
    checkId: "security_group_rules_present",
    command: "DescribeSecurityGroupsCommand",
    controlKey: "aws-infra-security-group-rules-present",
    expected: "IpPermissions.length > 0 or IpPermissionsEgress.length > 0",
    field: "SecurityGroups[*].IpPermissions | SecurityGroups[*].IpPermissionsEgress",
    sdkClient: "@aws-sdk/client-ec2",
  },
  {
    checkId: "s3_backup_recent",
    command: "ListObjectsV2Command",
    controlKey: "aws-infra-s3-backup-recent",
    expected: "Contents[*].LastModified within 7 days in configured backupBucketName",
    field: "Contents[*].LastModified",
    sdkClient: "@aws-sdk/client-s3",
  },
  {
    checkId: "cloudtrail_logging_enabled",
    command: "DescribeTrailsCommand + GetTrailStatusCommand",
    controlKey: "aws-infra-cloudtrail-logging-enabled",
    expected: "at least one trail status has IsLogging === true",
    field: "trailList[*].TrailARN -> GetTrailStatusCommand.IsLogging",
    sdkClient: "@aws-sdk/client-cloudtrail",
  },
] as const satisfies readonly AwsAutomatedCheckContract[];

export const AWS_LAYER3_CHECKS = [
  {
    checkId: "s3_bucket_versioning_enabled",
    command: "GetBucketVersioningCommand",
    controlKey: "aws-backup-s3-versioning-enabled",
    expected: "Status === Enabled for configured backupBucketName",
    field: "Status",
    sdkClient: "@aws-sdk/client-s3",
  },
] as const satisfies readonly AwsAutomatedCheckContract[];
