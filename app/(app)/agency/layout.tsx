import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasDatabaseUrl } from "@/lib/db";
import { getAgencyForUser } from "@/lib/db/queries/agencies";
import { requireActiveSubscription } from "@/lib/stripe/subscriptions";

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session.userId) {
    redirect("/sign-in");
  }

  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-pathname") ?? "";
  const isSignupRoute =
    pathname.endsWith("/agency/signup") ||
    pathname.includes("/agency/signup/");

  if (!hasDatabaseUrl()) {
    redirect("/dashboard");
  }

  if (isSignupRoute) {
    return children;
  }

  const membership = await getAgencyForUser(session.userId);

  if (!membership) {
    redirect("/agency/signup");
  }

  if (membership.agency.stripeSubscriptionId) {
    const entitlement = membership.agency.clerkOrgId
      ? await requireActiveSubscription(membership.agency.clerkOrgId)
      : { subscribed: false as const };

    if (!entitlement.subscribed || entitlement.plan !== "agency") {
      redirect("/settings/billing?required=agency");
    }
  }

  return children;
}
