import type { PolicyTemplate } from "@/lib/policies/policy-template-types";

export const IT_POLICY_TEMPLATES: PolicyTemplate[] = [
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
