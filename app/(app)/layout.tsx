import { redirect } from "next/navigation";
import { ClerkThemeProvider } from "@/components/app/clerk-theme-provider";
import { auth } from "@clerk/nextjs/server";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { AppShell } from "@/components/app/app-shell";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";
import { hasDatabaseUrl } from "@/lib/db";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { countUnreadRelevantRegulationUpdates } from "@/lib/db/queries/regulation-updates";
import { getTrustCenterSlugByClerkOrgId } from "@/lib/db/queries/trust-center";
import { normalizePlanKey, type PlanKey } from "@/lib/stripe/plans";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);
  let organisationName: string | null = null;
  let plan: PlanKey = "free";
  let regulationUpdateCount = 0;
  let tenantLocale: Locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  let trustCenterSlug: string | null = null;

  if (clerkConfigured) {
    const session = await auth();
    if (!session.userId || !session.orgId) {
      redirect("/sign-in");
    }

    if (hasDatabaseUrl()) {
      const [
        organisation,
        unreadRegulationUpdateCount,
        savedTrustCenterSlug,
      ] = await Promise.all([
        getOrganisationByClerkOrgId(session.orgId),
        countUnreadRelevantRegulationUpdates(session.orgId),
        getTrustCenterSlugByClerkOrgId(session.orgId),
      ]);
      organisationName = organisation?.name ?? null;
      plan = normalizePlanKey(organisation?.plan);
      regulationUpdateCount = unreadRegulationUpdateCount;
      tenantLocale = normalizeLocale(organisation?.locale) ?? tenantLocale;
      trustCenterSlug = savedTrustCenterSlug;
    }
  }

  const messages = getMessagesForLocale(tenantLocale);
  const displayOrganisationName =
    organisationName ??
    (clerkConfigured
      ? messages.shell.organisationFallback
      : messages.shell.demoOrganisation);

  const shell = (
    <NextIntlClientProvider
      locale={tenantLocale}
      messages={messages}
    >
      <AppShell
        clerkEnabled={clerkConfigured}
        organisationName={displayOrganisationName}
        plan={plan}
        regulationUpdateCount={regulationUpdateCount}
        trustCenterHref={
          trustCenterSlug ? `/trust/${trustCenterSlug}` : "/trust/demo"
        }
      >
        {children}
      </AppShell>
    </NextIntlClientProvider>
  );

  if (!clerkConfigured) {
    return shell;
  }

  return <ClerkThemeProvider>{shell}</ClerkThemeProvider>;
}
