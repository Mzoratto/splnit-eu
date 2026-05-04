import { normalizeLocale, type Locale } from "@/i18n/routing";

export type PublicTrustCopy = {
  categoryCounts: {
    notApplicable: (total: number) => string;
    verified: (verified: number, total: number) => string;
  };
  contacts: {
    disclosureDescription: string;
    disclosureMeta: string;
    disclosureTitle: string;
    vendorDescription: (orgName: string) => string;
    vendorMeta: string;
    vendorTitle: string;
  };
  detail: {
    aboutEyebrow: string;
    aboutTitle: string;
    autoTested: string;
    breadcrumbFrameworks: string;
    categoriesDescription: string;
    categoriesEmpty: string;
    categoriesEyebrow: string;
    categoriesTitle: string;
    controlsInScope: (count: number) => string;
    ctaDescription: string;
    ctaTitle: string;
    disclosureBody: string;
    disclosureTitle: string;
    effective: string;
    infoEffective: string;
    infoLaw: string;
    infoMaxPenalty: string;
    infoRegulator: string;
    lastAssessed: string;
    relatedDocumentsTitle: string;
    statusEyebrow: string;
  };
  documents: {
    description: string;
    eyebrow: string;
    request: string;
    title: string;
    view: string;
  };
  footer: {
    back: string;
    home: string;
    lastVerified: string;
    nextTest: string;
    privacy: string;
    status: string;
    terms: string;
  };
  frameworkCard: {
    auto: string;
    inProgress: string;
    lastAssessed: string;
    notApplicable: string;
    regulatorPrefix: string;
    verified: string;
    viewDetails: string;
  };
  heroActions: {
    contactSecurity: string;
    requestAccess: string;
  };
  liveIndicator: {
    last: string;
    live: string;
    next: string;
  };
  main: {
    description: string;
    frameworksBody: string;
    frameworksEyebrow: string;
    frameworksTitle: string;
    heroEyebrow: string;
    heroTitle: (orgName: string, controls: number, frameworks: number) => string;
    metadataDescription: (orgName: string) => string;
  };
  time: {
    inHours: (hours: number, minutes: number) => string;
    inMinutes: (minutes: number) => string;
    na: string;
  };
  topbar: {
    back: string;
    homeAria: string;
    verifiedBy: string;
  };
};

export const trustLocaleCodes: Record<Locale, string> = {
  "cs-CZ": "cs-CZ",
  "en-EU": "en-GB",
  "it-IT": "it-IT",
};

