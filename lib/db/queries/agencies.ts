import { createHash, randomBytes } from "node:crypto";
import { and, count, desc, eq, inArray, or } from "drizzle-orm";
import { calculateComplianceScore } from "@/lib/dashboard/score";
import { getDb } from "@/lib/db";
import {
  agencies,
  agencyBranding,
  agencyClientInvites,
  agencyClientOrgs,
  agencyConsultantInvites,
  agencyConsultants,
  controlComments,
  organisations,
  orgControlStatuses,
  orgFrameworks,
  profiles,
  type ControlCommentAuthorType,
} from "@/lib/db/schema";

const DEFAULT_POWERED_BY_TEXT = "Powered by Splnit.eu";

export type AgencyMembership = {
  agency: typeof agencies.$inferSelect;
  consultant: typeof agencyConsultants.$inferSelect;
};

export type AgencyBrandingContext = {
  displayName: string;
  logoUrl?: string;
  logoAltText?: string;
  primaryColour?: string;
  poweredByText: string;
};

export type ControlComment = {
  agencyId: string;
  authorType: ControlCommentAuthorType;
  authorUserId: string;
  body: string;
  controlKey: string;
  createdAt: Date | null;
  id: string;
  isGapFlag: boolean;
  orgId: string;
  updatedAt: Date | null;
};

export type AgencyClientListItem = Awaited<
  ReturnType<typeof listAgencyClients>
>[number];

function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86_400_000);
}

function normalizeComment(row: typeof controlComments.$inferSelect): ControlComment {
  return {
    agencyId: row.agencyId,
    authorType: row.authorType,
    authorUserId: row.authorUserId,
    body: row.body,
    controlKey: row.controlKey,
    createdAt: row.createdAt,
    id: row.id,
    isGapFlag: row.isGapFlag,
    orgId: row.orgId,
    updatedAt: row.updatedAt,
  };
}

export function groupCommentsByControlKey(comments: ControlComment[]) {
  return comments.reduce<Record<string, ControlComment[]>>((groups, comment) => {
    groups[comment.controlKey] = [...(groups[comment.controlKey] ?? []), comment];
    return groups;
  }, {});
}

export async function getAgencyForUser(userId: string): Promise<AgencyMembership | null> {
  const db = getDb();
  const rows = await db
    .select({
      agency: agencies,
      consultant: agencyConsultants,
    })
    .from(agencyConsultants)
    .innerJoin(agencies, eq(agencyConsultants.agencyId, agencies.id))
    .where(
      and(
        eq(agencyConsultants.clerkUserId, userId),
        eq(agencyConsultants.status, "active"),
        eq(agencies.status, "active"),
      ),
    )
    .orderBy(desc(agencyConsultants.createdAt))
    .limit(1);

  return rows[0] ?? null;
}

export async function getAgencyByClerkOrgId(clerkOrgId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(agencies)
    .where(eq(agencies.clerkOrgId, clerkOrgId))
    .limit(1);

  return rows[0] ?? null;
}

export async function getAgencyBySlug(slug: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(agencies)
    .where(eq(agencies.slug, slug))
    .limit(1);

  return rows[0] ?? null;
}

export async function upsertAgencyForSubscription(input: {
  clerkOrgId: string;
  contactEmail?: string | null;
  name: string;
  planClientLimit?: number;
  slug?: string | null;
  stripeSubscriptionId: string;
}) {
  const db = getDb();
  const values = {
    clerkOrgId: input.clerkOrgId,
    contactEmail: input.contactEmail ?? null,
    name: input.name,
    plan: "agency" as const,
    planClientLimit: input.planClientLimit ?? 20,
    ...(input.slug !== undefined ? { slug: input.slug } : {}),
    status: "active",
    stripeSubscriptionId: input.stripeSubscriptionId,
    updatedAt: new Date(),
  };
  const [row] = await db
    .insert(agencies)
    .values(values)
    .onConflictDoUpdate({
      target: agencies.clerkOrgId,
      set: values,
    })
    .returning({ id: agencies.id });

  if (!row) {
    throw new Error("Failed to upsert agency for subscription.");
  }

  return row.id;
}

export async function updateAgencySignupDetails(input: {
  clerkOrgId: string;
  name: string;
  slug: string;
}) {
  const db = getDb();
  const [row] = await db
    .update(agencies)
    .set({
      name: input.name,
      slug: input.slug,
      updatedAt: new Date(),
    })
    .where(eq(agencies.clerkOrgId, input.clerkOrgId))
    .returning({ id: agencies.id });

  return row?.id ?? null;
}

