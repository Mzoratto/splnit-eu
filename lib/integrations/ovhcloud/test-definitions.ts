export const OVHCLOUD_TEST_DEFINITIONS = [
  {
    checkLogic: "ovhcloud_server_operational",
    controlKey: "ovhcloud-infra-server-operational",
    name: "OVHcloud: server je provozní",
    passCriteria: "Dedikovaný server OVHcloud je ve stavu operational.",
  },
  {
    checkLogic: "ovhcloud_firewall_enabled",
    controlKey: "ovhcloud-infra-firewall-enabled",
    name: "OVHcloud: firewall je zapnutý",
    passCriteria: "Firewall OVHcloud je pro službu zapnutý.",
  },
  {
    checkLogic: "ovhcloud_backup_present",
    controlKey: "ovhcloud-infra-backup-present",
    name: "OVHcloud: backup storage existuje",
    passCriteria: "Backup storage nebo ekvivalentní záloha je pro službu dostupná.",
  },
] as const;
