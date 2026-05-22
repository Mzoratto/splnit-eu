"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { connectApiKeyConnectorAction } from "@/lib/connectors/api-key-base";
import { normalizeAbraFlexiBaseUrl } from "@/lib/connectors/abra-flexi/url";
import type { HealthCheckResult } from "@/lib/connectors/api-key-base/types";

export type AbraFlexiConnectionState = {
  error: HealthCheckResult | "validation" | null;
};

const connectAbraFlexiSchema = z.object({
  baseUrl: z
    .string()
    .trim()
    .min(1)
    .max(2048)
    .refine((value) => {
      try {
        normalizeAbraFlexiBaseUrl(value);
        return true;
      } catch {
        return false;
      }
    }),
  companyName: z.string().trim().min(1).max(200),
  password: z.string().min(1).max(4096),
  username: z.string().trim().min(1).max(256),
});

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function connectAbraFlexiAction(
  _state: AbraFlexiConnectionState,
  formData: FormData,
): Promise<AbraFlexiConnectionState> {
  const parsed = connectAbraFlexiSchema.safeParse({
    baseUrl: getStringValue(formData, "baseUrl"),
    companyName: getStringValue(formData, "companyName"),
    password: getStringValue(formData, "password"),
    username: getStringValue(formData, "username"),
  });

  if (!parsed.success) {
    return { error: "validation" };
  }

  const result = await connectApiKeyConnectorAction({
    baseUrl: normalizeAbraFlexiBaseUrl(parsed.data.baseUrl),
    companyName: parsed.data.companyName,
    password: parsed.data.password,
    platform: "abra-flexi",
    username: parsed.data.username,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/workspaces/abra-flexi");
}
