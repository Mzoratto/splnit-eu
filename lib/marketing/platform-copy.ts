import type { Locale } from "@/i18n/routing";

export type PlatformCopy = {
  metadata: {
    description: string;
    locale: string;
    title: string;
  };
  jsonLdDescription: string;
  pageName: string;
  hero: {
    cta: string;
    tag: string;
    title: string;
    body: string;
  };
  steps: {
    icon: string;
    title: string;
    body: string;
  }[];
  integrations: {
    tag: string;
    title: string;
    body: string;
    available: string;
    localSourcesTitle: string;
    localSourcesBadge: string;
    localSourcesBody: string;
    bullets: string[];
  };
  crossMapping: {
    tag: string;
    title: string;
    body: string;
    references: string[];
    stats: string[];
  };
  evidence: {
    tag: string;
    title: string;
    cards: {
      icon: string;
      title: string;
      body: string;
    }[];
  };
  trustCenter: {
    title: string;
    body: string;
    cta: string;
    badges: string[];
  };
  trustBadges: string[];
  finalNote: string;
};

const copy: Record<Locale, PlatformCopy> = {
  "cs-CZ": {
    metadata: {
      description:
        "Technická platforma Splnit.eu pro automatické kontroly, evidence vault a dokumenty pro NIS2, GDPR a ISO 27001.",
      locale: "cs_CZ",
      title:
        "Platforma | Splnit.eu — automatické kontroly pro Microsoft 365, AWS a GitHub",
    },
    jsonLdDescription:
      "Platforma Splnit.eu automatizuje compliance testy, evidence vault a Trust Center pro NIS2, EU AI Act, GDPR a ISO 27001.",
    pageName: "Splnit.eu Platforma",
    hero: {
      body:
        "Připojte Microsoft 365, GitHub nebo AWS jednou. Splnit.eu testuje vaše bezpečnostní kontroly nepřetržitě a generuje auditní záznamy automaticky.",
      cta: "Rezervovat demo",
      tag: "Developer First",
      title: "Automatické kontroly pro systémy, které už používáte.",
    },
    steps: [
      {
        body: "Microsoft 365, GitHub, AWS nebo Google Workspace. Nastavení za 5 minut.",
        icon: "solar:plug-linear",
        title: "Připojte nástroje",
      },
      {
        body:
          "Kontroly pro připojené systémy běží průběžně a výsledky se ukládají jako důkazy.",
        icon: "solar:cpu-linear",
        title: "Testy běží automaticky",
      },
      {
        body:
          "Dashboard, upozornění na selhání a dokumentace pro auditora — vše na jednom místě.",
        icon: "solar:document-check-linear",
        title: "Dostanete výsledky",
      },
    ],
    integrations: {
      available: "Dostupné integrace",
      body:
        "Nevěříme na ruční sběr důkazů. Splnit.eu se nativně připojuje k vašim identity providerům, cloudovým platformám a interním systémům.",
      bullets: [
        "Integrace pro Microsoft 365, GitHub a AWS",
        "Upozornění na selhání kontrol v aplikaci",
        "Lokální regulatorní zdroje tam, kde jsou ověřené",
        "API-first architektura pro vlastní interní nástroje",
      ],
      localSourcesBadge: "🇨🇿 Pouze pro ČR",
      localSourcesBody:
        "NÚKIB pro český obsah, další jurisdikce po ověření",
      localSourcesTitle: "Lokální regulatorní zdroje",
      tag: "Integrace",
      title: "Připojte nástroje, které již používáte.",
    },
    crossMapping: {
      body:
        "MFA kontrola pro všechny uživatele splňuje NIS2 čl. 21(2)(j), ISO 27001 A.9.4.2 a GDPR čl. 32(1)(b) najednou. Přidání každého dalšího předpisu znamená doplnit mapování, ne začínat z prázdné tabulky.",
      references: ["NIS2 čl. 21(2)(j)", "ISO 27001 A.9.4.2", "GDPR čl. 32(1)(b)"],
      stats: ["Jedna evidence", "Více předpisů", "Průběžné kontroly"],
      tag: "Křížové mapování",
      title: "Jeden test. Tři předpisy.",
    },
    evidence: {
      cards: [
        {
          body: "API snapshoty z každé integrace uloženy jako důkaz.",
          icon: "solar:cloud-download-linear",
          title: "Automatický sběr",
        },
        {
          body: "Nahrajte PDF, screenshoty nebo podepsané záznamy.",
          icon: "solar:folder-with-files-linear",
          title: "Manuální nahrávání",
        },
        {
          body: "Upozornění 30 a 7 dní před vypršením platnosti důkazu.",
          icon: "solar:calendar-check-linear",
          title: "Hlídání vypršení",
        },
      ],
      tag: "Evidence vault",
      title: "Auditní záznamy. Automaticky.",
    },
    trustCenter: {
      badges: ["NIS2 demo", "GDPR demo", "ISO 27001 demo", "EU AI Act demo"],
      body:
        "Zákazníci a partneři vidí váš compliance status v reálném čase. Méně dotazníků. Rychlejší obchody.",
      cta: "Spustit Trust Center →",
      title: "Trust Center — zveřejněte svůj soulad.",
    },
    finalNote:
      "Bezpečnostní a právní dokumentace se doplňuje podle reálného stavu před produkčním spuštěním.",
    trustBadges: [
      "Vercel hosting",
      "Neon Postgres",
      "DPA k právní kontrole",
      "Subdodavatelé evidovaní",
    ],
  },
  "en-EU": {
    metadata: {
      description:
        "The Splnit.eu platform for automated checks, evidence vault, and documents for NIS2, GDPR, and ISO 27001.",
      locale: "en_EU",
      title:
        "Platform | Splnit.eu — automated checks for Microsoft 365, AWS, and GitHub",
    },
    jsonLdDescription:
      "Splnit.eu automates compliance checks, evidence collection, and Trust Center workflows for NIS2, EU AI Act, GDPR, and ISO 27001.",
    pageName: "Splnit.eu Platform",
    hero: {
      body:
        "Connect Microsoft 365, GitHub, or AWS once. Splnit.eu continuously tests your security controls and generates audit records automatically.",
      cta: "Book a demo",
      tag: "Developer First",
      title: "Automated checks for the systems you already use.",
    },
    steps: [
      {
        body: "Microsoft 365, GitHub, AWS, or Google Workspace. Setup in 5 minutes.",
        icon: "solar:plug-linear",
        title: "Connect tools",
      },
      {
        body:
          "Checks for connected systems run continuously and store results as evidence.",
        icon: "solar:cpu-linear",
        title: "Checks run automatically",
      },
      {
        body:
          "Dashboard, failure alerts, and auditor documentation in one place.",
        icon: "solar:document-check-linear",
        title: "Get results",
      },
    ],
    integrations: {
      available: "Available integrations",
      body:
        "Manual evidence collection does not scale. Splnit.eu connects directly to identity providers, cloud platforms, and internal systems.",
      bullets: [
        "Microsoft 365, GitHub, and AWS integrations",
        "In-app alerts when checks fail",
        "Local regulatory sources where they have been verified",
        "API-first architecture for internal tools",
      ],
      localSourcesBadge: "Verified only",
      localSourcesBody:
        "Czech sources are available today; other jurisdictions are added after verification",
      localSourcesTitle: "Local regulatory sources",
      tag: "Integrations",
      title: "Connect the tools you already use.",
    },
    crossMapping: {
      body:
        "One MFA control for all users can support NIS2 Article 21(2)(j), ISO 27001 A.9.4.2, and GDPR Article 32(1)(b). Adding another regulation means adding a mapping, not starting from an empty spreadsheet.",
      references: ["NIS2 Article 21(2)(j)", "ISO 27001 A.9.4.2", "GDPR Article 32(1)(b)"],
      stats: ["One evidence item", "Multiple regulations", "Continuous checks"],
      tag: "Cross-mapping",
      title: "One check. Three regulations.",
    },
    evidence: {
      cards: [
        {
          body: "API snapshots from every integration stored as evidence.",
          icon: "solar:cloud-download-linear",
          title: "Automatic collection",
        },
        {
          body: "Upload PDFs, screenshots, or signed records manually.",
          icon: "solar:folder-with-files-linear",
          title: "Manual uploads",
        },
        {
          body: "Alerts 30 and 7 days before evidence expires.",
          icon: "solar:calendar-check-linear",
          title: "Expiry tracking",
        },
      ],
      tag: "Evidence vault",
      title: "Audit records. Automatically.",
    },
    trustCenter: {
      badges: ["NIS2 demo", "GDPR demo", "ISO 27001 demo", "EU AI Act demo"],
      body:
        "Customers and partners can see your compliance status in real time. Fewer questionnaires. Faster deals.",
      cta: "Launch Trust Center →",
      title: "Trust Center — publish your compliance posture.",
    },
    finalNote:
      "Security and legal documentation is completed according to the real production setup before launch.",
    trustBadges: [
      "Vercel hosting",
      "Neon Postgres",
      "DPA ready for legal review",
      "Sub-processors tracked",
    ],
  },
  "it-IT": {
    metadata: {
      description:
        "La piattaforma Splnit.eu per controlli automatici, archivio evidenze e documenti per NIS2, GDPR e ISO 27001. Le fonti normative locali vengono aggiunte solo dopo verifica.",
      locale: "it_IT",
      title:
        "Piattaforma | Splnit.eu — controlli automatici per Microsoft 365, AWS e GitHub",
    },
    jsonLdDescription:
      "Splnit.eu automatizza controlli di compliance, raccolta evidenze e workflow Trust Center per NIS2, EU AI Act, GDPR e ISO 27001. Le fonti locali vengono mostrate solo quando verificate.",
    pageName: "Splnit.eu Piattaforma",
    hero: {
      body:
        "Collegate una volta Microsoft 365, GitHub o AWS. Splnit.eu testa i controlli di sicurezza e genera evidenze di audit automaticamente, con riferimenti normativi aggiunti solo quando verificati.",
      cta: "Prenota demo",
      tag: "Developer First",
      title: "Controlli automatici per i sistemi che usate già.",
    },
    steps: [
      {
        body: "Microsoft 365, GitHub, AWS o Google Workspace. Setup in 5 minuti.",
        icon: "solar:plug-linear",
        title: "Collegate gli strumenti",
      },
      {
        body:
          "I controlli sui sistemi collegati girano in modo continuo e salvano i risultati come evidenze.",
        icon: "solar:cpu-linear",
        title: "I test girano automaticamente",
      },
      {
        body:
          "Dashboard, alert sui fallimenti e documentazione per auditor in un unico posto.",
        icon: "solar:document-check-linear",
        title: "Ricevete i risultati",
      },
    ],
    integrations: {
      available: "Integrazioni disponibili",
      body:
        "La raccolta manuale delle evidenze non scala. Splnit.eu si collega direttamente a identity provider, piattaforme cloud e sistemi interni.",
      bullets: [
        "Integrazioni per Microsoft 365, GitHub e AWS",
        "Alert in app quando un controllo fallisce",
        "Fonti normative locali dove sono state verificate",
        "Architettura API-first per strumenti interni",
      ],
      localSourcesBadge: "Solo verificato",
      localSourcesBody:
        "Le fonti ceche sono disponibili oggi; le fonti italiane e di altre giurisdizioni vengono aggiunte dopo verifica.",
      localSourcesTitle: "Fonti normative locali",
      tag: "Integrazioni",
      title: "Collegate gli strumenti che usate già.",
    },
    crossMapping: {
      body:
        "Un controllo MFA per tutti gli utenti può supportare NIS2 articolo 21(2)(j), ISO 27001 A.9.4.2 e GDPR articolo 32(1)(b). Aggiungere un'altra normativa significa aggiungere una mappatura, non ripartire da un foglio vuoto.",
      references: ["NIS2 articolo 21(2)(j)", "ISO 27001 A.9.4.2", "GDPR articolo 32(1)(b)"],
      stats: ["Una evidenza", "Più normative", "Controlli continui"],
      tag: "Mappatura incrociata",
      title: "Un controllo. Tre normative.",
    },
    evidence: {
      cards: [
        {
          body: "Snapshot API da ogni integrazione salvati come evidenza.",
          icon: "solar:cloud-download-linear",
          title: "Raccolta automatica",
        },
        {
          body: "Caricate PDF, screenshot o registri firmati manualmente.",
          icon: "solar:folder-with-files-linear",
          title: "Upload manuale",
        },
        {
          body: "Alert 30 e 7 giorni prima della scadenza dell'evidenza.",
          icon: "solar:calendar-check-linear",
          title: "Controllo scadenze",
        },
      ],
      tag: "Evidence vault",
      title: "Evidenze per audit. Automatiche.",
    },
    trustCenter: {
      badges: ["Demo NIS2", "Demo GDPR", "Demo ISO 27001", "Demo EU AI Act"],
      body:
        "Clienti e partner vedono il vostro stato compliance in tempo reale. Meno questionari. Trattative più rapide.",
      cta: "Avvia Trust Center →",
      title: "Trust Center — pubblicate la vostra postura compliance.",
    },
    finalNote:
      "La documentazione sicurezza e legale viene completata in base al reale setup di produzione prima del lancio.",
    trustBadges: [
      "Vercel hosting",
      "Neon Postgres",
      "DPA pronto per revisione legale",
      "Sub-responsabili tracciati",
    ],
  },
};

export function getPlatformCopy(locale: Locale) {
  return copy[locale] ?? copy["cs-CZ"];
}
