import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { and, eq } from "drizzle-orm";
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
  profiles,
} from "@/lib/db/schema";
import {
  consumeAgencyClientInvite,
  createAgencyClientInvite,
  createAgencyConsultantInvite,
  createControlComment,
  consumeAgencyConsultantInvite,
  getAgencyForUser,
  groupCommentsByControlKey,
  listAgencyClients,
  listControlCommentsForManagedClient,
  requireManagedClient,
  resolveAgencyBrandingForOrg,
} from "@/lib/db/queries/agencies";

loadEnvConfig(process.cwd());

assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required.");

const db = getDb();
const runId = `agency_smoke_${Date.now()}`;
const agencyOrgA = `${runId}_agency_a`;
const agencyOrgB = `${runId}_agency_b`;
const clientOrgA = `${runId}_client_a`;
const clientOrgB = `${runId}_client_b`;
const consultantUserA = `${runId}_consultant_a`;
const consultantUserB = `${runId}_consultant_b`;
const clientUserA = `${runId}_client_user_a`;

async function cleanup() {
  const agencyRows = await db
    .select({ id: agencies.id })
    .from(agencies)
    .where(eq(agencies.name, runId));
  const agencyIds = agencyRows.map((row) => row.id);

  for (const agencyId of agencyIds) {
    await db.delete(controlComments).where(eq(controlComments.agencyId, agencyId));
    await db.delete(agencyClientInvites).where(eq(agencyClientInvites.agencyId, agencyId));
    await db
      .delete(agencyConsultantInvites)
      .where(eq(agencyConsultantInvites.agencyId, agencyId));
    await db.delete(agencyClientOrgs).where(eq(agencyClientOrgs.agencyId, agencyId));
    await db.delete(agencyConsultants).where(eq(agencyConsultants.agencyId, agencyId));
    await db.delete(agencyBranding).where(eq(agencyBranding.agencyId, agencyId));
    await db.delete(agencies).where(eq(agencies.id, agencyId));
  }

  for (const clerkOrgId of [agencyOrgA, agencyOrgB, clientOrgA, clientOrgB]) {
    await db.delete(profiles).where(eq(profiles.clerkOrgId, clerkOrgId));
    await db.delete(organisations).where(eq(organisations.clerkOrgId, clerkOrgId));
  }
}

async function seedOrganisations() {
  await db.insert(organisations).values([
    {
      clerkOrgId: agencyOrgA,
      country: "IT",
      locale: "it-IT",
      name: `${runId} Agency A`,
      primaryJurisdiction: "IT",
    },
    {
      clerkOrgId: agencyOrgB,
      country: "IT",
      locale: "it-IT",
      name: `${runId} Agency B`,
      primaryJurisdiction: "IT",
    },
    {
      clerkOrgId: clientOrgA,
      country: "IT",
      locale: "it-IT",
      name: `${runId} Client A`,
      primaryJurisdiction: "IT",
    },
    {
      clerkOrgId: clientOrgB,
      country: "IT",
      locale: "it-IT",
      name: `${runId} Client B`,
      primaryJurisdiction: "IT",
    },
  ]);

  await db.insert(profiles).values({
    clerkOrgId: agencyOrgA,
    clerkUserId: consultantUserA,
    email: `${runId}@example.com`,
    fullName: "Agency Smoke Consultant",
    role: "admin",
  });
}

async function seedAgencies() {
  const [agencyA, agencyB] = await db
    .insert(agencies)
    .values([
      {
        clerkOrgId: agencyOrgA,
        name: runId,
      },
      {
        clerkOrgId: agencyOrgB,
        name: runId,
      },
    ])
    .returning({ id: agencies.id, clerkOrgId: agencies.clerkOrgId });

  assert.ok(agencyA?.id, "Agency A should be inserted.");
  assert.ok(agencyB?.id, "Agency B should be inserted.");

  await db.insert(agencyConsultants).values({
    agencyId: agencyA.id,
    clerkUserId: consultantUserA,
    email: `${runId}@example.com`,
    role: "admin",
    status: "active",
  });

  return {
    agencyAId: agencyA.id,
    agencyBId: agencyB.id,
  };
}

async function assertAccessIsolation(agencyAId: string, agencyBId: string) {
  const membership = await getAgencyForUser(consultantUserA);

  assert.equal(membership?.agency.id, agencyAId);

  await db.insert(agencyClientOrgs).values({
    agencyId: agencyAId,
    orgId: clientOrgA,
  });

  assert.equal((await listAgencyClients(agencyAId)).length, 1);
  await requireManagedClient({ agencyId: agencyAId, orgId: clientOrgA });
  await assert.rejects(
    () => requireManagedClient({ agencyId: agencyBId, orgId: clientOrgA }),
    /Managed client organisation required/,
  );
  await assert.rejects(
    () =>
      db.insert(agencyClientOrgs).values({
        agencyId: agencyAId,
        orgId: clientOrgA,
      }),
    /Failed query|duplicate key|unique constraint/i,
  );
  await assert.rejects(
    () =>
      db.insert(agencyClientOrgs).values({
        agencyId: agencyBId,
        orgId: clientOrgA,
      }),
    /Failed query|duplicate key|unique constraint/i,
  );
}

