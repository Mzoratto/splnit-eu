import { and, eq, inArray } from "drizzle-orm";
import { CONTROL_LIBRARY, type FrameworkSlug } from "@/lib/controls/library";
import { getDb } from "@/lib/db";
import {
  controls,
  frameworks,
  orgControlStatuses,
  orgIntakeProfiles,
  organisations,
  type OrgIntakeAnswers,
  type OrgIntakeDerivedScope,
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
  const intakeProfileRows = await db
    .select()
    .from(orgIntakeProfiles)
    .where(eq(orgIntakeProfiles.clerkOrgId, clerkOrgId))
    .limit(1);

  return {
    intakeProfile: intakeProfileRows[0] ?? null,
    organisation: organisationRows[0] ?? null,
    selectedFrameworks: frameworkRows.map((row) => row.slug),
  };
}

export async function getOnboardingIntakeProfile(clerkOrgId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(orgIntakeProfiles)
    .where(eq(orgIntakeProfiles.clerkOrgId, clerkOrgId))
    .limit(1);

  return rows[0] ?? null;
}

export async function saveOnboardingIntakeProfile(input: {
  answers: OrgIntakeAnswers;
  clerkOrgId: string;
  derivedScope: OrgIntakeDerivedScope;
  version?: number;
}) {
  const db = getDb();
  const now = new Date();

  await db
    .insert(orgIntakeProfiles)
    .values({
      answers: input.answers,
      clerkOrgId: input.clerkOrgId,
      derivedScope: input.derivedScope,
      updatedAt: now,
      version: input.version ?? 1,
    })
    .onConflictDoUpdate({
      target: orgIntakeProfiles.clerkOrgId,
      set: {
        answers: input.answers,
        derivedScope: input.derivedScope,
        updatedAt: now,
        version: input.version ?? 1,
      },
    });
}

export async function markOnboardingIntakeCompleted(clerkOrgId: string) {
  const db = getDb();
  const now = new Date();

  await db
    .update(orgIntakeProfiles)
    .set({ completedAt: now, updatedAt: now })
    .where(eq(orgIntakeProfiles.clerkOrgId, clerkOrgId));
}

type SeedableStatus = "unknown" | "manual_review" | "fail" | "not_applicable" | "out_of_scope";

type IntakeScopeControlSeed = {
  controlKey: string;
  recommendedInitialStatus?: SeedableStatus;
};

export async function seedInitialControlStatusesFromIntakeScope(clerkOrgId: string) {
  const db = getDb();
  const intakeProfileRows = await db
    .select({ derivedScope: orgIntakeProfiles.derivedScope })
    .from(orgIntakeProfiles)
    .where(eq(orgIntakeProfiles.clerkOrgId, clerkOrgId))
    .limit(1);
  const derivedScope = intakeProfileRows[0]?.derivedScope;

  if (!derivedScope) {
    return { inserted: 0 };
  }

  const statusByControlKey = buildSeedStatusByControlKey(derivedScope);
  const selectedFrameworks = await getPersistedFrameworkSlugs(clerkOrgId);
  const controlKeys = Array.from(statusByControlKey.keys()).filter((controlKey) =>
    isMappedToSelectedFramework(controlKey, selectedFrameworks),
  );

  if (controlKeys.length === 0) {
    return { inserted: 0 };
  }

  const controlRows = await db
    .select({ id: controls.id, key: controls.key })
    .from(controls)
    .where(inArray(controls.key, controlKeys));

  if (controlRows.length === 0) {
    return { inserted: 0 };
  }

  const now = new Date();
  const insertedRows = await db
    .insert(orgControlStatuses)
    .values(
      controlRows.map((control) => {
        const seed = statusByControlKey.get(control.key);

        return {
          clerkOrgId,
          controlId: control.id,
          notes: buildIntakeScopeNote(seed?.rationale),
          status: seed?.status ?? "unknown",
          updatedAt: now,
        };
      }),
    )
    .onConflictDoNothing({
      target: [orgControlStatuses.clerkOrgId, orgControlStatuses.controlId],
    })
    .returning({ id: orgControlStatuses.id });

  return { inserted: insertedRows.length };
}

