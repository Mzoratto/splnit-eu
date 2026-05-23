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
        "Platforma | Splnit.eu — automatické kontroly pro cloud, identity a ERP",
    },
    jsonLdDescription:
      "Platforma Splnit.eu automatizuje compliance testy, evidence vault a Trust Center pro NIS2, EU AI Act, GDPR a ISO 27001.",
    pageName: "Splnit.eu Platforma",
    hero: {
      body:
        "Připojte Microsoft 365, GitHub, AWS, Hetzner Cloud, OVHcloud nebo český ERP workspace. Splnit.eu pomáhá průběžně kontrolovat bezpečnostní nastavení a ukládat auditní záznamy.",
      cta: "Rezervovat demo",
      tag: "Pro vývojáře",
      title: "Automatické kontroly pro systémy, které už používáte.",
    },
    steps: [
      {
        body: "Microsoft 365, GitHub, AWS, Hetzner Cloud, OVHcloud a české ERP workspaces podle dostupnosti a oprávnění.",
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
          "Dashboard, upozornění na selhání a dokumentace ke kontrole — vše na jednom místě.",
        icon: "solar:document-check-linear",
        title: "Dostanete výsledky",
      },
    ],
    integrations: {
      available: "Dostupné integrace",
      body:
        "Nevěříme na ruční sběr důkazů. Splnit.eu se nativně připojuje k vašim identity providerům, cloudovým platformám a interním systémům.",
      bullets: [
        "Cloudové a identity integrace: Microsoft 365, GitHub a AWS",
        "Infrastrukturní konektory: Hetzner Cloud a OVHcloud",
        "České ERP pracovní prostory: Pohoda, Money S3 / S4, Helios a ABRA Flexi s mapováním na ZoKB",
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
        "Jedna MFA kontrola pro všechny uživatele může podporovat NIS2 čl. 21(2)(j), ISO 27001 A.9.4.2 a GDPR čl. 32(1)(b), pokud odpovídá vašemu rozsahu a důkazům. Přidání každého dalšího předpisu znamená doplnit mapování, ne začínat z prázdné tabulky.",
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
      tag: "Úložiště evidencí",
      title: "Auditní záznamy. Automaticky.",
    },
    trustCenter: {
      badges: ["NIS2 demo", "GDPR demo", "ISO 27001 demo", "EU AI Act demo"],
      body:
        "Zákazníci a partneři mohou vidět vámi publikovaný přehled stavu kontrol. Odkaz níže otevírá pouze ukázkový Trust Center.",
      cta: "Zobrazit ukázkový Trust Center →",
      title: "Trust Center — zveřejněte přehled stavu svých kontrol.",
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
        "Platform | Splnit.eu — automated checks for cloud, identity, and ERP",
    },
    jsonLdDescription:
      "Splnit.eu automates compliance checks, evidence collection, and Trust Center workflows for NIS2, EU AI Act, GDPR, and ISO 27001.",
    pageName: "Splnit.eu Platform",
    hero: {
      body:
        "Connect Microsoft 365, GitHub, AWS, Hetzner Cloud, OVHcloud, or a Czech ERP workspace. Splnit.eu helps check security settings over time and store audit records.",
      cta: "Book a demo",
      tag: "Developer First",
      title: "Automated checks for the systems you already use.",
    },
    steps: [
      {
        body: "Microsoft 365, GitHub, AWS, Hetzner Cloud, OVHcloud, and Czech ERP workspaces, depending on available integrations and permissions.",
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
          "Dashboard, failure alerts, and review documentation in one place.",
        icon: "solar:document-check-linear",
        title: "Get results",
      },
    ],
    integrations: {
      available: "Available integrations",
      body:
        "Manual evidence collection does not scale. Splnit.eu connects directly to identity providers, cloud platforms, and internal systems.",
      bullets: [
        "Cloud and identity integrations: Microsoft 365, GitHub and AWS",
        "Infrastructure connectors: Hetzner Cloud and OVHcloud",
        "Czech ERP workspaces: Pohoda, Money S3 / S4, Helios, and ABRA Flexi mapped to ZoKB obligations",
        "In-app alerts on failed controls",
        "Local regulatory sources where verified",
        "API-first architecture for custom internal tools",
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
        "Customers and partners can see the control-status summary you choose to publish. The link below opens a sample Trust Center only.",
      cta: "View sample Trust Center →",
      title: "Trust Center — publish a control-posture summary.",
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
        "Piattaforma | Splnit.eu — controlli automatici per cloud, identity ed ERP",
    },
    jsonLdDescription:
      "Splnit.eu automatizza controlli di compliance, raccolta evidenze e workflow Trust Center per NIS2, EU AI Act, GDPR e ISO 27001. Le fonti locali vengono mostrate solo quando verificate.",
    pageName: "Splnit.eu Piattaforma",
    hero: {
      body:
        "Collegate Microsoft 365, GitHub, AWS, Hetzner Cloud, OVHcloud o un workspace ERP ceco. Splnit.eu aiuta a controllare le impostazioni di sicurezza nel tempo e a conservare evidenze di audit, con riferimenti normativi aggiunti solo quando verificati.",
      cta: "Prenota demo",
      tag: "Pensato per sviluppatori",
      title: "Controlli automatici per i sistemi che usate già.",
    },
    steps: [
      {
        body: "Microsoft 365, GitHub, AWS, Hetzner Cloud, OVHcloud e workspace ERP cechi, in base alle integrazioni e ai permessi disponibili.",
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
          "Dashboard, alert sui fallimenti e documentazione per revisione in un unico posto.",
        icon: "solar:document-check-linear",
        title: "Ricevete i risultati",
      },
    ],
    integrations: {
      available: "Integrazioni disponibili",
      body:
        "La raccolta manuale delle evidenze non scala. Splnit.eu si collega direttamente a identity provider, piattaforme cloud e sistemi interni.",
      bullets: [
        "Integrazioni cloud e identity: Microsoft 365, GitHub e AWS",
        "Connettori infrastrutturali: Hetzner Cloud e OVHcloud",
        "Spazi di lavoro ERP cechi: Pohoda, Money S3 / S4, Helios e ABRA Flexi mappati sugli obblighi ZoKB",
        "Avvisi in-app per controlli falliti",
        "Fonti normative locali dove verificate",
        "Architettura API-first per strumenti interni personalizzati",
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
      tag: "Archivio evidenze",
      title: "Evidenze per audit. Automatiche.",
    },
    trustCenter: {
      badges: ["Demo NIS2", "Demo GDPR", "Demo ISO 27001", "Demo EU AI Act"],
      body:
        "Clienti e partner possono vedere il riepilogo dello stato controlli che scegliete di pubblicare. Il link sotto apre solo un Trust Center di esempio.",
      cta: "Vedi Trust Center di esempio →",
      title: "Trust Center — pubblicate un riepilogo dello stato dei controlli.",
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
