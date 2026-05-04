export type PublicControlCategory =
  | "iam"
  | "cryptography"
  | "architecture"
  | "logging"
  | "vulnerability"
  | "incident"
  | "backup"
  | "supply_chain"
  | "awareness"
  | "ot";

export type CategoryStatus = "pass" | "warn" | "na";

export const CATEGORY_META: Record<
  PublicControlCategory,
  {
    desc: { cs: string; en: string };
    icon: string;
    name: { cs: string; en: string };
  }
> = {
  architecture: {
    desc: {
      cs: "Segmentace, inventář systémů, bezpečné nastavení a technické vlastnictví",
      en: "Segmentation, system inventory, secure configuration, and technical ownership",
    },
    icon: "network",
    name: {
      cs: "Bezpečná architektura",
      en: "Secure architecture",
    },
  },
  awareness: {
    desc: {
      cs: "Školení zaměstnanců, odpovědnosti, bezpečnostní pravidla a ověření porozumění",
      en: "Staff training, responsibilities, security rules, and understanding checks",
    },
    icon: "graduation-cap",
    name: {
      cs: "Bezpečnostní povědomí",
      en: "Security awareness",
    },
  },
  backup: {
    desc: {
      cs: "Zálohování, obnova, kontinuita provozu a pravidelné testování obnovy",
      en: "Backups, recovery, business continuity, and recovery testing",
    },
    icon: "database-backup",
    name: {
      cs: "Zálohování a obnova",
      en: "Backup and recovery",
    },
  },
  cryptography: {
    desc: {
      cs: "Šifrování dat, správa klíčů, klasifikace dat a bezpečné sdílení",
      en: "Data encryption, key management, data classification, and secure sharing",
    },
    icon: "key-round",
    name: {
      cs: "Kryptografie a ochrana dat",
      en: "Cryptography and data protection",
    },
  },
  iam: {
    desc: {
      cs: "MFA, podmíněný přístup, privilegované role a správa hostů",
      en: "MFA, conditional access, privileged roles, and guest access",
    },
    icon: "shield-keyhole",
    name: {
      cs: "Identity and access management",
      en: "Identity and access management",
    },
  },
  incident: {
    desc: {
      cs: "Incident response, eskalace, zákonné lhůty a poučení po incidentu",
      en: "Incident response, escalation, statutory deadlines, and lessons learned",
    },
    icon: "shield-alert",
    name: {
      cs: "Incident response",
      en: "Incident response",
    },
  },
  logging: {
    desc: {
      cs: "Logování, monitoring, upozornění na anomálie a dohledatelnost událostí",
      en: "Logging, monitoring, anomaly alerts, and event traceability",
    },
    icon: "activity",
    name: {
      cs: "Logování a monitoring",
      en: "Logging and monitoring",
    },
  },
  ot: {
    desc: {
      cs: "Oddělení provozních technologií, vzdálený přístup a řízení změn",
      en: "Operational technology separation, remote access, and change control",
    },
    icon: "factory",
    name: {
      cs: "OT systémy",
      en: "OT systems",
    },
  },
  supply_chain: {
    desc: {
      cs: "Rizika dodavatelů, smluvní požadavky, dotazníky a průběžné hodnocení",
      en: "Supplier risk, contractual requirements, questionnaires, and ongoing review",
    },
    icon: "blocks",
    name: {
      cs: "Bezpečnost dodavatelského řetězce",
      en: "Supply chain security",
    },
  },
  vulnerability: {
    desc: {
      cs: "Patch management, skenování zranitelností, nápravná opatření a prioritizace",
      en: "Patch management, vulnerability scanning, remediation, and prioritization",
    },
    icon: "scan-line",
    name: {
      cs: "Řízení zranitelností",
      en: "Vulnerability management",
    },
  },
};

const CONTROL_CATEGORY_ALIASES: Record<string, PublicControlCategory> = {
  access_control: "iam",
  ai_governance: "architecture",
  asset_management: "architecture",
  business_continuity: "backup",
  data_protection: "cryptography",
  esg_environment: "architecture",
  esg_governance: "architecture",
  esg_social: "awareness",
  governance: "architecture",
  incident: "incident",
  physical: "architecture",
  supplier: "supply_chain",
  training: "awareness",
};

export function normalizeControlCategory(
  category: string | null | undefined,
): PublicControlCategory {
  if (!category) {
    return "architecture";
  }

  if (category in CATEGORY_META) {
    return category as PublicControlCategory;
  }

  return CONTROL_CATEGORY_ALIASES[category] ?? "architecture";
}
