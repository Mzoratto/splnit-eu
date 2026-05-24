import type { Locale } from "@/i18n/routing";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  readTime: string;
  author?: string;
  authorRole?: string;
  regulationHref?: string;
  ctaTitle?: string;
  ctaBody?: string;
  ctaButton?: string;
  ctaHref?: string;
  summary: string;
  sections: {
    heading: string;
    body: string[];
    bullets?: string[];
    codeBlock?: string;
    subsections?: {
      heading: string;
      body: string[];
      bullets?: string[];
      codeBlock?: string;
    }[];
    table?: {
      headers: string[];
      rows: string[][];
    };
  }[];
};

export type BlogPageCopy = {
  allArticles: string;
  articleAuthorFallback: string;
  articleCtaBody: string;
  articleCtaButton: string;
  articleCtaTitle: string;
  articleNavTitle: string;
  relatedRegulationTitle: string;
  relatedRegulationOpen: string;
  description: string;
  jsonLdDescription: string;
  locale: string;
  readArticle: string;
  tag: string;
  title: string;
  metadataTitle: string;
};

export const blogPageCopy: Record<Locale, BlogPageCopy> = {
  "cs-CZ": {
    allArticles: "← Všechny články",
    articleAuthorFallback: "Autor: Marco Zoratto, zakladatel Splnit.eu",
    articleCtaBody:
      "Splnit.eu mapuje povinnosti na kontroly, důkazy a termíny, aby šly průběžně ověřovat.",
    articleCtaButton: "Zobrazit platformu",
    articleCtaTitle: "Převést článek na kontrolní seznam",
    articleNavTitle: "V článku",
    relatedRegulationTitle: "Související přehled předpisu",
    relatedRegulationOpen: "Otevřít přehled",
    description:
      "Praktické návody pro české firmy, které potřebují proměnit NIS2, EU AI Act a GDPR na kontroly, důkazy a odpovědnosti.",
    jsonLdDescription:
      "Praktické návody Splnit.eu k NIS2, EU AI Act, GDPR a ISO 27001 pro české firmy.",
    locale: "cs_CZ",
    metadataTitle: "Blog | Splnit.eu — NIS2, EU AI Act a GDPR pro české firmy",
    readArticle: "Číst článek",
    tag: "Compliance průvodce",
    title: "Návody pro EU compliance bez právního šumu.",
  },
  "en-EU": {
    allArticles: "← All articles",
    articleAuthorFallback: "Author: Marco Zoratto, founder of Splnit.eu",
    articleCtaBody:
      "Splnit.eu maps obligations to controls, evidence, and deadlines so they can be checked continuously.",
    articleCtaButton: "View platform",
    articleCtaTitle: "Turn this article into a control checklist",
    articleNavTitle: "In this article",
    relatedRegulationTitle: "Related regulation overview",
    relatedRegulationOpen: "Open overview",
    description:
      "Practical articles for EU SMBs that need to turn NIS2, the EU AI Act, and GDPR into controls, evidence, and responsibilities.",
    jsonLdDescription:
      "Practical Splnit.eu guides to NIS2, the EU AI Act, GDPR, and ISO 27001 for EU SMBs.",
    locale: "en_EU",
    metadataTitle: "Blog | Splnit.eu — NIS2, EU AI Act, and GDPR for EU SMBs",
    readArticle: "Read article",
    tag: "Compliance guides",
    title: "EU compliance guides without legal noise.",
  },
  "it-IT": {
    allArticles: "← Tutti gli articoli",
    articleAuthorFallback: "Autore: Marco Zoratto, fondatore di Splnit.eu",
    articleCtaBody:
      "Splnit.eu mappa obblighi, controlli, evidenze e scadenze così possono essere verificati nel tempo.",
    articleCtaButton: "Visualizza la piattaforma",
    articleCtaTitle: "Trasforma l'articolo in checklist controlli",
    articleNavTitle: "In questo articolo",
    relatedRegulationTitle: "Panoramica normativa correlata",
    relatedRegulationOpen: "Apri panoramica",
    description:
      "Articoli pratici per le PMI europee che devono trasformare NIS2, AI Act e GDPR in controlli, prove di conformità e responsabilità.",
    jsonLdDescription:
      "Guide pratiche Splnit.eu su NIS2, EU AI Act, GDPR e ISO 27001 per PMI europee.",
    locale: "it_IT",
    metadataTitle: "Blog | Splnit.eu — NIS2, EU AI Act e GDPR per PMI europee",
    readArticle: "Leggi l'articolo",
    tag: "Guide compliance",
    title: "Guide alla compliance UE chiare e concrete.",
  },
};

const czechNukibRegistrationPosts: BlogPost[] = [
  {
    slug: "co-splnit-do-12-mesicu-od-registrace-nukib",
    title: "Co musíte splnit do 12 měsíců od registrace u NÚKIB",
    description:
      "Praktický plán pro firmu, která dostala rozhodnutí o registraci regulované služby od NÚKIB a spadá do režimu nižších povinností.",
    category: "ZoKB",
    publishedAt: "2026-05-22",
    readTime: "8 min",
    author: "Marco Zoratto",
    authorRole: "zakladatel Splnit.eu",
    regulationHref: "/predpisy/nis2",
    ctaTitle: "Převést registraci NÚKIB na kontrolní plán",
    ctaBody:
      "Splnit.eu pomůže převést požadavky vyhlášky č. 410/2025 Sb. na opatření, vlastníky, důkazy a exportovatelný přehled pro režim nižších povinností.",
    ctaButton: "Spustit analýzu zdarma",
    ctaHref: "/sign-up?ref=blog",
    summary:
      "Po doručení rozhodnutí o registraci regulované služby běží lhůta pro zavedení bezpečnostních opatření. Začněte pěti neopominutelnými opatřeními a průběžně dokumentujte stav v přehledu bezpečnostních opatření.",
    sections: [
      {
        heading: "Kdo patří do režimu nižších povinností",
        body: [
          "Vyhláška č. 410/2025 Sb. se vztahuje na poskytovatele regulovaných služeb v režimu nižších povinností. Typicky jde o střední podnik v regulovaném odvětví, menší firmu poskytující důležitější regulovanou službu nebo subjekt, který NÚKIB zaregistroval jako poskytovatele regulované služby.",
          "Pokud jste obdrželi rozhodnutí o registraci, nečekejte na další výzvu. Prakticky to znamená začít zavádět a dokumentovat opatření v rozsahu regulované služby. Tento článek je praktický návod, nikoli právní stanovisko.",
        ],
      },
      {
        heading: "Co musíte zavést",
        body: [
          "Vyhláška v § 3 pracuje s přehledem bezpečnostních opatření: dokumentem, který ukazuje, která opatření jsou zavedena, která budou zavedena a která nebyla zavedena včetně zdůvodnění. Přehled musíte aktualizovat alespoň jednou ročně a jednotlivé verze uchovávat alespoň 4 roky.",
          "V režimu nižších povinností nejde o formální certifikaci. Jde o schopnost ukázat, že máte minimální kybernetickou bezpečnost řízenou, doloženou a průběžně aktualizovanou.",
        ],
        bullets: [
          "Vést přehled v listinné nebo elektronické podobě.",
          "U každého opatření uvést stav, popis nebo odůvodnění a odpovědnou osobu.",
          "Aktualizovat přehled alespoň jednou ročně.",
          "Uchovávat verze přehledu alespoň 4 roky.",
        ],
      },
      {
        heading: "Neopominutelná opatření",
        body: [
          "Pět oblastí musíte řešit vždy. Neznamená to, že první verze musí být perfektní, ale nesmí zůstat prázdná bez vlastníka, termínu a důkazu.",
        ],
        subsections: [
          {
            heading: "1. Systém zajišťování minimální kybernetické bezpečnosti (§ 3)",
            body: [
              "Musíte vytvořit bezpečnostní politiku a vést přehled bezpečnostních opatření. Nemusí jít o rozsáhlý dokument. Důležité je, aby popisoval skutečný stav, pravidla a odpovědnosti ve vaší firmě.",
              "Prakticky: vytvořte dokument nebo tabulku s výčtem opatření, stavem, vlastníkem a důkazem. Uveďte datum poslední aktualizace.",
            ],
          },
          {
            heading: "2. Pověřená osoba kybernetické bezpečnosti (§ 4)",
            body: [
              "Vrcholné vedení musí určit konkrétní osobu pověřenou kybernetickou bezpečností a dát jí pravomoci pro řízení a rozvoj kybernetické bezpečnosti, dohled nad stavem a komunikaci s vedením.",
              "Prakticky: vydejte interní jmenovací dokument nebo zápis z porady vedení. Zaznamenejte jméno, datum jmenování a absolvované školení.",
            ],
          },
          {
            heading: "3. Školení zaměstnanců (§ 5)",
            body: [
              "Musíte stanovit pravidla bezpečného chování a zajistit vstupní i pravidelná školení. Vyhláška zároveň požaduje vedení přehledů o provedených školeních a seznamů školených osob.",
              "Prakticky: vytvořte jednoduchou politiku bezpečného chování a evidujte, kdo školení absolvoval, kdy a podle jaké verze školení.",
            ],
          },
          {
            heading: "4. Zálohy a kontinuita (§ 6)",
            body: [
              "Musíte mít plán kontinuity a pravidla pro obnovu regulované služby. Pro běžnou firmu to znamená vědět, co se zálohuje, jak často, kde jsou zálohy a kdo obnovu provádí.",
              "Prakticky: zdokumentujte zálohovací proces pro klíčové systémy, například účetnictví, e-mail, cloudové servery a sdílené soubory.",
            ],
          },
          {
            heading: "5. Řešení kybernetických incidentů (§ 10)",
            body: [
              "Musíte mít postup pro hlášení a řešení kybernetických bezpečnostních incidentů. Od 1. listopadu 2025 NÚKIB uvádí, že incidenty se hlásí přes formulář na Portálu NÚKIB v sekci Chci vyřídit.",
              "Prakticky: sepište, kdo incident přijímá, kdo rozhoduje, kde se vede časová osa a kdy se kontaktuje NÚKIB, zákazník nebo dodavatel.",
            ],
          },
        ],
      },
      {
        heading: "Vyhodnotitelná opatření",
        body: [
          "Kromě pěti neopominutelných opatření musíte posoudit relevanci dalších oblastí. Pokud některé opatření nezavedete, nestačí ho přeskočit. Do přehledu napište důvod, proč pro danou regulovanou službu není relevantní nebo proč je řešeno jinak.",
        ],
        bullets: [
          "§ 7 Řízení přístupu: správa účtů a deaktivace odcházejících zaměstnanců.",
          "§ 8 Řízení identit: MFA, politika hesel a oprávnění.",
          "§ 9 Detekce událostí: antivirus, firewall, logování a záznamy.",
          "§ 11 Bezpečnost sítě: segmentace, perimetr a bezpečnost komunikace.",
          "§ 12 Aplikační bezpečnost: aktualizace softwaru, zranitelnosti a bezpečný vývoj.",
          "§ 13 Kryptografie: šifrování komunikace a aktuální kryptografické algoritmy.",
        ],
      },
      {
        heading: "Doporučené pořadí kroků",
        body: [
          "Neřešte vše najednou. Praktické pořadí je začít odpovědností a dokumentací, potom technickými opatřeními a nakonec interní kontrolou připravenosti.",
        ],
        subsections: [
          {
            heading: "Měsíc 1 až 2",
            body: [
              "Jmenujte pověřenou osobu, zaevidujte ji do přehledu bezpečnostních opatření a zajistěte vstupní školení.",
            ],
          },
          {
            heading: "Měsíc 2 až 4",
            body: [
              "Vytvořte první verzi přehledu bezpečnostních opatření, zdokumentujte zálohovací proces a připravte základní bezpečnostní politiku.",
            ],
          },
          {
            heading: "Měsíc 4 až 8",
            body: [
              "Nastavte školení zaměstnanců, vytvořte incidentní postup a posuďte vyhodnotitelná opatření.",
            ],
          },
          {
            heading: "Měsíc 8 až 12",
            body: [
              "Přezkoumejte přehled, zkontrolujte důkazy a ověřte, že každé opatření má stav, vlastníka a další krok.",
            ],
          },
        ],
      },
      {
        heading: "Časté chyby",
        body: [
          "Nejčastější problém není technická složitost, ale prázdná nebo nedoložená evidence. Vyhláška očekává, že stav opatření bude konkrétní a dohledatelný.",
        ],
        bullets: [
          "Čekání na poslední chvíli. Dvanáct měsíců rychle uteče, když potřebujete školení, dokumentaci a důkazy z více systémů.",
          "Záměna přehledu opatření za bezpečnostní audit. Přehled má být živý stav opatření, ne jednorázová složka pro kontrolu.",
          "Ignorování vyhodnotitelných opatření. I nezavedené opatření potřebuje zdůvodnění.",
          "Nezaznamenání školení. Nestačí školení provést, musíte ho také evidovat.",
        ],
      },
      {
        heading: "Jak pomůže Splnit.eu",
        body: [
          "Splnit.eu je česká compliance platforma pro firmy v režimu nižších povinností ZoKB. Po vstupním dotazníku pomáhá identifikovat mezery vůči vyhlášce č. 410/2025 Sb., přiřadit vlastníky a vést důkazy k opatřením.",
          "Platforma podporuje pracovní prostory pro systémy jako Pohoda, Hetzner Cloud a Microsoft 365 a umí připravit export přehledu bezpečnostních opatření dle § 3 odst. 2 vyhlášky č. 410/2025 Sb.",
        ],
      },
      {
        heading: "Zdroje a poznámka",
        body: [
          "Právní základ: zákon č. 264/2025 Sb. o kybernetické bezpečnosti, vyhláška č. 410/2025 Sb. a podpůrné materiály NÚKIB pro režim nižších povinností.",
          "Odkazy: https://www.zakonyprolidi.cz/cs/2025-410, https://nukib.gov.cz/cs/kyberneticka-bezpecnost/regulace-a-kontrola/podpurne-materialy/ a Portál NÚKIB.",
          "Tento článek je praktický informační materiál. Nenahrazuje právní posouzení konkrétní regulované služby.",
        ],
      },
    ],
  },
  {
    slug: "prehled-bezpecnostnich-opatreni-410-2025",
    title:
      "Jak vytvořit přehled bezpečnostních opatření dle § 3 odst. 2 vyhl. č. 410/2025 Sb.",
    description:
      "Co musí obsahovat přehled bezpečnostních opatření, jak rozlišit zavedená, plánovaná a nezavedená opatření a jak ho udržovat aktuální.",
    category: "ZoKB",
    publishedAt: "2026-05-22",
    readTime: "9 min",
    author: "Marco Zoratto",
    authorRole: "zakladatel Splnit.eu",
    regulationHref: "/predpisy/nis2",
    ctaTitle: "Vygenerujte přehled bezpečnostních opatření",
    ctaBody:
      "Splnit.eu převádí odpovědi, pracovní prostory a důkazy do exportu přehledu bezpečnostních opatření pro režim nižších povinností.",
    ctaButton: "Vygenerovat přehled zdarma",
    ctaHref: "/sign-up?ref=blog",
    summary:
      "Přehled bezpečnostních opatření je živý dokument podle § 3 odst. 2 vyhlášky č. 410/2025 Sb. Musí ukazovat zavedená, plánovaná i nezavedená opatření a být pravidelně aktualizovaný.",
    sections: [
      {
        heading: "Co je přehled bezpečnostních opatření",
        body: [
          "Přehled bezpečnostních opatření je dokument, který zachycuje stav zavádění bezpečnostních opatření podle vyhlášky č. 410/2025 Sb. Není to jednorázový projekt. Musíte ho udržovat aktuální a jednotlivé verze uchovávat alespoň 4 roky.",
          "NÚKIB ve svých podpůrných materiálech zdůrazňuje, že dokumentace má být přizpůsobena konkrétní organizaci. Mechanické přepsání požadavků vyhlášky bez vazby na praxi firmy nestačí.",
        ],
      },
      {
        heading: "Co musí přehled obsahovat",
        body: [
          "Vyhláška v § 3 odst. 2 stanoví tři skupiny informací: opatření zavedená, opatření plánovaná a opatření nezavedená. U každé skupiny je potřeba uvést konkrétní stav, nikoli jen obecné prohlášení.",
        ],
        subsections: [
          {
            heading: "Část 1: zavedená bezpečnostní opatření",
            body: [
              "Pro každé zavedené opatření uveďte název, odkaz na vyhlášku, popis zavedení a osobu odpovědnou za udržování.",
              "Příklad: § 4 — Pověřená osoba kybernetické bezpečnosti. Jan Novák, IT manažer, jmenován rozhodnutím jednatele dne 15. 2. 2026. Školení NÚKIB absolvoval dne 20. 2. 2026. Pravomoci jsou uvedeny v bezpečnostní politice.",
            ],
          },
          {
            heading: "Část 2: plánovaná bezpečnostní opatření",
            body: [
              "Pro opatření, která ještě nejsou zavedena, ale plánujete je zavést, uveďte termín zavedení, prioritu a odpovědnou osobu.",
              "Příklad: § 10 — Řešení kybernetických bezpečnostních incidentů. Termín zavedení 30. 6. 2026, priorita vysoká, odpovědný Jan Novák. Připravuje se interní směrnice pro hlášení incidentů.",
            ],
          },
          {
            heading: "Část 3: nezavedená bezpečnostní opatření",
            body: [
              "Tato část se týká vyhodnotitelných opatření, která jste se rozhodli nezavést. Uveďte zdůvodnění a vazbu na rozsah regulované služby.",
              "Pozor: neopominutelná opatření jako § 3, § 4, § 5, § 6 a § 10 nelze jednoduše označit za nerelevantní. U nich potřebujete způsob zavedení nebo plán nápravy.",
            ],
          },
        ],
      },
      {
        heading: "Neopominutelná vs. vyhodnotitelná opatření",
        body: [
          "Toto rozlišení rozhoduje, jak s opatřením v přehledu pracovat. Neopominutelná opatření řešíte vždy. U vyhodnotitelných opatření posuzujete relevanci a zdůvodňujete případné nezavedení.",
        ],
        table: {
          headers: ["Opatření", "Typ", "Může být vynecháno?"],
          rows: [
            ["§ 3 Systém zajišťování minimální KB", "Neopominutelné", "Ne"],
            ["§ 4 Požadavky na vrcholné vedení", "Neopominutelné", "Ne"],
            ["§ 5 Bezpečnost lidských zdrojů", "Neopominutelné", "Ne"],
            ["§ 6 Řízení kontinuity", "Neopominutelné", "Ne"],
            ["§ 10 Řešení incidentů", "Neopominutelné", "Ne"],
            ["§ 7 Řízení přístupu", "Vyhodnotitelné", "Ano, se zdůvodněním"],
            ["§ 8 Řízení identit", "Vyhodnotitelné", "Ano, se zdůvodněním"],
            ["§ 9 Detekce událostí", "Vyhodnotitelné", "Ano, se zdůvodněním"],
            ["§ 11 Bezpečnost sítě", "Vyhodnotitelné", "Ano, se zdůvodněním"],
            ["§ 12 Aplikační bezpečnost", "Vyhodnotitelné", "Ano, se zdůvodněním"],
            ["§ 13 Kryptografie", "Vyhodnotitelné", "Ano, se zdůvodněním"],
          ],
        },
      },
      {
        heading: "Jak přehled formátovat",
        body: [
          "Zákon nestanovuje jediný povinný formát. Přehled může být tabulka, dokument, PDF export nebo interní wiki, pokud je přehledný, identifikovatelný a dohledatelný.",
          "Doporučené sloupce: číslo a název opatření, typ opatření, stav, popis zavedení nebo zdůvodnění nezavedení, datum zavedení nebo plánovaný termín, priorita a odpovědná osoba.",
        ],
      },
      {
        heading: "Jak přehled udržovat aktuální",
        body: [
          "Vyhláška vyžaduje aktualizaci alespoň jednou ročně. V praxi je bezpečnější aktualizovat přehled pokaždé, když zavedete nové opatření, změníte technickou infrastrukturu, nastane incident nebo NÚKIB vydá relevantní podpůrný materiál.",
          "Nastavte si roční přezkum přehledu a průběžně ukládejte verze. Vrcholné vedení by mělo být se stavem plnění bezpečnostních opatření prokazatelně seznámeno.",
        ],
      },
      {
        heading: "Zjednodušená ukázka struktury",
        body: [
          "Níže je zkrácená ukázka pro malou výrobní firmu. V reálném přehledu by každý řádek měl mít vazbu na konkrétní důkaz nebo zdroj informace.",
        ],
        codeBlock: `Organizace: Kovárna Novák s.r.o.
Verze: 1.2
Datum aktualizace: 22. 5. 2026
Odpovědný: Jan Novák, pověřená osoba KB

§ 3 — Systém zajišťování minimální KB
Stav: ZAVEDENO
Popis: Přehled bezpečnostních opatření veden v elektronické podobě.
Bezpečnostní politika schválena jednatelem dne 1. 3. 2026.
Odpovědný: Jan Novák

§ 4 — Pověřená osoba KB
Stav: ZAVEDENO
Popis: Jan Novák, jmenován dne 15. 2. 2026.
Školení NÚKIB absolvováno 20. 2. 2026.
Odpovědný: Jednatel

§ 8 — Řízení identit (MFA)
Stav: PLÁNOVÁNO
Termín: 30. 9. 2026
Priorita: Vysoká
Popis: MFA bude aktivováno pro všechny účty Microsoft 365.
Odpovědný: Jan Novák`,
      },
      {
        heading: "Nejčastější chyby",
        body: [
          "Přehled je užitečný jen tehdy, když je konkrétní. Prázdné řádky, obecné popisy a chybějící termíny z něj dělají dokument, který při kontrole nepomůže.",
        ],
        bullets: [
          "Prázdné řádky bez stavu a odůvodnění.",
          "Příliš obecné popisy typu MFA je zavedeno bez rozsahu a data.",
          "Nezaznamenané změny po zavedení nového opatření.",
          "Plánovaná opatření bez termínu, priority a odpovědné osoby.",
        ],
      },
      {
        heading: "Jak pomůže Splnit.eu",
        body: [
          "Splnit.eu generuje přehled bezpečnostních opatření dle § 3 odst. 2 vyhlášky č. 410/2025 Sb. z odpovědí, pracovních prostorů a doložených důkazů.",
          "Automaticky ověřená opatření se zobrazují s datem ověření, manuálně deklarovaná opatření s popisem a nezavedená opatření s gapem nebo zdůvodněním. Výsledný export je připravený jako pracovní podklad pro interní kontrolu nebo komunikaci s poradcem.",
        ],
      },
      {
        heading: "Zdroje a poznámka",
        body: [
          "Právní základ: § 3 odst. 2 vyhlášky č. 410/2025 Sb., příloha č. 1 k vyhlášce a podpůrné materiály NÚKIB k bezpečnostní politice a dokumentaci.",
          "Odkazy: https://www.zakonyprolidi.cz/cs/2025-410 a https://portal.nukib.gov.cz/storage/uploads/2026/03/31/rizeni-bezpecnostni-politiky-a-dokumentace-nizsi-rezim-v1_uid_69cbba7cdd71e.pdf.",
          "Tento článek je praktický informační materiál. Nenahrazuje právní posouzení konkrétní regulované služby.",
        ],
      },
    ],
  },
  {
    slug: "poverena-osoba-kyberneticke-bezpecnosti-zokb",
    title: "Kdo musí být pověřená osoba kybernetické bezpečnosti podle ZoKB?",
    description:
      "Koho může vedení jmenovat jako osobu pověřenou kybernetickou bezpečností, jaké znalosti musí mít a co doložit v přehledu opatření.",
    category: "ZoKB",
    publishedAt: "2026-05-22",
    readTime: "7 min",
    author: "Marco Zoratto",
    authorRole: "zakladatel Splnit.eu",
    regulationHref: "/predpisy/nis2",
    ctaTitle: "Zaevidujte pověřenou osobu do přehledu opatření",
    ctaBody:
      "Splnit.eu vás provede jmenováním, školením, pravomocemi a exportem evidence pověřené osoby do přehledu bezpečnostních opatření.",
    ctaButton: "Spustit analýzu zdarma",
    ctaHref: "/sign-up?ref=blog",
    summary:
      "Jmenování osoby pověřené kybernetickou bezpečností je neopominutelné opatření podle § 4 vyhlášky č. 410/2025 Sb. Nemusí jít o certifikovaného experta, ale musí mít pravomoci, odborné školení nebo znalost a pravidelnou vazbu na vedení.",
    sections: [
      {
        heading: "Co říká vyhláška",
        body: [
          "Vyhláška č. 410/2025 Sb. v § 4 ukládá vrcholnému vedení určit osobu pověřenou kybernetickou bezpečností. Této osobě má vedení svěřit pravomoci potřebné k řízení a rozvoji kybernetické bezpečnosti, dohledu nad stavem a komunikaci s vrcholným vedením.",
          "Vyhláška zároveň počítá s tím, že tato osoba bez zbytečného odkladu absolvuje odborné školení podle § 5 odst. 2 písm. d), nebo prokáže odbornou znalost v kybernetické bezpečnosti.",
        ],
      },
      {
        heading: "Kdo může roli zastávat",
        body: [
          "Pro malé a střední firmy je důležité, že role nemusí automaticky znamenat nového plnoúvazkového bezpečnostního specialistu. Klíčové jsou reálné pravomoci, zapojení do procesů a schopnost komunikovat s vedením.",
        ],
        subsections: [
          {
            heading: "Interní zaměstnanec IT",
            body: [
              "Nejčastější řešení. IT technik nebo IT manažer zná firemní infrastrukturu a přirozeně řeší přístupy, zálohy, aktualizace a incidenty.",
              "Nemusí být seniorní bezpečnostní expert, ale měl by absolvovat školení a mít podporu vedení pro prosazování opatření.",
            ],
          },
          {
            heading: "Jiný zaměstnanec s technickým přehledem",
            body: [
              "Pokud nemáte interní IT, může roli zastat například provozní manažer, office manager nebo jednatel. Důležité je, aby měl přehled o systémech a dostatečnou autoritu.",
            ],
          },
          {
            heading: "Externí dodavatel",
            body: [
              "Roli lze prakticky podpořit externím IT dodavatelem nebo bezpečnostním konzultantem. U externího řešení si pohlídejte smluvní pravomoci, pravidelný reporting vedení a znalost vaší infrastruktury.",
              "I při outsourcingu by firma měla mít interního vlastníka, který rozumí dopadu opatření na provoz.",
            ],
          },
        ],
      },
      {
        heading: "Jaké znalosti musí mít",
        body: [
          "Vyhláška nevyjmenovává konkrétní certifikace. Pracuje s odborným školením nebo prokázáním odborné znalosti v kybernetické bezpečnosti.",
        ],
        bullets: [
          "Absolvování odborného školení v kybernetické bezpečnosti, například přes dostupné vzdělávací materiály NÚKIB.",
          "Doložitelná praxe v IT nebo bezpečnosti, případně relevantní certifikace.",
          "Interní školení, pokud je konkrétní, evidované a odpovídá roli pověřené osoby.",
        ],
      },
      {
        heading: "Co musíte zdokumentovat",
        body: [
          "Pro přehled bezpečnostních opatření a případnou kontrolu potřebujete doložit, že role nebyla jen formální. Záznam by měl ukazovat jmenování, pravomoci, školení a vazbu na vedení.",
        ],
        bullets: [
          "Jmenovací dokument: rozhodnutí jednatele, zápis z porady nebo samostatná listina.",
          "Datum jmenování a identifikace osoby.",
          "Doklad nebo záznam o školení či jiné odborné znalosti.",
          "Popis pravomocí v jmenovacím dokumentu nebo bezpečnostní politice.",
          "Způsob pravidelné komunikace s vrcholným vedením.",
        ],
      },
      {
        heading: "Jaké povinnosti má pověřená osoba",
        body: [
          "Po jmenování by pověřená osoba měla průběžně sledovat stav kybernetické bezpečnosti, koordinovat zavádění bezpečnostních opatření, udržovat přehled opatření a komunikovat s vedením.",
          "V praxi nejde o to, aby sama provedla všechny technické úkoly. Má zajistit, že úkoly mají vlastníky, důkazy, termíny a že vedení ví, kde jsou otevřené mezery.",
        ],
      },
      {
        heading: "Praktický postup jmenování",
        body: [
          "Jmenování zvládnete v pěti krocích. Důležité je nezůstat u formálního podpisu, ale navázat roli na školení, pravomoci a přehled bezpečnostních opatření.",
        ],
        bullets: [
          "Vyberte kandidáta s technickým přehledem a schopností komunikovat s vedením.",
          "Vydejte jmenovací dokument podepsaný jednatelem nebo vedením.",
          "Zajistěte vstupní odborné školení nebo doložení odborné znalosti.",
          "Zaevidujte jméno, datum, školení a pravomoci do přehledu bezpečnostních opatření.",
          "Nastavte čtvrtletní nebo alespoň pravidelný reporting stavu kybernetické bezpečnosti vedení.",
        ],
      },
      {
        heading: "Typické otázky",
        body: [
          "Může být pověřenou osobou jednatel? Ano, pokud reálně vykonává roli, absolvuje školení nebo prokáže znalost a má agendu kybernetické bezpečnosti pod kontrolou.",
          "Co když nemáme žádného IT zaměstnance? Vyberte osobu s největším technickým přehledem a zajistěte jí školení a podporu externího IT dodavatele.",
          "Musí být pověřená osoba plně uvolněna pro tuto roli? U menších firem v režimu nižších povinností může být role součástí stávající pracovní náplně, pokud má osoba dostatek času a pravomocí.",
          "Co hrozí, když ji nejmenujeme? Jde o neopominutelné bezpečnostní opatření. Při kontrole by absence jmenování znamenala nedoložené plnění § 4 vyhlášky.",
        ],
      },
      {
        heading: "Jak pomůže Splnit.eu",
        body: [
          "Splnit.eu obsahuje pracovní postup pro evidenci pověřené osoby kybernetické bezpečnosti. Pomůže zaznamenat jméno, datum jmenování, školení, pravomoci a vazbu do přehledu bezpečnostních opatření.",
          "Výstupem není jen interní poznámka, ale strukturovaný důkaz, který se promítne do přehledu podle § 3 odst. 2 vyhlášky č. 410/2025 Sb.",
        ],
      },
      {
        heading: "Zdroje a poznámka",
        body: [
          "Právní základ: § 4 a § 5 vyhlášky č. 410/2025 Sb. a podpůrné materiály NÚKIB pro režim nižších povinností.",
          "Odkazy: https://www.zakonyprolidi.cz/cs/2025-410 a https://portal.nukib.gov.cz/storage/uploads/2026/01/12/videoprednaska_nizsi-rezim_uid_696502219e237.pdf.",
          "Tento článek je praktický informační materiál. Nenahrazuje právní posouzení konkrétní regulované služby.",
        ],
      },
    ],
  },
];

