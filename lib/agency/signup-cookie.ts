export const PENDING_AGENCY_SIGNUP_COOKIE = "splnit_pending_agency_signup";

export type PendingAgencySignup = {
  clerkOrgId: string;
  name: string;
  slug: string;
};

export function encodePendingAgencySignup(input: PendingAgencySignup) {
  return encodeURIComponent(JSON.stringify(input));
}

export function decodePendingAgencySignup(
  value: string | null | undefined,
): PendingAgencySignup | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<PendingAgencySignup>;

    if (
      typeof parsed.clerkOrgId === "string" &&
      typeof parsed.name === "string" &&
      typeof parsed.slug === "string"
    ) {
      return {
        clerkOrgId: parsed.clerkOrgId,
        name: parsed.name,
        slug: parsed.slug,
      };
    }
  } catch {
    return null;
  }

  return null;
}
