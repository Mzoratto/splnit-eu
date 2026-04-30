"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  linkConsultantClient,
  updateConsultantClientBranding,
} from "@/lib/db/queries/consultant-clients";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { requirePlan } from "@/lib/stripe/plans";

const accessLevels = ["view", "manage", "admin"] as const;
const linkClientSchema = z.object({
  accessLevel: z.enum(accessLevels),
  clientOrgId: z.string().trim().min(3).max(128),
  inviteEmail: z.string().trim().email().max(254).optional().or(z.literal("")),
});
const brandingSchema = z.object({
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-f]{6}$/i)
    .optional()
    .or(z.literal("")),
  logoUrl: z.string().trim().url().optional().or(z.literal("")),
});

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function requireConsultantOrganisation() {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    redirect("/sign-in");
  }

  const organisation = await getOrganisationByClerkOrgId(session.orgId);
  requirePlan(organisation?.plan, "consultant");

  return {
    clerkOrgId: session.orgId,
  };
}

export async function linkClientAction(formData: FormData) {
  const session = await requireConsultantOrganisation();
  const parsed = linkClientSchema.parse({
    accessLevel: getStringValue(formData, "accessLevel"),
    clientOrgId: getStringValue(formData, "clientOrgId"),
    inviteEmail: getStringValue(formData, "inviteEmail"),
  });

  await linkConsultantClient({
    accessLevel: parsed.accessLevel,
    clientOrgId: parsed.clientOrgId,
    consultantOrgId: session.clerkOrgId,
    inviteEmail: parsed.inviteEmail || null,
  });

  revalidatePath("/clients");
}

export async function updateClientBrandingAction(
  clientOrgId: string,
  formData: FormData,
) {
  const session = await requireConsultantOrganisation();
  const parsed = brandingSchema.parse({
    accentColor: getStringValue(formData, "accentColor"),
    logoUrl: getStringValue(formData, "logoUrl"),
  });

  await updateConsultantClientBranding({
    accentColor: parsed.accentColor || null,
    clientOrgId,
    consultantOrgId: session.clerkOrgId,
    logoUrl: parsed.logoUrl || null,
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientOrgId}`);
}