const importedCzechBlogPosts: BlogPost[] = [
  {
    "slug": "nis2-gdpr-eu-ai-act-tri-predpisy-jedna-firma",
    "title": "Tři předpisy, jedna firma: jak zvládnout NIS2, GDPR a EU AI Act najednou",
    "description": "Pokud poskytujete digitální služby nebo spravujete IT pro zákazníky, pravděpodobně se na vás vztahují tři velké evropské regulace najednou. Tady je návod, jak je zvládnout bez chaosu.",
    "category": "Multi-regulace",
    "publishedAt": "2026-05-24",
    "readTime": "9 min",
    "author": "Splnit.eu",
    "authorRole": "Redakce Splnit.eu",
    "ctaTitle": "Splňte požadavky bez zbytečné byrokracie",
    "ctaBody": "Splnit.eu automatizuje compliance pro NIS2, GDPR, ISO 27001 a EU AI Act. Sledujte svůj stav v reálném čase.",
    "ctaButton": "Začít zdarma",
    "ctaHref": "/early-access",
    "summary": "Přišel bezpečnostní dotazník od potenciálního enterprise zákazníka.",
    "sections": [
      {
        "heading": "O čem každý předpis je — v jedné minutě",
        "body": [
          "Než se pustíme do průniků, rychlé shrnutí toho, co každý předpis řeší:"
        ],
        "subsections": [
          {
            "heading": "nZKB (Nový zákon o kybernetické bezpečnosti, zákon č. 264/2025 Sb.) — česká implementace NIS2",
            "body": [
              "Zákon chráí sítě, informační systémy a digitální infrastrukturu. Zaměřuje se na firmy, které poskytují tzv. regulované služby — tedy služby, jejichž výpadek nebo narušení by mělo závažný dopad na ekonomiku, společnost nebo veřejnou správu. Patří sem poskytovatelé cloudových služeb, správci sítí, MSP, ale i subjekty z energetiky, zdravotnictví nebo dopravy.",
              "Zákon ukládá registraci u NÚKIB, zavedení bezpečnostních opatření a hlášení kybernetických incidentů. Sankcí může být pokuta až 250 milionů Kč nebo 2 % celosvětového ročního obratu."
            ]
          },
          {
            "heading": "GDPR (Obecné nařízení o ochraně osobních údajů, nařízení EU 2016/679)",
            "body": [
              "GDPR chrání osobní data fyzických osob — zákazníků, zaměstnanců, uživatelů. Platí pro každou firmu, která zpracovává osobní data osob v EU, bez ohledu na velikost nebo sídlo. Vyžaduje právní základ pro každé zpracování, transparentnost vůči subjektům údajů, zavedení technických a organizačních opatření a hlášení bezpečnostních incidentů na dozorový úřad (v ČR je to ÚOOÚ) do 72 hodin. Sankce dosahují až 20 milionů EUR nebo 4 % celosvětového obratu."
            ]
          },
          {
            "heading": "EU AI Act (Nařízení EU 2024/1689)",
            "body": [
              "EU AI Act reguluje vývoj, uvádění na trh a používání systémů umělé inteligence. Platí pro firmy, které AI systémy vyvíjejí (tzv. poskytovatelé), i pro ty, které je ve svém provozu nebo službách používají (nasazovatelé). Přísnost povinností závisí na míře rizika, které AI systém představuje. Sankcí může být pokuta až 35 milionů EUR nebo 7 % celosvětového obratu."
            ]
          }
        ]
      },
      {
        "heading": "Koho se týkají všechny tři najednou?",
        "body": [
          "Pokud splňujete alespoň jeden bod z každé skupiny níže, s vysokou pravděpodobností padáte pod všechny tři regulace:",
          "**nZKB:**",
          "**GDPR:**",
          "**EU AI Act:**",
          "Pokud jste zaškrtli alespoň jeden bod v každé skupině — čtete správný článek."
        ],
        "bullets": [
          "Poskytujete cloudové služby, datová centra, spravované IT služby (MSP)",
          "Provozujete digitální platformu nebo SaaS pro větší počet zákazníků",
          "Spravujete kritické IT systémy pro zákazníky v regulovaných sektorech",
          "Zpracováváte e-mailové adresy, jména, IP adresy nebo jakákoli jiná osobní data",
          "Provozujete zákaznický účet, newsletter nebo analytiku webu",
          "Vedete databázi zaměstnanců",
          "Používáte nástroje jako GitHub Copilot, ChatGPT, AI zákaznickou podporu nebo AI HR systém",
          "Váš produkt obsahuje funkce strojového učení, doporučovacích algoritmů nebo prediktivní analytiky",
          "Automatizujete rozhodnutí, která se týkají lidí (nábor, hodnocení, úvěry, cenová segmentace)"
        ]
      },
      {
        "heading": "Kde se předpisy překrývají: mapa průniků",
        "body": [
          "Největší efektivita v compliance přichází z toho, že poznáte, kde předpisy sdílejí společné požadavky. Pak je řešíte jednou — ne třikrát."
        ],
        "subsections": [
          {
            "heading": "1. Řízení rizik",
            "body": [
              "Všechny tři předpisy vyžadují, abyste rizika systematicky identifikovali, hodnotili a řídili. Liší se jen „čočka\", přes kterou na rizika nahlížíte:",
              "**Řešení:** Veďte jeden registr rizik s více sloupci. Ke každému identifikovanému riziku přiřaďte, který předpis se ho týká a jaká opatření ho snižují. Nedělejte tři oddělené analýzy — to je zdroj chyb a plýtvání časem."
            ],
            "bullets": [
              "**GDPR:** Riziko pro práva a svobody fyzických osob (únik dat, neoprávněný přístup k osobním datům)",
              "**nZKB:** Riziko pro dostupnost, důvěrnost a integritu sítí a systémů (kybernetický útok, výpadek)",
              "**EU AI Act:** Riziko spojené s chováním AI systému (diskriminace, chybné rozhodnutí, bezpečnostní zranitelnost)"
            ]
          },
          {
            "heading": "2. Dokumentace a interní politiky",
            "body": [
              "Každý předpis vyžaduje určitou formu dokumentace, která dokazuje, že víte, co děláte:",
              "**Řešení:** Vytvořte jedno sdílené úložiště interních předpisů. Bezpečnostní politika (nZKB) a politika ochrany osobních údajů (GDPR) jsou sice oddělené dokumenty, ale sdílejí společné sekce — definice, rozsah, odpovědnosti, přezkoumání. Použijte šablony, které tyto průniky reflektují."
            ],
            "bullets": [
              "**GDPR:** Záznamy o zpracovatelských činnostech (ROPA), smlouvy se zpracovateli (DPA), záznamy o incidentech",
              "**nZKB:** Bezpečnostní politiky, přehled aktiv, dokumentace rozsahu řízení kyberbezpečnosti",
              "**EU AI Act:** Technická dokumentace AI systémů, záznamy o použití u nasazovatelů systémů vysokého rizika"
            ]
          },
          {
            "heading": "3. Hlášení incidentů — tři hodiny, jeden incident",
            "body": [
              "Toto je oblast, kde nepozornost může mít nejrychlejší a nejbolestnější důsledky:",
              "Skutečný kybernetický útok, při němž dojde k úniku zákaznických dat zpracovávaných AI systémem, může spustit všechny tři oznamovací povinnosti najednou — s různými lhůtami a různými příjemci. Bez předem připraveného plánu je prakticky nemožné zvládnout to v čase.",
              "**Řešení:** Napište jeden incident response plán, který výslovně adresuje všechny tři předpisy. Pro každý typ incidentu definujte: kdo rozhoduje, kdo hlásí, komu, v jaké lhůtě a co se sděluje zákazníkům. Viz také článek o tabletop cvičeních na tomto blogu."
            ],
            "bullets": [
              "Předpis: GDPR | Co hlásit: Porušení zabezpečení osobních dat | Komu: ÚOOÚ | Do kdy: 72 hodin od zjištění",
              "Předpis: nZKB | Co hlásit: Kybernetický bezpečnostní incident | Komu: NÚKIB (vyšší režim) nebo Národní CERT (nižší režim) | Do kdy: 24 hodin od zjištění",
              "Předpis: EU AI Act | Co hlásit: Závažný incident nebo závažné selhání systému (pro poskytovatele systémů vysokého rizika) | Komu: Národní tržební dozorový orgán | Do kdy: Bez zbytečného odkladu"
            ]
          },
          {
            "heading": "4. Správa dodavatelů",
            "body": [
              "Ani jeden z předpisů vás neomlouvá, pokud za problém může váš dodavatel:",
              "**Řešení:** Veďte jeden vendor seznam s více sloupci. Pro každého dodavatele označte: zda zpracovává osobní data (GDPR → DPA), zda je bezpečnostně významný (nZKB → hodnocení), zda poskytuje AI funkce (EU AI Act → riziková klasifikace)."
            ],
            "bullets": [
              "**GDPR:** Musíte mít uzavřenou DPA (smlouvu o zpracování osobních údajů) s každým subjektem, který zpracovává osobní data vaším jménem.",
              "**nZKB:** Bezpečnostně významní dodavatelé musejí být hodnoceni z pohledu kybernetické bezpečnosti.",
              "**EU AI Act:** Pokud používáte AI systém třetí strany, musíte mít k dispozici jeho technickou dokumentaci a vědět, do jaké rizikové kategorie spadá."
            ]
          },
          {
            "heading": "5. Školení zaměstnanců",
            "body": [
              "Všechny tři předpisy předpokládají, že zaměstnanci vědí, jak se chovat bezpečně a v souladu s pravidly:",
              "**Řešení:** Jedno roční školení pokrývající všechny tři oblasti je lepší než tři oddělené akce. Záznamy o školení jsou důkaz pro všechny tři regulace."
            ],
            "bullets": [
              "GDPR vyžaduje školení o ochraně osobních dat",
              "nZKB vyžaduje bezpečnostní školení jako součást politiky bezpečnosti lidských zdrojů",
              "EU AI Act vyžaduje, aby nasazovatelé systémů vysokého rizika zajistili odpovídající AI gramotnost obsluhy"
            ]
          }
        ]
      },
      {
        "heading": "Co je naopak specifické pro každý předpis — a nelze sloučit",
        "body": [
          "Přes všechny průniky mají předpisy i oblasti, které nelze jednoduše sdílet:",
          "**GDPR specifika:**",
          "**nZKB specifika:**",
          "**EU AI Act specifika:**"
        ],
        "bullets": [
          "Právní základ pro každé zpracování (souhlas, plnění smlouvy, oprávněný zájem…)",
          "Posouzení vlivu na ochranu osobních údajů (DPIA) před spuštěním rizikového zpracování",
          "Práva subjektů údajů: přístup, výmaz, přenositelnost, námitka",
          "Jmenování DPO (pokud jde o rozsáhlé zpracování citlivých dat nebo veřejný orgán)",
          "Registrace regulované služby u NÚKIB přes Portál NÚKIB",
          "Stanovení rozsahu řízení kyberbezpečnosti",
          "Konkrétní technická a organizační opatření dle vyhlášky (podle režimu)",
          "Hlášení incidentů specifickým způsobem a ve formátu NÚKIB",
          "Riziková klasifikace každého AI systému",
          "Pro systémy vysokého rizika: registrace v EU databázi (pro poskytovatele)",
          "Posouzení dopadů na základní práva (FRIA) pro nasazovatele v určitých oblastech",
          "Transparentnost vůči uživatelům (označení, že komunikují s AI)"
        ]
      },
      {
        "heading": "Praktický postup: kde začít, když musíte řešit všechny tři",
        "body": [],
        "subsections": [
          {
            "heading": "Krok 1: Inventura — jeden dokument, tři sekce",
            "body": [
              "Než začnete cokoli řešit, potřebujete vědět, co máte. Proveďte inventuru:",
              "**Sekce A — Data (GDPR):** Jaká osobní data zpracováváte? Kde jsou uložena? Kdo k nim má přístup? Kdo jsou vaši zpracovatelé?",
              "**Sekce B — Systémy a sítě (nZKB):** Jaké IT systémy a sítě provozujete nebo spravujete? Které z nich jsou součástí regulované služby? Kteří dodavatelé mají přístup?",
              "**Sekce C — AI nástroje (EU AI Act):** Jaké AI nástroje nebo funkce vaše firma používá nebo nabízí? Do jaké rizikové kategorie spadají? Ovlivňují rozhodnutí o lidech?"
            ]
          },
          {
            "heading": "Krok 2: Registr rizik — jeden, průřezový",
            "body": [
              "Ke každému riziku v registru přiřaďte relevantní regulaci (GDPR / nZKB / EU AI Act nebo jejich kombinaci). Opatření ke snížení rizika pak navrhujte s ohledem na všechny dotčené předpisy — ne izolovaně."
            ]
          },
          {
            "heading": "Krok 3: Prioritizujte podle termínů a sankcí",
            "body": [
              "Pokud máte od NÚKIB rozhodnutí o registraci, máte zákonné lhůty (30 dní na kontaktní údaje, 12 měsíců na opatření). Ty jsou závaznější než obecné GDPR nebo AI Act povinnosti bez konkrétního deadline. Začněte tedy nZKB — a průběžně integrujte GDPR a AI Act."
            ]
          },
          {
            "heading": "Krok 4: Sdílená dokumentační páteř",
            "body": [
              "Vytvořte sadu základních dokumentů, které slouží pro více předpisů:"
            ],
            "bullets": [
              "Dokument: Registr aktiv (data, systémy, AI nástroje) | Slouží pro: GDPR + nZKB + EU AI Act",
              "Dokument: Registr rizik | Slouží pro: GDPR + nZKB + EU AI Act",
              "Dokument: Vendor seznam s kategorizací | Slouží pro: GDPR + nZKB + EU AI Act",
              "Dokument: Incident response plán | Slouží pro: GDPR + nZKB + EU AI Act",
              "Dokument: Politika školení zaměstnanců | Slouží pro: GDPR + nZKB + EU AI Act",
              "Dokument: ROPA | Slouží pro: GDPR",
              "Dokument: Bezpečnostní politiky | Slouží pro: nZKB",
              "Dokument: AI systémová dokumentace | Slouží pro: EU AI Act"
            ]
          },
          {
            "heading": "Krok 5: Jeden přezkum ročně — nebo po každé změně",
            "body": [
              "Každá změna ve firmě — nový dodavatel, nový AI nástroj, nová funkce produktu, nový typ zákazníka — může mít dopad na soulad se všemi třemi předpisy. Nastavte interní proces: před každou větší změnou se ptejte, zda ovlivňuje GDPR, nZKB nebo AI Act soulad."
            ]
          }
        ]
      },
      {
        "heading": "Nejčastější chyby, které firmy dělají",
        "body": [
          "**„Řešíme to postupně — letos GDPR, příští rok NIS2.\"** Rizikové. Lhůty nZKB jsou zákonné a konkrétní. GDPR sankce se ukládají průběžně. Integrace je efektivnější než sekvenční přístup.",
          "**„AI Act se nás netýká — my AI nevyvíjíme.\"** Zákon se stejnou silou vztahuje na nasazovatele (uživatele) AI systémů, nejen na jejich vývojáře. Pokud používáte AI HR nástroj pro hodnocení zaměstnanců, jste nasazovatelem systému, který pravděpodobně spadá do vysokého rizika.",
          "**„Máme GDPR vyřešené od roku 2018.\"** Technické prostředí, dodavatelé a produktové funkce se za 6+ let zásadně změnily. GDPR soulad není stav, ale průběžný proces. ROPA z roku 2019 neodpovídá realitě roku 2026.",
          "**„Každé oddělení si řeší svůj předpis samo.\"** Když IT tým řeší nZKB, právní oddělení GDPR a produktový tým AI Act bez koordinace, vznikají mezery, duplicity a konflikty. Compliance potřebuje vlastníka, který koordinuje průřezové oblasti."
        ]
      },
      {
        "heading": "TL;DR",
        "body": [],
        "bullets": [
          "nZKB, GDPR a EU AI Act se vztahují na velkou část českých MSP a SaaS firem — najednou, ne postupně.",
          "Čtyři klíčové průřezy lze řešit společně: řízení rizik, dokumentace, hlášení incidentů a správa dodavatelů.",
          "Jeden incident může spustit povinnosti ze všech tří předpisů zároveň — mějte připravený jednotný incident response plán.",
          "Začněte inventurou: data, systémy, AI nástroje. Pak jeden registr rizik, jedna dokumentační páteř.",
          "Compliance není cíl, je to průběžný stav. Přezkum po každé větší změně ve firmě je nutností, ne volbou."
        ]
      }
    ]
  },
  {
    "slug": "co-delat-12-mesicu-po-registraci-nukib",
    "title": "Co dělat prvních 12 měsíců po registraci u NÚKIB: praktický časový plán",
    "description": "Rozhodnutí o registraci z NÚKIB přišlo. Máte 12 měsíců na zavedení bezpečnostních opatření. Tady je konkrétní plán — krok za krokem, měsíc po měsíci — jak ten čas využít správně.",
    "category": "ZoKB / NIS2",
    "publishedAt": "2026-05-24",
    "readTime": "9 min",
    "author": "Splnit.eu",
    "authorRole": "Redakce Splnit.eu",
    "regulationHref": "https://www.e-sbirka.cz/sb/2025/264",
    "ctaTitle": "Splňte požadavky bez zbytečné byrokracie",
    "ctaBody": "Splnit.eu automatizuje compliance pro NIS2, GDPR, ISO 27001 a EU AI Act. Sledujte svůj stav v reálném čase.",
    "ctaButton": "Začít zdarma",
    "ctaHref": "/early-access",
    "summary": "Rozhodnutí o registraci regulované služby od NÚKIB přišlo.",
    "sections": [
      {
        "heading": "Co se stane, když nic neuděláte",
        "body": [
          "Než se pustíme do plánu, je důležité pochopit, co sazí. nZKB dává NÚKIB nástroje k sankcionování firem, které neplní povinnosti:",
          "Nejde tedy jen o papírový soulad — jde o reputaci firmy, důvěru zákazníků a provozní schopnost."
        ],
        "bullets": [
          "Pokuty až **250 000 000 Kč** nebo **2 % celosvětového ročního obratu**",
          "Veřejná výstraha (NÚKIB může zveřejnit, že vaše firma neplní zákonné povinnosti)",
          "Pro vedoucí osoby: individuální odpovědnost a pokuty až 5 000 000 Kč"
        ]
      },
      {
        "heading": "Přehled celého roku na jednom místě",
        "body": [],
        "table": {
          "headers": [
            "Fáze",
            "Termín",
            "Co musíte udělat"
          ],
          "rows": [
            [
              "Okamžitě",
              "Do 24 hodin od rozhodnutí",
              "Zaregistrovat přijetí, nastavit upomínky"
            ],
            [
              "Fáze 0",
              "Do 30 dnů od rozhodnutí",
              "Nahlásit kontaktní a doplňující údaje (§ 11 nZKB)"
            ],
            [
              "Fáze 1",
              "Měsíc 1–2",
              "Stanovit rozsah řízení KB + gap analýza"
            ],
            [
              "Fáze 2",
              "Měsíc 2–5",
              "Dokumentace a bezpečnostní politiky"
            ],
            [
              "Fáze 3",
              "Měsíc 3–9",
              "Zavádění technických opatření"
            ],
            [
              "Fáze 4",
              "Měsíc 8–11",
              "Testování, školení, doladění"
            ],
            [
              "Fáze 5",
              "Měsíc 12",
              "Připravenost na hlášení incidentů + přezkum"
            ]
          ]
        }
      },
      {
        "heading": "Okamžitě po obdržení rozhodnutí",
        "body": [],
        "subsections": [
          {
            "heading": "Co udělat první den",
            "body": [
              "**Potvrzení přijetí rozhodnutí** je formální krok, ale důležitý. Rozhodnutí o registraci je správní rozhodnutí — začíná lhůta. Ujistěte se, že víte, od jakého data lhůty běží.",
              "**Nastavte si tři datum-upomínky do kalendáře:**",
              "**Informujte vedení firmy.** nZKB výslovně počítá s odpovědností vedení — vedoucí osoby musejí být o povinnostech informovány a aktivně se podílet na jejich plnění. Compliance není jen záležitost IT oddělení."
            ],
            "bullets": [
              "D+30: deadline pro nahlášení kontaktních a doplňujících údajů (§ 11 nZKB)",
              "D+365: deadline pro zavedení bezpečnostních opatření",
              "D+365: začátek povinnosti hlásit kybernetické bezpečnostní incidenty"
            ]
          },
          {
            "heading": "Protiopatření platí okamžitě",
            "body": [
              "Toto platí bez ohledu na to, v jaké fázi přípravy se nacházíte: pokud NÚKIB vydá výstrahu, varování nebo reaktivní protiopatření, jste povinni reagovat **ihned**. Rozhodnutí o protiopatření má okamžitý účinek bez odkladné lhůty.",
              "Co to v praxi znamená: sledujte Portál NÚKIB (portal.nukib.gov.cz) a nastavte si e-mailové notifikace nebo RSS feed na bezpečnostní varování."
            ]
          }
        ]
      },
      {
        "heading": "Fáze 0: Do 30 dnů — kontaktní a doplňující údaje (§ 11 nZKB)",
        "body": [
          "Pokud jste kontaktní údaje nenahlásili již při ohlašování regulované služby, máte na to **30 dní od doručení rozhodnutí o registraci**. Jde o:",
          "**Proč je to důležité:** NÚKIB bez těchto údajů nemůže kontaktovat vaši firmu při incidentu, varování nebo protiopatření. Navíc jejich nenahlášení je samo o sobě porušením povinnosti.",
          "**Praktická rada:** formulář nejde uložit rozpracovaný — mějte všechny údaje připravené před tím, než ho otevřete. Zkontrolujte si aktuální IP rozsahy, doménová jména a kontaktní osoby předem.",
          "**Kde to udělat:** Portál NÚKIB → sekce „Chci vyřídit\" → formulář Hlášení údajů."
        ],
        "bullets": [
          "**Kontaktní osoby** k regulovaným službám (jméno, funkce, telefon, e-mail)",
          "**IP adresy a rozsahy** využívané při poskytování regulované služby",
          "**Doménová jména** asociovaná s regulovanými službami",
          "Pokud jste poskytovatel digitálních služeb: informace o přeshraničním poskytování a provozovnách"
        ]
      },
      {
        "heading": "Fáze 1: Měsíce 1–2 — Základ, bez kterého nic dalšího nefunguje",
        "body": [],
        "subsections": [
          {
            "heading": "Krok 1: Stanovení rozsahu řízení kyberbezpečnosti",
            "body": [
              "Toto je pravděpodobně nejdůležitější rozhodnutí celého roku — a většina firem ho přeskočí nebo podcení.",
              "**Co to znamená:** Musíte definovat, která aktiva, systémy, procesy a organizační části jsou zahrnuty do rozsahu vašeho řízení kyberbezpečnosti (tzv. ISMS scope).",
              "**Proč záleží:** Pokud rozsah nestanovíte, zákon automaticky předpokládá, že opatření aplikujete na **veškerá aktiva celé organizace**. To je v praxi pro MSP nebo středně velkou firmu nepraktické a mnohonásobně nákladnější.",
              "**Jak rozsah stanovit:**",
              "Začněte od regulované služby — co je nezbytné pro její poskytování? Zahrňte:",
              "**Co nemusí být v rozsahu:** podpůrné systémy bez přístupu k regulované službě, administrativa, marketing — pokud tyto oblasti nemají přístup k regulovaným systémům nebo datům.",
              "**Zdokumentujte rozsah** formálně — jako interní dokument podepsaný vedením. Tento dokument je první, co NÚKIB nebo auditor při kontrole požaduje."
            ],
            "bullets": [
              "IT systémy, na nichž služba běží (servery, síťové prvky, cloudová prostředí)",
              "Data, která služba zpracovává (zákaznická data, konfigurační data, logy)",
              "Procesy, které jsou pro službu kritické (správa přístupů, zálohy, monitoring)",
              "Lidi, kteří mají přístup k výše uvedeným (interní zaměstnanci i externisté a dodavatelé)"
            ]
          },
          {
            "heading": "Krok 2: Gap analýza",
            "body": [
              "Gap analýza je structured přehled rozdílu mezi tím, kde jste teď, a tím, kde musíte být za 12 měsíců. Bez ní nevíte, kolik práce vás čeká — a nemůžete prioritizovat.",
              "**Co gap analýza zjišťuje:**",
              "Pro každé bezpečnostní opatření požadované vyhláškou (pro váš režim) určuje:",
              "**Kolik opatření vás čeká:**",
              "**Výsledkem gap analýzy** je prioritizovaný seznam toho, co je potřeba udělat — s odhadem náročnosti a časové náročnosti každé položky. Tento plán se pak stává základem pro fáze 2 a 3.",
              "**Tip:** I přesto, že mnoho firem má část opatření fakticky zavedených (aktualizace systémů, zálohy, přístupy), chybí jim dokumentace. Velká část gap analýzy u MSP odhalí ne absenci opatření, ale absenci jejich záznamu."
            ],
            "bullets": [
              "Stav: ✅ Zavedeno | Popis: Opatření existuje a funguje — potřebuje jen dokumentaci",
              "Stav: ⚠️ Částečně | Popis: Opatření existuje, ale je neúplné nebo nedokumentované",
              "Stav: ❌ Chybí | Popis: Opatření neexistuje — je potřeba vybudovat",
              "**Nižší režim:** 13 opatření (vyhl. č. 410/2025 Sb.)",
              "**Vyšší režim:** 25 opatření (vyhl. č. 409/2025 Sb.)"
            ]
          }
        ]
      },
      {
        "heading": "Fáze 2: Měsíce 2–5 — Dokumentace a bezpečnostní politiky",
        "body": [
          "Dokumentace není byrokracie — je to zákonný požadavek a zároveň praktický nástroj. Při incidentu, auditu nebo personální změně vám ušetří obrovské množství práce."
        ],
        "subsections": [
          {
            "heading": "Jaké politiky potřebujete a proč",
            "body": [
              "**Politika řízení rizik** Základní dokument. Definuje, jak vaše firma identifikuje, hodnotí a zvládá bezpečnostní rizika. Bez ní nemůžete ospravedlnit, proč jste vybrali ta konkrétní opatření, která máte.",
              "*Co musí obsahovat:* metodiku hodnocení rizik (stupnice pravděpodobnosti a dopadu), role a odpovědnosti, frekvenci přezkumu, způsob evidence.",
              "**Politika řízení přístupů** Definuje, kdo smí přistupovat k jakým systémům a datům, za jakých podmínek a jak se přístupy udělují, mění a odebírají.",
              "*Proč je kritická:* neoprávněný přístup nebo přístup bývalého zaměstnance patří k nejčastějším zdrojům bezpečnostních incidentů.",
              "*Co musí obsahovat:* princip nejmenšího oprávnění, process onboardingu a offboardingu, požadavky na MFA, správu privilegovaných účtů.",
              "**Politika řízení dodavatelů** Popisuje, jak hodnotíte bezpečnostní způsobilost dodavatelů, jaké požadavky na ně kladete a jak smluvně ošetřujete bezpečnostní závazky.",
              "**Politika bezpečnosti lidských zdrojů** Pokrývá bezpečnostní aspekty celého životního cyklu zaměstnance: nábor (background check tam, kde je relevantní), onboarding (školení, přístupy), práci (pravidla chování) a offboarding (odebrání přístupů, vrácení zařízení).",
              "**Politika řízení kontinuity a obnovy po havárii** Co se stane, když klíčový systém vypadne? Kdo co dělá, jak se obnovuje provoz, jak se komunikuje zákazníkům a NÚKIB?",
              "**Politika řízení incidentů** Postup pro detekci, klasifikaci, eskalaci, řešení a dokumentaci bezpečnostních incidentů. Tato politika přímo podmiňuje vaši schopnost plnit zákonné oznamovací lhůty."
            ]
          },
          {
            "heading": "Jak politiky napsat správně",
            "body": [
              "Tři zásady, které rozlišují funkční politiky od šanonového papírování:"
            ],
            "bullets": [
              "1. **Srozumitelnost před délkou.** Politika, které nikdo nerozumí, se nedodržuje. Pište srozumitelně, strukturovaně, s příklady.",
              "2. **Konkrétní odpovědnosti.** Každá politika musí jasně říkat, kdo za co odpovídá. „IT oddělení\" nestačí — jmenujte role.",
              "3. **Živé dokumenty.** Politiky musí mít datum vydání, verzi a plánovaný termín přezkumu. Minimálně jednou ročně — nebo po každé větší změně."
            ]
          }
        ]
      },
      {
        "heading": "Fáze 3: Měsíce 3–9 — Zavádění technických opatření",
        "body": [
          "Technická opatření zavádějte paralelně s dokumentací, ne po ní. Začněte těmi s nejvyšším rizikovým dopadem a nejnižší náročností implementace."
        ],
        "subsections": [
          {
            "heading": "Priorita 1: Správa přístupů (měsíce 3–5)",
            "body": [
              "Toto je nejrychlejší win — a jedno z nejúčinnějších opatření.",
              "**Co zavést:**"
            ],
            "bullets": [
              "**Vícefaktorové ověřování (MFA)** na všech kritických systémech: e-mail, VPN, správa cloudové infrastruktury, správa zákazníků. MFA eliminuje velkou část útoků na přihlašovací údaje.",
              "**Princip nejmenšího oprávnění:** každý uživatel a systém má přístup pouze k tomu, co potřebuje pro svou funkci. Pravidelně přezkumujte a odebírejte nepotřebná oprávnění.",
              "**Offboarding proces:** okamžité odebrání přístupů při odchodu zaměstnance nebo ukončení spolupráce s externím pracovníkem. Definujte, kdo to dělá a do kdy.",
              "**Správa privilegovaných účtů:** administrátorské přístupy by měly být oddělené od běžných pracovních účtů, auditované a používané pouze pro konkrétní úkoly."
            ]
          },
          {
            "heading": "Priorita 2: Zálohy a obnova (měsíce 3–6)",
            "body": [
              "**Pravidlo 3-2-1:** 3 kopie dat, na 2 různých typech médií, 1 mimo primární lokalitu (nebo offsite/cloudová záloha). Zálohy jsou k ničemu, pokud je nikdy netestujete.",
              "**Co zavést:**"
            ],
            "bullets": [
              "Automatické zálohy kritických systémů a dat s definovanou frekvencí",
              "Pravidelné testování obnovy ze zálohy (nestačí jen zkontrolovat, že záloha proběhla — otestujte skutečnou obnovu)",
              "Oddělení zálohovacího systému od produkčního prostředí (ransomware jinak zašifruje i zálohy)",
              "Dokumentace RTO (Recovery Time Objective — jak dlouho smí trvat obnova) a RPO (Recovery Point Objective — o kolik dat si můžete dovolit přijít)"
            ]
          },
          {
            "heading": "Priorita 3: Správa zranitelností a záplatování (měsíce 4–7)",
            "body": [
              "**Co zavést:**"
            ],
            "bullets": [
              "Pravidelný patch management: jasný proces pro sledování, testování a aplikaci bezpečnostních aktualizací operačních systémů, aplikací a síťových prvků",
              "Definovaná SLA pro záplatování: kritické zranitelnosti (CVSS 9+) do 24–72 hodin, vysoké (CVSS 7–9) do 7 dní, střední do 30 dnů",
              "Inventura systémů: nelze záplatovat to, o čem nevíte. Udržujte aktuální seznam všech spravovaných systémů."
            ]
          },
          {
            "heading": "Priorita 4: Logování a monitoring (měsíce 5–8)",
            "body": [
              "**Co zavést:**"
            ],
            "bullets": [
              "Centralizované logování kritických systémů (servery, síťové prvky, přístupy, VPN)",
              "Uchovávání logů minimálně 90 dní (doporučeno 12 měsíců pro forenzní účely)",
              "Alerting na podezřelé aktivity: opakované neúspěšné přihlášení, přihlášení ze zahraničí, neobvyklé přenosy dat",
              "Definice toho, kdo logy monitoruje a jak reaguje na alarmy"
            ]
          },
          {
            "heading": "Priorita 5: Síťová bezpečnost a šifrování (měsíce 6–9)",
            "body": [
              "**Co zavést:**"
            ],
            "bullets": [
              "Segmentace sítě: různé části sítě (produkce, vývoj, administrativa) odděleny — kompromitace jednoho segmentu neohrozí automaticky vše",
              "Šifrování přenášených dat: HTTPS všude, šifrované VPN pro vzdálený přístup",
              "Šifrování uložených dat: zejména zálohy a citlivá zákaznická data",
              "Firewall pravidla: pravidelná revize, blokování nepoužívaných portů a služeb"
            ]
          }
        ]
      },
      {
        "heading": "Fáze 4: Měsíce 8–11 — Testování, školení, doladění",
        "body": [],
        "subsections": [
          {
            "heading": "Testování incident response plánu",
            "body": [
              "Než uplyne rok, musíte být připraveni incidenty skutečně hlásit. To vyžaduje víc než mít plán napsaný — musíte ho otestovat.",
              "**Proveďte tabletop cvičení:** Vyberte realistický scénář (ransomware, únik přihlašovacích údajů, výpadek klíčového systému) a projděte postup se všemi zodpovědnými osobami. Cílem je odhalit mezery — ne ukázat, jak dobří jste. Více o tom v článku o incident response cvičeních na tomto blogu.",
              "**Co testovat:**"
            ],
            "bullets": [
              "Schopnost detekovat incident (funguje monitoring a alerting?)",
              "Schopnost posoudit závažnost (víte, kdy incident musíte hlásit NÚKIB?)",
              "Schopnost nahlásit incident v zákonné lhůtě (24 hodin pro nZKB)",
              "Schopnost komunikovat zákazníkům a dalším stakeholderům",
              "Schopnost obnovit provoz ze zálohy"
            ]
          },
          {
            "heading": "Školení zaměstnanců",
            "body": [
              "Bezpečnostní opatření selžou, pokud je zaměstnanci obcházejí — vědomě nebo nevědomě.",
              "**Minimální obsah školení:**",
              "**Uchovávejte záznamy** o tom, kdo byl proškolen a kdy. Tyto záznamy jsou důkaz pro NÚKIB i zákaznické auditory."
            ],
            "bullets": [
              "Phishing a sociální inženýrství — jak rozpoznat podezřelý e-mail",
              "Správa hesel — proč je sdílení hesel problém a jak správně hesla spravovat",
              "Hlášení incidentů — jak zaměstnanec hlásí podezřelou aktivitu interně",
              "Práce s citlivými daty — co smí sdílet a čím a co ne"
            ]
          },
          {
            "heading": "Interní audit",
            "body": [
              "Před samotným dvanáctým měsícem si proveďte interní audit: projděte každé požadované opatření a ověřte, že je skutečně zavedené a zdokumentované, ne jen plánované."
            ]
          }
        ]
      },
      {
        "heading": "Fáze 5: Měsíc 12 — Kde musíte být",
        "body": [
          "Po uplynutí 12 měsíců od potvrzení registrace musíte plnit všechny zákonné povinnosti souběžně. To zahrnuje:",
          "✅ Zavedená bezpečnostní opatření odpovídající vašemu režimu (nižší nebo vyšší) ✅ Aktivní hlášení kybernetických bezpečnostních incidentů (funkční proces, ne jen dokument) ✅ Aktuální bezpečnostní dokumentace a politiky ✅ Proškolení zaměstnanci se záznamy o školení ✅ Otestovaný incident response plán ✅ Pravidelné přezkumy nastaveny do kalendáře pro nadcházející rok"
        ]
      },
      {
        "heading": "Nejčastější chyby a jak se jim vyhnout",
        "body": [
          "**Čekání na „ideální čas\"** Compliance nikdy nepřijde ve vhodný moment. Čím dřív začnete, tím méně stresu v posledních měsících. Začněte gap analýzou okamžitě po obdržení rozhodnutí.",
          "**Přeskočení stanovení rozsahu** Bez definovaného rozsahu jsou opatření zbytečně rozsáhlá a nákladná. Toto je nejdůležitější investice prvních dvou měsíců.",
          "**Politiky bez zodpovědností** „Zálohy se dělají automaticky\" nestačí. Politika musí říkat kdo, co, kdy a jak. A kdo odpovídá za to, že to funguje.",
          "**Opatření bez testování** Zálohy, které se netestují, jsou jen falešná jistota. Incident response plán, který nikdo nezkušel, selže v nejdůležitější chvíli.",
          "**Ignorování dodavatelů** Velká část bezpečnostních incidentů přichází přes kompromitované dodavatele. Hodnocení dodavatelů není volitelný luxus — je to zákonný požadavek pro vyšší režim a nezbytná praxe pro nižší."
        ]
      },
      {
        "heading": "TL;DR",
        "body": [],
        "bullets": [
          "Do 30 dnů: nahlaste kontaktní a doplňující údaje na NÚKIB portál.",
          "Měsíce 1–2: stanovte rozsah řízení KB a proveďte gap analýzu. Bez toho nevíte, co vás čeká.",
          "Měsíce 2–5: vytvořte základní bezpečnostní politiky — rizika, přístupy, dodavatelé, kontinuita, incidenty.",
          "Měsíce 3–9: zavádějte technická opatření podle priority: MFA a přístupy → zálohy → záplatování → logování → síťová bezpečnost.",
          "Měsíce 8–11: otestujte incident response plán a proškolte zaměstnance.",
          "Měsíc 12: musíte být schopni aktivně hlásit incidenty a doložit zavedená opatření."
        ]
      }
    ]
  },
  {
    "slug": "eu-ai-act-msp-co-pripravit-2026",
    "title": "EU AI Act pro MSP: co reálně musíte řešit v roce 2026",
    "description": "EU AI Act se nevztahuje jen na firmy, které AI vyvíjejí. Pokud AI nástroje ve firmě používáte, máte povinnosti také. Praktický průvodce pro MSP a SaaS firmy, co reálně dělat v roce 2026.",
    "category": "EU AI Act",
    "publishedAt": "2026-05-24",
    "readTime": "8 min",
    "author": "Splnit.eu",
    "authorRole": "Redakce Splnit.eu",
    "regulationHref": "https://eur-lex.europa.eu/legal-content/CS/TXT/?uri=CELEX:32024R1689",
    "ctaTitle": "Splňte požadavky bez zbytečné byrokracie",
    "ctaBody": "Splnit.eu automatizuje compliance pro NIS2, GDPR, ISO 27001 a EU AI Act. Sledujte svůj stav v reálném čase.",
    "ctaButton": "Začít zdarma",
    "ctaHref": "/early-access",
    "summary": "„My AI nevyvíjíme, takže nás AI Act netýká.\" Tato věta je jedním z nejnebezpečnějších omylů v EU compliance prostoru roku 2026.",
    "sections": [
      {
        "heading": "Co je EU AI Act a kdy se plně aplikuje",
        "body": [
          "EU AI Act (Nařízení EU č. 2024/1689) vstoupil v platnost v srpnu 2024. Povinnosti se zavádějí postupně:",
          "**Pro MSP je klíčový srpen 2026** — od tohoto data musíte plně plnit povinnosti pro systémy vysokého rizika, které ve firmě nasazujete."
        ],
        "table": {
          "headers": [
            "Termín",
            "Co vstupuje v platnost"
          ],
          "rows": [
            [
              "Únor 2025",
              "Zákaz AI systémů s nepřijatelným rizikem (okamžitě závazné)"
            ],
            [
              "Srpen 2025",
              "Povinnosti pro poskytovatele a nasazovatele systémů obecného účelu (GPAI)"
            ],
            [
              "Srpen 2026",
              "Plná aplikace — povinnosti pro systémy vysokého rizika (kapitola III)"
            ],
            [
              "2027 a dál",
              "Rozšíření na AI systémy ve stávajících produktech regulovaných jinými právními předpisy"
            ]
          ]
        }
      },
      {
        "heading": "Dvě základní role: poskytovatel vs. nasazovatel",
        "body": [
          "EU AI Act rozlišuje, co s AI systémem děláte:"
        ],
        "subsections": [
          {
            "heading": "Poskytovatel (provider)",
            "body": [
              "Firma, která AI systém vyvíjí a uvádí na trh — ať už jako samostatný produkt nebo jako součást jiného produktu. Pokud váš SaaS produkt obsahuje AI funkce (doporučovací engine, prediktivní analytika, automatizované rozhodování) a nabízíte ho zákazníkům, jste poskytovatel.",
              "**Povinnosti poskytovatele jsou nejpřísnější** — technická dokumentace, conformity assessment, CE označení u systémů vysokého rizika, registrace v EU databázi."
            ]
          },
          {
            "heading": "Nasazovatel (deployer)",
            "body": [
              "Firma, která AI systém jiného subjektu používá pro vlastní účely — ať už interně nebo jako součást vlastní služby zákazníkům. Pokud používáte Salesforce AI, GitHub Copilot, AI HR nástroj třetí strany — jste nasazovatel.",
              "**Povinnosti nasazovatele jsou mírnější, ale reálné** — zejména u systémů vysokého rizika.",
              "**Praktická otázka pro váš produkt:** Rozhoduje AI systém autonomně o věcech, které ovlivňují vaše zákazníky nebo jejich zákazníky? Pokud ano — pravděpodobně nejste jen nasazovatel, ale i poskytovatel."
            ]
          }
        ]
      },
      {
        "heading": "Riziková klasifikace: klíč k pochopení povinností",
        "body": [
          "EU AI Act třídí AI systémy do kategorií podle míry rizika. Vaše povinnosti závisí primárně na tom, do jaké kategorie váš AI systém spadá."
        ],
        "subsections": [
          {
            "heading": "Nepřijatelné riziko — zakázáno",
            "body": [
              "Tyto systémy je zakázáno vyvíjet, prodávat i používat:",
              "**Pro MSP prakticky irelevantní** — pokud nepracujete pro bezpečnostní složky nebo státní aparát."
            ],
            "bullets": [
              "Sociální skórování státem (hodnocení občanů na základě jejich chování)",
              "Manipulativní AI, která využívá psychologické slabosti nebo podprahové techniky",
              "Biometrická identifikace osob v reálném čase na veřejných místech (až na výjimky pro bezpečnostní složky)",
              "AI systémy predikující kriminální chování na základě osobnostních rysů",
              "Neoprávněné skenování obličeje a vytváření databází"
            ]
          },
          {
            "heading": "Vysoké riziko — nejpřísnější povinnosti",
            "body": [
              "Toto je kategorie, kde většina MSP podceňuje svou expozici.",
              "**Systém vysokého rizika je každý AI systém, který:**",
              "**Kdy se to týká MSP v praxi:**",
              "**Klíčový test:** Má AI systém přímý nebo nepřímý vliv na rozhodnutí, která ovlivňují lidská práva, přístup k příležitostem nebo fyzickou bezpečnost lidí?"
            ],
            "bullets": [
              "1. Je součástí produktu regulovaného specifickými EU direktivami (zdravotnické prostředky, hračky, automobily, letectví), NEBO",
              "2. Spadá do jedné z oblastí Přílohy III AI Actu:",
              "Biometrická identifikace a kategorizace",
              "Kritická infrastruktura (energetika, voda, doprava)",
              "**Vzdělávání a odborné vzdělávání** (hodnocení studentů, přijímací procesy)",
              "**Zaměstnání a řízení pracovníků** — sem spadá velká část HR nástrojů",
              "Přístup k základním soukromým a veřejným službám (úvěrové skórování, pojišťovnictví)",
              "Bezpečnostní složky a trestní justice",
              "Migrace a správa hranic",
              "Příklad AI nástroje: AI HR systém filtrující životopisy | Kategorie: ⚠️ Vysoké riziko | Proč: Rozhoduje o přístupu k zaměstnání",
              "Příklad AI nástroje: AI hodnotící výkon zaměstnanců | Kategorie: ⚠️ Vysoké riziko | Proč: Ovlivňuje pracovní podmínky",
              "Příklad AI nástroje: AI chatbot zákaznické podpory | Kategorie: ✅ Omezené nebo min. riziko | Proč: Nepřijímá rozhodnutí, jen komunikuje",
              "Příklad AI nástroje: Prediktivní analytika prodejů | Kategorie: ✅ Minimální riziko | Proč: Nepřímo ovlivňuje lidi",
              "Příklad AI nástroje: AI přepis hovorů | Kategorie: ✅ Minimální riziko | Proč: Podpůrný nástroj, ne rozhodovací",
              "Příklad AI nástroje: AI pro scoring zákazníků / úvěrů | Kategorie: ⚠️ Vysoké riziko | Proč: Ovlivňuje přístup k finančním službám",
              "Příklad AI nástroje: GitHub Copilot | Kategorie: ✅ Minimální riziko | Proč: Podpůrný nástroj pro vývojáře"
            ]
          },
          {
            "heading": "Omezené riziko — transparentnost",
            "body": [
              "Tyto systémy nemají přísné povinnosti, ale musejí být transparentní:",
              "**Praktický dopad pro MSP:** Pokud váš produkt nebo zákaznická podpora využívá AI chatbota — musíte uživatele informovat, že mluví s AI. To platí od již od srpna 2026."
            ],
            "bullets": [
              "**Chatboti** musejí být označeni jako AI — uživatel musí vědět, že komunikuje s automatizovaným systémem, ne člověkem.",
              "**Syntetická média** (deepfake, AI generovaný obraz/video/audio) musejí být označena jako uměle vytvořená.",
              "**AI generovaný text** vydávaný za zprávy nebo jiný autorský obsah musí být označen."
            ]
          },
          {
            "heading": "Minimální riziko — bez specifických povinností",
            "body": [
              "Naprostá většina AI nástrojů v podnikání spadá sem:",
              "Pro tyto systémy AI Act nevyžaduje žádné specifické povinnosti — ale dobrá praxe zahrnuje základní dokumentaci o tom, jaké AI nástroje používáte a proč."
            ],
            "bullets": [
              "Spam filtry, antivir s ML prvky",
              "AI doporučovací systémy (Netflix typ)",
              "Prediktivní analytika pro interní rozhodování",
              "AI nástroje produktivity (přepis, shrnutí, asistence při psaní)",
              "Většina AI vývojářských nástrojů"
            ]
          }
        ]
      },
      {
        "heading": "Co musí nasazovatel se systémem vysokého rizika konkrétně dělat",
        "body": [],
        "subsections": [
          {
            "heading": "1. Inventura a riziková klasifikace — první a nejdůležitější krok",
            "body": [
              "Než plníte jakékoli povinnosti, musíte vědět, jaké AI systémy používáte. Projděte:",
              "Pro každý systém určete: jde o systém vysokého rizika? Kdo je jeho poskytovatel? Jakou má dokumentaci?"
            ],
            "bullets": [
              "Všechny SaaS nástroje a jejich AI funkce (zkontrolujte conditions of service)",
              "HR systémy — zejména jakékoli automatizované hodnocení nebo filtrování",
              "CRM s AI skórováním zákazníků",
              "Bezpečnostní nástroje s AI detekcí"
            ]
          },
          {
            "heading": "2. Zajistit technickou dokumentaci od providera",
            "body": [
              "Než nasadíte systém vysokého rizika, musíte mít k dispozici technickou dokumentaci, která vám umožní posoudit, zda systém funguje tak, jak má. Vyžádejte si od poskytovatele:",
              "Pokud vám to provider odmítne poskytnout — je to varovný signál."
            ],
            "bullets": [
              "Popis funkcionality a limitací systému",
              "Informace o tréninkových datech (bylo použití dat zákonné?)",
              "Výsledky testování a hodnocení přesnosti",
              "Informace o tom, jak systém funguje při hraniční nebo neobvyklé vstupu (edge cases)"
            ]
          },
          {
            "heading": "3. Zajistit lidský dohled (human oversight)",
            "body": [
              "Pro systémy vysokého rizika musí existovat mechanismus, který umožňuje lidské přezkoumání a přepsání AI rozhodnutí.",
              "**Co to konkrétně znamená:**",
              "V praxi: pokud AI HR systém označí uchazeče jako nevhodného, musí existovat člověk, který toto rozhodnutí může přezkoumat a případně zvrátit. AI nesmí být jediným a konečným rozhodovacím prvkem v záležitostech, které mají právní nebo jiný závažný dopad na fyzické osoby.",
              "**Jak to dokumentovat:** Zdokumentujte proces — kdo rozhodnutí AI přezkoumává, v jakých situacích, jak se přezkum zaznamenává."
            ]
          },
          {
            "heading": "4. Transparentnost vůči dotčeným osobám",
            "body": [
              "Pokud AI systém vysokého rizika používáte v oblastech, kde zasahuje do práv nebo příležitostí fyzických osob (HR, úvěrování, vzdělávání), musíte tyto osoby informovat, že jsou předmětem automatizovaného zpracování.",
              "**Příklad:** Zaměstnanci musejí být informováni, pokud HR systém používá AI ke sledování výkonu nebo hodnocení — a to způsobem, který je srozumitelný, ne jen skrytý v pracovní smlouvě."
            ]
          },
          {
            "heading": "5. Vedení záznamů o používání",
            "body": [
              "Nasazovatelé systémů vysokého rizika musejí uchovávat záznamy o automaticky generovaných lozích na dobu odpovídající systému a použití — minimálně po dobu stanovenou provozovatelem nebo sektorovou legislativou.",
              "**Prakticky:** Ujistěte se, že váš AI systém loguje svá rozhodnutí a že tyto logy uchováváte. Pro HR systémy to znamená uchovávat záznamy o AI hodnoceních po dobu stanovenou zákoníkem práce."
            ]
          },
          {
            "heading": "6. Posouzení dopadů na základní práva (FRIA)",
            "body": [
              "Toto je povinné pro specifické kategorie nasazovatelů — zejména veřejné orgány a soukromé subjekty poskytující veřejné služby, pokud nasazují systémy vysokého rizika v oblastech uvedených v příloze III.",
              "Pro typické MSP jde o okrajový požadavek, ale pokud vaše firma poskytuje platformy pro vzdělávání, HR procesy nebo hodnocení zákazníků ve větším měřítku — konzultujte s právníkem, zda FRIA potřebujete."
            ]
          }
        ]
      },
      {
        "heading": "Praktický checklist: kde začít",
        "body": [],
        "subsections": [
          {
            "heading": "Krok 1: Inventura AI nástrojů",
            "body": [],
            "bullets": [
              "[ ] Vytvořte seznam všech AI nástrojů a SaaS produktů s AI funkcemi, které ve firmě používáte",
              "[ ] Pro každý nástroj: kdo je poskytovatel, co AI funkce dělá, koho se týká",
              "[ ] Označte nástroje, které ovlivňují rozhodnutí o lidech (HR, zákazníci, finance)"
            ]
          },
          {
            "heading": "Krok 2: Riziková klasifikace",
            "body": [],
            "bullets": [
              "[ ] Pro každý nástroj z předchozího kroku: odpovídá popis funkce některé kategorii v Příloze III AI Actu?",
              "[ ] Pokud ano: systém je vysokého rizika → pokračujte kroky 3–6",
              "[ ] Pokud ne: systém je minimálního nebo omezeného rizika → jen transparentnost (krok 7)"
            ]
          },
          {
            "heading": "Krok 3–6: Pro systémy vysokého rizika",
            "body": [],
            "bullets": [
              "[ ] Vyžádejte si technickou dokumentaci od poskytovatele",
              "[ ] Zdokumentujte mechanismus lidského dohledu",
              "[ ] Zkontrolujte, že dotčené osoby jsou informovány o AI zpracování",
              "[ ] Ověřte, že systém loguje svá rozhodnutí a záznamy uchováváte"
            ]
          },
          {
            "heading": "Krok 7: Transparentnost",
            "body": [],
            "bullets": [
              "[ ] Jsou vaši chatboti a AI asistenti označeni jako AI vůči uživatelům?",
              "[ ] Pokud generujete obsah pomocí AI pro zákazníky nebo veřejnost, je označen jako AI generovaný?"
            ]
          }
        ]
      },
      {
        "heading": "Nejčastější omyly MSP v kontextu AI Actu",
        "body": [
          "**„Vendor to vyřeší za nás.\"** Ne úplně. Pokud jste nasazovatel systému vysokého rizika, máte vlastní povinnosti — bez ohledu na to, co udělal nebo neudělal vendor. Vendor odpovídá za svou část (technická dokumentace, conformity assessment), vy odpovídáte za svou (lidský dohled, informování osob, záznamy).",
          "**„Naše AI jen doporučuje, nerozhoduje.\"** Hranice mezi doporučením a rozhodnutím je tenčí, než vypadá. Pokud AI filtruje životopisy a HR manažer přijme 95 % jejích doporučení bez přezkumu, AI fakticky rozhoduje. Regulace se dívá na skutečný vliv, ne formální popis.",
          "**„Nemáme žádné AI systémy.\"** Každý SaaS produkt, který používáte, pravděpodobně má AI funkce — od spamových filtrů po CRM skórování. Proveďte inventuru — výsledky vás mohou překvapit."
        ]
      },
      {
        "heading": "TL;DR",
        "body": [],
        "bullets": [
          "EU AI Act se plně aplikuje od srpna 2026. Pokud používáte AI nástroje ve firmě, máte povinnosti nasazovatele.",
          "Největší riziko: HR systémy s AI hodnocením nebo filtrováním. To je Příloha III → vysoké riziko.",
          "Pro systémy vysokého rizika: vyžádejte si dokumentaci od vendora, zajistěte lidský dohled, informujte dotčené osoby, uchovávejte záznamy.",
          "Prvním krokem je inventura AI nástrojů — bez ní nevíte, kde stojíte.",
          "Transparentnost (označení chatbotů jako AI) platí pro všechny firmy, bez výjimky, od srpna 2026."
        ]
      }
    ]
  },
  {
    "slug": "iso-27001-saas-priprava-enterprise-tendr",
    "title": "ISO 27001 pro SaaS firmy: jak se připravit na enterprise tendr",
    "description": "Enterprise zákazník chce vidět ISO 27001 certifikát. Kde začít, jak dlouho to trvá, co stojí a jak z certifikace vytěžit maximum i pro nZKB soulad?",
    "category": "ISO 27001",
    "publishedAt": "2026-05-24",
    "readTime": "8 min",
    "author": "Splnit.eu",
    "authorRole": "Redakce Splnit.eu",
    "ctaTitle": "Splňte požadavky bez zbytečné byrokracie",
    "ctaBody": "Splnit.eu automatizuje compliance pro NIS2, GDPR, ISO 27001 a EU AI Act. Sledujte svůj stav v reálném čase.",
    "ctaButton": "Začít zdarma",
    "ctaHref": "/early-access",
    "summary": "„Před podpisem smlouvy budeme potřebovat váš ISO 27001 certifikát nebo výsledky SOC 2 auditu.\" Tato věta přichází z procurement oddělení enterprise zákazníků čím dál pravidelněji.",
    "sections": [
      {
        "heading": "Co ISO 27001 reálně je — a co není",
        "body": [
          "**Je to:** Mezinárodní norma (ISO/IEC 27001:2022) pro systém řízení bezpečnosti informací (ISMS). Certifikace znamená, že akreditovaný auditor nezávisle ověřil, že váš ISMS odpovídá požadavkům normy — tedy že máte zavedený, funkční a průběžně zlepšovaný systém pro řízení informační bezpečnosti.",
          "**Není to:** Garantování, že nebudete nikdy napadeni. Ani jednorázový projekt, který „uděláte\" a pak na něj zapomenete.",
          "**Platnost a přezkumy:** Certifikát platí 3 roky, ale každý rok probíhá dozorový audit, který ověřuje, že systém stále funguje. Po 3 letech je třeba recertifikační audit."
        ]
      },
      {
        "heading": "Proč enterprise zákazníci ISO 27001 vyžadují",
        "body": [
          "Enterprise firmy a regulované instituce jsou samy pod tlakem — ať už ze strany NIS2/nZKB, GDPR, nebo sektorových regulátorů (ČNB, SUKL). Jejich compliance a procurement týmy musejí prokázat, že jejich dodavatelé (tedy vy) mají zavedené kontroly informační bezpečnosti.",
          "ISO 27001 certifikát je pro ně efektivní zkratka: místo toho, aby prováděly plný audit vašeho prostředí (což je drahé a časově náročné), důvěřují výsledku práce akreditovaného certifikačního orgánu.",
          "**Co zákazník konkrétně chce vidět:**"
        ],
        "bullets": [
          "1. Platný certifikát od akreditovaného certifikačního orgánu",
          "2. Scope certifikace — co přesně je certifikováno",
          "3. Prohlášení o aplikovatelnosti (Statement of Applicability / SoA)",
          "4. Postup při incidentech a SLA pro notifikaci zákazníka",
          "5. Výsledky posledního interního auditu nebo penetračního testu"
        ]
      },
      {
        "heading": "ISMS: co to znamená v praxi",
        "body": [
          "ISMS (Information Security Management System) není sada dokumentů v šuplíku. Je to živý systém, který zahrnuje:"
        ],
        "subsections": [
          {
            "heading": "1. Kontext organizace a rozsah",
            "body": [
              "Kdo jste, co děláte, jaká jsou vaše klíčová aktiva a kde jsou hranice ISMS. Rozsah je první a nejdůležitější rozhodnutí — viz níže."
            ]
          },
          {
            "heading": "2. Hodnocení rizik",
            "body": [
              "Systematická identifikace hrozeb a zranitelností, hodnocení jejich pravděpodobnosti a dopadu a rozhodnutí o tom, jak s nimi naložit. Výsledkem je registr rizik a plán zvládání rizik (Risk Treatment Plan)."
            ]
          },
          {
            "heading": "3. Prohlášení o aplikovatelnosti (SoA)",
            "body": [
              "Norma ISO 27001:2022 obsahuje 93 kontrol rozdělených do 4 témat (organizační, personální, fyzická, technologická). SoA je dokument, kde pro každou kontrolu říkáte:",
              "SoA je jeden z nejvíce sledovaných dokumentů při zákaznických auditech. Zákazníci z regulovaného sektoru si ho pravidelně vyžadují a čtou."
            ],
            "bullets": [
              "Aplikujeme ji? (Ano / Ne)",
              "Pokud ano: jak ji máme zavedenou (odkaz na politiku, postup nebo technické opatření)",
              "Pokud ne: proč ji neaplikujeme a zda to je ospravedlnitelné"
            ]
          },
          {
            "heading": "4. Operace a kontroly",
            "body": [
              "Samotné zavedení politiky a opatření, která z hodnocení rizik a SoA vyplývají. Toto tvoří největší část praktické práce."
            ]
          },
          {
            "heading": "5. Měření a hodnocení výkonnosti",
            "body": [
              "Jak víte, že ISMS funguje? Definujte metriky — počet incidentů, průměrná doba záplatování, výsledky phishingových testů, pokrytí školení — a sledujte je."
            ]
          },
          {
            "heading": "6. Interní audit a přezkoumání vedením",
            "body": [
              "Minimálně jednou ročně interní audit ověřující funkčnost ISMS a přezkoumání vedením, které bere výsledky auditu na vědomí a schvaluje zdroje pro zlepšení."
            ]
          },
          {
            "heading": "7. Neustálé zlepšování",
            "body": [
              "ISMS musí reagovat na změny — nové hrozby, nové systémy, nové procesy, výsledky auditů. Dokument z roku 2024 popisující infrastrukturu z roku 2024 nesplňuje svůj účel v roce 2026."
            ]
          }
        ]
      },
      {
        "heading": "Rozsah certifikace: nejdůležitější rozhodnutí pro SaaS",
        "body": [
          "Rozsah určuje, co přesně certifikujete. Je to kritické rozhodnutí — a nejčastější chyba je dělat ho příliš velké.",
          "**Doporučení pro první certifikaci:** Certifikujte jen to, na co se zákazník ptá — tedy systémy, procesy a prostředí, která zpracovávají zákaznická data a poskytují zákaznickou službu.",
          "**Typický scope pro SaaS firmu (10–100 zaměstnanců):**",
          "> „Vývoj, provoz a správa [název produktu] jako SaaS platformy, zahrnující produkční cloudové prostředí, vývojové systémy s přístupem k produkčním datům, správu přístupů a procesy zajišťující bezpečnost a dostupnost platformy. Lokalita: [česká republika / cloud provider region].\"",
          "**Co nemusí být v rozsahu:**",
          "**Zákazník akceptuje omezený scope**, pokud pokrývá to, na čem mu záleží — bezpečnost jeho dat a dostupnost vaší služby."
        ],
        "bullets": [
          "Marketingové systémy bez přístupu k zákaznickým datům",
          "Finance a účetnictví (pokud nezpracovávají zákaznická data)",
          "HR systémy (pokud nemají přístup k zákaznickým systémům)"
        ]
      },
      {
        "heading": "93 kontrol Annex A: co vás čeká (zjednodušeně)",
        "body": [
          "ISO 27001:2022 obsahuje 93 kontrol ve 4 skupinách. Nemusíte zavést všechny — musíte pro každou rozhodnout, zda je relevantní pro váš scope, a zdůvodnit to v SoA.",
          "**Organizační kontroly (37 kontrol)** — Politiky, řízení rizik, správa dodavatelů, řízení incidentů, business continuity, soulad s legislativou.",
          "**Personální kontroly (8 kontrol)** — Prověřování pracovníků, školení, odpovědnosti, disciplinární procesy.",
          "**Fyzické kontroly (14 kontrol)** — Fyzický přístup do prostor a serveroven, ochrana hardwaru, čistý stůl/čistá obrazovka.",
          "**Technologické kontroly (34 kontrol)** — Správa přístupů, MFA, šifrování, správa zranitelností, logování, síťová bezpečnost, bezpečné vývojové prostředí (SDLC), zálohy.",
          "**Pro SaaS firmu provozující cloudovou infrastrukturu** jsou nejrelevantnější technologické a organizační kontroly. Fyzické kontroly jsou méně rozsáhlé, pokud nemáte vlastní serverovnu."
        ]
      },
      {
        "heading": "Realistický harmonogram a náklady",
        "body": [],
        "subsections": [
          {
            "heading": "Fáze 1: Příprava (3–6 měsíců)",
            "body": [
              "**Měsíc 1–2: Základ**",
              "**Měsíc 2–4: Dokumentace**",
              "**Měsíc 3–5: Implementace**",
              "**Měsíc 5–6: Ověření**"
            ],
            "bullets": [
              "Definice rozsahu",
              "Gap analýza oproti požadavkům normy",
              "Sestavení projektového týmu a plánu",
              "Hodnocení rizik a plán zvládání rizik",
              "SoA",
              "Základní politiky (přístupy, zálohy, incidenty, dodavatelé, rizika, fyzická bezpečnost, HR)",
              "Zavedení chybějících technických opatření",
              "Školení zaměstnanců",
              "Nastavení metrik a monitoringu",
              "Interní audit",
              "Přezkoumání vedením",
              "Náprava zjištěných neshod"
            ]
          },
          {
            "heading": "Fáze 2: Certifikační audit (1–2 měsíce)",
            "body": [
              "**Stage 1 audit (dokumentační):** Auditor prochází vaši dokumentaci — zejména SoA, hodnocení rizik a klíčové politiky. Výsledkem je seznam oblastí k doladění před Stage 2.",
              "**Stage 2 audit (certifikační):** Auditor prochází zavedení kontrol v praxi — rozhovory se zaměstnanci, kontrola systémů, ověřování záznamů. Trvá typicky 1–3 dny pro firmu do 50 zaměstnanců."
            ]
          },
          {
            "heading": "Celkový časový výhled",
            "body": [],
            "bullets": [
              "Scénář: S interními kapacitami | Přípravná fáze: 4–6 měsíců | Certifikační audit: 1–2 měsíce | Celkem: 5–8 měsíců",
              "Scénář: S externím konzultantem | Přípravná fáze: 3–5 měsíců | Certifikační audit: 1–2 měsíce | Celkem: 4–7 měsíců",
              "Scénář: Urgentní (max. kapacita) | Přípravná fáze: 2–3 měsíce | Certifikační audit: 1 měsíc | Celkem: 3–4 měsíce"
            ]
          },
          {
            "heading": "Orientační náklady (ČR, 2026)",
            "body": [
              "**Návratnost:** Jeden enterprise tendr v hodnotě 500 000+ Kč ročně, který by bez certifikátu nedopadl, certifikaci zaplatí."
            ],
            "bullets": [
              "Položka: Certifikační audit (Stage 1 + 2) | Orientační náklady: 80 000 – 200 000 Kč",
              "Položka: Dozorový audit (roční) | Orientační náklady: 40 000 – 100 000 Kč",
              "Položka: Recertifikační audit (po 3 letech) | Orientační náklady: 60 000 – 160 000 Kč",
              "Položka: Externí konzultant pro přípravu | Orientační náklady: 150 000 – 400 000 Kč (závisí na stavu firmy)",
              "Položka: ISMS nástroj/platforma (volitelné) | Orientační náklady: 20 000 – 80 000 Kč/rok",
              "Položka: **Celkový 3letý náklad** | Orientační náklady: **~500 000 – 1 200 000 Kč**"
            ]
          }
        ]
      },
      {
        "heading": "Průnik s nZKB: dvojí výhoda",
        "body": [
          "Pokud jste zároveň regulovanou firmou pod nZKB, je ISO 27001 vynikající investice — existuje rozsáhlý překryv mezi požadavky normy a požadavky zákona:",
          "**Praktický závěr:** Pokud budujete ISMS pro ISO 27001, budujete zároveň velkou část toho, co vyžaduje nZKB. Udělejte to jednou, správně a pro oba účely."
        ],
        "table": {
          "headers": [
            "Oblast",
            "ISO 27001",
            "nZKB"
          ],
          "rows": [
            [
              "Hodnocení rizik",
              "Povinné (klauzule 6.1.2)",
              "Povinné (§ bezpečnostní opatření)"
            ],
            [
              "Politiky a dokumentace",
              "Povinné (klauzule 5.2)",
              "Povinné"
            ],
            [
              "Správa přístupů",
              "Annex A 5.15–5.18",
              "Technické opatření"
            ],
            [
              "Incident management",
              "Annex A 5.24–5.28",
              "Povinné (§ 15–16 nZKB)"
            ],
            [
              "Správa dodavatelů",
              "Annex A 5.19–5.23",
              "Povinné pro vyšší režim"
            ],
            [
              "Business continuity",
              "Annex A 5.29–5.30",
              "Organizační opatření"
            ],
            [
              "Školení",
              "Annex A 6.3",
              "Povinné"
            ]
          ]
        }
      },
      {
        "heading": "Co připravit ještě před tím, než kontaktujete certifikační orgán",
        "body": [
          "Tyto základy by měly existovat, jinak první certifikační audit propadne:",
          "✅ **Inventura aktiv** — písemný seznam informačních aktiv v rozsahu certifikace (systémy, data, lidé, prostory) ✅ **Správa přístupů v praxi** — MFA funkční, offboarding proces existuje a je dodržován ✅ **Zálohy fungují a jsou testovány** — zálohy probíhají automaticky, obnova byla alespoň jednou vyzkoušena ✅ **Základní logování** — klíčové systémy logují přístupy a aktivity ✅ **Smlouvy se zpracovateli** — DPA uzavřeny se sub-dodavateli zpracovávajícími zákaznická data ✅ **Odpovědnost za ISMS definována** — někdo ve firmě je jmenován jako vlastník ISMS"
        ]
      },
      {
        "heading": "TL;DR",
        "body": [],
        "bullets": [
          "ISO 27001 je vstupní podmínka pro enterprise SaaS dealy — plánujte ji s předstihem alespoň 6–9 měsíců.",
          "ISMS není sada dokumentů, ale živý systém: hodnocení rizik, SoA, politiky, metriky, interní audity.",
          "Zvolte minimální smysluplný rozsah pro první certifikaci — produkční prostředí + zpracování zákaznických dat.",
          "Překryv s nZKB je velký — budujte ISMS tak, aby sloužil pro oba účely.",
          "SoA je dokument, který zákazníci při auditech nejvíce čtou — věnujte mu patřičnou pozornost."
        ]
      }
    ]
  },
  {
    "slug": "vendor-risk-checklist-dodavatele",
    "title": "Vendor risk checklist: co chtít od klíčových dodavatelů",
    "description": "Útok přes dodavatele je jedním z nejčastějších vektorů napadení. nZKB vyžaduje hodnocení bezpečnostně významných dodavatelů. Tady je konkrétní checklist — co požadovat, jak dokumentovat a co dělat, když dodavatel nesplňuje požadavky.",
    "category": "NIS2 / ZoKB",
    "publishedAt": "2026-05-24",
    "readTime": "7 min",
    "author": "Splnit.eu",
    "authorRole": "Redakce Splnit.eu",
    "regulationHref": "https://www.e-sbirka.cz/sb/2025/264",
    "ctaTitle": "Splňte požadavky bez zbytečné byrokracie",
    "ctaBody": "Splnit.eu automatizuje compliance pro NIS2, GDPR, ISO 27001 a EU AI Act. Sledujte svůj stav v reálném čase.",
    "ctaButton": "Začít zdarma",
    "ctaHref": "/early-access",
    "summary": "V únoru 2020 byl napaden dodavatel IT služeb pro americká potrubní centra.",
    "sections": [
      {
        "heading": "Kdo je „bezpečnostně významný dodavatel\"?",
        "body": [
          "Ne každý dodavatel potřebuje bezpečnostní prověření. Zaměřte se na ty, kteří splňují alespoň jedno z následujících:",
          "**Kategorie A — Kritičtí dodavatelé (nejvyšší priorita)**",
          "*Příklady: AWS/Azure/GCP, hosting provider, záložní MSP, poskytel SIEM/SOC, subdodavatel vývoje s přístupem do produkce*",
          "**Kategorie B — Důležití dodavatelé (střední priorita)**",
          "*Příklady: CRM systém, HR platforma, e-mailový provider, VPN provider, nástroje pro videokonference*",
          "**Kategorie C — Standardní dodavatelé (základní prověření)**",
          "*Příklady: tiskárny, kancelářské potřeby, kurýrní služby*",
          "**Pravidlo palce:** Pokud kompromitace nebo výpadek tohoto dodavatele může způsobit bezpečnostní incident na vaší straně nebo u vašich zákazníků — jde o Kategorii A nebo B."
        ],
        "bullets": [
          "Mají přímý přístup k vašim produkčním systémům, síti nebo zákaznickým datům",
          "Poskytují klíčovou část vaší regulované služby (jejich výpadek = výpadek vaší služby)",
          "Zpracovávají osobní data vašich zákazníků nebo zaměstnanců",
          "Jsou cloud provider nebo MSP, na němž vaše infrastruktura stojí",
          "Mají přístup k interním systémům nebo datům, ale ne přímo k produkci nebo zákaznickým datům",
          "Poskytují software, který je součástí vašeho produktového stacku",
          "Zpracovávají interní data firmy (HR, účetnictví, komunikace)",
          "Nemají přístup k citlivým systémům ani datům",
          "Poskytují komoditní produkty nebo služby"
        ]
      },
      {
        "heading": "Co zjistit před podpisem smlouvy — tiered přístup",
        "body": [],
        "subsections": [
          {
            "heading": "Pro Kategorii A (kritičtí dodavatelé)",
            "body": [
              "**Bezpečnostní certifikace a audity**",
              "**Správa přístupů k vašim systémům**",
              "**Incident response a notifikace**",
              "**Kontinuita a dostupnost**",
              "**Sub-zpracovatelé a třetí strany**"
            ],
            "bullets": [
              "[ ] Má dodavatel platnou certifikaci ISO/IEC 27001 nebo SOC 2 Type II? Vyžádejte si certifikát a ověřte jeho platnost a scope.",
              "[ ] Pokud nemá certifikaci: Provádí pravidelné interní nebo externí bezpečnostní audity? Kdy byl poslední, co zjistil a jak byly nalezy řešeny?",
              "[ ] Provádí dodavatel penetrační testy svých systémů? (minimálně ročně). Jste schopni vidět executive summary výsledků?",
              "[ ] Jak jsou spravovány přístupy zaměstnanců dodavatele k vašim systémům nebo datům?",
              "[ ] Je povinné MFA pro přístupy k vašim prostředím?",
              "[ ] Jak rychle jsou odebrány přístupy při odchodu zaměstnance dodavatele?",
              "[ ] Jsou přístupy dodavatele omezeny na minimální nezbytné oprávnění?",
              "[ ] Jsou přístupy dodavatele logovány a auditovány?",
              "[ ] Jaká je smluvní lhůta dodavatele pro nahlášení bezpečnostního incidentu, který se týká vašich dat nebo systémů? (Požadujte maximálně 24–48 hodin)",
              "[ ] Má dodavatel zdokumentovaný incident response plán?",
              "[ ] Na koho konkrétně se obrátit při incidentu? (jméno, telefon, e-mail, ne jen obecná adresa)",
              "[ ] Jaké jsou garantované SLA pro dostupnost služby? (uptime, RTO, RPO)",
              "[ ] Kde jsou zálohy uloženy a jak jsou chráněny?",
              "[ ] Existuje plán kontinuity činností (BCP)? Byl testován?",
              "[ ] Má dodavatel pojištění pro případ kybernetického incidentu?",
              "[ ] Kteří sub-dodavatelé mají přístup k vašim datům nebo systémům?",
              "[ ] Vztahují se na sub-dodavatele stejné bezpečnostní požadavky jako na dodavatele?",
              "[ ] Informuje vás dodavatel o změnách v sub-dodavatelském řetězci?"
            ]
          },
          {
            "heading": "Pro Kategorii B (důležití dodavatelé)",
            "body": [
              "Zkrácená verze s klíčovými body:"
            ],
            "bullets": [
              "[ ] ISO 27001 nebo SOC 2 certifikace, nebo bezpečnostní politika/přehled bezpečnostních opatření",
              "[ ] DPA (smlouva o zpracování osobních údajů), pokud zpracovává osobní data",
              "[ ] Lhůta pro notifikaci incidentu smluvně ukotvena",
              "[ ] Přehled sub-zpracovatelů (pro GDPR účely)",
              "[ ] Kontakt pro bezpečnostní záležitosti"
            ]
          },
          {
            "heading": "Pro Kategorii C (standardní dodavatelé)",
            "body": [],
            "bullets": [
              "[ ] Pokud zpracovává jakákoliv osobní data: DPA"
            ]
          }
        ]
      },
      {
        "heading": "GDPR rozměr: DPA je povinná, ne volitelná",
        "body": [
          "Každý dodavatel, který zpracovává osobní data vaším jménem, je ze zákona váš **zpracovatel** (data processor). Článek 28 GDPR vyžaduje, aby byl vztah smluvně ošetřen formou **Smlouvy o zpracování osobních údajů (DPA)**.",
          "**Co musí DPA obsahovat (Čl. 28 GDPR):**",
          "**Mezinárodní přenosy:** Pokud má dodavatel servery mimo EU/EEA (zejména USA, Indie, Asie), potřebujete navíc právní základ pro přenos dat — standardně standardní smluvní doložky (SCC). U velkých amerických cloudových providerů (AWS, Google, Microsoft) jsou SCC součástí jejich DPA — ale ověřte, že jsou podepsány."
        ],
        "bullets": [
          "Předmět, povahu, účel a dobu zpracování",
          "Typy osobních dat a kategorie subjektů",
          "Povinnosti zpracovatele (mlčenlivost, bezpečnost, pomoc správci)",
          "Pravidla pro zapojení sub-zpracovatelů",
          "Postup při ukončení zpracování (mazání nebo vrácení dat)",
          "Právo správce na audit zpracovatele"
        ]
      },
      {
        "heading": "Vendor risk registr: jak to dokumentovat",
        "body": [
          "Nestačí si odpovědi uložit do e-mailu nebo je mít jen v hlavě. Veďte **vendor risk registr** — strukturovanou evidenci bezpečnostního stavu vašich dodavatelů."
        ],
        "subsections": [
          {
            "heading": "Minimální obsah registru (tabulka)",
            "body": [
              "**Certifikáty, DPA a další dokumenty** ukládejte jako přílohy nebo do sdíleného úložiště s odkazem v registru."
            ],
            "bullets": [
              "Pole: Název dodavatele | Popis: Oficiální název firmy",
              "Pole: Kategorie | Popis: A / B / C",
              "Pole: Popis poskytované služby | Popis: Co přesně dodává a k čemu má přístup",
              "Pole: Kontakt pro bezpečnostní záležitosti | Popis: Jméno, e-mail, telefon",
              "Pole: Zpracovává osobní data? | Popis: Ano / Ne",
              "Pole: DPA uzavřena? | Popis: Ano / Ne / Datum",
              "Pole: Certifikace | Popis: ISO 27001 / SOC 2 / Žádná / Datum platnosti",
              "Pole: Poslední bezpečnostní hodnocení | Popis: Datum",
              "Pole: Výsledek hodnocení | Popis: Bez nálezu / Nalezy vyřešeny / Otevřené nalezy",
              "Pole: Datum příštího přezkumu | Popis: Datum",
              "Pole: Umístění dat | Popis: EU / Mimo EU / Cloud + region",
              "Pole: Poznámky / rizika | Popis: Volný text"
            ]
          }
        ]
      },
      {
        "heading": "Bezpečnostní požadavky ve smlouvě",
        "body": [
          "Nestačí dodavatele prověřit — bezpečnostní požadavky musejí být součástí smlouvy nebo jejího dodatku. Bez smluvního ukotvení nemáte právní páku, pokud dodavatel selže.",
          "**Minimální smluvní klauzule pro Kategorii A:**",
          "``` Dodavatel se zavazuje:",
          "bezpečnostní audit; kopii certifikátu nebo výsledky auditu poskytne Zákazníkovi na vyžádání do 10 pracovních dnů.",
          "který se týká systémů, dat nebo přístupů Zákazníka, a to do 24 hodin od zjištění incidentu, a to e-mailem na adresu [security@vasefirma.cz].",
          "s přístupem k datům nebo systémům Zákazníka a informovat o jakékoli změně v tomto řetězci s předstihem minimálně 30 dnů.",
          "bezpečnostní audit Dodavatele, s oznámením minimálně 14 dní předem, maximálně jednou ročně.",
          "Zákazníka do 30 dnů; o provedení zaslat písemné potvrzení. ```"
        ],
        "bullets": [
          "1. Udržovat certifikaci ISO/IEC 27001 nebo provádět každoroční",
          "2. Informovat Zákazníka o jakémkoli bezpečnostním incidentu,",
          "3. Na vyžádání poskytnout Zákazníkovi přehled sub-dodavatelů",
          "4. Umožnit Zákazníkovi nebo jím pověřené třetí straně provést",
          "5. Po ukončení smlouvy smazat nebo vrátit veškerá data"
        ]
      },
      {
        "heading": "Co dělat, když dodavatel nesplňuje požadavky",
        "body": [
          "Tři realistické možnosti:"
        ],
        "subsections": [
          {
            "heading": "Možnost 1: Akceptovat riziko s kompenzujícím opatřením",
            "body": [
              "Vhodné pro: menší dodavatel v Kategorii B, kde není certifikace reálně dosažitelná.",
              "Postup:"
            ],
            "bullets": [
              "1. Zdokumentujte, jaké bezpečnostní opatření na vaší straně riziko snižuje (šifrování dat před předáním, omezení přístupu, monitoring)",
              "2. Schvalte akceptaci rizika vedením firmy (podpis)",
              "3. Nastavte datum přezkumu (nejpozději za 12 měsíců)"
            ]
          },
          {
            "heading": "Možnost 2: Vyžádat si plán nápravy",
            "body": [
              "Vhodné pro: dodavatel je ochoten situaci řešit, ale potřebuje čas.",
              "Postup:"
            ],
            "bullets": [
              "1. Definujte konkrétní požadavky a termín splnění",
              "2. Uzavřete písemný závazek dodavatele (e-mail nebo dodatek ke smlouvě)",
              "3. Nastavte kontrolní bod pro ověření splnění"
            ]
          },
          {
            "heading": "Možnost 3: Nahradit dodavatele",
            "body": [
              "Vhodné pro: dodavatel není ochoten bezpečnostní požadavky plnit, nebo riziko je příliš vysoké.",
              "Toto je legitimní a v krajním případě nutný krok. Dokumentujte důvody rozhodnutí — v případě budoucí kontroly nebo incidentu dokazuje, že jste due diligence provedli a na riziko reagovali."
            ]
          }
        ]
      },
      {
        "heading": "Jak provádět pravidelné přezkumy",
        "body": [
          "Vendor risk není jednorázová akce. Nastavte si:",
          "**Roční přezkum všech Kategorie A dodavatelů:**",
          "**Přezkum při každé změně:**",
          "**Přezkum při onboardingu nového dodavatele:**"
        ],
        "bullets": [
          "Ověřte platnost certifikací (certifikát mohl expirovat)",
          "Zkontrolujte, zda se změnil scope jejich služby nebo sub-dodavatelé",
          "Projděte jakékoli incidenty, které u dodavatele nastaly za poslední rok",
          "Dodavatel hlásí bezpečnostní incident",
          "Dodavatel mění sub-dodavatele s přístupem k vašim datům",
          "Měníte rozsah nebo povahu spolupráce s dodavatelem",
          "Dodavatel mění lokaci uložení dat (zejména přesun mimo EU)",
          "Proveďte hodnocení ještě před podpisem smlouvy — ne po něm"
        ]
      },
      {
        "heading": "TL;DR",
        "body": [],
        "bullets": [
          "Kategorizujte dodavatele: Kritičtí (A) → Důležití (B) → Standardní (C). Hloubku prověřování přizpůsobte kategorii.",
          "Pro Kategorii A: certifikace nebo audit, správa přístupů, notifikační lhůta do 24–48 hod, plán kontinuity, přehled sub-dodavatelů.",
          "DPA je zákonná povinnost pro každého dodavatele, který zpracovává osobní data — bez výjimky.",
          "Bezpečnostní požadavky patří do smlouvy — ne jen do interních dokumentů.",
          "Veďte vendor risk registr a přezkumejte ho minimálně ročně a při každé změně.",
          "Pokud dodavatel nesplňuje požadavky: akceptujte s kompenzací, vyžádejte nápravu, nebo ho nahraďte. Vždy dokumentujte rozhodnutí."
        ]
      }
    ]
  },
  {
    "slug": "incident-response-cviceni-tabletop",
    "title": "Incident response cvičení: jak ověřit, že váš plán skutečně funguje",
    "description": "Incident response plán, který nikdo nikdy nezkoušel, je jen dokument. Tabletop cvičení odhalí mezery bezpečně — bez skutečného útoku. Průvodce přípravou, průběhem a tím, co z cvičení vytěžit.",
    "category": "GDPR / NIS2",
    "publishedAt": "2026-05-24",
    "readTime": "8 min",
    "author": "Splnit.eu",
    "authorRole": "Redakce Splnit.eu",
    "ctaTitle": "Splňte požadavky bez zbytečné byrokracie",
    "ctaBody": "Splnit.eu automatizuje compliance pro NIS2, GDPR, ISO 27001 a EU AI Act. Sledujte svůj stav v reálném čase.",
    "ctaButton": "Začít zdarma",
    "ctaHref": "/early-access",
    "summary": "V březnu 2023 hit ransomware středně velký český výrobní podnik.",
    "sections": [
      {
        "heading": "Co je tabletop cvičení a jak se liší od jiných testů",
        "body": [
          "Svět incident response testování má několik úrovní:",
          "Pro MSP a SaaS firmy je **tabletop cvičení** nejlepším poměrem nákladu a přínosu. Nepotřebuje specializované nástroje, nezasahuje do produkce a lze ho zvládnout interně s minimální přípravou.",
          "**Co tabletop NENÍ:** tabletop není hodnocení zaměstnanců. Cílem je najít slabá místa systému — ne ukázat, kdo se připravil, a kdo ne. Toto musíte jasně sdělit na začátku cvičení."
        ],
        "table": {
          "headers": [
            "Typ testu",
            "Popis",
            "Náročnost"
          ],
          "rows": [
            [
              "**Tabletop cvičení**",
              "Strukturovaná diskuze nad fiktivním scénářem",
              "Nízká"
            ],
            [
              "**Walk-through**",
              "Detailní procházení plánu krok za krokem s týmem",
              "Nízká–střední"
            ],
            [
              "**Simulace**",
              "Technická simulace incidentu v izolovaném prostředí",
              "Vysoká"
            ],
            [
              "**Live fire / red team**",
              "Reálný útok v produkčním prostředí",
              "Velmi vysoká"
            ]
          ]
        }
      },
      {
        "heading": "Proč tabletop právě teď — zákonné důvody",
        "body": [],
        "subsections": [
          {
            "heading": "nZKB (zákon č. 264/2025 Sb.)",
            "body": [
              "nZKB vyžaduje zavedení řízení bezpečnostních incidentů jako povinné opatření. Nestačí mít plán — plán musí být funkční. Záznamy z testování plánu jsou důkaz pro NÚKIB, že vaše incident response kapacita je reálná, ne jen papírová."
            ]
          },
          {
            "heading": "GDPR (Nařízení EU 2016/679)",
            "body": [
              "Princip odpovědnosti (accountability) vyžaduje, abyste soulad s GDPR dokázali prokázat. Pokud dojde k incidentu a ÚOOÚ zjistí, že jste plán nikdy netestovali, je to přitěžující okolnost při posuzování pokuty."
            ]
          },
          {
            "heading": "Zákaznické audity",
            "body": [
              "Enterprise zákazníci v bezpečnostních dotaznících pravidelně ptají: „Jak často testujete váš incident response plán?\" Správná odpověď obsahuje datum posledního cvičení a stručný popis výsledků — ne „máme plán napsaný.\""
            ]
          }
        ]
      },
      {
        "heading": "Kdo musí být u stolu",
        "body": [
          "Cvičení je tak dobré, jako jsou lidé, kteří se ho zúčastní. Klíčové role:"
        ],
        "subsections": [
          {
            "heading": "Nezbytní účastníci",
            "body": [
              "**IT/bezpečnostní vedoucí nebo tým** Řeší technickou stránku: detekci, izolaci, forenzní analýzu, obnovu systémů. Musí vědět, kde jsou zálohy, jak izolovat kompromitovaný systém a jak funguje monitoring.",
              "**Vedení firmy (CEO, CTO nebo provozní ředitel)** Rozhoduje o eskalaci, komunikaci vůči zákazníkům, médiím a regulátorům. V reálném incidentu tato osoba rozhoduje o tom, zda firma zaplatí výkupné, kdy informuje zákazníky a zda zapojí forenzní firmu.",
              "**DPO nebo právní zástupce** Posuzuje, zda incident vyžaduje hlášení na ÚOOÚ (GDPR 72 hod) a/nebo NÚKIB (nZKB 24 hod). Musí znát zákonné lhůty a formuláře."
            ]
          },
          {
            "heading": "Doporučení účastníci",
            "body": [
              "**Zákaznická podpora / account management** Přijímají první hlášení od zákazníků a jsou první linií komunikace. Musejí vědět, co smí říct a co ne, a na koho eskalovat.",
              "**HR (pokud incident zahrnuje zaměstnance)** Pokud incident zahrnuje podezření na insider threat nebo nutnost personálních kroků.",
              "**Komunikace / PR (pokud firma komunikuje veřejně)** Pro firmy s veřejným profilem nebo mediálně viditelné.",
              "**Celkový počet:** Pro MSP to typicky znamená 4–8 lidí. Cvičení nad 10 lidmi se stávají těžkopádnými."
            ]
          }
        ]
      },
      {
        "heading": "Jak vybrat scénář: tři doporučené pro MSP",
        "body": [
          "Scénář by měl být realistický pro vaše prostředí, dostatečně komplexní na to, aby testoval více aspektů plánu, ale ne tak technický, aby odstranil netechnické účastníky."
        ],
        "subsections": [
          {
            "heading": "Scénář 1: Ransomware útok",
            "body": [
              "**Kontext pro facilitátora:** Pondělní ráno, 7:45. První zaměstnanec, který přichází do kanceláře, se přihlásí na svůj počítač a uvidí zprávu: „Vaše soubory byly zašifrovány.\" Monitoring systému začíná alertovat na neobvyklé aktivity na fileserveru. Zákazníci hlásí, že SaaS platforma je nedostupná.",
              "**Injekty (postupně přidávané informace):**",
              "*Inject 1 (t+0):* Přijde alert z monitoringu. Fileserver vykazuje neobvyklou aktivitu — masivní čtení a zápis souborů. IT zjistí, že na třech serverech jsou soubory přejmenované s příponou `.locked`.",
              "*Inject 2 (t+30 min):* Záložní server je také zasažen — ransomware měl přístup k zálohovacímu systému. Zálohy z posledních 3 dnů jsou zašifrovány. Nejstarší čistá záloha je stará 5 dní.",
              "*Inject 3 (t+1 hod):* Útočníci tvrdí, že exfiltrovali zákaznická data (součástí útoku bylo i stažení dat před šifrováním). Požadují výkupné 50 000 EUR v BTC.",
              "*Inject 4 (t+2 hod):* Velký zákazník volá CEO přímo a chce vědět, co se děje. Novinář z odborného media píše e-mail s dotazem.",
              "**Klíčové otázky pro diskuzi:**"
            ],
            "bullets": [
              "Kdo rozhoduje o izolaci systémů? Kdy?",
              "Jak rychle zjistíme, která zákaznická data byla možná odcizena?",
              "Platíme výkupné, nebo ne? Kdo rozhoduje?",
              "Co říkáme zákazníkovi do 1 hodiny? Co do 24 hodin?",
              "Musíme hlásit NÚKIB? Do kdy? Kdo to dělá?",
              "Musíme hlásit ÚOOÚ? Do kdy? Kdo to dělá?",
              "Jak obnovujeme provoz z čisté zálohy?"
            ]
          },
          {
            "heading": "Scénář 2: Únik přihlašovacích údajů",
            "body": [
              "**Kontext:** Ve středu odpoledne přijde automatický alert z threat intelligence systému: přihlašovací údaje ve formátu `jmeno@vasefirma.cz` se objevily v dark web databázi zkompromitovaných účtů. Jde o e-mail + heslo jednoho z vývojářů s přístupem do produkčního prostředí.",
              "**Injekty:**",
              "*Inject 1:* Přistoupíte k logům a zjistíte, že z tohoto účtu proběhlo přihlášení v neobvyklou dobu (2:47 v noci) z IP adresy v Rumunsku — 72 hodin zpátky.",
              "*Inject 2:* Dotyčný vývojář tvrdí, že ve 2:47 spal a přihlášení neprovedl. Zkontrolujete jeho přístupy: má admin práva k produkční databázi zákazníků.",
              "*Inject 3:* Logy produkční databáze ukazují, že v onom nočním přihlášení bylo spuštěno několik SELECT dotazů na tabulky zákazníků. Nevíte, zda, a co bylo staženo.",
              "*Inject 4:* Zákazník vám hlásí, že k jeho účtu byl neoprávněný přístup z neznámé lokace.",
              "**Klíčové otázky:**"
            ],
            "bullets": [
              "Co uděláte jako první — změna hesla, nebo zachování přístupu pro forenzní analýzu?",
              "Jak určíte, jaká data mohla být kompromitována?",
              "Kdy musíte hlásit ÚOOÚ? Máte dost informací pro hlášení?",
              "Kdy informujete zákazníky a co jim říkáte?"
            ]
          },
          {
            "heading": "Scénář 3: Incident u cloudového poskytovatele",
            "body": [
              "**Kontext:** V pátek večer pošle váš cloudový provider e-mail: „Zjistili jsme bezpečnostní incident v naší infrastruktuře. Provádíme šetření. Vaše data mohla být dotčena.\" Neposkytují žádné další detaily.",
              "**Injekty:**",
              "*Inject 1:* Provider uvede, že incident se týká části infrastruktury, kde jsou uložena zákaznická data. Nevyloučili únik dat.",
              "*Inject 2:* Zákazníci začínají hlásit podezřelé aktivity ve svých účtech. Zdá se, že útočníci znají interní informace, které mohli získat jen z vašich systémů.",
              "*Inject 3:* Provider potvrdí, že data z vašeho tenantuje mohla být přístupná neoprávněné straně po dobu 6 hodin.",
              "**Klíčové otázky:**"
            ],
            "bullets": [
              "Co řešíte sami a co čekáte od providera?",
              "Kde jsou hranice vaší odpovědnosti vs. providera vůči zákazníkům?",
              "Začíná 72hodinová lhůta GDPR od okamžiku, kdy vás provider informoval, nebo od okamžiku, kdy incident skutečně nastal?"
            ]
          }
        ]
      },
      {
        "heading": "Struktura cvičení (3 hodiny)",
        "body": [],
        "subsections": [
          {
            "heading": "Část 1: Úvod (20 minut)",
            "body": [
              "**Facilitátor vysvětlí:**",
              "**Rozdejte materiály:**"
            ],
            "bullets": [
              "Cíl cvičení: najít slabá místa v systému, ne hodnotit lidi",
              "Pravidla: co padne v místnosti, zůstane v místnosti (pro otevřenou diskuzi)",
              "Formát: facilitátor přidává informace (injekty), tým diskutuje, co by dělal",
              "Vytištěný (nebo sdílený) incident response plán",
              "Kontaktní seznam (NÚKIB, ÚOOÚ, forenzní firma, klíčoví zákazníci)",
              "Zákonné lhůty (GDPR 72h, nZKB 24h) — jako quick reference card"
            ]
          },
          {
            "heading": "Část 2: Scénář ve fázích (80 minut)",
            "body": [
              "Facilitátor čte injekty postupně, s dostatečnými pauzami pro diskuzi. Po každém injektu se tým ptá:",
              "**Facilitátor sleduje a zapisuje:**"
            ],
            "bullets": [
              "Co víme? Co nevíme?",
              "Co musíme udělat jako první?",
              "Kdo to dělá?",
              "Co říkáme — komu, kdy a jak?",
              "Kdo se rozhoduje a na základě čeho",
              "Jak dlouho trvá, než padne rozhodnutí",
              "Kde nastávají nejasnosti nebo diskuze",
              "Kde plan nevede jasně k akci",
              "Chybějící informace, které tým potřeboval a neměl (kontakty, přístupy, dokumenty)"
            ]
          },
          {
            "heading": "Část 3: Hot wash — debriefa (60 minut)",
            "body": [
              "**Nejcennější část cvičení.** Facilitátor projde s týmem:"
            ],
            "bullets": [
              "1. **Co fungovalo dobře?** (Začněte pozitivně — co plan zvládl, co tým věděl)",
              "2. **Kde nastaly nejasnosti?** (Role, rozhodovací pravomoci, komunikační toky)",
              "3. **Co v plánu chybí?** (Kontakty, postupy, šablony)",
              "4. **Co jsme nevěděli, a potřebovali vědět?** (Přístupy k logům, zálohovací architektura, kontakty na NÚKIB/ÚOOÚ)",
              "5. **Konkrétní akční body:** Co kdo udělá do kdy? Přiřaďte zodpovědnosti a termíny."
            ]
          },
          {
            "heading": "Část 4: Dokumentace (20 minut nebo po cvičení)",
            "body": [
              "Sepište **zápis z cvičení:**",
              "``` Datum: [datum] Účastníci: [seznam jmen a rolí] Scénář: [název a stručný popis] Klíčová zjištění:",
              "Otevřené akční body:",
              "Příští cvičení plánováno: [datum] ```",
              "Tento dokument uschovejte. Je to váš důkaz pro auditory a zákazníky."
            ],
            "bullets": [
              "1. [zjištění]",
              "2. [zjištění]",
              "[akce] → zodpovídá [jméno] → do [datum]"
            ]
          }
        ]
      },
      {
        "heading": "Nejčastější zjištění z tabletop cvičení",
        "body": [
          "Na základě typických výsledků — toto jsou věci, které firmy při cvičení nejčastěji zjistí:",
          "**1. Nikdo přesně neví, kdy incident musí hlásit NÚKIB a ÚOOÚ** Lhůty jsou zákonné a krátké. Mějte quick reference kartu s jasně napsanými lhůtami a kontakty.",
          "**2. Zálohy existují, ale obnova nebyla nikdy testována** Záloha, ze které neumíte obnovit data v realistickém čase, vám nepomůže. Testujte obnovu čtvrtletně.",
          "**3. Přístupy k logům chybí nebo jsou nekompletní** Bez logů nelze zjistit, co útočník dělal, jaká data mohla být kompromitována a jak dlouho byl v systému.",
          "**4. Komunikační chaos — kdo říká zákazníkům co** Zákazníci dostávají různé informace od různých lidí. Definujte jednoho „mluvčího\" pro zákaznickou komunikaci při incidentu.",
          "**5. Eskalační cesta není jasná** Kdo rozhoduje, že incident je „závažný\" a vyžaduje eskalaci? Kdo informuje vedení? Bez jasné odpovědi každý čeká, až to udělá někdo jiný."
        ]
      },
      {
        "heading": "Jak zavést pravidelná cvičení",
        "body": [
          "**Frekvence:** Minimálně jednou ročně. Ideálně dvakrát: jedno tabletop v první polovině roku, jedno pokročilejší cvičení (třeba s technickou simulací) ve druhé polovině.",
          "**Po každém skutečném incidentu:** Proveďte post-incident review — ne cvičení, ale reálná debriefa toho, co nastalo, co fungovalo a co ne. Výsledky zapracujte do plánu.",
          "**Různé scénáře:** Každý rok vyberte jiný scénář, abyste testovali různé aspekty plánu.",
          "**Rotace účastníků:** Zapojujte různé lidi. Cvičení by nemělo záviset na přítomnosti konkrétní osoby."
        ]
      },
      {
        "heading": "TL;DR",
        "body": [],
        "bullets": [
          "Incident response plán, který nikdo nezkoušel, selže v reálném incidentu.",
          "Tabletop cvičení je nejefektivnější způsob testování: trvá 3 hodiny, nepotřebuje speciální nástroje a odhalí kritické mezery.",
          "Minimálně 4 role u stolu: IT vedení, CEO/CTO, DPO/právník, zákaznická podpora.",
          "Vyberte realistický scénář pro vaše prostředí: ransomware, únik přihlašovacích údajů nebo incident u dodavatele.",
          "Nejčastější zjištění: neznalost zákonných lhůt, netestované zálohy, chybějící logy, komunikační chaos.",
          "Zápis z cvičení je důkaz pro zákaznické auditory a regulátory. Uschovejte ho."
        ]
      }
    ]
  },
  {
    "slug": "gdpr-checklist-auditovatelna-firma",
    "title": "GDPR checklist pro auditovatelnou firmu",
    "description": "GDPR auditovatelnost není o tom mít všechno perfektní. Je o tom umět doložit, co děláte a proč. Kompletní checklist pro firmy, které se chystají na zákaznický audit, due diligence nebo kontrolu ÚOOÚ.",
    "category": "GDPR",
    "publishedAt": "2026-05-24",
    "readTime": "9 min",
    "author": "Splnit.eu",
    "authorRole": "Redakce Splnit.eu",
    "regulationHref": "https://eur-lex.europa.eu/legal-content/CS/TXT/?uri=CELEX:32016R0679",
    "ctaTitle": "Splňte požadavky bez zbytečné byrokracie",
    "ctaBody": "Splnit.eu automatizuje compliance pro NIS2, GDPR, ISO 27001 a EU AI Act. Sledujte svůj stav v reálném čase.",
    "ctaButton": "Začít zdarma",
    "ctaHref": "/early-access",
    "summary": "Zákazník z finančního sektoru vám poslal 40stránkový bezpečnostní dotazník.",
    "sections": [
      {
        "heading": "Proč na GDPR auditovatelnosti záleží víc než kdy dřív",
        "body": [
          "**Zákaznická poptávka se zvedá.** Enterprise zákazníci, banky, pojišťovny a zdravotnické organizace mají vlastní zákonné povinnosti — a přenášejí je na své dodavatele formou smluvních požadavků a bezpečnostních auditů.",
          "**Sankce jsou reálné.** ÚOOÚ v posledních dvou letech výrazně zpřísnilo dohled. Průměrná pokuta v EU za závažná porušení GDPR se pohybuje v milionech eur. I menší firmy dostávají pokuty v řádu stovek tisíc korun za nedostatečné záznamy nebo chybějící DPA.",
          "**Investoři a M&A.** Při due diligence před investicí nebo akvizicí je GDPR soulad standardně prověřovaná oblast. Chybějící dokumentace nebo záznamy o incidentech mohou transakci zkomplikovat nebo snížit valuaci."
        ]
      },
      {
        "heading": "Oblast 1: Záznamy o zpracovatelských činnostech (ROPA)",
        "body": [
          "ROPA (Records of Processing Activities) je základní dokument GDPR compliance. Jde o strukturovaný přehled toho, jak a proč vaše firma zpracovává osobní data. Povinnost vyplývá z článku 30 GDPR.",
          "**Kdo musí mít ROPA:**",
          "**Co ROPA musí obsahovat pro každou zpracovatelskou činnost:**",
          "**Nejčastější chyby v ROPA:**",
          "**Praktický postup pro aktualizaci ROPA:**"
        ],
        "bullets": [
          "Organizace s 250 nebo více zaměstnanci — bez výjimky",
          "Organizace s méně než 250 zaměstnanci, jejichž zpracování není pouze příležitostné — v praxi to platí pro jakoukoli firmu, která vede databázi zákazníků, zaměstnanců nebo uživatelů",
          "ROPA z roku 2019 nebo 2020 — neodpovídá aktuálním systémům a dodavatelům. ROPA musí být živý dokument.",
          "Chybějící zpracovatelské činnosti — firmy dokumentují zákaznická data, ale zapomínají na zaměstnance (mzdy, docházka, nábor), webovou analytiku, e-mailový marketing nebo CRM.",
          "Nespecifikované právní základy — „oprávněný zájem\" není dostatečný právní základ, pokud není doplněn LIA (Legitimate Interest Assessment).",
          "1. Projděte všechny systémy, které ve firmě používáte",
          "2. Pro každý systém zjistěte: jaká osobní data zpracovává a proč",
          "3. Identifikujte právní základ pro každé zpracování",
          "4. Zjistěte, kdo je zpracovatelem (cloud provider, SaaS vendor) — ti potřebují DPA",
          "5. Aktualizujte ROPA — a nastavte si roční revizi + revizi při každé nové systémové změně"
        ],
        "table": {
          "headers": [
            "Pole",
            "Příklad"
          ],
          "rows": [
            [
              "Název zpracovatelské činnosti",
              "Správa zákaznických účtů"
            ],
            [
              "Účel zpracování",
              "Poskytování SaaS platformy, fakturace"
            ],
            [
              "Právní základ",
              "Plnění smlouvy (čl. 6(1)(b) GDPR)"
            ],
            [
              "Kategorie subjektů",
              "Firemní zákazníci a jejich zaměstnanci"
            ],
            [
              "Kategorie osobních dat",
              "Jméno, e-mail, telefon, IP adresa, log aktivit"
            ],
            [
              "Příjemci / zpracovatelé",
              "AWS (hosting), Stripe (platby), Intercom (podpora)"
            ],
            [
              "Přenosy mimo EU/EEA",
              "AWS us-east-1 — základ: SCC + DPA"
            ],
            [
              "Lhůta pro výmaz",
              "3 roky po ukončení smlouvy"
            ],
            [
              "Technická a org. opatření",
              "Šifrování, MFA, zálohy, přístupová kontrola"
            ]
          ]
        }
      },
      {
        "heading": "Oblast 2: Smlouvy se zpracovateli (DPA)",
        "body": [
          "Každý dodavatel (SaaS, cloud, outsourcing), který zpracovává osobní data vaším jménem, je **zpracovatel** dle GDPR. Zákon vyžaduje, aby byl tento vztah ošetřen formální smlouvou — DPA (Data Processing Agreement) dle článku 28 GDPR.",
          "**DPA není optional** — je to zákonná povinnost. Zpracování bez DPA je samo o sobě porušením GDPR.",
          "**Povinný obsah DPA (čl. 28 GDPR):**",
          "**Přehled typických zpracovatelů SaaS firmy a jejich DPA:**",
          "**Mezinárodní přenosy:** Pokud má zpracovatel servery mimo EU/EEA, musíte mít právní základ pro přenos. Nejčastěji jde o Standardní smluvní doložky (SCC) dle rozhodnutí EU 2021/914. U velkých amerických providerů jsou SCC obvykle součástí DPA — ale ověřte, že jsou aktuální verze (po Schrems II a novém rozhodnutí o přiměřenosti pro USA z roku 2023)."
        ],
        "bullets": [
          "1. Zpracovatel zpracovává data pouze na základě dokumentovaných pokynů správce",
          "2. Povinnost mlčenlivosti pro všechny osoby s přístupem k datům",
          "3. Povinnost přijmout technická a organizační opatření (čl. 32 GDPR)",
          "4. Pravidla pro zapojení sub-zpracovatelů (buď konkrétní souhlas, nebo obecný souhlas s právem správce vznést námitku)",
          "5. Pomoc správci při plnění práv subjektů údajů",
          "6. Pomoc správci při hlášení incidentů a DPIA",
          "7. Výmaz nebo vrácení dat po ukončení zpracování",
          "8. Poskytnutí veškerých informací potřebných k prokázání souladu + umožnění auditů"
        ],
        "table": {
          "headers": [
            "Dodavatel",
            "Typ zpracování",
            "DPA dostupné"
          ],
          "rows": [
            [
              "AWS / Google Cloud / Azure",
              "Hosting, storage",
              "Ano — v konzoli nebo na webu"
            ],
            [
              "Stripe / GoPay",
              "Platby",
              "Ano — v podmínkách"
            ],
            [
              "HubSpot / Salesforce",
              "CRM",
              "Ano — na vyžádání nebo online"
            ],
            [
              "Intercom / Zendesk",
              "Zákaznická podpora",
              "Ano — na webu"
            ],
            [
              "Google Analytics 4",
              "Webová analytika",
              "Ano — v Google Admin"
            ],
            [
              "HR systém",
              "Personalistika",
              "Záleží na systému — vyžádejte si"
            ]
          ]
        }
      },
      {
        "heading": "Oblast 3: Práva subjektů údajů",
        "body": [
          "GDPR dává fyzickým osobám rozsáhlá práva ohledně jejich osobních dat. Vaše firma musí mít procesy, které umožňují tato práva vykonávat."
        ],
        "subsections": [
          {
            "heading": "Přehled práv a co musíte mít připraveno",
            "body": [
              "**Právo na přístup (čl. 15)** Osoba může požádat o kopii všech osobních dat, která o ní zpracováváte. → Musíte být schopni tato data exportovat ze všech relevantních systémů ve srozumitelném formátu.",
              "**Právo na výmaz (čl. 17) — „právo být zapomenut\"** Osoba může požádat o smazání svých dat, pokud není důvod pro jejich další zpracování. → Musíte vědět, ve kterých systémech jsou data osoby uložena — a z každého je umět smazat. To zahrnuje zálohy (kde je přiměřená lhůta), logy a archívy.",
              "**Právo na opravu (čl. 16)** Osoba může požádat o opravu nepřesných dat.",
              "**Právo na přenositelnost (čl. 20)** Pokud je právním základem souhlas nebo smlouva — osoba může požádat o data ve strojově čitelném formátu (CSV, JSON).",
              "**Právo vznést námitku (čl. 21)** Proti zpracování na základě oprávněného zájmu nebo pro účely přímého marketingu.",
              "**Právo nebýt předmětem automatizovaného rozhodování (čl. 22)** Pokud o osobě rozhoduje algoritmus s právním nebo jinak závažným dopadem, má právo na lidský přezkum."
            ]
          },
          {
            "heading": "Procesní požadavky pro DSAR (Data Subject Access Request)",
            "body": [
              "**Praktický test:** Zadejte si sami (nebo pověřte kolegu) fiktivní žádost o výmaz testovací osoby. Kolik systémů musíte kontaktovat? Jak dlouho to trvá? Kde jsou mezery?"
            ],
            "bullets": [
              "[ ] Definovaný kanál pro přijímání žádostí (e-mail, formulář, písemně)",
              "[ ] Proces ověření totožnosti žadatele (nechcete poskytnout data nesprávné osobě)",
              "[ ] Lhůta: **1 měsíc** od přijetí žádosti (lze prodloužit o 2 měsíce při složitosti, s oznámením)",
              "[ ] Bezplatné zpracování (výjimka: zjevně neopodstatněné nebo opakující se žádosti)",
              "[ ] Záznam o každé přijaté a vyřízené žádosti (datum, typ žádosti, způsob vyřízení)"
            ]
          }
        ]
      },
      {
        "heading": "Oblast 4: Posouzení vlivu na ochranu osobních údajů (DPIA)",
        "body": [
          "DPIA (Data Protection Impact Assessment) je povinné posouzení rizik pro zpracování, které pravděpodobně představuje **vysoké riziko** pro práva a svobody fyzických osob (čl. 35 GDPR).",
          "**Kdy DPIA provádět:**",
          "DPIA je povinná, pokud zpracování splňuje alespoň dvě ze tří kritérií:",
          "**Co DPIA musí obsahovat:**",
          "**Konzultace s ÚOOÚ:** Pokud DPIA odhalí vysoké reziduální riziko, které nelze přijatelně snížit, musíte záměr konzultovat s ÚOOÚ před zahájením zpracování."
        ],
        "bullets": [
          "1. **Hodnocení nebo skórování** (profilování, predikce chování, kreditní skórování)",
          "2. **Automatizované rozhodování s právním dopadem** (přijímání nebo odmítání žádostí, algoritmické hodnocení)",
          "3. **Systematické monitorování** (sledování zaměstnanců, monitoring e-mailů nebo polohy)",
          "4. **Citlivé kategorie dat** (zdravotní data, biometrika, etnický původ, politické názory)",
          "5. **Rozsáhlé zpracování** (miliony subjektů nebo datové kategorie ve velkém rozsahu)",
          "6. **Inovativní technologie** (AI, IoT, nové způsoby zpracování)",
          "Popis a účel zpracování",
          "Hodnocení nezbytnosti a přiměřenosti",
          "Hodnocení rizik pro subjekty údajů",
          "Opatření ke snížení rizik",
          "Závěr: je riziko přijatelné, nebo je nutná konzultace s ÚOOÚ?"
        ]
      },
      {
        "heading": "Oblast 5: Hlášení incidentů v 72 hodinách",
        "body": [
          "Pokud dojde k porušení zabezpečení osobních dat (security breach), máte **72 hodin** na hlášení na ÚOOÚ — pokud incident pravděpodobně představuje riziko pro práva a svobody fyzických osob (čl. 33 GDPR)."
        ],
        "subsections": [
          {
            "heading": "Co je porušení zabezpečení osobních dat?",
            "body": [
              "Jde o jakékoli porušení bezpečnosti, které vede k náhodnému nebo protiprávnímu:",
              "**Příklady:**"
            ],
            "bullets": [
              "Zničení, ztrátě nebo změně osobních dat",
              "Neoprávněnému zpřístupnění nebo přístupu k osobním datům",
              "Ransomware útok, který zašifroval databázi zákazníků",
              "Chybně zaslaný e-mail s osobními daty jiné osobě (i jeden e-mail!)",
              "Únik přihlašovacích údajů s přístupem k zákaznickým datům",
              "Ztráta nebo krádež notebooku s nešifrovanými daty",
              "Omylem zpřístupněné S3 bucket s osobními daty"
            ]
          },
          {
            "heading": "Kdy se hlásit nemusí?",
            "body": [
              "Hlášení na ÚOOÚ není nutné, pokud incident **pravděpodobně nepředstavuje riziko** pro práva a svobody fyzických osob. Ale: vždy musíte incident **interně zdokumentovat** — bez výjimky."
            ]
          },
          {
            "heading": "Jak 72hodinová lhůta funguje v praxi",
            "body": [
              "Lhůta začíná od okamžiku, kdy se správce o incidentu **dozví** — ne od okamžiku, kdy incident nastal.",
              "72 hodin je krátká doba. To znamená:"
            ],
            "bullets": [
              "V pátek večer přijde ransomware → do pondělního rána musíte mít hlášení podáno (nebo být schopni doložit, že incident nereprezentuje riziko)",
              "Víkend lhůtu nestaví"
            ]
          },
          {
            "heading": "Co musí hlášení obsahovat (čl. 33(3) GDPR)",
            "body": [
              "**Pozor:** Hlášení lze podat i částečně a doplnit — pokud v 72 hodinách nemáte všechny informace, podejte, co máte, a doplňte co nejdříve."
            ],
            "bullets": [
              "Povaha porušení (jak k němu došlo)",
              "Kategorie a přibližný počet dotčených subjektů",
              "Kategorie a přibližný počet dotčených záznamů",
              "Jméno a kontaktní údaje DPO nebo jiné kontaktní osoby",
              "Pravděpodobné důsledky porušení",
              "Přijatá nebo plánovaná opatření k řešení"
            ]
          },
          {
            "heading": "Kde podat hlášení",
            "body": [
              "Hlášení se podává elektronicky na ÚOOÚ prostřednictvím formuláře dostupného na stránkách úřadu (uoou.cz). Ujistěte se, že váš DPO nebo zodpovědná osoba formulář zná ještě před tím, než incident nastane."
            ]
          },
          {
            "heading": "Informování subjektů (čl. 34 GDPR)",
            "body": [
              "Pokud incident pravděpodobně představuje **vysoké riziko** pro subjekty (úniky hesel, zdravotních dat, finančních informací), musíte informovat **přímo dotčené osoby** bez zbytečného odkladu. Výjimka: pokud jste implementovali opatření, která vysoké riziko eliminují (šifrování — dotčené šifrované soubory bez klíče nepředstavují riziko)."
            ]
          }
        ]
      },
      {
        "heading": "Oblast 6: Dokumentace jako zákonný požadavek (accountability)",
        "body": [
          "GDPR v článku 5(2) stanoví princip odpovědnosti (accountability): správce musí být schopen **doložit** soulad s GDPR — nestačí jen soulad existovat."
        ],
        "subsections": [
          {
            "heading": "Dokumenty, které musíte mít a uchovávat",
            "body": [],
            "bullets": [
              "Dokument: ROPA | Účel: Přehled zpracovatelských činností | Kde uchovávat: Interní systém, aktualizovaný",
              "Dokument: DPA se všemi zpracovateli | Účel: Zákonný základ zpracování přes 3. strany | Kde uchovávat: Archív smluv",
              "Dokument: Záznamy o incidentech | Účel: Povinné i pro nehláštěné incidenty | Kde uchovávat: Bezpečné úložiště",
              "Dokument: Záznamy o DSAR | Účel: Přijatá a vyřízená práva subjektů | Kde uchovávat: Archív, minimálně 3 roky",
              "Dokument: DPIA (kde relevantní) | Účel: Hodnocení rizika pro vysokorizikové zpracování | Kde uchovávat: Interní systém",
              "Dokument: Záznamy o souhlasech | Účel: Pokud je souhlas právním základem | Kde uchovávat: Systém, ze kterého lze dohledat",
              "Dokument: Záznamy o školení | Účel: Kdo byl proškolen a kdy | Kde uchovávat: HR systém nebo interní evidence",
              "Dokument: Politika ochrany osobních dat (interní) | Účel: Interní pravidla, ne jen web. zásady | Kde uchovávat: Intranet / interní dokumentace"
            ]
          },
          {
            "heading": "Jak reagovat na zákaznický audit",
            "body": [
              "Enterprise zákazník typicky žádá:",
              "Mějte tyto dokumenty dostupné a aktuální — ne jako 80stránkový PDF, ale jako strukturovaný přehled, který zaměstnatelný security officer zákazníka přečte za 20 minut."
            ],
            "bullets": [
              "1. **Přehled zpracování jeho dat** — výtah z ROPA pro relevantní činnosti",
              "2. **DPA** — máte ji připravenou? Odpovídá aktuálnímu zpracování?",
              "3. **Přehled sub-zpracovatelů** — kdo má přístup k jejich datům kromě vás",
              "4. **Technická a organizační opatření** — stručný popis: šifrování, přístupy, zálohy, monitoring",
              "5. **Postup při incidentu** — jak a kdy je informujete, pokud dojde k incidentu",
              "6. **Certifikace** — ISO 27001 nebo ekvivalentní potvrzení o bezpečnostní úrovni"
            ]
          }
        ]
      },
      {
        "heading": "Quick checklist — kde jste teď",
        "body": [
          "Projděte tento seznam a označte stav každé položky:"
        ],
        "subsections": [
          {
            "heading": "ROPA",
            "body": [],
            "bullets": [
              "[ ] ROPA existuje a pokrývá všechny zpracovatelské činnosti (zákazníci, zaměstnanci, web, marketing)",
              "[ ] ROPA byla aktualizována v posledních 12 měsících",
              "[ ] Každá zpracovatelská činnost má definovaný právní základ",
              "[ ] Jsou identifikovány všechny přenosy dat mimo EU/EEA a jejich právní základ"
            ]
          },
          {
            "heading": "DPA",
            "body": [],
            "bullets": [
              "[ ] DPA je uzavřena se všemi zpracovateli (cloud, CRM, HR, analytika, platby, zákaznická podpora)",
              "[ ] DPA jsou aktuální a odpovídají skutečnému zpracování",
              "[ ] Pro přenosy mimo EU/EEA jsou uzavřeny SCC (nebo jiný mechanismus)"
            ]
          },
          {
            "heading": "Práva subjektů",
            "body": [],
            "bullets": [
              "[ ] Existuje definovaný proces pro přijímání a vyřizování žádostí (DSAR)",
              "[ ] Lhůta 1 měsíce je reálně splnitelná (víte, kde ve všech systémech jsou data)",
              "[ ] Záznamy o přijatých žádostech jsou vedeny"
            ]
          },
          {
            "heading": "DPIA",
            "body": [],
            "bullets": [
              "[ ] Identifikovali jste zpracování, která vyžadují DPIA",
              "[ ] DPIA byly provedeny a jsou zdokumentovány"
            ]
          },
          {
            "heading": "Incidenty",
            "body": [],
            "bullets": [
              "[ ] Existuje interní proces pro detekci a klasifikaci incidentů",
              "[ ] Zodpovědná osoba zná formulář pro hlášení na ÚOOÚ a lhůtu 72 hodin",
              "[ ] Záznamy o všech incidentech (i nehláštěných) jsou vedeny"
            ]
          },
          {
            "heading": "Dokumentace",
            "body": [],
            "bullets": [
              "[ ] Záznamy o školení zaměstnanců existují (kdo, kdy, co)",
              "[ ] Interní politika ochrany osobních dat (ne jen webová zásada) existuje a je dostupná zaměstnancům"
            ]
          }
        ]
      },
      {
        "heading": "TL;DR",
        "body": [],
        "bullets": [
          "GDPR auditovatelnost = schopnost doložit, co děláte a proč. Dokumentace je zákonný požadavek, ne volba.",
          "Základ: aktuální ROPA + DPA se všemi zpracovateli + záznamy o incidentech a DSAR.",
          "72 hodinová lhůta pro hlášení incidentu je krátká — mějte postup a kontakty připraveny ještě před incidentem.",
          "Zákaznické audity testují totéž, co ÚOOÚ — mít jeden dobře zdokumentovaný systém slouží pro oba účely.",
          "Jednou ročně projděte ROPA a DPA — technické prostředí a dodavatelé se mění, dokumentace musí odpovídat realitě."
        ]
      }
    ]
  }
];

