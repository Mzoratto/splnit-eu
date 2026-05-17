import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { and, eq, inArray } from "drizzle-orm";
import { CONTROL_LIBRARY, type FrameworkSlug } from "@/lib/controls/library";
import { getDb } from "@/lib/db";
import {
  controls,
  orgControlStatuses,
  orgFrameworks,
  orgIntakeProfiles,
  organisations,
} from "@/lib/db/schema";
import {
  completeOnboarding,
  saveOnboardingCompany,
  saveOnboardingFrameworks,
  saveOnboardingIntakeProfile,
  saveOnboardingTools,
} from "@/lib/db/queries/onboarding";
import { getDashboardData } from "@/lib/db/queries/dashboard";
import { INTAKE_PROFILE_VERSION } from "@/lib/onboarding/intake-questions";
import { deriveIntakeScope, type IntakeAnswers } from "@/lib/onboarding/intake-scope";

loadEnvConfig(process.cwd());

assert.ok(process.env.DATABASE_URL?.trim(), "DATABASE_URL is required for onboarding status seeding smoke.");

const clerkOrgId = `smoke_onboarding_status_seed_${Date.now()}`;
const frameworkSlugs = ["nis2", "gdpr", "iso27001"] satisfies FrameworkSlug[];
const answers: IntakeAnswers = {
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
  usesThirdPartyProcessors: "many",
};

async function cleanup() {
  const db = getDb();

  await db.delete(orgControlStatuses).where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
  await db.delete(orgIntakeProfiles).where(eq(orgIntakeProfiles.clerkOrgId, clerkOrgId));
  await db.delete(orgFrameworks).where(eq(orgFrameworks.clerkOrgId, clerkOrgId));
  await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
}

async function getControlIdsByKey(keys: readonly string[]) {
  const db = getDb();
  const rows = await db
    .select({ id: controls.id, key: controls.key })
    .from(controls)
    .where(inArray(controls.key, [...keys]));

  return new Map(rows.map((row) => [row.key, row.id]));
}

async function getStatusesByKey(keys: readonly string[]) {
  const db = getDb();
  const rows = await db
    .select({ key: controls.key, notes: orgControlStatuses.notes, status: orgControlStatuses.status })
    .from(orgControlStatuses)
    .innerJoin(controls, eq(orgControlStatuses.controlId, controls.id))
    .where(
      and(
        eq(orgControlStatuses.clerkOrgId, clerkOrgId),
        inArray(controls.key, [...keys]),
      ),
    );

  return new Map(rows.map((row) => [row.key, row]));
}

function isMappedToFrameworks(controlKey: string, selectedFrameworks: readonly FrameworkSlug[]) {
  const control = CONTROL_LIBRARY.find((entry) => entry.key === controlKey);
  return control?.frameworkMappings.some((mapping) => selectedFrameworks.includes(mapping.frameworkSlug)) ?? false;
}

