import { loadEnvConfig } from "@next/env";
import { and, eq, inArray } from "drizzle-orm";

import { HELIOS_CANONICAL_CONTROL_KEYS, HELIOS_CONTROL_SEEDS, assertHeliosCanonicalControlSeeds } from "@/lib/workspaces/control-seeds";
import { getDb } from "@/lib/db";
import { controls, frameworkControls, frameworks } from "@/lib/db/schema";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";

loadEnvConfig(process.cwd());

async function upsertNis2Framework() {
  const db = getDb();
  const nis2 = FRAMEWORK_LIBRARY.find((framework) => framework.slug === "nis2");

  if (!nis2) {
    throw new Error("NIS2 framework seed is missing from FRAMEWORK_LIBRARY");
  }

  const [row] = await db
    .insert(frameworks)
    .values({
      slug: nis2.slug,
      nameCs: nis2.nameCs,
      nameEn: nis2.nameEn,
      descriptionCs: nis2.descriptionCs,
      regulator: nis2.regulator,
      mandatoryDeadline: nis2.mandatoryDeadline,
      version: nis2.version,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: frameworks.slug,
      set: {
        nameCs: nis2.nameCs,
        nameEn: nis2.nameEn,
        descriptionCs: nis2.descriptionCs,
        regulator: nis2.regulator,
        mandatoryDeadline: nis2.mandatoryDeadline,
        version: nis2.version,
        isActive: true,
      },
    })
    .returning({ id: frameworks.id });

  return row.id;
}

export async function seedHeliosControls() {
  assertHeliosCanonicalControlSeeds(HELIOS_CONTROL_SEEDS);

  const db = getDb();
  const nis2FrameworkId = await upsertNis2Framework();
  const controlIds = new Map<string, string>();

  for (const control of HELIOS_CONTROL_SEEDS) {
    const [row] = await db
      .insert(controls)
      .values({
        key: control.key,
        titleCs: control.titleCs,
        titleEn: control.titleEn,
        descriptionCs: control.descriptionCs,
        category: control.category,
        testType: control.testType,
        requiresEvidence: control.requiresEvidence,
        isAutomated: control.isAutomated,
      })
      .onConflictDoUpdate({
        target: controls.key,
        set: {
          titleCs: control.titleCs,
          titleEn: control.titleEn,
          descriptionCs: control.descriptionCs,
          category: control.category,
          testType: control.testType,
          requiresEvidence: control.requiresEvidence,
          isAutomated: control.isAutomated,
        },
      })
      .returning({ id: controls.id, key: controls.key });

    controlIds.set(row.key, row.id);
  }

  const seededControlIds = [...controlIds.values()];

  // Reconcile only NIS2 framework_controls rows for the permanent helios-* controls.
  // This never deletes Helios control rows and never touches unrelated controls or frameworks.
  if (seededControlIds.length > 0) {
    const existingMappings = await db
      .select({ id: frameworkControls.id, controlId: frameworkControls.controlId, articleRef: frameworkControls.articleRef })
      .from(frameworkControls)
      .where(
        and(
          eq(frameworkControls.frameworkId, nis2FrameworkId),
          inArray(frameworkControls.controlId, seededControlIds),
        ),
      );

    const desiredPairs = new Set(
      HELIOS_CONTROL_SEEDS.map((control) => {
        const controlId = controlIds.get(control.key);
        const articleRef = control.frameworkMappings.find((mapping) => mapping.frameworkSlug === "nis2")?.articleRef;
        return `${controlId ?? ""}\u0000${articleRef ?? ""}`;
      }),
    );

    for (const row of existingMappings) {
      const pair = `${row.controlId}\u0000${row.articleRef ?? ""}`;
      if (!desiredPairs.has(pair)) {
        await db.delete(frameworkControls).where(eq(frameworkControls.id, row.id));
      }
    }
  }

  let mappings = 0;

  for (const [index, control] of HELIOS_CONTROL_SEEDS.entries()) {
    const controlId = controlIds.get(control.key);

    if (!controlId) {
      throw new Error(`Missing control id for Helios control ${control.key}`);
    }

    const mapping = control.frameworkMappings.find((entry) => entry.frameworkSlug === "nis2");

    if (!mapping) {
      throw new Error(`Missing NIS2 mapping for Helios control ${control.key}`);
    }

    await db
      .insert(frameworkControls)
      .values({
        frameworkId: nis2FrameworkId,
        controlId,
        articleRef: mapping.articleRef,
        evidenceRequirements: mapping.evidenceRequirements,
        localizedDescription: mapping.localizedDescription ?? control.descriptionCs,
        localizedTitle: mapping.localizedTitle ?? control.titleCs,
        regulatorGuidance: mapping.regulatorGuidance,
        requirementLevel: mapping.level,
        sortOrder: index,
      })
      .onConflictDoUpdate({
        target: [frameworkControls.frameworkId, frameworkControls.controlId, frameworkControls.articleRef],
        set: {
          evidenceRequirements: mapping.evidenceRequirements,
          localizedDescription: mapping.localizedDescription ?? control.descriptionCs,
          localizedTitle: mapping.localizedTitle ?? control.titleCs,
          regulatorGuidance: mapping.regulatorGuidance,
          requirementLevel: mapping.level,
          sortOrder: index,
        },
      });

    mappings += 1;
  }

  return { controls: HELIOS_CANONICAL_CONTROL_KEYS.length, mappings };
}

async function main() {
  const result = await seedHeliosControls();
  console.log("Targeted Helios control seed completed.");
  console.log(`  controls upserted: ${result.controls}`);
  console.log(`  NIS2 mappings reconciled: ${result.mappings}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Targeted Helios control seed failed:");
    console.error(error);
    process.exit(1);
  });
}
