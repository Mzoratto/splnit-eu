import { normalizeLocale, type Locale } from "@/i18n/routing";

export type PublicTrustCopy = {
  categoryCounts: {
    availableEvidence: string;
    notApplicable: string;
  };
  contacts: {
    disclosureDescription: string;
    disclosureMeta: string;
    disclosureTitle: string;
    privacyDescription: string;
    privacyMeta: string;
    privacyTitle: string;
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
    controlsInScope: () => string;
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
    lastReviewed: string;
    reviewWindow: string;
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
  demoNotice: {
    body: string;
    title: string;
  };
  main: {
    description: string;
    frameworksBody: string;
    frameworksEyebrow: string;
    frameworksTitle: string;
    heroEyebrow: string;
    heroTitle: (orgName: string) => string;
    metadataDescription: (orgName: string) => string;
  };
  time: {
    later: string;
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
      availableEvidence: "dostupná interní evidence",
      notApplicable: "mimo rozsah",
    },
    contacts: {
      disclosureDescription:
        "Bezpečnostní nálezy a zranitelnosti posílejte přes odpovědný disclosure kanál.",
      disclosureMeta: "PGP klíč na vyžádání · první odpověď do 24 hodin",
      disclosureTitle: "Responsible disclosure",
      privacyDescription:
        "Dotazy k ochraně osobních údajů, DPA a subdodavatelům posílejte na privacy kanál.",
      privacyMeta: "DPA a privacy dotazy · odpověď obvykle do 2 pracovních dnů",
      privacyTitle: "Kontakt pro soukromí",
      vendorDescription: (orgName) =>
        `Procurement nebo bezpečnostní tým může požádat o detailnější odpovědi k ${orgName}.`,
      vendorMeta: "Odpověď obvykle do 2 pracovních dnů",
      vendorTitle: "Hodnocení rizik dodavatele",
    },
    detail: {
      aboutEyebrow: "REGULATION CONTEXT",
      aboutTitle: "O tomto předpisu",
      autoTested: "Automatické kontroly evidencí nakonfigurovány",
      breadcrumbFrameworks: "Frameworky",
      categoriesDescription:
        "Zobrazení je záměrně agregované. Veřejný detail ukazuje stav kategorií, ne jednotlivé kontrolní identifikátory nebo důkazní soubory.",
      categoriesEmpty:
        "Pro tento framework zatím nejsou veřejné kategorie v rozsahu.",
      categoriesEyebrow: "CONTROL CATEGORIES",
      categoriesTitle: "Kategorie kontrol",
      controlsInScope: () => "Kontroly jsou veřejně shrnuté po kategoriích",
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
      lastReviewed: "Poslední interní evidence",
      reviewWindow: "další interní kontrola",
      privacy: "Soukromí",
      status: "status page",
      terms: "Podmínky",
    },
    frameworkCard: {
      auto: "Auto",
      inProgress: "probíhá",
      lastAssessed: "Poslední hodnocení:",
      notApplicable: "není relevantní",
      regulatorPrefix: "Český regulátor",
      verified: "dostupná evidence",
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
    demoNotice: {
      body:
        "Tato veřejná stránka používá ukázková data pro předvedení produktu. Nepopisuje skutečný stav žádné organizace.",
      title: "Ukázkový Trust Center",
    },
    main: {
      description:
        "Tento Trust Center ukazuje veřejný souhrn automatických kontrol, regulatorních frameworků a dokumentů. Detaily důkazů a konkrétní control IDs zůstávají chráněné a jsou dostupné pouze po schválení přístupu.",
      frameworksBody:
        "Stav je agregovaný z interní evidence v rozsahu. Veřejná stránka zobrazuje souhrny kategorií, ne jednotlivé testy nebo názvy důkazů.",
      frameworksEyebrow: "FRAMEWORKS",
      frameworksTitle: "Stav readiness frameworků",
      heroEyebrow: "TRUST CENTER · INTERNÍ EVIDENCE",
      heroTitle: (orgName) =>
        `${orgName} veřejně sdílí agregovaný přehled bezpečnostní readiness a dostupné interní evidence.`,
      metadataDescription: (orgName) =>
        `${orgName} sdílí veřejný souhrn bezpečnostní readiness, dokumentů a dostupné interní evidence.`,
    },
    time: {
      later: "později",
      na: "n/a",
    },
    topbar: {
      back: "Zpět",
      homeAria: "Přejít na homepage Splnit.eu",
      verifiedBy: "Spravováno pomocí Splnit.eu",
    },
  },
  "en-EU": {
    categoryCounts: {
      availableEvidence: "available internal evidence",
      notApplicable: "out of scope",
    },
    contacts: {
      disclosureDescription:
        "Send security findings and vulnerabilities through the responsible disclosure channel.",
      disclosureMeta: "PGP key on request · first response within 24 hours",
      disclosureTitle: "Responsible disclosure",
      privacyDescription:
        "Send privacy, DPA, and sub-processor questions through the privacy channel.",
      privacyMeta: "DPA and privacy questions · usually answered within 2 business days",
      privacyTitle: "Privacy contact",
      vendorDescription: (orgName) =>
        `Procurement or security teams can request more detailed answers about ${orgName}.`,
      vendorMeta: "Usually answered within 2 business days",
      vendorTitle: "Vendor risk assessment",
    },
    detail: {
      aboutEyebrow: "REGULATION CONTEXT",
      aboutTitle: "About this regulation",
      autoTested: "Automated evidence checks configured",
      breadcrumbFrameworks: "Frameworks",
      categoriesDescription:
        "This view is intentionally aggregated. The public detail shows category status, not individual control identifiers or evidence files.",
      categoriesEmpty: "No public categories are currently in scope for this framework.",
      categoriesEyebrow: "CONTROL CATEGORIES",
      categoriesTitle: "Control categories",
      controlsInScope: () => "Controls are publicly summarized by category",
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
      lastReviewed: "Latest internal evidence",
      reviewWindow: "next internal review",
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
      verified: "available evidence",
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
    demoNotice: {
      body:
        "This public page uses sample data to demonstrate the product. It does not describe any organisation's live compliance status.",
      title: "Sample Trust Center",
    },
    main: {
      description:
        "This Trust Center shows a public summary of automated checks, regulatory frameworks, and documents. Evidence details and concrete control IDs remain protected and are available only after access approval.",
      frameworksBody:
        "Status is aggregated from in-scope internal evidence. The public page shows category summaries, not individual tests or evidence filenames.",
      frameworksEyebrow: "FRAMEWORKS",
      frameworksTitle: "Readiness framework status",
      heroEyebrow: "TRUST CENTER · INTERNAL EVIDENCE",
      heroTitle: (orgName) =>
        `${orgName} shares an aggregated public view of security readiness and available internal evidence.`,
      metadataDescription: (orgName) =>
        `${orgName} shares a public summary of security readiness, documents, and available internal evidence.`,
    },
    time: {
      later: "later",
      na: "n/a",
    },
    topbar: {
      back: "Back",
      homeAria: "Go to Splnit.eu homepage",
      verifiedBy: "Managed with Splnit.eu",
    },
  },
  "it-IT": {
    categoryCounts: {
      availableEvidence: "evidenza interna disponibile",
      notApplicable: "fuori ambito",
    },
    contacts: {
      disclosureDescription:
        "Inviate finding di sicurezza e vulnerabilità tramite il canale responsible disclosure.",
      disclosureMeta: "Chiave PGP su richiesta · prima risposta entro 24 ore",
      disclosureTitle: "Responsible disclosure",
      privacyDescription:
        "Inviate domande su privacy, DPA e sub-responsabili tramite il canale privacy.",
      privacyMeta: "Domande DPA e privacy · risposta di solito entro 2 giorni lavorativi",
      privacyTitle: "Contatto privacy",
      vendorDescription: (orgName) =>
        `Procurement o team sicurezza possono richiedere risposte più dettagliate su ${orgName}.`,
      vendorMeta: "Risposta di solito entro 2 giorni lavorativi",
      vendorTitle: "Vendor risk assessment",
    },
    detail: {
      aboutEyebrow: "REGULATION CONTEXT",
      aboutTitle: "Informazioni sulla normativa",
      autoTested: "Controlli automatici delle evidenze configurati",
      breadcrumbFrameworks: "Framework",
      categoriesDescription:
        "Questa vista è volutamente aggregata. Il dettaglio pubblico mostra lo stato delle categorie, non singoli identificativi di controllo o file di evidenza.",
      categoriesEmpty: "Nessuna categoria pubblica è attualmente in scope per questo framework.",
      categoriesEyebrow: "CONTROL CATEGORIES",
      categoriesTitle: "Categorie di controllo",
      controlsInScope: () => "I controlli sono riepilogati pubblicamente per categoria",
      ctaDescription:
        "Richiedete i documenti o inviate una domanda di sicurezza al team.",
      ctaTitle: "Servono più informazioni o accesso ai documenti?",
      disclosureBody:
        "I dettagli dei singoli controlli, control ID, file di evidenza, risultati dei test e tempi degli audit potrebbero dare agli attaccanti informazioni su configurazione e punti deboli. Le pagine pubbliche mostrano solo dati aggregati a livello di categoria. Per un accesso più dettagliato è richiesta una richiesta NDA.",
      disclosureTitle: "Perché non mostriamo i singoli controlli?",
      effective: "efficace da",
      infoEffective: "Data di efficacia",
      infoLaw: "Legge o riferimento",
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
      lastReviewed: "Ultima evidenza interna",
      reviewWindow: "prossima revisione interna",
      privacy: "Privacy",
      status: "status page",
      terms: "Terms",
    },
    frameworkCard: {
      auto: "Auto",
      inProgress: "in corso",
      lastAssessed: "Ultima valutazione:",
      notApplicable: "non applicabile",
      regulatorPrefix: "Autorità competente",
      verified: "evidenza disponibile",
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
    demoNotice: {
      body:
        "Questa pagina pubblica usa dati di esempio per mostrare il prodotto. Non descrive lo stato compliance reale di alcuna organizzazione.",
      title: "Trust Center di esempio",
    },
    main: {
      description:
        "Questo Trust Center mostra un riepilogo pubblico di controlli automatici, framework regolatori e documenti. I dettagli delle evidenze e i control ID concreti restano protetti e sono disponibili solo dopo approvazione dell'accesso.",
      frameworksBody:
        "Lo stato è aggregato dall’evidenza interna in scope. La pagina pubblica mostra riepiloghi per categoria, non singoli test o nomi di file di evidenza.",
      frameworksEyebrow: "FRAMEWORKS",
      frameworksTitle: "Stato readiness dei framework",
      heroEyebrow: "TRUST CENTER · EVIDENZA INTERNA",
      heroTitle: (orgName) =>
        `${orgName} condivide una vista pubblica aggregata della readiness di sicurezza e dell’evidenza interna disponibile.`,
      metadataDescription: (orgName) =>
        `${orgName} condivide un riepilogo pubblico di readiness di sicurezza, documenti ed evidenza interna disponibile.`,
    },
    time: {
      later: "più tardi",
      na: "n/a",
    },
    topbar: {
      back: "Indietro",
      homeAria: "Vai alla homepage Splnit.eu",
      verifiedBy: "Gestito con Splnit.eu",
    },
  },
};

export function normalizeTrustLocale(locale: string | undefined): Locale {
  return normalizeLocale(locale) ?? "cs-CZ";
}

export function getPublicTrustCopy(locale: Locale) {
  return publicTrustCopy[locale] ?? publicTrustCopy["cs-CZ"];
}
