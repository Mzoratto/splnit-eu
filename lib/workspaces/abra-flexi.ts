import type {
  FrameworkMapping,
  NukibControlTier,
  NukibPriority,
} from "@/lib/compliance/nukib/types";
import type { PlatformWorkspace } from "@/lib/workspaces/types";

function zokbMetadata(input: {
  officialBaselineRefs?: readonly string[];
  priority: NukibPriority;
  reference: string;
  tier: NukibControlTier;
  title: string;
}) {
  const mappings: FrameworkMapping[] = [
    {
      frameworkId: "zokb",
      reference: input.reference,
      title: input.title,
    },
  ];

  return {
    frameworkMappings: mappings,
    nukibPriority: input.priority,
    nukibTier: input.tier,
    officialBaselineRefs: input.officialBaselineRefs ? [...input.officialBaselineRefs] : [input.reference],
  };
}

const ZOKB_MINIMUM_SYSTEM = {
  priority: "high",
  reference: "§ 3",
  tier: "mandatory_minimum",
  title: "Systém zajišťování minimální kybernetické bezpečnosti",
} as const;
const ZOKB_CONTINUITY = {
  officialBaselineRefs: ["§ 6", "§ 6 písm. c)"],
  priority: "high",
  reference: "§ 6",
  tier: "mandatory_minimum",
  title: "Řízení kontinuity činností",
} as const;
const ZOKB_ACCESS = {
  priority: "unset",
  reference: "§ 7",
  tier: "assessable",
  title: "Řízení přístupu",
} as const;
const ZOKB_IDENTITY = {
  priority: "unset",
  reference: "§ 8",
  tier: "assessable",
  title: "Řízení identit a jejich oprávnění",
} as const;
const ZOKB_NETWORK = {
  priority: "high",
  reference: "§ 11",
  tier: "assessable",
  title: "Bezpečnost komunikačních sítí",
} as const;
const ZOKB_APPLICATION_SECURITY = {
  priority: "unset",
  reference: "§ 12",
  tier: "assessable",
  title: "Aplikační bezpečnost",
} as const;

