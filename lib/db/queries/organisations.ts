import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { organisations } from "@/lib/db/schema";

export async function getOrganisationByClerkOrgId(clerkOrgId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(organisations)
    .where(eq(organisations.clerkOrgId, clerkOrgId))
    .limit(1);

  return rows[0] ?? null;
}

export async function getOrganisationByStripeCustomerId(stripeCustomerId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(organisations)
    .where(eq(organisations.stripeCustomerId, stripeCustomerId))
    .limit(1);

  return rows[0] ?? null;
}

export async function updateOrganisationBilling(input: {
  clerkOrgId: string;
  plan?: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}) {
  const db = getDb();
  const billingFields: Partial<typeof organisations.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.plan !== undefined) {
    billingFields.plan = input.plan;
  }

  if (input.stripeCustomerId !== undefined) {
    billingFields.stripeCustomerId = input.stripeCustomerId;
  }

  if (input.stripeSubscriptionId !== undefined) {
    billingFields.stripeSubscriptionId = input.stripeSubscriptionId;
  }

  await db
    .update(organisations)
    .set(billingFields)
    .where(eq(organisations.clerkOrgId, input.clerkOrgId));
}
