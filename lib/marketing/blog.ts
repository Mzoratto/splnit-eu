export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  readTime: string;
  summary: string;
  sections: {
    heading: string;
    body: string[];
    bullets?: string[];
  }[];
};

const blogPosts: BlogPost[] = [
  {
    slug: "nis2-pruvodce-pro-msp",
    title: "NIS2 pro české MSP: praktický průvodce",
    description:
      "Kdy se NIS2 týká české firmy, co připravit pro NÚKIB a jak začít s auditovatelnými kontrolami.",
    category: "NIS2",
    publishedAt: "2026-04-30",
    readTime: "7 min",
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
    publishedAt: "2026-04-30",
    readTime: "6 min",
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
    slug: "gdpr-checklist-pro-audit",
    title: "GDPR checklist pro auditovatelnou firmu",
    description:
      "Checklist pro ROPA, zpracovatele, práva subjektů údajů, DPIA a 72hodinové hlášení incidentů.",
    category: "GDPR",
    publishedAt: "2026-04-30",
    readTime: "8 min",
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
];

export function getBlogPosts() {
  return blogPosts;
}

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
