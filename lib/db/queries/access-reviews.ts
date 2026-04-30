import { and, desc, eq, inArray, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  accessReviewItems,
  accessReviews,
  organisations,
  profiles,
} from "@/lib/db/schema";

export type AccessReviewSourceItem = {
  accessLevel: string;
  resource: string;
  userEmail: string | null;
  userName: string;
};

export async function listAccessReviewsForOrg(clerkOrgId: string) {
  const db = getDb();

  return db
    .select()
    .from(accessReviews)
    .where(eq(accessReviews.clerkOrgId, clerkOrgId))
    .orderBy(desc(accessReviews.createdAt))
    .limit(20);
}

export async function getAccessReviewDetail(input: {
  clerkOrgId: string;
  reviewId: string;
}) {
  const db = getDb();
  const reviewRows = await db
    .select()
    .from(accessReviews)
    .where(
      and(
        eq(accessReviews.clerkOrgId, input.clerkOrgId),
        eq(accessReviews.id, input.reviewId),
      ),
    )
    .limit(1);
  const review = reviewRows[0] ?? null;

  if (!review) {
    return null;
  }

  const items = await db
    .select()
    .from(accessReviewItems)
    .where(eq(accessReviewItems.reviewId, review.id))
    .orderBy(accessReviewItems.resource, accessReviewItems.userName)
    .limit(1000);

  return {
    items,
    review,
  };
}

export async function createAccessReview(input: {
  clerkOrgId: string;
  dueDate: string;
  items: AccessReviewSourceItem[];
  name: string;
  provider: string;
}) {
  const db = getDb();
  const [review] = await db
    .insert(accessReviews)
    .values({
      clerkOrgId: input.clerkOrgId,
      dueDate: input.dueDate,
      name: input.name,
      provider: input.provider,
      status: "in_progress",
      totalItems: input.items.length,
      reviewedItems: 0,
    })
    .returning();

  if (review && input.items.length > 0) {
    await db.insert(accessReviewItems).values(
      input.items.map((item) => ({
        accessLevel: item.accessLevel,
        clerkOrgId: input.clerkOrgId,
        resource: item.resource,
        reviewId: review.id,
        userEmail: item.userEmail,
        userName: item.userName,
      })),
    );
  }

  return review;
}

export async function updateAccessReviewItemDecision(input: {
  clerkOrgId: string;
  decidedBy: string;
  decision: "keep" | "modify" | "revoke";
  itemId: string;
  reviewId: string;
}) {
  const db = getDb();

  await db
    .update(accessReviewItems)
    .set({
      decidedAt: new Date(),
      decidedBy: input.decidedBy,
      decision: input.decision,
    })
    .where(
      and(
        eq(accessReviewItems.clerkOrgId, input.clerkOrgId),
        eq(accessReviewItems.id, input.itemId),
        eq(accessReviewItems.reviewId, input.reviewId),
      ),
    );

  return refreshAccessReviewCounts({
    clerkOrgId: input.clerkOrgId,
    reviewId: input.reviewId,
  });
}

export async function completeAccessReview(input: {
  clerkOrgId: string;
  reviewId: string;
}) {
  const stats = await refreshAccessReviewCounts(input);
  const db = getDb();

  await db
    .update(accessReviews)
    .set({
      completedAt: new Date(),
      reviewedItems: stats.reviewedItems,
      status: "completed",
    })
    .where(
      and(
        eq(accessReviews.clerkOrgId, input.clerkOrgId),
        eq(accessReviews.id, input.reviewId),
      ),
    );
}

export async function listAccessReviewReminderAlerts() {
  const db = getDb();
  const rows = await db
    .select({
      clerkOrgId: organisations.clerkOrgId,
      email: profiles.email,
      organisationName: organisations.name,
      role: profiles.role,
    })
    .from(organisations)
    .leftJoin(profiles, eq(profiles.clerkOrgId, organisations.clerkOrgId))
    .where(
      or(
        inArray(profiles.role, ["admin", "owner", "org:admin"]),
        eq(profiles.role, "member"),
      ),
    );
  const grouped = new Map<
    string,
    {
      emails: { email: string; role: string }[];
      organisationName: string;
    }
  >();

  for (const row of rows) {
    const existing =
      grouped.get(row.clerkOrgId) ??
      {
        emails: [],
        organisationName: row.organisationName,
      };

    if (row.email) {
      existing.emails.push({
        email: row.email,
        role: row.role ?? "",
      });
    }

    grouped.set(row.clerkOrgId, existing);
  }

  return Array.from(grouped.entries()).map(([clerkOrgId, item]) => {
    const ownerEmails = item.emails.filter(
      (email) =>
        email.role.includes("admin") ||
        email.role.includes("owner") ||
        email.role.includes("org:admin"),
    );
    const recipients = ownerEmails.length > 0 ? ownerEmails : item.emails;

    return {
      clerkOrgId,
      organisationName: item.organisationName,
      recipients: Array.from(new Set(recipients.map((recipient) => recipient.email))),
    };
  });
}

async function refreshAccessReviewCounts(input: {
  clerkOrgId: string;
  reviewId: string;
}) {
  const db = getDb();
  const items = await db
    .select({ decision: accessReviewItems.decision })
    .from(accessReviewItems)
    .where(
      and(
        eq(accessReviewItems.clerkOrgId, input.clerkOrgId),
        eq(accessReviewItems.reviewId, input.reviewId),
      ),
    );
  const reviewedItems = items.filter((item) => Boolean(item.decision)).length;
  const totalItems = items.length;

  await db
    .update(accessReviews)
    .set({
      reviewedItems,
      status: totalItems > 0 && reviewedItems === totalItems ? "ready" : "in_progress",
      totalItems,
    })
    .where(
      and(
        eq(accessReviews.clerkOrgId, input.clerkOrgId),
        eq(accessReviews.id, input.reviewId),
      ),
    );

  return {
    reviewedItems,
    totalItems,
  };
}
