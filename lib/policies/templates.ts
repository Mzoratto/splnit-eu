export type PolicyTemplateType =
  | "ai_policy"
  | "security_policy"
  | "gdpr_privacy_notice"
  | "training_log"
  | "record_of_use"
  | "incident_response";

export const POLICY_TEMPLATE_TYPES = [
  "ai_policy",
  "security_policy",
  "gdpr_privacy_notice",
  "training_log",
  "record_of_use",
  "incident_response",
] as const satisfies readonly PolicyTemplateType[];

export type PolicyTemplate = {
  type: PolicyTemplateType;
  templateFamily: PolicyTemplateType;
  jurisdiction: "CZ" | "EU" | "IT";
  locale: "cs-CZ" | "en-EU" | "it-IT";
  titleCs: string;
  description: string;
  sourceDocument: string;
  controlKeys: string[];
  sections: {
    title: string;
    fields?: string[];
    body?: string;
  }[];
};

export const POLICY_TEMPLATES: PolicyTemplate[] = [
  {
    type: "ai_policy",
    templateFamily: "ai_policy",
    jurisdiction: "CZ",
    locale: "cs-CZ",
    titleCs: "Politika umělé inteligence",
    description:
      "Šablona TPL-001 pro splnění povinností podle EU AI Act, včetně inventáře AI systémů, zakázaných praktik, odpovědností a AI gramotnosti.",
    sourceDocument: "tpl-001-ai-policy-cs.pdf",
    controlKeys: [
      "ctrl_ai_system_inventory",
      "ctrl_ai_literacy_training",
      "ctrl_ai_prohibited_practices_review",
      "ctrl_ai_human_oversight",
      "ctrl_ai_log_retention",
    ],
    sections: [
      {
        title: "Identifikace dokumentu",
        fields: [
          "Organizace",
          "IČO",
          "Verze dokumentu",
          "Datum vydání",
          "Schválil/a",
          "Příští přezkum",
        ],
      },
      {
        title: "Účel a rozsah",
        body: "Zásady, odpovědnosti a postupy organizace při používání AI systémů.",
      },
      {
        title: "Definice",
        fields: ["Systém AI", "Nasazovatel", "Vysoce rizikový AI systém", "AI gramotnost"],
      },
      {
        title: "Inventář AI systémů",
        fields: [
          "Název a verze AI systému",
          "Dodavatel",
          "Účel použití",
          "Role organizace",
          "Klasifikace rizika",
          "Datum posledního přezkumu",
        ],
      },
      {
        title: "Zakázané praktiky",
        body: "Zákaz social scoringu, rozpoznávání emocí na pracovišti, biometrické identifikace v reálném čase a dalších praktik podle článku 5.",
      },
      {
        title: "Odpovědnosti",
        fields: ["Vedení", "Odpovědná osoba za AI", "Vedoucí oddělení", "Zaměstnanci", "IT oddělení"],
      },
      {
        title: "Školení AI gramotnosti",
        body: "Základní školení při nástupu a roční refresh pro zaměstnance pracující s AI.",
      },
      {
        title: "Hlášení incidentů",
        body: "Postup pro hlášení neočekávaných, škodlivých nebo diskriminačních výstupů AI.",
      },
      {
        title: "Přezkum a schválení",
        fields: ["Jméno schvalovatele", "Funkce", "Datum", "Podpis"],
      },
    ],
  },
  {
    type: "security_policy",
    templateFamily: "security_policy",
    jurisdiction: "CZ",
    locale: "cs-CZ",
    titleCs: "Bezpečnostní politika",
    description:
      "Základní bezpečnostní politika pro řízení přístupů, šifrování, zranitelností, záloh a dodavatelů.",
    sourceDocument: "tpl-004-security-policy-cs.pdf",
    controlKeys: [
      "ctrl_mfa_all_users",
      "ctrl_privileged_access_reviewed",
      "ctrl_incident_plan_documented",
      "ctrl_data_encrypted_at_rest",
      "ctrl_patch_management",
      "ctrl_backup_tested",
      "ctrl_logging_monitoring",
      "ctrl_vendor_security_assessment",
      "ctrl_asset_inventory",
    ],
    sections: [
      {
        title: "Identifikace dokumentu",
        fields: ["Organizace", "IČO", "Verze", "Datum vydání", "Schválil/a"],
      },
      {
        title: "Rozsah a cíle",
        body: "Politika stanovuje minimální bezpečnostní pravidla pro zaměstnance, systémy, data, dodavatele a cloudové služby.",
      },
      {
        title: "Řízení přístupů",
        body: "Všechny účty používají MFA, privilegované role jsou omezené a přístupy se pravidelně přezkoumávají.",
      },
      {
        title: "Ochrana dat",
        body: "Citlivá data jsou klasifikována, šifrována a chráněna podle účelu zpracování a zákonných požadavků.",
      },
      {
        title: "Zranitelnosti a změny",
        body: "Kritické zranitelnosti se řeší prioritně, změny se schvalují a jsou dohledatelné.",
      },
      {
        title: "Dodavatelé",
        body: "Dodavatelé s přístupem k datům nebo systémům procházejí bezpečnostním hodnocením a smluvními požadavky.",
      },
      {
        title: "Přezkum",
        fields: ["Odpovědná osoba", "Datum přezkumu", "Datum příštího přezkumu"],
      },
    ],
  },
  {
    type: "gdpr_privacy_notice",
    templateFamily: "gdpr_privacy_notice",
    jurisdiction: "CZ",
    locale: "cs-CZ",
    titleCs: "GDPR informační memorandum",
    description:
      "Privacy notice pro popis účelů zpracování, právních základů, příjemců, lhůt uložení a práv subjektů údajů.",
    sourceDocument: "tpl-005-gdpr-privacy-notice-cs.pdf",
    controlKeys: [
      "ctrl_privacy_notice_current",
      "ctrl_data_processing_inventory",
      "ctrl_dsr_process",
      "ctrl_data_retention_schedule",
      "ctrl_dpia_process",
      "ctrl_supplier_contract_security",
    ],
    sections: [
      {
        title: "Správce osobních údajů",
        fields: ["Název organizace", "IČO", "Adresa", "Kontaktní e-mail"],
      },
      {
        title: "Účely a právní základy",
        fields: ["Účel zpracování", "Kategorie údajů", "Právní základ", "Lhůta uložení"],
      },
      {
        title: "Příjemci a zpracovatelé",
        body: "Osobní údaje mohou být zpřístupněny dodavatelům, kteří plní roli zpracovatele na základě DPA.",
      },
      {
        title: "Práva subjektů údajů",
        body: "Subjekty údajů mohou požádat o přístup, opravu, výmaz, omezení, přenositelnost nebo podat námitku.",
      },
      {
        title: "Bezpečnost",
        body: "Organizace používá technická a organizační opatření včetně řízení přístupů, šifrování a incident response.",
      },
      {
        title: "Dozorový úřad",
        body: "Subjekty údajů se mohou obrátit na ÚOOÚ, pokud se domnívají, že zpracování porušuje GDPR.",
      },
    ],
  },
  {
    type: "training_log",
    templateFamily: "training_log",
    jurisdiction: "CZ",
    locale: "cs-CZ",
    titleCs: "Záznam o školení AI gramotnosti",
    description:
      "Šablona TPL-002 pro evidenci školení podle článku 4 EU AI Act.",
    sourceDocument: "tpl-002-training-log-cs.pdf",
    controlKeys: ["ctrl_ai_literacy_training", "ctrl_security_training_annual"],
    sections: [
      {
        title: "Identifikace",
        fields: ["Organizace", "IČO", "Rok", "Odpovědná osoba"],
      },
      {
        title: "Evidence školení",
        fields: [
          "Jméno zaměstnance",
          "Oddělení",
          "Typ školení",
          "Datum",
          "Potvrzení",
        ],
      },
      {
        title: "Typy školení",
        fields: ["AL-1", "AL-2", "AL-3", "AL-4"],
      },
      {
        title: "Podpis odpovědné osoby",
        fields: ["Jméno", "Funkce", "Datum", "Podpis"],
      },
    ],
  },
  {
    type: "record_of_use",
    templateFamily: "record_of_use",
    jurisdiction: "CZ",
    locale: "cs-CZ",
    titleCs: "Záznam o používání AI systému",
    description:
      "Šablona TPL-003 pro manuální záznam použití vysoce rizikové AI, kde automatické logy nejsou dostupné.",
    sourceDocument: "tpl-003-record-of-use-cs.pdf",
    controlKeys: ["ctrl_ai_log_retention", "ctrl_ai_human_oversight"],
    sections: [
      {
        title: "Identifikace AI systému",
        fields: [
          "Název systému",
          "Verze",
          "Dodavatel",
          "Kategorie Přílohy III",
          "Účel použití",
          "Odpovědná osoba",
          "Oddělení",
          "Datum zahájení používání",
        ],
      },
      {
        title: "Protokol používání",
        fields: [
          "Datum",
          "Případ použití",
          "Výsledek AI",
          "Lidský přezkum",
          "Operátor",
        ],
      },
      {
        title: "Záznamy o incidentech",
        fields: ["Datum", "Popis incidentu", "Přijatá opatření", "Hlášen ČTÚ"],
      },
      {
        title: "Přezkum záznamu",
        fields: ["Přezkoumal/a", "Datum přezkumu", "Datum příštího přezkumu", "Podpis"],
      },
    ],
  },
  {
    type: "incident_response",
    templateFamily: "incident_response",
    jurisdiction: "CZ",
    locale: "cs-CZ",
    titleCs: "Plán reakce na incidenty",
    description:
      "Incident response dokument pro NIS2 a GDPR, včetně eskalace, evidence dopadů a oznamovacích lhůt.",
    sourceDocument: "tpl-006-incident-response-cs.pdf",
    controlKeys: [
      "ctrl_incident_plan_documented",
      "ctrl_incident_72h_notification",
      "ctrl_logging_monitoring",
      "ctrl_security_event_alerting",
      "ctrl_business_continuity_plan",
    ],
    sections: [
      {
        title: "Rozsah a role",
        fields: ["Incident manager", "IT odpovědná osoba", "Právní kontakt", "Management"],
      },
      {
        title: "Klasifikace incidentů",
        fields: ["Nízký", "Střední", "Vysoký", "Kritický"],
      },
      {
        title: "První reakce",
        body: "Zajistit bezpečnost, omezit dopad, zachovat důkazy a aktivovat odpovědné osoby.",
      },
      {
        title: "Oznamovací povinnosti",
        body: "Incidenty s osobními údaji se posuzují podle GDPR Art. 33; významné kybernetické incidenty podle NIS2.",
      },
      {
        title: "Evidence a komunikace",
        fields: ["Čas detekce", "Dopad", "Dotčené systémy", "Přijatá opatření", "Externí komunikace"],
      },
      {
        title: "Post-incident review",
        fields: ["Kořenová příčina", "Nápravná opatření", "Vlastník", "Termín"],
      },
    ],
  },
  {
    type: "ai_policy",
    templateFamily: "ai_policy",
    jurisdiction: "EU",
    locale: "en-EU",
    titleCs: "Artificial intelligence policy",
    description:
      "Baseline EU AI Act policy for AI inventory, prohibited practices, responsibilities, high-risk use, and AI literacy.",
    sourceDocument: "tpl-001-ai-policy-en-eu.pdf",
    controlKeys: [
      "ctrl_ai_system_inventory",
      "ctrl_ai_literacy_training",
      "ctrl_ai_prohibited_practices_review",
      "ctrl_ai_human_oversight",
      "ctrl_ai_log_retention",
    ],
    sections: [
      {
        title: "Document identification",
        fields: [
          "Organisation",
          "Legal identifier",
          "Document version",
          "Issue date",
          "Approved by",
          "Next review",
        ],
      },
      {
        title: "Purpose and scope",
        body: "Rules, responsibilities, and procedures for using AI systems in the organisation.",
      },
      {
        title: "Definitions",
        fields: ["AI system", "Deployer", "High-risk AI system", "AI literacy"],
      },
      {
        title: "AI system inventory",
        fields: [
          "System name and version",
          "Provider",
          "Purpose",
          "Organisation role",
          "Risk classification",
          "Last review date",
        ],
      },
      {
        title: "Prohibited practices",
        body: "The organisation must not use AI systems for prohibited practices under Article 5 of the EU AI Act.",
      },
      {
        title: "Responsibilities",
        fields: ["Management", "AI owner", "Department leads", "Employees", "IT team"],
      },
      {
        title: "AI literacy training",
        body: "Baseline training at onboarding and annual refresh training for employees working with AI systems.",
      },
      {
        title: "Incident reporting",
        body: "Procedure for reporting unexpected, harmful, discriminatory, or unsafe AI outputs.",
      },
      {
        title: "Review and approval",
        fields: ["Approver name", "Role", "Date", "Signature"],
      },
    ],
  },
  {
    type: "security_policy",
    templateFamily: "security_policy",
    jurisdiction: "EU",
    locale: "en-EU",
    titleCs: "Information security policy",
    description:
      "Baseline security policy for access control, encryption, vulnerability management, backups, suppliers, and evidence ownership.",
    sourceDocument: "tpl-004-security-policy-en-eu.pdf",
    controlKeys: [
      "ctrl_mfa_all_users",
      "ctrl_privileged_access_reviewed",
      "ctrl_incident_plan_documented",
      "ctrl_data_encrypted_at_rest",
      "ctrl_patch_management",
      "ctrl_backup_tested",
      "ctrl_logging_monitoring",
      "ctrl_vendor_security_assessment",
      "ctrl_asset_inventory",
    ],
    sections: [
      {
        title: "Document identification",
        fields: ["Organisation", "Legal identifier", "Version", "Issue date", "Approved by"],
      },
      {
        title: "Scope and objectives",
        body: "This policy defines minimum security rules for people, systems, data, suppliers, and cloud services.",
      },
      {
        title: "Access control",
        body: "User accounts use MFA, privileged roles are limited, and access rights are reviewed periodically.",
      },
      {
        title: "Data protection",
        body: "Sensitive data is classified, encrypted, and protected according to processing purpose and legal obligations.",
      },
      {
        title: "Vulnerabilities and change",
        body: "Critical vulnerabilities are prioritized, changes are approved, and implementation evidence is retained.",
      },
      {
        title: "Suppliers",
        body: "Suppliers with access to systems or data are assessed and bound by security requirements.",
      },
      {
        title: "Review",
        fields: ["Policy owner", "Review date", "Next review date"],
      },
    ],
  },
  {
    type: "gdpr_privacy_notice",
    templateFamily: "gdpr_privacy_notice",
    jurisdiction: "EU",
    locale: "en-EU",
    titleCs: "GDPR privacy notice",
    description:
      "Privacy notice covering processing purposes, legal bases, recipients, retention periods, and data subject rights.",
    sourceDocument: "tpl-005-gdpr-privacy-notice-en-eu.pdf",
    controlKeys: [
      "ctrl_privacy_notice_current",
      "ctrl_data_processing_inventory",
      "ctrl_dsr_process",
      "ctrl_data_retention_schedule",
      "ctrl_dpia_process",
      "ctrl_supplier_contract_security",
    ],
    sections: [
      {
        title: "Controller identification",
        fields: ["Organisation name", "Legal identifier", "Address", "Contact email"],
      },
      {
        title: "Purposes and legal bases",
        fields: ["Processing purpose", "Data categories", "Legal basis", "Retention period"],
      },
      {
        title: "Recipients and processors",
        body: "Personal data may be disclosed to suppliers acting as processors under a data processing agreement.",
      },
      {
        title: "Data subject rights",
        body: "Data subjects may request access, rectification, erasure, restriction, portability, or object to processing where GDPR allows.",
      },
      {
        title: "Security",
        body: "The organisation applies technical and organisational measures including access control, encryption, and incident response.",
      },
      {
        title: "Supervisory authority",
        body: "Data subjects may lodge a complaint with the competent data protection authority.",
      },
    ],
  },
  {
    type: "training_log",
    templateFamily: "training_log",
    jurisdiction: "EU",
    locale: "en-EU",
    titleCs: "AI literacy training record",
    description:
      "Training evidence template for EU AI Act Article 4 and security awareness training records.",
    sourceDocument: "tpl-002-training-log-en-eu.pdf",
    controlKeys: ["ctrl_ai_literacy_training", "ctrl_security_training_annual"],
    sections: [
      {
        title: "Identification",
        fields: ["Organisation", "Legal identifier", "Year", "Training owner"],
      },
      {
        title: "Training records",
        fields: ["Employee name", "Department", "Training type", "Date", "Confirmation"],
      },
      {
        title: "Training types",
        fields: ["AI literacy baseline", "Security awareness", "Role-specific training", "Annual refresh"],
      },
      {
        title: "Owner signature",
        fields: ["Name", "Role", "Date", "Signature"],
      },
    ],
  },
  {
    type: "record_of_use",
    templateFamily: "record_of_use",
    jurisdiction: "EU",
    locale: "en-EU",
    titleCs: "AI system use record",
    description:
      "Manual record template for high-risk AI use where automated logs are not available.",
    sourceDocument: "tpl-003-record-of-use-en-eu.pdf",
    controlKeys: ["ctrl_ai_log_retention", "ctrl_ai_human_oversight"],
    sections: [
      {
        title: "AI system identification",
        fields: [
          "System name",
          "Version",
          "Provider",
          "Annex III category",
          "Purpose",
          "Responsible owner",
          "Department",
          "Start date",
        ],
      },
      {
        title: "Use log",
        fields: ["Date", "Use case", "AI output", "Human review", "Operator"],
      },
      {
        title: "Incident records",
        fields: ["Date", "Incident description", "Measures taken", "Reported to authority"],
      },
      {
        title: "Record review",
        fields: ["Reviewer", "Review date", "Next review date", "Signature"],
      },
    ],
  },
  {
    type: "incident_response",
    templateFamily: "incident_response",
    jurisdiction: "EU",
    locale: "en-EU",
    titleCs: "Incident response plan",
    description:
      "Incident response document for NIS2 and GDPR projects, including escalation, impact evidence, and notification timelines.",
    sourceDocument: "tpl-006-incident-response-en-eu.pdf",
    controlKeys: [
      "ctrl_incident_plan_documented",
      "ctrl_incident_72h_notification",
      "ctrl_logging_monitoring",
      "ctrl_security_event_alerting",
      "ctrl_business_continuity_plan",
    ],
    sections: [
      {
        title: "Scope and roles",
        fields: ["Incident manager", "IT owner", "Legal contact", "Management"],
      },
      {
        title: "Incident classification",
        fields: ["Low", "Medium", "High", "Critical"],
      },
      {
        title: "First response",
        body: "Protect people and systems, limit impact, preserve evidence, and activate responsible roles.",
      },
      {
        title: "Notification duties",
        body: "Personal data breaches are assessed under GDPR Article 33; significant cybersecurity incidents are assessed under NIS2 and applicable local law.",
      },
      {
        title: "Evidence and communication",
        fields: ["Detection time", "Impact", "Affected systems", "Measures taken", "External communication"],
      },
      {
        title: "Post-incident review",
        fields: ["Root cause", "Corrective measures", "Owner", "Deadline"],
      },
    ],
  },
];