export async function countAgencyClients(agencyId: string) {
  const db = getDb();
  const [row] = await db
    .select({ value: count() })
    .from(agencyClientOrgs)
    .where(
      and(
        eq(agencyClientOrgs.agencyId, agencyId),
        eq(agencyClientOrgs.status, "active"),
      ),
    );

  return row?.value ?? 0;
}

export async function requireAgencyConsultant(userId: string) {
  const membership = await getAgencyForUser(userId);

  if (!membership) {
    throw new Error("Agency consultant membership required.");
  }

  return membership;
}

export async function requireManagedClient(input: {
  agencyId: string;
  orgId: string;
}) {
  const db = getDb();
  const rows = await db
    .select({
      client: organisations,
      relationship: agencyClientOrgs,
    })
    .from(agencyClientOrgs)
    .innerJoin(organisations, eq(agencyClientOrgs.orgId, organisations.clerkOrgId))
    .where(
      and(
        eq(agencyClientOrgs.agencyId, input.agencyId),
        eq(agencyClientOrgs.orgId, input.orgId),
        eq(agencyClientOrgs.status, "active"),
      ),
    )
    .limit(1);
  const relationship = rows[0] ?? null;

  if (!relationship) {
    throw new Error("Managed client organisation required.");
  }

  return relationship;
}

export async function listAgencyClients(agencyId: string) {
  const db = getDb();
  const rows = await db
    .select({
      client: organisations,
      relationship: agencyClientOrgs,
    })
    .from(agencyClientOrgs)
    .innerJoin(organisations, eq(agencyClientOrgs.orgId, organisations.clerkOrgId))
    .where(
      and(
        eq(agencyClientOrgs.agencyId, agencyId),
        eq(agencyClientOrgs.status, "active"),
      ),
    )
    .orderBy(desc(agencyClientOrgs.updatedAt));

  const orgIds = rows.map((row) => row.client.clerkOrgId);
  const [statusRows, frameworkRows] = orgIds.length
    ? await Promise.all([
        db
          .select({
            clerkOrgId: orgControlStatuses.clerkOrgId,
            status: orgControlStatuses.status,
            updatedAt: orgControlStatuses.updatedAt,
          })
          .from(orgControlStatuses)
          .where(inArray(orgControlStatuses.clerkOrgId, orgIds)),
        db
          .select({
            clerkOrgId: orgFrameworks.clerkOrgId,
            score: orgFrameworks.score,
          })
          .from(orgFrameworks)
          .where(inArray(orgFrameworks.clerkOrgId, orgIds)),
      ])
    : [[], []] as const;

  return rows
    .map((row) => {
      const orgStatusRows = statusRows.filter(
        (statusRow) => statusRow.clerkOrgId === row.client.clerkOrgId,
      );
      const orgFrameworkRows = frameworkRows.filter(
        (frameworkRow) => frameworkRow.clerkOrgId === row.client.clerkOrgId,
      );
      const openGaps = orgStatusRows.filter((statusRow) =>
        ["fail", "manual_review", "unknown", "warning"].includes(statusRow.status),
      ).length;
      const lastStatusActivity = orgStatusRows
        .map((statusRow) => statusRow.updatedAt)
        .filter((date): date is Date => date instanceof Date)
        .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
      const relationshipUpdatedAt = row.relationship.updatedAt ?? row.relationship.createdAt;
      const lastActivityAt =
        lastStatusActivity &&
        relationshipUpdatedAt &&
        lastStatusActivity.getTime() > relationshipUpdatedAt.getTime()
          ? lastStatusActivity
          : relationshipUpdatedAt ?? lastStatusActivity;

      return {
        clientOrgId: row.client.clerkOrgId,
        country: row.client.country,
        createdAt: row.relationship.createdAt,
        frameworkCount: orgFrameworkRows.length,
        id: row.relationship.id,
        lastActivityAt,
        locale: row.client.locale,
        name: row.client.name,
        openGaps,
        plan: row.client.plan,
        score: calculateComplianceScore({
          frameworkScores: orgFrameworkRows,
          statusRows: orgStatusRows,
        }),
        sector: row.client.sector,
        status: row.relationship.status,
        updatedAt: row.relationship.updatedAt,
      };
    })
    .sort((a, b) => {
      if (b.openGaps !== a.openGaps) {
        return b.openGaps - a.openGaps;
      }

      return (b.lastActivityAt?.getTime() ?? 0) - (a.lastActivityAt?.getTime() ?? 0);
    });
}

