import type { PolicyTemplate } from "@/lib/policies/policy-template-types";

export const CZ_POLICY_TEMPLATES: PolicyTemplate[] = [
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
];
