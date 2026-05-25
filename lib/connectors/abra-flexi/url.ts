import dns from "node:dns";
import ipaddr from "ipaddr.js";
import type { AbraFlexiCredentialInput } from "@/lib/connectors/api-key-base/types";

const BLOCKED_IP_RANGES = new Set([
  "loopback",
  "private",
  "linkLocal",
  "uniqueLocal",
]);

export function normalizeAbraFlexiBaseUrl(value: string) {
  const url = new URL(value.trim());

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("ABRA Flexi URL must use http or https.");
  }

  url.hash = "";
  url.search = "";

  return url.toString().replace(/\/$/, "");
}

export async function validateAbraBaseUrl(url: string): Promise<void> {
  const parsed = new URL(url.trim());

  if (parsed.protocol !== "https:") {
    throw new Error("ABRA Flexi URL must use HTTPS");
  }

  const { address } = await dns.promises.lookup(parsed.hostname);
  const addr = ipaddr.parse(address);

  if (BLOCKED_IP_RANGES.has(addr.range())) {
    throw new Error(
      "ABRA Flexi URL resolves to a private or reserved address and cannot be used",
    );
  }
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
