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
  riskSection?: {
    tag: string;
    title: string;
    violationHeader: string;
    maximumHeader: string;
    enforcerHeader: string;
  };
  splnitHelps: {
    icon: string;
    title: string;
    description: string;
  }[];
  relatedFrameworks?: {
    slug: string;
    name: string;
    reason: string;
  }[];
  relatedArticles?: {
    slug: string;
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
        description: "Zranitelnosti a upozornění NÚKIB se převádějí na konkrétní systémy, vlastníky a úkoly, místo aby zůstaly jako ruční monitoring mimo compliance proces.",
      },
      {
        icon: "solar:bolt-circle-linear",
        title: "21 opatření",
        description: "Povinná bezpečnostní opatření dostanou vlastní kontroly, stav a chybějící důkazy, takže vidíte, co je připravené a co je jen deklarace.",
      },
      {
        icon: "solar:document-check-linear",
        title: "Hlášení a důkazy",
        description: "Incidenty, přístupy a dodavatelská rizika se ukládají s časovou osou a podklady pro pozdější kontrolu nebo zákaznický dotazník.",
      },
    ],
    relatedArticles: [
      {
        slug: "nis2-pruvodce-pro-msp",
        title: "NIS2 pro české MSP: praktický průvodce",
        description: "Kdy se NIS2 týká české firmy a jak začít s auditovatelnými kontrolami.",
      },
    ],
    relatedFrameworks: [
      {
        slug: "gdpr",
        name: "GDPR",
        reason: "incidenty, dodavatelé a přístupová práva často zahrnují osobní údaje",
      },
      {
        slug: "iso-27001",
        name: "ISO 27001",
        reason: "MFA, incident response, access reviews a vendor management se překrývají s Annex A kontrolami",
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
        description: "Každý AI nástroj dostane vlastníka, účel použití, typ vstupních dat a riziko, aby nové AI použití nebylo schované v týmech nebo SaaS účtech.",
      },
      {
        icon: "solar:document-text-linear",
        title: "Politika AI",
        description: "Z pravidel pro povolené a zakázané použití AI vznikne interní politika navázaná na školení, schvalování a opakovanou revizi.",
      },
      {
        icon: "solar:users-group-rounded-linear",
        title: "AI gramotnost",
        description: "U školení ukládáte účast, verzi materiálů a potvrzení zaměstnanců, takže AI gramotnost není jen odkaz na prezentaci.",
      },
    ],
    relatedArticles: [
      {
        slug: "eu-ai-act-pruvodce-pro-msp",
        title: "EU AI Act pro MSP: co připravit v roce 2026",
        description: "Praktický přehled inventáře AI, AI gramotnosti a interní politiky.",
      },
    ],
    relatedFrameworks: [
      {
        slug: "gdpr",
        name: "GDPR",
        reason: "AI inventář musí rozlišit, kdy nástroje zpracovávají osobní údaje",
      },
      {
        slug: "iso-27001",
        name: "ISO 27001",
        reason: "řízení přístupů, změn a dodavatelů AI nástrojů spadá i do bezpečnostního řízení",
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
        description: "Namísto ručního mapování generujete ROPA ze systémů, týmů a dodavatelů a vidíte, co se musí přepsat při změně nástroje nebo zpracovatele.",
      },
      {
        icon: "solar:shield-user-linear",
        title: "DPIA workflow",
        description: "Rizikové zpracování vede tým přes otázky, schválení, mitigace a termín další revize, ne přes jednorázový dokument v cloudu.",
      },
      {
        icon: "solar:bell-linear",
        title: "72h incident log",
        description: "Od prvního zjištění běží časová osa rozhodnutí, dopadu a oznámení, aby šlo zpětně doložit, proč se incident hlásil nebo nehlásil.",
      },
    ],
    relatedArticles: [
      {
        slug: "gdpr-checklist-pro-audit",
        title: "GDPR checklist pro auditovatelnou firmu",
        description: "Checklist pro ROPA, zpracovatele, práva subjektů a 72hodinové hlášení.",
      },
    ],
    relatedFrameworks: [
      {
        slug: "nis2",
        name: "NIS2",
        reason: "incident response, přístupy, dodavatelé a bezpečnostní opatření se řeší v obou režimech",
      },
      {
        slug: "eu-ai-act",
        name: "EU AI Act",
        reason: "AI nástroje často pracují s osobními údaji a potřebují jasný účel, vlastníka a kontrolu",
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
    riskSection: {
      tag: "Obchodní riziko a důsledky",
      title: "ISO 27001 obvykle neznamená správní pokutu, ale může rozhodnout o certifikaci, tendru nebo smlouvě.",
      violationHeader: "Riziko",
      maximumHeader: "Dopad",
      enforcerHeader: "Kdo ho uplatní",
    },
    splnitHelps: [
      {
        icon: "solar:document-check-linear",
        title: "SoA a politiky",
        description: "Statement of Applicability navazuje na reálný rozsah, rizika a důvody výjimek, takže není oddělený od důkazů v systému.",
      },
      {
        icon: "solar:cloud-download-linear",
        title: "Evidence vault",
        description: "Důkazy z Microsoft 365, GitHubu a AWS se ukládají ke konkrétním kontrolám a ukazují, co má před auditem ještě chybějící vlastník.",
      },
      {
        icon: "solar:users-group-rounded-linear",
        title: "Access reviews",
        description: "Pravidelné revize účtů a rolí mají termín, schvalovatele a výjimky, aby auditor neviděl jen export uživatelů bez rozhodnutí.",
      },
    ],
    relatedArticles: [
      {
        slug: "iso-27001-priprava-na-tendr",
        title: "ISO 27001 pro SaaS firmy: příprava na enterprise tendr",
        description: "Co mít připravené, když zákazník požaduje SoA, access reviews a důkazy.",
      },
    ],
    relatedFrameworks: [
      {
        slug: "nis2",
        name: "NIS2",
        reason: "bezpečnostní opatření, řízení rizik a evidence kontrol mají velký překryv",
      },
      {
        slug: "gdpr",
        name: "GDPR",
        reason: "přístupová práva, šifrování, incidenty a dodavatelé chrání i osobní údaje",
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
        deadline: "Q1 2026 pro velké subjekty",
        description: "Vyhodnocení dopadu firmy na okolí i dopadu ESG témat na firmu.",
      },
      {
        title: "Datová evidence",
        reference: "ESRS 2",
        deadline: "Q1–Q2 2026 podle reportovacího cyklu",
        description: "Sběr auditovatelných údajů pro ESG reporting.",
      },
      {
        title: "Dodavatelský řetězec",
        reference: "ESRS G1",
        deadline: "2026 při zákaznickém požadavku",
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
        description: "Požadavky zákazníků, vlastníci a datové zdroje se evidují po tématech ESRS, aby bylo jasné, kdo dodá čísla a odkud pocházejí.",
      },
      {
        icon: "solar:documents-linear",
        title: "Dotazníky",
        description: "Opakované ESG dotazníky vyplňujete z ověřených odpovědí a důkazů, místo aby každý obchodník hledal poslední verzi v e-mailu.",
      },
      {
        icon: "solar:calendar-check-linear",
        title: "Termíny",
        description: "Termíny sběru dat, kontroly a schválení drží vlastníky v jednom workflow, takže reporting není až poslední týden před odevzdáním.",
      },
    ],
    relatedFrameworks: [
      {
        slug: "iso-27001",
        name: "ISO 27001",
        reason: "enterprise tendry často kombinují bezpečnostní a ESG požadavky na dodavatele",
      },
      {
        slug: "gdpr",
        name: "GDPR",
        reason: "HR a dodavatelská ESG data mohou obsahovat osobní údaje a vyžadovat řízené zpracování",
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
