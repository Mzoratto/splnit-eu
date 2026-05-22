import {
  resolveAgencyBrandingForOrg,
  type AgencyBrandingContext,
} from "@/lib/db/queries/agencies";

export type { AgencyBrandingContext };

export async function resolveAgencyBranding(
  orgId: string,
): Promise<AgencyBrandingContext | null> {
  return resolveAgencyBrandingForOrg(orgId);
}
