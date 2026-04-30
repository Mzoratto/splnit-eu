import { and, count, eq, inArray, isNotNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  frameworks,
  organisations,
  profiles,
  regulationUpdates,
} from "@/lib/db/schema";

export type RegulationUpdateInput = {
  affectsPlans?: string[] | null;
  externalId: string;
  frameworkSlug?: string | null;
  publishedAt: Date;
  severity: string;
  sourceUrl?: string | null;
  summaryCs?: string | null;
  title: string;
};

export type RegulationAlertUpdate = RegulationUpdateInput & {
  id: string;
};

async function getFrameworkIds(slugs: string[]) {
  if (slugs.length === 0) {
    return new Map<string, string>();
  }

  const db = getDb();
  const rows = await db
    .select({
      id: frameworks.id,
      slug: frameworks.slug,
    })
    .from(frameworks)
    .where(inArray(frameworks.slug, slugs));

  return new Map(rows.map((row) => [row.slug, row.id]));
}

export async function upsertRegulationUpdates(inputs: RegulationUpdateInput[]) {
  const db = getDb();
  const frameworkIds = await getFrameworkIds(
    Array.from(
      new Set(
        inputs
          .map((input) => input.frameworkSlug)
          .filter((value): value is string => Boolean(value)),
      ),
    ),
  );
  const actionRequiredUpdates: RegulationAlertUpdate[] = [];
  let inserted = 0;
  let updated = 0;

  for (const input of inputs) {
    const existingRows = await db
      .select({ id: regulationUpdates.id })
      .from(regulationUpdates)
      .where(eq(regulationUpdates.externalId, input.externalId))
      .limit(1);
    const existing = existingRows[0] ?? null;
    const values = {
      affectsPlans: input.affectsPlans ?? null,
      externalId: input.externalId,
      frameworkId: input.frameworkSlug
        ? frameworkIds.get(input.frameworkSlug) ?? null
        : null,
      publishedAt: input.publishedAt,
      severity: input.severity,
      sourceUrl: input.sourceUrl ?? null,
      summaryCs: input.summaryCs ?? null,
      title: input.title,
    };

    if (existing) {
      await db
        .update(regulationUpdates)
        .set(values)
        .where(eq(regulationUpdates.id, existing.id));
      updated += 1;
      continue;
    }

    const [row] = await db
      .insert(regulationUpdates)
      .values(values)
      .returning({ id: regulationUpdates.id });
    inserted += 1;

    if (input.severity === "action_required") {
      actionRequiredUpdates.push({
        ...input,
        id: row.id,
      });
    }
  }

  return {
    actionRequiredUpdates,
    inserted,
    updated,
  };
}

export async function listRegulationAlertRecipients(affectsPlans?: string[] | null) {
  const db = getDb();
  const conditions = [
    isNotNull(profiles.email),
    inArray(profiles.role, ["admin", "owner", "org:admin"]),
  ];

  if (affectsPlans?.length) {
    conditions.push(inArray(organisations.plan, affectsPlans));
  }

  return db
    .select({
      email: profiles.email,
      organisationName: organisations.name,
    })
    .from(profiles)
    .innerJoin(organisations, eq(profiles.clerkOrgId, organisations.clerkOrgId))
    .where(and(...conditions));
}

export async function countActionRequiredRegulationUpdates() {
  const db = getDb();
  const [row] = await db
    .select({ value: count() })
    .from(regulationUpdates)
    .where(eq(regulationUpdates.severity, "action_required"));

  return row?.value ?? 0;
}