export const publicTrustCopy: Record<Locale, PublicTrustCopy> = {
  "cs-CZ": {
    categoryCounts: {
      notApplicable: (total) => `${total} není relevantní`,
      verified: (verified, total) => `${verified} / ${total} ověřeno`,
    },
    contacts: {
      disclosureDescription:
        "Bezpečnostní nálezy a zranitelnosti posílejte přes odpovědný disclosure kanál.",
      disclosureMeta: "PGP klíč na vyžádání · první odpověď do 24 hodin",
      disclosureTitle: "Responsible disclosure",
      vendorDescription: (orgName) =>
        `Procurement nebo bezpečnostní tým může požádat o detailnější odpovědi k ${orgName}.`,
      vendorMeta: "Odpověď obvykle do 2 pracovních dnů",
      vendorTitle: "Vendor risk assessment",
    },
    detail: {
      aboutEyebrow: "REGULATION CONTEXT",
      aboutTitle: "O tomto předpisu",
      autoTested: "Automaticky testováno každou hodinu",
      breadcrumbFrameworks: "Frameworky",
      categoriesDescription:
        "Zobrazení je záměrně agregované. Veřejný detail ukazuje stav kategorií, ne jednotlivé kontrolní identifikátory nebo důkazní soubory.",
      categoriesEmpty:
        "Pro tento framework zatím nejsou veřejné kategorie v rozsahu.",
      categoriesEyebrow: "CONTROL CATEGORIES",
      categoriesTitle: "Kategorie kontrol",
      controlsInScope: (count) => `${count} kontrol v rozsahu`,
      ctaDescription:
        "Požádejte o dokumenty, nebo pošlete bezpečnostní otázku týmu.",
      ctaTitle: "Potřebujete více informací nebo přístup k dokumentům?",
      disclosureBody:
        "Detaily konkrétních kontrol (control IDs, evidence souborů, výsledky testů, časování auditů) by mohly poskytnout útočníkům informace o konfiguraci a slabých místech. Veřejně zobrazujeme pouze agregované údaje na úrovni kategorií. Pro detailnější přístup je potřeba požádat o NDA.",
      disclosureTitle: "Proč nezobrazujeme jednotlivé kontroly?",
      effective: "účinnost",
      infoEffective: "Účinnost",
      infoLaw: "Český zákon",
      infoMaxPenalty: "Maximální pokuta",
      infoRegulator: "Regulátor",
      lastAssessed: "Poslední hodnocení",
      relatedDocumentsTitle: "Související dokumenty",
      statusEyebrow: "FRAMEWORK STATUS",
    },
    documents: {
      description:
        "Uzamčené položky jsou dostupné na žádost. Veřejné dokumenty lze zobrazit přímo bez dodatečného přístupu.",
      eyebrow: "DOCUMENTS",
      request: "Požádat",
      title: "Dokumenty",
      view: "Zobrazit",
    },
    footer: {
      back: "← Zpět do Trust Center",
      home: "Splnit.eu home",
      lastVerified: "Naposledy ověřeno",
      nextTest: "další test",
      privacy: "Privacy",
      status: "status page",
      terms: "Terms",
    },
    frameworkCard: {
      auto: "Auto",
      inProgress: "probíhá",
      lastAssessed: "Last assessed:",
      notApplicable: "není relevantní",
      regulatorPrefix: "Český regulátor",
      verified: "ověřeno",
      viewDetails: "Zobrazit detail frameworku",
    },
    heroActions: {
      contactSecurity: "Kontaktovat security tým",
      requestAccess: "Požádat o přístup k dokumentům",
    },
    liveIndicator: {
      last: "poslední",
      live: "Live",
      next: "další",
    },
    main: {
      description:
        "Tento Trust Center ukazuje veřejný souhrn automatických kontrol, regulatorních frameworků a dokumentů. Detaily důkazů a konkrétní control IDs zůstávají chráněné a jsou dostupné pouze po schválení přístupu.",
      frameworksBody:
        "Skóre je agregované z kontrol v rozsahu. Veřejná stránka zobrazuje souhrny kategorií, ne jednotlivé testy nebo názvy důkazů.",
      frameworksEyebrow: "FRAMEWORKS",
      frameworksTitle: "Stav EU předpisů",
      heroEyebrow: "TRUST CENTER · VERIFIED CONTINUOUSLY",
      heroTitle: (orgName, controls, frameworks) =>
        `${orgName} průběžně testuje ${controls} bezpečnostních kontrol napříč ${frameworks} EU předpisy.`,
      metadataDescription: (orgName) =>
        `${orgName} průběžně ověřuje bezpečnostní kontroly, dokumenty a stav souladu s EU předpisy.`,
    },
    time: {
      inHours: (hours, minutes) =>
        minutes > 0 ? `za ${hours}h ${minutes}m` : `za ${hours}h`,
      inMinutes: (minutes) => `za ${minutes} min`,
      na: "n/a",
    },
    topbar: {
      back: "Zpět",
      homeAria: "Přejít na homepage Splnit.eu",
      verifiedBy: "Verified by Splnit.eu",
    },
  },
  "en-EU": {
    categoryCounts: {
      notApplicable: (total) => `${total} not applicable`,
      verified: (verified, total) => `${verified} / ${total} verified`,
    },
    contacts: {
      disclosureDescription:
        "Send security findings and vulnerabilities through the responsible disclosure channel.",
      disclosureMeta: "PGP key on request · first response within 24 hours",
      disclosureTitle: "Responsible disclosure",
      vendorDescription: (orgName) =>
        `Procurement or security teams can request more detailed answers about ${orgName}.`,
      vendorMeta: "Usually answered within 2 business days",
      vendorTitle: "Vendor risk assessment",
    },
    detail: {
      aboutEyebrow: "REGULATION CONTEXT",
      aboutTitle: "About this regulation",
      autoTested: "Auto-tested every hour",
      breadcrumbFrameworks: "Frameworks",
      categoriesDescription:
        "This view is intentionally aggregated. The public detail shows category status, not individual control identifiers or evidence files.",
      categoriesEmpty: "No public categories are currently in scope for this framework.",
      categoriesEyebrow: "CONTROL CATEGORIES",
      categoriesTitle: "Control categories",
      controlsInScope: (count) => `${count} controls in scope`,
      ctaDescription:
        "Request documents or send a security question to the team.",
      ctaTitle: "Need more information or document access?",
      disclosureBody:
        "Details of individual controls, control IDs, evidence files, test results, and audit timing could give attackers information about configuration and weak points. Public pages show only category-level aggregate data. More detailed access requires an NDA request.",
      disclosureTitle: "Why don't we show individual controls?",
      effective: "effective",
      infoEffective: "Effective date",
      infoLaw: "Czech law",
      infoMaxPenalty: "Maximum penalty",
      infoRegulator: "Regulator",
      lastAssessed: "Last assessed",
      relatedDocumentsTitle: "Related documents",
      statusEyebrow: "FRAMEWORK STATUS",
    },
    documents: {
      description:
        "Locked items are available on request. Public documents can be viewed directly without additional access.",
      eyebrow: "DOCUMENTS",
      request: "Request",
      title: "Documents",
      view: "View",
    },
    footer: {
      back: "← Back to Trust Center",
      home: "Splnit.eu home",
      lastVerified: "Last verified",
      nextTest: "next test",
      privacy: "Privacy",
      status: "status page",
      terms: "Terms",
    },
    frameworkCard: {
      auto: "Auto",
      inProgress: "in progress",
      lastAssessed: "Last assessed:",
      notApplicable: "not applicable",
      regulatorPrefix: "Czech regulator",
      verified: "verified",
      viewDetails: "View framework details",
    },
    heroActions: {
      contactSecurity: "Contact security team",
      requestAccess: "Request access to documents",
    },
    liveIndicator: {
      last: "last",
      live: "Live",
      next: "next",
    },
    main: {
      description:
        "This Trust Center shows a public summary of automated checks, regulatory frameworks, and documents. Evidence details and concrete control IDs remain protected and are available only after access approval.",
      frameworksBody:
        "The score is aggregated from in-scope controls. The public page shows category summaries, not individual tests or evidence filenames.",
      frameworksEyebrow: "FRAMEWORKS",
      frameworksTitle: "EU regulation status",
      heroEyebrow: "TRUST CENTER · VERIFIED CONTINUOUSLY",
      heroTitle: (orgName, controls, frameworks) =>
        `${orgName} continuously tests ${controls} security controls across ${frameworks} EU frameworks.`,
      metadataDescription: (orgName) =>
        `${orgName} continuously verifies security controls, documents, and EU compliance status.`,
    },
    time: {
      inHours: (hours, minutes) =>
        minutes > 0 ? `in ${hours}h ${minutes}m` : `in ${hours}h`,
      inMinutes: (minutes) => `in ${minutes} min`,
      na: "n/a",
    },
    topbar: {
      back: "Back",
      homeAria: "Go to Splnit.eu homepage",
      verifiedBy: "Verified by Splnit.eu",
    },
  },
  "it-IT": {
    categoryCounts: {
      notApplicable: (total) => `${total} non applicabili`,
      verified: (verified, total) => `${verified} / ${total} verificati`,
    },
    contacts: {
      disclosureDescription:
        "Inviate finding di sicurezza e vulnerabilità tramite il canale responsible disclosure.",
      disclosureMeta: "Chiave PGP su richiesta · prima risposta entro 24 ore",
      disclosureTitle: "Responsible disclosure",
      vendorDescription: (orgName) =>
        `Procurement o team sicurezza possono richiedere risposte più dettagliate su ${orgName}.`,
      vendorMeta: "Risposta di solito entro 2 giorni lavorativi",
      vendorTitle: "Vendor risk assessment",
    },
    detail: {
      aboutEyebrow: "REGULATION CONTEXT",
      aboutTitle: "Informazioni sulla normativa",
      autoTested: "Test automatico ogni ora",
      breadcrumbFrameworks: "Framework",
      categoriesDescription:
        "Questa vista è volutamente aggregata. Il dettaglio pubblico mostra lo stato delle categorie, non singoli identificativi di controllo o file di evidenza.",
      categoriesEmpty: "Nessuna categoria pubblica è attualmente in scope per questo framework.",
      categoriesEyebrow: "CONTROL CATEGORIES",
      categoriesTitle: "Categorie di controllo",
      controlsInScope: (count) => `${count} controlli in scope`,
      ctaDescription:
        "Richiedete i documenti o inviate una domanda di sicurezza al team.",
      ctaTitle: "Servono più informazioni o accesso ai documenti?",
      disclosureBody:
        "I dettagli dei singoli controlli, control ID, file di evidenza, risultati dei test e tempi degli audit potrebbero dare agli attaccanti informazioni su configurazione e punti deboli. Le pagine pubbliche mostrano solo dati aggregati a livello di categoria. Per un accesso più dettagliato è richiesta una richiesta NDA.",
      disclosureTitle: "Perché non mostriamo i singoli controlli?",
      effective: "efficace da",
      infoEffective: "Data di efficacia",
      infoLaw: "Legge ceca",
      infoMaxPenalty: "Sanzione massima",
      infoRegulator: "Regolatore",
      lastAssessed: "Ultima valutazione",
      relatedDocumentsTitle: "Documenti correlati",
      statusEyebrow: "FRAMEWORK STATUS",
    },
    documents: {
      description:
        "Gli elementi bloccati sono disponibili su richiesta. I documenti pubblici possono essere visualizzati direttamente senza accesso aggiuntivo.",
      eyebrow: "DOCUMENTS",
      request: "Richiedi",
      title: "Documenti",
      view: "Visualizza",
    },
    footer: {
      back: "← Torna al Trust Center",
      home: "Home Splnit.eu",
      lastVerified: "Ultima verifica",
      nextTest: "prossimo test",
      privacy: "Privacy",
      status: "status page",
      terms: "Terms",
    },
    frameworkCard: {
      auto: "Auto",
      inProgress: "in corso",
      lastAssessed: "Ultima valutazione:",
      notApplicable: "non applicabile",
      regulatorPrefix: "Regolatore ceco",
      verified: "verificati",
      viewDetails: "Vedi dettagli framework",
    },
    heroActions: {
      contactSecurity: "Contatta il team sicurezza",
      requestAccess: "Richiedi accesso ai documenti",
    },
    liveIndicator: {
      last: "ultimo",
      live: "Live",
      next: "prossimo",
    },
    main: {
      description:
        "Questo Trust Center mostra un riepilogo pubblico di controlli automatici, framework regolatori e documenti. I dettagli delle evidenze e i control ID concreti restano protetti e sono disponibili solo dopo approvazione dell'accesso.",
      frameworksBody:
        "Il punteggio è aggregato dai controlli in scope. La pagina pubblica mostra riepiloghi per categoria, non singoli test o nomi di file di evidenza.",
      frameworksEyebrow: "FRAMEWORKS",
      frameworksTitle: "Stato normative UE",
      heroEyebrow: "TRUST CENTER · VERIFIED CONTINUOUSLY",
      heroTitle: (orgName, controls, frameworks) =>
        `${orgName} testa continuamente ${controls} controlli di sicurezza su ${frameworks} framework UE.`,
      metadataDescription: (orgName) =>
        `${orgName} verifica continuamente controlli di sicurezza, documenti e stato compliance UE.`,
    },
    time: {
      inHours: (hours, minutes) =>
        minutes > 0 ? `tra ${hours}h ${minutes}m` : `tra ${hours}h`,
      inMinutes: (minutes) => `tra ${minutes} min`,
      na: "n/a",
    },
    topbar: {
      back: "Indietro",
      homeAria: "Vai alla homepage Splnit.eu",
      verifiedBy: "Verified by Splnit.eu",
    },
  },
};

export function normalizeTrustLocale(locale: string | undefined): Locale {
  return normalizeLocale(locale) ?? "cs-CZ";
}

export function getPublicTrustCopy(locale: Locale) {
  return publicTrustCopy[locale] ?? publicTrustCopy["cs-CZ"];
}
