import { normalizeLocale, type Locale } from "@/i18n/routing";

type VendorQuestionnaireCopy = {
  body: string;
  labels: {
    link: string;
    organisation: string;
    vendor: string;
  };
  subjectPrefix: string;
};

const vendorQuestionnaireCopy = {
  "cs-CZ": {
    body: "Prosíme o vyplnění bezpečnostního dotazníku pro supply-chain risk review.",
    labels: {
      link: "Odkaz",
      organisation: "Organizace",
      vendor: "Dodavatel",
    },
    subjectPrefix: "Bezpečnostní dotazník dodavatele",
  },
  "en-EU": {
    body: "Please complete the security questionnaire for the supply-chain risk review.",
    labels: {
      link: "Link",
      organisation: "Organisation",
      vendor: "Vendor",
    },
    subjectPrefix: "Vendor security questionnaire",
  },
  "it-IT": {
    body: "Ti chiediamo di compilare il questionario di sicurezza per la revisione del rischio supply chain.",
    labels: {
      link: "Link",
      organisation: "Organizzazione",
      vendor: "Fornitore",
    },
    subjectPrefix: "Questionario sicurezza fornitore",
  },
} satisfies Record<Locale, VendorQuestionnaireCopy>;

function getVendorQuestionnaireCopy(locale?: string | null) {
  return vendorQuestionnaireCopy[normalizeLocale(locale) ?? "cs-CZ"];
}

export function evidenceExpirySubject(controlTitle: string) {
  return `Evidence se blíží expiraci: ${controlTitle}`;
}

export function evidenceExpiryText(input: {
  organisationName: string;
  controlTitle: string;
  expiresAt: string;
}) {
  return [
    `Organizace: ${input.organisationName}`,
    `Kontrola: ${input.controlTitle}`,
    `Expirace evidence: ${input.expiresAt}`,
  ].join("\n");
}

export function policyReviewSubject(policyTitle: string) {
  return `Roční přezkum dokumentu: ${policyTitle}`;
}

export function policyReviewText(input: {
  organisationName: string;
  policyTitle: string;
  expiresAt: string;
}) {
  return [
    `Organizace: ${input.organisationName}`,
    `Dokument: ${input.policyTitle}`,
    `Datum přezkumu: ${input.expiresAt}`,
  ].join("\n");
}

export function regulationUpdateSubject(title: string) {
  return `Regulační aktualizace vyžaduje akci: ${title}`;
}

export function regulationUpdateText(input: {
  organisationName: string;
  title: string;
  summary?: string | null;
  source: string;
  sourceUrl?: string | null;
  publishedAt: Date;
}) {
  return [
    `Organizace: ${input.organisationName}`,
    `Zdroj: ${input.source}`,
    `Aktualizace: ${input.title}`,
    `Publikováno: ${input.publishedAt.toISOString().slice(0, 10)}`,
    input.summary ? `Shrnutí: ${input.summary}` : null,
    input.sourceUrl ? `Zdroj: ${input.sourceUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function trustCenterRequestSubject(organisationName: string) {
  return `Nová Trust Center žádost: ${organisationName}`;
}

export function trustCenterRequestText(input: {
  organisationName: string;
  requesterEmail: string;
  requesterCompany?: string | null;
  reviewUrl: string;
}) {
  return [
    `Organizace: ${input.organisationName}`,
    `Žadatel: ${input.requesterEmail}`,
    input.requesterCompany ? `Firma: ${input.requesterCompany}` : null,
    `Schválení: ${input.reviewUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function trustCenterAccessSubject(organisationName: string) {
  return `Přístup do Trust Center: ${organisationName}`;
}

export function trustCenterAccessText(input: {
  organisationName: string;
  accessUrl: string;
}) {
  return [
    `Organizace: ${input.organisationName}`,
    "Přístup je platný 24 hodin.",
    `Odkaz: ${input.accessUrl}`,
  ].join("\n");
}

export function vendorQuestionnaireSubject(input: {
  locale?: string | null;
  organisationName: string;
}) {
  const copy = getVendorQuestionnaireCopy(input.locale);

  return `${copy.subjectPrefix}: ${input.organisationName}`;
}

export function vendorQuestionnaireText(input: {
  assessmentUrl: string;
  locale?: string | null;
  organisationName: string;
  vendorName: string;
}) {
  const copy = getVendorQuestionnaireCopy(input.locale);

  return [
    `${copy.labels.organisation}: ${input.organisationName}`,
    `${copy.labels.vendor}: ${input.vendorName}`,
    copy.body,
    `${copy.labels.link}: ${input.assessmentUrl}`,
  ].join("\n");
}

export function accessReviewReminderSubject(organisationName: string) {
  return `Quarterly access review: ${organisationName}`;
}

export function accessReviewReminderText(input: {
  accessReviewsUrl: string;
  organisationName: string;
}) {
  return [
    `Organizace: ${input.organisationName}`,
    "Je čas spustit kvartální přístupovou revizi pro Microsoft 365 a GitHub.",
    `Odkaz: ${input.accessReviewsUrl}`,
  ].join("\n");
}
