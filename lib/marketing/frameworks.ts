export type FrameworkStatus = "available" | "soon";

export type FrameworkCard = {
  slug: string;
  name: string;
  icon: string;
  regulator: string;
  deadline: string;
  status: FrameworkStatus;
  description: string;
};

export type FrameworkDetail = FrameworkCard & {
  law: string;
  hero: string;
  appliesTo: string[];
  obligations: {
    title: string;
    reference: string;
    deadline: string;
    description: string;
  }[];
  fines: {
    violation: string;
    maximum: string;
    enforcer: string;
  }[];
  splnitHelps: {
    icon: string;
    title: string;
    description: string;
  }[];
  resources: string[];
};

export const frameworkCards: FrameworkCard[] = [
  {
    slug: "nis2",
    name: "NIS2",
    icon: "solar:server-square-linear",
    regulator: "NÚKIB",
    deadline: "Listopad 2025",
    status: "available",
    description: "Kybernetická bezpečnost pro střední a velké firmy.",
  },
  {
    slug: "eu-ai-act",
    name: "EU AI Act",
    icon: "solar:cpu-bolt-linear",
    regulator: "EU / národní orgány (bude potvrzeno)",
    deadline: "Srpen 2026",
    status: "available",
    description: "Povinnosti pro nasazovatele AI systémů.",
  },
  {
    slug: "gdpr",
    name: "GDPR",
    icon: "solar:shield-user-linear",
    regulator: "ÚOOÚ",
    deadline: "Aktivní",
    status: "available",
    description: "Ochrana osobních údajů — platí pro každou firmu.",
  },
  {
    slug: "iso-27001",
    name: "ISO 27001",
    icon: "solar:document-text-linear",
    regulator: "ISO/ČAS",
    deadline: "Průběžně",
    status: "available",
    description: "Mezinárodní standard pro informační bezpečnost.",
  },
  {
    slug: "csrd",
    name: "CSRD",
    icon: "solar:leaf-linear",
    regulator: "Národní ESG dohled",
    deadline: "2026+",
    status: "available",
    description: "ESG reporting pro dodavatele velkých korporací.",
  },
  {
    slug: "dora",
    name: "DORA",
    icon: "solar:banknote-2-linear",
    regulator: "ČNB",
    deadline: "Leden 2025",
    status: "soon",
    description: "Digitální odolnost pro finanční instituce.",
  },
];

