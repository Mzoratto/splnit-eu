import {
  and,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  frameworks,
  organisations,
  orgFrameworks,
  profiles,
  regulationUpdateReads,
  regulationUpdates,
} from "@/lib/db/schema";

export type RegulationUpdateInput = {
  affectsPlans?: string[] | null;
  externalId: string;
  frameworkSlug?: string | null;
  publishedAt: Date;
  severity: string;
  source: string;
  sourceUrl?: string | null;
  summaryCs?: string | null;
  title: string;
};

export type RegulationAlertUpdate = RegulationUpdateInput & {
  id: string;
};

export type RelevantRegulationUpdate = {
  frameworkName: string | null;
  id: string;
  isRead: boolean;
  publishedAt: Date;
  severity: string;
  source: string;
  sourceUrl: string | null;
  summary: string | null;
  title: string;
};

type OrganisationRegulationContext = {
  frameworkIds: string[];
  plan: string;
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

async function getOrganisationRegulationContext(
  clerkOrgId: string,
): Promise<OrganisationRegulationContext | null> {
  const db = getDb();
  const organisationRows = await db
    .select({
      plan: organisations.plan,
    })
    .from(organisations)
    .where(eq(organisations.clerkOrgId, clerkOrgId))
    .limit(1);
  const organisation = organisationRows[0] ?? null;

  if (!organisation) {
    return null;
  }

  const frameworkRows = await db
    .select({
      frameworkId: orgFrameworks.frameworkId,
    })
    .from(orgFrameworks)
    .where(eq(orgFrameworks.clerkOrgId, clerkOrgId));

  return {
    frameworkIds: frameworkRows.map((row) => row.frameworkId),
    plan: organisation.plan,
  };
}

function getRelevantUpdateConditions(
  context: OrganisationRegulationContext,
  since?: Date,
) {
  const conditions: SQL[] = [
    or(
      isNull(regulationUpdates.affectsPlans),
      sql`${context.plan} = ANY(${regulationUpdates.affectsPlans})`,
    ) as SQL,
  ];

  if (context.frameworkIds.length > 0) {
    conditions.push(
      or(
        isNull(regulationUpdates.frameworkId),
        inArray(regulationUpdates.frameworkId, context.frameworkIds),
      ) as SQL,
    );
  } else {
    conditions.push(isNull(regulationUpdates.frameworkId));
  }

  if (since) {
    conditions.push(gte(regulationUpdates.publishedAt, since));
  }

  return and(...conditions);
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
      source: input.source,
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

export async function listRegulationAlertRecipients(input: {
  affectsPlans?: string[] | null;
  frameworkSlug?: string | null;
}) {
  const db = getDb();
  const conditions = [
    isNotNull(profiles.email),
    inArray(profiles.role, ["admin", "owner", "org:admin"]),
  ];

  if (input.affectsPlans?.length) {
    conditions.push(inArray(organisations.plan, input.affectsPlans));
  }

  if (input.frameworkSlug) {
    return db
      .select({
        email: profiles.email,
        organisationName: organisations.name,
      })
      .from(profiles)
      .innerJoin(organisations, eq(profiles.clerkOrgId, organisations.clerkOrgId))
      .innerJoin(
        orgFrameworks,
        eq(orgFrameworks.clerkOrgId, organisations.clerkOrgId),
      )
      .innerJoin(
        frameworks,
        and(
          eq(frameworks.id, orgFrameworks.frameworkId),
          eq(frameworks.slug, input.frameworkSlug),
        ),
      )
      .where(and(...conditions));
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

export async function listRelevantRegulationUpdates(
  clerkOrgId: string,
  limit = 5,
): Promise<RelevantRegulationUpdate[]> {
  const context = await getOrganisationRegulationContext(clerkOrgId);

  if (!context) {
    return [];
  }

  const db = getDb();
  const rows = await db
    .select({
      frameworkName: frameworks.nameCs,
      id: regulationUpdates.id,
      publishedAt: regulationUpdates.publishedAt,
      readAt: regulationUpdateReads.readAt,
      severity: regulationUpdates.severity,
      source: regulationUpdates.source,
      sourceUrl: regulationUpdates.sourceUrl,
      summary: regulationUpdates.summaryCs,
      title: regulationUpdates.title,
    })
    .from(regulationUpdates)
    .leftJoin(frameworks, eq(regulationUpdates.frameworkId, frameworks.id))
    .leftJoin(
      regulationUpdateReads,
      and(
        eq(regulationUpdateReads.updateId, regulationUpdates.id),
        eq(regulationUpdateReads.clerkOrgId, clerkOrgId),
      ),
    )
    .where(getRelevantUpdateConditions(context))
    .orderBy(desc(regulationUpdates.publishedAt))
    .limit(limit);

  return rows.map((row) => ({
    frameworkName: row.frameworkName,
    id: row.id,
    isRead: Boolean(row.readAt),
    publishedAt: row.publishedAt,
    severity: row.severity,
    source: row.source,
    sourceUrl: row.sourceUrl,
    summary: row.summary,
    title: row.title,
  }));
}

export async function markRegulationUpdateRead(input: {
  clerkOrgId: string;
  updateId: string;
}) {
  const db = getDb();

  await db
    .insert(regulationUpdateReads)
    .values({
      clerkOrgId: input.clerkOrgId,
      readAt: new Date(),
      updateId: input.updateId,
    })
    .onConflictDoUpdate({
      target: [regulationUpdateReads.updateId, regulationUpdateReads.clerkOrgId],
      set: {
        readAt: new Date(),
      },
    });
}

export async function countUnreadRelevantRegulationUpdates(clerkOrgId: string) {
  const context = await getOrganisationRegulationContext(clerkOrgId);

  if (!context) {
    return 0;
  }

  const db = getDb();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      readAt: regulationUpdateReads.readAt,
    })
    .from(regulationUpdates)
    .leftJoin(
      regulationUpdateReads,
      and(
        eq(regulationUpdateReads.updateId, regulationUpdates.id),
        eq(regulationUpdateReads.clerkOrgId, clerkOrgId),
      ),
    )
    .where(getRelevantUpdateConditions(context, since))
    .limit(500);

  return rows.filter((row) => !row.readAt).length;
}

export async function countActionRequiredRegulationUpdates() {
  const db = getDb();
  const [row] = await db
    .select({ value: count() })
    .from(regulationUpdates)
    .where(eq(regulationUpdates.severity, "action_required"));

  return row?.value ?? 0;
}

export async function listWeeklyRegulationDigestRecipients(since: Date) {
  const db = getDb();
  const [updateRows, recipientRows] = await Promise.all([
    db
      .select({
        affectsPlans: regulationUpdates.affectsPlans,
        frameworkId: regulationUpdates.frameworkId,
        frameworkName: frameworks.nameCs,
        id: regulationUpdates.id,
        publishedAt: regulationUpdates.publishedAt,
        severity: regulationUpdates.severity,
        source: regulationUpdates.source,
        sourceUrl: regulationUpdates.sourceUrl,
        summary: regulationUpdates.summaryCs,
        title: regulationUpdates.title,
      })
      .from(regulationUpdates)
      .leftJoin(frameworks, eq(regulationUpdates.frameworkId, frameworks.id))
      .where(gte(regulationUpdates.publishedAt, since))
      .orderBy(desc(regulationUpdates.publishedAt))
      .limit(100),
    db
      .select({
        clerkOrgId: organisations.clerkOrgId,
        email: profiles.email,
        frameworkId: orgFrameworks.frameworkId,
        organisationName: organisations.name,
        plan: organisations.plan,
      })
      .from(organisations)
      .innerJoin(profiles, eq(profiles.clerkOrgId, organisations.clerkOrgId))
      .leftJoin(orgFrameworks, eq(orgFrameworks.clerkOrgId, organisations.clerkOrgId))
      .where(
        and(
          isNotNull(profiles.email),
          inArray(profiles.role, ["admin", "owner", "org:admin"]),
        ),
      ),
  ]);
  const recipients = new Map<
    string,
    {
      email: string;
      frameworkIds: Set<string>;
      organisationName: string;
      plan: string;
    }
  >();

  for (const row of recipientRows) {
    if (!row.email) {
      continue;
    }

    const key = `${row.clerkOrgId}:${row.email}`;
    const recipient =
      recipients.get(key) ??
      {
        email: row.email,
        frameworkIds: new Set<string>(),
        organisationName: row.organisationName,
        plan: row.plan,
      };

    if (row.frameworkId) {
      recipient.frameworkIds.add(row.frameworkId);
    }

    recipients.set(key, recipient);
  }

  return Array.from(recipients.values()).flatMap((recipient) => {
    const updates = updateRows
      .filter((update) => {
        const matchesPlan =
          !update.affectsPlans?.length ||
          update.affectsPlans.includes(recipient.plan);
        const matchesFramework =
          !update.frameworkId || recipient.frameworkIds.has(update.frameworkId);

        return matchesPlan && matchesFramework;
      })
      .slice(0, 10);

    if (updates.length === 0) {
      return [];
    }

    return {
      email: recipient.email,
      organisationName: recipient.organisationName,
      updates,
    };
  });
}
