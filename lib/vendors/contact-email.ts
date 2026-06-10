const CONTACT_EMAIL_KEYS = [
  "contactEmail",
  "contact_email",
  "email",
  "e_mail",
  "kontakt_email",
] as const;

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const email = value.trim();
  if (!email || email.length > 254) {
    return null;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function getContactEmailFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
) {
  if (!metadata) {
    return null;
  }

  for (const key of CONTACT_EMAIL_KEYS) {
    const email = normalizeEmail(metadata[key]);
    if (email) {
      return email;
    }
  }

  return null;
}

export function normalizeContactEmail(value: unknown) {
  return normalizeEmail(value);
}
