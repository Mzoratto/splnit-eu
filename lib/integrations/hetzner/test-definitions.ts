export const HETZNER_TEST_DEFINITIONS = [
  {
    checkLogic: "hetzner_server_running",
    controlKey: "hetzner-infra-server-running",
    name: "Hetzner Cloud: server běží",
    passCriteria: "Alespoň jeden posuzovaný server Hetzner Cloud je ve stavu running.",
  },
  {
    checkLogic: "hetzner_firewall_present",
    controlKey: "hetzner-infra-firewall-present",
    name: "Hetzner Cloud: firewall pravidla existují",
    passCriteria: "Alespoň jeden firewall Hetzner Cloud má jednu nebo více pravidel.",
  },
  {
    checkLogic: "hetzner_snapshot_recent",
    controlKey: "hetzner-infra-snapshot-recent",
    name: "Hetzner Cloud: poslední snapshot je aktuální",
    passCriteria: "Alespoň jeden snapshot byl vytvořen v posledních 7 dnech.",
  },
] as const;
