import type { Locale } from "@/i18n/routing";

type ControlDisplayText = {
  description?: string | null;
  descriptionCs?: string | null;
  descriptionEn?: string | null;
  descriptionIt?: string | null;
  key: string;
  title?: string | null;
  titleCs?: string | null;
  titleEn?: string | null;
  titleIt?: string | null;
};

const italianControlTitles: Record<string, string> = {
  ctrl_mfa_all_users: "MFA abilitata per tutti gli account utente",
  ctrl_privileged_access_reviewed:
    "Accesso degli utenti privilegiati riesaminato periodicamente",
  ctrl_offboarding_access_revoked:
    "Accesso revocato entro 24 ore dall'uscita del dipendente",
  ctrl_guest_access_controlled: "Accesso di account guest ed esterni controllato",
  ctrl_security_training_annual:
    "Tutto il personale completa la formazione annuale di sensibilizzazione alla sicurezza",
  ctrl_incident_plan_documented:
    "Piano di risposta agli incidenti documentato e riesaminato annualmente",
  ctrl_incident_72h_notification:
    "Incidenti di sicurezza notificati all'autorita entro 72 ore",
  ctrl_data_encrypted_at_rest: "Dati sensibili cifrati a riposo",
  ctrl_data_processing_inventory:
    "Registri delle attivita di trattamento mantenuti",
  ctrl_ai_system_inventory: "Inventario dei sistemi AI mantenuto e aggiornato",
  ctrl_ai_literacy_training:
    "Il personale completa la formazione di alfabetizzazione AI",
  ctrl_ai_prohibited_practices_review:
    "I sistemi AI non eseguono pratiche vietate",
  ctrl_ai_high_risk_provider_verification:
    "Conformita del fornitore di AI ad alto rischio verificata",
  ctrl_ai_human_oversight:
    "L'AI ad alto rischio dispone di meccanismi di supervisione umana",
  ctrl_ai_log_retention:
    "Log dell'AI ad alto rischio conservati per almeno 6 mesi",
  ctrl_ai_individual_notice:
    "Persone interessate informate sulle decisioni assistite da AI",
  ctrl_ai_content_labeling: "Contenuti generati da AI etichettati",
  ctrl_conditional_access:
    "Accesso condizionale applicato per accessi a rischio",
  ctrl_password_policy: "Policy password e blocco account configurata",
  ctrl_device_encryption:
    "Dispositivi aziendali con cifratura completa del disco",
  ctrl_endpoint_protection:
    "Protezione endpoint attiva sui dispositivi gestiti",
  ctrl_patch_management: "Patching di sicurezza gestito e monitorato",
  ctrl_backup_tested: "Backup testati regolarmente",
  ctrl_business_continuity_plan: "Piano di continuita operativa documentato",
  ctrl_disaster_recovery_test: "Disaster recovery testato regolarmente",
  ctrl_asset_inventory: "Inventario asset completo e aggiornato",
  ctrl_data_classification: "Dati classificati per sensibilita",
  ctrl_dpia_process: "Processo DPIA presente per trattamenti ad alto rischio",
  ctrl_privacy_notice_current: "Informativa privacy aggiornata",
  ctrl_dsr_process: "Richieste degli interessati gestite",
  ctrl_data_retention_schedule:
    "Piano di conservazione dati definito e applicato",
  ctrl_vendor_security_assessment:
    "Fornitori valutati per il rischio sicurezza",
  ctrl_supplier_contract_security:
    "Contratti fornitori includono requisiti di sicurezza",
  ctrl_code_review_required: "Modifiche al codice richiedono revisione tra pari",
  ctrl_secrets_management:
    "Segreti e chiavi non sono archiviati nel codice sorgente",
  ctrl_branch_protection_enabled: "Rami di produzione protetti",
  ctrl_dependency_vulnerability_monitoring:
    "Vulnerabilita delle dipendenze monitorate",
  ctrl_logging_monitoring: "Log di sicurezza centralizzati",
  ctrl_security_event_alerting: "Eventi di sicurezza generano alert",
  ctrl_vulnerability_management: "Vulnerabilita tracciate e corrette",
  ctrl_penetration_test_annual:
    "Test di penetrazione eseguiti almeno annualmente",
  ctrl_secure_configuration_baseline:
    "Baseline di configurazione sicura definite",
  ctrl_change_management: "Modifiche in produzione controllate",
  ctrl_physical_access_control: "Accesso fisico agli uffici controllato",
  ctrl_media_disposal: "Supporti e dispositivi smaltiti in modo sicuro",
  ctrl_cryptography_policy: "Policy crittografica approvata",
  ctrl_network_segmentation: "Rete segmentata per criticita",
  "aws-infra-ec2-running": "Istanza AWS EC2 in esecuzione",
  "aws-infra-security-group-rules-present":
    "Regole security group AWS presenti",
  "aws-infra-s3-backup-recent": "Backup AWS S3 recente",
  "aws-infra-cloudtrail-logging-enabled":
    "Logging AWS CloudTrail abilitato",
  "hetzner-infra-server-running": "Server Hetzner Cloud in esecuzione",
  "hetzner-infra-firewall-present":
    "Regole firewall Hetzner Cloud presenti",
  "hetzner-infra-snapshot-recent": "Snapshot Hetzner Cloud recente",
  "ovhcloud-infra-server-operational": "Server OVHcloud operativo",
  "ovhcloud-infra-firewall-enabled": "Firewall OVHcloud abilitato",
  "ovhcloud-infra-backup-present": "Backup storage OVHcloud presente",
  "abra-flexi-infra-deployment-secured":
    "Distribuzione ABRA Flexi documentata e protetta",
  "abra-flexi-infra-database-protected":
    "Database ABRA Flexi protetto a riposo",
  "abra-flexi-infra-network-restricted":
    "Accesso ad ABRA Flexi limitato dalla rete",
  "abra-flexi-iam-user-accounts":
    "ABRA Flexi usa account utente individuali",
  "abra-flexi-iam-least-privilege":
    "Ruoli ABRA Flexi basati sul minimo privilegio",
  "abra-flexi-iam-offboarding":
    "Offboarding dipendenti revoca l'accesso ad ABRA Flexi",
  "abra-flexi-backup-api": "Backup ABRA Flexi documentati",
  "abra-flexi-backup-schedule":
    "ABRA Flexi ha un piano di backup regolare",
  "abra-flexi-backup-restore-test":
    "Ripristino ABRA Flexi testato regolarmente",
  "abra-flexi-api-https": "API ABRA Flexi usa trasporto sicuro",
  "abra-flexi-api-config-readable":
    "Utente REST API ABRA Flexi con accesso minimo in lettura",
  "abra-flexi-api-credential-rotation":
    "Credenziali API ABRA Flexi ruotate periodicamente",
  ctrl_cloudtrail_enabled: "CloudTrail o audit log equivalente abilitato",
  ctrl_s3_encryption: "Bucket object storage cifrano i dati",
  ctrl_root_account_mfa: "Account root o break-glass protetti da MFA",
  ctrl_isms_scope_defined: "Ambito ISMS definito e approvato",
  ctrl_statement_of_applicability: "Statement of Applicability aggiornato",
  ctrl_security_roles_responsibilities:
    "Ruoli e responsabilita di sicurezza assegnati",
  ctrl_security_policy_approved:
    "Policy di sicurezza delle informazioni approvata",
  ctrl_risk_treatment_plan: "Piano di trattamento del rischio mantenuto",
  ctrl_internal_audit_program: "Programma di audit interno ISMS operativo",
  ctrl_management_review: "La direzione esegue riesami ISMS",
  ctrl_document_control: "Documenti controllati hanno proprietari e versioni",
  ctrl_control_exceptions_tracked:
    "Eccezioni ai controlli tracciate e approvate",
  ctrl_threat_intelligence: "Threat intelligence monitorata e valutata",
  ctrl_information_transfer_rules:
    "Regole per il trasferimento delle informazioni definite",
  ctrl_mobile_device_management: "Dispositivi mobili gestiti",
  ctrl_remote_work_policy:
    "Regole di sicurezza per il lavoro da remoto definite",
  ctrl_identity_lifecycle_policy: "Ciclo di vita delle identita controllato",
  ctrl_supplier_monitoring: "Servizi dei fornitori monitorati periodicamente",
  ctrl_backup_policy: "Policy di backup definisce ambito e ripristino",
  ctrl_clock_sync: "Orologi di sistema sincronizzati",
  ctrl_secure_development_policy: "Sviluppo sicuro governato da policy",
  ctrl_csrd_double_materiality:
    "Valutazione della doppia materialita completata",
  ctrl_csrd_governance_oversight: "Supervisione ESG del board documentata",
  ctrl_csrd_esg_policy: "Policy e obiettivi ESG approvati",
  ctrl_csrd_scope1_emissions: "Emissioni Scope 1 tracciate",
  ctrl_csrd_scope2_emissions: "Emissioni Scope 2 tracciate",
  ctrl_csrd_scope3_emissions: "Emissioni Scope 3 stimate",
  ctrl_csrd_energy_consumption: "Consumo energetico misurato",
  ctrl_csrd_water_usage: "Consumo idrico tracciato",
  ctrl_csrd_waste_management: "Flussi di rifiuti tracciati",
  ctrl_csrd_pollution_incidents: "Incidenti di inquinamento tracciati",
  ctrl_csrd_biodiversity_impact: "Impatti sulla biodiversita valutati",
  ctrl_csrd_climate_risk_assessment: "Rischi climatici valutati",
  ctrl_csrd_workforce_headcount: "Dati della forza lavoro aggiornati",
  ctrl_csrd_health_safety: "Metriche salute e sicurezza tracciate",
  ctrl_csrd_training_hours: "Formazione e sviluppo misurati",
  ctrl_csrd_diversity_metrics: "Metriche di diversita preparate",
  ctrl_csrd_worker_grievance: "Canale per reclami dei lavoratori disponibile",
  ctrl_csrd_supply_chain_due_diligence: "Due diligence fornitori in atto",
  ctrl_csrd_supplier_esg_questionnaire:
    "Questionario ESG fornitori utilizzato",
  ctrl_csrd_customer_privacy:
    "Privacy clienti inclusa nella governance ESG",
  ctrl_csrd_business_conduct_policy:
    "Policy di condotta aziendale approvata",
  ctrl_csrd_anti_corruption_training: "Formazione anticorruzione tracciata",
  ctrl_csrd_tax_transparency:
    "Trasparenza fiscale e pagamenti documentata",
  ctrl_csrd_report_approval: "Approvazione del report ESG verificabile",
};

function firstPresent(...values: Array<string | null | undefined>) {
  return values.find((value): value is string => Boolean(value?.trim())) ?? "";
}

export function getControlDisplayTitle(
  control: ControlDisplayText,
  locale: Locale,
) {
  const titleByLocale: Record<Locale, string | null | undefined> = {
    "cs-CZ": control.titleCs,
    "en-EU": control.titleEn,
    "it-IT": control.titleIt ?? italianControlTitles[control.key],
  };

  return firstPresent(
    titleByLocale[locale],
    control.titleEn,
    control.titleCs,
    control.title,
  );
}

export function getControlDisplayDescription(
  control: ControlDisplayText,
  locale: Locale,
) {
  const descriptionByLocale: Record<Locale, string | null | undefined> = {
    "cs-CZ": control.descriptionCs,
    "en-EU": control.descriptionEn,
    "it-IT": control.descriptionIt,
  };

  return firstPresent(
    descriptionByLocale[locale],
    control.description,
    getControlDisplayTitle(control, locale),
  );
}
