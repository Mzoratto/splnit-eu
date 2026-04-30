export const GITHUB_TEST_DEFINITIONS = [
  {
    checkLogic: "check_2fa_enforced",
    controlKey: "ctrl_mfa_all_users",
    name: "GitHub 2FA enforcement",
    passCriteria: "The GitHub organisation requires two-factor authentication.",
  },
  {
    checkLogic: "check_branch_protection",
    controlKey: "ctrl_code_review_required",
    name: "Default branch protection",
    passCriteria: "Default branches require protection rules on active repositories.",
  },
  {
    checkLogic: "check_secret_scanning",
    controlKey: "ctrl_secrets_management",
    name: "Secret scanning enabled",
    passCriteria: "Secret scanning is enabled on active repositories.",
  },
  {
    checkLogic: "check_dependency_alerts",
    controlKey: "ctrl_dependency_vulnerability_monitoring",
    name: "Dependency alerts enabled",
    passCriteria: "Dependency vulnerability alerts are enabled on active repositories.",
  },
  {
    checkLogic: "check_code_scanning",
    controlKey: "ctrl_code_review_required",
    name: "Code scanning available",
    passCriteria: "Code scanning alerts API is available on active repositories.",
  },
] as const;
