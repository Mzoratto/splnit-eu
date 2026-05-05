import { NIS2_EVIDENCE_REQUIREMENTS_BY_CONTROL } from "./evidence-requirements";

export type FrameworkSlug = "nis2" | "ai-act" | "gdpr" | "iso27001" | "csrd";

export type ControlCategory =
  | "access_control"
  | "training"
  | "incident"
  | "data_protection"
  | "asset_management"
  | "supplier"
  | "physical"
  | "business_continuity"
  | "ai_governance"
  | "governance"
  | "esg_environment"
  | "esg_social"
  | "esg_governance";

export type ControlSeed = {
  key: string;
  titleCs: string;
  titleEn: string;
  descriptionCs?: string;
  category: ControlCategory;
  testType: "automated" | "manual" | "hybrid";
  requiresEvidence: boolean;
  isAutomated: boolean;
  frameworkMappings: {
    frameworkSlug: FrameworkSlug;
    articleRef: string;
    regulatorGuidance?: string;
    evidenceRequirements?: string;
    localizedTitle?: string;
    localizedDescription?: string;
    level: "mandatory" | "recommended" | "optional";
  }[];
};

const BASE_CONTROL_LIBRARY: ControlSeed[] = [
  {
    key: "ctrl_mfa_all_users",
    titleCs: "MFA povoleno pro všechny uživatele",
    titleEn: "MFA enabled for all user accounts",
    descriptionCs:
      "Všechny uživatelské účty v primárních identitních systémech mají vícefaktorové ověření.",
    category: "access_control",
    testType: "automated",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(j)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.9.4.2", level: "mandatory" },
      { frameworkSlug: "gdpr", articleRef: "Article 32(1)(b)", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_privileged_access_reviewed",
    titleCs: "Přístup privilegovaných uživatelů je pravidelně přezkoumaný",
    titleEn: "Privileged user access is periodically reviewed",
    descriptionCs:
      "Organizace pravidelně kontroluje účty s administrátorskými oprávněními a udržuje jejich počet minimální.",
    category: "access_control",
    testType: "hybrid",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(i)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.9.2.3", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_offboarding_access_revoked",
    titleCs: "Přístup odstraněn při odchodu zaměstnance",
    titleEn: "Access revoked within 24h of employee departure",
    descriptionCs:
      "Přístup bývalých zaměstnanců je zrušen nebo deaktivován nejpozději do 24 hodin od odchodu.",
    category: "access_control",
    testType: "automated",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "iso27001", articleRef: "A.9.2.6", level: "mandatory" },
      { frameworkSlug: "gdpr", articleRef: "Article 32", level: "recommended" },
    ],
  },
  {
    key: "ctrl_guest_access_controlled",
    titleCs: "Externí a hostovské účty jsou kontrolované",
    titleEn: "Guest and external user access is controlled",
    descriptionCs:
      "Neaktivní hostovské účty jsou pravidelně identifikovány a revokovány.",
    category: "access_control",
    testType: "automated",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(i)", level: "recommended" },
      { frameworkSlug: "iso27001", articleRef: "A.9.2.1", level: "mandatory" },
      { frameworkSlug: "gdpr", articleRef: "Article 32", level: "recommended" },
    ],
  },
  {
    key: "ctrl_security_training_annual",
    titleCs: "Zaměstnanci absolvují roční bezpečnostní školení",
    titleEn: "All staff complete annual security awareness training",
    descriptionCs:
      "Všichni zaměstnanci dokončí bezpečnostní školení při nástupu a nejméně jednou ročně.",
    category: "training",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(g)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.7.2.2", level: "mandatory" },
      { frameworkSlug: "ai-act", articleRef: "Article 4", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_incident_plan_documented",
    titleCs: "Plán reakce na incidenty je zdokumentován a přezkoumaný",
    titleEn: "Incident response plan is documented and reviewed annually",
    descriptionCs:
      "Organizace má schválený plán reakce na incidenty s určenými rolemi, eskalací a revizí.",
    category: "incident",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(b)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.16.1.1", level: "mandatory" },
      { frameworkSlug: "gdpr", articleRef: "Article 33", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_incident_72h_notification",
    titleCs: "Incidenty hlášeny do 72 hodin příslušnému orgánu",
    titleEn: "Security incidents reported to authority within 72 hours",
    descriptionCs:
      "Proces incidentů sleduje zákonné lhůty pro oznámení příslušnému dozorovému nebo regulatornímu orgánu.",
    category: "incident",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      {
        frameworkSlug: "nis2",
        articleRef: "Article 23",
        regulatorGuidance:
          "V českém NIS2 kontextu se významné kybernetické incidenty posuzují vůči NÚKIB podle příslušné transpozice a metodiky.",
        level: "mandatory",
      },
      {
        frameworkSlug: "gdpr",
        articleRef: "Article 33",
        regulatorGuidance:
          "V českém GDPR kontextu se porušení zabezpečení osobních údajů posuzuje vůči ÚOOÚ podle GDPR čl. 33.",
        level: "mandatory",
      },
    ],
  },
  {
    key: "ctrl_data_encrypted_at_rest",
    titleCs: "Data jsou šifrována v klidu",
    titleEn: "Sensitive data is encrypted at rest",
    descriptionCs:
      "Citlivá data jsou chráněna šifrováním v úložištích a klasifikačními pravidly.",
    category: "data_protection",
    testType: "automated",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "gdpr", articleRef: "Article 32(1)(a)", level: "mandatory" },
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(h)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.10.1.1", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_data_processing_inventory",
    titleCs: "Záznamy o zpracování osobních údajů jsou vedeny",
    titleEn: "Records of processing activities are maintained",
    descriptionCs:
      "Organizace vede ROPA podle GDPR včetně účelů, kategorií subjektů a příjemců.",
    category: "data_protection",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "gdpr", articleRef: "Article 30", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_ai_system_inventory",
    titleCs: "Inventář AI systémů je aktualizován",
    titleEn: "AI system inventory is maintained and up to date",
    descriptionCs:
      "Organizace eviduje název systému, dodavatele, účel, roli, rizikovou klasifikaci a poslední přezkum.",
    category: "ai_governance",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "ai-act", articleRef: "Article 3 / Article 26", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_ai_literacy_training",
    titleCs: "Zaměstnanci absolvují školení AI gramotnosti",
    titleEn: "Staff complete AI literacy training",
    descriptionCs:
      "Všichni zaměstnanci pracující s AI systémy mají dostatečnou AI gramotnost podle článku 4.",
    category: "training",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "ai-act", articleRef: "Article 4", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_ai_prohibited_practices_review",
    titleCs: "AI systémy neprovádějí zakázané praktiky",
    titleEn: "AI systems do not perform prohibited practices",
    descriptionCs:
      "Organizace prověřila, že nepoužívá sociální scoring, rozpoznávání emocí na pracovišti ani jiné zakázané praktiky.",
    category: "ai_governance",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "ai-act", articleRef: "Article 5", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_ai_high_risk_provider_verification",
    titleCs: "Poskytovatel vysoce rizikové AI byl ověřen",
    titleEn: "High-risk AI provider compliance has been verified",
    descriptionCs:
      "Před použitím vysoce rizikového AI systému je ověřeno CE označení, prohlášení o shodě a technická dokumentace.",
    category: "ai_governance",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "ai-act", articleRef: "Article 26(1)", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_ai_human_oversight",
    titleCs: "Vysoce riziková AI má mechanismy lidského dohledu",
    titleEn: "High-risk AI has human oversight mechanisms",
    descriptionCs:
      "Odpovědní zaměstnanci mohou monitorovat, přerušit nebo zvrátit AI asistovaná rozhodnutí.",
    category: "ai_governance",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "ai-act", articleRef: "Article 14 / Article 26(2)", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_ai_log_retention",
    titleCs: "Logy vysoce rizikové AI jsou uchovávány minimálně 6 měsíců",
    titleEn: "High-risk AI logs are retained for at least 6 months",
    descriptionCs:
      "Automaticky generované protokoly nebo manuální záznamy o použití jsou uchovávány nejméně 6 měsíců.",
    category: "ai_governance",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "ai-act", articleRef: "Article 26(6)", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_ai_individual_notice",
    titleCs: "Dotčené osoby jsou informovány o AI asistovaném rozhodování",
    titleEn: "Affected individuals are informed about AI-assisted decisions",
    descriptionCs:
      "Osoby dotčené AI asistovaným rozhodnutím jsou informovány, že byl AI systém použit.",
    category: "ai_governance",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "ai-act", articleRef: "Article 26(11)", level: "mandatory" },
      { frameworkSlug: "gdpr", articleRef: "Article 22", level: "recommended" },
    ],
  },
  {
    key: "ctrl_ai_content_labeling",
    titleCs: "AI generovaný obsah je označen",
    titleEn: "AI-generated content is labelled",
    descriptionCs:
      "Text, obraz, audio nebo video generované AI je označeno podle transparentních povinností.",
    category: "ai_governance",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "ai-act", articleRef: "Article 50", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_conditional_access",
    titleCs: "Podmíněný přístup je vynucen pro riziková přihlášení",
    titleEn: "Conditional access is enforced for risky sign-ins",
    descriptionCs:
      "Přihlášení z neznámých zařízení, zemí nebo rizikových relací vyžadují další ověření nebo blokaci.",
    category: "access_control",
    testType: "automated",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(j)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.9.4.2", level: "mandatory" },
      { frameworkSlug: "gdpr", articleRef: "Article 32(1)(b)", level: "recommended" },
    ],
  },
  {
    key: "ctrl_password_policy",
    titleCs: "Politika hesel a blokace účtů je nastavena",
    titleEn: "Password and account lockout policy is configured",
    descriptionCs:
      "Hesla, blokace po neúspěšných pokusech a zákaz opakovaného použití jsou nastavené v identitním systému.",
    category: "access_control",
    testType: "automated",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(j)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.9.4.3", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_device_encryption",
    titleCs: "Firemní zařízení používají šifrování disku",
    titleEn: "Company devices use full-disk encryption",
    descriptionCs:
      "Notebooky a pracovní stanice s firemními daty mají zapnuté šifrování disku a obnovovací klíče jsou spravované.",
    category: "data_protection",
    testType: "hybrid",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(h)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.10.1.1", level: "mandatory" },
      { frameworkSlug: "gdpr", articleRef: "Article 32(1)(a)", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_endpoint_protection",
    titleCs: "Koncová zařízení mají aktivní ochranu",
    titleEn: "Endpoint protection is active on managed devices",
    descriptionCs:
      "Spravovaná zařízení používají EDR nebo antivirus s aktivním monitoringem a automatickými aktualizacemi.",
    category: "asset_management",
    testType: "automated",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(e)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.12.2.1", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_patch_management",
    titleCs: "Bezpečnostní aktualizace jsou řízené a sledované",
    titleEn: "Security patching is managed and tracked",
    descriptionCs:
      "Kritické aktualizace operačních systémů a aplikací jsou nasazované v definovaných lhůtách.",
    category: "asset_management",
    testType: "hybrid",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(e)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.12.6.1", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_backup_tested",
    titleCs: "Zálohy jsou pravidelně testované",
    titleEn: "Backups are tested regularly",
    descriptionCs:
      "Kritická data jsou zálohovaná a obnovení je testované alespoň jednou za čtvrtletí.",
    category: "business_continuity",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(c)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.12.3.1", level: "mandatory" },
      { frameworkSlug: "gdpr", articleRef: "Article 32(1)(c)", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_business_continuity_plan",
    titleCs: "Plán kontinuity provozu je zdokumentovaný",
    titleEn: "Business continuity plan is documented",
    descriptionCs:
      "Organizace má schválený plán obnovy kritických procesů, vlastníky a prioritizaci služeb.",
    category: "business_continuity",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(c)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.17.1.1", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_disaster_recovery_test",
    titleCs: "Obnova po havárii je pravidelně testovaná",
    titleEn: "Disaster recovery is tested regularly",
    descriptionCs:
      "Postupy obnovy systémů a dat jsou testované a výsledky testů vedou k nápravným opatřením.",
    category: "business_continuity",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(c)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.17.1.3", level: "mandatory" },
      { frameworkSlug: "gdpr", articleRef: "Article 32(1)(c)", level: "recommended" },
    ],
  },
  {
    key: "ctrl_asset_inventory",
    titleCs: "Inventář aktiv je úplný a aktuální",
    titleEn: "Asset inventory is complete and current",
    descriptionCs:
      "Hardware, software, cloudové služby a datová aktiva mají vlastníka, klasifikaci a datum poslední revize.",
    category: "asset_management",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(a)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.8.1.1", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_data_classification",
    titleCs: "Data jsou klasifikována podle citlivosti",
    titleEn: "Data is classified by sensitivity",
    descriptionCs:
      "Organizace rozlišuje veřejná, interní, důvěrná a osobní data a podle klasifikace volí ochranná opatření.",
    category: "data_protection",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "iso27001", articleRef: "A.8.2.1", level: "mandatory" },
      { frameworkSlug: "gdpr", articleRef: "Article 32", level: "recommended" },
    ],
  },
  {
    key: "ctrl_dpia_process",
    titleCs: "Proces DPIA je zaveden pro riziková zpracování",
    titleEn: "DPIA process exists for high-risk processing",
    descriptionCs:
      "Pro nové nebo rizikové zpracování osobních údajů organizace vyhodnocuje potřebu DPIA a uchovává výstupy.",
    category: "data_protection",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "gdpr", articleRef: "Article 35", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.18.1.4", level: "recommended" },
    ],
  },
  {
    key: "ctrl_privacy_notice_current",
    titleCs: "Informace o zpracování osobních údajů jsou aktuální",
    titleEn: "Privacy notice is current",
    descriptionCs:
      "Zákazníci, zaměstnanci a další subjekty údajů mají dostupné aktuální informace o zpracování.",
    category: "data_protection",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "gdpr", articleRef: "Articles 13-14", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_dsr_process",
    titleCs: "Žádosti subjektů údajů jsou řízené",
    titleEn: "Data subject requests are managed",
    descriptionCs:
      "Organizace má proces pro příjem, ověření, vyřízení a evidenci žádostí subjektů údajů v zákonných lhůtách.",
    category: "data_protection",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "gdpr", articleRef: "Articles 15-22", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_data_retention_schedule",
    titleCs: "Doby uchování dat jsou definované a uplatňované",
    titleEn: "Data retention schedule is defined and enforced",
    descriptionCs:
      "Pro hlavní kategorie dat jsou definované retenční doby, právní důvody a postup bezpečné likvidace.",
    category: "data_protection",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "gdpr", articleRef: "Article 5(1)(e)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.18.1.3", level: "recommended" },
    ],
  },
  {
    key: "ctrl_vendor_security_assessment",
    titleCs: "Dodavatelé jsou bezpečnostně hodnoceni",
    titleEn: "Vendors are assessed for security risk",
    descriptionCs:
      "Kritičtí dodavatelé jsou hodnoceni před nákupem a pravidelně podle rizika služby.",
    category: "supplier",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(d)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.15.1.1", level: "mandatory" },
      { frameworkSlug: "gdpr", articleRef: "Article 28", level: "recommended" },
    ],
  },
  {
    key: "ctrl_supplier_contract_security",
    titleCs: "Smlouvy s dodavateli obsahují bezpečnostní požadavky",
    titleEn: "Supplier contracts include security requirements",
    descriptionCs:
      "Smlouvy s kritickými dodavateli upravují bezpečnost, hlášení incidentů, auditní práva a ochranu dat.",
    category: "supplier",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(d)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.15.1.2", level: "mandatory" },
      { frameworkSlug: "gdpr", articleRef: "Article 28", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_code_review_required",
    titleCs: "Změny kódu vyžadují revizi",
    titleEn: "Code changes require peer review",
    descriptionCs:
      "Produkční větve vyžadují pull request, minimálně jednu revizi a úspěšné kontroly před sloučením.",
    category: "asset_management",
    testType: "automated",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(e)", level: "recommended" },
      { frameworkSlug: "iso27001", articleRef: "A.14.2.2", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_secrets_management",
    titleCs: "Tajemství a klíče nejsou v kódu",
    titleEn: "Secrets and keys are not stored in source code",
    descriptionCs:
      "Repozitáře mají zapnuté skenování tajemství a produkční klíče se ukládají ve spravovaném úložišti.",
    category: "data_protection",
    testType: "automated",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(h)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.10.1.2", level: "mandatory" },
      { frameworkSlug: "gdpr", articleRef: "Article 32(1)(a)", level: "recommended" },
    ],
  },
  {
    key: "ctrl_branch_protection_enabled",
    titleCs: "Produkční větve jsou chráněné",
    titleEn: "Production branches are protected",
    descriptionCs:
      "Hlavní větve vyžadují schválení, CI kontroly a blokují přímý push bez revize.",
    category: "asset_management",
    testType: "automated",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "iso27001", articleRef: "A.12.1.2", level: "recommended" },
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(e)", level: "recommended" },
    ],
  },
  {
    key: "ctrl_dependency_vulnerability_monitoring",
    titleCs: "Zranitelnosti závislostí jsou monitorované",
    titleEn: "Dependency vulnerabilities are monitored",
    descriptionCs:
      "Projekt sleduje bezpečnostní upozornění v závislostech a kritické nálezy mají vlastníka a lhůtu nápravy.",
    category: "asset_management",
    testType: "automated",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(e)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.12.6.1", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_logging_monitoring",
    titleCs: "Bezpečnostní logy jsou centralizované",
    titleEn: "Security logs are centralized",
    descriptionCs:
      "Kritické systémy posílají auditní a bezpečnostní logy do centrálního úložiště s řízeným přístupem.",
    category: "incident",
    testType: "hybrid",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(b)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.12.4.1", level: "mandatory" },
      { frameworkSlug: "gdpr", articleRef: "Article 32(1)(d)", level: "recommended" },
    ],
  },
  {
    key: "ctrl_security_event_alerting",
    titleCs: "Bezpečnostní události generují upozornění",
    titleEn: "Security events generate alerts",
    descriptionCs:
      "Rizikové přihlášení, změny privilegovaných rolí a podezřelé aktivity generují upozornění pro odpovědný tým.",
    category: "incident",
    testType: "automated",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(b)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.16.1.4", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_vulnerability_management",
    titleCs: "Zranitelnosti jsou evidované a řízené",
    titleEn: "Vulnerabilities are tracked and remediated",
    descriptionCs:
      "Zranitelnosti z interních i externích zdrojů jsou prioritizované podle závažnosti a mají termín nápravy.",
    category: "asset_management",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(e)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.12.6.1", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_penetration_test_annual",
    titleCs: "Penetrační testy probíhají alespoň ročně",
    titleEn: "Penetration testing is performed at least annually",
    descriptionCs:
      "Internetově dostupné aplikace a kritické systémy jsou testované a nálezy jsou sledované do uzavření.",
    category: "asset_management",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(e)", level: "recommended" },
      { frameworkSlug: "iso27001", articleRef: "A.14.2.8", level: "recommended" },
    ],
  },
  {
    key: "ctrl_secure_configuration_baseline",
    titleCs: "Bezpečné konfigurační baseline jsou definované",
    titleEn: "Secure configuration baselines are defined",
    descriptionCs:
      "Cloudové účty, identita, koncová zařízení a produkční systémy mají definované minimální bezpečnostní nastavení.",
    category: "asset_management",
    testType: "hybrid",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(e)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.12.1.2", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_change_management",
    titleCs: "Produkční změny jsou řízené",
    titleEn: "Production changes are controlled",
    descriptionCs:
      "Změny v produkci mají vlastníka, schválení, plán nasazení a možnost návratu.",
    category: "asset_management",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "iso27001", articleRef: "A.12.1.2", level: "mandatory" },
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(e)", level: "recommended" },
    ],
  },
  {
    key: "ctrl_physical_access_control",
    titleCs: "Fyzický přístup k pracovišti je řízený",
    titleEn: "Physical access to offices is controlled",
    descriptionCs:
      "Přístup do kanceláří, serveroven a skladů zařízení je omezený na oprávněné osoby a pravidelně revidovaný.",
    category: "physical",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "iso27001", articleRef: "A.11.1.1", level: "mandatory" },
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(i)", level: "recommended" },
    ],
  },
  {
    key: "ctrl_media_disposal",
    titleCs: "Média a zařízení jsou bezpečně likvidována",
    titleEn: "Media and devices are securely disposed",
    descriptionCs:
      "Disky, telefony a nosiče dat jsou před likvidací nebo převedením vymazané či zničené podle postupu.",
    category: "physical",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "iso27001", articleRef: "A.8.3.2", level: "mandatory" },
      { frameworkSlug: "gdpr", articleRef: "Article 32(1)(a)", level: "recommended" },
    ],
  },
  {
    key: "ctrl_cryptography_policy",
    titleCs: "Kryptografická politika je schválená",
    titleEn: "Cryptography policy is approved",
    descriptionCs:
      "Organizace definuje požadavky na šifrování, správu klíčů, rotaci a použití certifikátů.",
    category: "data_protection",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(h)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.10.1.1", level: "mandatory" },
      { frameworkSlug: "gdpr", articleRef: "Article 32(1)(a)", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_network_segmentation",
    titleCs: "Síť je segmentovaná podle kritičnosti",
    titleEn: "Network is segmented by criticality",
    descriptionCs:
      "Produkční, administrátorské, hostovské a interní segmenty jsou oddělené a přístupy jsou pravidlově řízené.",
    category: "asset_management",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(i)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.13.1.3", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_cloudtrail_enabled",
    titleCs: "CloudTrail nebo ekvivalentní auditní log je zapnutý",
    titleEn: "CloudTrail or equivalent audit logging is enabled",
    descriptionCs:
      "Cloudový účet zaznamenává administrátorské a bezpečnostní události do chráněného úložiště.",
    category: "incident",
    testType: "automated",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(b)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.12.4.1", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_s3_encryption",
    titleCs: "Objektová úložiště šifrují data",
    titleEn: "Object storage buckets encrypt data",
    descriptionCs:
      "Objektová úložiště s firemními nebo osobními daty mají vynucené šifrování a blokovaný veřejný přístup.",
    category: "data_protection",
    testType: "automated",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(h)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.10.1.1", level: "mandatory" },
      { frameworkSlug: "gdpr", articleRef: "Article 32(1)(a)", level: "mandatory" },
    ],
  },
  {
    key: "ctrl_root_account_mfa",
    titleCs: "Root nebo break-glass účty mají MFA",
    titleEn: "Root or break-glass accounts have MFA",
    descriptionCs:
      "Nejvyšší privilegované účty v cloudových a identitních systémech jsou chráněné MFA a monitorované.",
    category: "access_control",
    testType: "automated",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [
      { frameworkSlug: "nis2", articleRef: "Article 21(2)(j)", level: "mandatory" },
      { frameworkSlug: "iso27001", articleRef: "A.9.2.3", level: "mandatory" },
    ],
  },
];

