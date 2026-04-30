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
  sourceUrl?: string | null;
  publishedAt: Date;
}) {
  return [
    `Organizace: ${input.organisationName}`,
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

export function vendorQuestionnaireSubject(organisationName: string) {
  return `Bezpečnostní dotazník dodavatele: ${organisationName}`;
}

export function vendorQuestionnaireText(input: {
  assessmentUrl: string;
  organisationName: string;
  vendorName: string;
}) {
  return [
    `Organizace: ${input.organisationName}`,
    `Dodavatel: ${input.vendorName}`,
    "Prosíme o vyplnění bezpečnostního dotazníku pro supply-chain risk review.",
    `Odkaz: ${input.assessmentUrl}`,
  ].join("\n");
}
