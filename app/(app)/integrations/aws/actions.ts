"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAuditLog } from "@/lib/db/queries/audit-logs";
import { upsertIntegrationConnection } from "@/lib/db/queries/integrations";
import { validateAwsRoleConnection } from "@/lib/integrations/aws/client";

const awsConnectionSchema = z.object({
  externalId: z
    .string()
    .trim()
    .min(2)
    .max(1224)
    .regex(/^[\w+=,.@:/-]+$/, "Invalid AWS external ID."),
  region: z
    .string()
    .trim()
    .regex(/^[a-z]{2}-[a-z]+-\d$/, "Invalid AWS region."),
  roleArn: z
    .string()
    .trim()
    .regex(
      /^arn:aws[a-z-]*:iam::\d{12}:role\/[\w+=,.@/-]{1,512}$/,
      "Invalid IAM role ARN.",
    ),
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

export async function connectAwsIntegrationAction(formData: FormData) {
  const session = requireActiveOrganisation(await auth());
  const parsed = awsConnectionSchema.parse({
    externalId: getStringValue(formData, "externalId"),
    region: getStringValue(formData, "region"),
    roleArn: getStringValue(formData, "roleArn"),
  });
  const identity = await validateAwsRoleConnection(parsed);

  const integration = await upsertIntegrationConnection({
    clerkOrgId: session.clerkOrgId,
    config: {
      accountId: identity.accountId,
      assumedArn: identity.assumedArn,
      externalId: parsed.externalId,
      region: identity.region,
      roleArn: parsed.roleArn,
    },
    provider: "aws",
  });
  await createAuditLog({
    action: "integration.connected",
    clerkOrgId: session.clerkOrgId,
    clerkUserId: session.userId,
    entityId: integration.id,
    entityType: "integration",
    metadata: {
      accountId: identity.accountId,
      provider: "aws",
      region: identity.region,
      roleArn: parsed.roleArn,
    },
  });

  revalidatePath("/integrations");
  revalidatePath("/settings/audit-log");
  revalidatePath("/integrations/aws");
}
