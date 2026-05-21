import type { PlatformWorkspace } from "@/lib/workspaces/types";

// Hetzner Cloud workspace configuration for Czech NIS2/ZoKB SME readiness.
// Layer 1 is intentionally config-driven so the UI can render manual fallback
// guidance without embedding Hetzner-specific platform logic.
export const hetznerWorkspace: PlatformWorkspace = {
  platformId: "hetzner",
  platformName: "Hetzner Cloud",
  platformVendor: "Hetzner Online GmbH",
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
          // GET /servers → server.status === 'running'
          apiEndpoint: "/servers",
          apiExpected: "running",
          apiField: "servers[0].status",
          automatable: true,
          controlKey: "hetzner-infra-server-running",
          evidenceType: "both",
          guidance:
            "Automatická kontrola ověří, že alespoň jeden server Hetzner Cloud běží ve stavu running. Pokud API kontrola selže, doložte ručně snímek z Hetzner Cloud Console nebo export serverů s datem kontroly a odpovědnou osobou.",
          nis2ArticleRef: "Article 21(2)(h)",
          question:
            "Běží produkční server v Hetzner Cloud a je dostupný pro provoz služby?",
          zobkSectionRef: "§ 6 odst. 1 písm. b)",
        },
        {
          // GET /firewalls → rules array non-empty
          apiEndpoint: "/firewalls",
          apiExpected: "rules.length > 0",
          apiField: "firewalls[0].rules",
          automatable: true,
          controlKey: "hetzner-infra-firewall-present",
          evidenceType: "both",
          guidance:
            "Automatická kontrola ověří, že je v Hetzner Cloud definován firewall s neprázdnou sadou pravidel. Pokud API kontrola selže, doložte ručně export firewall pravidel nebo snímek nastavení s anonymizovanými IP adresami.",
          nis2ArticleRef: "Article 21(2)(h)",
          question:
            "Je pro servery v Hetzner Cloud nastavena neprázdná sada firewall pravidel?",
          zobkSectionRef: "§ 5 odst. 1 písm. e)",
        },
        {
          // GET /images?type=snapshot → images[0].created within 7 days
          apiEndpoint: "/images?type=snapshot",
          apiExpected: "created within 7 days",
          apiField: "images[0].created",
          automatable: true,
          controlKey: "hetzner-infra-snapshot-recent",
          evidenceType: "both",
          guidance:
            "Automatická kontrola ověří, že existuje snapshot vytvořený v posledních 7 dnech. Pokud API kontrola selže nebo snapshot není čitelný přes API, doložte ručně plán záloh a snímek posledního snapshotu včetně data vytvoření.",
          nis2ArticleRef: "Article 21(2)(c)",
          question:
            "Existuje snapshot nebo záloha produkčního serveru vytvořená v posledních 7 dnech?",
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
          controlKey: "hetzner-iam-api-key-scopes",
          evidenceType: "attestation",
          guidance:
            "Zkontrolujte, že API token používaný pro Splnit.eu je projektový token s oprávněním pouze pro čtení. Nepoužívejte token s oprávněním Read & Write, pokud není prokazatelně nutný.",
          nis2ArticleRef: "Article 21(2)(i)",
          question:
            "Je přístup API tokenu omezen na minimální potřebné čtecí oprávnění?",
          zobkSectionRef: "§ 7 odst. 2",
        },
        {
          controlKey: "hetzner-iam-root-ssh-protected",
          evidenceType: "attestation",
          guidance:
            "Doložte konfiguraci SSH, která zakazuje přímé přihlášení roota, nebo prokažte kompenzační opatření jako MFA chráněný bastion, omezení na VPN a auditované administrátorské účty.",
          nis2ArticleRef: "Article 21(2)(i)",
          question:
            "Je přímý root/admin SSH přístup zakázán nebo chráněn dodatečným ověřením?",
          zobkSectionRef: "§ 7 odst. 1",
        },
        {
          controlKey: "hetzner-iam-ssh-key-rotation",
          evidenceType: "attestation",
          guidance:
            "Doložte seznam aktivních SSH klíčů, datum posledního auditu a postup rotace klíčů při odchodu pracovníka nebo kompromitaci zařízení. Citlivé části klíčů nikdy nevkládejte do Splnit.eu.",
          nis2ArticleRef: "Article 21(2)(i)",
          question:
            "Jsou neaktivní SSH klíče pravidelně auditovány a rotovány podle plánu?",
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
          // GET /images?type=snapshot → recurring snapshot evidence where available
          apiEndpoint: "/images?type=snapshot",
          apiExpected: "recurring snapshot schedule or recent snapshots",
          apiField: "images[*].created",
          automatable: true,
          controlKey: "hetzner-backup-snapshot-schedule",
          evidenceType: "both",
          guidance:
            "Ověřte automatický plán snapshotů nebo doložte sérii posledních snapshotů. Pokud API kontrola není dostupná, přiložte ručně konfiguraci snapshot schedule nebo interní postup zálohování.",
          nis2ArticleRef: "Article 21(2)(c)",
          question:
            "Je potvrzen automatický plán snapshotů nebo ekvivalentní pravidelná záloha?",
          zobkSectionRef: "§ 8 odst. 2",
        },
        {
          controlKey: "hetzner-backup-off-server-copy",
          evidenceType: "attestation",
          guidance:
            "Doložte, že existuje kopie záloh mimo primární server nebo projekt. Vhodný důkaz je konfigurace externího úložiště, objektového úložiště, zálohovacího nástroje nebo smluvního backup řešení.",
          nis2ArticleRef: "Article 21(2)(c)",
          question:
            "Existuje kopie zálohy mimo primární server nebo mimo hlavní projekt Hetzner Cloud?",
          zobkSectionRef: "§ 8 odst. 3",
        },
        {
          controlKey: "hetzner-backup-recovery-test",
          evidenceType: "attestation",
          guidance:
            "Doložte datovaný protokol z testu obnovy provedeného v posledních 12 měsících. Protokol by měl uvádět rozsah testu, výsledek, dobu obnovy a odpovědnou osobu.",
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
          controlKey: "hetzner-api-key-secrets-manager",
          evidenceType: "attestation",
          guidance:
            "Doložte, že produkční API klíče nejsou uloženy ve zdrojovém kódu, repozitáři ani sdílených dokumentech. Vhodný důkaz je popis použití secrets manageru nebo správy proměnných prostředí.",
          nis2ArticleRef: "Article 21(2)(j)",
          question:
            "Jsou API klíče uloženy v bezpečném úložišti tajemství, nikoli ve zdrojovém kódu?",
          zobkSectionRef: "§ 9 odst. 1",
        },
        {
          controlKey: "hetzner-api-key-rotation-schedule",
          evidenceType: "attestation",
          guidance:
            "Doložte interní pravidlo rotace API klíčů nejpozději každých 90 dní nebo při změně odpovědné osoby. Přiložte datum poslední rotace bez zveřejnění samotného klíče.",
          nis2ArticleRef: "Article 21(2)(j)",
          question:
            "Je definován harmonogram rotace API klíčů nejpozději každých 90 dní?",
          zobkSectionRef: "§ 9 odst. 2",
        },
        {
          controlKey: "hetzner-api-access-logs-reviewed",
          evidenceType: "attestation",
          guidance:
            "Doložte, jak organizace sleduje použití API klíčů a administrátorských účtů. Pokud Hetzner Cloud neposkytuje detailní aplikační audit pro daný úkon, popište kompenzační monitoring na úrovni serveru, bastionu nebo SIEM.",
          nis2ArticleRef: "Article 21(2)(j)",
          question:
            "Jsou zapnuté a pravidelně kontrolované záznamy o API nebo administrátorském přístupu?",
          zobkSectionRef: "§ 9 odst. 3",
        },
      ],
    },
  ],
};
