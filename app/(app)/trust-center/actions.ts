"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import {
  approveTrustCenterRequest,
  createTrustCenterClient,
  declineTrustCenterRequest,
  deleteTrustCenterClient,
  getTrustCenterSettings,
  upsertTrustCenterSettings,
} from "@/lib/db/queries/trust-center";
import { FLAGS, isFeatureEnabled } from "@/lib/features/flags";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import { sendTrustCenterAccessEmail } from "@/lib/trust-center/notifications";
import { normalizeTrustCenterSlug } from "@/lib/trust-center/settings";

const frameworkSlugs = FRAMEWORK_LIBRARY.map((framework) => framework.slug);

export type ClientAccessActionState = {
  accessUrl: string | null;
  clientName: string | null;
  error: string | null;
};

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
  subdomain: z.string().transform((value, context) => {
    try {
      return normalizeTrustCenterSlug(value);
    } catch (error) {
      context.addIssue({
        code: "custom",
        message: error instanceof Error ? error.message : "Invalid Trust Center slug.",
      });
      return z.NEVER;
    }
  }),
  visibleFrameworks: z.array(z.enum(frameworkSlugs as [string, ...string[]])),
});

const clientAccessSchema = z.object({
  clientName: z.string().trim().min(1).max(200),
  visibleFrameworks: z.array(z.enum(frameworkSlugs as [string, ...string[]])),
});

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function getTrustCenterShareUrl(subdomain: string, accessToken: string) {
  return `https://splnit.eu/trust/${subdomain}?access=${accessToken}`;
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
    locale: organisation?.locale,
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

export async function createTrustCenterClientAction(
  _previousState: ClientAccessActionState,
  formData: FormData,
): Promise<ClientAccessActionState> {
  const session = await requireActiveOrganisation();

  try {
    const enabled = await isFeatureEnabled(
      session.clerkOrgId,
      FLAGS.CLIENT_TRUST_DASHBOARD,
    );

    if (!enabled) {
      return {
        accessUrl: null,
        clientName: null,
        error: "Klientské přístupy nejsou pro tuto organizaci zapnuté.",
      };
    }

    const parsed = clientAccessSchema.parse({
      clientName: getStringValue(formData, "clientName"),
      visibleFrameworks: formData
        .getAll("visibleFrameworks")
        .filter((value): value is string => typeof value === "string"),
    });
    const settings = await getTrustCenterSettings(session.clerkOrgId);
    const trustCenter = settings.trustCenter;

    if (!trustCenter?.isPublic || !trustCenter.subdomain) {
      return {
        accessUrl: null,
        clientName: null,
        error: "Nejprve zveřejněte Trust Center, aby mohly klientské odkazy fungovat.",
      };
    }

    const enrolledSlugs = new Set(settings.frameworks.map((framework) => framework.slug));
    const visibleFrameworks = parsed.visibleFrameworks.filter((slug) =>
      enrolledSlugs.has(slug),
    );
    const client = await createTrustCenterClient({
      clientName: parsed.clientName,
      trustCenterId: trustCenter.id,
      visibleFrameworks,
    });
    const accessUrl = getTrustCenterShareUrl(trustCenter.subdomain, client.accessToken);

    revalidatePath("/trust-center");
    revalidatePath(`/trust/${trustCenter.subdomain}`);

    return {
      accessUrl,
      clientName: client.clientName,
      error: null,
    };
  } catch (error) {
    return {
      accessUrl: null,
      clientName: null,
      error: error instanceof Error ? error.message : "Klientský přístup se nepodařilo vytvořit.",
    };
  }
}

export async function deleteTrustCenterClientAction(clientId: string) {
  const session = await requireActiveOrganisation();
  const enabled = await isFeatureEnabled(
    session.clerkOrgId,
    FLAGS.CLIENT_TRUST_DASHBOARD,
  );

  if (!enabled) {
    throw new Error("Client Trust Dashboard feature is not enabled for this org.");
  }

  const settings = await getTrustCenterSettings(session.clerkOrgId);
  const trustCenter = settings.trustCenter;

  if (!trustCenter) {
    throw new Error("Trust Center settings were not found.");
  }

  await deleteTrustCenterClient(clientId, trustCenter.id);

  revalidatePath("/trust-center");

  if (trustCenter.subdomain) {
    revalidatePath(`/trust/${trustCenter.subdomain}`);
  }
}
