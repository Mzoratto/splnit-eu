import type { AbraFlexiCredentialInput } from "@/lib/connectors/api-key-base/types";

export function createAbraFlexiBasicAuthHeader(
  credentials: Pick<AbraFlexiCredentialInput, "password" | "username">,
) {
  const value = `${credentials.username}:${credentials.password}`;
  return `Basic ${Buffer.from(value, "utf8").toString("base64")}`;
}
