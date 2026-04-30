"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  completeAccessReview,
  createAccessReview,
  updateAccessReviewItemDecision,
} from "@/lib/db/queries/access-reviews";
import {
  collectAccessReviewItems,
  type AccessReviewProvider,
} from "@/lib/access-reviews/providers";

const providerSchema = z.enum(["all", "github", "microsoft365"]);
const decisionSchema = z.enum(["keep", "modify", "revoke"]);

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function requireActiveSession() {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    redirect("/sign-in");
  }

  return {
    clerkOrgId: session.orgId,
    userId: session.userId,
  };
}

function defaultDueDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 30);
  return date.toISOString().slice(0, 10);
}

function providerLabel(provider: AccessReviewProvider) {
  if (provider === "github") {
    return "GitHub";
  }

  if (provider === "microsoft365") {
    return "Microsoft 365";
  }

  return "Microsoft 365 + GitHub";
}

export async function startAccessReviewAction(formData: FormData) {
  const session = await requireActiveSession();
  const provider = providerSchema.parse(getStringValue(formData, "provider"));
  const name =
    getStringValue(formData, "name").trim() ||
    `Quarterly access review · ${providerLabel(provider)}`;
  const dueDate = getStringValue(formData, "dueDate") || defaultDueDate();
  const items = await collectAccessReviewItems({
    clerkOrgId: session.clerkOrgId,
    provider,
  });

  if (items.length === 0) {
    throw new Error("No connected provider users were found for this review.");
  }

  const review = await createAccessReview({
    clerkOrgId: session.clerkOrgId,
    dueDate,
    items,
    name,
    provider,
  });

  if (!review) {
    throw new Error("Access review could not be created.");
  }

  revalidatePath("/team/access-reviews");
  redirect(`/team/access-reviews?reviewId=${review.id}`);
}

export async function updateAccessReviewDecisionAction(
  reviewId: string,
  itemId: string,
  formData: FormData,
) {
  const session = await requireActiveSession();
  const decision = decisionSchema.parse(getStringValue(formData, "decision"));

  await updateAccessReviewItemDecision({
    clerkOrgId: session.clerkOrgId,
    decidedBy: session.userId,
    decision,
    itemId,
    reviewId,
  });

  revalidatePath("/team/access-reviews");
}

export async function completeAccessReviewAction(reviewId: string) {
  const session = await requireActiveSession();

  await completeAccessReview({
    clerkOrgId: session.clerkOrgId,
    reviewId,
  });

  revalidatePath("/team/access-reviews");
}
