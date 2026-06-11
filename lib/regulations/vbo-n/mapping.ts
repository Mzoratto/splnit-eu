/**
 * Human-reviewed mapping of existing control-library keys to VBO-N baseline
 * IDs. Reviewed and confirmed by the owner on 2026-06-11 — see
 * docs/briefs/AUDIT-vbo-n.md § 7 for the rationale per row.
 *
 * `fit: "partial"` means the existing control only loosely covers the
 * baseline requirement; a baseline ID with any partial mapping can never be
 * reported better than `partial` (conservative by design).
 *
 * Baseline IDs with no entry here surface in the gap view. N-4-01/02/06
 * additionally have record-based rules (Vrcholné vedení module, task A3).
 */

export type VboNMappingFit = "direct" | "partial";

export type VboNControlMapping = {
  baselineId: string;
  controlKey: string;
  fit: VboNMappingFit;
};

export const VBO_N_CONTROL_MAPPINGS: readonly VboNControlMapping[] = [
  { baselineId: "N-3.1-02", controlKey: "ctrl_security_policy_approved", fit: "direct" },
  { baselineId: "N-3.1-03", controlKey: "ctrl_media_disposal", fit: "partial" },
  { baselineId: "N-3.1-04", controlKey: "ctrl_supplier_contract_security", fit: "direct" },
  { baselineId: "N-3.1-05", controlKey: "ctrl_secure_development_policy", fit: "partial" },
  { baselineId: "N-4-01", controlKey: "ctrl_security_roles_responsibilities", fit: "partial" },
  { baselineId: "N-4-04", controlKey: "ctrl_management_review", fit: "direct" },
  { baselineId: "N-5-01", controlKey: "ctrl_security_policy_approved", fit: "partial" },
  { baselineId: "N-5-02", controlKey: "ctrl_security_training_annual", fit: "direct" },
  { baselineId: "N-5-02", controlKey: "ctrl_password_policy", fit: "direct" },
  { baselineId: "N-5-03", controlKey: "ctrl_security_training_annual", fit: "partial" },
  { baselineId: "N-6-01", controlKey: "ctrl_business_continuity_plan", fit: "direct" },
  { baselineId: "N-6-02", controlKey: "ctrl_business_continuity_plan", fit: "partial" },
  { baselineId: "N-6-02", controlKey: "ctrl_incident_plan_documented", fit: "partial" },
  { baselineId: "N-6-03", controlKey: "ctrl_backup_policy", fit: "direct" },
  { baselineId: "N-6-03", controlKey: "ctrl_backup_tested", fit: "direct" },
  { baselineId: "N-10-01", controlKey: "ctrl_incident_plan_documented", fit: "partial" },
  { baselineId: "N-10-02", controlKey: "ctrl_incident_plan_documented", fit: "partial" },
  { baselineId: "N-10-03", controlKey: "ctrl_logging_monitoring", fit: "direct" },
  { baselineId: "N-10-03", controlKey: "ctrl_security_event_alerting", fit: "direct" },
  { baselineId: "N-10-04", controlKey: "ctrl_incident_72h_notification", fit: "direct" },
  { baselineId: "V-7-01", controlKey: "ctrl_identity_lifecycle_policy", fit: "direct" },
  { baselineId: "V-7-01", controlKey: "ctrl_privileged_access_reviewed", fit: "direct" },
  { baselineId: "V-7-02", controlKey: "ctrl_identity_lifecycle_policy", fit: "partial" },
  { baselineId: "V-7-03", controlKey: "ctrl_mobile_device_management", fit: "direct" },
  { baselineId: "V-7-04", controlKey: "ctrl_privileged_access_reviewed", fit: "direct" },
  { baselineId: "V-7-04", controlKey: "ctrl_guest_access_controlled", fit: "direct" },
  { baselineId: "V-7-05", controlKey: "ctrl_offboarding_access_revoked", fit: "direct" },
  { baselineId: "V-7-06", controlKey: "ctrl_physical_access_control", fit: "direct" },
  { baselineId: "V-8-01", controlKey: "ctrl_password_policy", fit: "partial" },
  { baselineId: "V-8-01", controlKey: "ctrl_identity_lifecycle_policy", fit: "partial" },
  { baselineId: "V-8-02", controlKey: "ctrl_mfa_all_users", fit: "direct" },
  { baselineId: "V-8-02", controlKey: "ctrl_password_policy", fit: "direct" },
  { baselineId: "V-9-02", controlKey: "ctrl_endpoint_protection", fit: "direct" },
  { baselineId: "V-9-04", controlKey: "ctrl_security_event_alerting", fit: "direct" },
  { baselineId: "V-9-05", controlKey: "ctrl_endpoint_protection", fit: "partial" },
  { baselineId: "V-9-06", controlKey: "ctrl_logging_monitoring", fit: "direct" },
  { baselineId: "V-9-07", controlKey: "ctrl_data_retention_schedule", fit: "partial" },
  { baselineId: "V-9-07", controlKey: "ctrl_logging_monitoring", fit: "partial" },
  { baselineId: "V-11-01", controlKey: "ctrl_network_segmentation", fit: "direct" },
  { baselineId: "V-11-02", controlKey: "ctrl_network_segmentation", fit: "partial" },
  { baselineId: "V-11-03", controlKey: "ctrl_information_transfer_rules", fit: "partial" },
  { baselineId: "V-11-04", controlKey: "ctrl_remote_work_policy", fit: "direct" },
  { baselineId: "V-11-04", controlKey: "ctrl_conditional_access", fit: "direct" },
  { baselineId: "V-12-01", controlKey: "ctrl_patch_management", fit: "direct" },
  { baselineId: "V-12-02", controlKey: "ctrl_asset_inventory", fit: "partial" },
  { baselineId: "V-12-02", controlKey: "ctrl_vulnerability_management", fit: "partial" },
  { baselineId: "V-12-03", controlKey: "ctrl_vulnerability_management", fit: "direct" },
  { baselineId: "V-12-03", controlKey: "ctrl_dependency_vulnerability_monitoring", fit: "direct" },
  { baselineId: "V-13-01", controlKey: "ctrl_cryptography_policy", fit: "direct" },
];

/** Baseline IDs mapped for a given control key — feeds `ControlSeed.baselineRefs`. */
export function getBaselineRefsForControl(controlKey: string): string[] {
  return VBO_N_CONTROL_MAPPINGS.filter(
    (mapping) => mapping.controlKey === controlKey,
  ).map((mapping) => mapping.baselineId);
}

/** Mappings grouped by baseline ID — feeds the coverage computation. */
export function getMappingsByBaselineId(): Map<string, VboNControlMapping[]> {
  const byId = new Map<string, VboNControlMapping[]>();

  for (const mapping of VBO_N_CONTROL_MAPPINGS) {
    const existing = byId.get(mapping.baselineId) ?? [];
    existing.push(mapping);
    byId.set(mapping.baselineId, existing);
  }

  return byId;
}
