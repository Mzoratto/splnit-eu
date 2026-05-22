import { eq, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  organisations,
  subscriptions,
  type SubscriptionPlan,
  type SubscriptionStatus,
} from "@/lib/db/schema";
import {
  hasPlanAccess,
  planGateBypassIsEnabled,
  type BillablePlanKey,
} from "@/lib/stripe/plans";

export type Subscription = typeof subscriptions.$inferSelect;

const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ["active", "trialing"];

export function isActiveSubscriptionStatus(status: string | null | undefined) {
  return ACTIVE_SUBSCRIPTION_STATUSES.includes(status as SubscriptionStatus);
}

export async function getSubscriptionForOrg(
  clerkOrgId: string,
): Promise<Subscription | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.clerkOrgId, clerkOrgId))
    .limit(1);

  return rows[0] ?? null;
}

export async function getSubscriptionByStripeCustomerId(
  stripeCustomerId: string,
): Promise<Subscription | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
    .limit(1);

  return rows[0] ?? null;
}

export async function getSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string,
): Promise<Subscription | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);

  return rows[0] ?? null;
}

export async function orgHasPlan(
  clerkOrgId: string,
  plan: BillablePlanKey,
): Promise<boolean> {
  if (planGateBypassIsEnabled()) {
    return true;
  }

  const subscription = await getSubscriptionForOrg(clerkOrgId);

  return Boolean(
    subscription &&
      isActiveSubscriptionStatus(subscription.status) &&
      hasPlanAccess(subscription.plan, plan),
  );
}

export async function orgIsSubscribed(clerkOrgId: string): Promise<boolean> {
  if (planGateBypassIsEnabled()) {
    return true;
  }

  const subscription = await getSubscriptionForOrg(clerkOrgId);

  return Boolean(subscription && isActiveSubscriptionStatus(subscription.status));
}

export type SubscriptionRequirementResult =
  | {
      grandfathered?: boolean;
      plan: SubscriptionPlan;
      subscribed: true;
    }
  | { subscribed: false };

function getBillingEnforcementDate() {
  const raw = process.env.BILLING_ENFORCEMENT_DATE?.trim();

  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function billingGracePeriodIsActive(now = new Date()) {
  const enforcementDate = getBillingEnforcementDate();

  if (!enforcementDate) {
    return true;
  }

  return now.getTime() < enforcementDate.getTime();
}

export async function requireActiveSubscription(
  clerkOrgId: string,
): Promise<SubscriptionRequirementResult> {
  if (planGateBypassIsEnabled()) {
    return {
      grandfathered: true,
      plan: "agency",
      subscribed: true,
    };
  }

  const subscription = await getSubscriptionForOrg(clerkOrgId);

  if (subscription && isActiveSubscriptionStatus(subscription.status)) {
    return {
      plan: subscription.plan,
      subscribed: true,
    };
  }

  if (billingGracePeriodIsActive()) {
    return {
      grandfathered: true,
      plan: "sme",
      subscribed: true,
    };
  }

  return { subscribed: false };
}

export async function upsertSubscription(input: {
  clerkOrgId: string;
  currentPeriodEnd?: Date | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId: string;
  stripeSubscriptionId?: string | null;
}) {
  const db = getDb();
  const values = {
    clerkOrgId: input.clerkOrgId,
    currentPeriodEnd: input.currentPeriodEnd ?? null,
    plan: input.plan,
    status: input.status,
    stripeCustomerId: input.stripeCustomerId,
    stripeSubscriptionId: input.stripeSubscriptionId ?? null,
    updatedAt: new Date(),
  };

  const [row] = await db
    .insert(subscriptions)
    .values(values)
    .onConflictDoUpdate({
      target: subscriptions.clerkOrgId,
      set: values,
    })
    .returning({ id: subscriptions.id });

  if (!row) {
    throw new Error("Failed to upsert subscription.");
  }

  return row.id;
}

export async function updateSubscriptionStatus(input: {
  status: SubscriptionStatus;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}) {
  if (!input.stripeCustomerId && !input.stripeSubscriptionId) {
    return;
  }

  const db = getDb();
  const filters = [
    input.stripeCustomerId
      ? eq(subscriptions.stripeCustomerId, input.stripeCustomerId)
      : null,
    input.stripeSubscriptionId
      ? eq(subscriptions.stripeSubscriptionId, input.stripeSubscriptionId)
      : null,
  ].filter((filter): filter is NonNullable<typeof filter> => Boolean(filter));

  await db
    .update(subscriptions)
    .set({
      status: input.status,
      updatedAt: new Date(),
    })
    .where(filters.length === 1 ? filters[0] : or(...filters));
}

export async function syncLegacyOrganisationBilling(input: {
  clerkOrgId: string;
  plan: SubscriptionPlan | "free";
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}) {
  const db = getDb();
  const fields: Partial<typeof organisations.$inferInsert> = {
    plan: input.plan,
    updatedAt: new Date(),
  };

  if (input.stripeCustomerId !== undefined) {
    fields.stripeCustomerId = input.stripeCustomerId;
  }

  if (input.stripeSubscriptionId !== undefined) {
    fields.stripeSubscriptionId = input.stripeSubscriptionId;
  }

  await db
    .update(organisations)
    .set(fields)
    .where(eq(organisations.clerkOrgId, input.clerkOrgId));
}

export async function findOrgIdForStripeCustomer(stripeCustomerId: string) {
  const db = getDb();
  const subscriptionRows = await db
    .select({ clerkOrgId: subscriptions.clerkOrgId })
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
    .limit(1);

  if (subscriptionRows[0]?.clerkOrgId) {
    return subscriptionRows[0].clerkOrgId;
  }

  const organisationRows = await db
    .select({ clerkOrgId: organisations.clerkOrgId })
    .from(organisations)
    .where(eq(organisations.stripeCustomerId, stripeCustomerId))
    .limit(1);

  return organisationRows[0]?.clerkOrgId ?? null;
}
