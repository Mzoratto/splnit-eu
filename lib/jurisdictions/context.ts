export type SupportedJurisdiction = "CZ" | "EU" | "IT";
export type SupportedLocale = "cs-CZ" | "en-EU" | "it-IT";

type JurisdictionLabels = {
  address: string;
  contactEmail: string;
  generated: string;
  legalIdentifier: string;
  nextReview: string;
  organisation: string;
  policyLibrary: string;
  source: string;
  supervisoryAuthority: string;
};

type JurisdictionAuthorities = {
  cybersecurity: string;
  dataProtection: string;
  telecom: string;
};

type JurisdictionCitations = {
  aiAct: string;
  gdpr: string;
  nis2: string;
};

export type JurisdictionContext = {
  authorities: JurisdictionAuthorities;
  citations: JurisdictionCitations;
  dateLocale: string;
  jurisdiction: SupportedJurisdiction;
  labels: JurisdictionLabels;
  locale: SupportedLocale;
};

const JURISDICTION_CONTEXTS = {
  CZ: {
    authorities: {
      cybersecurity: "NÚKIB",
      dataProtection: "ÚOOÚ",
      telecom: "ČTÚ",
    },
    citations: {
      aiAct: "Nařízení (EU) 2024/1689",
      gdpr: "Nařízení (EU) 2016/679",
      nis2: "Zákon č. 264/2025 Sb.",
    },
    dateLocale: "cs-CZ",
    jurisdiction: "CZ",
    labels: {
      address: "Adresa",
      contactEmail: "Kontaktní e-mail",
      generated: "Vygenerováno",
      legalIdentifier: "IČO",
      nextReview: "Příští přezkum",
      organisation: "Organizace",
      policyLibrary: "Knihovna dokumentů Splnit.eu",
      source: "zdroj",
      supervisoryAuthority: "Dozorový úřad",
    },
    locale: "cs-CZ",
  },
  EU: {
    authorities: {
      cybersecurity: "Competent cybersecurity authority",
      dataProtection: "Competent data protection authority",
      telecom: "Competent telecom authority",
    },
    citations: {
      aiAct: "Regulation (EU) 2024/1689",
      gdpr: "Regulation (EU) 2016/679",
      nis2: "Directive (EU) 2022/2555",
    },
    dateLocale: "en-GB",
    jurisdiction: "EU",
    labels: {
      address: "Address",
      contactEmail: "Contact email",
      generated: "Generated",
      legalIdentifier: "Legal identifier",
      nextReview: "Next review",
      organisation: "Organisation",
      policyLibrary: "Splnit.eu policy library",
      source: "source",
      supervisoryAuthority: "Supervisory authority",
    },
    locale: "en-EU",
  },
  IT: {
    authorities: {
      cybersecurity: "ACN",
      dataProtection: "Garante per la protezione dei dati personali",
      telecom: "AGCOM",
    },
    citations: {
      aiAct: "Regolamento (UE) 2024/1689",
      gdpr: "Regolamento (UE) 2016/679",
      nis2: "D.Lgs. 138/2024",
    },
    dateLocale: "it-IT",
    jurisdiction: "IT",
    labels: {
      address: "Indirizzo",
      contactEmail: "Email di contatto",
      generated: "Generato",
      legalIdentifier: "Codice fiscale / Partita IVA",
      nextReview: "Prossima revisione",
      organisation: "Organizzazione",
      policyLibrary: "Libreria documenti Splnit.eu",
      source: "fonte",
      supervisoryAuthority: "Autorità di controllo",
    },
    locale: "it-IT",
  },
} as const satisfies Record<SupportedJurisdiction, JurisdictionContext>;

function isSupportedJurisdiction(
  value: string | null | undefined,
): value is SupportedJurisdiction {
  return value === "CZ" || value === "EU" || value === "IT";
}

function isSupportedLocale(
  value: string | null | undefined,
): value is SupportedLocale {
  return value === "cs-CZ" || value === "en-EU" || value === "it-IT";
}

function defaultLocaleForJurisdiction(
  jurisdiction: SupportedJurisdiction,
): SupportedLocale {
  return JURISDICTION_CONTEXTS[jurisdiction].locale;
}

export function getJurisdictionContext(
  jurisdiction: string | null | undefined,
  locale?: string | null,
): JurisdictionContext {
  const resolvedJurisdiction = isSupportedJurisdiction(jurisdiction)
    ? jurisdiction
    : "EU";
  const defaultContext = JURISDICTION_CONTEXTS[resolvedJurisdiction];
  const resolvedLocale =
    isSupportedLocale(locale) && locale === defaultLocaleForJurisdiction(resolvedJurisdiction)
      ? locale
      : defaultContext.locale;

  return {
    ...defaultContext,
    locale: resolvedLocale,
  };
}
