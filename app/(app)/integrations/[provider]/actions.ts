"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  connectApiKeyConnectorAction,
  rotateApiKeyConnectorAction,
} from "@/lib/connectors/api-key-base";

const hetznerConnectionSchema = z.object({
  apiKey: z.string().trim().min(1).max(4096),
  mode: z.enum(["connect", "rotate"]).default("connect"),
  platform: z.literal("hetzner"),
});

const ovhcloudConnectionSchema = z.object({
  appKey: z.string().trim().min(1).max(4096),
  appSecret: z.string().trim().min(1).max(4096),
  consumerKey: z.string().trim().min(1).max(4096),
  mode: z.enum(["connect", "rotate"]).default("connect"),
  platform: z.literal("ovhcloud"),
  serviceName: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => value || null),
});

const connectionSchema = z.discriminatedUnion("platform", [
  hetznerConnectionSchema,
  ovhcloudConnectionSchema,
]);

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function connectApiKeyIntegrationAction(formData: FormData) {
  const parsed = connectionSchema.safeParse({
    apiKey: getStringValue(formData, "apiKey"),
    appKey: getStringValue(formData, "appKey"),
    appSecret: getStringValue(formData, "appSecret"),
    consumerKey: getStringValue(formData, "consumerKey"),
    mode: getStringValue(formData, "mode") || "connect",
    platform: getStringValue(formData, "platform"),
    serviceName: getStringValue(formData, "serviceName"),
  });

  if (!parsed.success) {
    const platform = getStringValue(formData, "platform");
    redirect(
      platform === "hetzner" || platform === "ovhcloud"
        ? `/integrations/${platform}?error=validation`
        : "/integrations?error=validation",
    );
  }

  const action = parsed.data.mode === "rotate"
    ? rotateApiKeyConnectorAction
    : connectApiKeyConnectorAction;
  const result = parsed.data.platform === "hetzner"
    ? await action({
        apiKey: parsed.data.apiKey,
        platform: "hetzner",
      })
    : await action({
        appKey: parsed.data.appKey,
        appSecret: parsed.data.appSecret,
        consumerKey: parsed.data.consumerKey,
        platform: "ovhcloud",
        serviceName: parsed.data.serviceName,
      });

  if (!result.ok) {
    redirect(`/integrations/${parsed.data.platform}?error=${result.error}`);
  }

  revalidatePath("/integrations");
  revalidatePath(`/integrations/${parsed.data.platform}`);
  revalidatePath("/settings/audit-log");
  redirect(`/integrations/${parsed.data.platform}?status=${parsed.data.mode}`);
}