const ISO27001_EXTENSION_CONTROLS: ControlSeed[] = [
  {
    key: "ctrl_isms_scope_defined",
    titleCs: "Rozsah ISMS je definovaný a schválený",
    titleEn: "ISMS scope is defined and approved",
    descriptionCs:
      "Organizace má schválený rozsah ISMS včetně aktiv, lokalit, procesů, technologií a výjimek.",
    category: "governance",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [],
  },
  {
    key: "ctrl_statement_of_applicability",
    titleCs: "Statement of Applicability je aktuální",
    titleEn: "Statement of Applicability is current",
    descriptionCs:
      "SoA uvádí použitelnost všech Annex A kontrol, odůvodnění výjimek a odkaz na důkaz.",
    category: "governance",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [],
  },
  {
    key: "ctrl_security_roles_responsibilities",
    titleCs: "Bezpečnostní role a odpovědnosti jsou přiřazené",
    titleEn: "Security roles and responsibilities are assigned",
    descriptionCs:
      "Vlastníci aktiv, kontrol a bezpečnostních procesů jsou jasně určeni a pravidelně potvrzují odpovědnosti.",
    category: "governance",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [],
  },
  {
    key: "ctrl_security_policy_approved",
    titleCs: "Politika informační bezpečnosti je schválená",
    titleEn: "Information security policy is approved",
    descriptionCs:
      "Vrcholové vedení schválilo bezpečnostní politiku a politika je dostupná všem relevantním pracovníkům.",
    category: "governance",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [],
  },
  {
    key: "ctrl_risk_treatment_plan",
    titleCs: "Plán ošetření rizik je udržovaný",
    titleEn: "Risk treatment plan is maintained",
    descriptionCs:
      "Rizika mají vlastníka, opatření, termín, akceptaci zbytkového rizika a vazbu na použité kontroly.",
    category: "governance",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [],
  },
  {
    key: "ctrl_internal_audit_program",
    titleCs: "Interní audit ISMS probíhá podle programu",
    titleEn: "ISMS internal audit programme is operated",
    descriptionCs:
      "Interní audity jsou plánované, nezávislé, zaznamenané a nálezy mají přiřazené nápravné akce.",
    category: "governance",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [],
  },
  {
    key: "ctrl_management_review",
    titleCs: "Vedení provádí pravidelný přezkum ISMS",
    titleEn: "Management performs ISMS reviews",
    descriptionCs:
      "Management review hodnotí výsledky auditů, incidenty, rizika, metriky a zlepšovací opatření.",
    category: "governance",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [],
  },
  {
    key: "ctrl_document_control",
    titleCs: "Řízená dokumentace má vlastníky a verze",
    titleEn: "Controlled documents have owners and versions",
    descriptionCs:
      "Politiky, postupy a záznamy mají řízené verze, schvalování, revize a pravidla uchování.",
    category: "governance",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [],
  },
  {
    key: "ctrl_control_exceptions_tracked",
    titleCs: "Výjimky z kontrol jsou evidované a schválené",
    titleEn: "Control exceptions are tracked and approved",
    descriptionCs:
      "Výjimky obsahují důvod, vlastníka, kompenzační opatření a termín přezkumu.",
    category: "governance",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [],
  },
  {
    key: "ctrl_threat_intelligence",
    titleCs: "Threat intelligence je sledovaná a vyhodnocovaná",
    titleEn: "Threat intelligence is monitored and assessed",
    descriptionCs:
      "Relevantní bezpečnostní hrozby jsou sledované, vyhodnocené a převáděné do úkolů pro odpovědné týmy.",
    category: "incident",
    testType: "hybrid",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [],
  },
  {
    key: "ctrl_information_transfer_rules",
    titleCs: "Pravidla přenosu informací jsou definovaná",
    titleEn: "Information transfer rules are defined",
    descriptionCs:
      "Interní i externí přenosy citlivých informací mají schválené kanály, ochranu a odpovědnosti.",
    category: "data_protection",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [],
  },
  {
    key: "ctrl_mobile_device_management",
    titleCs: "Mobilní zařízení jsou řízená",
    titleEn: "Mobile devices are managed",
    descriptionCs:
      "Notebooky, telefony a tablety mají správu konfigurací, šifrování, uzamčení a možnost vzdáleného smazání.",
    category: "access_control",
    testType: "hybrid",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [],
  },
  {
    key: "ctrl_remote_work_policy",
    titleCs: "Práce na dálku má bezpečnostní pravidla",
    titleEn: "Remote working security rules are defined",
    descriptionCs:
      "Práce mimo kancelář řeší zařízení, domácí síť, VPN, ukládání dokumentů a hlášení incidentů.",
    category: "access_control",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [],
  },
  {
    key: "ctrl_identity_lifecycle_policy",
    titleCs: "Životní cyklus identit je řízený",
    titleEn: "Identity lifecycle is controlled",
    descriptionCs:
      "Nástup, změna role, offboarding a pravidelný přezkum přístupů jsou vynucené procesem.",
    category: "access_control",
    testType: "hybrid",
    requiresEvidence: true,
    isAutomated: true,
    frameworkMappings: [],
  },
  {
    key: "ctrl_supplier_monitoring",
    titleCs: "Dodavatelské služby jsou pravidelně monitorované",
    titleEn: "Supplier services are periodically monitored",
    descriptionCs:
      "Služby klíčových dodavatelů jsou přezkoumávané podle smluvních SLA, incidentů, změn a rizika.",
    category: "supplier",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [],
  },
  {
    key: "ctrl_backup_policy",
    titleCs: "Politika záloh definuje rozsah a obnovu",
    titleEn: "Backup policy defines scope and recovery",
    descriptionCs:
      "Zálohy mají definovaný rozsah, frekvenci, retenci, šifrování, testy obnovy a odpovědné vlastníky.",
    category: "business_continuity",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [],
  },
  {
    key: "ctrl_clock_sync",
    titleCs: "Systémové hodiny jsou synchronizované",
    titleEn: "System clocks are synchronized",
    descriptionCs:
      "Servery, cloudové služby a bezpečnostní nástroje používají spolehlivý časový zdroj pro korelaci logů.",
    category: "incident",
    testType: "hybrid",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [],
  },
  {
    key: "ctrl_secure_development_policy",
    titleCs: "Bezpečný vývoj je řízený politikou",
    titleEn: "Secure development is governed by policy",
    descriptionCs:
      "Vývojový proces zahrnuje bezpečnostní požadavky, review, testování, oddělení prostředí a řízení změn.",
    category: "asset_management",
    testType: "manual",
    requiresEvidence: true,
    isAutomated: false,
    frameworkMappings: [],
  },
];

