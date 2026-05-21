export type OVHcloudCheckResult = "pass" | "gap" | "error";

export type OVHcloudCheckId =
  | "server_operational"
  | "firewall_enabled"
  | "backup_present";

export type OVHcloudCheckContract = {
  checkId: OVHcloudCheckId;
  controlKey: string;
  endpoint: string;
  expected: string;
  field: string;
};

export const OVHCLOUD_LAYER1_CHECKS = [
  {
    checkId: "server_operational",
    controlKey: "ovhcloud-infra-server-operational",
    endpoint: "/dedicated/server/{serviceName}",
    expected: "operational",
    field: "status",
  },
  {
    checkId: "firewall_enabled",
    controlKey: "ovhcloud-infra-firewall-enabled",
    endpoint: "/dedicated/server/{serviceName}/firewall",
    expected: "true",
    field: "enabled",
  },
  {
    checkId: "backup_present",
    controlKey: "ovhcloud-infra-backup-present",
    endpoint: "/dedicated/server/{serviceName}/backupStorage",
    expected: "backup storage exists",
    field: "backupStorage",
  },
] as const satisfies readonly OVHcloudCheckContract[];
