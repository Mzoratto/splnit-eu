const TRUST_CENTER_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])$/;

export const TRUST_CENTER_RESERVED_SLUGS = ["demo", "splnit"] as const;

export function normalizeTrustCenterSlug(value: string) {
  const slug = value.trim().toLowerCase();

  if (!TRUST_CENTER_SLUG_PATTERN.test(slug)) {
    throw new Error(
      "invalid Trust Center slug: use 3-63 lowercase letters, numbers, or hyphens; start and end with a letter or number.",
    );
  }

  if ((TRUST_CENTER_RESERVED_SLUGS as readonly string[]).includes(slug)) {
    throw new Error(
      `reserved Trust Center slug: ${slug} is used by a built-in public Trust Center.`,
    );
  }

  return slug;
}