export const abraFlexiWorkspace: PlatformWorkspace = {
  platformId: "abra-flexi",
  platformName: "ABRA Flexi",
  platformVendor: "ABRA Software a.s.",
  layers: [
    {
      id: "infrastructure",
      nukibBlock: {
        blockTitle: "§ Technická opatření",
        sectionTitle: "Kryptografické prostředky",
      },
      title: "Infrastruktura a zabezpečení úložiště",
      controls: [
        {
          controlKey: "abra-flexi-infra-deployment-secured",
          evidenceType: "attestation",
          guidance:
            "Zdokumentujte, zda ABRA Flexi běží v cloudu ABRA/FlexiBee, na vlastním serveru, nebo jako lokální instalace. Uveďte vlastníka serveru, verzi aplikace, odpovědnost za patching a smlouvu/DPA u hostované varianty.",
          nis2ArticleRef: "Article 21(2)(h)",
          question:
            "Je typ nasazení ABRA Flexi zdokumentovaný včetně odpovědnosti za server, aktualizace a hosting?",
          zobkSectionRef: "§ 5 odst. 1 písm. d)",
          ...zokbMetadata(ZOKB_APPLICATION_SECURITY),
        },
        {
          controlKey: "abra-flexi-infra-database-protected",
          evidenceType: "both",
          guidance:
            "Doložte šifrování disku nebo databáze, přístup pouze pro administrátory a pravidelné aktualizace OS/databáze. U hostované varianty doložte potvrzení poskytovatele nebo smluvní bezpečnostní přílohu.",
          nis2ArticleRef: "Article 21(2)(h)",
          question:
            "Je databáze nebo server ABRA Flexi chráněn šifrováním, omezeným přístupem a správou záplat?",
          zobkSectionRef: "§ 5 odst. 1 písm. d)",
          ...zokbMetadata(ZOKB_MINIMUM_SYSTEM),
        },
        {
          controlKey: "abra-flexi-infra-network-restricted",
          evidenceType: "both",
          guidance:
            "Ověřte, že ABRA Flexi není dostupná z internetu bez omezení. Vhodné důkazy jsou firewall pravidla, VPN konfigurace, reverzní proxy s TLS nebo popis povolených IP adres.",
          nis2ArticleRef: "Article 21(2)(h)",
          question:
            "Je síťový přístup k ABRA Flexi omezený pomocí HTTPS, VPN, firewallu nebo allowlistu?",
          zobkSectionRef: "§ 5 odst. 1 písm. e)",
          ...zokbMetadata(ZOKB_NETWORK),
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
          apiEndpoint: "/c/<firma>/uzivatel.json",
          apiExpected: "active users returned",
          apiField: "winstrom.uzivatel",
          automatable: true,
          controlKey: "abra-flexi-iam-user-accounts",
          evidenceType: "both",
          guidance:
            "Automatická kontrola ověří čitelnost evidence uživatelů. Ručně doložte, že každý pracovník má samostatný účet a sdílené účty jsou zakázané.",
          nis2ArticleRef: "Article 21(2)(i)",
          question:
            "Má každý aktivní uživatel ABRA Flexi vlastní účet a je evidence uživatelů čitelná přes REST API?",
          zobkSectionRef: "§ 7 odst. 1",
          ...zokbMetadata(ZOKB_ACCESS),
        },
        {
          controlKey: "abra-flexi-iam-least-privilege",
          evidenceType: "both",
          guidance:
            "Přiložte matici rolí nebo anonymizovaný export oprávnění. Oddělte účetnictví, mzdy, sklad, fakturaci, API uživatele a administrátory.",
          nis2ArticleRef: "Article 21(2)(i)",
          question:
            "Jsou role ABRA Flexi nastavené podle nejmenšího oprávnění a oddělení agend?",
          zobkSectionRef: "§ 7 odst. 2",
          ...zokbMetadata(ZOKB_ACCESS),
        },
        {
          controlKey: "abra-flexi-iam-offboarding",
          evidenceType: "attestation",
          guidance:
            "Doložte checklist pro deaktivaci účtu ABRA Flexi, zrušení API uživatele nebo změnu hesla po odchodu pracovníka s přístupem.",
          nis2ArticleRef: "Article 21(2)(i)",
          question:
            "Existuje proces pro odebrání přístupu do ABRA Flexi při odchodu zaměstnance nebo dodavatele?",
          zobkSectionRef: "§ 7 odst. 3",
          ...zokbMetadata(ZOKB_IDENTITY),
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
          apiEndpoint: "/c/<firma>/backup",
          apiExpected: "manual review fallback",
          apiField: "backup response status",
          automatable: true,
          controlKey: "abra-flexi-backup-api",
          evidenceType: "both",
          guidance:
            "ABRA Flexi REST API podporuje stažení zálohy firmy, ale automatická kontrola nesmí ukládat zálohový soubor. Doložte ručně plán zálohování, umístění záloh a poslední výsledek.",
          nis2ArticleRef: "Article 21(2)(c)",
          question:
            "Je existence záloh ABRA Flexi doložená API signálem nebo ručním záznamem?",
          zobkSectionRef: "§ 8 odst. 1",
          ...zokbMetadata(ZOKB_CONTINUITY),
        },
        {
          controlKey: "abra-flexi-backup-schedule",
          evidenceType: "attestation",
          guidance:
            "Doložte frekvenci záloh, retenci, odpovědnou osobu a místo uložení. Záloha na stejném serveru jako produkce nestačí jako jediné opatření.",
          nis2ArticleRef: "Article 21(2)(c)",
          question:
            "Je nastavený pravidelný plán záloh ABRA Flexi včetně retence a uložení mimo primární server?",
          zobkSectionRef: "§ 8 odst. 2",
          ...zokbMetadata(ZOKB_CONTINUITY),
        },
        {
          controlKey: "abra-flexi-backup-restore-test",
          evidenceType: "attestation",
          guidance:
            "Přiložte protokol z obnovy do testovacího prostředí. Protokol má uvést datum, rozsah, výsledek, dobu obnovy a odpovědnou osobu.",
          nis2ArticleRef: "Article 21(2)(c)",
          question:
            "Byl v posledních 12 měsících proveden dokumentovaný test obnovy ABRA Flexi ze zálohy?",
          zobkSectionRef: "§ 8 odst. 4",
          ...zokbMetadata(ZOKB_CONTINUITY),
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
          apiEndpoint: "baseUrl protocol",
          apiExpected: "https",
          apiField: "URL.protocol",
          automatable: true,
          controlKey: "abra-flexi-api-https",
          evidenceType: "both",
          guidance:
            "Automatická kontrola vyhodnotí protokol základní URL. HTTP může být akceptovatelný jen pro interní instalaci chráněnou VPN nebo lokální sítí; kompenzaci doložte ručně.",
          nis2ArticleRef: "Article 21(2)(g)",
          question:
            "Používá ABRA Flexi API HTTPS, nebo je nešifrovaný transport kompenzován VPN/lokálním omezením?",
          zobkSectionRef: "§ 9 odst. 1",
          ...zokbMetadata(ZOKB_MINIMUM_SYSTEM),
        },
        {
          apiEndpoint: "/c/<firma>/nastaveni.json",
          apiExpected: "configuration readable",
          apiField: "winstrom.nastaveni",
          automatable: true,
          controlKey: "abra-flexi-api-config-readable",
          evidenceType: "both",
          guidance:
            "REST API uživatel pro Splnit.eu má být samostatný, s minimálním čtecím přístupem a bez sdílení hesla v jiných systémech.",
          nis2ArticleRef: "Article 21(2)(i)",
          question:
            "Je REST API uživatel ABRA Flexi čitelný pro potřebné evidence a omezený na minimální oprávnění?",
          zobkSectionRef: "§ 9 odst. 1",
          ...zokbMetadata(ZOKB_ACCESS),
        },
        {
          controlKey: "abra-flexi-api-credential-rotation",
          evidenceType: "attestation",
          guidance:
            "Doložte vlastníka API účtu, datum poslední rotace a postup okamžité změny hesla při odchodu odpovědné osoby nebo podezření na únik.",
          nis2ArticleRef: "Article 21(2)(i)",
          question:
            "Jsou přihlašovací údaje REST API uživatele ABRA Flexi pravidelně rotované a uložené mimo zdrojový kód?",
          zobkSectionRef: "§ 9 odst. 2",
          ...zokbMetadata(ZOKB_IDENTITY),
        },
      ],
    },
  ],
};
