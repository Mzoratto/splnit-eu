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
