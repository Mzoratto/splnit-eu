"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { disconnectIntegrationConnection } from "@/lib/db/queries/integrations";

const providerSchema = z.enum(["microsoft365", "github", "aws"]);

function requireActiveOrganisation(session: Awaited<ReturnType<typeof auth>>) {
  if (!session.userId || !session.orgId) {
    redirect("/sign-in");
  }

  return {
    clerkOrgId: session.orgId,
  };
}

export async function disconnectIntegrationAction(provider: string) {
  const session = requireActiveOrganisation(await auth());
  const parsedProvider = providerSchema.parse(provider);

  await disconnectIntegrationConnection({
    clerkOrgId: session.clerkOrgId,
    provider: parsedProvider,
  });

  revalidatePath("/dashboard");
  revalidatePath("/integrations");
  revalidatePath(`/integrations/${parsedProvider}`);
}
