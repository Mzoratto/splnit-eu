import type { PlatformWorkspace } from "@/lib/workspaces/types";

// Pohoda (Stormware) platform workspace configuration.
// Covers the four standard compliance layers for NIS2 ZoKB SME readiness.
// All questions and guidance are in Czech using Pohoda-specific terminology.
export const pohodaWorkspace: PlatformWorkspace = {
  platformId: "pohoda",
  platformName: "Pohoda",
  platformVendor: "Stormware s.r.o.",
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
          controlKey: "pohoda-infra-deployment-type",
          question:
            "Jaký typ nasazení Pohody provozujete (lokální MDB, on-premises SQL Server, nebo Seyfor/AC Cloud)?",
          guidance:
            "Zdokumentujte aktuální variantu nasazení. Lokální MDB (Firebird) je vhodná jen pro malé instalace; pro větší organizace Stormware doporučuje SQL Server. Cloudová varianta Pohoda E1 (Seyfor/AC Cloud) přenáší část odpovědnosti za infrastrukturu na poskytovatele – zajistěte, že máte k dispozici aktuální smlouvu o zpracování dat (DPA).",
          evidenceType: "attestation",
          nis2ArticleRef: "Article 21(2)(h)",
        },
        {
          controlKey: "pohoda-infra-encryption-at-rest",
          question:
            "Je databáze Pohody (MDB nebo SQL Server) šifrována v klidovém stavu (encryption at rest)?",
          guidance:
            "U lokální MDB doporučte šifrování disku (BitLocker / FileVault). U SQL Serveru zvažte Transparent Data Encryption (TDE). U cloudové varianty Seyfor/AC Cloud ověřte, zda poskytovatel garantuje šifrování v klidovém stavu a na jakém standardu (AES-256). Přiložte snímek obrazovky nebo potvrzení z nastavení.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(h)",
          zobkSectionRef: "§ 5 odst. 1 písm. d)",
        },
        {
          controlKey: "pohoda-infra-os-patch-management",
          question:
            "Jak zajišťujete pravidelné záplatování operačního systému serveru, na němž běží Pohoda?",
          guidance:
            "Stormware vydává pravidelné aktualizace Pohody; OS patche jsou v odpovědnosti provozovatele. Zdokumentujte plán záplatování (frekvence, odpovědná osoba, testování patchů před nasazením). Pro Windows Server doporučte zapnutí Windows Update nebo WSUS. Přiložte výpis nainstalovaných aktualizací nebo záznam z ticketovacího systému.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(h)",
          zobkSectionRef: "§ 6 odst. 1 písm. b)",
        },
        {
          controlKey: "pohoda-infra-network-segmentation",
          question:
            "Je server s databází Pohody síťově segmentován (VLAN nebo firewall pravidla oddělující účetní data od ostatního provozu)?",
          guidance:
            "Účetní databáze obsahuje citlivá finanční a obchodní data. Doporučte umístění serveru do oddělené VLAN s přístupem omezeným na pracovní stanice účetního oddělení a administrátory. Přiložte síťové schéma nebo export firewall pravidel (s anonymizovanými IP adresami).",
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
          controlKey: "§4-poverena-osoba",
          title: "Designated cybersecurity responsible person (§4)",
          description:
            "Mandatory appointment of a named individual with authority over cybersecurity management and regular reporting to top management.",
          question:
            "Má organizace jmenovanou osobu pověřenou kybernetickou bezpečností?",
          questionText:
            "Má organizace jmenovanou osobu pověřenou kybernetickou bezpečností?",
          guidance:
            "Vrcholné vedení musí jmenovat osobu pověřenou kybernetickou bezpečností (§ 4 vyhl. č. 410/2025 Sb.). Osoba nemusí být odborník — může jít o zaměstnance IT nebo externího dodavatele. Bezplatné školení NÚKIB: https://osveta.nukib.gov.cz/",
          helpText:
            "Vrcholné vedení musí jmenovat osobu pověřenou kybernetickou bezpečností (§ 4 vyhl. č. 410/2025 Sb.). Osoba nemusí být odborník — může jít o zaměstnance IT nebo externího dodavatele. Bezplatné školení NÚKIB: https://osveta.nukib.gov.cz/",
          evidenceType: "attestation",
          evidenceFields: [
            { key: "jmeno", label: "Jméno pověřené osoby", type: "text", required: true },
            { key: "datum_jmenovani", label: "Datum jmenování", type: "date", required: true },
            {
              key: "skoleni_absolvovano",
              label: "Absolvovala školení kybernetické bezpečnosti?",
              type: "boolean",
              required: true,
            },
            {
              key: "skoleni_datum",
              label: "Datum absolvování školení",
              type: "date",
              required: false,
            },
            {
              defaultValue: "https://osveta.nukib.gov.cz/",
              key: "skoleni_zdroj",
              label: "Zdroj školení",
              type: "text",
              required: false,
            },
            {
              key: "pravomoci_dokumentovany",
              label: "Jsou pravomoci zdokumentovány v bezpečnostní politice?",
              type: "boolean",
              required: true,
            },
          ],
          frameworkMappings: [
            {
              frameworkId: "zokb",
              reference: "§ 4",
              title: "Požadavky na vrcholné vedení",
            },
          ],
          officialBaselineRefs: ["§ 4"],
          nukibBlock: {
            blockTitle: "§ Organizační bezpečnost",
            sectionTitle: "Požadavky na vrcholné vedení",
          },
          nukibComplianceState: "not_implemented",
          nukibPriority: "high",
          nukibTier: "mandatory_minimum",
          nis2ArticleRef: "ZoKB § 4",
          zobkSectionRef: "§ 4",
        },
        {
          controlKey: "pohoda-iam-user-accounts",
          question:
            "Jsou uživatelé Pohody spravováni přes systém Stormware (Pohoda E1 pokročilé role) a má každý zaměstnanec samostatný účet?",
          guidance:
            "V Pohodě E1 je dostupná správa uživatelů a rolí pod Nastavení › Uživatelé. Zakažte sdílené přihlašovací údaje. Ověřte, že každý aktivní pracovník má vlastní účet s evidovatelnou aktivitou. Přiložte anonymizovaný export seznamu uživatelů.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(i)",
          zobkSectionRef: "§ 7 odst. 1",
        },
        {
          controlKey: "pohoda-iam-least-privilege",
          question:
            "Jsou uživatelská oprávnění nastavena podle principu nejmenšího privilegia (účetní nemají přístup k logistickým modulům a naopak)?",
          guidance:
            "Pohoda E1 umožňuje granulární nastavení přístupu k agendám (Fakturace, Sklady, Mzdy apod.) i k jednotlivým dokladům. Zdokumentujte matici rolí – kdo má přístup ke kterým agendám. Zvláštní pozornost věnujte přístupu ke mzdové agendě a bankovním příkazům. Přiložte snímek nastavení rolí z Pohody nebo exportovaný PDF přehled oprávnění.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(i)",
          zobkSectionRef: "§ 7 odst. 2",
        },
        {
          controlKey: "pohoda-iam-inactive-session-audit",
          question:
            "Provádíte pravidelný audit neaktivních uživatelských účtů v Pohodě (minimálně čtvrtletně)?",
          guidance:
            "Neaktivní účty (odchod zaměstnance, mateřská dovolená apod.) představují riziko neoprávněného přístupu. V Pohodě E1 zkontrolujte seznam uživatelů a datum posledního přihlášení. Neaktivní účty deaktivujte nebo odstraňte. Přiložte datovaný záznam z auditu (screenshot nebo exportovaný seznam).",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(i)",
          zobkSectionRef: "§ 7 odst. 3",
        },
        {
          controlKey: "pohoda-iam-offboarding",
          question:
            "Existuje formální proces pro odebrání přístupu do Pohody při ukončení pracovního poměru zaměstnance?",
          guidance:
            "Při odchodu zaměstnance je nutné neprodleně deaktivovat nebo smazat jeho účet v Pohodě i na úrovni operačního systému (Windows doménový účet). Zdokumentujte checklist offboardingu zahrnující: deaktivaci Pohoda účtu, odebrání přístupu k síťovým sdíleným složkám a předání přihlašovacích údajů správci. Přiložte vzor offboarding checklistu nebo záznam o provedení.",
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
          controlKey: "pohoda-backup-db-maintenance",
          question:
            "Provádíte pravidelnou Údržbu databáze Pohody (interní nástroj Pohody pro optimalizaci a integritu dat)?",
          guidance:
            "Pohoda obsahuje nástroj Údržba databáze (Soubor › Servis › Údržba databáze), který provádí optimalizaci tabulek a kontrolu integrity. Doporučuje se spouštět týdně nebo po větších hromadných operacích. Zdokumentujte frekvenci a osobu odpovědnou za spouštění. Přiložte záznam nebo screenshot posledního provedení.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(c)",
          zobkSectionRef: "§ 8 odst. 1",
        },
        {
          controlKey: "pohoda-backup-automated-daily",
          question:
            "Je záloha databáze Pohody automatizována a probíhá denně (nástroj Backup Complete SQL nebo ekvivalent)?",
          guidance:
            "Pohoda umožňuje automatické zálohy přes vestavěný Plánovač záloh nebo externí nástroje jako Backup Complete SQL (doporučený partner Stormware). Záloha by měla být šifrovaná a ukládaná na jiné médium než produkční server (lokální NAS, FTPS nebo cloud). Ověřte, že záloha probíhá mimo pracovní dobu. Přiložte konfiguraci plánovače nebo log úspěšných záloh za posledních 30 dní.",
          evidenceType: "both",
          frameworkMappings: [
            {
              frameworkId: "zokb",
              reference: "§ 6",
              title: "Řízení kontinuity činností",
            },
          ],
          officialBaselineRefs: ["§ 6", "§ 6 písm. c)"],
          nukibComplianceState: "planned",
          nukibPriority: "high",
          nukibTier: "mandatory_minimum",
          nis2ArticleRef: "Article 21(2)(c)",
          zobkSectionRef: "§ 8 odst. 2",
        },
        {
          controlKey: "pohoda-backup-offsite-immutable",
          question:
            "Jsou zálohy ukládány mimo primární lokalitu nebo v immutable úložišti (off-site NAS, FTPS, cloud s ochranou proti přepsání)?",
          guidance:
            "Záloha na stejném fyzickém serveru jako produkce nechrání před požárem, krádeží nebo ransomwarem. Implementujte pravidlo 3-2-1: 3 kopie, 2 různá média, 1 mimo lokalitu. FTPS nebo cloudové úložiště s verzováním a lock politikou (např. Azure Blob s immutability policy) výrazně snižuje riziko nevratné ztráty dat. Přiložte důkaz o konfiguraci vzdáleného úložiště.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(c)",
          zobkSectionRef: "§ 8 odst. 3",
        },
        {
          controlKey: "pohoda-backup-restoration-test",
          question:
            "Provádíte minimálně jednou ročně dokumentovaný test obnovy databáze Pohody ze zálohy?",
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
          controlKey: "pohoda-api-mserver-auth",
          question:
            "Je přístup k mServer XML API zabezpečen (Base64 Basic Auth nebo API klíče) a přenáší se výhradně přes VPN nebo HTTPS?",
          guidance:
            "Pohoda mServer (XML API) je dostupný na nakonfigurovaném portu a vyžaduje autentizaci. Ujistěte se, že mServer není dostupný z veřejného internetu bez VPN. Pokud mServer musí být dostupný přes internet, použijte HTTPS s platným TLS certifikátem. Base64 Basic Auth je akceptovatelná pouze v kombinaci s HTTPS/VPN – nikdy přes plain HTTP. Přiložte screenshot konfigurace mServeru nebo síťového pravidla.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(g)",
          zobkSectionRef: "§ 9 odst. 1",
        },
        {
          controlKey: "pohoda-api-credential-rotation",
          question:
            "Probíhá rotace přihlašovacích údajů k mServer API minimálně jednou ročně nebo při odchodu pracovníka s přístupem?",
          guidance:
            "API přihlašovací údaje jsou dlouhodobé tajné informace. Nastavte interní politiku pro pravidelnou rotaci (doporučeno každých 6–12 měsíců). Zajistěte, aby stará hesla nebyla uložena v plain textu v integračních skriptech nebo konfiguračních souborech. Přiložte záznam o poslední rotaci nebo interní policy dokument.",
          evidenceType: "attestation",
          nis2ArticleRef: "Article 21(2)(g)",
          zobkSectionRef: "§ 9 odst. 2",
        },
        {
          controlKey: "pohoda-api-ip-whitelist",
          question:
            "Je mServer listener omezen na whitelistované IP adresy nebo sítě integračních systémů?",
          guidance:
            "Na serveru s mServerem nastavte firewall pravidla (Windows Firewall nebo síťový firewall), která povolují příchozí spojení na port mServeru pouze z konkrétních IP adres integračních systémů (e-shop, ERP konektor apod.). Zamezíte tím neoprávněnému přístupu v případě úniku přihlašovacích údajů. Přiložte export firewall pravidel (IP adresy anonymizujte).",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(g)",
          zobkSectionRef: "§ 9 odst. 3",
        },
        {
          controlKey: "pohoda-api-tls-enforcement",
          question:
            "Je pro mServer a případná webová rozhraní Pohody vynuceno HTTPS/TLS (minimálně TLS 1.2)?",
          guidance:
            "Plain HTTP přenos vystavuje přihlašovací údaje a účetní data odposlouchávání. Nakonfigurujte TLS certifikát pro mServer (Let's Encrypt nebo komerční CA) a zakažte TLS 1.0 a 1.1. Ověřte konfiguraci nástrojem SSL Labs nebo testovacím curl příkazem. Přiložte screenshot výsledku SSL testu nebo konfiguraci HTTPS na serveru.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(g)",
          zobkSectionRef: "§ 9 odst. 4",
        },
      ],
    },
  ],
};
