import { and, desc, eq, sql } from "drizzle-orm";
import { getDashboardData } from "@/lib/db/queries/dashboard";
import { getDb } from "@/lib/db";
import {
  consultantClients,
  frameworks,
  organisations,
  orgFrameworks,
} from "@/lib/db/schema";

export type ConsultantClientListItem = Awaited<
  ReturnType<typeof getConsultantClients>
>[number];

export async function getConsultantClients(consultantOrgId: string) {
  const db = getDb();

  return db
    .select({
      accessLevel: consultantClients.accessLevel,
      clientOrgId: consultantClients.clientOrgId,
      createdAt: consultantClients.createdAt,
      frameworkCount: sql<number>`count(${orgFrameworks.id})::int`,
      id: consultantClients.id,
      inviteEmail: consultantClients.inviteEmail,
      name: organisations.name,
      plan: organisations.plan,
      score: sql<number>`coalesce(round(avg(${orgFrameworks.score}))::int, 0)`,
      sector: organisations.sector,
      status: consultantClients.status,
      updatedAt: consultantClients.updatedAt,
      whiteLabelAccentColor: consultantClients.whiteLabelAccentColor,
      whiteLabelLogoUrl: consultantClients.whiteLabelLogoUrl,
    })
    .from(consultantClients)
    .innerJoin(
      organisations,
      eq(consultantClients.clientOrgId, organisations.clerkOrgId),
    )
    .leftJoin(orgFrameworks, eq(orgFrameworks.clerkOrgId, organisations.clerkOrgId))
    .where(eq(consultantClients.consultantOrgId, consultantOrgId))
    .groupBy(
      consultantClients.accessLevel,
      consultantClients.clientOrgId,
      consultantClients.createdAt,
      consultantClients.id,
      consultantClients.inviteEmail,
      consultantClients.status,
      consultantClients.updatedAt,
      consultantClients.whiteLabelAccentColor,
      consultantClients.whiteLabelLogoUrl,
      organisations.name,
      organisations.plan,
      organisations.sector,
    )
    .orderBy(desc(consultantClients.updatedAt));
}

export async function getConsultantClientDetail(input: {
  clientOrgId: string;
  consultantOrgId: string;
}) {
  const db = getDb();
  const rows = await db
    .select({
      accessLevel: consultantClients.accessLevel,
      client: organisations,
      inviteEmail: consultantClients.inviteEmail,
      status: consultantClients.status,
      whiteLabelAccentColor: consultantClients.whiteLabelAccentColor,
      whiteLabelLogoUrl: consultantClients.whiteLabelLogoUrl,
    })
    .from(consultantClients)
    .innerJoin(
      organisations,
      eq(consultantClients.clientOrgId, organisations.clerkOrgId),
    )
    .where(
      and(
        eq(consultantClients.consultantOrgId, input.consultantOrgId),
        eq(consultantClients.clientOrgId, input.clientOrgId),
      ),
    )
    .limit(1);
  const relationship = rows[0] ?? null;

  if (!relationship) {
    return null;
  }

  const [frameworkRows, dashboard] = await Promise.all([
    db
      .select({
        name: frameworks.nameCs,
        regulator: frameworks.regulator,
        score: orgFrameworks.score,
        slug: frameworks.slug,
        status: orgFrameworks.status,
      })
      .from(orgFrameworks)
      .innerJoin(frameworks, eq(orgFrameworks.frameworkId, frameworks.id))
      .where(eq(orgFrameworks.clerkOrgId, input.clientOrgId))
      .orderBy(frameworks.nameCs),
    getDashboardData(input.clientOrgId),
  ]);

  return {
    dashboard,
    frameworks: frameworkRows,
    relationship,
  };
}

export async function linkConsultantClient(input: {
  accessLevel: string;
  clientOrgId: string;
  consultantOrgId: string;
  inviteEmail?: string | null;
}) {
  if (input.clientOrgId === input.consultantOrgId) {
    throw new Error("Consultant and client organisations must be different.");
  }

  const db = getDb();
  const clientRows = await db
    .select({ clerkOrgId: organisations.clerkOrgId })
    .from(organisations)
    .where(eq(organisations.clerkOrgId, input.clientOrgId))
    .limit(1);

  if (!clientRows[0]) {
    throw new Error("Client organisation not found.");
  }

  const rows = await db
    .insert(consultantClients)
    .values({
      accessLevel: input.accessLevel,
      clientOrgId: input.clientOrgId,
      consultantOrgId: input.consultantOrgId,
      inviteEmail: input.inviteEmail ?? null,
      status: "active",
    })
    .onConflictDoUpdate({
      target: [consultantClients.consultantOrgId, consultantClients.clientOrgId],
      set: {
        accessLevel: input.accessLevel,
        inviteEmail: input.inviteEmail ?? null,
        status: "active",
        updatedAt: new Date(),
      },
    })
    .returning({ id: consultantClients.id });

  const relationshipId = rows[0]?.id;

  if (!relationshipId) {
    throw new Error("Failed to link consultant client.");
  }

  return relationshipId;
}

export async function updateConsultantClientBranding(input: {
  accentColor?: string | null;
  clientOrgId: string;
  consultantOrgId: string;
  logoUrl?: string | null;
}) {
  const db = getDb();

  const [updated] = await db
    .update(consultantClients)
    .set({
      updatedAt: new Date(),
      whiteLabelAccentColor: input.accentColor ?? null,
      whiteLabelLogoUrl: input.logoUrl ?? null,
    })
    .where(
      and(
        eq(consultantClients.consultantOrgId, input.consultantOrgId),
        eq(consultantClients.clientOrgId, input.clientOrgId),
      ),
    )
    .returning({ id: consultantClients.id });

  if (!updated) {
    throw new Error("Consultant client relationship not found.");
  }
}
