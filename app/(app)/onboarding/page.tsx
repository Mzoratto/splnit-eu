import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { hasDatabaseUrl } from "@/lib/db";
import { getOnboardingState } from "@/lib/db/queries/onboarding";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import { TOOL_INVENTORY_LIBRARY } from "@/lib/onboarding/tools";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);
  const session = clerkConfigured ? await auth() : null;
  const onboardingState =
    session?.orgId && hasDatabaseUrl()
      ? await getOnboardingState(session.orgId)
      : null;

  if (onboardingState?.organisation?.onboardingCompletedAt) {
    redirect("/dashboard");
  }

  return (
    <OnboardingWizard
      frameworks={FRAMEWORK_LIBRARY}
      initialCompany={{
        country: onboardingState?.organisation?.country ?? "IT",
        employeeCount: onboardingState?.organisation?.employeeCount ?? "10-49",
        ico: onboardingState?.organisation?.ico ?? "",
        locale: onboardingState?.organisation?.locale ?? "it-IT",
        name: onboardingState?.organisation?.name ?? "",
        primaryJurisdiction:
          onboardingState?.organisation?.primaryJurisdiction ?? "IT",
        sector: onboardingState?.organisation?.sector ?? "technology",
      }}
      initialFrameworks={onboardingState?.selectedFrameworks ?? ["nis2"]}
      initialTools={onboardingState?.organisation?.toolInventory ?? []}
      tools={TOOL_INVENTORY_LIBRARY}
    />
  );
}
