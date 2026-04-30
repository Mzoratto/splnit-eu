export function getAwsCloudFormationTemplate(externalId: string) {
  const trustedAccountId = process.env.AWS_CONNECT_ACCOUNT_ID ?? "000000000000";
  const safeExternalId = JSON.stringify(externalId);
  const safeTrustedAccountId = JSON.stringify(trustedAccountId);

  return `AWSTemplateFormatVersion: "2010-09-09"
Description: Read-only Splnit.eu compliance audit role.
Parameters:
  ExternalId:
    Type: String
    Default: ${safeExternalId}
  SplnitAccountId:
    Type: String
    Default: ${safeTrustedAccountId}
Resources:
  SplnitSecurityAuditRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: !Sub "splnit-security-audit-\${AWS::AccountId}"
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              AWS: !Sub "arn:aws:iam::\${SplnitAccountId}:root"
            Action: "sts:AssumeRole"
            Condition:
              StringEquals:
                "sts:ExternalId": !Ref ExternalId
      ManagedPolicyArns:
        - "arn:aws:iam::aws:policy/SecurityAudit"
      Policies:
        - PolicyName: SplnitReadOnlyChecks
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              - Effect: Allow
                Action:
                  - "cloudtrail:DescribeTrails"
                  - "cloudtrail:GetTrailStatus"
                  - "ec2:DescribeFlowLogs"
                  - "ec2:DescribeVpcs"
                  - "iam:GetAccountSummary"
                  - "iam:ListMFADevices"
                  - "iam:ListUsers"
                  - "s3:GetBucketEncryption"
                  - "s3:ListAllMyBuckets"
                Resource: "*"
Outputs:
  RoleArn:
    Description: Role ARN to paste into Splnit.eu.
    Value: !GetAtt SplnitSecurityAuditRole.Arn
`;
}
