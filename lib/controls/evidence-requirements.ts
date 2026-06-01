export const NIS2_EVIDENCE_REQUIREMENTS_BY_CONTROL: Record<string, string> = {
  "aws-infra-cloudtrail-logging-enabled":
    "AWS CloudTrail configuration export or console snapshot showing an active trail, IsLogging status, protected log destination, region/account scope, and date of review.",
  "aws-infra-ec2-running":
    "AWS EC2 inventory export or console snapshot showing in-scope production instances, running state, region/account scope, owner, and date of review.",
  "aws-infra-s3-backup-recent":
    "AWS S3 backup bucket listing or backup tool report showing the configured bucket, latest backup object timestamp, retention scope, owner, and date of review.",
  "aws-infra-security-group-rules-present":
    "AWS security group export or console snapshot showing relevant inbound/outbound rules, associated assets, review owner, and date of review.",
  "abra-flexi-api-config-readable":
    "ABRA Flexi API permission evidence showing the integration user, read-only scope, tested endpoint or export, owner, and date of review.",
  "abra-flexi-api-credential-rotation":
    "ABRA Flexi API credential rotation record showing credential owner, rotation interval, last rotation date, emergency revocation process, and exceptions.",
  "helios-api-credential-rotation":
    "Manual Helios API credential review record showing credential owners, rotation interval, last rotation or replacement date, revocation process, and unresolved exceptions.",
  "helios-api-edi-supplier-customer":
    "Manual Helios EDI integration inventory showing supplier/customer endpoints, data scope, access owner, transport protection, review date, and remediation items.",
  "helios-api-mes-scada-integration":
    "Manual Helios MES/SCADA integration review showing connected systems, exposed interfaces, network boundary, access owner, review date, and open risks.",
  "helios-api-network-access-control":
    "Manual network-access review for Helios APIs showing allowed sources, firewall/VPN restrictions, exposed ports, owner, review date, and exceptions.",
  "helios-api-tls-enforcement":
    "Manual Helios API transport review showing TLS or compensating network restriction, certificate/endpoint state, owner, review date, and exceptions.",
  "helios-backup-encryption":
    "Manual Helios backup review showing encryption or compensating protection for backup media, key/access owner, review date, and exceptions.",
  "helios-backup-offsite-immutable":
    "Manual Helios backup-retention review showing offsite or immutable copy location, protected scope, retention period, owner, review date, and gaps.",
  "helios-backup-restoration-test":
    "Manual Helios restore-test record showing tested backup, isolated target environment, test date, outcome, issues, and remediation actions.",
  "helios-backup-sql-agent-jobs":
    "Manual Helios SQL backup job review showing job list, protected databases, latest successful run, monitoring owner, retention, and review date.",
  "helios-iam-contractor-access-management":
    "Manual Helios contractor access review showing active external users, business owner, access expiry or review date, and removed or justified exceptions.",
  "helios-iam-inactive-session-audit":
    "Manual Helios session/access review showing inactivity settings or compensating review, reviewer, review date, and remediation for stale sessions or accounts.",
  "helios-iam-module-role-hierarchy":
    "Manual Helios role/module export or screenshot showing assigned roles, privileged modules, reviewer, review date, and least-privilege remediation items.",
  "helios-iam-offboarding":
    "Manual Helios offboarding evidence showing disabled or removed users, departure trigger, completion date, reviewer, and unresolved exceptions.",
  "helios-iam-user-accounts":
    "Manual Helios user export or screenshot showing named active accounts, shared-account exceptions, owner, last review date, and remediation items.",
  "helios-infra-deployment-type":
    "Manual Helios deployment record showing hosting model, responsible owner, protected assets, security controls in place, review date, and open gaps.",
  "helios-infra-encryption-at-rest":
    "Manual Helios data-at-rest review showing database/storage protection, encryption or compensating controls, owner, review date, and exceptions.",
  "helios-infra-network-segmentation":
    "Manual Helios network segmentation review showing network zones, allowed flows, remote access path, owner, review date, and exceptions.",
  "helios-infra-os-patch-management":
    "Manual Helios host patch review showing operating-system versions, last patch cycle, responsible owner, overdue patches, and review date.",
  "helios-infra-physical-server-room":
    "Manual Helios physical hosting review showing server-room location, access controls, responsible owner, review date, and unresolved physical-security gaps.",
  "abra-flexi-api-https":
    "ABRA Flexi API transport evidence showing HTTPS/TLS endpoint configuration or compensating VPN/local restriction, certificate state, and review date.",
  "abra-flexi-backup-api":
    "ABRA Flexi backup export or backup endpoint result showing backup scope, timestamp, retention location, owner, and date of review.",
  "abra-flexi-backup-restore-test":
    "ABRA Flexi restore-test record showing tested backup, isolated target environment, test date, result, issues, and remediation actions.",
  "abra-flexi-backup-schedule":
    "ABRA Flexi backup schedule evidence showing frequency, retention, storage location, monitoring owner, and last successful run.",
  "abra-flexi-iam-least-privilege":
    "ABRA Flexi role or permission export showing assigned roles, business rationale, privileged accounts, reviewer, and remediation of excessive access.",
  "abra-flexi-iam-offboarding":
    "ABRA Flexi offboarding evidence showing disabled users or removed API access, departure trigger, completion date, and reviewer.",
  "abra-flexi-iam-user-accounts":
    "ABRA Flexi user export showing active named accounts, shared-account exceptions, last review date, and owner for remediation.",
  "abra-flexi-infra-database-protected":
    "ABRA Flexi database or host protection evidence showing encryption or access controls, patch state, backup owner, and review date.",
  "abra-flexi-infra-deployment-secured":
    "ABRA Flexi deployment record showing hosting model, responsible owner, protected assets, security controls in place, and review date.",
  "abra-flexi-infra-network-restricted":
    "ABRA Flexi network access evidence showing firewall/VPN/HTTPS restrictions, allowed sources, exposed ports, owner, and review date.",
  "hetzner-infra-firewall-present":
    "Hetzner firewall export or console snapshot showing inbound/outbound rules, associated servers, rule owner, and date of review.",
  "hetzner-infra-server-running":
    "Hetzner Cloud server inventory or API result showing in-scope production servers, running state, owner, and date of review.",
  "hetzner-infra-snapshot-recent":
    "Hetzner snapshot or backup evidence showing latest snapshot timestamp, covered server or volume, retention location, owner, and date of review.",
  "ovhcloud-infra-backup-present":
    "OVHcloud backup storage or backup job evidence showing protected server, latest backup timestamp, retention location, owner, and date of review.",
  "ovhcloud-infra-firewall-enabled":
    "OVHcloud firewall or network protection evidence showing enabled rules, protected server, allowed traffic, owner, and date of review.",
  "ovhcloud-infra-server-operational":
    "OVHcloud server inventory or API result showing in-scope dedicated server, operational state, owner, and date of review.",
  ctrl_asset_inventory:
    "Asset inventory export listing in-scope systems, owners, classification or criticality, last review date, and excluded assets with rationale.",
  ctrl_backup_tested:
    "Backup job report, restore-test record, tested scope, result, date, owner, and follow-up actions for failed tests.",
  ctrl_branch_protection_enabled:
    "Repository branch protection export showing required reviews, required status checks, direct-push restrictions, and admin enforcement.",
  ctrl_business_continuity_plan:
    "Approved business continuity plan showing critical services, owners, recovery priorities, dependencies, and review date.",
  ctrl_change_management:
    "Change record showing requester, risk assessment, approval, implementation date, rollback plan, and post-change validation.",
  ctrl_cloudtrail_enabled:
    "Cloud audit logging configuration export showing enabled trails/log sources, protected destination, retention, and recent event delivery.",
  ctrl_code_review_required:
    "Repository settings or pull-request evidence showing required peer review, protected review flow, and sample merged change with approval.",
  ctrl_conditional_access:
    "Conditional-access policy export showing risky sign-in handling, targeted users/groups, enforcement mode, and last change date.",
  ctrl_cryptography_policy:
    "Approved cryptography policy covering encryption, key management, algorithm choices, rotation, certificate handling, and exceptions.",
  ctrl_data_encrypted_at_rest:
    "System or cloud configuration snapshot showing encryption at rest for in-scope stores, key ownership, and documented exceptions.",
  ctrl_dependency_vulnerability_monitoring:
    "Dependency scanning configuration and vulnerability report showing open findings, severity, owner, and remediation status.",
  ctrl_device_encryption:
    "Device-management export showing encryption status for managed devices, recovery-key custody, and remediation list for non-compliant devices.",
  ctrl_disaster_recovery_test:
    "Disaster-recovery test plan and result record showing scenario, systems tested, recovery outcome, issues, and remediation actions.",
  ctrl_endpoint_protection:
    "Endpoint-protection console export showing active coverage, malware protection status, update status, and unmanaged-device exceptions.",
  ctrl_guest_access_controlled:
    "Guest-user export showing active, stale, and disabled external accounts, with review outcome and removal evidence for stale access.",
  ctrl_incident_72h_notification:
    "Incident notification procedure, severity decision record, notification timeline template, and sample or test record showing 24/72-hour workflow tracking.",
  ctrl_incident_plan_documented:
    "Approved incident response plan with roles, escalation paths, communication channels, review date, and evidence of at least one exercise or tabletop.",
  ctrl_logging_monitoring:
    "Logging architecture or tool export showing in-scope sources, retention, access controls, alert routing, and recent log ingestion status.",
  ctrl_mfa_all_users:
    "Automated identity-provider snapshot showing MFA state for active user accounts, plus exception list with owner and review date.",
  ctrl_network_segmentation:
    "Network diagram or firewall policy export showing segmentation boundaries, allowed flows, remote access controls, and review date.",
  ctrl_password_policy:
    "Identity-provider policy export showing password length, lockout, reuse, and reset rules, plus exception handling if applicable.",
  ctrl_patch_management:
    "Patch policy, vulnerability or update dashboard export, remediation SLA, and sample ticket evidence for overdue critical patches.",
  ctrl_penetration_test_annual:
    "Penetration-test report or executive summary, scope, test date, findings register, and remediation tracking evidence.",
  ctrl_physical_access_control:
    "Physical access policy, access list or badge export, visitor process, review record, and removal evidence for obsolete access.",
  ctrl_privileged_access_reviewed:
    "Privileged-role export, access review record, reviewer approval, and remediation evidence for removed or justified privileged access.",
  ctrl_root_account_mfa:
    "Root or break-glass account configuration evidence showing MFA enabled, owner, emergency access process, and last access review.",
  ctrl_s3_encryption:
    "Object storage configuration export showing default encryption, public-access block status, key settings, and non-compliant bucket remediation list.",
  ctrl_secrets_management:
    "Secret-scanning configuration, sample alert or clean scan report, key storage policy, and remediation evidence for any detected secret.",
  ctrl_secure_configuration_baseline:
    "Approved configuration baseline, compliance scan or settings export, exception list, and remediation evidence for drift.",
  ctrl_security_event_alerting:
    "Alert rule export showing triggering conditions, notification route, owner, last test or recent alert, and response outcome.",
  ctrl_security_training_annual:
    "Training policy or plan, completion report for in-scope staff, training content version, and exception follow-up list.",
  ctrl_supplier_contract_security:
    "Contract clause checklist or executed agreement showing security requirements, incident notice, audit rights, data protection, and continuity obligations.",
  ctrl_vendor_security_assessment:
    "Vendor risk assessment record for critical suppliers, risk rating, reviewer decision, review date, and required remediation actions.",
  ctrl_vulnerability_management:
    "Vulnerability register showing source, severity, affected asset, owner, due date, status, and closure evidence for remediated findings.",
};
