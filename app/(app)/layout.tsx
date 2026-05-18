import type { Metadata } from "next";
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
import { getOnboardingIntakeProfile } from "@/lib/db/queries/onboarding";
import { countUnreadRelevantRegulationUpdates } from "@/lib/db/queries/regulation-updates";
import { getPublicTrustCenterSlugByClerkOrgId } from "@/lib/db/queries/trust-center";
import { normalizePlanKey, type PlanKey } from "@/lib/stripe/plans";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
};

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
  let isPreIntake = true;

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
        intakeProfile,
      ] = await Promise.all([
        getOrganisationByClerkOrgId(session.orgId),
        countUnreadRelevantRegulationUpdates(session.orgId),
        getPublicTrustCenterSlugByClerkOrgId(session.orgId),
        getOnboardingIntakeProfile(session.orgId),
      ]);
      organisationName = organisation?.name ?? null;
      plan = normalizePlanKey(organisation?.plan);
      regulationUpdateCount = unreadRegulationUpdateCount;
      tenantLocale = normalizeLocale(organisation?.locale) ?? tenantLocale;
      trustCenterSlug = savedTrustCenterSlug;
      isPreIntake = !intakeProfile?.completedAt;
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
        isPreIntake={isPreIntake}
        regulationUpdateCount={regulationUpdateCount}
        trustCenterHref={
          trustCenterSlug ? `/trust/${trustCenterSlug}` : "/trust-center"
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
