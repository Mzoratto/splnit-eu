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
