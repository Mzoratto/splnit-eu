import type { FrameworkSlug } from "@/lib/controls/library";

export type FrameworkQuestion = {
  id: string;
  text: string;
  help: string;
  controlKeys: string[];
};

export type FrameworkAnswer = "yes" | "partial" | "no" | "na";
export type FrameworkAnswers = Record<string, FrameworkAnswer>;

const sharedSecurityQuestions: FrameworkQuestion[] = [
  {
    id: "mfa",
    text: "Je MFA povinné pro všechny uživatelské účty?",
    help: "Zahrňte hlavní identitu, administrátory a vzdálený přístup.",
    controlKeys: ["ctrl_mfa_all_users", "ctrl_password_policy"],
  },
  {
    id: "privileged_access",
    text: "Probíhá pravidelný přezkum privilegovaných účtů?",
    help: "Minimálně kvartálně nebo při změně role.",
    controlKeys: ["ctrl_privileged_access_reviewed"],
  },
  {
    id: "guest_access",
    text: "Jsou externí a hostovské účty řízené a odebírané?",
    help: "Neaktivní hosté by měli být detekováni a revokováni.",
    controlKeys: ["ctrl_guest_access_controlled", "ctrl_offboarding_access_revoked"],
  },
  {
    id: "training",
    text: "Absolvují zaměstnanci pravidelné bezpečnostní školení?",
    help: "Nástupní školení a roční opakování s evidencí.",
    controlKeys: ["ctrl_security_training_annual"],
  },
  {
    id: "incident_plan",
    text: "Máte schválený plán reakce na incidenty?",
    help: "Včetně rolí, eskalace, komunikace a revize.",
    controlKeys: ["ctrl_incident_plan_documented"],
  },
  {
    id: "incident_reporting",
    text: "Umíte sledovat a splnit 72hodinové oznamovací lhůty?",
    help: "GDPR a NIS2 mají přísné lhůty na hlášení incidentů.",
    controlKeys: ["ctrl_incident_72h_notification"],
  },
  {
    id: "encryption",
    text: "Jsou citlivá data šifrovaná v klidu?",
    help: "Databáze, úložiště, notebooky a zálohy.",
    controlKeys: ["ctrl_data_encrypted_at_rest", "ctrl_device_encryption"],
  },
  {
    id: "patching",
    text: "Máte řízený proces patch managementu?",
    help: "Sledujte kritické zranitelnosti, termíny a výjimky.",
    controlKeys: ["ctrl_patch_management", "ctrl_vulnerability_management"],
  },
  {
    id: "backups",
    text: "Testujete obnovu ze záloh?",
    help: "Nestačí zálohy vytvářet; obnova musí být pravidelně ověřená.",
    controlKeys: ["ctrl_backup_tested", "ctrl_disaster_recovery_test"],
  },
  {
    id: "logging",
    text: "Sbíráte bezpečnostní logy a upozornění?",
    help: "Pokryjte cloud, identitu, endpointy a kritické aplikace.",
    controlKeys: ["ctrl_logging_monitoring", "ctrl_security_event_alerting"],
  },
  {
    id: "suppliers",
    text: "Hodnotíte bezpečnost dodavatelů a smluvní požadavky?",
    help: "NIS2 i ISO 27001 vyžadují supply-chain kontrolu.",
    controlKeys: ["ctrl_vendor_security_assessment", "ctrl_supplier_contract_security"],
  },
  {
    id: "asset_inventory",
    text: "Vedete aktuální inventář aktiv a systémů?",
    help: "Zahrňte SaaS, cloud, endpointy, aplikace a odpovědné vlastníky.",
    controlKeys: ["ctrl_asset_inventory", "ctrl_data_classification"],
  },
];

