import "server-only";

import { auth } from "@clerk/nextjs/server";
import { getLocale } from "next-intl/server";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";

export async function getTenantLocale(): Promise<Locale> {
  const requestLocale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured || !hasDatabaseUrl()) {
    return requestLocale;
  }

  const session = await auth();

  if (!session.orgId) {
    return requestLocale;
  }

  try {
    const organisation = await getOrganisationByClerkOrgId(session.orgId);
    return normalizeLocale(organisation?.locale) ?? requestLocale;
  } catch {
    return requestLocale;
  }
}
