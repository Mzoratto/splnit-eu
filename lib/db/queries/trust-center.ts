import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  frameworks,
  consultantClients,
  integrationRuns,
  organisations,
  orgFrameworks,
  profiles,
  trustCenterRequests,
  trustCenters,
} from "@/lib/db/schema";
import { createTrustCenterAccessToken, verifyTrustCenterAccessToken } from "@/lib/trust-center/access";

export type TrustCenterSettingsInput = {
  accentColor?: string | null;
  clerkOrgId: string;
  customDomain?: string | null;
  isPublic: boolean;
  ndaRequired: boolean;
  showFrameworkDrilldown: boolean;
  showFrameworkPercentages: boolean;
  subdomain: string;
  visibleFrameworks: string[];
};

export type PublicTrustCenterData = NonNullable<
  Awaited<ReturnType<typeof getPublicTrustCenter>>
>;

export async function getTrustCenterSettings(clerkOrgId: string) {
  const db = getDb();
  const [trustRows, frameworkRows, requestRows] = await Promise.all([
    db
      .select()
      .from(trustCenters)
      .where(eq(trustCenters.clerkOrgId, clerkOrgId))
      .limit(1),
    db
      .select({
        id: frameworks.id,
        nameCs: frameworks.nameCs,
        nameEn: frameworks.nameEn,
        regulator: frameworks.regulator,
        score: orgFrameworks.score,
        slug: frameworks.slug,
        status: orgFrameworks.status,
      })
      .from(orgFrameworks)
      .innerJoin(frameworks, eq(orgFrameworks.frameworkId, frameworks.id))
      .where(eq(orgFrameworks.clerkOrgId, clerkOrgId))
      .orderBy(frameworks.nameCs),
    db
      .select()
      .from(trustCenterRequests)
      .where(eq(trustCenterRequests.clerkOrgId, clerkOrgId))
      .orderBy(desc(trustCenterRequests.createdAt))
      .limit(24),
  ]);

  return {
    frameworks: frameworkRows,
    requests: requestRows,
    trustCenter: trustRows[0] ?? null,
  };
}

export async function upsertTrustCenterSettings(input: TrustCenterSettingsInput) {
  const db = getDb();
  const values = {
    accentColor: input.accentColor ?? null,
    customDomain: input.customDomain ?? null,
    isPublic: input.isPublic,
    lastUpdated: new Date(),
    ndaRequired: input.ndaRequired,
    showFrameworkDrilldown: input.showFrameworkDrilldown,
    showFrameworkPercentages: input.showFrameworkPercentages,
    subdomain: input.subdomain,
    visibleFrameworks: input.visibleFrameworks,
  };

  await db
    .insert(trustCenters)
    .values({
      ...values,
      clerkOrgId: input.clerkOrgId,
    })
    .onConflictDoUpdate({
      target: trustCenters.clerkOrgId,
      set: values,
    });
}

export async function createTrustCenterRequest(input: {
  company?: string | null;
  email: string;
  orgSlug: string;
}) {
  const db = getDb();
  const centerRows = await db
    .select({
      clerkOrgId: trustCenters.clerkOrgId,
      isPublic: trustCenters.isPublic,
      organisationName: organisations.name,
    })
    .from(trustCenters)
    .innerJoin(organisations, eq(trustCenters.clerkOrgId, organisations.clerkOrgId))
    .where(eq(trustCenters.subdomain, input.orgSlug))
    .limit(1);
  const center = centerRows[0] ?? null;

  if (!center?.isPublic) {
    throw new Error("Trust Center not found.");
  }

  const [request] = await db
    .insert(trustCenterRequests)
    .values({
      clerkOrgId: center.clerkOrgId,
      company: input.company ?? null,
      email: input.email,
      status: "pending",
    })
    .returning();

  const recipients = await getTrustCenterOwnerEmails(center.clerkOrgId);

  return {
    organisationName: center.organisationName,
    recipients,
    request,
  };
}

export async function approveTrustCenterRequest(input: {
  appUrl: string;
  clerkOrgId: string;
  requestId: string;
  subdomain: string;
}) {
  const db = getDb();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [request] = await db
    .update(trustCenterRequests)
    .set({
      expiresAt,
      ndaSigned: true,
      status: "approved",
    })
    .where(
      and(
        eq(trustCenterRequests.id, input.requestId),
        eq(trustCenterRequests.clerkOrgId, input.clerkOrgId),
      ),
    )
    .returning();

  if (!request) {
    throw new Error("Trust Center request not found.");
  }

  const token = createTrustCenterAccessToken({
    clerkOrgId: input.clerkOrgId,
    expiresAt,
    requestId: request.id,
  });

  return {
    accessUrl: `${input.appUrl}/trust/${input.subdomain}?access=${token}`,
    request,
  };
}

