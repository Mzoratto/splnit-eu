export type PlanKey = "free" | "sme" | "agency";

export type Plan = {
  featured?: boolean;
  href: string;
  key: PlanKey;
};

export type ComparisonCell =
  | "-"
  | "✓"
  | "1"
  | "3"
  | "5"
  | "25"
  | "optional"
  | "lite"
  | "soon"
  | "selected"
  | "unlimited";

export type ComparisonGroupKey =
  | "regulations"
  | "integrations"
  | "automation"
  | "documents"
  | "trustCenter"
  | "team"
  | "support";

export type ComparisonFeatureKey =
  | "nis2"
  | "euAiAct"
  | "gdpr"
  | "iso27001"
  | "csrd"
  | "dora"
  | "microsoft365"
  | "github"
  | "aws"
  | "hetznerCloud"
  | "ovhcloud"
  | "abraFlexi"
  | "czechErpWorkspaces"
  | "googleWorkspace"
  | "nukibFeed"
  | "automatedChecks"
  | "automatedEvidence"
  | "failureAlerts"
  | "scheduler"
  | "policyTemplates"
  | "pdfGeneration"
  | "trainingTemplates"
  | "auditorExport"
  | "publicPage"
  | "ndaGate"
  | "subdomain"
  | "customDomain"
  | "userCount"
  | "rolesPermissions"
  | "ssoSaml"
  | "email"
  | "priorityEmail"
  | "dedicatedCsm"
  | "sla";

export type ComparisonRow = {
  cells: ComparisonCell[];
  key: ComparisonFeatureKey;
};

export type ComparisonGroup = {
  key: ComparisonGroupKey;
  rows: ComparisonRow[];
};

export const plans: Plan[] = [
  {
    href: "/sign-up",
    key: "free",
  },
  {
    featured: true,
    href: "/settings/billing",
    key: "sme",
  },
  {
    href: "/agency/signup",
    key: "agency",
  },
];

export const comparisonGroups: ComparisonGroup[] = [
  {
    key: "regulations",
    rows: [
      { cells: ["✓", "✓", "✓"], key: "nis2" },
      { cells: ["-", "optional", "✓"], key: "euAiAct" },
      { cells: ["✓", "✓", "✓"], key: "gdpr" },
      { cells: ["-", "optional", "✓"], key: "iso27001" },
      { cells: ["-", "-", "lite"], key: "csrd" },
      { cells: ["-", "-", "soon"], key: "dora" },
    ],
  },
  {
    key: "integrations",
    rows: [
      { cells: ["-", "✓", "✓"], key: "microsoft365" },
      { cells: ["-", "✓", "✓"], key: "github" },
      { cells: ["-", "✓", "✓"], key: "aws" },
      { cells: ["-", "✓", "✓"], key: "hetznerCloud" },
      { cells: ["-", "✓", "✓"], key: "ovhcloud" },
      { cells: ["-", "✓", "✓"], key: "abraFlexi" },
      { cells: ["-", "✓", "✓"], key: "czechErpWorkspaces" },
      { cells: ["-", "-", "soon"], key: "googleWorkspace" },
      { cells: ["-", "✓", "✓"], key: "nukibFeed" },
    ],
  },
  {
    key: "automation",
    rows: [
      { cells: ["-", "selected", "selected"], key: "automatedChecks" },
      { cells: ["-", "✓", "✓"], key: "automatedEvidence" },
      { cells: ["-", "✓", "✓"], key: "failureAlerts" },
      { cells: ["-", "✓", "✓"], key: "scheduler" },
    ],
  },
  {
    key: "documents",
    rows: [
      { cells: ["3", "unlimited", "unlimited"], key: "policyTemplates" },
      { cells: ["-", "✓", "✓"], key: "pdfGeneration" },
      { cells: ["-", "✓", "✓"], key: "trainingTemplates" },
      { cells: ["-", "✓", "✓"], key: "auditorExport" },
    ],
  },
  {
    key: "trustCenter",
    rows: [
      { cells: ["-", "-", "✓"], key: "publicPage" },
      { cells: ["-", "-", "✓"], key: "ndaGate" },
      { cells: ["-", "-", "✓"], key: "subdomain" },
      { cells: ["-", "-", "optional"], key: "customDomain" },
    ],
  },
  {
    key: "team",
    rows: [
      { cells: ["1", "25", "unlimited"], key: "userCount" },
      { cells: ["-", "✓", "✓"], key: "rolesPermissions" },
      { cells: ["-", "-", "optional"], key: "ssoSaml" },
    ],
  },
  {
    key: "support",
    rows: [
      { cells: ["-", "✓", "✓"], key: "email" },
      { cells: ["-", "-", "✓"], key: "priorityEmail" },
      { cells: ["-", "-", "optional"], key: "dedicatedCsm" },
      { cells: ["-", "-", "optional"], key: "sla" },
    ],
  },
];
