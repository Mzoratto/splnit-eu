"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  connectApiKeyConnectorAction,
  rotateApiKeyConnectorAction,
} from "@/lib/connectors/api-key-base";

const awsConnectionSchema = z.object({
  accessKeyId: z.string().trim().min(1).max(256),
  backupBucketName: z
    .string()
    .trim()
    .max(255)
    .optional()
    .transform((value) => value || null),
  mode: z.enum(["connect", "rotate"]).default("connect"),
  region: z
    .string()
    .trim()
    .regex(/^[a-z]{2}-[a-z-]+-\d$/, "Invalid AWS region."),
  secretAccessKey: z.string().trim().min(1).max(4096),
});

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function connectAwsIntegrationAction(formData: FormData) {
  const parsed = awsConnectionSchema.safeParse({
    accessKeyId: getStringValue(formData, "accessKeyId"),
    backupBucketName: getStringValue(formData, "backupBucketName"),
    mode: getStringValue(formData, "mode") || "connect",
    region: getStringValue(formData, "region"),
    secretAccessKey: getStringValue(formData, "secretAccessKey"),
  });

  if (!parsed.success) {
    redirect("/integrations/aws?error=validation");
  }

  const action = parsed.data.mode === "rotate"
    ? rotateApiKeyConnectorAction
    : connectApiKeyConnectorAction;
  const result = await action({
    accessKeyId: parsed.data.accessKeyId,
    backupBucketName: parsed.data.backupBucketName,
    platform: "aws",
    region: parsed.data.region,
    secretAccessKey: parsed.data.secretAccessKey,
  });

  if (!result.ok) {
    redirect(`/integrations/aws?error=${result.error}`);
  }

  revalidatePath("/integrations");
  revalidatePath("/integrations/aws");
  revalidatePath("/settings/audit-log");
  redirect(`/integrations/aws?status=${parsed.data.mode}`);
}
