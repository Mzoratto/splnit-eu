type AwsTestDefinition = {
  checkLogic: string;
  controlKey: string;
  name: string;
  passCriteria: string;
};

export const AWS_TEST_DEFINITIONS: readonly AwsTestDefinition[] = [
  {
    checkLogic: "aws_ec2_instance_running",
    controlKey: "aws-infra-ec2-running",
    name: "AWS: EC2 instance běží",
    passCriteria: "Alespoň jedna posuzovaná EC2 instance je ve stavu running.",
  },
  {
    checkLogic: "aws_security_group_rules_present",
    controlKey: "aws-infra-security-group-rules-present",
    name: "AWS: security group pravidla existují",
    passCriteria:
      "Alespoň jedna AWS security group má příchozí nebo odchozí pravidlo.",
  },
  {
    checkLogic: "aws_s3_backup_recent",
    controlKey: "aws-infra-s3-backup-recent",
    name: "AWS: poslední S3 záloha je aktuální",
    passCriteria:
      "V nakonfigurovaném S3 backup bucketu existuje objekt změněný v posledních 7 dnech.",
  },
  {
    checkLogic: "aws_cloudtrail_logging_enabled",
    controlKey: "aws-infra-cloudtrail-logging-enabled",
    name: "AWS: CloudTrail aktivně loguje",
    passCriteria: "Alespoň jeden CloudTrail trail má aktivní stav IsLogging.",
  },
] as const;
