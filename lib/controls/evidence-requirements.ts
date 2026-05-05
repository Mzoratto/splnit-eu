export const NIS2_EVIDENCE_REQUIREMENTS_BY_CONTROL: Record<string, string> = {
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
