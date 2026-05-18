import type { Locale } from "@/i18n/routing";
import type { PublicTrustDocument } from "@/lib/trust-center/public-types";

const PUBLIC_DOCUMENTS: PublicTrustDocument[] = [
  {
    description: "Sdílí se pouze tehdy, pokud je pro organizaci k dispozici.",
    frameworkSlugs: ["iso27001", "nis2"],
    href: "mailto:hello@splnit.eu?subject=Request%20SOC%202%20report",
    id: "soc2",
    isLocked: true,
    title: "SOC 2 report",
  },
  {
    description: "Sdílí se pouze tehdy, pokud je pro organizaci k dispozici.",
    frameworkSlugs: ["iso27001"],
    href: "mailto:hello@splnit.eu?subject=Request%20ISO%2027001%20SoA",
    id: "iso-soa",
    isLocked: true,
    title: "ISO 27001 SoA",
  },
  {
    description: "Sdílí se pouze tehdy, pokud je pro organizaci k dispozici.",
    frameworkSlugs: ["nis2", "iso27001"],
    href: "mailto:hello@splnit.eu?subject=Request%20penetration%20test%20summary",
    id: "pentest",
    isLocked: true,
    title: "Pen test summary",
  },
  {
    description: "Veřejné informace o zpracování osobních údajů.",
    frameworkSlugs: ["gdpr"],
    href: "/soukromi",
    id: "privacy-policy",
    isLocked: false,
    title: "Privacy Policy",
  },
  {
    description: "Vzor smlouvy o zpracování osobních údajů.",
    frameworkSlugs: ["gdpr"],
    href: "/dpa",
    id: "dpa",
    isLocked: false,
    title: "DPA template",
  },
  {
    description: "Aktuální seznam hlavních subdodavatelů.",
    frameworkSlugs: ["gdpr", "nis2", "iso27001"],
    href: "/soukromi#subprocessors",
    id: "subprocessors",
    isLocked: false,
    title: "Sub-processor list",
  },
  {
    description: "Přehled bezpečnostní architektury a provozních opatření.",
    frameworkSlugs: ["nis2", "iso27001"],
    href: "mailto:hello@splnit.eu?subject=Security%20Whitepaper",
    id: "whitepaper",
    isLocked: false,
    title: "Security Whitepaper",
  },
  {
    description: "Dostupnost služby, reakční časy a provozní odpovědnosti.",
    frameworkSlugs: ["nis2", "iso27001"],
    href: "mailto:hello@splnit.eu?subject=SLA",
    id: "sla",
    isLocked: false,
    title: "SLA",
  },
];

const DOCUMENT_DESCRIPTIONS: Record<
  Locale,
  Record<PublicTrustDocument["id"], string>
> = {
  "cs-CZ": {
    dpa: "Vzor smlouvy o zpracování osobních údajů.",
    "iso-soa": "Sdílí se pouze tehdy, pokud je pro organizaci k dispozici.",
    pentest: "Sdílí se pouze tehdy, pokud je pro organizaci k dispozici.",
    "privacy-policy": "Veřejné informace o zpracování osobních údajů.",
    sla: "Dostupnost služby, reakční časy a provozní odpovědnosti.",
    soc2: "Sdílí se pouze tehdy, pokud je pro organizaci k dispozici.",
    subprocessors: "Aktuální seznam hlavních subdodavatelů.",
    whitepaper: "Přehled bezpečnostní architektury a provozních opatření.",
  },
  "en-EU": {
    dpa: "Template data processing agreement.",
    "iso-soa": "Shared only if it is available for this organisation.",
    pentest: "Shared only if it is available for this organisation.",
    "privacy-policy": "Public information about personal data processing.",
    sla: "Service availability, response times, and operating responsibilities.",
    soc2: "Shared only if it is available for this organisation.",
    subprocessors: "Current list of main sub-processors.",
    whitepaper: "Overview of security architecture and operating measures.",
  },
  "it-IT": {
    dpa: "Modello di accordo per il trattamento dei dati.",
    "iso-soa": "Condiviso solo se disponibile per questa organizzazione.",
    pentest: "Condiviso solo se disponibile per questa organizzazione.",
    "privacy-policy": "Informazioni pubbliche sul trattamento dei dati personali.",
    sla: "Disponibilità del servizio, tempi di risposta e responsabilità operative.",
    soc2: "Condiviso solo se disponibile per questa organizzazione.",
    subprocessors: "Elenco aggiornato dei principali sub-responsabili.",
    whitepaper: "Panoramica di architettura di sicurezza e misure operative.",
  },
};

