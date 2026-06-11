import { clerkClient } from "@clerk/nextjs/server";
import type Stripe from "stripe";
import { upsertOrganisationFromClerk } from "@/lib/clerk/sync";
import {
  getAgencyByClerkOrgId,
  recordAgencyConsultantMembership,
  upsertAgencyForSubscription,
} from "@/lib/db/queries/agencies";
import {
  getOrganisationByClerkOrgId,
} from "@/lib/db/queries/organisations";
import { getStripe } from "@/lib/stripe/client";
import {
  getPlanFromPriceId,
  getPriceIdForPlan,
  isBillablePlanKey,
  normalizePlanKey,
  type BillablePlanKey,
  type PlanKey,
} from "@/lib/stripe/plans";
import {
  findOrgIdForStripeCustomer,
  getSubscriptionByStripeSubscriptionId,
  isActiveSubscriptionStatus,
  syncLegacyOrganisationBilling,
  upsertSubscription,
} from "@/lib/stripe/subscriptions";
import type { SubscriptionStatus } from "@/lib/db/schema";

export { getAppUrl } from "@/lib/env";

export function getObjectId(value: string | { id: string } | null) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

export function getPrimaryEmail(
  user: Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>["users"]["getUser"]>>,
) {
  const primaryEmail = user.emailAddresses.find(
    (emailAddress) => emailAddress.id === user.primaryEmailAddressId,
  );

  return primaryEmail?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
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
    ...(email ? { email } : {}),
    name: clerkOrganisation.name,
    metadata: {
      clerkOrgId: input.clerkOrgId,
      clerkUserId: input.clerkUserId,
    },
  });

  await syncLegacyOrganisationBilling({
    clerkOrgId: input.clerkOrgId,
    plan: normalizePlanKey(existingOrganisation?.plan),
    stripeCustomerId: customer.id,
  });

  return customer.id;
}

export function getCheckoutPriceId(plan: BillablePlanKey) {
  return getPriceIdForPlan(plan);
}

function getSubscriptionPlan(subscription: Stripe.Subscription): BillablePlanKey {
  const priceId = subscription.items.data[0]?.price.id;
  const pricePlan = getPlanFromPriceId(priceId);

  if (pricePlan) {
    return pricePlan;
  }

  const metadataPlan = subscription.metadata.plan;

  if (isBillablePlanKey(metadataPlan)) {
    return metadataPlan;
  }

  throw new Error(`Could not map Stripe subscription ${subscription.id} to a plan.`);
}

export function normalizeStripeSubscriptionStatus(
  status: Stripe.Subscription.Status | string,
): SubscriptionStatus {
  if (
    status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    status === "canceled" ||
    status === "incomplete"
  ) {
    return status;
  }

  if (status === "unpaid") {
    return "past_due";
  }

  if (status === "incomplete_expired") {
    return "canceled";
  }

  return "incomplete";
}

function getSubscriptionCurrentPeriodEnd(subscription: Stripe.Subscription) {
  const periodEnd = (subscription as { current_period_end?: number }).current_period_end;

  return typeof periodEnd === "number" ? new Date(periodEnd * 1000) : null;
}

async function resolveSubscriptionOrgId(subscription: Stripe.Subscription) {
  const metadataOrgId = subscription.metadata.clerkOrgId;

  if (metadataOrgId) {
    return metadataOrgId;
  }

  const existing = await getSubscriptionByStripeSubscriptionId(subscription.id);

  if (existing?.clerkOrgId) {
    return existing.clerkOrgId;
  }

  const stripeCustomerId = getObjectId(subscription.customer);

  return stripeCustomerId ? findOrgIdForStripeCustomer(stripeCustomerId) : null;
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
  const status = normalizeStripeSubscriptionStatus(subscription.status);
  const currentPeriodEnd = getSubscriptionCurrentPeriodEnd(subscription);
  const stripeCustomerId = getObjectId(subscription.customer);
  const clerkOrgId = await resolveSubscriptionOrgId(subscription);

  if (!stripeCustomerId) {
    throw new Error(`Stripe subscription ${subscription.id} is missing a customer.`);
  }

  if (!clerkOrgId) {
    throw new Error(`Could not map Stripe subscription ${subscription.id} to an organisation.`);
  }

  await upsertSubscription({
    clerkOrgId,
    currentPeriodEnd,
    plan,
    status,
    stripeCustomerId,
    stripeSubscriptionId: subscription.id,
  });

  const active = isActiveSubscriptionStatus(status);
  await syncLegacyOrganisationBilling({
    clerkOrgId,
    plan: active ? plan : "free",
    stripeCustomerId,
    stripeSubscriptionId: active ? subscription.id : null,
  });

  await syncClerkPlanMetadata({
    clerkOrgId,
    plan: active ? plan : "free",
    stripeCustomerId,
    stripeSubscriptionId: active ? subscription.id : null,
  });

  if (plan === "agency") {
    const organisation = await getOrganisationByClerkOrgId(clerkOrgId);
    const metadata = subscription.metadata;
    const agencyName = metadata.agencyName?.trim() || organisation?.name || "Agency";
    const agencySlug = metadata.agencySlug?.trim() || undefined;
    const agencyId = await upsertAgencyForSubscription({
      clerkOrgId,
      contactEmail: metadata.customerEmail || null,
      name: agencyName,
      planClientLimit: 20,
      slug: agencySlug,
      stripeSubscriptionId: subscription.id,
    });

    if (metadata.clerkUserId) {
      await recordAgencyConsultantMembership({
        agencyId,
        clerkUserId: metadata.clerkUserId,
        email: metadata.customerEmail || null,
        invitedByUserId: metadata.clerkUserId,
        role: "admin",
      });
    }
  }

  return {
    clerkOrgId,
    currentPeriodEnd,
    plan,
    status,
    stripeCustomerId,
    stripeSubscriptionId: subscription.id,
  };
}

export async function ensureAgencyForCompletedCheckout(input: {
  clerkOrgId: string;
  clerkUserId?: string | null;
  customerEmail?: string | null;
  name?: string | null;
  slug?: string | null;
  stripeSubscriptionId: string;
}) {
  const existingAgency = await getAgencyByClerkOrgId(input.clerkOrgId);
  const organisation = await getOrganisationByClerkOrgId(input.clerkOrgId);
  const agencyId = await upsertAgencyForSubscription({
    clerkOrgId: input.clerkOrgId,
    contactEmail: input.customerEmail ?? existingAgency?.contactEmail ?? null,
    name: input.name?.trim() || existingAgency?.name || organisation?.name || "Agency",
    slug: input.slug?.trim() || existingAgency?.slug || undefined,
    stripeSubscriptionId: input.stripeSubscriptionId,
  });

  if (input.clerkUserId) {
    await recordAgencyConsultantMembership({
      agencyId,
      clerkUserId: input.clerkUserId,
      email: input.customerEmail ?? null,
      invitedByUserId: input.clerkUserId,
      role: "admin",
    });
  }

  return agencyId;
}
