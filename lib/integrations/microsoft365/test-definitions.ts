export const MICROSOFT365_TEST_DEFINITIONS = [
  {
    checkLogic: "check_mfa_enabled",
    controlKey: "ctrl_mfa_all_users",
    name: "Microsoft 365 MFA enabled",
    passCriteria: "All active users have at least one MFA method.",
  },
  {
    checkLogic: "check_conditional_access",
    controlKey: "ctrl_conditional_access",
    name: "Conditional Access policies enabled",
    passCriteria: "At least one Conditional Access policy is enabled.",
  },
  {
    checkLogic: "check_guest_users",
    controlKey: "ctrl_guest_access_controlled",
    name: "Guest users reviewed",
    passCriteria: "No guest users are stale for 90+ days.",
  },
  {
    checkLogic: "check_privileged_roles",
    controlKey: "ctrl_privileged_access_reviewed",
    name: "Privileged roles reviewed",
    passCriteria: "Global Administrator count is three or fewer.",
  },
  {
    checkLogic: "check_sensitivity_labels",
    controlKey: "ctrl_data_classification",
    name: "Sensitivity labels configured",
    passCriteria: "At least one sensitivity label exists.",
  },
  {
    checkLogic: "check_security_training",
    controlKey: "ctrl_security_training_annual",
    name: "Security training evidence",
    passCriteria: "Training assignments or manual evidence are available.",
  },
] as const;
