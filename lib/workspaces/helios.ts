import type { PlatformWorkspace } from "@/lib/workspaces/types";

// Helios (Asseco) platform workspace configuration.
// Covers the four standard compliance layers for NIS2 ZoKB SME readiness.
// Helios is widely deployed in Czech manufacturing, logistics, and HR environments
// on dedicated on-premises SQL Server infrastructure. ZoKB classification as an
// essential entity is especially relevant for manufacturing operators.
// All questions and guidance are in Czech using Helios-specific terminology.
export const heliosWorkspace: PlatformWorkspace = {
  platformId: "helios",
  platformName: "Helios",
  platformVendor: "Asseco",
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
          controlKey: "helios-infra-deployment-type",
          question:
            "Jaký typ nasazení systému Helios provozujete (on-premises SQL Server, dedikovaný výrobní server, nebo cloud/hosting)? Je server fyzicky umístěn ve vlastní serverovně?",
          guidance:
            "Helios je nejčastěji nasazen na dedikovaných on-premises serverech ve výrobních provozech. Zdokumentujte typ nasazení, verzi Heliosu a verzi SQL Serveru. U cloudového hostingu zajistěte platnou smlouvu o zpracování dat (DPA) s poskytovatelem. Výrobní firmy jsou při nasazení on-premises plně odpovědné za fyzickou i síťovou bezpečnost serveru. Přiložte diagram nasazení nebo technický popis infrastruktury.",
          evidenceType: "attestation",
          nis2ArticleRef: "Article 21(2)(h)",
        },
        {
          controlKey: "helios-infra-physical-server-room",
          question:
            "Je serverovna, v níž běží SQL Server s databází Heliosu, fyzicky zabezpečena (zamykání, kamerový systém, řízený přístup, ochrana před požárem/záplaví)?",
          guidance:
            "Výrobní prostředí typicky zahrnuje pohyb externích pracovníků, dodavatelů a servisních techniků. Serverovna musí být uzamčena a přístup omezen pouze na oprávněné administrátory. Doporučuje se evidovat fyzický přístup (přístupový systém nebo kniha návštěv). Zajistěte záložní napájení (UPS) a ochranu proti přehřátí. Přiložte fotografii serverovny, záznam z přístupového systému nebo interní směrnici o přístupu do serverovny.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(h)",
          zobkSectionRef: "§ 5 odst. 1 písm. d)",
        },
        {
          controlKey: "helios-infra-encryption-at-rest",
          question:
            "Je databáze Heliosu na SQL Serveru šifrována v klidovém stavu (Transparent Data Encryption – TDE, nebo šifrování disku BitLocker)?",
          guidance:
            "SQL Server Enterprise a Developer edition podporují Transparent Data Encryption (TDE), která šifruje celou databázi na úrovni souborů. Pokud TDE není k dispozici, zajistěte šifrování celého disku pomocí BitLockeru. Šifrování chrání data při fyzickém odcizení nebo neoprávněném přístupu k souborovému systému serveru. Přiložte screenshot konfigurace TDE v SQL Server Management Studiu nebo potvrzení o aktivaci BitLockeru.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(h)",
          zobkSectionRef: "§ 5 odst. 1 písm. d)",
        },
        {
          controlKey: "helios-infra-os-patch-management",
          question:
            "Jak zajišťujete pravidelné záplatování operačního systému a SQL Serveru, na nichž běží Helios? Existuje zdokumentovaný plán záplatování?",
          guidance:
            "Asseco vydává aktualizace Heliosu pravidelně; záplatování OS a SQL Serveru je v odpovědnosti provozovatele. Zdokumentujte frekvenci záplatování, odpovědnou osobu a postup testování patchů před nasazením do produkce. Ve výrobním provozu plánujte záplatování do plánovaných odstávek, aby nebyl narušen výrobní proces. Přiložte výpis nainstalovaných aktualizací nebo záznam z interního ticketovacího systému.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(h)",
          zobkSectionRef: "§ 6 odst. 1 písm. b)",
        },
        {
          controlKey: "helios-infra-network-segmentation",
          question:
            "Je server s databází Heliosu síťově segmentován od výrobní sítě (OT/PLC sítě), kancelářské sítě a od internetu (VLAN, firewall pravidla)?",
          guidance:
            "Ve výrobních provozech existují typicky tři oddělené sítě: IT (kanceláře, ERP), OT (PLC, SCADA, MES) a případně DMZ pro externí přístupy. Server Heliosu patří do IT sítě a nesmí být přímo dostupný z OT sítě ani z internetu bez VPN. Přístupy mezi sítěmi by měly procházet firewallem s explicitními pravidly. Přiložte síťové schéma nebo export firewall pravidel (s anonymizovanými IP adresami). Segmentace je obzvláště kritická, pokud je firma klasifikována jako provozovatel základní služby dle ZoKB.",
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
          controlKey: "helios-iam-user-accounts",
          question:
            "Jsou uživatelé Heliosu spravováni s individuálními účty? Je zakázáno sdílení přihlašovacích údajů (zejména mezi směnami, operátory výroby nebo externími pracovníky)?",
          guidance:
            "Helios umožňuje správu uživatelů a rolí v administrátorském rozhraní. Každý zaměstnanec, operátor i externí pracovník musí mít vlastní účet umožňující dohledatelnost akcí. Výrobní prostředí s třísměnným provozem a výraznou fluktuací externích pracovníků a agenturních zaměstnanců je zvláště náchylné ke sdílení přihlašovacích údajů. Zakažte sdílené generické účty (např. 'operator1'). Přiložte anonymizovaný export seznamu aktivních uživatelů.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(i)",
          zobkSectionRef: "§ 7 odst. 1",
        },
        {
          controlKey: "helios-iam-module-role-hierarchy",
          question:
            "Jsou uživatelská oprávnění v Heliosu nastavena podle hierarchie rolí s oddělením přístupu mezi moduly: výroba/MES, HR/mzdy, logistika/sklady, účetnictví/finance?",
          guidance:
            "Helios pokrývá ERP pro výrobu, HR, logistiku i finance. Zdokumentujte matici rolí s výčtem, kdo má přístup do kterých modulů. Klíčová oddělení: (1) Výrobní operátoři nesmí mít přístup k mzdové agendě. (2) HR pracovníci nesmí vidět výrobní kusovníky ani skladové zásoby bez oprávnění. (3) Logisté mají přístup ke skladům a expedici, ale ne k finančním výkazům. (4) Účetní a finanční správci jsou odděleni od výrobního plánování. Přiložte matici přístupu k modulům nebo screenshot nastavení rolí.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(i)",
          zobkSectionRef: "§ 7 odst. 2",
        },
        {
          controlKey: "helios-iam-contractor-access-management",
          question:
            "Existuje formální proces pro správu přístupu externích pracovníků a dodavatelů do Heliosu? Je přístup vázán na dobu trvání zakázky nebo smlouvy?",
          guidance:
            "Výrobní firmy typicky spolupracují s agenturními zaměstnanci, externími servisními techniky a dodavateli, kteří mohou potřebovat dočasný přístup do systému. Nastavte časově omezené účty nebo zajistěte explicitní deaktivaci po ukončení spolupráce. Veďte evidenci externích přístupů s datem vzniku, datumem plánovaného ukončení a jménem odpovědné osoby. Přiložte vzor procesu pro přidělení a odebrání externího přístupu.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(i)",
          zobkSectionRef: "§ 7 odst. 3",
        },
        {
          controlKey: "helios-iam-inactive-session-audit",
          question:
            "Provádíte pravidelný audit neaktivních uživatelských účtů v Heliosu (minimálně čtvrtletně)? Jsou neaktivní účty deaktivovány?",
          guidance:
            "Výrobní firmy s vysokou fluktuací zaměstnanců a sezónními výkyvy pracovní síly jsou náchylné na hromadění neaktivních účtů. Čtvrtletně zkontrolujte seznam uživatelů Heliosu a porovnejte s aktuálním stavem HR. Neaktivní účty (odchod, mateřská dovolená, konec sezóny) neprodleně deaktivujte nebo odstraňte. Přiložte datovaný záznam z auditu (screenshot nebo exportovaný seznam).",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(i)",
          zobkSectionRef: "§ 7 odst. 3",
        },
        {
          controlKey: "helios-iam-offboarding",
          question:
            "Existuje formální a zdokumentovaný offboarding checklist pro odebrání přístupu do Heliosu při ukončení pracovního poměru nebo spolupráce, včetně agenturních zaměstnanců a externích dodavatelů?",
          guidance:
            "Při odchodu zaměstnance nebo ukončení spolupráce s externím pracovníkem je nutné neprodleně deaktivovat nebo smazat účet v Heliosu, zrušit Windows doménový účet a odebrat přístupy k sdíleným složkám. Ve výrobních provozech s vysokou fluktuací a sezónními zaměstnanci je formalizovaný offboarding obzvláště kritický – systém bez evidence aktivních uživatelů je snadno zranitelný. Checklist by měl zahrnovat: Helios účet, AD/doménový účet, e-mail, přístupové karty. Přiložte vzor offboarding checklistu nebo záznamy o provedení za posledních 6 měsíců.",
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
          controlKey: "helios-backup-sql-agent-jobs",
          question:
            "Jsou zálohy databáze Heliosu automatizovány prostřednictvím SQL Server Agent Jobs nebo jiného zálohovacího nástroje (např. Veeam, Backup Exec)? Provádí se záloha denně?",
          guidance:
            "Helios ukládá data do SQL Serveru; zálohy jsou výhradně v odpovědnosti provozovatele. Doporučeným nástrojem jsou nativní SQL Server Agent Jobs pro plné (FULL) zálohy a diferenciální (DIFFERENTIAL) nebo transakční zálohy (LOG) v průběhu dne. Alternativně lze použít třetí strany (Veeam, Backup Exec). Záloha by měla probíhat mimo produkční špičku (typicky v noci nebo o víkendu). Přiložte konfiguraci SQL Agent Jobu nebo log úspěšných záloh za posledních 30 dní.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(c)",
          zobkSectionRef: "§ 8 odst. 1",
        },
        {
          controlKey: "helios-backup-encryption",
          question:
            "Jsou zálohy databáze Heliosu šifrovány (nativní šifrování SQL Serveru, nebo šifrování zálohovacím nástrojem)?",
          guidance:
            "SQL Server 2014 a vyšší podporují nativní šifrování záloh (WITH ENCRYPTION v T-SQL příkazu BACKUP DATABASE). Alternativně zajistěte šifrování zálohovacím softwarem. Nešifrovaná záloha je čitelná bez znalosti systému a představuje kritické riziko při odcizení zálohovacího média. Přiložte screenshot nebo konfiguraci potvrzující šifrování záloh.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(c)",
          zobkSectionRef: "§ 8 odst. 2",
        },
        {
          controlKey: "helios-backup-offsite-immutable",
          question:
            "Jsou zálohy ukládány mimo primární lokalitu nebo v immutable úložišti (off-site NAS, cloud s verzováním, páskové zálohy mimo budovu)?",
          guidance:
            "Záloha na stejném fyzickém serveru nebo ve stejné budově jako produkce nechrání před požárem, krádeží nebo ransomwarem. Implementujte pravidlo 3-2-1: 3 kopie, 2 různá média, 1 mimo lokalitu. Pro výrobní firmy s požadavkem na rychlou obnovu (RTO) zvažte cloudové zálohy s immutability policy (Azure Blob Storage) nebo off-site NAS s replikací. Přiložte důkaz o konfiguraci vzdáleného úložiště.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(c)",
          zobkSectionRef: "§ 8 odst. 3",
        },
        {
          controlKey: "helios-backup-restoration-test",
          question:
            "Provádíte minimálně jednou ročně dokumentovaný test obnovy databáze Heliosu ze zálohy do izolovaného testovacího prostředí?",
          guidance:
            "Záloha bez ověřené obnovy nemá hodnotu. Test obnovy by měl zahrnovat: obnovení zálohy do izolovaného testovacího SQL Serveru, spuštění Heliosu a ověření integrity dat (otevření klíčových agend, kontrola posledních dokladů a výrobních zakázek), zdokumentování výsledku a doby obnovy (RTO). Pro výrobní firmy klasifikované dle ZoKB jako provozovatelé základní nebo důležité služby je test obnovy explicitním požadavkem. Přiložte datovaný protokol z posledního testu obnovy podepsaný odpovědnou osobou.",
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
          controlKey: "helios-api-mes-scada-integration",
          question:
            "Jak je integrován Helios se systémy MES (Manufacturing Execution System) nebo SCADA? Je autentizace na těchto integracích zabezpečena (API klíče, servisní účty, VPN)?",
          guidance:
            "Helios je ve výrobním prostředí typicky propojen s MES systémy (např. Infor, Simatic IT) nebo SCADA přes databázové konektory, REST API nebo OPC-UA rozhraní. Ověřte: (1) Používají integrace dedikované servisní účty s minimálním oprávněním? (2) Je komunikace šifrována (HTTPS/TLS nebo VPN)? (3) Jsou servisní účty odděleny od uživatelských účtů? Propojení IT a OT sítí (kde běží SCADA) je z pohledu ZoKB obzvláště citlivé. Přiložte popis integrace a konfiguraci autentizace.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(g)",
          zobkSectionRef: "§ 9 odst. 1",
        },
        {
          controlKey: "helios-api-edi-supplier-customer",
          question:
            "Jsou EDI připojení k dodavatelům a odběratelům (EDIFACT, XML, AS2 nebo jiný protokol) zabezpečena? Jsou ověřeny protokoly a autentizace na obou stranách?",
          guidance:
            "Výrobní firmy typicky provozují EDI výměnu dokladů (objednávky, dodací listy, faktury) s klíčovými odběrateli a dodavateli. Starší EDI protokoly (EDIFACT přes FTP, VAN sítě) mohou mít slabou autentizaci nebo šifrování. Ověřte: (1) Používá EDI přenos šifrovaný kanál (SFTP, AS2 s certifikátem, HTTPS)? (2) Jsou EDI přihlašovací údaje uchovávány bezpečně (ne v plain textu v konfiguračních souborech)? (3) Existuje seznam aktivních EDI partnerů a jejich protokolů? Přiložte přehled EDI připojení s použitými protokoly (bez přihlašovacích údajů).",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(g)",
          zobkSectionRef: "§ 9 odst. 2",
        },
        {
          controlKey: "helios-api-credential-rotation",
          question:
            "Probíhá rotace přihlašovacích údajů k integracím (MES, SCADA API, EDI, datové konektory) minimálně jednou ročně nebo při odchodu pracovníka s přístupem?",
          guidance:
            "Integrační servisní účty a API klíče jsou dlouhodobé tajné informace s vysokým rizikem při úniku. Nastavte interní politiku pravidelné rotace (doporučeno každých 6–12 měsíců). Zajistěte, aby stará přihlašovací hesla nebyla uložena v plain textu v integračních skriptech nebo konfiguračních souborech SQL Agenta. Ve výrobním prostředí věnujte zvláštní pozornost přihlašovacím údajům k MES a SCADA rozhraním – jejich kompromitace může mít dopad na fyzický výrobní proces. Přiložte záznam o poslední rotaci nebo interní policy dokument.",
          evidenceType: "attestation",
          nis2ArticleRef: "Article 21(2)(g)",
          zobkSectionRef: "§ 9 odst. 3",
        },
        {
          controlKey: "helios-api-network-access-control",
          question:
            "Jsou API rozhraní Heliosu a integrační endpointy omezeny na whitelist IP adres nebo sítí (firewall pravidla, VPN, síťové ACL)?",
          guidance:
            "Přístupy k integračním rozhraním Heliosu (databázové konektory, REST API, EDI gateway) by měly být povoleny pouze z konkrétních síťových adres nebo segmentů. Na serveru a síťovém firewallu nastavte pravidla omezující příchozí spojení na integrační porty výhradně na oprávněné systémy (MES server, EDI gateway, SCADA server). Tím eliminujete riziko neoprávněného přístupu v případě úniku přihlašovacích údajů. Přiložte export firewall pravidel nebo konfiguraci síťových ACL (IP adresy anonymizujte).",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(g)",
          zobkSectionRef: "§ 9 odst. 4",
        },
        {
          controlKey: "helios-api-tls-enforcement",
          question:
            "Je pro všechna webová a API rozhraní Heliosu vynuceno HTTPS/TLS (minimálně TLS 1.2)? Jsou zakázány starší protokoly (TLS 1.0, TLS 1.1, SSL)?",
          guidance:
            "Plain HTTP nebo zastaralé TLS protokoly vystavují přihlašovací údaje a výrobní data odposlouchávání nebo útokům man-in-the-middle. Nakonfigurujte TLS 1.2 nebo vyšší pro všechna rozhraní Heliosu dostupná přes síť. Ověřte konfiguraci nástrojem SSL Labs nebo testovacím openssl příkazem. Věnujte pozornost i interním síťovým rozhraním – OT sítě jsou stále náchylné k interním útokům. Přiložte screenshot výsledku TLS testu nebo konfiguraci HTTPS na serveru.",
          evidenceType: "both",
          nis2ArticleRef: "Article 21(2)(g)",
          zobkSectionRef: "§ 9 odst. 5",
        },
      ],
    },
  ],
};
