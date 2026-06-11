"use server";

import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { deleteBlobUrlsAfterFailedSave } from "@/lib/blob/cleanup";
import { AgencyAccessError } from "@/lib/agency/errors";
import { selectAgencyInvite } from "@/lib/agency/invite-selection";
import { getAppUrl } from "@/lib/env";
import {
  getAgencyClientInviteByToken,
  consumeAgencyClientInvite,
  consumeAgencyConsultantInvite,
  createAgencyClientInvite,
  createAgencyConsultantInvite,
  createControlComment,
  getAgencyConsultantInviteByToken,
  recordAgencyConsultantMembership,
  requireAgencyConsultant,
  requireManagedClient,
  upsertAgencyBranding,
} from "@/lib/db/queries/agencies";
import { createAuditLog } from "@/lib/db/queries/audit-logs";
import { sendConsultantInvite } from "@/lib/email/send";

const MAX_LOGO_BYTES = 512 * 1024;
const LOGO_CONTENT_TYPES = new Set(["image/png", "image/svg+xml"]);

const brandingSchema = z.object({
  displayName: z.string().trim().max(160).optional().or(z.literal("")),
  logoAltText: z.string().trim().max(180).optional().or(z.literal("")),
  poweredByText: z.string().trim().max(220).optional().or(z.literal("")),
  primaryColour: z
    .string()
    .trim()
    .regex(/^#[0-9a-f]{6}$/i)
    .optional()
    .or(z.literal("")),
});

const clientInviteSchema = z.object({
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
});

const consultantInviteSchema = z.object({
  clerkUserId: z.string().trim().max(128).optional().or(z.literal("")),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  role: z.enum(["admin", "consultant"]).default("consultant"),
});

const commentSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  controlKey: z.string().trim().min(1).max(128),
  isGapFlag: z.boolean().default(false),
  orgId: z.string().trim().min(1).max(128),
});

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function sanitizeFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

async function requireAgencySession() {
  const session = await auth();

  if (!session.userId) {
    redirect("/sign-in");
  }

  let membership: Awaited<ReturnType<typeof requireAgencyConsultant>>;

  try {
    membership = await requireAgencyConsultant(session.userId);
  } catch (error) {
    if (error instanceof AgencyAccessError) {
      redirect("/agency/signup");
    }

    throw error;
  }

  return {
    agency: membership.agency,
    consultant: membership.consultant,
    userId: session.userId,
  };
}

export async function updateAgencyBrandingAction(formData: FormData) {
  const session = await requireAgencySession();
  const parsed = brandingSchema.parse({
    displayName: getStringValue(formData, "displayName"),
    logoAltText: getStringValue(formData, "logoAltText"),
    poweredByText: getStringValue(formData, "poweredByText"),
    primaryColour: getStringValue(formData, "primaryColour"),
  });
  const logo = formData.get("logo");
  let logoUrl = getStringValue(formData, "existingLogoUrl") || null;

  if (logo instanceof File && logo.size > 0) {
    if (logo.size > MAX_LOGO_BYTES) {
      throw new Error("Agency logo must be 512 KB or smaller.");
    }

    if (!LOGO_CONTENT_TYPES.has(logo.type)) {
      throw new Error("Agency logo must be a PNG or SVG file.");
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("BLOB_READ_WRITE_TOKEN is required to upload agency logos.");
    }

    const safeName = sanitizeFilename(logo.name) || "agency-logo";
    const blob = await put(
      `agency-branding/${session.agency.id}/${Date.now()}-${safeName}`,
      logo,
      {
        access: "public",
        contentType: logo.type,
      },
    );

    logoUrl = blob.url;

    await upsertAgencyBranding({
      agencyId: session.agency.id,
      displayName: parsed.displayName || null,
      logoAltText: parsed.logoAltText || null,
      logoUrl,
      poweredByText: parsed.poweredByText || null,
      primaryColour: parsed.primaryColour || null,
    }).catch((error: unknown) =>
      deleteBlobUrlsAfterFailedSave([blob.url], error),
    );
  } else {
    await upsertAgencyBranding({
      agencyId: session.agency.id,
      displayName: parsed.displayName || null,
      logoAltText: parsed.logoAltText || null,
      logoUrl,
      poweredByText: parsed.poweredByText || null,
      primaryColour: parsed.primaryColour || null,
    });
  }

  await createAuditLog({
    action: "agency.branding_updated",
    clerkOrgId: session.agency.clerkOrgId ?? session.agency.id,
    clerkUserId: session.userId,
    entityId: session.agency.id,
    entityType: "agency",
    metadata: {
      hasLogo: Boolean(logoUrl),
      primaryColour: parsed.primaryColour || null,
    },
  });

  revalidatePath("/agency/settings");
  revalidatePath("/settings/audit-log");
}

