"use server";

import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  PENDING_AGENCY_SIGNUP_COOKIE,
  encodePendingAgencySignup,
} from "@/lib/agency/signup-cookie";
import {
  getAgencyByClerkOrgId,
  getAgencyBySlug,
} from "@/lib/db/queries/agencies";
import { createCheckoutSessionForPlan } from "@/lib/stripe/actions";

export type AgencySignupState = {
  error?: string;
};

const signupSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function startAgencySignupAction(
  _state: AgencySignupState,
  formData: FormData,
): Promise<AgencySignupState> {
  const session = await auth();

  if (!session.userId) {
    redirect("/sign-in");
  }

  if (!session.orgId) {
    redirect("/dashboard");
  }

  const parsed = signupSchema.safeParse({
    name: getStringValue(formData, "name"),
    slug: getStringValue(formData, "slug"),
  });

  if (!parsed.success) {
    return { error: "invalid" };
  }

  const existingAgency = await getAgencyByClerkOrgId(session.orgId);

  if (existingAgency) {
    redirect("/agency/settings");
  }

  const slugOwner = await getAgencyBySlug(parsed.data.slug);

  if (slugOwner && slugOwner.clerkOrgId !== session.orgId) {
    return { error: "duplicate_slug" };
  }

  const cookieStore = await cookies();
  cookieStore.set(
    PENDING_AGENCY_SIGNUP_COOKIE,
    encodePendingAgencySignup({
      clerkOrgId: session.orgId,
      name: parsed.data.name,
      slug: parsed.data.slug,
    }),
    {
      httpOnly: true,
      maxAge: 300,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  );

  return createCheckoutSessionForPlan({
    cancelPath: "/agency/signup?canceled=true",
    metadata: {
      agencyName: parsed.data.name,
      agencySlug: parsed.data.slug,
    },
    plan: "agency",
    successPath: "/agency/signup/complete?success=true",
  });
}
