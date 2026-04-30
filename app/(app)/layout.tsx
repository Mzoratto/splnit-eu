import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AppShell } from "@/components/app/app-shell";
import { hasDatabaseUrl } from "@/lib/db";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
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
  let organisationName = "Demo organizace";
  let plan: PlanKey = "free";

  if (clerkConfigured) {
    const session = await auth();
    if (!session.userId || !session.orgId) {
      redirect("/sign-in");
    }

    if (hasDatabaseUrl()) {
      const organisation = await getOrganisationByClerkOrgId(session.orgId);
      organisationName = organisation?.name ?? "Organizace";
      plan = normalizePlanKey(organisation?.plan);
    }
  }

  return (
    <AppShell
      clerkEnabled={clerkConfigured}
      organisationName={organisationName}
      plan={plan}
    >
      {children}
    </AppShell>
  );
}
