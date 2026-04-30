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
