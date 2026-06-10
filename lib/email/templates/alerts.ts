import { normalizeLocale, type Locale } from "@/i18n/routing";

type AlertEmailCopy = {
  bodies: {
    accessReviewReminder: string;
    trustCenterAccessExpiry: string;
    vendorQuestionnaire: string;
    vendorQuestionnaireReason: string;
    vendorQuestionnaireUnexpected: string;
  };
  labels: {
    approval: string;
    company: string;
    control: string;
    document: string;
    evidenceExpiry: string;
    link: string;
    organisation: string;
    published: string;
    requester: string;
    reviewDate: string;
    source: string;
    sourceUrl: string;
    summary: string;
    update: string;
    vendor: string;
  };
  subjects: {
    accessReviewReminder: string;
    evidenceExpiry: string;
    policyReview: string;
    regulationUpdate: string;
    trustCenterAccess: string;
    trustCenterRequest: string;
    vendorQuestionnaire: string;
  };
};

const alertEmailCopy = {
  "cs-CZ": {
    bodies: {
      accessReviewReminder:
        "Je čas spustit kvartální přístupovou revizi pro Microsoft 365 a GitHub.",
      trustCenterAccessExpiry: "Přístup je platný 24 hodin.",
      vendorQuestionnaire:
        "Prosíme o vyplnění bezpečnostního dotazníku pro hodnocení rizik dodavatelského řetězce.",
      vendorQuestionnaireReason:
        "Tento e-mail dostáváte, protože uvedená organizace požádala o bezpečnostní hodnocení dodavatele.",
      vendorQuestionnaireUnexpected:
        "Pokud zprávu nečekáte, ověřte si ji u svého kontaktu v uvedené organizaci.",
    },
    labels: {
      approval: "Schválení",
      company: "Firma",
      control: "Kontrola",
      document: "Dokument",
      evidenceExpiry: "Expirace evidence",
      link: "Odkaz",
      organisation: "Organizace",
      published: "Publikováno",
      requester: "Žadatel",
      reviewDate: "Datum přezkumu",
      source: "Zdroj",
      sourceUrl: "Zdroj",
      summary: "Shrnutí",
      update: "Aktualizace",
      vendor: "Dodavatel",
    },
    subjects: {
      accessReviewReminder: "Kvartální přístupová revize",
      evidenceExpiry: "Evidence se blíží expiraci",
      policyReview: "Roční přezkum dokumentu",
      regulationUpdate: "Regulační aktualizace vyžaduje akci",
      trustCenterAccess: "Přístup do Trust Center",
      trustCenterRequest: "Nová Trust Center žádost",
      vendorQuestionnaire: "Bezpečnostní dotazník dodavatele",
    },
  },
  "en-EU": {
    bodies: {
      accessReviewReminder:
        "It is time to run the quarterly access review for Microsoft 365 and GitHub.",
      trustCenterAccessExpiry: "Access is valid for 24 hours.",
      vendorQuestionnaire:
        "Please complete the security questionnaire for the supply-chain risk review.",
      vendorQuestionnaireReason:
        "You are receiving this email because the listed organisation requested a vendor security assessment.",
      vendorQuestionnaireUnexpected:
        "If you were not expecting this message, verify it with your contact at the listed organisation.",
    },
    labels: {
      approval: "Approval",
      company: "Company",
      control: "Control",
      document: "Document",
      evidenceExpiry: "Evidence expiry",
      link: "Link",
      organisation: "Organisation",
      published: "Published",
      requester: "Requester",
      reviewDate: "Review date",
      source: "Source",
      sourceUrl: "Source URL",
      summary: "Summary",
      update: "Update",
      vendor: "Vendor",
    },
    subjects: {
      accessReviewReminder: "Quarterly access review",
      evidenceExpiry: "Evidence is nearing expiry",
      policyReview: "Annual document review",
      regulationUpdate: "Regulatory update requires action",
      trustCenterAccess: "Trust Center access",
      trustCenterRequest: "New Trust Center request",
      vendorQuestionnaire: "Vendor security questionnaire",
    },
  },
  "it-IT": {
    bodies: {
      accessReviewReminder:
        "È il momento di avviare la revisione trimestrale degli accessi per Microsoft 365 e GitHub.",
      trustCenterAccessExpiry: "L'accesso è valido per 24 ore.",
      vendorQuestionnaire:
        "Ti chiediamo di compilare il questionario di sicurezza per la revisione del rischio della catena di fornitura.",
      vendorQuestionnaireReason:
        "Ricevi questa email perché l'organizzazione indicata ha richiesto una valutazione di sicurezza del fornitore.",
      vendorQuestionnaireUnexpected:
        "Se non aspettavi questo messaggio, verificalo con il tuo contatto presso l'organizzazione indicata.",
    },
    labels: {
      approval: "Approvazione",
      company: "Azienda",
      control: "Controllo",
      document: "Documento",
      evidenceExpiry: "Scadenza dell'evidenza",
      link: "Link",
      organisation: "Organizzazione",
      published: "Pubblicato",
      requester: "Richiedente",
      reviewDate: "Data revisione",
      source: "Fonte",
      sourceUrl: "URL fonte",
      summary: "Sintesi",
      update: "Aggiornamento",
      vendor: "Fornitore",
    },
    subjects: {
      accessReviewReminder: "Revisione trimestrale degli accessi",
      evidenceExpiry: "Evidenza in scadenza",
      policyReview: "Revisione annuale del documento",
      regulationUpdate: "Aggiornamento normativo: azione richiesta",
      trustCenterAccess: "Accesso al Trust Center",
      trustCenterRequest: "Nuova richiesta Trust Center",
      vendorQuestionnaire: "Questionario sicurezza fornitore",
    },
  },
} satisfies Record<Locale, AlertEmailCopy>;

