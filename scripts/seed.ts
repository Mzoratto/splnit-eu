import { and, eq } from "drizzle-orm";
import { loadEnvConfig } from "@next/env";
import { CONTROL_LIBRARY } from "../lib/controls/library";
import { getDb } from "../lib/db";
import {
  controls,
  frameworkControls,
  frameworks,
  tests,
} from "../lib/db/schema";
import { FRAMEWORK_LIBRARY } from "../lib/frameworks/registry";
import { MICROSOFT365_TEST_DEFINITIONS } from "../lib/integrations/microsoft365/test-definitions";

loadEnvConfig(process.cwd());

async function seedFrameworks() {
  const db = getDb();
  const ids = new Map<string, string>();

  for (const framework of FRAMEWORK_LIBRARY) {
    const [row] = await db
      .insert(frameworks)
      .values({
        slug: framework.slug,
        nameCs: framework.nameCs,
        nameEn: framework.nameEn,
        descriptionCs: framework.descriptionCs,
        regulator: framework.regulator,
        mandatoryDeadline: framework.mandatoryDeadline,
        version: framework.version,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: frameworks.slug,
        set: {
          nameCs: framework.nameCs,
          nameEn: framework.nameEn,
          descriptionCs: framework.descriptionCs,
          regulator: framework.regulator,
          mandatoryDeadline: framework.mandatoryDeadline,
          version: framework.version,
          isActive: true,
        },
      })
      .returning({ id: frameworks.id, slug: frameworks.slug });

    ids.set(row.slug, row.id);
  }

  return ids;
}

async function seedControls() {
  const db = getDb();
  const ids = new Map<string, string>();

  for (const control of CONTROL_LIBRARY) {
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

    ids.set(row.key, row.id);
  }

  return ids;
}

async function seedFrameworkControls(
  frameworkIds: Map<string, string>,
  controlIds: Map<string, string>,
) {
  const db = getDb();
  let count = 0;

  for (const control of CONTROL_LIBRARY) {
    const controlId = controlIds.get(control.key);

    if (!controlId) {
      throw new Error(`Missing control id for ${control.key}`);
    }

    for (const [index, mapping] of control.frameworkMappings.entries()) {
      const frameworkId = frameworkIds.get(mapping.frameworkSlug);

      if (!frameworkId) {
        throw new Error(`Missing framework id for ${mapping.frameworkSlug}`);
      }

      await db
        .insert(frameworkControls)
        .values({
          frameworkId,
          controlId,
          articleRef: mapping.articleRef,
          requirementLevel: mapping.level,
          sortOrder: index,
        })
        .onConflictDoUpdate({
          target: [frameworkControls.frameworkId, frameworkControls.controlId],
          set: {
            articleRef: mapping.articleRef,
            requirementLevel: mapping.level,
            sortOrder: index,
          },
        });

      count += 1;
    }
  }

  return count;
}

async function seedIntegrationTests(controlIds: Map<string, string>) {
  const db = getDb();
  let count = 0;

  for (const definition of MICROSOFT365_TEST_DEFINITIONS) {
    const controlId = controlIds.get(definition.controlKey);

    if (!controlId) {
      throw new Error(`Missing control id for ${definition.controlKey}`);
    }

    const existingRows = await db
      .select({ id: tests.id })
      .from(tests)
      .where(
        and(
          eq(tests.controlId, controlId),
          eq(tests.integrationType, "microsoft365"),
          eq(tests.checkLogic, definition.checkLogic),
        ),
      )
      .limit(1);
    const existing = existingRows[0] ?? null;

    if (existing) {
      await db
        .update(tests)
        .set({
          isActive: true,
          name: definition.name,
          passCriteria: definition.passCriteria,
        })
        .where(eq(tests.id, existing.id));
    } else {
      await db.insert(tests).values({
        checkLogic: definition.checkLogic,
        controlId,
        integrationType: "microsoft365",
        isActive: true,
        name: definition.name,
        passCriteria: definition.passCriteria,
      });
    }

    count += 1;
  }

  return count;
}

async function main() {
  const frameworkIds = await seedFrameworks();
  const controlIds = await seedControls();
  const mappingCount = await seedFrameworkControls(frameworkIds, controlIds);
  const integrationTestCount = await seedIntegrationTests(controlIds);

  const db = getDb();
  const [frameworkRows, controlRows] = await Promise.all([
    db.select().from(frameworks),
    db.select().from(controls),
  ]);

  console.log(
    `Seeded ${frameworkRows.length} frameworks, ${controlRows.length} controls, ${mappingCount} framework-control mappings, ${integrationTestCount} integration tests.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