async function getPersistedFrameworkSlugs(clerkOrgId: string): Promise<FrameworkSlug[]> {
  const db = getDb();
  const rows = await db
    .select({ slug: frameworks.slug })
    .from(orgFrameworks)
    .innerJoin(frameworks, eq(orgFrameworks.frameworkId, frameworks.id))
    .where(eq(orgFrameworks.clerkOrgId, clerkOrgId));

  return rows
    .map((row) => row.slug)
    .filter((slug): slug is FrameworkSlug => isFrameworkSlug(slug));
}

function isFrameworkSlug(value: string): value is FrameworkSlug {
  return ["nis2", "ai-act", "gdpr", "iso27001", "csrd"].includes(value);
}

function isMappedToSelectedFramework(controlKey: string, selectedFrameworks: readonly FrameworkSlug[]) {
  if (selectedFrameworks.length === 0) {
    return false;
  }

  const control = CONTROL_LIBRARY.find((entry) => entry.key === controlKey);
  if (!control) {
    return false;
  }

  return control.frameworkMappings.some((mapping) => selectedFrameworks.includes(mapping.frameworkSlug));
}

function buildSeedStatusByControlKey(derivedScope: OrgIntakeDerivedScope) {
  const statusByControlKey = new Map<
    string,
    { rationale?: string; status: SeedableStatus }
  >();
  const rationales = derivedScope.rationales ?? {};

  for (const control of getIntakeScopeControls(derivedScope)) {
    if (!control.controlKey) {
      continue;
    }

    statusByControlKey.set(control.controlKey, {
      rationale: rationales[control.controlKey],
      status: normalizeSeedableStatus(control.recommendedInitialStatus) ?? "unknown",
    });
  }

  for (const controlKey of derivedScope.notApplicableControlKeys ?? []) {
    statusByControlKey.set(controlKey, {
      rationale: rationales[controlKey],
      status: "not_applicable",
    });
  }

  for (const controlKey of derivedScope.outOfScopeControlKeys ?? []) {
    statusByControlKey.set(controlKey, {
      rationale: rationales[controlKey],
      status: "out_of_scope",
    });
  }

  return statusByControlKey;
}

function getIntakeScopeControls(derivedScope: OrgIntakeDerivedScope): IntakeScopeControlSeed[] {
  if (!Array.isArray(derivedScope.controls)) {
    return [];
  }

  return derivedScope.controls.filter((control): control is IntakeScopeControlSeed => {
    if (!control || typeof control !== "object") {
      return false;
    }

    return typeof (control as IntakeScopeControlSeed).controlKey === "string";
  });
}

function normalizeSeedableStatus(status: unknown): SeedableStatus | null {
  if (
    status === "unknown" ||
    status === "manual_review" ||
    status === "fail" ||
    status === "not_applicable" ||
    status === "out_of_scope"
  ) {
    return status;
  }

  return null;
}

function buildIntakeScopeNote(rationale?: string) {
  return rationale ? `Intake scope: ${rationale}` : "Intake scope: derived from onboarding answers.";
}

export async function saveOnboardingCompany(input: {
  clerkOrgId: string;
  country: string;
  employeeCount: string;
  ico: string | null;
  locale: string;
  name: string;
  primaryJurisdiction: string;
  sector: string;
}) {
  const db = getDb();

  await db
    .insert(organisations)
    .values({
      clerkOrgId: input.clerkOrgId,
      country: input.country,
      employeeCount: input.employeeCount,
      ico: input.ico,
      locale: input.locale,
      name: input.name,
      primaryJurisdiction: input.primaryJurisdiction,
      sector: input.sector,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: organisations.clerkOrgId,
      set: {
        country: input.country,
        employeeCount: input.employeeCount,
        ico: input.ico,
        locale: input.locale,
        name: input.name,
        primaryJurisdiction: input.primaryJurisdiction,
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

  await seedInitialControlStatusesFromIntakeScope(input.clerkOrgId);

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