export const frameworkDetails: FrameworkDetail[] = [
  {
    ...frameworkCards[0],
    law: "Zákon č. 264/2025 Sb.",
    hero:
      "NIS2 zavádí povinná kyberbezpečnostní opatření pro důležité a základní subjekty. Česká transpozice přes NÚKIB vyžaduje řízení rizik, hlášení incidentů a průběžnou dokumentaci bezpečnostních kontrol.",
    appliesTo: [
      "Střední a velké firmy s 50+ zaměstnanci nebo obratem nad 10 mil. EUR ve vybraných sektorech.",
      "Digitální služby, cloud, datová centra, řízené IT služby a poskytovatelé online tržišť.",
      "Výroba, energetika, zdravotnictví, doprava a dodavatelé kritických služeb v ČR.",
      "České s.r.o. a a.s., které dodávají služby subjektům v regulovaných odvětvích.",
    ],
    obligations: [
      {
        title: "MFA pro všechny uživatele",
        reference: "Článek 21(2)(j)",
        deadline: "aktivní",
        description: "Silné ověření přístupu k systémům a administrátorským účtům.",
      },
      {
        title: "Řízení zranitelností",
        reference: "Článek 21(2)(e)",
        deadline: "průběžně",
        description: "Evidence zranitelností, prioritizace a reakce podle rizika.",
      },
      {
        title: "Incident response",
        reference: "Článek 23",
        deadline: "24 hodin",
        description: "První hlášení významného incidentu regulátorovi.",
      },
      {
        title: "Dodavatelský řetězec",
        reference: "Článek 21(2)(d)",
        deadline: "aktivní",
        description: "Hodnocení rizik klíčových ICT dodavatelů.",
      },
    ],
    fines: [
      {
        violation: "Základní subjekty",
        maximum: "10 mil. EUR nebo 2 % obratu",
        enforcer: "NÚKIB",
      },
      {
        violation: "Důležité subjekty",
        maximum: "7 mil. EUR nebo 1,4 % obratu",
        enforcer: "NÚKIB",
      },
      {
        violation: "Neohlášení incidentu",
        maximum: "podle závažnosti a obratu",
        enforcer: "NÚKIB",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:shield-network-linear",
        title: "NÚKIB feed",
        description: "České zranitelnosti a upozornění mapované na vaše integrace.",
      },
      {
        icon: "solar:bolt-circle-linear",
        title: "21 opatření",
        description: "Kontroly rozdělené podle povinných bezpečnostních opatření.",
      },
      {
        icon: "solar:document-check-linear",
        title: "Hlášení a důkazy",
        description: "Auditní stopa pro incidenty, přístupy a dodavatelská rizika.",
      },
    ],
    resources: ["NIS2 checklist", "Mapa povinností NÚKIB", "Incident log šablona"],
  },
  {
    ...frameworkCards[1],
    law: "Nařízení (EU) 2024/1689",
    hero:
      "EU AI Act rozlišuje zakázané, vysoce rizikové a běžné AI systémy. Nasazovatelé AI musí zavést AI gramotnost, evidenci používání a procesy pro high-risk systémy.",
    appliesTo: [
      "Firmy, které nasazují AI nástroje pro HR, finance, scoring, bezpečnost nebo zákaznickou podporu.",
      "České SaaS firmy, které AI funkce poskytují zákazníkům v EU.",
      "Organizace používající generativní AI pro interní procesy a rozhodování.",
      "Dodavatelé high-risk AI systémů podle Annex III.",
    ],
    obligations: [
      {
        title: "AI gramotnost zaměstnanců",
        reference: "Článek 4",
        deadline: "srpen 2025",
        description: "Školení lidí, kteří AI systémy používají nebo spravují.",
      },
      {
        title: "Evidence používání AI",
        reference: "Článek 26",
        deadline: "srpen 2026",
        description: "Záznam účelu, vlastníka, rizik a vstupů AI systému.",
      },
      {
        title: "Lidský dohled",
        reference: "Článek 14",
        deadline: "srpen 2026",
        description: "Jasně určená odpovědnost za rozhodnutí podporovaná AI.",
      },
      {
        title: "Transparentnost",
        reference: "Článek 50",
        deadline: "aktivní podle použití",
        description: "Informování uživatelů, že komunikují s AI nebo AI výstupem.",
      },
    ],
    fines: [
      {
        violation: "Zakázané AI praktiky",
        maximum: "35 mil. EUR nebo 7 % obratu",
        enforcer: "Příslušný národní orgán",
      },
      {
        violation: "High-risk povinnosti",
        maximum: "15 mil. EUR nebo 3 % obratu",
        enforcer: "Příslušný národní orgán",
      },
      {
        violation: "Nepravdivé informace regulátorovi",
        maximum: "7,5 mil. EUR nebo 1 % obratu",
        enforcer: "Příslušný národní orgán",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:cpu-bolt-linear",
        title: "AI inventář",
        description: "Záznam všech používaných AI nástrojů, vlastníků a rizik.",
      },
      {
        icon: "solar:document-text-linear",
        title: "Politika AI",
        description: "Šablona interní politiky AI pro české firmy.",
      },
      {
        icon: "solar:users-group-rounded-linear",
        title: "AI gramotnost",
        description: "Evidence školení a potvrzení zaměstnanců.",
      },
    ],
    resources: ["EU AI Act přehled", "Politika AI", "Školení AI gramotnosti"],
  },
  {
    ...frameworkCards[2],
    law: "Zákon č. 110/2019 Sb.",
    hero:
      "GDPR se vztahuje na každou firmu, která zpracovává osobní údaje. Vyžaduje přehled zpracování, řízení práv subjektů, DPIA u rizikových operací a hlášení incidentů do 72 hodin.",
    appliesTo: [
      "Každé české IČO, které zpracovává osobní údaje zákazníků, zaměstnanců nebo dodavatelů.",
      "E-shopy, SaaS aplikace, agentury, zdravotnické služby a B2B firmy s CRM.",
      "Firmy používající analytiku, marketingové nástroje nebo externí zpracovatele.",
      "Organizace předávající data mimo EU nebo používající cloudové služby.",
    ],
    obligations: [
      {
        title: "ROPA",
        reference: "Článek 30",
        deadline: "aktivní",
        description: "Záznamy o činnostech zpracování pro hlavní datové procesy.",
      },
      {
        title: "DPIA",
        reference: "Článek 35",
        deadline: "před rizikovým zpracováním",
        description: "Posouzení vlivu u zpracování s vysokým rizikem.",
      },
      {
        title: "Hlášení porušení",
        reference: "Článek 33",
        deadline: "72 hodin",
        description: "Oznámení porušení zabezpečení osobních údajů ÚOOÚ.",
      },
      {
        title: "Zpracovatelské smlouvy",
        reference: "Článek 28",
        deadline: "aktivní",
        description: "Kontrola dodavatelů, kteří zpracovávají osobní údaje.",
      },
    ],
    fines: [
      {
        violation: "Závažné porušení zásad",
        maximum: "20 mil. EUR nebo 4 % obratu",
        enforcer: "ÚOOÚ",
      },
      {
        violation: "Procesní povinnosti",
        maximum: "10 mil. EUR nebo 2 % obratu",
        enforcer: "ÚOOÚ",
      },
      {
        violation: "Pozdní hlášení incidentu",
        maximum: "podle dopadu a prodlení",
        enforcer: "ÚOOÚ",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:folder-with-files-linear",
        title: "ROPA generátor",
        description: "Přehled zpracování podle systémů, týmů a dodavatelů.",
      },
      {
        icon: "solar:shield-user-linear",
        title: "DPIA workflow",
        description: "Kroky, schvalování a evidence rizikových zpracování.",
      },
      {
        icon: "solar:bell-linear",
        title: "72h incident log",
        description: "Časová osa incidentu a export pro ÚOOÚ.",
      },
    ],
    resources: ["GDPR audit checklist", "ROPA šablona", "DPIA šablona"],
  },
  {
    ...frameworkCards[3],
    law: "ISO/IEC 27001:2022",
    hero:
      "ISO 27001 je certifikační standard pro systém řízení bezpečnosti informací. Verze 2022 obsahuje 93 kontrol v Annex A a vyžaduje řízení rizik, dokumentaci a průběžné zlepšování.",
    appliesTo: [
      "SaaS a technologické firmy prodávající enterprise zákazníkům.",
      "Dodavatelé, kteří potřebují doložit informační bezpečnost v tendrech.",
      "České firmy připravující certifikaci přes Bureau Veritas, Lloyd's Register CZ nebo jiné certifikační orgány.",
      "Týmy, které chtějí sjednotit bezpečnostní procesy napříč IT, HR a provozem.",
    ],
    obligations: [
      {
        title: "Řízení rizik",
        reference: "Clause 6.1.2",
        deadline: "před certifikací",
        description: "Identifikace, hodnocení a plán ošetření bezpečnostních rizik.",
      },
      {
        title: "Statement of Applicability",
        reference: "Clause 6.1.3",
        deadline: "před auditem",
        description: "Výběr relevantních Annex A kontrol a zdůvodnění výjimek.",
      },
      {
        title: "Access control",
        reference: "Annex A 5.15",
        deadline: "průběžně",
        description: "Řízení přístupů, MFA a pravidelné access reviews.",
      },
      {
        title: "Evidence interního auditu",
        reference: "Clause 9.2",
        deadline: "ročně",
        description: "Plán, výsledky a nápravná opatření interního auditu.",
      },
    ],
    fines: [
      {
        violation: "Neúspěšný certifikační audit",
        maximum: "ztráta certifikace",
        enforcer: "certifikační orgán",
      },
      {
        violation: "Nedodržení zákaznického požadavku",
        maximum: "smluvní sankce",
        enforcer: "zákazník",
      },
      {
        violation: "Nedostatečné důkazy",
        maximum: "opakovaný audit",
        enforcer: "Bureau Veritas / Lloyd's Register CZ",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:document-check-linear",
        title: "SoA a politiky",
        description: "Generování dokumentů pro Annex A a řízení rizik.",
      },
      {
        icon: "solar:cloud-download-linear",
        title: "Evidence vault",
        description: "Automatické důkazy z Microsoft 365, GitHubu a AWS.",
      },
      {
        icon: "solar:users-group-rounded-linear",
        title: "Access reviews",
        description: "Pravidelný přehled účtů, rolí a odchylek.",
      },
    ],
    resources: ["ISO 27001 gap analýza", "Statement of Applicability", "Annex A checklist"],
  },
  {
    ...frameworkCards[4],
    law: "Směrnice (EU) 2022/2464",
    hero:
      "CSRD rozšiřuje ESG reporting a postupně dopadá i na dodavatele velkých korporací. Pro česká MSP je klíčové připravit data, odpovědnosti a auditovatelnou evidenci.",
    appliesTo: [
      "Velké firmy a subjekty veřejného zájmu podle evropských kritérií.",
      "Dodavatelé velkých korporací, kteří dostávají ESG dotazníky.",
      "Firmy připravující reporting emisí, pracovních podmínek a governance.",
      "Česká MSP, která chtějí udržet enterprise dodavatelské vztahy.",
    ],
    obligations: [
      {
        title: "Dvojí materialita",
        reference: "ESRS 1",
        deadline: "2026+",
        description: "Vyhodnocení dopadu firmy na okolí i dopadu ESG témat na firmu.",
      },
      {
        title: "Datová evidence",
        reference: "ESRS 2",
        deadline: "2026+",
        description: "Sběr auditovatelných údajů pro ESG reporting.",
      },
      {
        title: "Dodavatelský řetězec",
        reference: "ESRS G1",
        deadline: "2026+",
        description: "Evidence odpovědností a dotazníků od obchodních partnerů.",
      },
      {
        title: "Schvalování reportu",
        reference: "CSRD",
        deadline: "ročně",
        description: "Proces kontroly, odpovědnosti a exportu reportu.",
      },
    ],
    fines: [
      {
        violation: "Chybějící nebo nesprávný report",
        maximum: "podle národní úpravy",
        enforcer: "Příslušný národní orgán",
      },
      {
        violation: "Neauditovatelná data",
        maximum: "opakované ověření",
        enforcer: "auditor",
      },
      {
        violation: "Nesplnění smluvních ESG požadavků",
        maximum: "ztráta dodavatelského vztahu",
        enforcer: "odběratel",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:leaf-linear",
        title: "ESG inventář",
        description: "Evidence požadavků, vlastníků a datových zdrojů.",
      },
      {
        icon: "solar:documents-linear",
        title: "Dotazníky",
        description: "Odpovědi pro enterprise zákazníky z jednoho zdroje.",
      },
      {
        icon: "solar:calendar-check-linear",
        title: "Termíny",
        description: "Hlídání reportovacích cyklů a schválení.",
      },
    ],
    resources: ["CSRD readiness checklist", "ESG data inventory", "Dodavatelský dotazník"],
  },
  {
    ...frameworkCards[5],
    law: "Nařízení (EU) 2022/2554",
    hero:
      "DORA sjednocuje digitální provozní odolnost finančního sektoru. Vyžaduje řízení ICT rizik, testování odolnosti, incident reporting a dohled nad kritickými ICT dodavateli.",
    appliesTo: [
      "Banky, platební instituce, pojišťovny, investiční společnosti a fintech regulovaný ČNB.",
      "ICT dodavatelé poskytující kritické služby finančním institucím.",
      "České fintech startupy vstupující do regulovaných finančních služeb.",
      "Firmy s cloudovou infrastrukturou používanou pro finanční produkty.",
    ],
    obligations: [
      {
        title: "ICT risk management",
        reference: "Článek 6",
        deadline: "leden 2025",
        description: "Rámec řízení rizik pro systémy, data a cloud.",
      },
      {
        title: "Incident reporting",
        reference: "Článek 19",
        deadline: "aktivní",
        description: "Klasifikace a hlášení významných ICT incidentů.",
      },
      {
        title: "Testování odolnosti",
        reference: "Článek 24",
        deadline: "průběžně",
        description: "Pravidelné testy dostupnosti, obnovy a bezpečnosti.",
      },
      {
        title: "Third-party risk",
        reference: "Článek 28",
        deadline: "aktivní",
        description: "Evidence kritických ICT dodavatelů a smluvních požadavků.",
      },
    ],
    fines: [
      {
        violation: "Nedostatečný ICT risk framework",
        maximum: "podle národní úpravy",
        enforcer: "ČNB",
      },
      {
        violation: "Neohlášení incidentu",
        maximum: "podle dopadu",
        enforcer: "ČNB",
      },
      {
        violation: "Nedostatečný dohled nad dodavatelem",
        maximum: "opatření k nápravě / sankce",
        enforcer: "ČNB",
      },
    ],
    splnitHelps: [
      {
        icon: "solar:banknote-2-linear",
        title: "ICT risk evidence",
        description: "Rizika, systémy a dodavatelé propojení s kontrolami.",
      },
      {
        icon: "solar:shield-warning-linear",
        title: "Incident log",
        description: "Časová osa incidentu, klasifikace a export pro reporting.",
      },
      {
        icon: "solar:users-group-rounded-linear",
        title: "Vendor risk",
        description: "Přehled kritických dodavatelů a požadovaných důkazů.",
      },
    ],
    resources: ["DORA checklist", "ICT incident log", "Vendor risk template"],
  },
];

export const timeline = [
  {
    date: "Únor 2025",
    title: "Zákaz škodlivých AI praktik",
    icon: "solar:forbidden-circle-linear",
  },
  {
    date: "Říjen 2024",
    title: "NIS2 transponována do české legislativy",
    icon: "solar:shield-network-linear",
  },
  {
    date: "Srpen 2025",
    title: "Povinnost AI gramotnosti zaměstnanců",
    icon: "solar:users-group-rounded-linear",
  },
  {
    date: "Srpen 2026",
    title: "High-risk AI systémy musí být v souladu",
    icon: "solar:cpu-bolt-linear",
  },
  {
    date: "Srpen 2027",
    title: "Zbývající AI systémy v produktech",
    icon: "solar:box-linear",
  },
];

export function getFrameworkDetail(slug: string) {
  return frameworkDetails.find((framework) => framework.slug === slug);
}
