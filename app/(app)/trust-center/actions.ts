"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  approveTrustCenterRequest,
  declineTrustCenterRequest,
  getTrustCenterSettings,
  upsertTrustCenterSettings,
} from "@/lib/db/queries/trust-center";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import { sendTrustCenterAccessEmail } from "@/lib/trust-center/notifications";

const frameworkSlugs = FRAMEWORK_LIBRARY.map((framework) => framework.slug);

const settingsSchema = z.object({
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-f]{6}$/i)
    .optional()
    .or(z.literal("")),
  isPublic: z.boolean(),
  ndaRequired: z.boolean(),
  showFrameworkDrilldown: z.boolean(),
  showFrameworkPercentages: z.boolean(),
  subdomain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/),
  visibleFrameworks: z.array(z.enum(frameworkSlugs as [string, ...string[]])),
});

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function requireActiveOrganisation() {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    redirect("/sign-in");
  }

  return {
    clerkOrgId: session.orgId,
  };
}

export async function updateTrustCenterSettingsAction(formData: FormData) {
  const session = await requireActiveOrganisation();
  const parsed = settingsSchema.parse({
    accentColor: getStringValue(formData, "accentColor"),
    isPublic: formData.get("isPublic") === "on",
    ndaRequired: formData.get("ndaRequired") === "on",
    showFrameworkDrilldown: formData.get("showFrameworkDrilldown") === "on",
    showFrameworkPercentages: formData.get("showFrameworkPercentages") === "on",
    subdomain: getStringValue(formData, "subdomain"),
    visibleFrameworks: formData
      .getAll("visibleFrameworks")
      .filter((value): value is string => typeof value === "string"),
  });

  await upsertTrustCenterSettings({
    accentColor: parsed.accentColor || null,
    clerkOrgId: session.clerkOrgId,
    isPublic: parsed.isPublic,
    ndaRequired: parsed.ndaRequired,
    showFrameworkDrilldown: parsed.showFrameworkDrilldown,
    showFrameworkPercentages: parsed.showFrameworkPercentages,
    subdomain: parsed.subdomain,
    visibleFrameworks: parsed.visibleFrameworks,
  });

  revalidatePath("/trust-center");
  revalidatePath(`/trust/${parsed.subdomain}`);
}

export async function approveTrustCenterRequestAction(requestId: string) {
  const session = await requireActiveOrganisation();
  const settings = await getTrustCenterSettings(session.clerkOrgId);
  const subdomain = settings.trustCenter?.subdomain;

  if (!subdomain) {
    throw new Error("Trust Center slug is required before approving requests.");
  }

  const organisation = await getOrganisationByClerkOrgId(session.clerkOrgId);
  const result = await approveTrustCenterRequest({
    appUrl: getAppUrl(),
    clerkOrgId: session.clerkOrgId,
    requestId,
    subdomain,
  });

  await sendTrustCenterAccessEmail({
    accessUrl: result.accessUrl,
    organisationName: organisation?.name ?? "Splnit.eu Trust Center",
    requesterEmail: result.request.email,
  });

  revalidatePath("/trust-center");
}

export async function declineTrustCenterRequestAction(requestId: string) {
  const session = await requireActiveOrganisation();

  await declineTrustCenterRequest({
    clerkOrgId: session.clerkOrgId,
    requestId,
  });

  revalidatePath("/trust-center");
}
