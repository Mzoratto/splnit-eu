"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAuditLog } from "@/lib/db/queries/audit-logs";
import { upsertOrganisationProfile } from "@/lib/db/queries/organisations";

const sectors = [
  "technology",
  "finance",
  "healthcare",
  "manufacturing",
  "public-sector",
  "professional-services",
] as const;

const employeeCounts = ["1-9", "10-49", "50-249", "250+"] as const;

const organisationSettingsSchema = z.object({
  employeeCount: z.enum(employeeCounts),
  ico: z.string().trim().max(32).optional(),
  name: z.string().trim().min(2).max(120),
  sector: z.enum(sectors),
});

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function requireActiveOrganisation(session: Awaited<ReturnType<typeof auth>>) {
  if (!session.userId || !session.orgId) {
    redirect("/sign-in");
  }

  return {
    clerkOrgId: session.orgId,
    userId: session.userId,
  };
}

export async function updateOrganisationSettingsAction(formData: FormData) {
  const session = requireActiveOrganisation(await auth());
  const parsed = organisationSettingsSchema.parse({
    employeeCount: getStringValue(formData, "employeeCount"),
    ico: getStringValue(formData, "ico"),
    name: getStringValue(formData, "name"),
    sector: getStringValue(formData, "sector"),
  });

  await upsertOrganisationProfile({
    clerkOrgId: session.clerkOrgId,
    employeeCount: parsed.employeeCount,
    ico: parsed.ico || null,
    name: parsed.name,
    sector: parsed.sector,
  });
  await createAuditLog({
    action: "organisation.updated",
    clerkOrgId: session.clerkOrgId,
    clerkUserId: session.userId,
    entityId: session.clerkOrgId,
    entityType: "organisation",
    metadata: {
      employeeCount: parsed.employeeCount,
      ico: parsed.ico || null,
      name: parsed.name,
      sector: parsed.sector,
    },
  });

  revalidatePath("/settings/organisation");
  revalidatePath("/settings/audit-log");
}
