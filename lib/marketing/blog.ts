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

const posts: Record<Locale, BlogPost[]> = {
  "cs-CZ": [
    ...czechNukibRegistrationPosts,
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