export const FRAMEWORK_QUESTIONS: Record<FrameworkSlug, FrameworkQuestion[]> = {
  nis2: [
    ...sharedSecurityQuestions,
    {
      id: "business_continuity",
      text: "Máte zdokumentovaný plán kontinuity provozu?",
      help: "Včetně odpovědných osob, obnovovacích cílů a závislostí.",
      controlKeys: ["ctrl_business_continuity_plan"],
    },
    {
      id: "secure_baseline",
      text: "Používáte bezpečnostní baseline pro konfiguraci systémů?",
      help: "Například hardened nastavení M365, AWS nebo endpointů.",
      controlKeys: ["ctrl_secure_configuration_baseline", "ctrl_conditional_access"],
    },
    {
      id: "network_segmentation",
      text: "Jsou kritické systémy síťově oddělené?",
      help: "Segmentace omezuje dopad kompromitace.",
      controlKeys: ["ctrl_network_segmentation"],
    },
    {
      id: "change_management",
      text: "Jsou změny kritických systémů schvalované a dohledatelné?",
      help: "Zahrňte změny konfigurace, infrastruktury a aplikací.",
      controlKeys: ["ctrl_change_management"],
    },
    {
      id: "penetration_test",
      text: "Probíhá alespoň roční penetrační test nebo bezpečnostní audit?",
      help: "Zaměřte se na internet-facing systémy a kritické procesy.",
      controlKeys: ["ctrl_penetration_test_annual"],
    },
    {
      id: "endpoint_protection",
      text: "Jsou endpointy chráněné EDR/AV a centrálně spravované?",
      help: "Pokryjte firemní notebooky, servery a mobilní zařízení.",
      controlKeys: ["ctrl_endpoint_protection"],
    },
  ],
  "ai-act": [
    {
      id: "ai_inventory",
      text: "Vedete inventář používaných AI systémů?",
      help: "Uveďte účel, dodavatele, vlastníka, data a rizikovou kategorii.",
      controlKeys: ["ctrl_ai_system_inventory"],
    },
    {
      id: "ai_literacy",
      text: "Mají zaměstnanci pracující s AI školení AI gramotnosti?",
      help: "Článek 4 platí široce pro deployery i poskytovatele.",
      controlKeys: ["ctrl_ai_literacy_training", "ctrl_security_training_annual"],
    },
    {
      id: "prohibited_practices",
      text: "Prověřili jste, že AI nepoužívá zakázané praktiky?",
      help: "Například social scoring nebo emotion recognition na pracovišti.",
      controlKeys: ["ctrl_ai_prohibited_practices_review"],
    },
    {
      id: "high_risk_classification",
      text: "Klasifikujete, zda AI spadá do vysoce rizikových kategorií?",
      help: "HR, vzdělávání, úvěry, biometrie a kritická infrastruktura.",
      controlKeys: ["ctrl_ai_high_risk_provider_verification"],
    },
    {
      id: "provider_verification",
      text: "Ověřujete compliance poskytovatele vysoce rizikové AI?",
      help: "CE označení, EU prohlášení o shodě a instrukce k použití.",
      controlKeys: ["ctrl_ai_high_risk_provider_verification", "ctrl_vendor_security_assessment"],
    },
    {
      id: "human_oversight",
      text: "Je nastavený lidský dohled u AI rozhodnutí?",
      help: "Odpovědná osoba musí umět zásah posoudit, přerušit nebo zvrátit.",
      controlKeys: ["ctrl_ai_human_oversight"],
    },
    {
      id: "ai_logs",
      text: "Uchováváte logy použití vysoce rizikové AI alespoň 6 měsíců?",
      help: "Zahrňte automatické logy i manuální záznamy použití.",
      controlKeys: ["ctrl_ai_log_retention", "ctrl_logging_monitoring"],
    },
    {
      id: "individual_notice",
      text: "Informujete dotčené osoby o AI asistovaném rozhodování?",
      help: "Zejména u HR, zákaznických rozhodnutí a veřejných služeb.",
      controlKeys: ["ctrl_ai_individual_notice", "ctrl_privacy_notice_current"],
    },
    {
      id: "content_labeling",
      text: "Označujete AI generovaný obsah tam, kde je to nutné?",
      help: "Chatboty, syntetický obsah a deepfake výstupy.",
      controlKeys: ["ctrl_ai_content_labeling"],
    },
    {
      id: "data_governance",
      text: "Máte pravidla pro vstupní data, osobní údaje a citlivé informace v AI?",
      help: "Propojuje AI governance s GDPR a klasifikací dat.",
      controlKeys: ["ctrl_data_classification", "ctrl_data_processing_inventory"],
    },
    {
      id: "incident_monitoring",
      text: "Umíte zachytit a řešit incident nebo špatný výstup AI systému?",
      help: "Zahrňte eskalaci, nápravná opatření a auditní záznam.",
      controlKeys: ["ctrl_incident_plan_documented"],
    },
    {
      id: "supplier_contracts",
      text: "Mají AI dodavatelé smluvní bezpečnostní a compliance požadavky?",
      help: "Doložte role, data, odpovědnosti a podmínky ukončení.",
      controlKeys: ["ctrl_supplier_contract_security"],
    },
  ],
  gdpr: [
    ...sharedSecurityQuestions.slice(0, 8),
    {
      id: "ropa",
      text: "Vedete záznamy o činnostech zpracování osobních údajů?",
      help: "ROPA podle článku 30 GDPR.",
      controlKeys: ["ctrl_data_processing_inventory"],
    },
    {
      id: "privacy_notice",
      text: "Je privacy notice aktuální a srozumitelná?",
      help: "Popis účelů, právních základů, příjemců a práv subjektů.",
      controlKeys: ["ctrl_privacy_notice_current"],
    },
    {
      id: "dsr",
      text: "Máte proces pro žádosti subjektů údajů?",
      help: "Přístup, výmaz, oprava, přenositelnost a námitka.",
      controlKeys: ["ctrl_dsr_process"],
    },
    {
      id: "retention",
      text: "Máte retenční plán a pravidla mazání dat?",
      help: "Osobní údaje se nemají uchovávat déle, než je nutné.",
      controlKeys: ["ctrl_data_retention_schedule"],
    },
    {
      id: "dpia",
      text: "Provádíte DPIA pro riziková zpracování?",
      help: "Například monitoring, profilování nebo rozsáhlá citlivá data.",
      controlKeys: ["ctrl_dpia_process"],
    },
    {
      id: "processors",
      text: "Máte s procesory uzavřené DPA a bezpečnostní požadavky?",
      help: "Dodavatelé zpracovávající osobní údaje musí mít smluvní režim.",
      controlKeys: ["ctrl_supplier_contract_security", "ctrl_vendor_security_assessment"],
    },
    {
      id: "classification",
      text: "Klasifikujete osobní a citlivá data v systémech?",
      help: "Pomáhá řídit přístupy, šifrování a retenční pravidla.",
      controlKeys: ["ctrl_data_classification"],
    },
  ],
  iso27001: [
    ...sharedSecurityQuestions,
    {
      id: "physical_access",
      text: "Jsou kanceláře a citlivé prostory fyzicky chráněné?",
      help: "Přístupy, návštěvy a evidence fyzických médií.",
      controlKeys: ["ctrl_physical_access_control"],
    },
    {
      id: "media_disposal",
      text: "Likvidujete média a zařízení bezpečným způsobem?",
      help: "Mazání disků, skartace a protokol o likvidaci.",
      controlKeys: ["ctrl_media_disposal"],
    },
    {
      id: "crypto_policy",
      text: "Máte politiku kryptografie a správy klíčů?",
      help: "Šifrování, rotace klíčů a odpovědnosti.",
      controlKeys: ["ctrl_cryptography_policy", "ctrl_data_encrypted_at_rest"],
    },
    {
      id: "code_review",
      text: "Vyžadujete code review a ochranu hlavních větví?",
      help: "Platí pro vývojové týmy a kritické repozitáře.",
      controlKeys: ["ctrl_code_review_required", "ctrl_branch_protection_enabled"],
    },
    {
      id: "secrets",
      text: "Řídíte tajemství a detekujete úniky v kódu?",
      help: "Secret scanning, rotace tokenů a minimální oprávnění.",
      controlKeys: ["ctrl_secrets_management"],
    },
    {
      id: "dependency_alerts",
      text: "Sledujete zranitelnosti závislostí?",
      help: "Dependency alerts, SBOM nebo pravidelný vulnerability scan.",
      controlKeys: ["ctrl_dependency_vulnerability_monitoring"],
    },
    {
      id: "cloud_audit",
      text: "Máte cloud audit logy a základní bezpečnostní kontroly?",
      help: "CloudTrail, root MFA, šifrování S3 nebo ekvivalenty.",
      controlKeys: ["ctrl_cloudtrail_enabled", "ctrl_root_account_mfa", "ctrl_s3_encryption"],
    },
    {
      id: "change_management_iso",
      text: "Je změnové řízení auditovatelné?",
      help: "Schválení, testování, rollback a vlastník změny.",
      controlKeys: ["ctrl_change_management"],
    },
    {
      id: "isms_governance",
      text: "Máte definovaný rozsah ISMS, SoA a plán ošetření rizik?",
      help: "Certifikační audit bude hledat rozsah, Statement of Applicability a vazbu rizik na opatření.",
      controlKeys: [
        "ctrl_isms_scope_defined",
        "ctrl_statement_of_applicability",
        "ctrl_risk_treatment_plan",
      ],
    },
    {
      id: "isms_review",
      text: "Probíhá interní audit a přezkum vedením?",
      help: "ISO 27001 vyžaduje doložitelný cyklus interních auditů, náprav a management review.",
      controlKeys: ["ctrl_internal_audit_program", "ctrl_management_review"],
    },
    {
      id: "document_control",
      text: "Máte řízenou dokumentaci a schvalované výjimky?",
      help: "Politiky, postupy, výjimky a záznamy musí mít vlastníka, verzi a revizi.",
      controlKeys: ["ctrl_document_control", "ctrl_control_exceptions_tracked"],
    },
    {
      id: "remote_and_mobile",
      text: "Jsou mobilní zařízení a práce na dálku bezpečnostně řízené?",
      help: "Zahrňte MDM, šifrování, vzdálené smazání, VPN a pravidla domácí práce.",
      controlKeys: ["ctrl_mobile_device_management", "ctrl_remote_work_policy"],
    },
  ],
  csrd: [
    {
      id: "materiality",
      text: "Máte provedenou dvojí materialitu a schválené ESG priority?",
      help: "CSRD vyžaduje vyhodnotit dopady firmy i finanční dopad ESG témat na firmu.",
      controlKeys: [
        "ctrl_csrd_double_materiality",
        "ctrl_csrd_esg_policy",
        "ctrl_csrd_governance_oversight",
      ],
    },
    {
      id: "emissions",
      text: "Měříte Scope 1, Scope 2 a relevantní Scope 3 emise?",
      help: "U každého čísla musí být jasný zdroj dat, metoda a vlastník.",
      controlKeys: [
        "ctrl_csrd_scope1_emissions",
        "ctrl_csrd_scope2_emissions",
        "ctrl_csrd_scope3_emissions",
      ],
    },
    {
      id: "resource_use",
      text: "Evidujete energii, vodu, odpad a environmentální incidenty?",
      help: "Základní environmentální data musí být auditovatelná a pravidelně aktualizovaná.",
      controlKeys: [
        "ctrl_csrd_energy_consumption",
        "ctrl_csrd_water_usage",
        "ctrl_csrd_waste_management",
        "ctrl_csrd_pollution_incidents",
      ],
    },
    {
      id: "environmental_risk",
      text: "Posuzujete klimatická rizika a dopady na biodiverzitu?",
      help: "Pokud téma není relevantní, udržujte zdůvodnění v materialitním posouzení.",
      controlKeys: [
        "ctrl_csrd_climate_risk_assessment",
        "ctrl_csrd_biodiversity_impact",
      ],
    },
    {
      id: "workforce",
      text: "Máte data o pracovní síle, BOZP, školení a diverzitě?",
      help: "Sociální metriky musí respektovat lokální pracovněprávní a privacy limity.",
      controlKeys: [
        "ctrl_csrd_workforce_headcount",
        "ctrl_csrd_health_safety",
        "ctrl_csrd_training_hours",
        "ctrl_csrd_diversity_metrics",
        "ctrl_csrd_worker_grievance",
      ],
    },
    {
      id: "supply_chain",
      text: "Hodnotíte ESG rizika v dodavatelském řetězci?",
      help: "Dodavatelský dotazník a due diligence pomáhají odpovídat enterprise zákazníkům.",
      controlKeys: [
        "ctrl_csrd_supply_chain_due_diligence",
        "ctrl_csrd_supplier_esg_questionnaire",
      ],
    },
    {
      id: "governance",
      text: "Máte politiku obchodního jednání a protikorupční školení?",
      help: "Governance část pokrývá etiku, střety zájmů, korupci a schvalování.",
      controlKeys: [
        "ctrl_csrd_business_conduct_policy",
        "ctrl_csrd_anti_corruption_training",
        "ctrl_csrd_customer_privacy",
        "ctrl_csrd_tax_transparency",
      ],
    },
    {
      id: "report_approval",
      text: "Je ESG report schvalovaný s auditovatelnou stopou dat?",
      help: "Před exportem musí být jasné, kdo data dodal, ověřil a schválil.",
      controlKeys: ["ctrl_csrd_report_approval"],
    },
  ],
};

export function getQuestionsForFramework(slug: FrameworkSlug) {
  return FRAMEWORK_QUESTIONS[slug];
}