async function main() {
  await cleanup();

  try {
    await saveOnboardingCompany({
      clerkOrgId,
      country: "IT",
      employeeCount: "10-49",
      ico: "IT-SEED-SMOKE",
      locale: "it-IT",
      name: "Onboarding Status Seed Smoke S.r.l.",
      primaryJurisdiction: "IT",
      sector: "technology",
    });
    await saveOnboardingFrameworks({ clerkOrgId, frameworkSlugs });
    await saveOnboardingTools({ clerkOrgId, toolKeys: ["github-copilot", "hubspot"] });

    const derivedScope = deriveIntakeScope({
      answers,
      selectedFrameworks: ["nis2", "gdpr", "iso27001", "ai-act"],
      selectedTools: ["github-copilot", "hubspot"],
    });
    assert.ok(derivedScope.applicableControlKeys.includes("ctrl_mfa_all_users"));
    assert.ok(derivedScope.failControlKeys.includes("ctrl_cloudtrail_enabled"));
    assert.ok(derivedScope.outOfScopeControlKeys.length > 0);

    await saveOnboardingIntakeProfile({
      answers,
      clerkOrgId,
      derivedScope,
      version: INTAKE_PROFILE_VERSION,
    });

    const selectedOutOfScopeControlKey = derivedScope.outOfScopeControlKeys.find((controlKey) =>
      isMappedToFrameworks(controlKey, frameworkSlugs),
    );
    assert.ok(selectedOutOfScopeControlKey, "expected one out-of-scope control mapped to selected frameworks");

    const controlIds = await getControlIdsByKey([
      "ctrl_mfa_all_users",
      "ctrl_cloudtrail_enabled",
      selectedOutOfScopeControlKey,
    ]);
    const mfaControlId = controlIds.get("ctrl_mfa_all_users");
    assert.ok(mfaControlId, "MFA control should exist in seeded controls.");

    await getDb().insert(orgControlStatuses).values({
      clerkOrgId,
      controlId: mfaControlId,
      notes: "Manual owner decision that must not be overwritten by intake seeding.",
      status: "pass",
      updatedAt: new Date(),
    });

    await completeOnboarding({ clerkOrgId, initialScore: 0 });
    await completeOnboarding({ clerkOrgId, initialScore: 0 });

    const expectedKeys = [
      "ctrl_mfa_all_users",
      "ctrl_cloudtrail_enabled",
      "ctrl_ai_system_inventory",
      selectedOutOfScopeControlKey,
    ];
    const statuses = await getStatusesByKey(expectedKeys);

    assert.equal(statuses.get("ctrl_mfa_all_users")?.status, "pass", "manual pass should be preserved");
    assert.equal(statuses.get("ctrl_cloudtrail_enabled")?.status, "fail", "applicable fail control should be seeded");
    assert.equal(
      statuses.get("ctrl_ai_system_inventory"),
      undefined,
      "controls outside the org's persisted frameworks must not be seeded from a stale or client-supplied scope",
    );
    assert.match(
      statuses.get("ctrl_cloudtrail_enabled")?.notes ?? "",
      /Intake scope:/,
      "seeded applicable controls should carry intake rationale notes",
    );
    assert.equal(
      statuses.get(selectedOutOfScopeControlKey)?.status,
      "out_of_scope",
      "scoped-out controls should be recorded",
    );

    const dashboardData = await getDashboardData(clerkOrgId);
    const dashboardPriorityKeys = dashboardData.priorityControls
      .filter((control) => control.isIntakePriority)
      .map((control) => control.key);
    assert.ok(
      derivedScope.priorityControlKeys.length > 5,
      "smoke profile should have enough priority controls to catch pre-sort query truncation",
    );
    assert.deepEqual(
      new Set(dashboardPriorityKeys),
      new Set(
        derivedScope.priorityControlKeys.filter(
          (controlKey) => controlKey !== "ctrl_mfa_all_users" && isMappedToFrameworks(controlKey, frameworkSlugs),
        ),
      ),
      "dashboard priority query should include every open intake priority before the UI slices visible rows",
    );
    assert.deepEqual(
      dashboardData.priorityControls.slice(0, Math.min(3, dashboardData.priorityControls.length)).map((control) => control.isIntakePriority),
      dashboardData.priorityControls.length === 0 ? [] : Array(Math.min(3, dashboardData.priorityControls.length)).fill(true),
      "dashboard priority controls should sort intake priorities first",
    );

    const seededRows = await getDb()
      .select({ controlId: orgControlStatuses.controlId })
      .from(orgControlStatuses)
      .where(eq(orgControlStatuses.clerkOrgId, clerkOrgId));
    assert.equal(
      seededRows.length,
      new Set(seededRows.map((row) => row.controlId)).size,
      "status seeding should be idempotent and not duplicate rows",
    );
  } finally {
    await cleanup();
  }
}

main()
  .then(() => {
    console.log("Onboarding status seeding smoke passed.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