export async function resolveAgencyBrandingForOrg(
  orgId: string,
): Promise<AgencyBrandingContext | null> {
  const db = getDb();
  const rows = await db
    .select({
      agencyName: agencies.name,
      displayName: agencyBranding.displayName,
      logoAltText: agencyBranding.logoAltText,
      logoUrl: agencyBranding.logoUrl,
      poweredByText: agencyBranding.poweredByText,
      primaryColour: agencyBranding.primaryColour,
    })
    .from(agencyClientOrgs)
    .innerJoin(agencies, eq(agencyClientOrgs.agencyId, agencies.id))
    .leftJoin(agencyBranding, eq(agencyBranding.agencyId, agencies.id))
    .where(
      and(
        eq(agencyClientOrgs.orgId, orgId),
        eq(agencyClientOrgs.status, "active"),
        eq(agencies.status, "active"),
      ),
    )
    .limit(1);
  const row = rows[0] ?? null;

  if (!row) {
    return null;
  }

  const displayName = row.displayName?.trim() || row.agencyName;

  return {
    displayName,
    logoAltText: row.logoAltText?.trim() || displayName,
    logoUrl: row.logoUrl?.trim() || undefined,
    poweredByText: row.poweredByText?.trim() || DEFAULT_POWERED_BY_TEXT,
    primaryColour: row.primaryColour?.trim() || undefined,
  };
}

export async function getAgencySettings(agencyId: string) {
  const db = getDb();
  const [brandingRows, clientRows, consultantRows, inviteRows] = await Promise.all([
    db
      .select()
      .from(agencyBranding)
      .where(eq(agencyBranding.agencyId, agencyId))
      .limit(1),
    db
      .select({
        client: organisations,
        relationship: agencyClientOrgs,
      })
      .from(agencyClientOrgs)
      .innerJoin(organisations, eq(agencyClientOrgs.orgId, organisations.clerkOrgId))
      .where(eq(agencyClientOrgs.agencyId, agencyId))
      .orderBy(desc(agencyClientOrgs.updatedAt)),
    db
      .select()
      .from(agencyConsultants)
      .where(eq(agencyConsultants.agencyId, agencyId))
      .orderBy(desc(agencyConsultants.updatedAt)),
    db
      .select()
      .from(agencyClientInvites)
      .where(eq(agencyClientInvites.agencyId, agencyId))
      .orderBy(desc(agencyClientInvites.createdAt))
      .limit(10),
  ]);

  return {
    branding: brandingRows[0] ?? null,
    clients: clientRows,
    consultants: consultantRows,
    invites: inviteRows,
  };
}

export async function upsertAgencyBranding(input: {
  agencyId: string;
  displayName?: string | null;
  logoAltText?: string | null;
  logoUrl?: string | null;
  poweredByText?: string | null;
  primaryColour?: string | null;
}) {
  const db = getDb();
  const values = {
    agencyId: input.agencyId,
    displayName: input.displayName ?? null,
    logoAltText: input.logoAltText ?? null,
    logoUrl: input.logoUrl ?? null,
    poweredByText: input.poweredByText?.trim() || DEFAULT_POWERED_BY_TEXT,
    primaryColour: input.primaryColour ?? null,
    updatedAt: new Date(),
  };

  const [row] = await db
    .insert(agencyBranding)
    .values(values)
    .onConflictDoUpdate({
      target: agencyBranding.agencyId,
      set: values,
    })
    .returning({ id: agencyBranding.id });

  if (!row) {
    throw new Error("Failed to save agency branding.");
  }

  return row.id;
}

export async function createAgencyClientInvite(input: {
  agencyId: string;
  createdByUserId: string;
  email?: string | null;
  expiresAt?: Date;
}) {
  const db = getDb();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashInviteToken(token);
  const expiresAt = input.expiresAt ?? addDays(new Date(), 7);
  const [row] = await db
    .insert(agencyClientInvites)
    .values({
      agencyId: input.agencyId,
      createdByUserId: input.createdByUserId,
      email: input.email ?? null,
      expiresAt,
      tokenHash,
    })
    .returning({
      id: agencyClientInvites.id,
      expiresAt: agencyClientInvites.expiresAt,
    });

  if (!row) {
    throw new Error("Failed to create agency client invite.");
  }

  return {
    expiresAt: row.expiresAt,
    id: row.id,
    token,
  };
}

