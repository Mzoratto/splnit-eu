export const AWS_TEST_DEFINITIONS = [
  {
    checkLogic: "check_cloudtrail_enabled",
    controlKey: "ctrl_cloudtrail_enabled",
    name: "CloudTrail logging enabled",
    passCriteria: "At least one multi-region CloudTrail trail is logging.",
  },
  {
    checkLogic: "check_s3_encryption",
    controlKey: "ctrl_s3_encryption",
    name: "S3 default encryption",
    passCriteria: "Active S3 buckets have default server-side encryption.",
  },
  {
    checkLogic: "check_iam_mfa",
    controlKey: "ctrl_mfa_all_users",
    name: "IAM user MFA",
    passCriteria: "IAM users have at least one MFA device assigned.",
  },
  {
    checkLogic: "check_root_account_mfa",
    controlKey: "ctrl_root_account_mfa",
    name: "Root account MFA",
    passCriteria: "The AWS account summary reports root account MFA enabled.",
  },
  {
    checkLogic: "check_vpc_flow_logs",
    controlKey: "ctrl_logging_monitoring",
    name: "VPC Flow Logs",
    passCriteria: "Every VPC in the configured region has an active flow log.",
  },
] as const;
