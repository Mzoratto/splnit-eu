"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { localeCookieName } from "@/i18n/routing";
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
const countries = ["CZ", "IT", "DE", "FR", "ES", "NL", "PL", "SK", "AT", "BE", "IE"] as const;
const jurisdictions = ["CZ", "IT", "EU"] as const;
const locales = ["cs-CZ", "en-EU", "it-IT"] as const;

const organisationSettingsSchema = z.object({
  country: z.enum(countries),
  dic: z.string().trim().regex(/^CZ[0-9]{8,10}$/, "DIČ musí být ve formátu CZ12345678."),
  employeeCount: z.enum(employeeCounts),
  ico: z.string().trim().regex(/^[0-9]{8}$/, "IČO musí mít přesně 8 číslic."),
  locale: z.enum(locales),
  name: z.string().trim().min(2).max(120),
  primaryJurisdiction: z.enum(jurisdictions),
  sector: z.enum(sectors),
  sidlo: z.string().trim().min(1).max(200),
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

async function persistLocaleCookie(locale: string) {
  const cookieStore = await cookies();

  cookieStore.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
  });
}

export async function updateOrganisationSettingsAction(formData: FormData) {
  const session = requireActiveOrganisation(await auth());
  const parsed = organisationSettingsSchema.parse({
    country: getStringValue(formData, "country"),
    dic: getStringValue(formData, "dic"),
    employeeCount: getStringValue(formData, "employeeCount"),
    ico: getStringValue(formData, "ico"),
    locale: getStringValue(formData, "locale"),
    name: getStringValue(formData, "name"),
    primaryJurisdiction: getStringValue(formData, "primaryJurisdiction"),
    sector: getStringValue(formData, "sector"),
    sidlo: getStringValue(formData, "sidlo"),
  });

  await upsertOrganisationProfile({
    clerkOrgId: session.clerkOrgId,
    country: parsed.country,
    dic: parsed.dic,
    employeeCount: parsed.employeeCount,
    ico: parsed.ico,
    locale: parsed.locale,
    name: parsed.name,
    primaryJurisdiction: parsed.primaryJurisdiction,
    sector: parsed.sector,
    sidlo: parsed.sidlo,
  });
  await createAuditLog({
    action: "organisation.updated",
    clerkOrgId: session.clerkOrgId,
    clerkUserId: session.userId,
    entityId: session.clerkOrgId,
    entityType: "organisation",
    metadata: {
      country: parsed.country,
      dic: parsed.dic,
      employeeCount: parsed.employeeCount,
      ico: parsed.ico,
      locale: parsed.locale,
      name: parsed.name,
      primaryJurisdiction: parsed.primaryJurisdiction,
      sector: parsed.sector,
      sidlo: parsed.sidlo,
    },
  });
  await persistLocaleCookie(parsed.locale);

  revalidatePath("/dashboard");
  revalidatePath("/settings/profile");
  revalidatePath("/settings/organisation");
  revalidatePath("/settings/audit-log");
}
