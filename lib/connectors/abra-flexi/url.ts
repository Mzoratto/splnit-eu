import type { AbraFlexiCredentialInput } from "@/lib/connectors/api-key-base/types";

export function normalizeAbraFlexiBaseUrl(value: string) {
  const url = new URL(value.trim());

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("ABRA Flexi URL must use http or https.");
  }

  url.hash = "";
  url.search = "";

  return url.toString().replace(/\/$/, "");
}

export function buildAbraFlexiUrl(
  credentials: Pick<AbraFlexiCredentialInput, "baseUrl" | "companyName">,
  path: string,
  params?: Record<string, string | number | boolean>,
) {
  const baseUrl = normalizeAbraFlexiBaseUrl(credentials.baseUrl);
  const company = encodeURIComponent(credentials.companyName.trim());
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${baseUrl}/c/${company}${normalizedPath}`);

  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}