const CSRD_DATA_POINT_CONTROLS: ControlSeed[] = [
  ["ctrl_csrd_double_materiality", "Dvojí materialita je vyhodnocená", "Double materiality assessment is completed", "Vyhodnocení dopadu firmy na ESG témata i dopadu ESG témat na firmu.", "esg_governance", "ESRS 1"],
  ["ctrl_csrd_governance_oversight", "ESG dohled vedení je doložený", "ESG board oversight is documented", "Role vedení, odpovědnosti, eskalace a schvalování ESG reportingu jsou doložené.", "esg_governance", "ESRS 2 GOV"],
  ["ctrl_csrd_esg_policy", "ESG politika a cíle jsou schválené", "ESG policy and targets are approved", "Organizace má schválené ESG cíle, vlastníky a proces pravidelného přezkumu.", "esg_governance", "ESRS 2 MDR"],
  ["ctrl_csrd_scope1_emissions", "Scope 1 emise jsou evidované", "Scope 1 emissions are tracked", "Přímé emise ze zdrojů pod kontrolou firmy jsou měřené a doložitelné.", "esg_environment", "ESRS E1"],
  ["ctrl_csrd_scope2_emissions", "Scope 2 emise jsou evidované", "Scope 2 emissions are tracked", "Nepřímé emise z nakoupené energie jsou počítané podle zvoleného metodického přístupu.", "esg_environment", "ESRS E1"],
  ["ctrl_csrd_scope3_emissions", "Scope 3 emise jsou odhadované", "Scope 3 emissions are estimated", "Relevantní emise v hodnotovém řetězci mají datový zdroj, metodu výpočtu a vlastníka.", "esg_environment", "ESRS E1"],
  ["ctrl_csrd_energy_consumption", "Spotřeba energie je měřená", "Energy consumption is measured", "Spotřeba energie podle lokalit a zdrojů je pravidelně evidovaná.", "esg_environment", "ESRS E1"],
  ["ctrl_csrd_water_usage", "Spotřeba vody je evidovaná", "Water usage is tracked", "Spotřeba vody a významné vodní dopady mají datový zdroj a odpovědného vlastníka.", "esg_environment", "ESRS E3"],
  ["ctrl_csrd_waste_management", "Odpadové toky jsou evidované", "Waste streams are tracked", "Vznik, recyklace, likvidace a nebezpečný odpad jsou vedené v auditovatelné evidenci.", "esg_environment", "ESRS E5"],
  ["ctrl_csrd_pollution_incidents", "Environmentální incidenty jsou sledované", "Pollution incidents are tracked", "Úniky, sankce a environmentální incidenty jsou evidované včetně nápravných opatření.", "esg_environment", "ESRS E2"],
  ["ctrl_csrd_biodiversity_impact", "Dopady na biodiverzitu jsou posouzené", "Biodiversity impacts are assessed", "Relevantní lokality a dopady na biodiverzitu jsou posouzené nebo odůvodněně vyloučené.", "esg_environment", "ESRS E4"],
  ["ctrl_csrd_climate_risk_assessment", "Klimatická rizika jsou posouzená", "Climate risks are assessed", "Fyzická a přechodová klimatická rizika jsou posouzená a navázaná na řízení rizik.", "esg_environment", "ESRS E1"],
  ["ctrl_csrd_workforce_headcount", "Data o pracovní síle jsou aktuální", "Workforce data is current", "Počty zaměstnanců, pracovní poměry a lokality jsou měřené a schválené.", "esg_social", "ESRS S1"],
  ["ctrl_csrd_health_safety", "BOZP ukazatele jsou evidované", "Health and safety metrics are tracked", "Úrazy, absence, školení a opatření BOZP jsou vedené v auditovatelné evidenci.", "esg_social", "ESRS S1"],
  ["ctrl_csrd_training_hours", "Školení a rozvoj jsou měřené", "Training and development is measured", "Hodiny školení, povinná školení a rozvojové aktivity mají datový zdroj.", "esg_social", "ESRS S1"],
  ["ctrl_csrd_diversity_metrics", "Diverzitní metriky jsou připravené", "Diversity metrics are prepared", "Diverzitní data jsou měřená v souladu s právními limity a pravidly ochrany osobních údajů.", "esg_social", "ESRS S1"],
  ["ctrl_csrd_worker_grievance", "Kanál pro stížnosti pracovníků je dostupný", "Worker grievance channel is available", "Pracovníci mají dostupný kanál pro podněty, stížnosti a eskalaci.", "esg_social", "ESRS S1"],
  ["ctrl_csrd_supply_chain_due_diligence", "Due diligence dodavatelů je nastavená", "Supplier due diligence is in place", "Rizika v dodavatelském řetězci jsou hodnocená podle významnosti a typu služby.", "esg_governance", "ESRS G1"],
  ["ctrl_csrd_supplier_esg_questionnaire", "Dodavatelský ESG dotazník je používán", "Supplier ESG questionnaire is used", "Klíčoví dodavatelé dostávají standardizovaný ESG dotazník a odpovědi jsou vyhodnocené.", "esg_governance", "ESRS G1"],
  ["ctrl_csrd_customer_privacy", "Ochrana zákaznických dat je zahrnutá v ESG", "Customer privacy is included in ESG governance", "Soukromí zákazníků a bezpečnost dat jsou součástí governance a reportovacích odpovědností.", "esg_governance", "ESRS S4"],
  ["ctrl_csrd_business_conduct_policy", "Politika obchodního jednání je schválená", "Business conduct policy is approved", "Etika, střety zájmů, dary a vztahy s partnery jsou upravené politikou.", "esg_governance", "ESRS G1"],
  ["ctrl_csrd_anti_corruption_training", "Protikorupční školení je evidované", "Anti-corruption training is tracked", "Relevantní role absolvují školení k úplatkářství, korupci a střetu zájmů.", "esg_governance", "ESRS G1"],
  ["ctrl_csrd_tax_transparency", "Daňová a platební transparentnost je doložitelná", "Tax and payment transparency is documented", "Daňové přístupy, platby a významné veřejné podpory jsou připravené k reportingu.", "esg_governance", "ESRS G1"],
  ["ctrl_csrd_report_approval", "Schvalování ESG reportu je auditovatelné", "ESG report approval is auditable", "Report má vlastníky, kontrolu dat, schválení vedením a stopu změn.", "esg_governance", "CSRD"],
].map(([key, titleCs, titleEn, descriptionCs, category, articleRef]) => ({
  key,
  titleCs,
  titleEn,
  descriptionCs,
  category: category as ControlCategory,
  testType: "manual",
  requiresEvidence: true,
  isAutomated: false,
  frameworkMappings: [
    {
      frameworkSlug: "csrd",
      articleRef,
      level: "mandatory",
    },
  ],
}));

function withNis2EvidenceRequirements(control: ControlSeed): ControlSeed {
  const evidenceRequirements = NIS2_EVIDENCE_REQUIREMENTS_BY_CONTROL[control.key];

  if (!evidenceRequirements) {
    return control;
  }

  return {
    ...control,
    frameworkMappings: control.frameworkMappings.map((mapping) => {
      if (mapping.frameworkSlug !== "nis2" || mapping.evidenceRequirements) {
        return mapping;
      }

      return {
        ...mapping,
        evidenceRequirements,
      };
    }),
  };
}

export const CONTROL_LIBRARY: ControlSeed[] = [
  ...BASE_CONTROL_LIBRARY.map(withNis2EvidenceRequirements),
  ...ISO27001_EXTENSION_CONTROLS,
  ...CSRD_DATA_POINT_CONTROLS,
];

export function getControlMappingsForFramework(frameworkSlug: FrameworkSlug) {
  return CONTROL_LIBRARY.flatMap((control) =>
    control.frameworkMappings
      .filter((mapping) => mapping.frameworkSlug === frameworkSlug)
      .map((mapping) => ({
        controlKey: control.key,
        ...mapping,
      })),
  );
}
