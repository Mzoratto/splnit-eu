import type { PlatformWorkspace } from "@/lib/workspaces/types";

// Money S3 / S4 (Seyfor) platform workspace configuration.
// Covers the four standard compliance layers for NIS2 ZoKB SME readiness.
// All questions and guidance are in Czech using Money S3-specific terminology.
export const moneyS3Workspace: PlatformWorkspace = {
  platformId: "money_s3",
  platformName: "Money S3 / S4",
  platformVendor: "Seyfor",
  layers: [
    // ─── Layer 1: Infrastructure & Storage Security ──────────────────────────
    {
      id: "infrastructure",
      nukibBlock: {
        blockTitle: "§ Technická opatření",
        sectionTitle: "Kryptografické prostředky",
      },
      title: "Infrastruktura a zabezpečení úložiště",
      controls: [
        {
          controlKey: "money-s3-infra-deployment-type",
          question:
            "Jaký typ nasazení Money S3 provozujete (lokální databáze, on-premises SQL Server, nebo cloudová varianta Money S5)?\u00a0",
          guidance:
            "Zdokumentujte aktuální variantu nasazení. Money S3/S4 standardně využívá lokální databázi nebo Microsoft SQL Server. Cloudová varianta Money S5 (provozovaná Seyforem) přenáší část odpovědnosti za infrastrukturu na poskytovatele – zajistěte, že máte k dispozici aktuální smlouvu o zpracování dat (DPA) se Seyforem.",
          evidenceType: "attestation",
          nis2ArticleRef: "Article 21(2)(h)",
        },
        {
          controlKey: "money-s3-infra-encryption-at-rest",
          question:
            "Je databáze Money S3 (lokální nebo SQL Server) šifrována v klidovém stavu (encryption at rest)?",
          guidance:
            "U lokální databáze Money S3 doporučte šifrování disku (BitLocker / FileVault). U SQL Serveru zvažte Transparent Data Encryption (TDE). U cloudové varianty Money S5 ověřte, zda Seyfor garantuje šifrování v klidovém stavu a na jakém standardu (AES-256). Přiložte snímek obrazovky nebo potvrzení z nastavení.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(h)",
          zobkSectionRef: "§ 5 odst. 1 písm. d)",
        },
        {
          controlKey: "money-s3-infra-os-patch-management",
          question:
            "Jak zajišťujete pravidelné záplatování operačního systému serveru, na němž běží Money S3?",
          guidance:
            "Seyfor vydává pravidelné aktualizace Money S3/S4; OS patche jsou v odpovědnosti provozovatele. Zdokumentujte plán záplatování (frekvence, odpovědná osoba, testování patchů před nasazením). Pro Windows Server doporučte zapnutí Windows Update nebo WSUS. Přiložte výpis nainstalovaných aktualizací nebo záznam z ticketovacího systému.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(h)",
          zobkSectionRef: "§ 6 odst. 1 písm. b)",
        },
        {
          controlKey: "money-s3-infra-network-segmentation",
          question:
            "Je server s databází Money S3 síťově segmentován (VLAN nebo firewall pravidla oddělující účetní data od ostatního provozu)?",
          guidance:
            "Účetní databáze Money S3 obsahuje citlivá finanční a obchodní data. Doporučte umístění serveru do oddělené VLAN s přístupem omezeným na pracovní stanice účetního oddělení a administrátory. Přiložte síťové schéma nebo export firewall pravidel (s anonymizovanými IP adresami).",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(h)",
          zobkSectionRef: "§ 5 odst. 1 písm. e)",
        },
      ],
    },

    // ─── Layer 2: Access Control & IAM ──────────────────────────────────────
    {
      id: "iam",
      nukibBlock: {
        blockTitle: "§ Technická opatření",
        sectionTitle: "Správa přístupových oprávnění",
      },
      title: "Řízení přístupu a správa identit",
      controls: [
        {
          controlKey: "money-s3-iam-user-accounts",
          question:
            "Jsou uživatelé Money S3 spravováni přes systém správy uživatelů (Nastavení › Přístupy) a má každý zaměstnanec samostatný účet?",
          guidance:
            "V Money S3/S4 je dostupná správa uživatelů a přístupových práv pod Nastavení › Přístupy. Zakažte sdílené přihlašovací údaje. Ověřte, že každý aktivní pracovník má vlastní účet s evidovatelnou aktivitou. Přiložte anonymizovaný export seznamu uživatelů.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(i)",
          zobkSectionRef: "§ 7 odst. 1",
        },
        {
          controlKey: "money-s3-iam-least-privilege",
          question:
            "Jsou uživatelská oprávnění v Money S3 nastavena podle principu nejmenšího privilegia (účetní nemají přístup k logistickým modulům a naopak)?",
          guidance:
            "Money S3/S4 umožňuje granulární nastavení přístupu k agendám (Fakturace, Sklady, Mzdy apod.) i k jednotlivým dokladům. Zdokumentujte matici rolí – kdo má přístup ke kterým agendám. Zvláštní pozornost věnujte přístupu ke mzdové agendě a bankovním příkazům. Přiložte snímek nastavení přístupových práv z Money S3 nebo exportovaný PDF přehled oprávnění.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(i)",
          zobkSectionRef: "§ 7 odst. 2",
        },
        {
          controlKey: "money-s3-iam-inactive-session-audit",
          question:
            "Provádíte pravidelný audit neaktivních uživatelských účtů v Money S3 (minimálně čtvrtletně)?",
          guidance:
            "Neaktivní účty (odchod zaměstnance, mateřská dovolená apod.) představují riziko neoprávněného přístupu. V Money S3 zkontrolujte seznam uživatelů a datum posledního přihlášení. Neaktivní účty deaktivujte nebo odstraňte. Přiložte datovaný záznam z auditu (screenshot nebo exportovaný seznam).",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(i)",
          zobkSectionRef: "§ 7 odst. 3",
        },
        {
          controlKey: "money-s3-iam-offboarding",
          question:
            "Existuje formální proces pro odebrání přístupu do Money S3 při ukončení pracovního poměru zaměstnance?",
          guidance:
            "Při odchodu zaměstnance je nutné neprodleně deaktivovat nebo smazat jeho účet v Money S3 i na úrovni operačního systému (Windows doménový účet). Zdokumentujte checklist offboardingu zahrnující: deaktivaci účtu v Money S3, odebrání přístupu k síťovým sdíleným složkám a předání přihlašovacích údajů správci. Přiložte vzor offboarding checklistu nebo záznam o provedení.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(i)",
          zobkSectionRef: "§ 7 odst. 4",
        },
      ],
    },

    // ─── Layer 3: Backup & Disaster Recovery ─────────────────────────────────
    {
      id: "backup_dr",
      nukibBlock: {
        blockTitle: "§ Technická opatření",
        sectionTitle: "Zajištění úrovně dostupnosti",
      },
      title: "Zálohy a obnova po havárii",
      controls: [
        {
          controlKey: "money-s3-backup-db-maintenance",
          question:
            "Provádíte pravidelnou údržbu databáze Money S3 (optimalizaci a kontrolu integrity dat)?",
          guidance:
            "Money S3 umožňuje provádět správu a optimalizaci databáze přes interní nástroje (Správce systému › Správa databáze). Doporučuje se spouštět týdně nebo po větších hromadných operacích. Zdokumentujte frekvenci a osobu odpovědnou za spouštění. Přiložte záznam nebo screenshot posledního provedení.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(c)",
          zobkSectionRef: "§ 8 odst. 1",
        },
        {
          controlKey: "money-s3-backup-automated-daily",
          question:
            "Je záloha databáze Money S3 automatizována a probíhá denně (vestavěný plánovač záloh nebo ekvivalent)?",
          guidance:
            "Money S3/S4 umožňuje automatické zálohy přes vestavěný plánovač nebo externí zálohovací nástroje. Záloha by měla být šifrovaná a ukládaná na jiné médium než produkční server (lokální NAS, FTPS nebo cloud). Ověřte, že záloha probíhá mimo pracovní dobu. Přiložte konfiguraci plánovače nebo log úspěšných záloh za posledních 30 dní.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(c)",
          zobkSectionRef: "§ 8 odst. 2",
        },
        {
          controlKey: "money-s3-backup-offsite-immutable",
          question:
            "Jsou zálohy Money S3 ukládány mimo primární lokalitu nebo v immutable úložišti (off-site NAS, FTPS, cloud s ochranou proti přepsání)?",
          guidance:
            "Záloha na stejném fyzickém serveru jako produkce nechrání před požárem, krádeží nebo ransomwarem. Implementujte pravidlo 3-2-1: 3 kopie, 2 různá média, 1 mimo lokalitu. FTPS nebo cloudové úložiště s verzováním a lock politikou (např. Azure Blob s immutability policy) výrazně snižuje riziko nevratné ztráty dat. Přiložte důkaz o konfiguraci vzdáleného úložiště.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(c)",
          zobkSectionRef: "§ 8 odst. 3",
        },
        {
          controlKey: "money-s3-backup-restoration-test",
          question:
            "Provádíte minimálně jednou ročně dokumentovaný test obnovy databáze Money S3 ze zálohy?",
          guidance:
            "Záloha bez ověřené obnovy nemá hodnotu. Test obnovy by měl zahrnovat: import zálohy do izolovaného testovacího prostředí, ověření integrity dat (otevření agend, kontrola posledních dokladů), zdokumentování výsledku a doby obnovy (RTO). Přiložte datovaný protokol z posledního testu obnovy podepsaný odpovědnou osobou.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(c)",
          zobkSectionRef: "§ 8 odst. 4",
        },
      ],
    },

    // ─── Layer 4: API & Interconnectivity Security ───────────────────────────
    {
      id: "api_connectivity",
      nukibBlock: {
        blockTitle: "§ Technická opatření",
        sectionTitle: "Kryptografické prostředky",
      },
      title: "Zabezpečení API a propojení",
      controls: [
        {
          controlKey: "money-s3-api-ecommerce-auth",
          question:
            "Je přístup k REST API konektoru Money S3 pro e-commerce platformy (Shoptet, WooCommerce) zabezpečen API klíči nebo OAuth a přenáší se výhradně přes HTTPS?",
          guidance:
            "Money S3/S4 nabízí REST API konektory pro propojení s e-commerce platformami (Shoptet Plugin, WooCommerce konektor). Ujistěte se, že API klíče nebo OAuth tokeny nejsou veřejně dostupné a jsou uloženy v zabezpečeném trezoru (např. proměnné prostředí serveru, ne v kódu). Veškerá komunikace musí probíhat výhradně přes HTTPS. Přiložte screenshot konfigurace konektoru nebo dokumentaci API autentizace.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(g)",
          zobkSectionRef: "§ 9 odst. 1",
        },
        {
          controlKey: "money-s3-api-credential-rotation",
          question:
            "Probíhá rotace API klíčů a přihlašovacích údajů k e-commerce konektorům Money S3 minimálně jednou ročně nebo při odchodu pracovníka s přístupem?",
          guidance:
            "API klíče a přihlašovací údaje konektorů (Shoptet, WooCommerce) jsou dlouhodobé tajné informace. Nastavte interní politiku pro pravidelnou rotaci (doporučeno každých 6–12 měsíců). Zajistěte, aby stará hesla a tokeny nebyla uložena v plain textu v integračních skriptech nebo konfiguračních souborech. Přiložte záznam o poslední rotaci nebo interní policy dokument.",
          evidenceType: "attestation",
          nis2ArticleRef: "Article 21(2)(g)",
          zobkSectionRef: "§ 9 odst. 2",
        },
        {
          controlKey: "money-s3-api-ip-whitelist",
          question:
            "Je přístup k REST API Money S3 pro e-commerce konektory omezen na whitelistované IP adresy nebo sítě integračních systémů?",
          guidance:
            "Na serveru s Money S3 nastavte firewall pravidla (Windows Firewall nebo síťový firewall), která povolují příchozí spojení na API port pouze z konkrétních IP adres integračních systémů (Shoptet server, WooCommerce server apod.). Zamezíte tím neoprávněnému přístupu v případě úniku přihlašovacích údajů. Přiložte export firewall pravidel (IP adresy anonymizujte).",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(g)",
          zobkSectionRef: "§ 9 odst. 3",
        },
        {
          controlKey: "money-s3-api-tls-enforcement",
          question:
            "Je pro API konektory Money S3 a případná webová rozhraní vynuceno HTTPS/TLS (minimálně TLS 1.2)?",
          guidance:
            "Plain HTTP přenos vystavuje přihlašovací údaje a účetní data odposlouchávání. Nakonfigurujte TLS certifikát pro API endpoint Money S3 (Let's Encrypt nebo komerční CA) a zakažte TLS 1.0 a 1.1. Ověřte konfiguraci nástrojem SSL Labs nebo testovacím curl příkazem. Přiložte screenshot výsledku SSL testu nebo konfiguraci HTTPS na serveru.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(g)",
          zobkSectionRef: "§ 9 odst. 4",
        },
      ],
    },
  ],
};