export async function getAgencyClientInviteByToken(token: string) {
  const db = getDb();
  const [row] = await db
    .select({
      agency: agencies,
      invite: agencyClientInvites,
    })
    .from(agencyClientInvites)
    .innerJoin(agencies, eq(agencyClientInvites.agencyId, agencies.id))
    .where(eq(agencyClientInvites.tokenHash, hashInviteToken(token)))
    .limit(1);

  return row ?? null;
}

export async function consumeAgencyClientInvite(input: {
  acceptedByUserId: string;
  orgId: string;
  token: string;
}) {
  const db = getDb();
  const inviteRow = await getAgencyClientInviteByToken(input.token);

  if (!inviteRow || inviteRow.invite.status !== "pending") {
    throw new Error("Agency client invite is not valid.");
  }

  if (inviteRow.invite.expiresAt.getTime() <= Date.now()) {
    throw new Error("Agency client invite has expired.");
  }

  if (inviteRow.agency.clerkOrgId === input.orgId) {
    throw new Error("An agency cannot link its own organisation as a client.");
  }

  const orgRows = await db
    .select({ id: organisations.id })
    .from(organisations)
    .where(eq(organisations.clerkOrgId, input.orgId))
    .limit(1);

  if (!orgRows[0]) {
    throw new Error("Client organisation not found.");
  }

  const [relationship] = await db
    .insert(agencyClientOrgs)
    .values({
      agencyId: inviteRow.invite.agencyId,
      linkedByUserId: input.acceptedByUserId,
      orgId: input.orgId,
      status: "active",
    })
    .returning({ id: agencyClientOrgs.id });

  if (!relationship) {
    throw new Error("Failed to link client organisation.");
  }

  await db
    .update(agencyClientInvites)
    .set({
      acceptedAt: new Date(),
      acceptedByUserId: input.acceptedByUserId,
      acceptedOrgId: input.orgId,
      status: "accepted",
      updatedAt: new Date(),
    })
    .where(eq(agencyClientInvites.id, inviteRow.invite.id));

  return relationship.id;
}

export async function recordAgencyConsultantMembership(input: {
  agencyId: string;
  clerkUserId?: string | null;
  email?: string | null;
  invitedByUserId: string;
  role?: string;
}) {
  const db = getDb();
  const email = input.email?.trim() || null;
  const clerkUserId = input.clerkUserId?.trim() || null;

  if (!email && !clerkUserId) {
    throw new Error("Consultant email or Clerk user ID is required.");
  }

  const identityFilters = [
    clerkUserId ? eq(agencyConsultants.clerkUserId, clerkUserId) : null,
    email ? eq(agencyConsultants.email, email) : null,
  ].filter((filter): filter is NonNullable<typeof filter> => Boolean(filter));
  const existingRows = await db
    .select()
    .from(agencyConsultants)
    .where(
      and(
        eq(agencyConsultants.agencyId, input.agencyId),
        identityFilters.length === 1 ? identityFilters[0] : or(...identityFilters),
      ),
    )
    .limit(1);
  const existing = existingRows[0] ?? null;
  const values = {
    clerkUserId,
    email,
    invitedByUserId: input.invitedByUserId,
    role: input.role ?? "consultant",
    status: clerkUserId ? "active" : "pending",
    updatedAt: new Date(),
  };

  if (existing) {
    const [row] = await db
      .update(agencyConsultants)
      .set(values)
      .where(eq(agencyConsultants.id, existing.id))
      .returning({ id: agencyConsultants.id });

    return row?.id ?? existing.id;
  }

  const [row] = await db
    .insert(agencyConsultants)
    .values({
      agencyId: input.agencyId,
      ...values,
    })
    .returning({ id: agencyConsultants.id });

  if (!row) {
    throw new Error("Failed to record agency consultant.");
  }

  return row.id;
}

export async function createAgencyConsultantInvite(input: {
  agencyId: string;
  createdByUserId: string;
  email: string;
  expiresAt?: Date;
  role?: "admin" | "consultant";
}) {
  const db = getDb();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashInviteToken(token);
  const expiresAt = input.expiresAt ?? addDays(new Date(), 7);
  const [row] = await db
    .insert(agencyConsultantInvites)
    .values({
      agencyId: input.agencyId,
      createdByUserId: input.createdByUserId,
      email: input.email,
      expiresAt,
      role: input.role ?? "consultant",
      tokenHash,
    })
    .returning({
      id: agencyConsultantInvites.id,
      expiresAt: agencyConsultantInvites.expiresAt,
    });

  if (!row) {
    throw new Error("Failed to create agency consultant invite.");
  }

  return {
    expiresAt: row.expiresAt,
    id: row.id,
    token,
  };
}

