import { normalizeLocale, type Locale } from "@/i18n/routing";

export type PublicTrustCopy = {
  averageScore: string;
  company: string;
  demoOrganisation: string;
  description: string;
  frameworkCount: string;
  lastTest: string;
  metadataFallbackTitle: string;
  metadataDescription: (organisationName: string) => string;
  ndaAccessBody: string;
  ndaAccessTitle: string;
  ndaGate: string;
  ndaNotRequired: string;
  ndaRequired: string;
  notRunYet: string;
  requestAccess: string;
  requestedMessage: string;
  status: Record<string, string>;
  verified: string;
  verifiedAutomatically: string;
  workEmail: string;
};

const copy: Record<Locale, PublicTrustCopy> = {
  "cs-CZ": {
    averageScore: "Průměrné skóre",
    company: "Firma",
    demoOrganisation: "Demo organizace",
    description:
      "Veřejný přehled vybraných compliance frameworků, automatických testů a dostupných bezpečnostních důkazů.",
    frameworkCount: "Frameworky",
    lastTest: "Poslední test",
    metadataDescription: (organisationName) =>
      `Veřejné compliance skóre pro ${organisationName}.`,
    metadataFallbackTitle: "Trust Center",
    ndaAccessBody:
      "Detailní skóre a frameworky jsou dostupné po schválení žádosti. Schválený odkaz platí 24 hodin.",
    ndaAccessTitle: "NDA přístup",
    ndaGate: "NDA gate",
    ndaNotRequired: "Nevyžadováno",
    ndaRequired: "Vyžadováno",
    notRunYet: "zatím nespuštěno",
    requestAccess: "Požádat o přístup",
    requestedMessage: "Žádost byla odeslána vlastníkovi Trust Center.",
    status: {
      active: "aktivní",
      inactive: "neaktivní",
    },
    verified: "Ověřeno automaticky",
    verifiedAutomatically:
      "Ověřeno automaticky tam, kde jsou připojené integrace",
    workEmail: "Pracovní email",
  },
  "en-EU": {
    averageScore: "Average score",
    company: "Company",
    demoOrganisation: "Demo organisation",
    description:
      "Public overview of selected compliance frameworks, automated checks, and available security evidence.",
    frameworkCount: "Frameworks",
    lastTest: "Last test",
    metadataDescription: (organisationName) =>
      `Public compliance score for ${organisationName}.`,
    metadataFallbackTitle: "Trust Center",
    ndaAccessBody:
      "Detailed scores and frameworks are available after access approval. An approved link is valid for 24 hours.",
    ndaAccessTitle: "NDA access",
    ndaGate: "NDA gate",
    ndaNotRequired: "Not required",
    ndaRequired: "Required",
    notRunYet: "not run yet",
    requestAccess: "Request access",
    requestedMessage: "The request was sent to the Trust Center owner.",
    status: {
      active: "active",
      inactive: "inactive",
    },
    verified: "Verified automatically",
    verifiedAutomatically:
      "Verified automatically where integrations are connected",
    workEmail: "Work email",
  },
  "it-IT": {
    averageScore: "Punteggio medio",
    company: "Azienda",
    demoOrganisation: "Organizzazione demo",
    description:
      "Panoramica pubblica dei framework compliance selezionati, dei controlli automatici e delle evidenze di sicurezza disponibili.",
    frameworkCount: "Framework",
    lastTest: "Ultimo test",
    metadataDescription: (organisationName) =>
      `Punteggio compliance pubblico per ${organisationName}.`,
    metadataFallbackTitle: "Trust Center",
    ndaAccessBody:
      "Punteggi e framework dettagliati sono disponibili dopo approvazione della richiesta. Il link approvato resta valido per 24 ore.",
    ndaAccessTitle: "Accesso NDA",
    ndaGate: "Gate NDA",
    ndaNotRequired: "Non richiesto",
    ndaRequired: "Richiesto",
    notRunYet: "non ancora eseguito",
    requestAccess: "Richiedi accesso",
    requestedMessage: "La richiesta è stata inviata al proprietario del Trust Center.",
    status: {
      active: "attivo",
      inactive: "non attivo",
    },
    verified: "Verificato automaticamente",
    verifiedAutomatically:
      "Verificato automaticamente dove le integrazioni sono collegate",
    workEmail: "Email di lavoro",
  },
};

const regulatorLabels: Record<Locale, Record<string, string>> = {
  "cs-CZ": {},
  "en-EU": {
    "ai-act": "AI authority",
    gdpr: "Data protection authority",
    nis2: "Cybersecurity authority",
  },
  "it-IT": {
    "ai-act": "Autorità AI",
    gdpr: "Garante Privacy",
    nis2: "ACN",
  },
};

export function getPublicTrustCopy(locale: Locale) {
  return copy[locale] ?? copy["cs-CZ"];
}

export function getPublicTrustLocaleFromCookie(cookieHeader: string | null) {
  const match = cookieHeader?.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  return normalizeLocale(match ? decodeURIComponent(match[1]) : null) ?? "cs-CZ";
}

export function getRegulatorLabel(
  framework: { regulator?: string | null; slug: string },
  locale: Locale,
) {
  return regulatorLabels[locale]?.[framework.slug] ?? framework.regulator;
}

export function getStatusLabel(status: string, locale: Locale) {
  return copy[locale]?.status[status] ?? status;
}

export function formatTrustRelativeTime(
  value: Date | string | null | undefined,
  locale: Locale,
) {
  if (!value) {
    return getPublicTrustCopy(locale).notRunYet;
  }

  const diffMinutes = Math.max(
    0,
    Math.round((Date.now() - new Date(value).getTime()) / 60_000),
  );
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffMinutes < 1) {
    return formatter.format(0, "minute");
  }

  if (diffMinutes < 60) {
    return formatter.format(-diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  return formatter.format(-diffHours, "hour");
}