const importedMspBlogPosts: BlogPost[] = [
  {
    slug: "msp-regulovana-sluzba-nzkb-povinnosti",
    title: "MSP jako regulovaná služba: co přesně vás povinuje nZKB",
    description: "Mnoho MSP neví, jestli se na ně nZKB vztahuje — a pokud ano, v jakém rozsahu. Tady je jasná odpověď: které služby spouští regulaci, jaký režim vás čeká a co to znamená v praxi.",
    category: "ZoKB / NIS2",
    publishedAt: "2026-05-24",
    readTime: "8 min",
    author: "Splnit.eu",
    authorRole: "Redakce Splnit.eu",
    regulationHref: "https://www.e-sbirka.cz/sb/2025/264",
    ctaTitle: "Splňte požadavky bez zbytečné byrokracie",
    ctaBody: "Splnit.eu automatizuje compliance pro NIS2, GDPR, ISO 27001 a EU AI Act. Sledujte svůj stav v reálném čase.",
    ctaButton: "Začít zdarma",
    ctaHref: "/early-access",
    summary: "Zákon o kybernetické bezpečnosti (nZKB, zákon č. 264/2025 Sb.) se nevztahuje na každou IT firmu automaticky. Ale pro MSP — poskytovatele spravovaných IT služeb — je situace specifická: pravděpodobnost, že alespoň část vašich služeb spouští regulaci, je vysoká. A přitom spousta MSP stále neví,...",
    sections: [
      {
        heading: "Proč MSP musí nZKB věnovat pozornost víc než jiné firmy",
        body: [
          "MSP je v unikátní pozici: spravujete IT infrastrukturu, sítě a systémy pro jiné firmy. Mnohé z vašich zákazníků jsou samy regulovanými subjekty — ať už pod nZKB, GDPR nebo sektorovými předpisy. Pokud dojde k incidentu u vás nebo skrz váš přístup k zákazníkovi, dopad se šíří dál.",
          "To je přesně typ rizika, který nZKB sleduje."
        ]
      },
      {
        heading: "Které MSP služby spouštějí regulaci",
        body: [
          "nZKB reguluje tzv. regulované služby — tedy konkrétní typy digitálních nebo síťových služeb, jejichž narušení by mělo závažný dopad. Pro MSP jsou nejrelevantnější tyto kategorie:"
        ],
        subsections: [
          {
            heading: "Poskytovatelé spravovaných služeb (Managed Service Providers)",
            body: [
              "Pokud spravujete IT infrastrukturu, sítě, servery nebo bezpečnostní systémy pro zákazníky — a děláte to jako svou hlavní službu — jste pravděpodobně poskytovatelem spravovaných služeb ve smyslu nZKB.",
              "Klíčové znaky:"
            ],
            bullets: [
              "Vzdálená správa IT systémů zákazníka",
              "Správa sítí, firewallu, VPN nebo koncových zařízení",
              "Provoz nebo monitorování bezpečnostní infrastruktury (SIEM, SOC)",
              "Poskytování zálohovacích nebo DR služeb jako spravované služby"
            ]
          },
          {
            heading: "Poskytovatelé cloudových služeb",
            body: [
              "Pokud provozujete vlastní cloudovou platformu nebo infrastructure-as-a-service pro zákazníky — IaaS, PaaS nebo privátní cloud — jste poskytovatelem cloudových služeb pod nZKB."
            ]
          },
          {
            heading: "Poskytovatelé datových center",
            body: [
              "Pokud provozujete fyzické nebo virtuální datové centrum jako komerční službu."
            ]
          },
          {
            heading: "Poskytovatelé spravovaných bezpečnostních služeb (MSSP)",
            body: [
              "SOC, monitoring, správa SIEM, incident response jako služba — tyto aktivity jsou pod přímou regulací."
            ]
          }
        ]
      },
      {
        heading: "Jak zjistit, jestli konkrétně vy jste regulovaní",
        body: [
          "nZKB nereguluje všechny MSP plošně — závisí na velikosti a dopadu vašich služeb. Projděte si tyto otázky:",
          "Otázka 1: Poskytujete některou z výše uvedených služeb jako svou hlavní podnikatelskou aktivitu? Pokud jen příležitostně pomáháte zákazníkovi s IT — nejste regulováni. Pokud je to vaše byznys model — pravděpodobně ano.",
          "Otázka 2: Kolik zákazníků spravujete a jak velké jsou? nZKB pracuje s prahovou hodnotou dopadu. Čím více zákazníků a čím větší jsou, tím spíše jste nad prahem regulace.",
          "Otázka 3: Jsou vaši zákazníci sami regulovanými subjekty? Pokud spravujete IT pro banky, nemocnice, energetické firmy nebo velké průmyslové podniky — váš dopad na jejich bezpečnost je přímý.",
          "Otázka 4: Provedli jste samoidentifikaci přes Portál NÚKIB? nZKB vyžaduje samoidentifikaci. Pokud jste tak ještě neučinili, začněte tam — portál vás provede tím, zda a jak se na vás zákon vztahuje."
        ]
      },
      {
        heading: "Nižší vs. vyšší režim: co to pro MSP znamená",
        body: [
          "Pokud jste regulovaní, zákon vám přiřadí jeden ze dvou režimů:"
        ],
        subsections: [
          {
            heading: "Nižší režim (important entities)",
            body: [
              "Typicky zde padají: menší MSP s regionálním záběrem, MSP spravující převážně nekritické zákazníky"
            ],
            bullets: [
              "13 bezpečnostních opatření dle vyhl. č. 410/2025 Sb.",
              "Incidenty hlásíte Národnímu CERT",
              "Méně přísné požadavky na dokumentaci a technická opatření"
            ]
          },
          {
            heading: "Vyšší režim (essential entities)",
            body: [
              "Typicky zde padají: MSSP, MSP spravující kritickou infrastrukturu, MSP s velkým počtem regulovaných zákazníků",
              "Důležité: Pokud máte jednu službu v nižším a jednu ve vyšším režimu, vyšší režim platí pro celou organizaci."
            ],
            bullets: [
              "25 bezpečnostních opatření dle vyhl. č. 409/2025 Sb.",
              "Incidenty hlásíte přímo NÚKIB",
              "Přísnější požadavky: hodnocení dodavatelů, kontinuita, interní audit",
              "Výstupní audit po zavedení opatření"
            ]
          }
        ]
      },
      {
        heading: "Co vás čeká, pokud jste regulovaní: přehled povinností",
        body: [],
        table: {
          headers: [
            "Povinnost",
            "Termín"
          ],
          rows: [
            [
              "Samoidentifikace a registrace regulované služby",
              "Do 60 dnů od naplnění kritérií"
            ],
            [
              "Nahlášení kontaktních a doplňujících údajů",
              "Do 30 dnů od rozhodnutí NÚKIB"
            ],
            [
              "Stanovení rozsahu řízení kyberbezpečnosti",
              "Co nejdříve po registraci"
            ],
            [
              "Zavedení bezpečnostních opatření",
              "Do 12 měsíců od potvrzení registrace"
            ],
            [
              "Hlášení kybernetických incidentů",
              "Od 12 měsíců po potvrzení registrace"
            ],
            [
              "Provádění protiopatření NÚKIB",
              "Okamžitě od vydání"
            ]
          ]
        }
      },
      {
        heading: "Specifická výzva MSP: vy jste regulovaní a zároveň pomáháte regulovaným zákazníkům",
        body: [
          "Tady se situace MSP liší od jiných firem. Nejde jen o to, splnit zákon pro sebe. Zákazníci vás budou ptát:",
          "Firma, která na tyto otázky odpovídá sebejistě a s dokumentací v ruce, vyhraje tendry. Firma, která odpovídá „to ještě řešíme,\" je konkurenční nevýhodou sama sobě."
        ],
        bullets: [
          "„Jste vy sami regulovaní pod nZKB?\"",
          "„Jak zabezpečujete přístupy do našich systémů?\"",
          "„Co se stane, pokud dojde k incidentu na vaší straně?\"",
          "„Můžete nám pomoct splnit nZKB?\""
        ]
      },
      {
        heading: "Co dělat jako první krok",
        body: [],
        bullets: [
          "1. Proveďte samoidentifikaci na Portálu NÚKIB — zjistíte, jestli a v jakém režimu jste regulovaní",
          "2. Pokud ano: registrujte regulovanou službu co nejdříve — lhůty běží od naplnění kritérií, ne od okamžiku, kdy se o tom dozvíte",
          "3. Stanovte rozsah řízení KB — klíčové rozhodnutí, které ovlivní náklady na celou implementaci (viz samostatný článek na tomto blogu)",
          "4. Proveďte gap analýzu — zjistěte, co máte a co chybí",
          "5. Informujte zákazníky — transparentnost o vašem compliance stavu je konkurenční výhoda"
        ]
      },
      {
        heading: "TL;DR",
        body: [],
        bullets: [
          "Pokud spravujete IT, sítě nebo bezpečnostní systémy pro zákazníky jako svou hlavní službu, nZKB se na vás pravděpodobně vztahuje.",
          "Samoidentifikace přes Portál NÚKIB je první povinný krok — a zároveň způsob, jak zjistit váš konkrétní režim.",
          "MSP jsou regulovaní jako poskytovatelé spravovaných služeb, cloudových služeb nebo MSSP.",
          "Nižší režim: 13 opatření. Vyšší režim: 25 opatření. Jedno z nich platí pro celou organizaci.",
          "Vaši zákazníci se budou ptát na váš compliance stav — mít jasnou odpověď je byznysová výhoda."
        ]
      }
    ]
  },
  {
    slug: "msp-rozsah-rizeni-kb-nzkb",
    title: "Jak MSP stanoví rozsah řízení KB bez toho, aby zahrnul celou firmu",
    description: "Stanovení rozsahu řízení kyberbezpečnosti je nejdůležitější rozhodnutí po registraci u NÚKIB. Pro MSP je zvlášť složité — spravujete prostředí zákazníků, ne jen vlastní. Jak na to správně.",
    category: "ZoKB / NIS2",
    publishedAt: "2026-05-24",
    readTime: "7 min",
    author: "Splnit.eu",
    authorRole: "Redakce Splnit.eu",
    regulationHref: "https://www.e-sbirka.cz/sb/2025/264",
    ctaTitle: "Splňte požadavky bez zbytečné byrokracie",
    ctaBody: "Splnit.eu automatizuje compliance pro NIS2, GDPR, ISO 27001 a EU AI Act. Sledujte svůj stav v reálném čase.",
    ctaButton: "Začít zdarma",
    ctaHref: "/early-access",
    summary: "Po obdržení rozhodnutí o registraci od NÚKIB přijde chvíle, kdy musíte zodpovědět klíčovou otázku: Na co přesně se opatření vztahují? Pokud rozsah nestanovíte, zákon automaticky předpokládá, že opatření aplikujete na veškerá aktiva celé organizace. Pro firmu s 10 zaměstnanci a jedním produktem...",
    sections: [
      {
        heading: "Proč je rozsah pro MSP složitější než pro jiné firmy",
        body: [
          "Většina firem řídí jen svá vlastní aktiva. MSP řídí:",
          "Právě ten třetí bod je zdroj nejčastějšího zmatku: Patří zákaznická prostředí do vašeho rozsahu?",
          "Krátká odpověď: Patří tam vaše systémy a přístupy, přes které zákaznická prostředí spravujete. Zákaznická prostředí samotná jsou v rozsahu zákazníka, ne vašem — pokud zákazník není součástí vaší regulované služby z pohledu nZKB."
        ],
        bullets: [
          "Vlastní interní infrastrukturu (kancelář, vývojové systémy, interní komunikace)",
          "Vlastní provozní systémy pro dodávku služeb (RMM nástroje, PSA, monitorovací platformy)",
          "Zákaznická prostředí — sítě, servery, koncová zařízení zákazníků, ke kterým máte privilegovaný přístup"
        ]
      },
      {
        heading: "Co do rozsahu MSP patří",
        body: [
          "Rozsah vychází z regulované služby — tedy z toho, co jste ohlásili NÚKIB. Typicky pro MSP zahrnuje:"
        ],
        subsections: [
          {
            heading: "1. Systémy pro dodávku regulované služby",
            body: [
              "Tato aktiva patří do rozsahu bezpodmínečně — kompromitace těchto systémů přímo ohrožuje všechny vaše zákazníky najednou."
            ],
            bullets: [
              "RMM platforma (např. NinjaRMM, ConnectWise, Datto) — přes ni spravujete zákazníky",
              "PSA systém — správa tiketů, SLA, fakturace",
              "Monitoring a alerting systémy",
              "Zálohovací infrastruktura (pokud je součástí spravované služby)",
              "SIEM nebo SOC platforma (pokud provozujete MSSP)"
            ]
          },
          {
            heading: "2. Přístupové systémy a identity management",
            body: [
              "Tyto systémy jsou kritické: útočník, který kompromituje váš přístupový systém, má automaticky přístup ke všem vašim zákazníkům."
            ],
            bullets: [
              "VPN infrastruktura pro vzdálený přístup do zákaznických prostředí",
              "Privileged Access Management (PAM) nebo správa servisních účtů",
              "MFA systémy",
              "Adresářové služby (Active Directory, Entra ID) používané pro přístupy k zákazníkům"
            ]
          },
          {
            heading: "3. Komunikační a orchestrační systémy",
            body: [],
            bullets: [
              "E-mailové systémy používané pro komunikaci se zákazníky a pro automatizované alerty",
              "Skriptovací a automatizační nástroje nasazované do zákaznických prostředí"
            ]
          },
          {
            heading: "4. Lidé s přístupem k výše uvedeným systémům",
            body: [],
            bullets: [
              "Technici a administrátoři s přístupy do zákaznických prostředí",
              "Externisté a subdodavatelé s privilegovanými přístupy",
              "IT administrátoři vašich vlastních systémů"
            ]
          }
        ]
      },
      {
        heading: "Co do rozsahu nemusí patřit",
        body: [
          "Tato aktiva jsou legitimně mimo rozsah, pokud nemají přístup k regulovaným systémům nebo zákaznickým prostředím:",
          "Klíčový test: Mohl by útočník, který kompromituje toto aktivum, dostat se ke zákaznickým prostředím nebo k systémům pro dodávku regulované služby? Pokud ano — patří do rozsahu."
        ],
        bullets: [
          "Marketingové systémy a web",
          "Účetnictví a fakturace (pokud jsou odděleny od PSA s přístupy)",
          "HR systémy",
          "Interní komunikační nástroje zaměstnanců bez přístupu k zákaznickým prostředím",
          "Vývojové systémy (pokud nevyvíjíte nástroje nasazované do zákaznických prostředí)"
        ]
      },
      {
        heading: "Jak rozsah dokumentovat",
        body: [
          "Rozsah musí být formálně zdokumentován — jako interní dokument schválený vedením firmy. Tento dokument je první věc, kterou NÚKIB nebo zákaznický auditor při kontrole vyžaduje."
        ],
        subsections: [
          {
            heading: "Co dokument o rozsahu musí obsahovat",
            body: [
              "1. Definice regulované služby Přesný popis toho, jakou regulovanou službu poskytujete a komu. Příklad:",
              "„Poskytování spravovaných IT služeb zahrnujících vzdálenou správu sítí, serverů a koncových zařízení zákazníků, provoz zálohovací infrastruktury a bezpečnostní monitoring pro zákazníky v segmentu SMB.\"",
              "2. Soupis aktiv v rozsahu Tabulka nebo seznam:",
              "3. Explicitní vyjmutí Vyjmenujte, co je mimo rozsah a proč:",
              "„Z rozsahu jsou vyjmuty: marketingový web, HR systém Bamboo HR (bez přístupu k zákaznickým prostředím), interní Slack workspace zaměstnanců bez technického přístupu.\"",
              "4. Schválení a verze Datum, verze dokumentu, podpis odpovědné osoby (CEO, CTO nebo pověřená osoba kyberbezpečnosti)."
            ],
            bullets: [
              "Typ aktiva: RMM platforma; Konkrétní aktivum: NinjaRMM; Proč je v rozsahu: Přímý přístup ke všem zákaznickým prostředím",
              "Typ aktiva: Přístupový systém; Konkrétní aktivum: Privileged Access Management; Proč je v rozsahu: Správa servisních účtů u zákazníků",
              "Typ aktiva: Identita; Konkrétní aktivum: Azure AD (interní tenant); Proč je v rozsahu: Autentizace techniků do zákaznických prostředí",
              "Typ aktiva: Monitoring; Konkrétní aktivum: Zabbix instance; Proč je v rozsahu: Monitoruje zákaznická prostředí",
              "Typ aktiva: Zálohy; Konkrétní aktivum: Veeam + off-site storage; Proč je v rozsahu: Zálohovací služba zákazníkům"
            ]
          }
        ]
      },
      {
        heading: "Specifický problém MSP: subdodavatelé a technici třetích stran",
        body: [
          "Mnoho MSP využívá externisty nebo subdodavatelské techniky. Pokud mají přístupy do zákaznických prostředí přes vaše systémy — patří do vašeho rozsahu a musejí splňovat vaše bezpečnostní požadavky.",
          "To konkrétně znamená:",
          "Pokud subdodavatel není schopen nebo ochoten tato pravidla splnit — je to bezpečnostní riziko, které musíte zdokumentovat a řešit."
        ],
        bullets: [
          "Musejí mít přidělen individuální přístupový účet (žádné sdílené přihlašovací údaje)",
          "MFA musí být povinné i pro ně",
          "Jejich přístupy musejí být auditovány a logovány",
          "Při ukončení spolupráce musejí být přístupy okamžitě odebrány"
        ]
      },
      {
        heading: "Jak rozsah nezaměnit s odpovědností zákazníka",
        body: [
          "Tady MSP nejčastěji chybují: rozsah vašeho řízení KB neznamená, že přebíráte právní odpovědnost za kybernetickou bezpečnost zákazníka.",
          "Zákazník, který je sám regulovanou entitou pod nZKB, má své vlastní povinnosti. Vy za ně neplníte zákon — vy spravujete systémy, přes které zákazník svůj zákon plní.",
          "Toto rozlišení musí být jasné:"
        ],
        bullets: [
          "Ve smlouvě se zákazníkem",
          "Ve vašich interních dokumentech",
          "V komunikaci se zákazníkem, když se ptá „co za nás vyřídíte\""
        ]
      },
      {
        heading: "Praktický postup: jak rozsah stanovit krok za krokem",
        body: [
          "Krok 1: Vypište všechny systémy, přes které spravujete zákazníky nebo dodáváte regulovanou službu.",
          "Krok 2: Pro každý systém: Mohl by útočník, který ho kompromituje, dostat se k zákaznickým prostředím? → Ano = do rozsahu.",
          "Krok 3: Vypište všechny osoby (interní + externisté) s přístupy k výše uvedeným systémům.",
          "Krok 4: Vypište co je explicitně mimo rozsah — a zdůvodněte proč.",
          "Krok 5: Nechte dokument schválit vedením a naplánujte roční přezkum."
        ]
      },
      {
        heading: "TL;DR",
        body: [],
        bullets: [
          "Bez definovaného rozsahu platí opatření pro celou firmu — pro MSP to může být disproportionálně nákladné.",
          "Do rozsahu patří: RMM, PAM, monitorovací systémy, přístupová infrastruktura, technici s privilegovanými přístupy.",
          "Zákaznická prostředí samotná nejsou ve vašem rozsahu — ale vaše přístupy do nich ano.",
          "Subdodavatelé s přístupy do zákaznických prostředí patří do vašeho rozsahu a musejí splňovat vaše pravidla.",
          "Rozsah zdokumentujte formálně — je to první dokument, který auditor vyžaduje."
        ]
      }
    ]
  },
  {
    slug: "msp-priprava-zakaznicky-audit",
    title: "Co musí mít MSP připraveno před zákaznickým auditem",
    description: "Enterprise zákazníci a regulované organizace auditují své MSP dodavatele čím dál důkladněji. Tady je přesně to, co budou chtít vidět — a jak mít vše připraveno dřív, než přijde dotazník.",
    category: "ZoKB / NIS2",
    publishedAt: "2026-05-24",
    readTime: "7 min",
    author: "Splnit.eu",
    authorRole: "Redakce Splnit.eu",
    regulationHref: "https://www.e-sbirka.cz/sb/2025/264",
    ctaTitle: "Splňte požadavky bez zbytečné byrokracie",
    ctaBody: "Splnit.eu automatizuje compliance pro NIS2, GDPR, ISO 27001 a EU AI Act. Sledujte svůj stav v reálném čase.",
    ctaButton: "Začít zdarma",
    ctaHref: "/early-access",
    summary: "Přišel e-mail od zákazníka: „Před prodloužením smlouvy budeme potřebovat vyplnit bezpečnostní dotazník a doložit dokumentaci.\" Pro MSP, kteří spravují IT zákazníků z regulovaných sektorů — bankovnictví, zdravotnictví, energetika — jsou zákaznické bezpečnostní audity realitou roku 2026. Firmy s...",
    sections: [
      {
        heading: "Co zákaznický audit testuje",
        body: [
          "Zákazník při auditu MSP chce zjistit jednu věc: Pokud dojde k incidentu na vaší straně, jak moc to ohrozí nás?",
          "Z toho vyplývají konkrétní oblasti:"
        ],
        bullets: [
          "1. Jak zabezpečujete přístupy do našich systémů?",
          "2. Co se stane, když váš zaměstnanec nebo subdodavatel způsobí incident?",
          "3. Jak rychle nás informujete, pokud dojde k bezpečnostní události?",
          "4. Máte zavedené kontroly, které to dokazují?",
          "5. Jste sami regulovaní pod nZKB?"
        ]
      },
      {
        heading: "Dokumenty, které auditor nejčastěji žádá",
        body: [],
        subsections: [
          {
            heading: "1. Certifikace nebo bezpečnostní přehled",
            body: [
              "Platný ISO 27001 certifikát nebo SOC 2 Type II zpráva jsou ideální. Pokud certifikaci nemáte, připravte stručný dokument (2–4 strany) popisující vaše klíčová bezpečnostní opatření. Potvrzení o registraci pod nZKB zákazníci z regulovaného sektoru vnímají pozitivně."
            ]
          },
          {
            heading: "2. Přehled správy přístupů do zákaznických prostředí",
            body: [
              "Toto je oblast s největšími obavami zákazníků. Připravte:"
            ],
            bullets: [
              "Politiku řízení přístupů — jak se přístupy udělují, mění a odebírají",
              "Potvrzení povinného MFA pro všechny přístupy do zákaznických prostředí",
              "Popis offboarding procesu — jak rychle jsou odebrány přístupy při odchodu technika",
              "Přehled osob s přístupem k jejich prostředí (seznam rolí nebo jmen)"
            ]
          },
          {
            heading: "3. Smlouva o zpracování osobních údajů (DPA)",
            body: [
              "Pokud přistupujete k systémům se zákaznickými osobními daty, zákazník potřebuje DPA. Mějte připravenou standardní šablonu k podpisu a přehled sub-zpracovatelů s přístupy."
            ]
          },
          {
            heading: "4. Incident response postup a notifikační lhůty",
            body: [
              "Zákazník potřebuje vědět: co děláte při incidentu a jak rychle ho informujete. Smluvně zavažte lhůtu pro notifikaci (doporučeno 24–48 hodin). Připravte zkrácenou verzi incident response plánu a kontaktní list pro bezpečnostní záležitosti."
            ]
          },
          {
            heading: "5. Seznam subdodavatelů s přístupy",
            body: [
              "Kdo kromě vašich zaměstnanců může mít přístup k jejich systémům? Připravte seznam a potvrzení, že na ně uplatňujete stejné bezpečnostní požadavky."
            ]
          },
          {
            heading: "6. Plán kontinuity a SLA",
            body: [
              "Zkrácený BCP, SLA parametry pro dostupnost vaší služby a popis zálohovací architektury s RTO/RPO pro vaše vlastní systémy."
            ]
          }
        ]
      },
      {
        heading: "Audit balíček: jak se připravit jednou a být připraveni vždy",
        body: [
          "Sestavte složku s připravenými dokumenty. Při příchodu dotazníku nebudete hledat — jen zkontrolujete aktuálnost.",
          "Jmenujte jednu zodpovědnou osobu, která dotazníky koordinuje. Bez toho dotazníky uvíznou v e-mailech. Aktualizujte balíček jednou ročně a při každé změně klíčových systémů nebo subdodavatelů."
        ],
        codeBlock: "/audit-balicek\n  /certifikace\n    - ISO-27001-certifikat.pdf nebo bezpecnostni-prehled.pdf\n    - NUKIB-registrace.pdf (pokud relevantní)\n  /pristupy\n    - politika-rizeni-pristupu.pdf\n    - onboarding-offboarding-proces.pdf\n  /gdpr\n    - dpa-sablona.docx\n    - seznam-sub-zpracovatelu.pdf\n  /incident-response\n    - ir-plan-zkraceny.pdf\n    - kontaktni-list-bezpecnost.pdf\n  /kontinuita\n    - bcp-zkraceny.pdf\n    - sla-parametry.pdf"
      },
      {
        heading: "Nejčastější situace, kdy MSP audit nezvládne",
        body: [
          "„Nemáme ISO 27001, zákazník to vyžaduje.\" Krátkodobě: stručný bezpečnostní přehled prokazující zavedené kontroly zákazníci mimo nejpřísnější sektory akceptují. Pro banky a pojišťovny certifikaci potřebujete.",
          "„Zákazník se ptá, kdo má přístup k jejich systémům, a my to nevíme přesně.\" Toto je vážný problém — nejen pro audit, ale pro vaši vlastní bezpečnost. Okamžitě revidujte přístupové účty ve vašem RMM nástroji.",
          "„Nemáme nic zdokumentované — přitom všechno děláme správně.\" Nejčastější situace. Audit neohodnocuje, co děláte — hodnotí, co dokážete doložit."
        ]
      },
      {
        heading: "TL;DR",
        body: [],
        bullets: [
          "Zákaznické bezpečnostní audity MSP jsou v roce 2026 standardem pro regulované sektory.",
          "Klíčové dokumenty: certifikace nebo bezpečnostní přehled, politika přístupů, DPA šablona, IR kontakt, seznam subdodavatelů, plán kontinuity.",
          "Sestavte audit balíček jednou — pak jen aktualizujte. Ušetříte hodiny při každém dotazníku.",
          "Dokumentace je stejně důležitá jako samotná opatření — bez ní audit ani tendr nevyhrajete."
        ]
      }
    ]
  },
  {
    slug: "msp-jak-vysvetlit-nzkb-zakaznikovi",
    title: "Jak MSP vysvětlí nZKB zákazníkovi, který o tom neslyšel",
    description: "Zákazník neví, co je nZKB, proč se ho to týká a co má dělat. Vy to víte — ale jak to vysvětlit srozumitelně, bez strachu a bez toho, abyste přebrali jeho odpovědnost? Průvodce rozhovorem.",
    category: "ZoKB / NIS2",
    publishedAt: "2026-05-24",
    readTime: "7 min",
    author: "Splnit.eu",
    authorRole: "Redakce Splnit.eu",
    regulationHref: "https://www.e-sbirka.cz/sb/2025/264",
    ctaTitle: "Splňte požadavky bez zbytečné byrokracie",
    ctaBody: "Splnit.eu automatizuje compliance pro NIS2, GDPR, ISO 27001 a EU AI Act. Sledujte svůj stav v reálném čase.",
    ctaButton: "Začít zdarma",
    ctaHref: "/early-access",
    summary: "„Co je to nZKB? My přece jen provozujeme e-shop.\" Nebo: „To se týká jen velkých firem, ne?\" Nebo, nejčastěji: mlčení a přesunutí tématu. Většina zákazníků MSP — majitelé středních firem, ředitelé provozu, IT manažeři bez právního zázemí — o nZKB buď neslyšeli, nebo o něm slyšeli a nevědí, co s...",
    sections: [
      {
        heading: "Proč je ten rozhovor důležitý pro vás jako MSP",
        body: [
          "Nejde jen o pomoc zákazníkovi. Jde o váš byznys:",
          "Zákazník, který plní nZKB, potřebuje od vás víc. Bezpečnostní opatření, dokumentaci, monitoring, incident response — to jsou přidané služby, které zákazník bez vašeho vedení sám nevyřeší.",
          "Zákazník, který neplní nZKB a dostane pokutu nebo incident, bude hledat viníka. Pokud jste spravovali jeho IT a neupozornili jste ho na zákonné povinnosti, bude ten rozhovor obtížnější, než byl původní.",
          "Zákazník, který díky vám compliance zvládne, je loajálnější a platí víc. Compliance poradenství a implementace jsou vyšší marže než samotná správa infrastruktury."
        ]
      },
      {
        heading: "Koho se nZKB týká — přehled pro zákazníka",
        body: [
          "Než začnete rozhovor, zjistěte, jestli se zákon na zákazníka vůbec vztahuje. Pokud ano — ve kterém sektoru podniká a jak velký je.",
          "nZKB se vztahuje na firmy v těchto sektorech (výběr nejrelevantnějších pro MSP zákazníky):",
          "Zákazník, který podniká v jiném sektoru a je menší firma — pravděpodobně regulovaný není. Ale ověřte to přes samoidentifikaci na Portálu NÚKIB, ne odhadem."
        ],
        table: {
          headers: [
            "Sektor",
            "Příklady"
          ],
          rows: [
            [
              "Digitální infrastruktura",
              "Cloudoví provideři, datacentra, DNS, CDN"
            ],
            [
              "Digitální služby",
              "E-commerce platformy nad prahem, online tržiště"
            ],
            [
              "Výroba",
              "Výrobci kritických produktů (zdravotnické přístroje, chemikálie, automobily)"
            ],
            [
              "Energie",
              "Elektřina, plyn, teplo, ropa"
            ],
            [
              "Doprava",
              "Letectví, železnice, lodní a silniční doprava"
            ],
            [
              "Zdravotnictví",
              "Nemocnice, laboratoře, farmaceutika"
            ],
            [
              "Vodohospodářství",
              "Pitná voda, odpadní vody"
            ],
            [
              "Veřejná správa",
              "Státní a krajské orgány"
            ],
            [
              "Finance",
              "Banky, pojišťovny, finanční infrastruktura"
            ]
          ]
        }
      },
      {
        heading: "Rámec rozhovoru: čtyři kroky",
        body: [],
        subsections: [
          {
            heading: "Krok 1: Zjistěte, co zákazník ví",
            body: [
              "Nezačínejte přednáškou. Začněte otázkou:",
              "*„Slyšeli jste o novém zákoně o kybernetické bezpečnosti? Víte, jestli se na vás vztahuje?\"*",
              "Odpovědi jsou typicky tři:"
            ],
            bullets: [
              "„Ne, vůbec nevím, co to je\" → jděte na Krok 2",
              "„Slyšeli jsme, ale nevíme, co s tím\" → jděte rovnou na Krok 3",
              "„Ano, řešíme to\" → zjistěte, co konkrétně řeší, a nabídněte pomoc tam, kde mají mezery"
            ]
          },
          {
            heading: "Krok 2: Vysvětlete zákon jednoduše",
            body: [
              "Nepotřebují znát číslo paragrafu. Potřebují pochopit podstatu.",
              "Doporučené znění:",
              "„Od listopadu 2025 platí v Česku zákon o kybernetické bezpečnosti, který vychází z evropské směrnice NIS2. Týká se firem, které poskytují služby nebo provozují systémy, jejichž výpadek by měl závažný dopad na ekonomiku nebo společnost. Pokud do této kategorie patříte, máte povinnost zavést bezpečnostní opatření, hlásit kybernetické incidenty a registrovat se u NÚKIB — Národního úřadu pro kybernetickou bezpečnost. Sankce za neplnění jsou vysoké — až 250 milionů korun.\"",
              "Pak přidejte konkrétnost pro jejich situaci:",
              "„V případě vaší firmy — vy poskytujete [typ služby] zákazníkům z [sektoru]. To znamená, že pravděpodobně regulaci podléháte. Chcete, abychom to společně prověřili?\""
            ]
          },
          {
            heading: "Krok 3: Zjistěte jejich aktuální stav",
            body: [
              "Než cokoliv doporučíte, zjistěte kde jsou. Tři otázky, které vám dají přesný obrázek:",
              "Odpovědi vám ukáží, jestli jsou na začátku (nic neudělali), uprostřed (udělali registraci, neví co dál) nebo blízko cíle (mají základ, chybí doladění)."
            ],
            bullets: [
              "1. *„Provedli jste samoidentifikaci na Portálu NÚKIB? Dostali jste rozhodnutí o registraci?\"*",
              "2. *„Máte nějakou dokumentaci k bezpečnosti — politiky, plány, záznamy?\"*",
              "3. *„Kdo u vás za kybernetickou bezpečnost odpovídá?\"*"
            ]
          },
          {
            heading: "Krok 4: Navrhněte konkrétní první krok — ne celý projekt",
            body: [
              "Zákazník, který právě slyší o nZKB poprvé, nerozhodne o roční compliance zakázce na místě. Navrhněte malý, konkrétní a bezrizikový první krok:",
              "„Jako první bychom mohli společně projít samoidentifikaci na Portálu NÚKIB — zjistíme, jestli a v jakém režimu jste regulovaní. Trvá to hodinu a dáme vám jasnou odpověď na otázku, co musíte řešit a co ne. Chcete to naplánovat?\"",
              "Malý první krok snižuje rozhodovací bariéru a zároveň otevírá dveře k dalším službám."
            ]
          }
        ]
      },
      {
        heading: "Jak reagovat na nejčastější námitky",
        body: [
          "„My jsme malá firma, tohle se nás netýká.\"",
          "„Zákon nereguluje podle velikosti firmy, ale podle typu služby a sektoru. Pokud poskytujete [typ služby] — a vy ano — regulace se na vás může vztahovat i přes menší velikost. Ověřit to přes samoidentifikaci nám zabere hodinu.\"",
          "„To je pro nás příliš složité a drahé.\"",
          "„Záleží na vašem režimu. Firmy v nižším režimu mají 13 opatření — část z nich pravděpodobně už dělají, jen to není zdokumentované. Nejdřív zjistíme, kde jste. Teprve pak budeme mluvit o nákladech.\"",
          "„To vyřeší náš IT tým sám.\"",
          "„Technická opatření váš IT tým zvládne. Ale nZKB vyžaduje také dokumentaci, politiky, formální hodnocení rizik a hlášení incidentů — to je nad rámec běžné IT správy. Právě tam vám můžeme pomoct.\"",
          "„Počkáme, jak to dopadne s ostatními firmami.\"",
          "„Lhůty jsou zákonné a nevztahují se na to, jestli ostatní plní nebo ne. Pokud jste regulovaní a neregistrujete se, sankce mohou přijít bez ohledu na to, co dělají konkurenti. Navíc firmy, které compliance zvládnou dřív, mají výhodu v tendrech.\""
        ]
      },
      {
        heading: "Co zákazníkovi říct o vaší roli — a co ne",
        body: [
          "Říkejte:",
          "Neříkejte:",
          "Toto rozlišení je důležité nejen eticky — je důležité pro váš vlastní právní základ. Viz také článek o tom, jak nabídnout compliance jako službu bez převzetí právní odpovědnosti."
        ],
        bullets: [
          "„Pomůžeme vám s implementací technických opatření\"",
          "„Připravíme dokumentaci a politiky\"",
          "„Budeme monitorovat a hlásit incidenty za vás\"",
          "„Provázíme vás celým procesem registrace a přípravy\"",
          "„Vyřídíme to za vás\" — zákon ukládá povinnosti zákazníkovi, ne vám",
          "„Vy za nic neodpovídáte\" — odpovídá, jen vám může delegovat technické provádění",
          "„Garantujeme soulad s nZKB\" — garanci zákonného souladu nesmíte dávat, pokud nejste certifikovaný právník nebo auditor"
        ]
      },
      {
        heading: "TL;DR",
        body: [],
        bullets: [
          "Zákazník, který o nZKB neslyšel, potřebuje jednoduché vysvětlení, ne přednášku o paragrafech.",
          "Rámec rozhovoru: zjistěte co ví → vysvětlete zákon jednoduše → zmapujte jejich stav → navrhněte malý první krok.",
          "Nejsilnější první krok: „Udělejme spolu samoidentifikaci — hodina práce, jasná odpověď.\"",
          "Mějte připravené odpovědi na typické námitky — zákazník vždy hledá důvod proč čekat.",
          "Jasně rozlišujte, co děláte za zákazníka a za co on sám odpovídá — chrání vás to i zákazníka."
        ]
      }
    ]
  },
  {
    slug: "msp-delegovani-compliance-zakaznik",
    title: "Co zákazník může delegovat na MSP a co musí řešit sám",
    description: "MSP může zákazníkovi s nZKB hodně pomoct — ale ne všechno. Jasná hranice mezi tím, co lze delegovat a co musí zákazník vlastnit sám, chrání obě strany. Praktická mapa odpovědností.",
    category: "ZoKB / NIS2",
    publishedAt: "2026-05-24",
    readTime: "7 min",
    author: "Splnit.eu",
    authorRole: "Redakce Splnit.eu",
    regulationHref: "https://www.e-sbirka.cz/sb/2025/264",
    ctaTitle: "Splňte požadavky bez zbytečné byrokracie",
    ctaBody: "Splnit.eu automatizuje compliance pro NIS2, GDPR, ISO 27001 a EU AI Act. Sledujte svůj stav v reálném čase.",
    ctaButton: "Začít zdarma",
    ctaHref: "/early-access",
    summary: "Zákazník, který zjistí, že podléhá nZKB, se přímo zeptá: „Tak to vyřídíte za nás, ne? Vy přece spravujete naše IT.\" Je to pochopitelná reakce. A odpověď zní: hodně věcí ano — ale ne všechno. nZKB ukládá povinnosti zákazníkovi jako regulované entitě — a část z nich nemůže delegovat na nikoho, ani...",
    sections: [
      {
        heading: "Základní princip: zákazník odpovídá, MSP implementuje",
        body: [
          "nZKB ukládá povinnosti poskytovateli regulované služby — tedy zákazníkovi. NÚKIB nekomunikuje s MSP zákazníka, komunikuje přímo se zákazníkem. Pokutu nedostanete vy — dostane ji zákazník.",
          "To neznamená, že MSP nemůže dělat většinu práce. Ale vždy jde o práci jménem zákazníka a pod jeho dohledem — ne o převzetí jeho zákonné odpovědnosti."
        ]
      },
      {
        heading: "Mapa delegování: co patří kam",
        body: [],
        subsections: [
          {
            heading: "Co zákazník musí vlastnit sám — nelze delegovat",
            body: [
              "Samoidentifikace a registrace u NÚKIB Ohlášení regulované služby musí provést statutární orgán zákazníka nebo jím pověřený zástupce. MSP nemůže udělat toto za zákazníka — může ho provést a navigovat, ale zákazník musí mít aktivní roli.",
              "Pověření zástupce a přístup na Portál NÚKIB Zákazník musí aktivně pověřit osoby, které za firmu jednají s NÚKIB. Toto je zákonný úkon, který vyžaduje identitu a datovou schránku zákazníka.",
              "Odpovědnost vedení za kyberbezpečnost nZKB výslovně stanoví odpovědnost vedoucích osob — členů statutárního orgánu — za zavedení bezpečnostních opatření. Tato odpovědnost je osobní a nepřenosná.",
              "Schválení rozsahu řízení kyberbezpečnosti Dokument definující rozsah musí schválit vedení zákazníka. MSP může dokument připravit — zákazník ho musí schválit a vlastnit.",
              "Hlášení incidentů NÚKIB Hlášení probíhá přes Portál NÚKIB z účtu zákazníka. MSP může připravit podklady a asistovat — zákazník musí hlášení odeslat nebo k tomu výslovně pověřit zástupce.",
              "Rozhodnutí o akceptaci rizik Kde zákazník rozhoduje, že určité riziko akceptuje a nepřijímá opatření — toto rozhodnutí musí formálně učinit a podepsat zákazník, ne MSP."
            ]
          },
          {
            heading: "Co MSP může dělat jménem zákazníka — plně delegovatelné",
            body: [
              "Technická implementace bezpečnostních opatření Zavedení MFA, správa přístupů, nastavení záloh, konfigurace firewallu, patch management, monitoring — toto je jádro MSP práce a plně delegovatelné.",
              "Příprava bezpečnostní dokumentace MSP může připravit politiky, plány, záznamy a šablony. Zákazník je schvaluje a podepisuje — ale psaní a strukturování je práce MSP.",
              "Správa a aktualizace registru aktiv Inventura systémů, dat a procesů v rozsahu řízení KB.",
              "Provádění hodnocení rizik MSP může provést hodnocení, připravit registr rizik a plán zvládání. Zákazník výsledky schvaluje.",
              "Monitoring a alerting Průběžné sledování bezpečnostních událostí, správa SIEM, alerting.",
              "Příprava podkladů pro hlášení incidentů MSP detekuje incident, připraví podklady a návrh hlášení — zákazník odešle nebo MSP odesílá jako pověřený zástupce.",
              "Zálohovací služby a DR Provoz záloh, testování obnovy, disaster recovery plán.",
              "Bezpečnostní školení zaměstnanců zákazníka Organizace a vedení školení, záznamy o účasti.",
              "Vendor management Hodnocení dodavatelů zákazníka, příprava DPA šablon, vedení vendor registru."
            ]
          },
          {
            heading: "Šedá zóna — závisí na smlouvě a dohodě",
            body: [
              "Pověřená osoba kyberbezpečnosti nZKB nevyžaduje, aby to byl zaměstnanec zákazníka — může to být externě zajištěno. MSP nebo konzultant může tuto roli zastávat jako outsourcovaná bezpečnostní role (virtual CISO). Toto musí být explicitně sjednáno ve smlouvě.",
              "Komunikace s NÚKIB při incidentu Pokud je MSP pověřen jako zástupce zákazníka na Portálu NÚKIB, může komunikovat jménem zákazníka. Bez formálního pověření toto dělat nemůže.",
              "Výběr a schválení dodavatelů MSP může doporučovat — ale finální schválení dodavatelů je rozhodnutí zákazníka."
            ]
          }
        ]
      },
      {
        heading: "Jak tuto hranici zakotvit ve smlouvě",
        body: [
          "Nejčastější příčina konfliktů mezi MSP a zákazníkem v oblasti compliance je mlhavá smlouva. Zákazník si myslel, že MSP „to vyřídí\" — MSP si myslel, že jen implementuje. Výsledek: nedokončená compliance a spor o odpovědnost.",
          "Minimální smluvní ujednání:"
        ],
        codeBlock: "MSP zajišťuje:\n- Implementaci technických bezpečnostních opatření dle specifikace\n- Přípravu bezpečnostní dokumentace ke schválení zákazníkem\n- Monitoring, alerting a přípravu podkladů pro hlášení incidentů\n- [Seznam dalších konkrétních služeb]\n\nZákazník zajišťuje:\n- Registraci regulované služby a komunikaci s NÚKIB\n- Schválení a podpis interních politik a dokumentů\n- Rozhodnutí o rozsahu řízení KB a akceptaci rizik\n- Odeslání hlášení incidentů NÚKIB (nebo pověření MSP jako zástupce)\n- Proškolení zaměstnanců a dodržování interních politik\n\nMSP nepřebírá zákonnou odpovědnost zákazníka jako poskytovatele\nregulované služby. Zákazník zůstává odpovědným subjektem\ndle zákona č. 264/2025 Sb."
      },
      {
        heading: "Jak toto zákazníkovi vysvětlit, aniž ho odradíte",
        body: [
          "Zákazník může slyšet „to musíte dělat sami\" jako „nepomůžeme vám.\" Není to pravda — jen je důležité nastavit správná očekávání.",
          "Doporučené znění:",
          "„Velkou část práce uděláme za vás — techniku, dokumentaci, monitoring, školení. Ale zákon ukládá odpovědnost vám jako firmě, ne nám. Proto potřebujeme, abyste nás informovali, schvalovali klíčová rozhodnutí a komunikovali s NÚKIB svým jménem. My vás celým procesem provázíme — ale nemohu za vás podepsat to, co musíte podepsat vy.\""
        ]
      },
      {
        heading: "TL;DR",
        body: [],
        bullets: [
          "nZKB ukládá povinnosti zákazníkovi, ne MSP. MSP implementuje — zákazník odpovídá.",
          "Nelze delegovat: registrace u NÚKIB, odpovědnost vedení, schválení rozsahu, hlášení incidentů (bez pověření), rozhodnutí o akceptaci rizik.",
          "Plně delegovatelné: technická implementace, příprava dokumentace, monitoring, školení, vendor management, zálohy.",
          "Šedá zóna: role pověřené osoby KB, komunikace s NÚKIB při incidentu — to závisí na formálním pověření.",
          "Zapište hranici do smlouvy explicitně — vyhne se to konfliktům při auditu nebo incidentu."
        ]
      }
    ]
  },
  {
    slug: "msp-compliance-jako-sluzba-bez-odpovednosti",
    title: "Jak MSP nabídne compliance jako službu bez toho, aby přebral právní odpovědnost",
    description: "Compliance poradenství a implementace jsou pro MSP příležitost s vyšší marží. Ale špatně nastavená smlouva může z MSP udělat odpovědnou stranu za zákazníkův zákonný soulad. Jak nabídnout tuto službu správně.",
    category: "ZoKB / NIS2",
    publishedAt: "2026-05-24",
    readTime: "8 min",
    author: "Splnit.eu",
    authorRole: "Redakce Splnit.eu",
    regulationHref: "https://www.e-sbirka.cz/sb/2025/264",
    ctaTitle: "Splňte požadavky bez zbytečné byrokracie",
    ctaBody: "Splnit.eu automatizuje compliance pro NIS2, GDPR, ISO 27001 a EU AI Act. Sledujte svůj stav v reálném čase.",
    ctaButton: "Začít zdarma",
    ctaHref: "/early-access",
    summary: "nZKB compliance je pro MSP reálná příležitost. Zákazníci to nezvládnou sami — potřebují technickou implementaci, dokumentaci a průvodce procesem. Zákazníci za to platí. A marže jsou vyšší než u samotné správy infrastruktury. Ale jsou MSP, kteří tuto příležitost nevyužijí správně — protože se...",
    sections: [
      {
        heading: "Proč compliance jako služba dává smysl pro MSP",
        body: [
          "Zákazníci to potřebují a nehledají SI firmu. Zákazník, který s vámi má vztah v oblasti správy IT, vám důvěřuje. Nechtějí si najímat neznámou poradenskou firmu pro compliance — chtějí, aby to vyřešil jejich MSP. Vy znáte jejich prostředí.",
          "Jde o opakující se příjem. Compliance není jednorázový projekt. Politiky se revidují, audity se opakují, opatření se testují, školení se každoročně aktualizují. To je model opakujícího se měsíčního příjmu.",
          "Odlišuje vás to od konkurence. MSP, který říká „spravujeme vám IT a zároveň vás provázíme compliance,\" hraje v jiné lize než MSP, který říká jen „spravujeme vám IT.\""
        ]
      },
      {
        heading: "Tři modely compliance služby pro MSP",
        body: [],
        subsections: [
          {
            heading: "Model 1: Implementační projekt",
            body: [
              "Jednorázový projekt s jasně definovaným scope:",
              "Výhoda: zákazník snáze schválí jednorázovou investici. Nevýhoda: po dokončení přijdete o příjem, pokud nemáte navazující model."
            ],
            bullets: [
              "Gap analýza",
              "Příprava dokumentace a politik",
              "Implementace technických opatření",
              "Příprava na audit nebo registraci"
            ]
          },
          {
            heading: "Model 2: Compliance retainer",
            body: [
              "Měsíční paušál za průběžnou péči:",
              "Výhoda: opakující se příjem, dlouhodobý vztah. Nevýhoda: zákazník musí vidět hodnotu průběžně — musíte reportovat, co děláte."
            ],
            bullets: [
              "Aktualizace dokumentace při změnách",
              "Čtvrtletní přezkum politik",
              "Roční revize rozsahu a rizik",
              "Příprava záznámů ze školení",
              "Podpora při zákaznických auditech"
            ]
          },
          {
            heading: "Model 3: Bundled v managed service",
            body: [
              "Compliance je součástí základního MSP balíčku nebo prémiového tieru:",
              "Výhoda: zákazník to vnímá jako kompletní řešení, switching cost je vyšší. Nevýhoda: musíte přesně kalkulovat, aby to nebylo prodělečné."
            ],
            bullets: [
              "Bezpečnostní monitoring + compliance dokumentace v jednom",
              "Zákazník neplatí zvlášť — je to součást ceny za spravované služby"
            ]
          }
        ]
      },
      {
        heading: "Jak navrhovat scope, který nepřebírá odpovědnost",
        body: [],
        subsections: [
          {
            heading: "Rozlište „compliance implementace\" od „compliance garantování\"",
            body: [
              "Co nabízíte (správně):",
              "Co nenabízíte (a nesmíte slibovat):",
              "Rozdíl je zásadní: nabízíte implementaci a podporu — ne garanci výsledku. Výsledek závisí na zákazníkovi (schvaluje dokumenty, odpovídá za vedení, komunikuje s NÚKIB)."
            ],
            bullets: [
              "Implementace technických bezpečnostních opatření dle specifikace",
              "Příprava dokumentace a politik ke schválení zákazníkem",
              "Metodická podpora při registraci a komunikaci s NÚKIB",
              "Průběžná údržba a aktualizace dokumentace",
              "Organizace školení a vedení záznamů",
              "Garanci zákonného souladu zákazníka s nZKB",
              "Garanci, že zákazník projde auditem bez nálezu",
              "Přijetí zákonné odpovědnosti zákazníka jako regulované entity",
              "Právní poradenství (pokud nejste právník)"
            ]
          }
        ]
      },
      {
        heading: "Smluvní jazyk, který vás chrání",
        body: [
          "Toto jsou klíčové klauzule, které musí vaše compliance smlouva nebo její dodatek obsahovat:"
        ],
        subsections: [
          {
            heading: "Vymezení rozsahu",
            body: [],
            codeBlock: "MSP poskytuje následující služby v oblasti kybernetické bezpečnosti\na regulatory compliance:\n[explicitní seznam — co konkrétně děláte]\n\nSlužby MSP nepředstavují právní poradenství ani audit\nkybernetické bezpečnosti. MSP nezaručuje, že implementovaná\nopatření budou shledána jako dostatečná jakýmkoli regulátorem\nnebo auditorem."
          },
          {
            heading: "Odpovědnost zákazníka",
            body: [],
            codeBlock: "Zákazník bere na vědomí, že:\na) Zákazník je poskytovatelem regulované služby ve smyslu\n   zákona č. 264/2025 Sb. a nese plnou zákonnou odpovědnost\n   za soulad s tímto zákonem.\nb) MSP jedná jako technický a metodický poskytovatel\n   — nepřebírá zákonnou odpovědnost zákazníka.\nc) Zákazník je povinen schvalovat klíčové dokumenty, rozhodnutí\n   a komunikaci s NÚKIB.\nd) Zákazník je povinen poskytnout MSP přesné a úplné informace\n   nezbytné pro výkon smluvených služeb."
          },
          {
            heading: "Omezení liability",
            body: [
              "Doporučení: Nechte smlouvu projít právníkem. Výše uvedené klauzule jsou ilustrativní — konkrétní formulace závisí na vašem obchodním modelu a právní formě."
            ],
            codeBlock: "Celková odpovědnost MSP za škodu vzniklou v souvislosti\ns poskytováním compliance služeb je omezena na výši\nsmluvní odměny za posledních 12 měsíců. MSP neodpovídá\nza škody vzniklé v důsledku rozhodnutí zákazníka,\nneposkytnutí součinnosti zákazníkem nebo za sankce\nuložené regulátorem zákazníkovi."
          }
        ]
      },
      {
        heading: "Jak nastavit součinnost zákazníka jako podmínku",
        body: [
          "Největší riziko compliance projektu pro MSP není právní odpovědnost — je to situace, kdy zákazník nespolupracuje, ale chce výsledek. Politiky čekají na schválení. Školení se zákazník nechce zúčastnit. Dokumenty nikdo nepodepisuje.",
          "Ošetřete to ve smlouvě a procesem:",
          "Ve smlouvě:",
          "Procesem:"
        ],
        codeBlock: "Zákazník se zavazuje:\n- Poskytovat MSP součinnost v dohodnutých termínech\n- Schvalovat předložené dokumenty do [X] pracovních dnů\n- Nominovat interní kontaktní osobu odpovědnou za compliance\n- Zúčastnit se alespoň [X] hodin ročně na přezkumech a školeních\n\nPokud zákazník neposkytne součinnost ve stanoveném termínu,\nMSP není v prodlení a termíny se posouvají o dobu prodlení zákazníka.",
        bullets: [
          "Každý dokument zasílejte s jasnou lhůtou pro schválení a jménem zodpovědné osoby",
          "Vedete log schválení — kdy byl dokument zaslán, kdy schválen, kým",
          "Měsíční nebo čtvrtletní status report zákazníkovi — co bylo hotovo, co čeká na jeho akci"
        ]
      },
      {
        heading: "Jak compliance službu prezentovat zákazníkovi",
        body: [
          "Zákazník nekupuje „compliance\". Zákazník kupuje:",
          "Přizpůsobte komunikaci tomu, co zákazníka motivuje:"
        ],
        bullets: [
          "Klid — „Nebudeme mít problém s NÚKIB ani s kontrolou\"",
          "Tendr — „Budeme moci doložit soulad s nZKB a vyhrávat zakázky\"",
          "Ochranu — „Když dojde k incidentu, budeme vědět, co dělat\"",
          "Čas — „Nebudeme to muset řešit sami\""
        ],
        table: {
          headers: [
            "Profil zákazníka",
            "Co ho motivuje",
            "Jak prezentovat"
          ],
          rows: [
            [
              "Výrobní firma ve vyšším režimu",
              "Vyhnout se pokutám",
              "„Bez zavedených opatření riskujete pokutu až 250 mil. Kč. Pomůžeme vám to splnit v zákonné lhůtě.\""
            ],
            [
              "IT firma usilující o enterprise",
              "Vyhrávat tendry",
              "„Zákazníci z regulovaného sektoru budou vyžadovat doložení nZKB souladu. Budete připraveni.\""
            ],
            [
              "Rodinná firma s obavami z administrativy",
              "Jednoduchost",
              "„Uděláme maximum práce za vás. Vy jen schvalujete a podepisujete.\""
            ]
          ]
        }
      },
      {
        heading: "TL;DR",
        body: [],
        bullets: [
          "Compliance jako služba je pro MSP příležitost s vyšší marží a opakujícím se příjmem.",
          "Nabízíte implementaci a podporu — ne garanci zákonného souladu. Toto rozlišení musí být explicitní ve smlouvě.",
          "Klíčové smluvní prvky: vymezení scope, odpovědnost zákazníka, omezení liability MSP.",
          "Součinnost zákazníka musí být smluvní povinností — ne dobrým přáním.",
          "Zákazník nekupuje compliance — kupuje klid, tendry, ochranu a čas. Komunikujte podle toho."
        ]
      }
    ]
  },
  {
    slug: "msp-compliance-prodejni-argument-tender",
    title: "Compliance jako prodejní argument: jak MSP vyhraje tender díky nZKB připravenosti",
    description: "Firmy v regulovaných sektorech hodnotí své MSP dodavatele nově. Kyberbezpečnost a nZKB soulad jsou součástí výběrových kritérií. Jak MSP využít compliance připravenost jako konkurenční výhodu v tendru.",
    category: "ZoKB / NIS2",
    publishedAt: "2026-05-24",
    readTime: "7 min",
    author: "Splnit.eu",
    authorRole: "Redakce Splnit.eu",
    regulationHref: "https://www.e-sbirka.cz/sb/2025/264",
    ctaTitle: "Splňte požadavky bez zbytečné byrokracie",
    ctaBody: "Splnit.eu automatizuje compliance pro NIS2, GDPR, ISO 27001 a EU AI Act. Sledujte svůj stav v reálném čase.",
    ctaButton: "Začít zdarma",
    ctaHref: "/early-access",
    summary: "„Vybíráme nového MSP poskytovatele. Součástí hodnocení je bezpečnostní dotazník a doložení souladu s nZKB.\" Tato věta se v tendrech pro IT služby objevuje čím dál pravidelněji. Firmy v regulovaných sektorech — výroba, energie, zdravotnictví, finance — jsou samy pod tlakem nZKB a hledají MSP,...",
    sections: [
      {
        heading: "Proč compliance vstoupila do výběrových kritérií MSP",
        body: [
          "Před nZKB byl výběr MSP primárně o ceně, referencích a technické způsobilosti. Dnes přibyl čtvrtý rozměr: bezpečnostní způsobilost a regulatory compliance.",
          "Důvody jsou přímé:",
          "Regulovaný zákazník ručí za své dodavatele. nZKB vyžaduje hodnocení bezpečnostně významných dodavatelů pro vyšší režim. MSP, který spravuje IT zákazníka, je bezpečnostně významným dodavatelem. Zákazník musí doložit, že vás prověřil.",
          "Incident přes MSP je incident zákazníka. Pokud útočník kompromituje váš RMM přístup a dostane se přes něj k zákazníkovi, zákazník hlásí incident NÚKIB — a zdůvodňuje, proč nevybral bezpečného MSP.",
          "Enterprise procurement týmy mají nové checklisty. Bezpečnostní dotazníky pro dodavatele se v roce 2026 staly standardem. Bez uspokojivých odpovědí se k finančnímu vyjednávání nedostanete."
        ]
      },
      {
        heading: "Co zákazník v tendru konkrétně hodnotí",
        body: [
          "Bezpečnostní část tendru typicky testuje těchto 6 oblastí:"
        ],
        subsections: [
          {
            heading: "1. Jste sami regulovaní pod nZKB?",
            body: [
              "Zákazník chce vědět, jestli vy sami máte zákonnou povinnost zavést bezpečnostní opatření — a jestli ji plníte. MSP, který je sám registrován u NÚKIB a má zavedená opatření, dává zákazníkovi silnější signál než MSP, který říká „my regulovaní nejsme.\"",
              "Připravte: Potvrzení o registraci nebo výsledek samoidentifikace + stručný přehled zavedených opatření."
            ]
          },
          {
            heading: "2. Jak zabezpečujete přístupy do zákaznických prostředí?",
            body: [
              "Toto je oblast s nejvyšším zájmem. Zákazník chce vidět, že přístupy jeho techniků jsou pod kontrolou.",
              "Připravte: Politiku řízení přístupů, potvrzení povinného MFA, popis offboarding procesu, přehled nástrojů pro správu privilegovaných přístupů (PAM)."
            ]
          },
          {
            heading: "3. Certifikace nebo bezpečnostní audit",
            body: [
              "ISO 27001 nebo SOC 2 jsou nejsilnější signály. Pokud je nemáte, připravte alternativu.",
              "Připravte: Certifikát (s platným datem a scope pokrývajícím MSP operace), nebo bezpečnostní přehled + výsledky posledního externího bezpečnostního auditu nebo penetračního testu."
            ]
          },
          {
            heading: "4. Jak řešíte incidenty a jak nás informujete?",
            body: [
              "Připravte: Incident response plán (zkrácená verze), smluvní lhůtu pro notifikaci zákazníka (24–48 hodin), kontaktní list pro bezpečnostní záležitosti."
            ]
          },
          {
            heading: "5. Jak hodnotíte vlastní dodavatele?",
            body: [
              "Připravte: Vendor risk registr nebo přehled klíčových subdodavatelů s jejich bezpečnostní způsobilostí."
            ]
          },
          {
            heading: "6. Školení a bezpečnostní kultura",
            body: [
              "Připravte: Záznamy o bezpečnostním školení zaměstnanců, přehled témat a frekvence."
            ]
          }
        ]
      },
      {
        heading: "Jak compliance prezentovat v tendru — ne jen doložit",
        body: [
          "Doložit dokumenty je minimum. Vítězové tendrů dokáží compliance vypravovat jako příběh, který buduje důvěru."
        ],
        subsections: [
          {
            heading: "Místo: „Přikládáme certifikát ISO 27001\"",
            body: [
              "Říkejte: „Máme platnou certifikaci ISO 27001 se scope pokrývajícím naše MSP operace. To znamená, že každoročně procházíme nezávislým auditem, který ověřuje naše bezpečnostní kontroly. Přikládáme certifikát, SoA a výsledky posledního dozorového auditu.\""
            ]
          },
          {
            heading: "Místo: „Máme MFA na přístupech\"",
            body: [
              "Říkejte: „Každý přístup do zákaznického prostředí je chráněn MFA a logován. Při odchodu technika jsou přístupy odebrány do 4 hodin. Záznamy o přístupech uchováváme 12 měsíců a jsou dostupné zákazníkovi na vyžádání.\""
            ]
          },
          {
            heading: "Místo: „Řešíme incidenty dle plánu\"",
            body: [
              "Říkejte: „Náš incident response plán testujeme dvakrát ročně tabletop cvičením. Zákazníky informujeme o incidentech do 24 hodin od zjištění — to je smluvní závazek, ne jen interní politika.\"",
              "Každá odpověď má tři části: co máte, proč to funguje, jak to zákazník pozná."
            ]
          }
        ]
      },
      {
        heading: "Compliance pitch: jak ho zakomponovat do prezentace",
        body: [
          "Pokud máte možnost prezentovat před výběrovou komisí, věnujte compliance jednu samostatnou sekci — ne ji rozptýlit do technického přehledu.",
          "Struktura compliance sekce (5–8 minut):"
        ],
        bullets: [
          "1. Naše vlastní bezpečnostní způsobilost — jsme sami regulovaní / certifikovaní. Tady je doklad.",
          "2. Jak chráníme přístupy do vašeho prostředí — konkrétní popis: MFA, PAM, offboarding, logování.",
          "3. Co se stane, když dojde k incidentu — kdo volá komu, do kdy, co děláme.",
          "4. Jak vám pomůžeme s vaší vlastní nZKB compliance — pokud tuto službu nabízíte.",
          "5. Reference — zákazník z regulovaného sektoru, pro kterého jste compliance řešili."
        ]
      },
      {
        heading: "Jak reagovat, když nemáte certifikaci",
        body: [
          "Mnoho MSP ISO 27001 nemá — a přitom tendry vyhrává. Klíčem je transparentnost a kompenzace:",
          "„ISO 27001 certifikaci nemáme, plánujeme certifikační audit v [datum]. Místo toho přikládáme přehled našich bezpečnostních opatření, výsledky posledního externího penetračního testu z [datum] a náš registr rizik. Jsme připraveni odpovědět na jakékoli detailní otázky vašeho security týmu.\"",
          "Zákazníci z méně přísně regulovaného sektoru toto přijmou. Pro banky a pojišťovny certifikaci většinou potřebujete — nebo potřebujete partnera, který ji má."
        ]
      },
      {
        heading: "Jak compliance zvyšuje cenu vaší nabídky",
        body: [
          "Compliance připravenost vám umožňuje obhájit vyšší cenu:",
          "V tendru, kde cena je jedním z kritérií, ale ne jediným, je bezpečnostní způsobilost argument pro to, proč stojíte víc než nejlevnější nabídka."
        ],
        bullets: [
          "Snižuje riziko zákazníka (a zákazník to ví)",
          "Snižuje zákazníkovy náklady na vendor management (nemusí vás složitě prověřovat)",
          "Umožňuje zákazníkovi ve svých vlastních auditech doložit prověřeného dodavatele"
        ]
      },
      {
        heading: "TL;DR",
        body: [],
        bullets: [
          "Compliance připravenost je v roce 2026 součástí výběrových kritérií MSP v regulovaných sektorech.",
          "Zákazník hodnotí 6 oblastí: regulační status, správu přístupů, certifikace, incident response, vendor management, školení.",
          "Nestačí dokumenty doložit — musíte je umět vypravovat jako příběh, který buduje důvěru.",
          "Pokud nemáte ISO 27001: buďte transparentní, doložte alternativy a ukažte plán.",
          "Compliance způsobilost obhajuje vyšší cenu a snižuje switching pressure od zákazníka."
        ]
      }
    ]
  },
  {
    slug: "msp-ceny-compliance-sluzby",
    title: "Jak MSP nastaví ceny za compliance služby",
    description: "Compliance je pro MSP příležitost s vyšší marží — ale jen pokud je správně oceněna. Tady jsou modely, kalkulační logika a nejčastější chyby při nastavování cen za nZKB a bezpečnostní služby.",
    category: "ZoKB / NIS2",
    publishedAt: "2026-05-24",
    readTime: "7 min",
    author: "Splnit.eu",
    authorRole: "Redakce Splnit.eu",
    regulationHref: "https://www.e-sbirka.cz/sb/2025/264",
    ctaTitle: "Splňte požadavky bez zbytečné byrokracie",
    ctaBody: "Splnit.eu automatizuje compliance pro NIS2, GDPR, ISO 27001 a EU AI Act. Sledujte svůj stav v reálném čase.",
    ctaButton: "Začít zdarma",
    ctaHref: "/early-access",
    summary: "Zákazník souhlasí, že potřebuje nZKB compliance. Ptá se: „A co to bude stát?\" Tato otázka zastaví mnoho MSP. Buď odpoví příliš nízko ze strachu ztratit zákazníka — a pak projekt prodělá. Nebo odpoví příliš vysokou paušální částkou bez zdůvodnění — a zákazník řekne, že si to rozmyslí. Správné...",
    sections: [
      {
        heading: "Proč compliance nelze oceňovat jako helpdesk",
        body: [
          "U klasické IT správy je logika jednoduchá: počet zařízení × cena za zařízení, nebo počet uživatelů × cena za uživatele. Rozsah je definovatelný, práce je opakující se a předvídatelná.",
          "Compliance má jinou logiku:",
          "Rozsah závisí na stavu zákazníka. Zákazník, který nemá nic, potřebuje jiný objem práce než zákazník, který má základ a potřebuje jen doladit. Bez gap analýzy nevíte, co vás čeká.",
          "Hodnota není v hodinách, ale ve výsledku. Zákazník neplatí za „15 hodin psaní politik\" — platí za „budu připraven na audit\" nebo „nebudu mít problém s NÚKIB.\" Hodinová sazba podceňuje tuto hodnotu.",
          "Zákazník má omezené porozumění scope. „Udělejte nám to NIS2\" je pro zákazníka jeden úkol. Ve skutečnosti jde o desítky aktivit. Musíte scope vysvětlit, ne ho jen ocenit."
        ]
      },
      {
        heading: "Čtyři fáze compliance projektu a jejich oceňování",
        body: [],
        subsections: [
          {
            heading: "Fáze 1: Gap analýza",
            body: [
              "Co zahrnuje: Zmapování aktuálního stavu zákazníka vůči požadavkům nZKB, identifikace chybějících opatření a dokumentace, prioritizovaný plán nápravy s odhadem náročnosti.",
              "Proč oceňovat samostatně: Gap analýza je vstupem pro veškeré další práce. Bez ní nevíte, kolik bude stát zbytek projektu. Zákazník platí za jasnost, ne za papír.",
              "Orientační cena (ČR, 2026):",
              "Tip: Výsledek gap analýzy použijte jako podklad pro nabídku na implementaci. Zákazník vidí, za co platí, a váš odhad implementace je podložený."
            ],
            bullets: [
              "Malý MSP zákazník (nižší režim, do 50 zaměstnanců): 15 000 – 30 000 Kč",
              "Střední zákazník (vyšší nebo nižší režim, 50–200 zaměstnanců): 30 000 – 70 000 Kč",
              "Větší zákazník (vyšší režim, komplexní prostředí): 70 000 – 150 000 Kč"
            ]
          },
          {
            heading: "Fáze 2: Implementační projekt",
            body: [
              "Co zahrnuje: Příprava dokumentace a politik, implementace technických opatření, školení zaměstnanců, příprava na registraci a komunikaci s NÚKIB.",
              "Jak ocenit: Vyjděte z výsledků gap analýzy. Pro každou položku odhadněte počet hodin × vaše sazba. Přidejte buffer 15–20 % za koordinaci a neočekávané komplikace.",
              "Orientační rozsahy:",
              "Toto jsou hrubé orientační čísla — skutečná cena závisí na výsledcích gap analýzy a vašich sazbách.",
              "Jak prezentovat zákazníkovi: Rozložte projekt na milníky s dílčími platbami. Zákazník snadněji schválí 4× 50 000 Kč než jednorázových 200 000 Kč."
            ],
            bullets: [
              "Typ zákazníka: Nižší režim, základ v pořádku; Přibližný rozsah: 80 000 – 150 000 Kč",
              "Typ zákazníka: Nižší režim, vše od nuly; Přibližný rozsah: 150 000 – 250 000 Kč",
              "Typ zákazníka: Vyšší režim, základ v pořádku; Přibližný rozsah: 200 000 – 400 000 Kč",
              "Typ zákazníka: Vyšší režim, vše od nuly; Přibližný rozsah: 400 000 – 800 000 Kč"
            ]
          },
          {
            heading: "Fáze 3: Compliance retainer (průběžná péče)",
            body: [
              "Co zahrnuje: Roční aktualizace dokumentace a politik, čtvrtletní přezkumy, příprava záznámů ze školení, podpora při zákaznických auditech, alerting na změny legislativy.",
              "Jak ocenit: Odhadněte reálný počet hodin ročně — typicky 20–60 hodin podle velikosti zákazníka. Vydělte 12 pro měsíční paušál. Přidejte marži za dostupnost a jistotu pro zákazníka.",
              "Orientační ceny:",
              "Tip: Compliance retainer se lépe prodává jako součást nebo nadstavba existující MSP smlouvy, ne jako samostatná položka. „K vašemu stávajícímu balíčku přidáváme compliance care za X Kč/měsíc.\""
            ],
            bullets: [
              "Malý zákazník: 3 000 – 8 000 Kč / měsíc",
              "Střední zákazník: 8 000 – 20 000 Kč / měsíc",
              "Větší zákazník: 20 000 – 50 000 Kč / měsíc"
            ]
          },
          {
            heading: "Fáze 4: Ad hoc podpora",
            body: [
              "Incidentální podpora mimo retainer — pomoc při zákaznickém auditu, reakce na varování NÚKIB, aktualizace při legislativní změně.",
              "Jak ocenit: Hodinová sazba nebo denní sazba. Pro compliance práci doporučujeme sazbu o 20–30 % vyšší než pro standardní IT práce — jde o specializovanou znalost."
            ]
          }
        ]
      },
      {
        heading: "Tři modely pro různé zákazníky",
        body: [],
        subsections: [
          {
            heading: "Model A: Projektový (jednorázový)",
            body: [
              "Vhodný pro zákazníka, který chce compliance udělat a nechce průběžný závazek.",
              "Struktura: Gap analýza → Nabídka na implementaci → Implementační projekt → Předání dokumentace",
              "Nevýhoda: po dokončení nemáte opakující se příjem. Nabídněte alespoň roční přezkumné sezení za fixní cenu jako follow-up."
            ]
          },
          {
            heading: "Model B: Projekt + retainer",
            body: [
              "Vhodný pro zákazníka, který chce compliance udělat a udržovat.",
              "Struktura: Implementační projekt (jednorázový) → Přechod na retainer po dokončení",
              "Výhoda: zákazník vidí jasný přechod od „budujeme\" k „udržujeme.\" Retainer po dokončení projektu se prodává snáze."
            ]
          },
          {
            heading: "Model C: Bundled v MSP balíčku",
            body: [
              "Vhodný pro zákazníky, kteří již mají MSP smlouvu.",
              "Struktura: Compliance care je součástí prémiového MSP tieru nebo jako add-on k existující smlouvě.",
              "Výhoda: zákazník to vnímá jako kompletní péči, ne jako další fakturu."
            ]
          }
        ]
      },
      {
        heading: "Nejčastější chyby při oceňování compliance",
        body: [
          "Oceňování bez gap analýzy „Uděláme vám to za 100 000 Kč\" — bez toho, abyste věděli, v jakém stavu zákazník je. Výsledkem je buď prodělečný projekt, nebo storno po zjištění skutečného rozsahu.",
          "Podcenění dokumentační práce Příprava bezpečnostních politik, jejich revize se zákazníkem, zapracování připomínek, finalizace — to je typicky 30–40 % celého projektu. Při odhadech se na dokumentaci nezapomínejte.",
          "Žádný buffer na součinnost zákazníka Zákazník neschvaluje dokumenty včas, mění se v jejich obsahu, nemá čas na schůzky. Bez 20% bufferu budete doplácet z vlastní marže.",
          "Neoceňování přípravy na audit Pokud zákazník dostane zákaznický audit nebo kontrolu NÚKIB — budete u toho. To jsou hodiny, které nejsou v retaineru. Buď je zahrňte, nebo si rezervujte prostor pro fakturaci ad hoc.",
          "Hodinová sazba stejná jako pro helpdesk Compliance práce je specializovaná znalost s nízkou zastupitelností. Váš compliance sazba by měla být min. 20–30 % nad standardní MSP sazbu."
        ]
      },
      {
        heading: "Jak zákazníkovi zdůvodnit cenu",
        body: [
          "Zákazník, který slyší „200 000 Kč za dokumenty\", bude protestovat. Zákazník, který slyší toto, bude uvažovat:",
          "„Pokuta za neplnění nZKB je až 250 milionů korun. Zákazníci z regulovaného sektoru budou vyžadovat doložení souladu. Jeden ztracený tendr kvůli chybějící compliance dokumentaci vás přijde víc než naše projekt. Za 200 000 Kč dostanete kompletní přípravu, která vás chrání před pokutami, pomáhá vyhrávat zakázky a je hotová v zákonné lhůtě.\"",
          "Dejte zákazníkovi souřadnice ROI. Compliance není náklad — je to investice s jasnou alternativní cenou (pokuta, ztracený kontrakt)."
        ]
      },
      {
        heading: "TL;DR",
        body: [],
        bullets: [
          "Compliance nelze oceňovat jako helpdesk — závisí na stavu zákazníka, hodnota je ve výsledku, ne v hodinách.",
          "Čtyři fáze s oddělenou logiku oceňování: gap analýza, implementační projekt, compliance retainer, ad hoc podpora.",
          "Gap analýzu vždy oceňujte a fakturujte samostatně — bez ní nevíte, co budete dělat.",
          "Nejčastější chyby: oceňování bez gap analýzy, podcenění dokumentace, žádný buffer na součinnost zákazníka.",
          "Zdůvodňujte cenu ROI logikou: pokuta, ztracený tendr, zákaznický audit — to jsou alternativní náklady."
        ]
      }
    ]
  }
];

