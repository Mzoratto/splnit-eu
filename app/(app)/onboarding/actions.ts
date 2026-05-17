"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { localeCookieName } from "@/i18n/routing";
import type { FrameworkSlug } from "@/lib/controls/library";
import {
  completeOnboarding,
  markOnboardingIntakeCompleted,
  saveOnboardingCompany,
  saveOnboardingFrameworks,
  saveOnboardingIntakeProfile,
  saveOnboardingTools,
} from "@/lib/db/queries/onboarding";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import { INTAKE_PROFILE_VERSION } from "@/lib/onboarding/intake-questions";
import { deriveIntakeScope } from "@/lib/onboarding/intake-scope";
import { TOOL_INVENTORY_LIBRARY } from "@/lib/onboarding/tools";

const sectors = [
  "technology",
  "finance",
  "healthcare",
  "manufacturing",
  "public-sector",
  "professional-services",
] as const;

const employeeCounts = ["1-9", "10-49", "50-249", "250+"] as const;
const countries = ["CZ", "IT", "DE", "FR", "ES", "NL", "PL", "SK", "AT", "BE", "IE"] as const;
const jurisdictions = ["CZ", "IT", "EU"] as const;
const locales = ["cs-CZ", "en-EU", "it-IT"] as const;

const companySchema = z.object({
  country: z.enum(countries),
  employeeCount: z.enum(employeeCounts),
  ico: z.string().trim().max(32).optional(),
  locale: z.enum(locales),
  name: z.string().trim().min(2).max(120),
  primaryJurisdiction: z.enum(jurisdictions),
  sector: z.enum(sectors),
});

const frameworkSchema = z.object({
  frameworkSlugs: z
    .array(z.enum(FRAMEWORK_LIBRARY.map((framework) => framework.slug) as [
      string,
      ...string[],
    ]))
    .min(1)
    .max(FRAMEWORK_LIBRARY.length),
});

const toolSchema = z.object({
  toolKeys: z
    .array(z.enum(TOOL_INVENTORY_LIBRARY.map((tool) => tool.key) as [
      string,
      ...string[],
    ]))
    .max(TOOL_INVENTORY_LIBRARY.length),
});

const businessModels = [
  "professional_services",
  "saas",
  "physical_operations",
  "regulated_service",
] as const;
const intakeSectors = [
  "professional_services",
  "technology",
  "manufacturing",
  "healthcare",
  "other",
] as const;
const employeeBands = ["1_9", "10_49", "50_249", "250_plus"] as const;
const personalDataScopes = ["none", "employees_only", "customers_and_employees"] as const;
const processorUses = ["none", "few", "many"] as const;
const aiSystemUses = ["none", "internal_productivity", "customer_or_patient_facing"] as const;

const intakeSchema = z.object({
  answers: z.object({
    businessModel: z.enum(businessModels),
    employeeBand: z.enum(employeeBands),
    handlesPersonalData: z.enum(personalDataScopes),
    handlesSensitiveData: z.boolean(),
    hasCriticalOperations: z.boolean(),
    hasProductionSoftware: z.boolean(),
    hasPublicApp: z.boolean(),
    sector: z.enum(intakeSectors),
    usesAiSystems: z.enum(aiSystemUses),
    usesCloudHosting: z.boolean(),
    usesHighRiskAi: z.boolean(),
    usesThirdPartyProcessors: z.enum(processorUses),
  }),
  selectedFrameworks: z
    .array(z.enum(FRAMEWORK_LIBRARY.map((framework) => framework.slug) as [
      string,
      ...string[],
    ]))
    .min(1)
    .max(FRAMEWORK_LIBRARY.length),
  selectedTools: z
    .array(z.enum(TOOL_INVENTORY_LIBRARY.map((tool) => tool.key) as [
      string,
      ...string[],
    ]))
    .max(TOOL_INVENTORY_LIBRARY.length),
});

const completeSchema = z.object({
  initialScore: z.number().int().min(0).max(100),
});

async function getActiveOrgId() {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    throw new Error("Active Clerk organisation is required.");
  }

  return session.orgId;
}

async function persistLocaleCookie(locale: string) {
  const cookieStore = await cookies();

  cookieStore.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
  });
}

export async function saveCompanyStep(input: unknown) {
  const parsed = companySchema.parse(input);
  const clerkOrgId = await getActiveOrgId();

  await saveOnboardingCompany({
    clerkOrgId,
    country: parsed.country,
    employeeCount: parsed.employeeCount,
    ico: parsed.ico || null,
    locale: parsed.locale,
    name: parsed.name,
    primaryJurisdiction: parsed.primaryJurisdiction,
    sector: parsed.sector,
  });
  await persistLocaleCookie(parsed.locale);

  revalidatePath("/onboarding");
}

export async function saveFrameworkStep(input: unknown) {
  const parsed = frameworkSchema.parse(input);
  const clerkOrgId = await getActiveOrgId();

  await saveOnboardingFrameworks({
    clerkOrgId,
    frameworkSlugs: parsed.frameworkSlugs,
  });

  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
}

export async function saveToolsStep(input: unknown) {
  const parsed = toolSchema.parse(input);
  const clerkOrgId = await getActiveOrgId();

  await saveOnboardingTools({
    clerkOrgId,
    toolKeys: parsed.toolKeys,
  });

  revalidatePath("/onboarding");
}

export async function saveIntakeStep(input: unknown) {
  const parsed = intakeSchema.parse(input);
  const clerkOrgId = await getActiveOrgId();
  const derivedScope = deriveIntakeScope({
    answers: parsed.answers,
    selectedFrameworks: parsed.selectedFrameworks as FrameworkSlug[],
    selectedTools: parsed.selectedTools,
  });

  await saveOnboardingIntakeProfile({
    answers: parsed.answers,
    clerkOrgId,
    derivedScope,
    version: INTAKE_PROFILE_VERSION,
  });
  await markOnboardingIntakeCompleted(clerkOrgId);

  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
}

export async function completeOnboardingStep(input: unknown) {
  const parsed = completeSchema.parse(input);
  const clerkOrgId = await getActiveOrgId();

  await completeOnboarding({
    clerkOrgId,
    initialScore: parsed.initialScore,
  });

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
}