export async function createAgencyClientInviteAction(formData: FormData) {
  const session = await requireAgencySession();
  const parsed = clientInviteSchema.parse({
    email: getStringValue(formData, "email"),
  });
  const invite = await createAgencyClientInvite({
    agencyId: session.agency.id,
    createdByUserId: session.userId,
    email: parsed.email || null,
  });

  await createAuditLog({
    action: "agency.client_invite_created",
    clerkOrgId: session.agency.clerkOrgId ?? session.agency.id,
    clerkUserId: session.userId,
    entityId: invite.id,
    entityType: "agency_client_invite",
    metadata: {
      email: parsed.email || null,
      expiresAt: invite.expiresAt?.toISOString() ?? null,
    },
  });

  revalidatePath("/agency/settings");
  redirect(`/agency/settings?tab=clients&inviteToken=${encodeURIComponent(invite.token)}`);
}

export async function recordAgencyConsultantInviteAction(formData: FormData) {
  const session = await requireAgencySession();
  const parsed = consultantInviteSchema.parse({
    clerkUserId: getStringValue(formData, "clerkUserId"),
    email: getStringValue(formData, "email"),
    role: getStringValue(formData, "role") || "consultant",
  });

  if (!parsed.email && !parsed.clerkUserId) {
    throw new Error("Consultant email or Clerk user ID is required.");
  }

  const membershipId = await recordAgencyConsultantMembership({
    agencyId: session.agency.id,
    clerkUserId: parsed.clerkUserId || null,
    email: parsed.email || null,
    invitedByUserId: session.userId,
    role: parsed.role,
  });
  let emailDelivery = parsed.email ? "sent" : "skipped";

  if (parsed.email) {
    const invite = await createAgencyConsultantInvite({
      agencyId: session.agency.id,
      createdByUserId: session.userId,
      email: parsed.email,
      role: parsed.role,
    });
    const appUrl = getAppUrl();

    await sendConsultantInvite(parsed.email, {
      acceptUrl: `${appUrl}/agency-client-invites/${invite.token}`,
      agencyName: session.agency.name,
      inviterName: session.consultant.email || session.userId,
    });
    emailDelivery = "sent";
  }

  await createAuditLog({
    action: "agency.consultant_invite_recorded",
    clerkOrgId: session.agency.clerkOrgId ?? session.agency.id,
    clerkUserId: session.userId,
    entityId: membershipId,
    entityType: "agency_consultant",
    metadata: {
      clerkUserId: parsed.clerkUserId || null,
      email: parsed.email || null,
      role: parsed.role,
      emailDelivery,
    },
  });

  revalidatePath("/agency/settings");
  revalidatePath("/settings/audit-log");
}

export async function createAgencyControlCommentAction(input: {
  body: string;
  controlKey: string;
  isGapFlag?: boolean;
  orgId: string;
}) {
  const session = await requireAgencySession();
  const parsed = commentSchema.parse({
    ...input,
    isGapFlag: Boolean(input.isGapFlag),
  });

  await requireManagedClient({
    agencyId: session.agency.id,
    orgId: parsed.orgId,
  });

  await createControlComment({
    agencyId: session.agency.id,
    authorType: "consultant",
    authorUserId: session.userId,
    body: parsed.body,
    controlKey: parsed.controlKey,
    isGapFlag: parsed.isGapFlag,
    orgId: parsed.orgId,
  });

  revalidatePath(`/agency/clients/${parsed.orgId}`);
}

export async function consumeAgencyClientInviteAction(token: string) {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    redirect("/sign-in");
  }

  const [clientInvite, consultantInvite] = await Promise.all([
    getAgencyClientInviteByToken(token),
    getAgencyConsultantInviteByToken(token),
  ]);
  const inviteSelection = selectAgencyInvite(clientInvite, consultantInvite);

  if (inviteSelection.status === "ambiguous") {
    throw new Error("Agency invite token is ambiguous.");
  }

  if (inviteSelection.status === "selected" && inviteSelection.inviteType === "consultant") {
    await consumeAgencyConsultantInvite({
      acceptedByUserId: session.userId,
      token,
    });
    revalidatePath("/agency/settings");
    redirect("/agency/settings?tab=consultants");
  }

  if (inviteSelection.status !== "selected") {
    throw new Error("Agency invite token is not valid.");
  }

  await consumeAgencyClientInvite({
    acceptedByUserId: session.userId,
    orgId: session.orgId,
    token,
  });

  revalidatePath("/agency/dashboard");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
