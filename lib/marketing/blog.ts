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
    articleCtaButton: "Vedi piattaforma",
    articleCtaTitle: "Trasforma l'articolo in checklist controlli",
    articleNavTitle: "Nell'articolo",
    relatedRegulationTitle: "Panoramica normativa correlata",
    relatedRegulationOpen: "Apri panoramica",
    description:
      "Articoli pratici per PMI europee che devono trasformare NIS2, EU AI Act e GDPR in controlli, evidenze e responsabilità.",
    jsonLdDescription:
      "Guide pratiche Splnit.eu su NIS2, EU AI Act, GDPR e ISO 27001 per PMI europee.",
    locale: "it_IT",
    metadataTitle: "Blog | Splnit.eu — NIS2, EU AI Act e GDPR per PMI europee",
    readArticle: "Leggi articolo",
    tag: "Guide compliance",
    title: "Guide alla compliance UE senza rumore legale.",
  },
};

const posts: Record<Locale, BlogPost[]> = {
  "cs-CZ": [
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
