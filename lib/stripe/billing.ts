import { clerkClient } from "@clerk/nextjs/server";
import type Stripe from "stripe";
import { upsertOrganisationFromClerk } from "@/lib/clerk/sync";
import {
  getOrganisationByClerkOrgId,
  getOrganisationByStripeCustomerId,
  updateOrganisationBilling,
} from "@/lib/db/queries/organisations";
import { getStripe } from "@/lib/stripe/client";
import {
  type BillablePlanKey,
  type BillingInterval,
  getLookupKeyForPlan,
  getPlanFromLookupKey,
  isPlanKey,
  normalizePlanKey,
  type PlanKey,
} from "@/lib/stripe/plans";

const ACTIVE_SUBSCRIPTION_STATUSES: Stripe.Subscription.Status[] = [
  "active",
  "trialing",
  "past_due",
];

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function findPriceForPlan(
  plan: BillablePlanKey,
  interval: BillingInterval,
) {
  const lookupKey = getLookupKeyForPlan(plan, interval);
  const prices = await getStripe().prices.list({
    active: true,
    limit: 1,
    lookup_keys: [lookupKey],
  });

  const price = prices.data[0];

  if (!price) {
    throw new Error(`Stripe price lookup_key ${lookupKey} was not found.`);
  }

  return price;
}

function getPrimaryEmail(user: Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>["users"]["getUser"]>>) {
  const primaryEmail = user.emailAddresses.find(
    (emailAddress) => emailAddress.id === user.primaryEmailAddressId,
  );

  return primaryEmail?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
}

export async function getOrCreateStripeCustomer(input: {
  clerkOrgId: string;
  clerkUserId: string;
}) {
  const existingOrganisation = await getOrganisationByClerkOrgId(input.clerkOrgId);

  if (existingOrganisation?.stripeCustomerId) {
    return existingOrganisation.stripeCustomerId;
  }

  const clerk = await clerkClient();
  const clerkOrganisation = await clerk.organizations.getOrganization({
    organizationId: input.clerkOrgId,
  });
  const clerkUser = await clerk.users.getUser(input.clerkUserId);
  const email = getPrimaryEmail(clerkUser);

  if (!existingOrganisation) {
    await upsertOrganisationFromClerk({
      clerkOrgId: input.clerkOrgId,
      name: clerkOrganisation.name,
      plan: normalizePlanKey(
        typeof clerkOrganisation.publicMetadata?.plan === "string"
          ? clerkOrganisation.publicMetadata.plan
          : null,
      ),
    });
  }

  const customer = await getStripe().customers.create({
    email,
    name: clerkOrganisation.name,
    metadata: {
      clerkOrgId: input.clerkOrgId,
      clerkUserId: input.clerkUserId,
    },
  });

  await updateOrganisationBilling({
    clerkOrgId: input.clerkOrgId,
    stripeCustomerId: customer.id,
  });

  return customer.id;
}

function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  if (!customer) {
    return null;
  }

  return typeof customer === "string" ? customer : customer.id;
}

function getSubscriptionPlan(subscription: Stripe.Subscription): PlanKey {
  if (!ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) {
    return "free";
  }

  const metadataPlan = subscription.metadata.plan;

  if (isPlanKey(metadataPlan)) {
    return metadataPlan;
  }

  const lookupKey = subscription.items.data[0]?.price.lookup_key;
  const lookupPlan = getPlanFromLookupKey(lookupKey);

  if (lookupPlan) {
    return lookupPlan;
  }

  throw new Error(`Could not map Stripe subscription ${subscription.id} to a plan.`);
}

export async function syncClerkPlanMetadata(input: {
  clerkOrgId: string;
  plan: PlanKey;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}) {
  if (!process.env.CLERK_SECRET_KEY) {
    return;
  }

  const clerk = await clerkClient();
  const organisation = await clerk.organizations.getOrganization({
    organizationId: input.clerkOrgId,
  });

  await clerk.organizations.updateOrganizationMetadata(input.clerkOrgId, {
    publicMetadata: {
      ...(organisation.publicMetadata ?? {}),
      plan: input.plan,
      stripeCustomerId: input.stripeCustomerId ?? null,
      stripeSubscriptionId: input.stripeSubscriptionId ?? null,
    },
  });
}

export async function syncSubscriptionToOrg(subscription: Stripe.Subscription) {
  const plan = getSubscriptionPlan(subscription);
  const stripeCustomerId = getCustomerId(subscription.customer);
  const stripeSubscriptionId = plan === "free" ? null : subscription.id;
  const metadataOrgId = subscription.metadata.clerkOrgId;
  const organisation = metadataOrgId
    ? await getOrganisationByClerkOrgId(metadataOrgId)
    : stripeCustomerId
      ? await getOrganisationByStripeCustomerId(stripeCustomerId)
      : null;
  const clerkOrgId = organisation?.clerkOrgId ?? metadataOrgId;

  if (!clerkOrgId) {
    throw new Error(`Could not map Stripe subscription ${subscription.id} to an organisation.`);
  }

  await updateOrganisationBilling({
    clerkOrgId,
    plan,
    stripeCustomerId,
    stripeSubscriptionId,
  });

  await syncClerkPlanMetadata({
    clerkOrgId,
    plan,
    stripeCustomerId,
    stripeSubscriptionId,
  });
}
