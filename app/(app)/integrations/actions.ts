"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAuditLog } from "@/lib/db/queries/audit-logs";
import { disconnectIntegrationConnection } from "@/lib/db/queries/integrations";

const providerSchema = z.enum(["microsoft365", "github", "aws"]);

function requireActiveOrganisation(session: Awaited<ReturnType<typeof auth>>) {
  if (!session.userId || !session.orgId) {
    redirect("/sign-in");
  }

  return {
    clerkOrgId: session.orgId,
    userId: session.userId,
  };
}

export async function disconnectIntegrationAction(provider: string) {
  const session = requireActiveOrganisation(await auth());
  const parsedProvider = providerSchema.parse(provider);

  const result = await disconnectIntegrationConnection({
    clerkOrgId: session.clerkOrgId,
    provider: parsedProvider,
  });

  if (result.disconnected) {
    await createAuditLog({
      action: "integration.disconnected",
      clerkOrgId: session.clerkOrgId,
      clerkUserId: session.userId,
      entityId: result.integrationId ?? parsedProvider,
      entityType: "integration",
      metadata: {
        provider: parsedProvider,
        resetControls: result.resetControls,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/integrations");
  revalidatePath("/settings/audit-log");
  revalidatePath(`/integrations/${parsedProvider}`);
}