function getAlertEmailCopy(locale?: string | null) {
  return alertEmailCopy[normalizeLocale(locale) ?? "cs-CZ"];
}

export function evidenceExpirySubject(input: {
  controlTitle: string;
  locale?: string | null;
}) {
  const copy = getAlertEmailCopy(input.locale);

  return `${copy.subjects.evidenceExpiry}: ${input.controlTitle}`;
}

export function evidenceExpiryText(input: {
  controlTitle: string;
  expiresAt: string;
  locale?: string | null;
  organisationName: string;
}) {
  const copy = getAlertEmailCopy(input.locale);

  return [
    `${copy.labels.organisation}: ${input.organisationName}`,
    `${copy.labels.control}: ${input.controlTitle}`,
    `${copy.labels.evidenceExpiry}: ${input.expiresAt}`,
  ].join("\n");
}

export function policyReviewSubject(input: {
  locale?: string | null;
  policyTitle: string;
}) {
  const copy = getAlertEmailCopy(input.locale);

  return `${copy.subjects.policyReview}: ${input.policyTitle}`;
}

export function policyReviewText(input: {
  expiresAt: string;
  locale?: string | null;
  organisationName: string;
  policyTitle: string;
}) {
  const copy = getAlertEmailCopy(input.locale);

  return [
    `${copy.labels.organisation}: ${input.organisationName}`,
    `${copy.labels.document}: ${input.policyTitle}`,
    `${copy.labels.reviewDate}: ${input.expiresAt}`,
  ].join("\n");
}

export function regulationUpdateSubject(input: {
  locale?: string | null;
  title: string;
}) {
  const copy = getAlertEmailCopy(input.locale);

  return `${copy.subjects.regulationUpdate}: ${input.title}`;
}

export function regulationUpdateText(input: {
  locale?: string | null;
  organisationName: string;
  publishedAt: Date;
  source: string;
  sourceUrl?: string | null;
  summary?: string | null;
  title: string;
}) {
  const copy = getAlertEmailCopy(input.locale);

  return [
    `${copy.labels.organisation}: ${input.organisationName}`,
    `${copy.labels.source}: ${input.source}`,
    `${copy.labels.update}: ${input.title}`,
    `${copy.labels.published}: ${input.publishedAt.toISOString().slice(0, 10)}`,
    input.summary ? `${copy.labels.summary}: ${input.summary}` : null,
    input.sourceUrl ? `${copy.labels.sourceUrl}: ${input.sourceUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function trustCenterRequestSubject(input: {
  locale?: string | null;
  organisationName: string;
}) {
  const copy = getAlertEmailCopy(input.locale);

  return `${copy.subjects.trustCenterRequest}: ${input.organisationName}`;
}

export function trustCenterRequestText(input: {
  locale?: string | null;
  organisationName: string;
  requesterCompany?: string | null;
  requesterEmail: string;
  reviewUrl: string;
}) {
  const copy = getAlertEmailCopy(input.locale);

  return [
    `${copy.labels.organisation}: ${input.organisationName}`,
    `${copy.labels.requester}: ${input.requesterEmail}`,
    input.requesterCompany
      ? `${copy.labels.company}: ${input.requesterCompany}`
      : null,
    `${copy.labels.approval}: ${input.reviewUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function trustCenterAccessSubject(input: {
  locale?: string | null;
  organisationName: string;
}) {
  const copy = getAlertEmailCopy(input.locale);

  return `${copy.subjects.trustCenterAccess}: ${input.organisationName}`;
}

export function trustCenterAccessText(input: {
  organisationName: string;
  accessUrl: string;
  locale?: string | null;
}) {
  const copy = getAlertEmailCopy(input.locale);

  return [
    `${copy.labels.organisation}: ${input.organisationName}`,
    copy.bodies.trustCenterAccessExpiry,
    `${copy.labels.link}: ${input.accessUrl}`,
  ].join("\n");
}

export function vendorQuestionnaireSubject(input: {
  locale?: string | null;
  organisationName: string;
}) {
  const copy = getAlertEmailCopy(input.locale);

  return `${copy.subjects.vendorQuestionnaire}: ${input.organisationName}`;
}

export function vendorQuestionnaireText(input: {
  assessmentUrl: string;
  locale?: string | null;
  organisationName: string;
  vendorName: string;
}) {
  const copy = getAlertEmailCopy(input.locale);

  return [
    `${copy.labels.requester}: ${input.organisationName}`,
    `${copy.labels.vendor}: ${input.vendorName}`,
    copy.bodies.vendorQuestionnaireReason,
    copy.bodies.vendorQuestionnaire,
    copy.bodies.vendorQuestionnaireUnexpected,
    `${copy.labels.link}: ${input.assessmentUrl}`,
  ].join("\n");
}

export function accessReviewReminderSubject(input: {
  locale?: string | null;
  organisationName: string;
}) {
  const copy = getAlertEmailCopy(input.locale);

  return `${copy.subjects.accessReviewReminder}: ${input.organisationName}`;
}

export function accessReviewReminderText(input: {
  accessReviewsUrl: string;
  locale?: string | null;
  organisationName: string;
}) {
  const copy = getAlertEmailCopy(input.locale);

  return [
    `${copy.labels.organisation}: ${input.organisationName}`,
    copy.bodies.accessReviewReminder,
    `${copy.labels.link}: ${input.accessReviewsUrl}`,
  ].join("\n");
}
