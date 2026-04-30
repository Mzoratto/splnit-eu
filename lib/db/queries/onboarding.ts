import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  frameworks,
  organisations,
  orgFrameworks,
} from "@/lib/db/schema";

export async function getOnboardingState(clerkOrgId: string) {
  const db = getDb();
  const organisationRows = await db
    .select()
    .from(organisations)
    .where(eq(organisations.clerkOrgId, clerkOrgId))
    .limit(1);
  const frameworkRows = await db
    .select({ slug: frameworks.slug })
    .from(orgFrameworks)
    .innerJoin(frameworks, eq(orgFrameworks.frameworkId, frameworks.id))
    .where(eq(orgFrameworks.clerkOrgId, clerkOrgId));

  return {
    organisation: organisationRows[0] ?? null,
    selectedFrameworks: frameworkRows.map((row) => row.slug),
  };
}

export async function saveOnboardingCompany(input: {
  clerkOrgId: string;
  name: string;
  ico: string | null;
  sector: string;
  employeeCount: string;
}) {
  const db = getDb();

  await db
    .insert(organisations)
    .values({
      clerkOrgId: input.clerkOrgId,
      employeeCount: input.employeeCount,
      ico: input.ico,
      name: input.name,
      sector: input.sector,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: organisations.clerkOrgId,
      set: {
        employeeCount: input.employeeCount,
        ico: input.ico,
        name: input.name,
        sector: input.sector,
        updatedAt: new Date(),
      },
    });
}

export async function saveOnboardingFrameworks(input: {
  clerkOrgId: string;
  frameworkSlugs: string[];
}) {
  const db = getDb();
  const selectedFrameworks = input.frameworkSlugs.length
    ? await db
        .select({ id: frameworks.id })
        .from(frameworks)
        .where(inArray(frameworks.slug, input.frameworkSlugs))
    : [];

  await db
    .delete(orgFrameworks)
    .where(eq(orgFrameworks.clerkOrgId, input.clerkOrgId));

  if (selectedFrameworks.length === 0) {
    return;
  }

  await db
    .insert(orgFrameworks)
    .values(
      selectedFrameworks.map((framework) => ({
        clerkOrgId: input.clerkOrgId,
        frameworkId: framework.id,
        score: 0,
        status: "active",
      })),
    )
    .onConflictDoNothing();
}

export async function saveOnboardingTools(input: {
  clerkOrgId: string;
  toolKeys: string[];
}) {
  const db = getDb();

  await db
    .update(organisations)
    .set({
      toolInventory: input.toolKeys,
      updatedAt: new Date(),
    })
    .where(eq(organisations.clerkOrgId, input.clerkOrgId));
}

export async function completeOnboarding(input: {
  clerkOrgId: string;
  initialScore: number;
}) {
  const db = getDb();
  const orgFrameworkRows = await db
    .select({ frameworkId: orgFrameworks.frameworkId })
    .from(orgFrameworks)
    .where(eq(orgFrameworks.clerkOrgId, input.clerkOrgId));

  await db
    .update(organisations)
    .set({
      onboardingCompletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(organisations.clerkOrgId, input.clerkOrgId));

  if (orgFrameworkRows.length === 0) {
    return;
  }

  await db
    .update(orgFrameworks)
    .set({ score: input.initialScore })
    .where(
      and(
        eq(orgFrameworks.clerkOrgId, input.clerkOrgId),
        inArray(
          orgFrameworks.frameworkId,
          orgFrameworkRows.map((row) => row.frameworkId),
        ),
      ),
    );
}
