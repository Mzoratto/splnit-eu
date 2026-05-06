export type PolicyTemplateType =
  | "ai_policy"
  | "security_policy"
  | "gdpr_privacy_notice"
  | "training_log"
  | "record_of_use"
  | "incident_response";

export type DraftPolicyTemplateFamily =
  | "record_of_processing"
  | "dpia"
  | "data_processing_agreement"
  | "subprocessor_list"
  | "asset_inventory"
  | "risk_assessment"
  | "acceptable_use"
  | "vendor_questionnaire"
  | "business_continuity"
  | "access_control";

export type PolicyTemplateFamily =
  | PolicyTemplateType
  | DraftPolicyTemplateFamily;

export const POLICY_TEMPLATE_TYPES = [
  "ai_policy",
  "security_policy",
  "gdpr_privacy_notice",
  "training_log",
  "record_of_use",
  "incident_response",
] as const satisfies readonly PolicyTemplateType[];

export function isPolicyTemplateType(value: string): value is PolicyTemplateType {
  return POLICY_TEMPLATE_TYPES.includes(value as PolicyTemplateType);
}

export type PolicyTemplate = {
  type: PolicyTemplateFamily;
  templateFamily: PolicyTemplateFamily;
  jurisdiction: "CZ" | "EU" | "IT";
  locale: "cs-CZ" | "en-EU" | "it-IT";
  reviewStatus?: "draft" | "reviewed";
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
          "{{tenant.legalIdentifier}}",
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
        fields: [
          "Organizace",
          "{{tenant.legalIdentifier}}",
          "Verze",
          "Datum vydání",
          "Schválil/a",
        ],
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
        fields: [
          "Název organizace",
          "{{tenant.legalIdentifier}}",
          "{{jurisdiction.address}}",
          "{{jurisdiction.contactEmail}}",
        ],
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
        body: "Subjekty údajů se mohou obrátit na {{jurisdiction.dataProtectionAuthority}}, pokud se domnívají, že zpracování porušuje GDPR.",
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
        fields: [
          "Organizace",
          "{{tenant.legalIdentifier}}",
          "Rok",
          "Odpovědná osoba",
        ],
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
        fields: [
          "Datum",
          "Popis incidentu",
          "Přijatá opatření",
          "Hlášen: Příslušný národní orgán",
        ],
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
        body: "Incidenty s osobními údaji se posuzují podle {{jurisdiction.gdprCitation}} čl. 33; významné kybernetické incidenty podle {{jurisdiction.nis2Citation}}.",
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
  {
    type: "security_policy",
    templateFamily: "security_policy",
    jurisdiction: "IT",
    locale: "it-IT",
    reviewStatus: "draft",
    titleCs: "Politica di sicurezza delle informazioni",
    description:
      "Bozza italiana per revisione advisor: politica InfoSec per PMI soggette a D.Lgs. 138/2024, GDPR e controlli di sicurezza proporzionati.",
    sourceDocument: "tpl-004-security-policy-it-draft.md",
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
        title: "Identificazione del documento",
        fields: [
          "Organizzazione",
          "{{tenant.legalIdentifier}}",
          "Versione",
          "Data di emissione",
          "Approvato da",
          "Prossima revisione",
        ],
      },
      {
        title: "Scopo e campo di applicazione",
        body: "La presente politica definisce le regole minime per proteggere persone, sistemi, dati, fornitori e servizi cloud dell'organizzazione.",
      },
      {
        title: "Riferimenti normativi",
        body: "La politica e' una bozza operativa da verificare rispetto a {{jurisdiction.nis2Citation}}, {{jurisdiction.gdprCitation}}, Codice Privacy e indicazioni ACN applicabili.",
      },
      {
        title: "Ruoli e responsabilita'",
        fields: [
          "Direzione",
          "Responsabile sicurezza informatica",
          "Responsabili di processo",
          "Utenti",
          "Fornitori critici",
        ],
      },
      {
        title: "Controllo degli accessi",
        body: "Gli account usano MFA ove applicabile, i privilegi sono limitati al necessario e gli accessi vengono riesaminati periodicamente.",
      },
      {
        title: "Protezione dei dati e crittografia",
        body: "I dati sensibili sono classificati, protetti e cifrati in funzione del rischio, dello scopo del trattamento e degli obblighi contrattuali o normativi.",
      },
      {
        title: "Vulnerabilita' e modifiche",
        body: "Le vulnerabilita' critiche sono prese in carico, priorizzate e corrette; le modifiche ai sistemi di produzione sono approvate e tracciabili.",
      },
      {
        title: "Fornitori",
        body: "I fornitori con accesso a dati, reti o sistemi sono valutati prima dell'attivazione e vincolati da requisiti di sicurezza, notifica incidenti e continuita'.",
      },
      {
        title: "Monitoraggio, log e riesame",
        fields: [
          "Fonti di log",
          "Responsabile alert",
          "Periodo di conservazione",
          "Data ultimo riesame",
          "Azioni correttive",
        ],
      },
    ],
  },
  {
    type: "incident_response",
    templateFamily: "incident_response",
    jurisdiction: "IT",
    locale: "it-IT",
    reviewStatus: "draft",
    titleCs: "Piano di gestione degli incidenti",
    description:
      "Bozza italiana per revisione advisor: piano di risposta agli incidenti con escalation, conservazione evidenze e valutazione delle notifiche ACN/Garante.",
    sourceDocument: "tpl-006-incident-response-it-draft.md",
    controlKeys: [
      "ctrl_incident_plan_documented",
      "ctrl_incident_72h_notification",
      "ctrl_logging_monitoring",
      "ctrl_security_event_alerting",
      "ctrl_business_continuity_plan",
    ],
    sections: [
      {
        title: "Scopo e ruoli",
        fields: [
          "Incident manager",
          "Referente IT",
          "Referente privacy",
          "Direzione",
          "Contatti dei fornitori critici",
        ],
      },
      {
        title: "Classificazione dell'incidente",
        fields: [
          "Basso",
          "Medio",
          "Alto",
          "Critico",
          "Criteri per incidente significativo NIS",
          "Criteri per violazione dei dati personali",
        ],
      },
      {
        title: "Prima risposta",
        body: "Mettere in sicurezza persone e sistemi, limitare l'impatto, preservare le evidenze e attivare i ruoli responsabili.",
      },
      {
        title: "Valutazione notifiche",
        body: "Gli incidenti cyber sono valutati rispetto a {{jurisdiction.nis2Citation}} e alle indicazioni ACN; le violazioni di dati personali sono valutate rispetto a {{jurisdiction.gdprCitation}} art. 33 e 34 e alle indicazioni del {{jurisdiction.dataProtectionAuthority}}.",
      },
      {
        title: "Timeline operativa",
        fields: [
          "Ora di rilevazione",
          "Ora di triage",
          "Decisione su preallarme",
          "Decisione su notifica",
          "Decisione su relazione finale",
          "Responsabile decisione",
        ],
      },
      {
        title: "Evidenze e comunicazioni",
        fields: [
          "Sistemi coinvolti",
          "Log conservati",
          "Dati personali coinvolti",
          "Misure adottate",
          "Comunicazioni interne",
          "Comunicazioni esterne",
        ],
      },
      {
        title: "Riesame post-incidente",
        fields: [
          "Causa radice",
          "Azioni correttive",
          "Responsabile",
          "Scadenza",
          "Data verifica efficacia",
        ],
      },
    ],
  },
  {
    type: "record_of_processing",
    templateFamily: "record_of_processing",
    jurisdiction: "IT",
    locale: "it-IT",
    reviewStatus: "draft",
    titleCs: "Registro dei trattamenti",
    description:
      "Bozza italiana per revisione advisor: registro delle attivita' di trattamento ai sensi del GDPR art. 30 e del Codice Privacy.",
    sourceDocument: "tpl-007-record-of-processing-it-draft.md",
    controlKeys: [
      "ctrl_data_processing_inventory",
      "ctrl_privacy_notice_current",
      "ctrl_data_retention_schedule",
      "ctrl_supplier_contract_security",
    ],
    sections: [
      {
        title: "Identificazione del titolare",
        fields: [
          "Organizzazione",
          "{{tenant.legalIdentifier}}",
          "{{jurisdiction.address}}",
          "Referente privacy",
          "{{jurisdiction.contactEmail}}",
        ],
      },
      {
        title: "Attivita' di trattamento",
        fields: [
          "Nome trattamento",
          "Finalita'",
          "Base giuridica",
          "Categorie di interessati",
          "Categorie di dati",
          "Categorie di destinatari",
        ],
      },
      {
        title: "Conservazione e trasferimenti",
        fields: [
          "Periodo di conservazione",
          "Criterio di cancellazione",
          "Trasferimenti extra SEE",
          "Garanzie applicabili",
        ],
      },
      {
        title: "Responsabili e misure di sicurezza",
        fields: [
          "Responsabili del trattamento",
          "Sub-responsabili rilevanti",
          "Misure tecniche e organizzative",
          "Data ultimo riesame",
        ],
      },
    ],
  },
  {
    type: "dpia",
    templateFamily: "dpia",
    jurisdiction: "IT",
    locale: "it-IT",
    reviewStatus: "draft",
    titleCs: "Valutazione d'impatto sulla protezione dei dati",
    description:
      "Bozza italiana per revisione advisor: DPIA per trattamenti che possono presentare un rischio elevato per diritti e liberta'.",
    sourceDocument: "tpl-008-dpia-it-draft.md",
    controlKeys: [
      "ctrl_dpia_process",
      "ctrl_data_processing_inventory",
      "ctrl_data_classification",
      "ctrl_data_encrypted_at_rest",
      "ctrl_dsr_process",
    ],
    sections: [
      {
        title: "Descrizione del trattamento",
        fields: [
          "Nome trattamento",
          "Titolare",
          "Responsabile interno",
          "Finalita'",
          "Categorie di dati",
          "Interessati coinvolti",
        ],
      },
      {
        title: "Necessita' e proporzionalita'",
        fields: [
          "Base giuridica",
          "Minimizzazione dati",
          "Limitazione conservazione",
          "Informativa agli interessati",
          "Gestione diritti",
        ],
      },
      {
        title: "Valutazione dei rischi",
        fields: [
          "Scenario di rischio",
          "Probabilita'",
          "Impatto",
          "Misure esistenti",
          "Rischio residuo",
        ],
      },
      {
        title: "Decisione e consultazione",
        fields: [
          "Misure aggiuntive",
          "Consultazione DPO",
          "Consultazione {{jurisdiction.dataProtectionAuthority}}",
          "Decisione finale",
          "Data riesame",
        ],
      },
    ],
  },
  {
    type: "data_processing_agreement",
    templateFamily: "data_processing_agreement",
    jurisdiction: "IT",
    locale: "it-IT",
    reviewStatus: "draft",
    titleCs: "Accordo sul trattamento dei dati",
    description:
      "Bozza italiana per revisione advisor: DPA tra titolare e responsabile del trattamento, da adattare al rapporto contrattuale specifico.",
    sourceDocument: "tpl-009-dpa-it-draft.md",
    controlKeys: [
      "ctrl_supplier_contract_security",
      "ctrl_vendor_security_assessment",
      "ctrl_data_processing_inventory",
      "ctrl_incident_72h_notification",
    ],
    sections: [
      {
        title: "Parti e ruolo privacy",
        fields: [
          "Titolare del trattamento",
          "Responsabile del trattamento",
          "Oggetto del servizio",
          "Durata del trattamento",
          "Contatti privacy",
        ],
      },
      {
        title: "Istruzioni documentate",
        body: "Il responsabile tratta i dati personali solo secondo istruzioni documentate del titolare, salvo obblighi di legge applicabili.",
      },
      {
        title: "Misure di sicurezza",
        fields: [
          "Controllo accessi",
          "Crittografia",
          "Backup",
          "Logging",
          "Gestione incidenti",
        ],
      },
      {
        title: "Sub-responsabili e assistenza",
        fields: [
          "Autorizzazione sub-responsabili",
          "Obbligo di informazione",
          "Assistenza diritti interessati",
          "Assistenza DPIA",
          "Cancellazione o restituzione dati",
        ],
      },
    ],
  },
  {
    type: "subprocessor_list",
    templateFamily: "subprocessor_list",
    jurisdiction: "IT",
    locale: "it-IT",
    reviewStatus: "draft",
    titleCs: "Elenco dei sub-responsabili",
    description:
      "Bozza italiana per revisione advisor: elenco operativo dei sub-responsabili con finalita', localizzazione e misure rilevanti.",
    sourceDocument: "tpl-010-subprocessors-it-draft.md",
    controlKeys: [
      "ctrl_supplier_contract_security",
      "ctrl_vendor_security_assessment",
      "ctrl_supplier_monitoring",
    ],
    sections: [
      {
        title: "Informazioni generali",
        fields: [
          "Organizzazione",
          "{{tenant.legalIdentifier}}",
          "Versione elenco",
          "Data ultimo aggiornamento",
          "Contatto per opposizioni",
        ],
      },
      {
        title: "Sub-responsabili",
        fields: [
          "Nome fornitore",
          "Servizio",
          "Finalita' del trattamento",
          "Categorie di dati",
          "Paese o regione",
          "Base trasferimento",
        ],
      },
      {
        title: "Controlli e riesame",
        fields: [
          "DPA firmato",
          "Valutazione sicurezza",
          "Data ultimo riesame",
          "Rischi aperti",
        ],
      },
    ],
  },
  {
    type: "asset_inventory",
    templateFamily: "asset_inventory",
    jurisdiction: "IT",
    locale: "it-IT",
    reviewStatus: "draft",
    titleCs: "Inventario degli asset",
    description:
      "Bozza italiana per revisione advisor: inventario di sistemi, dati, proprietari e criticita' per NIS2, GDPR e ISO 27001.",
    sourceDocument: "tpl-011-asset-inventory-it-draft.md",
    controlKeys: [
      "ctrl_asset_inventory",
      "ctrl_data_classification",
      "ctrl_data_processing_inventory",
      "ctrl_business_continuity_plan",
    ],
    sections: [
      {
        title: "Asset applicativi e infrastrutturali",
        fields: [
          "Nome asset",
          "Tipo",
          "Owner",
          "Fornitore",
          "Ambiente",
          "Criticita'",
        ],
      },
      {
        title: "Dati e dipendenze",
        fields: [
          "Categorie di dati",
          "Dati personali",
          "Integrazioni",
          "Dipendenze critiche",
          "Backup",
        ],
      },
      {
        title: "Controlli applicati",
        fields: [
          "MFA",
          "Logging",
          "Crittografia",
          "Monitoraggio vulnerabilita'",
          "Ultimo riesame",
        ],
      },
    ],
  },
  {
    type: "risk_assessment",
    templateFamily: "risk_assessment",
    jurisdiction: "IT",
    locale: "it-IT",
    reviewStatus: "draft",
    titleCs: "Valutazione del rischio",
    description:
      "Bozza italiana per revisione advisor: valutazione dei rischi cybersecurity e privacy con piano di trattamento.",
    sourceDocument: "tpl-012-risk-assessment-it-draft.md",
    controlKeys: [
      "ctrl_risk_treatment_plan",
      "ctrl_asset_inventory",
      "ctrl_vulnerability_management",
      "ctrl_vendor_security_assessment",
      "ctrl_business_continuity_plan",
    ],
    sections: [
      {
        title: "Ambito",
        fields: [
          "Processo o asset",
          "Owner",
          "Framework applicabili",
          "Data valutazione",
          "Metodo usato",
        ],
      },
      {
        title: "Scenario di rischio",
        fields: [
          "Minaccia",
          "Vulnerabilita'",
          "Impatto potenziale",
          "Probabilita'",
          "Livello rischio inerente",
        ],
      },
      {
        title: "Trattamento",
        fields: [
          "Controlli esistenti",
          "Azioni aggiuntive",
          "Owner azione",
          "Scadenza",
          "Rischio residuo",
          "Decisione accettazione",
        ],
      },
    ],
  },
  {
    type: "acceptable_use",
    templateFamily: "acceptable_use",
    jurisdiction: "IT",
    locale: "it-IT",
    reviewStatus: "draft",
    titleCs: "Politica di uso accettabile",
    description:
      "Bozza italiana per revisione advisor: regole di uso accettabile per account, dispositivi, dati, cloud e strumenti AI.",
    sourceDocument: "tpl-013-acceptable-use-it-draft.md",
    controlKeys: [
      "ctrl_security_training_annual",
      "ctrl_password_policy",
      "ctrl_mfa_all_users",
      "ctrl_remote_work_policy",
      "ctrl_ai_prohibited_practices_review",
    ],
    sections: [
      {
        title: "Ambito e destinatari",
        body: "La politica si applica a dipendenti, collaboratori e altri utenti autorizzati che accedono a sistemi, dati o servizi aziendali.",
      },
      {
        title: "Account e autenticazione",
        body: "Gli utenti proteggono le credenziali, usano MFA quando richiesto e non condividono account o token di accesso.",
      },
      {
        title: "Dispositivi, cloud e dati",
        fields: [
          "Dispositivi autorizzati",
          "Uso servizi cloud",
          "Classificazione dati",
          "Condivisione esterna",
          "Segnalazione smarrimenti",
        ],
      },
      {
        title: "Uso di strumenti AI",
        body: "Informazioni riservate o dati personali non devono essere inseriti in strumenti AI non approvati. Ogni uso rilevante deve rispettare la politica AI aziendale.",
      },
    ],
  },
  {
    type: "vendor_questionnaire",
    templateFamily: "vendor_questionnaire",
    jurisdiction: "IT",
    locale: "it-IT",
    reviewStatus: "draft",
    titleCs: "Questionario per fornitori",
    description:
      "Bozza italiana per revisione advisor: questionario di sicurezza e privacy per fornitori che trattano dati o supportano servizi critici.",
    sourceDocument: "tpl-014-vendor-questionnaire-it-draft.md",
    controlKeys: [
      "ctrl_vendor_security_assessment",
      "ctrl_supplier_contract_security",
      "ctrl_supplier_monitoring",
      "ctrl_incident_72h_notification",
    ],
    sections: [
      {
        title: "Profilo fornitore",
        fields: [
          "Ragione sociale",
          "Servizio fornito",
          "Paesi di trattamento",
          "Certificazioni",
          "Contatto sicurezza",
        ],
      },
      {
        title: "Sicurezza tecnica",
        fields: [
          "MFA amministratori",
          "Crittografia dati",
          "Backup",
          "Logging",
          "Vulnerability management",
          "Penetration test",
        ],
      },
      {
        title: "Privacy e sub-fornitori",
        fields: [
          "DPA disponibile",
          "Sub-responsabili",
          "Trasferimenti extra SEE",
          "Gestione richieste interessati",
          "Cancellazione dati",
        ],
      },
      {
        title: "Incidenti e continuita'",
        fields: [
          "Processo incident response",
          "Tempi di notifica",
          "BCP/DR testato",
          "Ultimo test",
        ],
      },
    ],
  },
  {
    type: "business_continuity",
    templateFamily: "business_continuity",
    jurisdiction: "IT",
    locale: "it-IT",
    reviewStatus: "draft",
    titleCs: "Piano di continuita' operativa",
    description:
      "Bozza italiana per revisione advisor: piano BCP/DR per servizi, fornitori, backup e ruoli di ripristino.",
    sourceDocument: "tpl-015-business-continuity-it-draft.md",
    controlKeys: [
      "ctrl_business_continuity_plan",
      "ctrl_backup_tested",
      "ctrl_backup_policy",
      "ctrl_disaster_recovery_test",
      "ctrl_supplier_monitoring",
    ],
    sections: [
      {
        title: "Servizi critici",
        fields: [
          "Servizio",
          "Owner",
          "RTO",
          "RPO",
          "Dipendenze",
          "Clienti o processi impattati",
        ],
      },
      {
        title: "Strategia di continuita'",
        fields: [
          "Soluzione alternativa",
          "Backup",
          "Fornitori critici",
          "Canali di comunicazione",
          "Responsabili attivazione",
        ],
      },
      {
        title: "Test e riesame",
        fields: [
          "Scenario testato",
          "Data test",
          "Esito",
          "Azioni correttive",
          "Prossimo test",
        ],
      },
    ],
  },
  {
    type: "access_control",
    templateFamily: "access_control",
    jurisdiction: "IT",
    locale: "it-IT",
    reviewStatus: "draft",
    titleCs: "Politica di controllo degli accessi",
    description:
      "Bozza italiana per revisione advisor: controllo accessi per identita', privilegi, onboarding, offboarding e riesami periodici.",
    sourceDocument: "tpl-016-access-control-it-draft.md",
    controlKeys: [
      "ctrl_mfa_all_users",
      "ctrl_privileged_access_reviewed",
      "ctrl_offboarding_access_revoked",
      "ctrl_guest_access_controlled",
      "ctrl_identity_lifecycle_policy",
      "ctrl_conditional_access",
    ],
    sections: [
      {
        title: "Principi",
        body: "Gli accessi sono concessi secondo necessita' operativa, minimo privilegio, separazione dei ruoli e tracciabilita'.",
      },
      {
        title: "Ciclo di vita identita'",
        fields: [
          "Richiesta accesso",
          "Approvazione",
          "Provisioning",
          "Modifica ruolo",
          "Offboarding",
          "Revoca emergenza",
        ],
      },
      {
        title: "Accessi privilegiati",
        fields: [
          "Account amministrativi",
          "MFA",
          "Logging",
          "Accesso break-glass",
          "Riesame periodico",
        ],
      },
      {
        title: "Accessi terzi e ospiti",
        fields: [
          "Sponsor interno",
          "Scadenza accesso",
          "Restrizioni",
          "Riesame",
          "Revoca",
        ],
      },
    ],
  },
];
