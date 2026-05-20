import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { hasDatabaseUrl } from "@/lib/db";
import { getOnboardingState } from "@/lib/db/queries/onboarding";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import { TOOL_INVENTORY_LIBRARY } from "@/lib/onboarding/tools";
import type { IntakeAnswers } from "@/lib/onboarding/intake-scope";

const defaultIntakeAnswers: IntakeAnswers = {
  accountingPlatform: "none",
  businessModel: "saas",
  employeeBand: "10_49",
  handlesPersonalData: "customers_and_employees",
  handlesSensitiveData: false,
  hasCriticalOperations: false,
  hasProductionSoftware: true,
  hasPublicApp: true,
  sector: "technology",
  usesAiSystems: "internal_productivity",
  usesCloudHosting: true,
  usesHighRiskAi: false,
  usesThirdPartyProcessors: "few",
};

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
        country: onboardingState?.organisation?.country ?? "CZ",
        employeeCount: onboardingState?.organisation?.employeeCount ?? "10-49",
        ico: onboardingState?.organisation?.ico ?? "",
        locale: onboardingState?.organisation?.locale ?? "cs-CZ",
        name: onboardingState?.organisation?.name ?? "",
        primaryJurisdiction:
          onboardingState?.organisation?.primaryJurisdiction ?? "CZ",
        sector: onboardingState?.organisation?.sector ?? "technology",
      }}
      initialFrameworks={onboardingState?.selectedFrameworks ?? ["nis2"]}
      initialIntakeAnswers={{
        ...defaultIntakeAnswers,
        ...(onboardingState?.intakeProfile?.answers as Partial<IntakeAnswers> | undefined),
      }}
      serverPersistenceEnabled={Boolean(session?.orgId && hasDatabaseUrl())}
      initialTools={onboardingState?.organisation?.toolInventory ?? ["microsoft365", "github"]}
      tools={TOOL_INVENTORY_LIBRARY}
    />
  );
}
