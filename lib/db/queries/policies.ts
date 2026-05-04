import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  controls,
  organisations,
  policies,
  policyControls,
  profiles,
} from "@/lib/db/schema";

export type PolicyArchiveFile = {
  blobUrl: string;
  createdAt: Date | null;
  policyId: string;
  title: string;
  type: string;
  version: number;
};

export async function listPoliciesForOrg(clerkOrgId: string) {
  const db = getDb();

  return db
    .select()
    .from(policies)
    .where(eq(policies.clerkOrgId, clerkOrgId))
    .orderBy(desc(policies.createdAt));
}

export async function getPolicyForOrg(input: {
  clerkOrgId: string;
  policyId: string;
}) {
  const db = getDb();
  const rows = await db
    .select()
    .from(policies)
    .where(
      and(
        eq(policies.clerkOrgId, input.clerkOrgId),
        eq(policies.id, input.policyId),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function listPolicyArchiveFiles(
  clerkOrgId: string,
): Promise<PolicyArchiveFile[]> {
  const db = getDb();
  const rows = await db
    .select({
      blobUrl: policies.blobUrl,
      createdAt: policies.createdAt,
      policyId: policies.id,
      title: policies.titleCs,
      type: policies.type,
      version: policies.version,
    })
    .from(policies)
    .where(eq(policies.clerkOrgId, clerkOrgId))
    .orderBy(desc(policies.createdAt));

  return rows.flatMap((row) =>
    row.blobUrl
      ? [
          {
            blobUrl: row.blobUrl,
            createdAt: row.createdAt,
            policyId: row.policyId,
            title: row.title,
            type: row.type,
            version: row.version,
          },
        ]
      : [],
  );
}

export async function insertGeneratedPolicy(input: {
  blobUrl: string;
  clerkOrgId: string;
  content: Record<string, unknown>;
  controlKeys: string[];
  expiresAt: string;
  title: string;
  type: string;
}) {
  const db = getDb();
  const insertedRows = await db
    .insert(policies)
    .values({
      blobUrl: input.blobUrl,
      clerkOrgId: input.clerkOrgId,
      content: input.content,
      expiresAt: input.expiresAt,
      reviewedAt: new Date().toISOString().slice(0, 10),
      status: "active",
      titleCs: input.title,
      type: input.type,
    })
    .returning({ id: policies.id });
  const policyId = insertedRows[0]?.id;

  if (!policyId || input.controlKeys.length === 0) {
    return policyId;
  }

  const controlRows = await db
    .select({ id: controls.id })
    .from(controls)
    .where(inArray(controls.key, input.controlKeys));

  if (controlRows.length > 0) {
    await db
      .insert(policyControls)
      .values(
        controlRows.map((control) => ({
          controlId: control.id,
          policyId,
        })),
      )
      .onConflictDoNothing();
  }

  return policyId;
}

export async function listPolicyReviewAlerts(targetDates: string[]) {
  if (targetDates.length === 0) {
    return [];
  }

  const db = getDb();
  const rows = await db
    .select({
      clerkOrgId: policies.clerkOrgId,
      email: profiles.email,
      expiresAt: policies.expiresAt,
      locale: organisations.locale,
      organisationName: organisations.name,
      policyId: policies.id,
      policyTitle: policies.titleCs,
      role: profiles.role,
    })
    .from(policies)
    .innerJoin(
      organisations,
      eq(policies.clerkOrgId, organisations.clerkOrgId),
    )
    .leftJoin(profiles, eq(profiles.clerkOrgId, policies.clerkOrgId))
    .where(inArray(policies.expiresAt, targetDates));
  const grouped = new Map<
    string,
    {
      emails: { email: string; role: string }[];
      expiresAt: string;
      locale: string;
      organisationName: string;
      policyId: string;
      policyTitle: string;
    }
  >();

  for (const row of rows) {
    if (!row.expiresAt) {
      continue;
    }

    const existing =
      grouped.get(row.policyId) ??
      {
        emails: [],
        expiresAt: row.expiresAt,
        locale: row.locale,
        organisationName: row.organisationName,
        policyId: row.policyId,
        policyTitle: row.policyTitle,
      };

    if (row.email) {
      existing.emails.push({
        email: row.email,
        role: row.role ?? "",
      });
    }

    grouped.set(row.policyId, existing);
  }

  return Array.from(grouped.values()).map((item) => {
    const ownerEmails = item.emails.filter(
      (email) =>
        email.role.includes("admin") ||
        email.role.includes("owner") ||
        email.role.includes("org:admin"),
    );
    const recipients = ownerEmails.length > 0 ? ownerEmails : item.emails;

    return {
      expiresAt: item.expiresAt,
      locale: item.locale,
      organisationName: item.organisationName,
      policyId: item.policyId,
      policyTitle: item.policyTitle,
      recipients: Array.from(new Set(recipients.map((recipient) => recipient.email))),
    };
  });
}
