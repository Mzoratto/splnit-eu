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
    extraSections: {
      title: string;
      body: string;
    }[];
  };
  trustCenter: {
    title: string;
    body: string;
    cta: string;
    badges: string[];
    extraSections: {
      title: string;
      body: string;
    }[];
  };
  trustBadges: string[];
  finalNote: string;
};

const copy: Record<Locale, PlatformCopy> = {
  "cs-CZ": {
    metadata: {
      description:
        "Technická platforma Splnit.eu pro ověřené kontroly, evidence vault a dokumenty pro NIS2, GDPR a ISO 27001.",
      locale: "cs_CZ",
      title:
        "Platforma | Splnit.eu — ověřené kontroly pro cloud, identity a ERP",
    },
    jsonLdDescription:
      "Platforma Splnit.eu podporuje compliance kontroly, evidence vault a Trust Center pro NIS2, EU AI Act, GDPR a ISO 27001 podle ověřených zdrojů.",
    pageName: "Splnit.eu Platforma",
    hero: {
      body:
        "Připojte ověřené integrace nebo český ERP workspace podle dostupnosti a oprávnění. Splnit.eu pomáhá kontrolovat bezpečnostní nastavení a ukládat auditní záznamy bez tvrzení nad rámec dostupných důkazů.",
      cta: "Rezervovat demo",
      tag: "Pro vývojáře",
      title: "Kontroly pro systémy, které už používáte.",
    },
    steps: [
      {
        body: "Ověřené integrace a české ERP workspaces podle dostupnosti, prostředí a oprávnění.",
        icon: "solar:plug-linear",
        title: "Připojte nástroje",
      },
      {
        body:
          "Kontroly pro dostupné propojené systémy se ukládají jako důkazy ke kontrole.",
        icon: "solar:cpu-linear",
        title: "Kontroly běží tam, kde jsou nakonfigurované",
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
        "Ruční sběr důkazů zůstává možný. Automatizaci popisujeme jako dostupnou jen u ověřených integrací a oprávnění.",
      bullets: [
        "Cloudové a identity integrace podle ověřené konfigurace",
        "Infrastrukturní konektory podle dostupných pověření",
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
          body: "API snapshoty z nakonfigurovaných integrací uložené jako důkaz.",
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
      extraSections: [
        {
          body:
            "GAP analýza, prohlášení o aplikovatelnosti (SoA) a vendor report se generují z dat dostupných v platformě. Výstup je předvyplněný a vyžaduje kontrolu před sdílením s auditorem.",
          title: "Generování dokumentů z dat platformy",
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
      extraSections: [
        {
          body:
            "Vytvořte pojmenovaný odkaz pro každého zákazníka nebo auditora. Každý přístup má vlastní výběr viditelných předpisů a sledování počtu otevření. Odkaz lze kdykoli zrušit.",
          title: "Klientské přístupy",
        },
      ],
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
        "The Splnit.eu platform for verified checks, evidence vault, and documents for NIS2, GDPR, and ISO 27001.",
      locale: "en_EU",
      title:
        "Platform | Splnit.eu — verified checks for cloud, identity, and ERP",
    },
    jsonLdDescription:
      "Splnit.eu supports compliance checks, evidence collection, and Trust Center workflows for NIS2, EU AI Act, GDPR, and ISO 27001 according to verified sources.",
    pageName: "Splnit.eu Platform",
    hero: {
      body:
        "Connect verified integrations or a Czech ERP workspace according to availability and permissions. Splnit.eu helps check security settings and store audit records without stronger claims than the available evidence supports.",
      cta: "Book a demo",
      tag: "Developer First",
      title: "Checks for the systems you already use.",
    },
    steps: [
      {
        body: "Verified integrations and Czech ERP workspaces, depending on availability, environment, and permissions.",
        icon: "solar:plug-linear",
        title: "Connect tools",
      },
      {
        body:
          "Checks for available connected systems are stored as evidence for review.",
        icon: "solar:cpu-linear",
        title: "Checks run where configured",
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
        "Manual evidence collection remains available. Automation is described as available only for verified integrations and permissions.",
      bullets: [
        "Cloud and identity integrations according to verified configuration",
        "Infrastructure connectors according to available credentials",
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
          body: "API snapshots from configured integrations stored as evidence.",
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
      extraSections: [
        {
          body:
            "GAP analysis, Statement of Applicability (SoA), and vendor reports are generated from data available in the platform. The output is pre-filled and must be reviewed before auditor sharing.",
          title: "Document generation from platform data",
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
      extraSections: [
        {
          body:
            "Create a named link for each customer or auditor. Each access has its own visible-regulation selection and open-count tracking. The link can be revoked at any time.",
          title: "Client access links",
        },
      ],
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
        "La piattaforma Splnit.eu per controlli verificati, archivio evidenze e documenti per NIS2, GDPR e ISO 27001. Le fonti normative locali vengono aggiunte solo dopo verifica.",
      locale: "it_IT",
      title:
        "Piattaforma | Splnit.eu — controlli verificati per cloud, identity ed ERP",
    },
    jsonLdDescription:
      "Splnit.eu supporta controlli di compliance, raccolta evidenze e workflow Trust Center per NIS2, EU AI Act, GDPR e ISO 27001 secondo fonti verificate.",
    pageName: "Splnit.eu Piattaforma",
    hero: {
      body:
        "Collegate integrazioni verificate o un workspace ERP ceco in base a disponibilità e permessi. Splnit.eu aiuta a controllare le impostazioni di sicurezza e conservare evidenze senza claim più forti delle prove disponibili.",
      cta: "Prenota demo",
      tag: "Pensato per sviluppatori",
      title: "Controlli per i sistemi che usate già.",
    },
    steps: [
      {
        body: "Integrazioni verificate e workspace ERP cechi, in base a disponibilità, ambiente e permessi.",
        icon: "solar:plug-linear",
        title: "Collegate gli strumenti",
      },
      {
        body:
          "I controlli sui sistemi collegati disponibili vengono salvati come evidenze da revisionare.",
        icon: "solar:cpu-linear",
        title: "I controlli girano dove configurati",
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
        "La raccolta manuale delle evidenze resta disponibile. Descriviamo l'automazione come disponibile solo per integrazioni e permessi verificati.",
      bullets: [
        "Integrazioni cloud e identity in base a configurazione verificata",
        "Connettori infrastrutturali in base alle credenziali disponibili",
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
          body: "Snapshot API dalle integrazioni configurate salvati come evidenza.",
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
      extraSections: [
        {
          body:
            "GAP analysis, dichiarazione di applicabilità (SoA) e vendor report vengono generati dai dati disponibili nella piattaforma. L'output è precompilato e deve essere revisionato prima della condivisione con revisori.",
          title: "Generazione documenti dai dati della piattaforma",
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
      extraSections: [
        {
          body:
            "Create un link nominativo per ogni cliente o revisore. Ogni accesso ha una propria selezione di normative visibili e il conteggio delle aperture. Il link può essere revocato in qualsiasi momento.",
          title: "Accessi cliente",
        },
      ],
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
