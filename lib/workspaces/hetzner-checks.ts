export type HetznerCheckResult = "pass" | "gap" | "error";

export type HetznerCheckId =
  | "server_running"
  | "firewall_present"
  | "snapshot_recent";

export type HetznerCheckContract = {
  checkId: HetznerCheckId;
  controlKey: string;
  endpoint: string;
  expected: string;
  field: string;
};

export const HETZNER_LAYER1_CHECKS = [
  {
    checkId: "server_running",
    controlKey: "hetzner-infra-server-running",
    endpoint: "/servers",
    expected: "running",
    field: "servers[0].status",
  },
  {
    checkId: "firewall_present",
    controlKey: "hetzner-infra-firewall-present",
    endpoint: "/firewalls",
    expected: "rules.length > 0",
    field: "firewalls[0].rules",
  },
  {
    checkId: "snapshot_recent",
    controlKey: "hetzner-infra-snapshot-recent",
    endpoint: "/images?type=snapshot",
    expected: "created within 7 days",
    field: "images[0].created",
  },
] as const satisfies readonly HetznerCheckContract[];
