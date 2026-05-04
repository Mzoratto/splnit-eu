"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { z } from "zod";
import { normalizeLocale } from "@/i18n/routing";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  createRiskItem,
  seedCommonRiskItems,
  updateRiskItemStatus,
} from "@/lib/db/queries/risks";
import { getCommonSmeRisks } from "@/lib/risks/common";

const riskSchema = z.object({
  category: z.string().trim().max(80).optional(),
  description: z.string().trim().max(1200).optional(),
  dueDate: z.string().optional(),
  impact: z.coerce.number().int().min(1).max(5),
  likelihood: z.coerce.number().int().min(1).max(5),
  owner: z.string().trim().max(120).optional(),
  title: z.string().trim().min(3).max(180),
});
const statusSchema = z.enum(["open", "mitigating", "accepted", "closed"]);

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
  };
}

export async function createRiskAction(formData: FormData) {
  const session = await requireActiveSession();
  const parsed = riskSchema.parse({
    category: getStringValue(formData, "category"),
    description: getStringValue(formData, "description"),
    dueDate: getStringValue(formData, "dueDate"),
    impact: getStringValue(formData, "impact"),
    likelihood: getStringValue(formData, "likelihood"),
    owner: getStringValue(formData, "owner"),
    title: getStringValue(formData, "title"),
  });

  await createRiskItem({
    category: parsed.category || null,
    clerkOrgId: session.clerkOrgId,
    description: parsed.description || null,
    dueDate: parsed.dueDate || null,
    impact: parsed.impact,
    likelihood: parsed.likelihood,
    owner: parsed.owner || null,
    title: parsed.title,
  });

  revalidatePath("/risks");
}

export async function updateRiskStatusAction(
  riskId: string,
  formData: FormData,
) {
  const session = await requireActiveSession();
  const status = statusSchema.parse(getStringValue(formData, "status"));

  await updateRiskItemStatus({
    clerkOrgId: session.clerkOrgId,
    riskId,
    status,
  });

  revalidatePath("/risks");
}

export async function seedCommonRisksAction() {
  const session = await requireActiveSession();
  const [organisation, requestLocale] = await Promise.all([
    getOrganisationByClerkOrgId(session.clerkOrgId).catch(() => null),
    getLocale(),
  ]);
  const locale =
    normalizeLocale(organisation?.locale) ??
    normalizeLocale(requestLocale) ??
    "cs-CZ";

  await seedCommonRiskItems({
    clerkOrgId: session.clerkOrgId,
    risks: getCommonSmeRisks(locale),
  });
  revalidatePath("/risks");
}
