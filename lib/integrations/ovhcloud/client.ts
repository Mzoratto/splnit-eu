import { createHash } from "node:crypto";
import { decryptSecret } from "@/lib/crypto";
import type { Integration } from "@/lib/db/schema";

const OVHCLOUD_API_BASE_URL = "https://api.ovh.com/1.0";
const DEFAULT_TIMEOUT_MS = 10_000;

export interface OVHcloudKeys {
  appKey: string;
  appSecret: string;
  consumerKey: string;
}

export type OvhcloudClientDeps = {
  fetch?: typeof fetch;
  now?: () => number;
  signal?: AbortSignal;
};

export type OvhcloudClient = {
  get(path: string, deps?: OvhcloudClientDeps): Promise<Response>;
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function withTimeout(signal?: AbortSignal) {
  if (signal) {
    return {
      cleanup: () => {},
      signal,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  return {
    cleanup: () => clearTimeout(timeout),
    signal: controller.signal,
  };
}

function createSignature(input: {
  body: string;
  keys: OVHcloudKeys;
  method: string;
  timestamp: string;
  url: string;
}) {
  const payload = [
    input.keys.appSecret,
    input.keys.consumerKey,
    input.method,
    input.url,
    input.body,
    input.timestamp,
  ].join("+");

  return `$1$${createHash("sha1").update(payload).digest("hex")}`;
}

export function getOvhcloudKeys(integration: Integration): OVHcloudKeys {
  const config = asRecord(integration.config);
  const consumerKeyEnc = config.consumerKeyEnc;

  if (
    !integration.accessTokenEnc ||
    !integration.refreshTokenEnc ||
    typeof consumerKeyEnc !== "string"
  ) {
    throw new Error("OVHcloud API credentials are missing.");
  }

  return {
    appKey: decryptSecret(integration.accessTokenEnc, integration.clerkOrgId),
    appSecret: decryptSecret(integration.refreshTokenEnc, integration.clerkOrgId),
    consumerKey: decryptSecret(consumerKeyEnc, integration.clerkOrgId),
  };
}

export function createOvhcloudClient(
  keys: OVHcloudKeys,
  defaultDeps: OvhcloudClientDeps = {},
): OvhcloudClient {
  return {
    async get(path, deps = {}) {
      const url = `${OVHCLOUD_API_BASE_URL}${path}`;
      const timestamp = String(Math.floor((deps.now?.() ?? defaultDeps.now?.() ?? Date.now()) / 1000));
      const signature = createSignature({
        body: "",
        keys,
        method: "GET",
        timestamp,
        url,
      });
      const timeout = withTimeout(deps.signal ?? defaultDeps.signal);

      try {
        return await (deps.fetch ?? defaultDeps.fetch ?? fetch)(url, {
          headers: {
            "x-ovh-application": keys.appKey,
            "x-ovh-consumer": keys.consumerKey,
            "x-ovh-signature": signature,
            "x-ovh-timestamp": timestamp,
          },
          signal: timeout.signal,
        });
      } finally {
        timeout.cleanup();
      }
    },
  };
}

export async function getOvhcloudClient(
  integration: Integration,
  deps: OvhcloudClientDeps = {},
): Promise<OvhcloudClient> {
  return createOvhcloudClient(getOvhcloudKeys(integration), deps);
}