export async function getAgencyConsultantInviteByToken(token: string) {
  const db = getDb();
  const [row] = await db
    .select({
      agency: agencies,
      invite: agencyConsultantInvites,
    })
    .from(agencyConsultantInvites)
    .innerJoin(agencies, eq(agencyConsultantInvites.agencyId, agencies.id))
    .where(eq(agencyConsultantInvites.tokenHash, hashInviteToken(token)))
    .limit(1);

  return row ?? null;
}

export async function consumeAgencyConsultantInvite(input: {
  acceptedByUserId: string;
  token: string;
}) {
  const db = getDb();
  const inviteRow = await getAgencyConsultantInviteByToken(input.token);

  if (!inviteRow || inviteRow.invite.status !== "pending") {
    throw new Error("Agency consultant invite is not valid.");
  }

  if (inviteRow.invite.expiresAt.getTime() <= Date.now()) {
    await db
      .update(agencyConsultantInvites)
      .set({
        status: "expired",
        updatedAt: new Date(),
      })
      .where(eq(agencyConsultantInvites.id, inviteRow.invite.id));
    throw new Error("Agency consultant invite has expired.");
  }

  const membershipId = await recordAgencyConsultantMembership({
    agencyId: inviteRow.invite.agencyId,
    clerkUserId: input.acceptedByUserId,
    email: inviteRow.invite.email,
    invitedByUserId: inviteRow.invite.createdByUserId,
    role: inviteRow.invite.role,
  });

  await db
    .update(agencyConsultantInvites)
    .set({
      acceptedAt: new Date(),
      acceptedByUserId: input.acceptedByUserId,
      status: "accepted",
      updatedAt: new Date(),
    })
    .where(eq(agencyConsultantInvites.id, inviteRow.invite.id));

  return membershipId;
}

export async function listControlCommentsForManagedClient(input: {
  agencyId: string;
  orgId: string;
}) {
  await requireManagedClient(input);

  return listControlComments({
    agencyId: input.agencyId,
    orgId: input.orgId,
  });
}

export async function listControlCommentsForOrg(orgId: string) {
  const link = await getActiveAgencyClientLinkForOrg(orgId);
  const agencyId = link?.agencyId;

  if (!agencyId) {
    return [];
  }

  return listControlComments({ agencyId, orgId });
}

export async function getActiveAgencyClientLinkForOrg(orgId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(agencyClientOrgs)
    .where(
      and(
        eq(agencyClientOrgs.orgId, orgId),
        eq(agencyClientOrgs.status, "active"),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function listControlComments(input: {
  agencyId: string;
  orgId: string;
}) {
  const db = getDb();
  const rows = await db
    .select()
    .from(controlComments)
    .where(
      and(
        eq(controlComments.agencyId, input.agencyId),
        eq(controlComments.orgId, input.orgId),
      ),
    )
    .orderBy(controlComments.createdAt);

  return rows.map(normalizeComment);
}

export async function createControlComment(input: {
  agencyId: string;
  authorType: ControlCommentAuthorType;
  authorUserId: string;
  body: string;
  controlKey: string;
  isGapFlag?: boolean;
  orgId: string;
}) {
  const db = getDb();
  const [row] = await db
    .insert(controlComments)
    .values({
      agencyId: input.agencyId,
      authorType: input.authorType,
      authorUserId: input.authorUserId,
      body: input.body,
      controlKey: input.controlKey,
      isGapFlag: input.isGapFlag ?? false,
      orgId: input.orgId,
    })
    .returning();

  if (!row) {
    throw new Error("Failed to create control comment.");
  }

  return normalizeComment(row);
}

export async function seedAgencyConsultantsFromProfiles(agencyId: string, clerkOrgId: string) {
  const db = getDb();
  const profileRows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.clerkOrgId, clerkOrgId));

  for (const profile of profileRows) {
    await recordAgencyConsultantMembership({
      agencyId,
      clerkUserId: profile.clerkUserId,
      email: profile.email,
      invitedByUserId: "migration",
      role: profile.role === "admin" ? "admin" : "consultant",
    });
  }
}