const posts: Record<Locale, BlogPost[]> = {
  "cs-CZ": [
    ...czechNukibRegistrationPosts,
    ...importedCzechBlogPosts,
    ...importedMspBlogPosts,
    {
      slug: "nis2-pruvodce-pro-msp",
      title: "NIS2 pro české MSP: praktický průvodce",
      description:
        "Kdy se NIS2 týká české firmy, co připravit pro NÚKIB a jak začít s auditovatelnými kontrolami.",
      category: "NIS2",
      publishedAt: "2026-04-28",
      readTime: "2 min",
      author: "Marco Zoratto",
      authorRole: "zakladatel Splnit.eu",
      regulationHref: "/predpisy/nis2",
      ctaTitle: "Převést NIS2 na první kontrolní seznam",
      ctaBody: "Začněte u MFA, incident response a dodavatelů: Splnit.eu je mapuje na kontroly, vlastníky a důkazy, které můžete průběžně ověřovat.",
      ctaButton: "Otevřít NIS2 přehled",
      ctaHref: "/predpisy/nis2",
      summary:
        "NIS2 není jen právní povinnost. Pro české MSP znamená zavést měřitelné bezpečnostní kontroly, doložit řízení rizik a umět rychle reagovat na incidenty.",
      sections: [
        {
          heading: "Kdy začít",
          body: [
            "Začněte posouzením sektoru, velikosti firmy a role v dodavatelském řetězci. I firma mimo přímou regulaci může být pod tlakem zákazníků, kteří po dodavatelích vyžadují doložitelné kyberbezpečnostní procesy.",
            "První praktický krok je inventář systémů a vlastníků. Bez něj se špatně rozhoduje, kde má být MFA, kdo řeší incidenty a které důkazy budou auditor nebo zákazník chtít vidět.",
          ],
          bullets: [
            "Určete odpovědnou osobu za kyberbezpečnost.",
            "Sepište klíčové systémy, identity a dodavatele.",
            "Zaveďte pravidelné kontroly MFA, záloh a incident response.",
          ],
        },
        {
          heading: "Co musí být doložitelné",
          body: [
            "Regulátor nebude hodnotit jen existenci směrnice. Potřebujete záznamy o tom, že kontrola skutečně běží, kdy byla naposledy ověřena a kdo řešil výjimky.",
            "Typické důkazy jsou exporty nastavení identity provideru, záznamy o přístupových revizích, incident log, zranitelnostní reporty a schválené bezpečnostní politiky.",
          ],
        },
        {
          heading: "Jak z toho udělat proces",
          body: [
            "NIS2 se dá řídit jako sada opakovatelných kontrol. Každá kontrola má vlastníka, status, důkaz a termín další revize. Díky tomu z povinností nevznikne jednorázový projekt, který po auditu zestárne.",
          ],
        },
      ],
    },
    {
      slug: "eu-ai-act-pruvodce-pro-msp",
      title: "EU AI Act pro MSP: co připravit v roce 2026",
      description:
        "Praktický přehled povinností pro firmy, které používají generativní AI, HR automatizaci nebo jiné AI systémy.",
      category: "EU AI Act",
      publishedAt: "2026-04-29",
      readTime: "2 min",
      author: "Marco Zoratto",
      authorRole: "zakladatel Splnit.eu",
      regulationHref: "/predpisy/eu-ai-act",
      ctaTitle: "Z AI článku udělat inventář použití",
      ctaBody: "Splnit.eu pomáhá evidovat AI nástroje, vlastníky, účely a školení, aby nové použití AI nezůstalo bez odpovědnosti.",
      ctaButton: "Otevřít EU AI Act přehled",
      ctaHref: "/predpisy/eu-ai-act",
      summary:
        "EU AI Act rozlišuje zakázané praktiky, high-risk systémy a běžné použití AI. I běžné použití generativní AI vyžaduje jasná pravidla, školení a evidenci.",
      sections: [
        {
          heading: "Začněte inventářem AI",
          body: [
            "Sepište všechny AI nástroje používané ve firmě: ChatGPT, Microsoft Copilot, HR screening, scoring, zákaznickou podporu i interní automatizace. U každého nástroje určete vlastníka, účel, vstupní data a očekávaný dopad.",
            "Inventář pomůže odlišit běžné produktivní použití od high-risk scénářů, kde je potřeba přísnější dokumentace a lidský dohled.",
          ],
          bullets: [
            "Název AI nástroje a dodavatel",
            "Účel použití a odpovědný vlastník",
            "Typ zpracovávaných dat",
            "Riziko pro zákazníky, zaměstnance nebo rozhodování",
          ],
        },
        {
          heading: "AI gramotnost",
          body: [
            "Firmy musí prokázat, že lidé používající AI chápou limity systému, rizika halucinací, pravidla pro osobní údaje a požadavky na lidskou kontrolu.",
            "Krátké školení nestačí samo o sobě. Udržujte záznam o účasti, verzi školení a potvrzení interní AI politiky.",
          ],
        },
        {
          heading: "Politika a kontrolní body",
          body: [
            "Interní AI politika by měla říct, co je povolené, co je zakázané, kdo schvaluje nové AI použití a jak se řeší incident nebo nesprávný výstup. Praktické firmy navazují politiku na checklist kontrol a evidence.",
          ],
        },
      ],
    },

    {
      slug: "iso-27001-priprava-na-tendr",
      title: "ISO 27001 pro SaaS firmy: příprava na enterprise tendr",
      description:
        "Co mít připravené, když zákazník v tendru požaduje ISO 27001, SoA, access reviews a doložitelné bezpečnostní procesy.",
      category: "ISO 27001",
      publishedAt: "2026-05-02",
      readTime: "3 min",
      author: "Marco Zoratto",
      authorRole: "zakladatel Splnit.eu",
      regulationHref: "/predpisy/iso-27001",
      ctaTitle: "Převést ISO 27001 požadavky na gap analýzu",
      ctaBody: "Splnit.eu propojí SoA, rizika, politiky a důkazy z nástrojů, aby bylo před tendrem vidět, co je připravené a co ještě chybí.",
      ctaButton: "Otevřít ISO 27001 přehled",
      ctaHref: "/predpisy/iso-27001",
      summary:
        "ISO 27001 je pro mnoho SaaS firem vstupenka do enterprise tendrů. Nejde jen o certifikát, ale o schopnost doložit rizika, vybrané kontroly, vlastníky a pravidelné ověřování.",
      sections: [
        {
          heading: "Co zákazník obvykle chce vidět",
          body: [
            "V tendru se ISO 27001 často objeví dřív než samotný certifikační audit. Zákazník chce vědět, jestli máte řízení rizik, schválené bezpečnostní politiky, přístupové revize a proces pro incidenty.",
            "Pokud certifikát ještě nemáte, pomáhá ukázat realistickou gap analýzu: které kontroly běží, které mají důkaz a které mají vlastníka a termín dokončení.",
          ],
          bullets: [
            "Statement of Applicability s důvody výběru a výjimek",
            "risk register a plán ošetření rizik",
            "access reviews, MFA a správa privilegovaných účtů",
            "incident response, zálohy a vendor management",
          ],
        },
        {
          heading: "Proč nestačí sada dokumentů",
          body: [
            "Politiky bez důkazů rychle zastarají. Enterprise zákazník nebo auditor se bude ptát, kdy byla kontrola naposledy ověřena, kdo schválil výjimku a kde je podklad ze systému.",
            "Praktický přístup je vést každou kontrolu jako živý záznam: vlastník, status, důkaz, datum revize a návaznost na riziko nebo zákaznický požadavek.",
          ],
        },
        {
          heading: "Jak začít bez přestřelených tvrzení",
          body: [
            "Neříkejte, že jste ISO-ready, pokud chybí důkazy. Bezpečnější formulace je ukázat aktuální readiness: hotové kontroly, otevřené gapy a plán k certifikaci nebo tendru.",
          ],
        },
      ],
    },

    {
      slug: "dodavatelsky-risk-checklist",
      title: "Vendor risk checklist: co chtít od klíčových dodavatelů",
      description:
        "Praktický seznam důkazů pro dodavatele, kteří zpracovávají data, provozují kritickou službu nebo vstupují do zákaznického auditu.",
      category: "NIS2",
      publishedAt: "2026-05-03",
      readTime: "3 min",
      author: "Marco Zoratto",
      authorRole: "zakladatel Splnit.eu",
      regulationHref: "/predpisy/nis2",
      ctaTitle: "Převést dodavatele na pravidelné kontroly",
      ctaBody: "Splnit.eu pomáhá vést dodavatele, jejich rizika, smluvní podklady a bezpečnostní důkazy jako opakovatelný proces místo jednorázového dotazníku.",
      ctaButton: "Otevřít NIS2 přehled",
      ctaHref: "/predpisy/nis2",
      summary:
        "Dodavatelský risk management není jen tabulka kontaktů. Pokud dodavatel pracuje s daty, identitami nebo provozem, potřebujete vědět, co dodává, jaké má riziko a kdy naposledy doložil bezpečnostní stav.",
      sections: [
        {
          heading: "Které dodavatele řešit jako první",
          body: [
            "Začněte dodavateli, kteří mají přístup k osobním údajům, produkčním systémům, identitám, logům nebo službám důležitým pro provoz zákazníků. U malých týmů je lepší mít deset dobře zmapovaných kritických dodavatelů než padesát neaktuálních záznamů.",
            "U každého dodavatele určete vlastníka ve firmě, typ přístupu, data nebo službu, kterou ovlivňuje, a dopad výpadku nebo incidentu.",
          ],
          bullets: [
            "cloud, hosting, identity provider a monitoring",
            "CRM, support, účetnictví a marketingové nástroje",
            "externí vývoj, IT správa a bezpečnostní služby",
            "dodavatelé, které pravidelně zmiňujete v tendrech nebo DPA",
          ],
        },
        {
          heading: "Jaké důkazy chtít",
          body: [
            "Ne každý dodavatel musí posílat stejný balík dokumentů. U nízkého rizika může stačit bezpečnostní stránka a DPA. U vyššího rizika chtějte certifikace, popis incident response, subdodavatele, umístění dat a kontakty pro bezpečnostní incident.",
            "Důležité je uchovat nejen dokument, ale i datum kontroly, výsledek, výjimky a další termín revize. Bez toho vendor review rychle zestárne.",
          ],
        },
        {
          heading: "Jak to napojit na NIS2 a GDPR",
          body: [
            "NIS2 tlačí na řízení rizik v dodavatelském řetězci, GDPR na zpracovatele a přenosy dat. Praktická evidence by proto měla umět ukázat obojí: provozní riziko dodavatele i právní vztah ke zpracování osobních údajů.",
          ],
        },
      ],
    },
    {
      slug: "incident-response-cviceni",
      title: "Incident response cvičení: jak ověřit, že plán funguje",
      description:
        "Jak připravit krátké tabletop cvičení pro bezpečnostní incident, jaké role zapojit a které důkazy po cvičení uložit.",
      category: "GDPR",
      publishedAt: "2026-05-04",
      readTime: "3 min",
      author: "Marco Zoratto",
      authorRole: "zakladatel Splnit.eu",
      regulationHref: "/predpisy/gdpr",
      ctaTitle: "Převést incident response na ověřitelný proces",
      ctaBody: "Splnit.eu pomáhá držet role, scénáře, rozhodnutí, důkazy a následná opatření pohromadě, aby plán nebyl jen dokument v šuplíku.",
      ctaButton: "Otevřít GDPR přehled",
      ctaHref: "/predpisy/gdpr",
      summary:
        "Incident response plán má hodnotu až ve chvíli, kdy ho tým umí použít. Krátké cvičení ukáže, jestli lidé vědí, kdo rozhoduje, kde jsou kontakty a jak se dokumentuje dopad na data nebo služby.",
      sections: [
        {
          heading: "Vyberte realistický scénář",
          body: [
            "Nepotřebujete dramatické cvičení na celý den. Vyberte scénář, který odpovídá vašemu provozu: kompromitovaný administrátorský účet, únik dat z helpdesku, ransomware na sdíleném úložišti nebo výpadek kritického SaaS dodavatele.",
            "Cílem není nachytat tým, ale najít mezery v kontaktech, rolích, rozhodování a důkazech. Cvičení musí skončit konkrétními úkoly, ne jen pocitem, že se něco probralo.",
          ],
          bullets: [
            "kdo incident vede a kdo komunikuje se zákazníkem",
            "kde jsou technické logy a kdo k nim má přístup",
            "kdo rozhoduje o oznámení regulatorovi nebo zákazníkovi",
            "jak se ukládají rozhodnutí, časová osa a následná opatření",
          ],
        },
        {
          heading: "Co během cvičení zapisovat",
          body: [
            "Veďte jednoduchou časovou osu: kdy byl incident zjištěn, kdo byl eskalován, jaké informace chyběly a jaké rozhodnutí padlo. U osobních údajů zaznamenejte, jak tým posuzoval oznamovací povinnost a riziko pro subjekty údajů.",
            "Po cvičení uložte zápis, seznam akčních bodů, vlastníky a termín další kontroly. Tohle jsou důkazy, že plán nejen existuje, ale byl testován.",
          ],
        },
        {
          heading: "Jak poznat dobrý výsledek",
          body: [
            "Dobrý výsledek není nulový počet zjištění. Naopak: bezpečné cvičení má odhalit slabá místa dřív než skutečný incident. Důležité je, aby každá mezera měla vlastníka, termín a navazující kontrolu.",
          ],
        },
      ],
    },
    {
      slug: "gdpr-checklist-pro-audit",
      title: "GDPR checklist pro auditovatelnou firmu",
      description:
        "Checklist pro ROPA, zpracovatele, práva subjektů údajů, DPIA a 72hodinové hlášení incidentů.",
      category: "GDPR",
      publishedAt: "2026-04-30",
      readTime: "3 min",
      author: "Marco Zoratto",
      authorRole: "zakladatel Splnit.eu",
      regulationHref: "/predpisy/gdpr",
      ctaTitle: "Převést GDPR checklist na ROPA a důkazy",
      ctaBody: "Místo statické tabulky udržujte zpracování, dodavatele, DPIA a incidenty jako živé záznamy navázané na systémy a vlastníky.",
      ctaButton: "Otevřít GDPR přehled",
      ctaHref: "/predpisy/gdpr",
      summary:
        "GDPR audit nestojí na jedné privacy policy. Potřebujete přehled zpracování, smlouvy se zpracovateli, proces práv subjektů a schopnost doložit bezpečnostní opatření.",
      sections: [
        {
          heading: "Záznamy o zpracování",
          body: [
            "ROPA je provozní mapa osobních údajů. U každé činnosti zpracování evidujte účel, právní titul, kategorie údajů, příjemce, dobu uchování a přenosy mimo EU.",
            "Nejčastější slabé místo je neaktuální seznam nástrojů. CRM, analytika, helpdesk, účetnictví a HR systém se mění častěji než právní dokumentace.",
          ],
          bullets: [
            "Zákaznická data a CRM",
            "HR a mzdová agenda",
            "Marketingové nástroje",
            "Analytika a support",
          ],
        },
        {
          heading: "Zpracovatelé a bezpečnost",
          body: [
            "Každý významný dodavatel, který pracuje s osobními údaji, musí mít doložený vztah: smlouvu, DPA, popis bezpečnosti a ideálně pravidelné hodnocení rizika.",
            "Bezpečnostní kontroly by měly pokrývat MFA, přístupová práva, zálohy, incident response a šifrování tam, kde odpovídá riziku zpracování.",
          ],
        },
        {
          heading: "Incidenty a 72 hodin",
          body: [
            "U incidentu s osobními údaji rozhoduje čas. Potřebujete log, rozhodnutí o oznamovací povinnosti, seznam dotčených údajů a připravenou šablonu oznámení pro ÚOOÚ.",
          ],
        },
      ],
    },
  ],
  "en-EU": [
    {
      slug: "nis2-pruvodce-pro-msp",
      title: "NIS2 for SMBs: a practical guide",
      description:
        "When NIS2 affects an SMB, what to prepare for the competent authority, and how to start with auditable controls.",
      category: "NIS2",
      publishedAt: "2026-04-28",
      readTime: "2 min",
      regulationHref: "/predpisy/nis2",
      ctaTitle: "Turn NIS2 into a first control checklist",
      ctaBody: "Start with MFA, incident response, and suppliers: Splnit.eu maps them to controls, owners, and evidence you can check continuously.",
      ctaButton: "Open the NIS2 overview",
      ctaHref: "/predpisy/nis2",
      summary:
        "NIS2 is not only a legal obligation. For SMBs it means measurable security controls, evidence of risk management, and the ability to respond quickly to incidents.",
      sections: [
        {
          heading: "When to start",
          body: [
            "Start by assessing your sector, company size, and role in the supply chain. Even a company outside direct regulation may face customer pressure to prove cybersecurity processes.",
            "The first practical step is an inventory of systems and owners. Without it, it is hard to decide where MFA belongs, who handles incidents, and which evidence an auditor or customer will ask for.",
          ],
          bullets: [
            "Assign a person responsible for cybersecurity.",
            "List key systems, identities, and suppliers.",
            "Introduce recurring checks for MFA, backups, and incident response.",
          ],
        },
        {
          heading: "What must be provable",
          body: [
            "The authority will not only look for the existence of a policy. You need records showing that a control actually runs, when it was last checked, and who handled exceptions.",
            "Typical evidence includes identity provider exports, access review records, incident logs, vulnerability reports, and approved security policies.",
          ],
        },
        {
          heading: "How to make it a process",
          body: [
            "NIS2 can be managed as a set of repeatable controls. Each control has an owner, status, evidence, and next review date. That keeps compliance from becoming a one-off audit project that goes stale.",
          ],
        },
      ],
    },
    {
      slug: "eu-ai-act-pruvodce-pro-msp",
      title: "EU AI Act for SMBs: what to prepare in 2026",
      description:
        "A practical overview for companies using generative AI, HR automation, or other AI systems.",
      category: "EU AI Act",
      publishedAt: "2026-04-29",
      readTime: "2 min",
      regulationHref: "/predpisy/eu-ai-act",
      ctaTitle: "Turn the AI Act article into an AI inventory",
      ctaBody: "Track AI tools, owners, purposes, risks, and training evidence before new AI use spreads across teams.",
      ctaButton: "Open the EU AI Act overview",
      ctaHref: "/predpisy/eu-ai-act",
      summary:
        "The EU AI Act separates prohibited practices, high-risk systems, and ordinary AI use. Even everyday generative AI use needs clear rules, training, and records.",
      sections: [
        {
          heading: "Start with an AI inventory",
          body: [
            "List every AI tool used in the company: ChatGPT, Microsoft Copilot, HR screening, scoring, customer support, and internal automations. For each tool, define the owner, purpose, input data, and expected impact.",
            "The inventory helps separate ordinary productivity use from high-risk scenarios that require stricter documentation and human oversight.",
          ],
          bullets: [
            "AI tool name and provider",
            "Purpose of use and responsible owner",
            "Type of data processed",
            "Risk for customers, employees, or decision-making",
          ],
        },
        {
          heading: "AI literacy",
          body: [
            "Companies need to show that people using AI understand system limits, hallucination risk, personal data rules, and human review requirements.",
            "A short training session is not enough by itself. Keep a record of attendance, training version, and acknowledgement of the internal AI policy.",
          ],
        },
        {
          heading: "Policy and control points",
          body: [
            "An internal AI policy should explain what is allowed, what is forbidden, who approves new AI use, and how incidents or incorrect outputs are handled. Practical teams connect the policy to a checklist of controls and evidence.",
          ],
        },
      ],
    },
    {
      slug: "gdpr-checklist-pro-audit",
      title: "GDPR checklist for an auditable company",
      description:
        "A checklist for ROPA, processors, data subject rights, DPIA, and 72-hour breach notification.",
      category: "GDPR",
      publishedAt: "2026-04-30",
      readTime: "3 min",
      regulationHref: "/predpisy/gdpr",
      ctaTitle: "Turn the GDPR checklist into ROPA and evidence",
      ctaBody: "Keep processing records, processors, DPIAs, and incidents as living records tied to systems and owners.",
      ctaButton: "Open the GDPR overview",
      ctaHref: "/predpisy/gdpr",
      summary:
        "A GDPR audit does not rest on one privacy policy. You need a processing inventory, processor contracts, a data subject rights process, and evidence of security measures.",
      sections: [
        {
          heading: "Records of processing",
          body: [
            "ROPA is the operational map of personal data. For each processing activity, record the purpose, legal basis, data categories, recipients, retention period, and transfers outside the EU.",
            "The most common weak spot is an outdated tool list. CRM, analytics, helpdesk, accounting, and HR systems change more often than legal documentation.",
          ],
          bullets: [
            "Customer data and CRM",
            "HR and payroll",
            "Marketing tools",
            "Analytics and support",
          ],
        },
        {
          heading: "Processors and security",
          body: [
            "Every significant supplier that handles personal data needs a documented relationship: contract, DPA, security description, and ideally a recurring risk review.",
            "Security controls should cover MFA, access rights, backups, incident response, and encryption where it matches the processing risk.",
          ],
        },
        {
          heading: "Incidents and 72 hours",
          body: [
            "For a personal data incident, time matters. You need a log, a decision on notification duty, a list of affected data, and a prepared notification template for the data protection authority.",
          ],
        },
      ],
    },

    {
      slug: "dodavatelsky-risk-checklist",
      title: "Vendor risk checklist: what to ask critical suppliers",
      description:
        "A practical evidence list for suppliers that process data, operate important services, or appear in customer security reviews.",
      category: "NIS2",
      publishedAt: "2026-05-03",
      readTime: "3 min",
      author: "Marco Zoratto",
      authorRole: "founder of Splnit.eu",
      regulationHref: "/predpisy/nis2",
      ctaTitle: "Turn supplier reviews into recurring controls",
      ctaBody: "Splnit.eu helps track suppliers, risks, contracts, and security evidence as a recurring process instead of a one-off questionnaire.",
      ctaButton: "Open the NIS2 overview",
      ctaHref: "/predpisy/nis2",
      summary:
        "Supplier risk management is more than a contact spreadsheet. If a vendor touches data, identities, or operations, you need to know what they provide, how risky they are, and when their security posture was last checked.",
      sections: [
        {
          heading: "Which suppliers to review first",
          body: [
            "Start with suppliers that access personal data, production systems, identities, logs, or services that matter to customers. For small teams, ten well-reviewed critical suppliers are more useful than fifty stale records.",
            "For each supplier, record the internal owner, access type, data or service affected, and the impact of outage or incident.",
          ],
          bullets: [
            "cloud, hosting, identity provider, and monitoring",
            "CRM, support, accounting, and marketing tools",
            "external development, IT administration, and security services",
            "suppliers you mention in tenders, DPAs, or customer questionnaires",
          ],
        },
        {
          heading: "What evidence to request",
          body: [
            "Not every supplier needs the same evidence pack. For lower risk, a security page and DPA may be enough. For higher risk, ask for certifications, incident response details, subprocessors, data location, and a security contact.",
            "Store not only the document but also the review date, outcome, exceptions, and next review date. Without that, vendor reviews go stale quickly.",
          ],
        },
        {
          heading: "How it connects to NIS2 and GDPR",
          body: [
            "NIS2 pushes supply-chain risk management; GDPR pushes processor and transfer accountability. A practical register should show both: the operational risk of the supplier and the legal relationship around personal data.",
          ],
        },
      ],
    },
    {
      slug: "incident-response-cviceni",
      title: "Incident response tabletop: how to prove the plan works",
      description:
        "How to run a short incident exercise, which roles to involve, and what evidence to keep afterwards.",
      category: "GDPR",
      publishedAt: "2026-05-04",
      readTime: "3 min",
      author: "Marco Zoratto",
      authorRole: "founder of Splnit.eu",
      regulationHref: "/predpisy/gdpr",
      ctaTitle: "Turn incident response into a tested process",
      ctaBody: "Splnit.eu keeps roles, scenarios, decisions, evidence, and follow-up actions together so the plan is not just a document in a folder.",
      ctaButton: "Open the GDPR overview",
      ctaHref: "/predpisy/gdpr",
      summary:
        "An incident response plan is useful only when the team can use it. A short tabletop shows whether people know who decides, where contacts live, and how to document the impact on data or services.",
      sections: [
        {
          heading: "Choose a realistic scenario",
          body: [
            "You do not need a full-day crisis simulation. Choose a scenario that matches your operations: a compromised admin account, data leak from support tooling, ransomware on shared storage, or outage of a critical SaaS supplier.",
            "The goal is not to catch people out. It is to find gaps in contacts, roles, decisions, and evidence. The exercise should end with concrete actions, not only a feeling that the topic was discussed.",
          ],
          bullets: [
            "who leads the incident and who talks to customers",
            "where technical logs are and who can access them",
            "who decides whether to notify an authority or customer",
            "how decisions, timeline, and follow-up actions are stored",
          ],
        },
        {
          heading: "What to record during the exercise",
          body: [
            "Keep a simple timeline: when the incident was detected, who was escalated, which information was missing, and which decisions were made. For personal data, record how the team assessed notification duty and risk to data subjects.",
            "Afterwards, store the notes, action items, owners, and next review date. This is evidence that the plan exists and has been tested.",
          ],
        },
        {
          heading: "What a good result looks like",
          body: [
            "A good exercise does not mean zero findings. It should reveal weak spots before a real incident does. The important part is that every gap has an owner, a deadline, and a follow-up control.",
          ],
        },
      ],
    },
  ],
  "it-IT": [
    {
      slug: "nis2-pruvodce-pro-msp",
      title: "NIS2 per PMI: guida pratica",
      description:
        "Quando NIS2 riguarda una PMI, cosa preparare per l'autorità competente e come iniziare con controlli auditabili.",
      category: "NIS2",
      publishedAt: "2026-04-28",
      readTime: "2 min",
      regulationHref: "/predpisy/nis2",
      ctaTitle: "Trasforma NIS2 in una prima checklist controlli",
      ctaBody: "Parti da MFA, incident response e fornitori: Splnit.eu li collega a controlli, owner ed evidenze verificabili nel tempo.",
      ctaButton: "Apri la panoramica NIS2",
      ctaHref: "/predpisy/nis2",
      summary:
        "NIS2 non è solo un obbligo legale. Per le PMI significa controlli di sicurezza misurabili, evidenze sulla gestione del rischio e capacità di rispondere rapidamente agli incidenti.",
      sections: [
        {
          heading: "Quando iniziare",
          body: [
            "Iniziate valutando settore, dimensione aziendale e ruolo nella catena di fornitura. Anche un'azienda fuori dalla regolazione diretta può subire pressione dai clienti che chiedono processi cybersecurity dimostrabili.",
            "Il primo passo pratico è un inventario di sistemi e responsabili. Senza questo è difficile decidere dove serve MFA, chi gestisce gli incidenti e quali evidenze chiederà un auditor o un cliente.",
          ],
          bullets: [
            "Assegnate una persona responsabile della cybersecurity.",
            "Elencate sistemi chiave, identità e fornitori.",
            "Introducete controlli ricorrenti su MFA, backup e incident response.",
          ],
        },
        {
          heading: "Cosa deve essere dimostrabile",
          body: [
            "L'autorità non guarderà solo l'esistenza di una policy. Servono registri che mostrino che un controllo gira davvero, quando è stato verificato l'ultima volta e chi ha gestito le eccezioni.",
            "Evidenze tipiche sono export dall'identity provider, registri di access review, incident log, report vulnerabilità e policy sicurezza approvate.",
          ],
        },
        {
          heading: "Come farlo diventare processo",
          body: [
            "NIS2 si può gestire come un set di controlli ripetibili. Ogni controllo ha owner, stato, evidenza e prossima revisione. Così la compliance non diventa un progetto una tantum che invecchia dopo l'audit.",
          ],
        },
      ],
    },
    {
      slug: "eu-ai-act-pruvodce-pro-msp",
      title: "EU AI Act per PMI: cosa preparare nel 2026",
      description:
        "Panoramica pratica per aziende che usano AI generativa, automazione HR o altri sistemi AI.",
      category: "EU AI Act",
      publishedAt: "2026-04-29",
      readTime: "2 min",
      regulationHref: "/predpisy/eu-ai-act",
      ctaTitle: "Trasforma l'articolo AI Act in inventario AI",
      ctaBody: "Traccia strumenti AI, owner, finalità, rischi e formazione prima che nuovi usi restino senza responsabilità.",
      ctaButton: "Apri la panoramica EU AI Act",
      ctaHref: "/predpisy/eu-ai-act",
      summary:
        "L'EU AI Act distingue pratiche vietate, sistemi ad alto rischio e uso ordinario dell'AI. Anche l'uso quotidiano di AI generativa richiede regole chiare, formazione e registri.",
      sections: [
        {
          heading: "Iniziate dall'inventario AI",
          body: [
            "Elencate tutti gli strumenti AI usati in azienda: ChatGPT, Microsoft Copilot, screening HR, scoring, customer support e automazioni interne. Per ogni strumento definite owner, finalità, dati in input e impatto atteso.",
            "L'inventario aiuta a distinguere l'uso produttivo ordinario dagli scenari ad alto rischio dove servono documentazione più rigorosa e supervisione umana.",
          ],
          bullets: [
            "Nome dello strumento AI e fornitore",
            "Finalità d'uso e owner responsabile",
            "Tipo di dati trattati",
            "Rischio per clienti, dipendenti o decisioni",
          ],
        },
        {
          heading: "AI literacy",
          body: [
            "Le aziende devono poter mostrare che le persone che usano AI capiscono limiti del sistema, rischio di allucinazioni, regole sui dati personali e requisiti di controllo umano.",
            "Una breve formazione da sola non basta. Conservate registro presenze, versione della formazione e conferma della policy AI interna.",
          ],
        },
        {
          heading: "Policy e punti di controllo",
          body: [
            "Una policy AI interna dovrebbe spiegare cosa è consentito, cosa è vietato, chi approva nuovi usi dell'AI e come vengono gestiti incidenti o output errati. I team pratici collegano la policy a una checklist di controlli ed evidenze.",
          ],
        },
      ],
    },
    {
      slug: "gdpr-checklist-pro-audit",
      title: "Checklist GDPR per un'azienda auditabile",
      description:
        "Checklist per registro trattamenti, responsabili, diritti degli interessati, DPIA e notifica data breach entro 72 ore.",
      category: "GDPR",
      publishedAt: "2026-04-30",
      readTime: "3 min",
      regulationHref: "/predpisy/gdpr",
      ctaTitle: "Trasforma la checklist GDPR in registri ed evidenze",
      ctaBody: "Mantieni trattamenti, responsabili, DPIA e incidenti come record vivi collegati a sistemi e owner.",
      ctaButton: "Apri la panoramica GDPR",
      ctaHref: "/predpisy/gdpr",
      summary:
        "Un audit GDPR non si regge su una sola privacy policy. Servono inventario trattamenti, contratti con responsabili, processo diritti degli interessati ed evidenze sulle misure di sicurezza.",
      sections: [
        {
          heading: "Registro dei trattamenti",
          body: [
            "Il registro dei trattamenti è la mappa operativa dei dati personali. Per ogni attività registrate finalità, base giuridica, categorie di dati, destinatari, tempi di conservazione e trasferimenti fuori UE.",
            "Il punto debole più comune è una lista strumenti non aggiornata. CRM, analytics, helpdesk, contabilità e sistemi HR cambiano più spesso della documentazione legale.",
          ],
          bullets: [
            "Dati clienti e CRM",
            "HR e paghe",
            "Strumenti marketing",
            "Analytics e supporto",
          ],
        },
        {
          heading: "Responsabili e sicurezza",
          body: [
            "Ogni fornitore importante che tratta dati personali deve avere un rapporto documentato: contratto, DPA, descrizione sicurezza e idealmente una revisione periodica del rischio.",
            "I controlli di sicurezza dovrebbero coprire MFA, diritti di accesso, backup, incident response e cifratura dove coerente col rischio del trattamento.",
          ],
        },
        {
          heading: "Incidenti e 72 ore",
          body: [
            "In un incidente sui dati personali il tempo conta. Servono log, decisione sull'obbligo di notifica, lista dei dati coinvolti e un modello di comunicazione pronto per l'autorità privacy.",
          ],
        },
      ],
    },

    {
      slug: "dodavatelsky-risk-checklist",
      title: "Checklist vendor risk: cosa chiedere ai fornitori critici",
      description:
        "Una lista pratica di evidenze per fornitori che trattano dati, gestiscono servizi importanti o compaiono nelle verifiche sicurezza dei clienti.",
      category: "NIS2",
      publishedAt: "2026-05-03",
      readTime: "3 min",
      author: "Marco Zoratto",
      authorRole: "fondatore di Splnit.eu",
      regulationHref: "/predpisy/nis2",
      ctaTitle: "Trasforma le review fornitori in controlli ricorrenti",
      ctaBody: "Splnit.eu aiuta a tracciare fornitori, rischi, contratti ed evidenze sicurezza come processo ricorrente invece di un questionario una tantum.",
      ctaButton: "Apri la panoramica NIS2",
      ctaHref: "/predpisy/nis2",
      summary:
        "La gestione del rischio fornitori non è una semplice lista contatti. Se un vendor tocca dati, identità o operazioni, dovete sapere cosa fornisce, quanto è rischioso e quando è stata verificata l'ultima volta la sua postura sicurezza.",
      sections: [
        {
          heading: "Quali fornitori verificare per primi",
          body: [
            "Partite dai fornitori che accedono a dati personali, sistemi produttivi, identità, log o servizi rilevanti per i clienti. Per team piccoli, dieci fornitori critici ben verificati valgono più di cinquanta record non aggiornati.",
            "Per ogni fornitore registrate owner interno, tipo di accesso, dati o servizio impattato e impatto di un downtime o incidente.",
          ],
          bullets: [
            "cloud, hosting, identity provider e monitoring",
            "CRM, supporto, contabilità e strumenti marketing",
            "sviluppo esterno, amministrazione IT e servizi sicurezza",
            "fornitori citati in tender, DPA o questionari clienti",
          ],
        },
        {
          heading: "Quali evidenze richiedere",
          body: [
            "Non tutti i fornitori devono inviare lo stesso pacchetto. Per rischio basso possono bastare pagina sicurezza e DPA. Per rischio più alto chiedete certificazioni, dettagli incident response, sub-responsabili, localizzazione dati e contatto sicurezza.",
            "Conservate non solo il documento, ma anche data della review, esito, eccezioni e prossima scadenza. Senza questo, le review vendor diventano obsolete rapidamente.",
          ],
        },
        {
          heading: "Collegamento con NIS2 e GDPR",
          body: [
            "NIS2 spinge sulla gestione del rischio nella supply chain; GDPR su responsabili e trasferimenti. Un registro pratico dovrebbe mostrare entrambi: rischio operativo del fornitore e relazione giuridica sui dati personali.",
          ],
        },
      ],
    },
    {
      slug: "incident-response-cviceni",
      title: "Esercitazione incident response: provare che il piano funziona",
      description:
        "Come fare una breve tabletop exercise, quali ruoli coinvolgere e quali evidenze conservare dopo l'esercitazione.",
      category: "GDPR",
      publishedAt: "2026-05-04",
      readTime: "3 min",
      author: "Marco Zoratto",
      authorRole: "fondatore di Splnit.eu",
      regulationHref: "/predpisy/gdpr",
      ctaTitle: "Trasforma incident response in processo verificato",
      ctaBody: "Splnit.eu tiene insieme ruoli, scenari, decisioni, evidenze e azioni successive, così il piano non resta solo un documento in una cartella.",
      ctaButton: "Apri la panoramica GDPR",
      ctaHref: "/predpisy/gdpr",
      summary:
        "Un piano di incident response vale quando il team sa usarlo. Una breve esercitazione mostra se le persone sanno chi decide, dove sono i contatti e come documentare l'impatto su dati o servizi.",
      sections: [
        {
          heading: "Scegliete uno scenario realistico",
          body: [
            "Non serve una simulazione di crisi di un'intera giornata. Scegliete uno scenario coerente con le operazioni: account admin compromesso, fuga dati da support tool, ransomware su storage condiviso o downtime di un SaaS critico.",
            "L'obiettivo non è mettere in difficoltà il team. È trovare gap in contatti, ruoli, decisioni ed evidenze. L'esercitazione deve chiudersi con azioni concrete, non solo con la sensazione di aver discusso il tema.",
          ],
          bullets: [
            "chi guida l'incidente e chi comunica con i clienti",
            "dove sono i log tecnici e chi può accedervi",
            "chi decide se notificare autorità o clienti",
            "come vengono salvati decisioni, timeline e azioni successive",
          ],
        },
        {
          heading: "Cosa registrare durante l'esercitazione",
          body: [
            "Mantenete una timeline semplice: quando è stato rilevato l'incidente, chi è stato coinvolto, quali informazioni mancavano e quali decisioni sono state prese. Per dati personali, registrate come il team ha valutato obbligo di notifica e rischio per gli interessati.",
            "Dopo, salvate note, action item, owner e prossima data di review. Queste sono evidenze che il piano esiste ed è stato testato.",
          ],
        },
        {
          heading: "Come appare un buon risultato",
          body: [
            "Un buon esercizio non significa zero finding. Deve far emergere punti deboli prima di un incidente reale. La parte importante è che ogni gap abbia owner, scadenza e controllo successivo.",
          ],
        },
      ],
    },
  ],
};

export function getBlogPageCopy(locale: Locale) {
  return blogPageCopy[locale] ?? blogPageCopy["cs-CZ"];
}

export function getBlogPosts(locale: Locale = "cs-CZ") {
  return posts[locale] ?? posts["cs-CZ"];
}

export function getBlogPost(slug: string, locale: Locale = "cs-CZ") {
  return getBlogPosts(locale).find((post) => post.slug === slug);
}
