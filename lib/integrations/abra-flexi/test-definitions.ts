export const ABRA_FLEXI_TEST_DEFINITIONS = [
  {
    checkLogic: "abra_flexi_user_list_accessible",
    controlKey: "abra-flexi-iam-user-accounts",
    name: "ABRA Flexi: seznam uživatelů je dostupný",
    passCriteria: "REST API uživatel dokáže načíst evidenci uživatelů v ABRA Flexi.",
  },
  {
    checkLogic: "abra_flexi_https_transport",
    controlKey: "abra-flexi-api-https",
    name: "ABRA Flexi: API používá HTTPS",
    passCriteria: "Základní URL připojení ABRA Flexi používá protokol HTTPS.",
  },
  {
    checkLogic: "abra_flexi_backup_api_fallback",
    controlKey: "abra-flexi-backup-api",
    name: "ABRA Flexi: záloha vyžaduje ruční potvrzení",
    passCriteria: "Backup endpoint je dostupný nebo je kontrola předána k ručnímu doložení bez selhání konektoru.",
  },
  {
    checkLogic: "abra_flexi_configuration_readable",
    controlKey: "abra-flexi-api-config-readable",
    name: "ABRA Flexi: konfigurace je čitelná",
    passCriteria: "REST API uživatel dokáže načíst základní konfigurační evidenci.",
  },
] as const;
