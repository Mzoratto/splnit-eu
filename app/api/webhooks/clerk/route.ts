import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import {
  deleteOrganisationFromClerk,
  deleteProfileFromClerk,
  deleteProfileFromOrg,
  upsertOrganisationFromClerk,
  upsertProfileFromClerk,
} from "@/lib/clerk/sync";

export const dynamic = "force-dynamic";

function getWebhookSecret() {
  return (
    process.env.CLERK_WEBHOOK_SECRET ??
    process.env.CLERK_WEBHOOK_SIGNING_SECRET
  );
}

function getPlan(publicMetadata: unknown) {
  if (
    publicMetadata &&
    typeof publicMetadata === "object" &&
    "plan" in publicMetadata &&
    typeof publicMetadata.plan === "string"
  ) {
    return publicMetadata.plan;
  }

  return null;
}

function getFullName(input: {
  first_name?: string | null;
  last_name?: string | null;
}) {
  return [input.first_name, input.last_name].filter(Boolean).join(" ") || null;
}

export async function POST(request: NextRequest) {
  const webhookSecret = getWebhookSecret();

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Clerk webhook signing secret is not configured." },
      { status: 500 },
    );
  }

  let event;

  try {
    event = await verifyWebhook(request, {
      signingSecret: webhookSecret,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid Clerk webhook signature." },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "organization.created":
    case "organization.updated":
      await upsertOrganisationFromClerk({
        clerkOrgId: event.data.id,
        name: event.data.name,
        plan: getPlan(event.data.public_metadata),
      });
      break;

    case "organization.deleted":
      if (event.data.id) {
        await deleteOrganisationFromClerk(event.data.id);
      }
      break;

    case "organizationMembership.created":
    case "organizationMembership.updated":
      await upsertOrganisationFromClerk({
        clerkOrgId: event.data.organization.id,
        name: event.data.organization.name,
        plan: getPlan(event.data.organization.public_metadata),
      });

      await upsertProfileFromClerk({
        clerkUserId: event.data.public_user_data.user_id,
        clerkOrgId: event.data.organization.id,
        fullName: getFullName(event.data.public_user_data),
        email: event.data.public_user_data.identifier,
        role: event.data.role,
      });
      break;

    case "organizationMembership.deleted":
      // Uses org-scoped deletion to avoid removing the user's
      // profiles in other organisations they still belong to.
      await deleteProfileFromOrg(
        event.data.public_user_data.user_id,
        event.data.organization.id,
      );
      break;

    case "user.deleted":
      if (event.data.id) {
        await deleteProfileFromClerk(event.data.id);
      }
      break;
  }

  return NextResponse.json({
    ok: true,
    type: event.type,
  });
}
