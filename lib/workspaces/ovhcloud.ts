import type { PlatformWorkspace } from "@/lib/workspaces/types";

// OVHcloud workspace configuration for Czech NIS2/ZoKB SME readiness.
// The connector uses OVHcloud's three-part auth; all user-facing fallback
// guidance stays here so UI components remain platform-agnostic.
export const ovhcloudWorkspace: PlatformWorkspace = {
  platformId: "ovhcloud",
  platformName: "OVHcloud",
  platformVendor: "OVHcloud",
  layers: [
    {
      id: "infrastructure",
      nukibBlock: {
        blockTitle: "§ Technická opatření",
        sectionTitle: "Zajištění úrovně dostupnosti",
      },
      title: "Infrastruktura a zabezpečení úložiště",
      controls: [
        {
          // GET /dedicated/server/{serviceName} → status === 'operational'
          apiEndpoint: "/dedicated/server/{serviceName}",
          apiExpected: "operational",
          apiField: "status",
          automatable: true,
          controlKey: "ovhcloud-infra-server-operational",
          evidenceType: "both",
          guidance:
            "Automatická kontrola ověří stav dedikovaného serveru OVHcloud. Pokud API kontrola selže, doložte ručně snímek z OVHcloud Manageru nebo export služby s datem kontroly a názvem serviceName.",
          nis2ArticleRef: "Article 21(2)(h)",
          question:
            "Je produkční server v OVHcloud v provozním stavu operational?",
          zobkSectionRef: "§ 6 odst. 1 písm. b)",
        },
        {
          // GET /dedicated/server/{serviceName}/firewall → enabled === true
          apiEndpoint: "/dedicated/server/{serviceName}/firewall",
          apiExpected: "true",
          apiField: "enabled",
          automatable: true,
          controlKey: "ovhcloud-infra-firewall-enabled",
          evidenceType: "both",
          guidance:
            "Automatická kontrola ověří, zda je u služby OVHcloud zapnutý firewall. Pokud API kontrola selže, doložte ručně snímek nastavení firewallu nebo export bezpečnostního nastavení serveru.",
          nis2ArticleRef: "Article 21(2)(h)",
          question:
            "Je pro server OVHcloud zapnutý firewall nebo ekvivalentní síťová ochrana?",
          zobkSectionRef: "§ 5 odst. 1 písm. e)",
        },
        {
          // GET /dedicated/server/{serviceName}/backupStorage → backup presence
          apiEndpoint: "/dedicated/server/{serviceName}/backupStorage",
          apiExpected: "backup storage exists",
          apiField: "backupStorage",
          automatable: true,
          controlKey: "ovhcloud-infra-backup-present",
          evidenceType: "both",
          guidance:
            "Automatická kontrola ověří přítomnost backup storage u dedikovaného serveru. Pokud API kontrola selže, doložte ručně konfiguraci backup storage, plán záloh nebo potvrzení o poslední záloze.",
          nis2ArticleRef: "Article 21(2)(c)",
          question:
            "Je pro server OVHcloud dostupné backup storage nebo ekvivalentní zálohování?",
          zobkSectionRef: "§ 8 odst. 1",
        },
      ],
    },
    {
      id: "iam",
      nukibBlock: {
        blockTitle: "§ Technická opatření",
        sectionTitle: "Správa přístupových oprávnění",
      },
      title: "Řízení přístupu a správa identit",
      controls: [
        {
          controlKey: "ovhcloud-iam-api-key-scopes",
          evidenceType: "attestation",
          guidance:
            "Zkontrolujte, že OVHcloud application key a consumer key mají pouze čtecí pravidla potřebná pro dedikované servery, firewall a backup storage. Nepovolujte zápis, pokud není prokazatelně nutný.",
          nis2ArticleRef: "Article 21(2)(i)",
          question:
            "Je přístup API klíčů omezen na minimální potřebná čtecí oprávnění?",
          zobkSectionRef: "§ 7 odst. 2",
        },
        {
          controlKey: "ovhcloud-iam-root-ssh-protected",
          evidenceType: "attestation",
          guidance:
            "Doložte konfiguraci SSH nebo administračního přístupu, která zakazuje přímé přihlášení roota, případně popište kompenzační opatření jako VPN, bastion, MFA a auditované účty.",
          nis2ArticleRef: "Article 21(2)(i)",
          question:
            "Je přímý root/admin SSH přístup zakázán nebo chráněn dodatečným ověřením?",
          zobkSectionRef: "§ 7 odst. 1",
        },
        {
          controlKey: "ovhcloud-iam-ssh-key-rotation",
          evidenceType: "attestation",
          guidance:
            "Doložte audit SSH klíčů, odpovědnou osobu a pravidlo rotace. Do důkazů nevkládejte privátní klíče ani kompletní tajné hodnoty.",
          nis2ArticleRef: "Article 21(2)(i)",
          question:
            "Jsou neaktivní SSH klíče auditovány a rotovány podle pravidelného plánu?",
          zobkSectionRef: "§ 7 odst. 3",
        },
      ],
    },
    {
      id: "backup_dr",
      nukibBlock: {
        blockTitle: "§ Technická opatření",
        sectionTitle: "Zajištění úrovně dostupnosti",
      },
      title: "Zálohy a obnova po havárii",
      controls: [
        {
          // GET /dedicated/server/{serviceName}/backupStorage → backup schedule where available
          apiEndpoint: "/dedicated/server/{serviceName}/backupStorage",
          apiExpected: "backup storage exists",
          apiField: "backupStorage",
          automatable: true,
          controlKey: "ovhcloud-backup-storage-schedule",
          evidenceType: "both",
          guidance:
            "Ověřte, že backup storage existuje a je navázané na provozní zálohovací plán. Pokud API nevrátí dostatek detailů, doložte ručně plán záloh nebo záznamy posledních běhů.",
          nis2ArticleRef: "Article 21(2)(c)",
          question:
            "Je potvrzen pravidelný plán záloh využívající OVHcloud backup storage nebo ekvivalent?",
          zobkSectionRef: "§ 8 odst. 2",
        },
        {
          controlKey: "ovhcloud-backup-off-server-copy",
          evidenceType: "attestation",
          guidance:
            "Doložte, že existuje kopie záloh mimo primární server nebo mimo stejný provozní účet. Vhodným důkazem je konfigurace externího backup úložiště, objektového úložiště nebo smluvní backup služby.",
          nis2ArticleRef: "Article 21(2)(c)",
          question:
            "Existuje kopie zálohy mimo primární server nebo mimo stejný OVHcloud provozní rozsah?",
          zobkSectionRef: "§ 8 odst. 3",
        },
        {
          controlKey: "ovhcloud-backup-recovery-test",
          evidenceType: "attestation",
          guidance:
            "Doložte protokol testu obnovy provedeného v posledních 12 měsících. Uveďte rozsah, výsledek, dobu obnovy, zjištěné problémy a odpovědnou osobu.",
          nis2ArticleRef: "Article 21(2)(c)",
          question:
            "Byl v posledních 12 měsících proveden a zdokumentován test obnovy?",
          zobkSectionRef: "§ 8 odst. 4",
        },
      ],
    },
    {
      id: "api_connectivity",
      nukibBlock: {
        blockTitle: "§ Technická opatření",
        sectionTitle: "Kryptografické prostředky",
      },
      title: "Zabezpečení API a propojení",
      controls: [
        {
          controlKey: "ovhcloud-api-key-secrets-manager",
          evidenceType: "attestation",
          guidance:
            "Doložte, že application key, application secret a consumer key jsou uloženy v bezpečném úložišti tajemství nebo v chráněných proměnných prostředí. Nikdy je nevkládejte do zdrojového kódu.",
          nis2ArticleRef: "Article 21(2)(j)",
          question:
            "Jsou OVHcloud API klíče uloženy v bezpečném úložišti tajemství?",
          zobkSectionRef: "§ 9 odst. 1",
        },
        {
          controlKey: "ovhcloud-api-key-rotation-schedule",
          evidenceType: "attestation",
          guidance:
            "Doložte pravidlo rotace OVHcloud klíčů nejpozději každých 90 dní nebo při změně odpovědné osoby. Uveďte datum poslední rotace bez zveřejnění samotných tajných hodnot.",
          nis2ArticleRef: "Article 21(2)(j)",
          question:
            "Je definován harmonogram rotace OVHcloud API klíčů nejpozději každých 90 dní?",
          zobkSectionRef: "§ 9 odst. 2",
        },
        {
          controlKey: "ovhcloud-api-access-logs-reviewed",
          evidenceType: "attestation",
          guidance:
            "Popište, jak organizace kontroluje použití OVHcloud API klíčů a administrátorských účtů. Pokud detailní aplikační audit není dostupný, uveďte kompenzační monitoring na úrovni serveru, bastionu nebo SIEM.",
          nis2ArticleRef: "Article 21(2)(j)",
          question:
            "Jsou záznamy o API nebo administrátorském přístupu pravidelně kontrolované?",
          zobkSectionRef: "§ 9 odst. 3",
        },
      ],
    },
  ],
};
