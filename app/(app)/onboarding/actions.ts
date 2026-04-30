"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  completeOnboarding,
  saveOnboardingCompany,
  saveOnboardingFrameworks,
  saveOnboardingTools,
} from "@/lib/db/queries/onboarding";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
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

const companySchema = z.object({
  employeeCount: z.enum(employeeCounts),
  ico: z.string().trim().max(32).optional(),
  name: z.string().trim().min(2).max(120),
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

export async function saveCompanyStep(input: unknown) {
  const parsed = companySchema.parse(input);
  const clerkOrgId = await getActiveOrgId();

  await saveOnboardingCompany({
    clerkOrgId,
    employeeCount: parsed.employeeCount,
    ico: parsed.ico || null,
    name: parsed.name,
    sector: parsed.sector,
  });

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