export function getDocumentsForFramework(frameworkSlug: string) {
  return PUBLIC_DOCUMENTS.filter((document) =>
    document.frameworkSlugs.includes(frameworkSlug),
  );
}

export function getLocalizedDocuments(locale: Locale) {
  const descriptions = DOCUMENT_DESCRIPTIONS[locale] ?? DOCUMENT_DESCRIPTIONS["cs-CZ"];

  return PUBLIC_DOCUMENTS.map((document) => ({
    ...document,
    description: descriptions[document.id] ?? document.description,
  }));
}

export function getLockedDocuments(locale: Locale) {
  return getLocalizedDocuments(locale).map((document) => ({
    ...document,
    href: "mailto:hello@splnit.eu?subject=Trust%20Center%20access%20request",
    isLocked: true,
  }));
}

export function getLocalizedDocumentsForFramework(
  frameworkSlug: string,
  locale: Locale,
) {
  return getLocalizedDocuments(locale).filter((document) =>
    document.frameworkSlugs.includes(frameworkSlug),
  );
}


export function getSplnitDocuments(locale: Locale): PublicTrustDocument[] {
  const copy = splnitDocumentCopy(locale);

  return [
    {
      description: copy.securityWhitepaperDescription,
      frameworkSlugs: ["nis2", "iso27001", "gdpr"],
      href: "/security",
      id: "splnit-security-whitepaper",
      isLocked: false,
      title: copy.securityWhitepaper,
    },
    {
      description: copy.dpaDescription,
      frameworkSlugs: ["gdpr"],
      href: "/dpa",
      id: "splnit-dpa",
      isLocked: false,
      title: copy.dpa,
    },
    {
      description: copy.subprocessorsDescription,
      frameworkSlugs: ["gdpr", "nis2", "iso27001"],
      href: "/dpa#subprocessors",
      id: "splnit-subprocessors",
      isLocked: false,
      title: copy.subprocessors,
    },
    {
      description: copy.privacyDescription,
      frameworkSlugs: ["gdpr"],
      href: "/soukromi",
      id: "splnit-privacy",
      isLocked: false,
      title: copy.privacy,
    },
    {
      description: copy.termsDescription,
      frameworkSlugs: ["nis2", "iso27001"],
      href: "/podminky",
      id: "splnit-terms",
      isLocked: false,
      title: copy.terms,
    },
  ];
}

function splnitDocumentCopy(locale: Locale) {
  if (locale === "en-EU") {
    return {
      dpa: "DPA",
      dpaDescription: "Public data processing terms and processor commitments.",
      privacy: "Privacy Policy",
      privacyDescription: "Public information about Splnit.eu personal data processing.",
      securityWhitepaper: "Security Whitepaper",
      securityWhitepaperDescription:
        "Current early-access security posture, hosting, access, and incident-response summary.",
      subprocessors: "Sub-processor list",
      subprocessorsDescription:
        "Main sub-processors and processing context maintained in the public DPA page.",
      terms: "Terms of Service",
      termsDescription: "Public service terms for Splnit.eu.",
    };
  }

  if (locale === "it-IT") {
    return {
      dpa: "DPA",
      dpaDescription: "Termini pubblici di trattamento dati e impegni del responsabile.",
      privacy: "Informativa privacy",
      privacyDescription: "Informazioni pubbliche sul trattamento dei dati personali da parte di Splnit.eu.",
      securityWhitepaper: "Whitepaper sicurezza",
      securityWhitepaperDescription:
        "Sintesi aggiornata di sicurezza in accesso anticipato, hosting, accessi e risposta agli incidenti.",
      subprocessors: "Lista sub-responsabili",
      subprocessorsDescription:
        "Principali sub-responsabili e contesto di trattamento mantenuti nella pagina DPA pubblica.",
      terms: "Termini di servizio",
      termsDescription: "Termini pubblici del servizio Splnit.eu.",
    };
  }

  return {
    dpa: "DPA",
    dpaDescription: "Veřejné podmínky zpracování dat a závazky zpracovatele.",
    privacy: "Zásady ochrany osobních údajů",
    privacyDescription: "Veřejné informace o zpracování osobních údajů ve Splnit.eu.",
    securityWhitepaper: "Bezpečnostní dokument",
    securityWhitepaperDescription:
      "Aktuální přehled bezpečnosti, hostingu, přístupů a reakce na incidenty v předběžném přístupu.",
    subprocessors: "Seznam subdodavatelů",
    subprocessorsDescription:
      "Hlavní subdodavatelé a kontext zpracování udržovaný na veřejné DPA stránce.",
    terms: "Podmínky služby",
    termsDescription: "Veřejné podmínky služby Splnit.eu.",
  };
}