export async function declineTrustCenterRequest(input: {
  clerkOrgId: string;
  requestId: string;
}) {
  const db = getDb();

  await db
    .update(trustCenterRequests)
    .set({
      status: "declined",
    })
    .where(
      and(
        eq(trustCenterRequests.id, input.requestId),
        eq(trustCenterRequests.clerkOrgId, input.clerkOrgId),
      ),
    );
}

export async function getPublicTrustCenter(input: {
  accessToken?: string | null;
  orgSlug: string;
}) {
  const db = getDb();
  const centerRows = await db
    .select({
      trustCenter: trustCenters,
      organisation: organisations,
    })
    .from(trustCenters)
    .innerJoin(organisations, eq(trustCenters.clerkOrgId, organisations.clerkOrgId))
    .where(eq(trustCenters.subdomain, input.orgSlug))
    .limit(1);
  const row = centerRows[0] ?? null;

  if (!row || !row.trustCenter.isPublic) {
    return null;
  }

  const access = await getTrustCenterAccess({
    accessToken: input.accessToken,
    clerkOrgId: row.trustCenter.clerkOrgId,
  });
  const visibleSlugs = row.trustCenter.visibleFrameworks ?? [];
  const where =
    visibleSlugs.length > 0
      ? and(
          eq(orgFrameworks.clerkOrgId, row.trustCenter.clerkOrgId),
          inArray(frameworks.slug, visibleSlugs),
        )
      : eq(orgFrameworks.clerkOrgId, row.trustCenter.clerkOrgId);
  const [frameworkRows, runRows] = await Promise.all([
    db
      .select({
        framework: frameworks,
        score: orgFrameworks.score,
        status: orgFrameworks.status,
      })
      .from(orgFrameworks)
      .innerJoin(frameworks, eq(orgFrameworks.frameworkId, frameworks.id))
      .where(where)
      .orderBy(frameworks.nameCs),
    db
      .select({ ranAt: integrationRuns.ranAt })
      .from(integrationRuns)
      .where(eq(integrationRuns.clerkOrgId, row.trustCenter.clerkOrgId))
      .orderBy(desc(integrationRuns.ranAt))
      .limit(1),
  ]);
  const brandingRows = await db
    .select({
      accentColor: consultantClients.whiteLabelAccentColor,
      logoUrl: consultantClients.whiteLabelLogoUrl,
    })
    .from(consultantClients)
    .where(
      and(
        eq(consultantClients.clientOrgId, row.trustCenter.clerkOrgId),
        eq(consultantClients.status, "active"),
      ),
    )
    .limit(1);
  const branding = brandingRows[0] ?? null;

  return {
    accessGranted: !row.trustCenter.ndaRequired || access.granted,
    accessRequest: access.request,
    accentColor:
      row.trustCenter.accentColor ?? branding?.accentColor ?? "#1b7f5a",
    clerkOrgId: row.trustCenter.clerkOrgId,
    frameworks: frameworkRows,
    lastTestedAt: runRows[0]?.ranAt ?? null,
    logoUrl: row.trustCenter.logoUrl ?? branding?.logoUrl ?? null,
    ndaRequired: row.trustCenter.ndaRequired,
    organisationName: row.organisation.name,
    subdomain: row.trustCenter.subdomain,
    trustCenter: row.trustCenter,
  };
}

async function getTrustCenterAccess(input: {
  accessToken?: string | null;
  clerkOrgId: string;
}) {
  const token = input.accessToken;
  const requestId = token?.split(".")[0];

  if (!requestId) {
    return {
      granted: false,
      request: null,
    };
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(trustCenterRequests)
    .where(
      and(
        eq(trustCenterRequests.id, requestId),
        eq(trustCenterRequests.clerkOrgId, input.clerkOrgId),
      ),
    )
    .limit(1);
  const request = rows[0] ?? null;

  if (!request) {
    return {
      granted: false,
      request: null,
    };
  }

  return {
    granted: verifyTrustCenterAccessToken(token, {
      clerkOrgId: input.clerkOrgId,
      expiresAt: request.expiresAt,
      requestId: request.id,
      status: request.status,
    }),
    request,
  };
}

async function getTrustCenterOwnerEmails(clerkOrgId: string) {
  const db = getDb();

  return db
    .select({ email: profiles.email })
    .from(profiles)
    .where(
      and(
        eq(profiles.clerkOrgId, clerkOrgId),
        inArray(profiles.role, ["admin", "owner", "org:admin"]),
      ),
    );
}