async function assertBrandingResolver(agencyAId: string) {
  assert.equal(await resolveAgencyBrandingForOrg(clientOrgB), null);

  await db.insert(agencyBranding).values({
    agencyId: agencyAId,
    displayName: "Smoke Agency",
    logoAltText: "Smoke Agency logo",
    logoUrl: "https://example.com/logo.svg",
    poweredByText: "Powered by Smoke Agency",
    primaryColour: "#123abc",
  });

  const branding = await resolveAgencyBrandingForOrg(clientOrgA);

  assert.equal(branding?.displayName, "Smoke Agency");
  assert.equal(branding?.logoUrl, "https://example.com/logo.svg");
  assert.equal(branding?.primaryColour, "#123abc");
}

async function assertComments(agencyAId: string) {
  const consultantComment = await createControlComment({
    agencyId: agencyAId,
    authorType: "consultant",
    authorUserId: consultantUserA,
    body: "Review this backup evidence.",
    controlKey: "pohoda-backup-automated-daily",
    isGapFlag: true,
    orgId: clientOrgA,
  });
  const clientComment = await createControlComment({
    agencyId: agencyAId,
    authorType: "client",
    authorUserId: clientUserA,
    body: "Backup procedure added.",
    controlKey: "pohoda-backup-automated-daily",
    orgId: clientOrgA,
  });
  const comments = await listControlCommentsForManagedClient({
    agencyId: agencyAId,
    orgId: clientOrgA,
  });
  const grouped = groupCommentsByControlKey(comments);

  assert.equal(comments.length, 2);
  assert.equal(consultantComment.isGapFlag, true);
  assert.equal(clientComment.authorType, "client");
  assert.equal(grouped["pohoda-backup-automated-daily"]?.length, 2);

  await assert.rejects(
    () =>
      db.insert(controlComments).values({
        agencyId: agencyAId,
        authorType: "invalid" as "consultant",
        authorUserId: consultantUserA,
        body: "Invalid",
        controlKey: "ctrl_invalid",
        orgId: clientOrgA,
      }),
    /Failed query|control_comments_author_type_check|violates check constraint/i,
  );
}

async function assertInvites(agencyAId: string) {
  const expired = await createAgencyClientInvite({
    agencyId: agencyAId,
    createdByUserId: consultantUserA,
    email: "expired@example.com",
    expiresAt: new Date(Date.now() - 86_400_000),
  });

  await assert.rejects(
    () =>
      consumeAgencyClientInvite({
        acceptedByUserId: clientUserA,
        orgId: clientOrgB,
        token: expired.token,
      }),
    /expired/,
  );

  const valid = await createAgencyClientInvite({
    agencyId: agencyAId,
    createdByUserId: consultantUserA,
    email: "client@example.com",
  });
  const relationshipId = await consumeAgencyClientInvite({
    acceptedByUserId: clientUserA,
    orgId: clientOrgB,
    token: valid.token,
  });
  const [invite] = await db
    .select({ status: agencyClientInvites.status })
    .from(agencyClientInvites)
    .where(eq(agencyClientInvites.id, valid.id))
    .limit(1);
  const [relationship] = await db
    .select({ id: agencyClientOrgs.id })
    .from(agencyClientOrgs)
    .where(
      and(
        eq(agencyClientOrgs.agencyId, agencyAId),
        eq(agencyClientOrgs.orgId, clientOrgB),
      ),
    )
    .limit(1);

  assert.equal(invite?.status, "accepted");
  assert.equal(relationship?.id, relationshipId);

  const consultantInvite = await createAgencyConsultantInvite({
    agencyId: agencyAId,
    createdByUserId: consultantUserA,
    email: "consultant-b@example.com",
    role: "consultant",
  });
  const membershipId = await consumeAgencyConsultantInvite({
    acceptedByUserId: consultantUserB,
    token: consultantInvite.token,
  });
  const [membership] = await db
    .select({ id: agencyConsultants.id, status: agencyConsultants.status })
    .from(agencyConsultants)
    .where(eq(agencyConsultants.id, membershipId))
    .limit(1);

  assert.equal(membership?.status, "active");
}

async function main() {
  await cleanup();
  await seedOrganisations();

  try {
    const { agencyAId, agencyBId } = await seedAgencies();

    await assertAccessIsolation(agencyAId, agencyBId);
    await assertBrandingResolver(agencyAId);
    await assertComments(agencyAId);
    await assertInvites(agencyAId);
  } finally {
    await cleanup();
  }
}

main()
  .then(() => {
    console.log("Agency model smoke passed.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
