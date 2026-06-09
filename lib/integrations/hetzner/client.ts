import { decryptSecret } from "@/lib/crypto";
import type { Integration } from "@/lib/db/schema";

const HETZNER_API_BASE_URL = "https://api.hetzner.cloud/v1";
const DEFAULT_TIMEOUT_MS = 10_000;

export type HetznerClientDeps = {
  fetch?: typeof fetch;
  signal?: AbortSignal;
};

export type HetznerClient = {
  get(path: string, deps?: HetznerClientDeps): Promise<Response>;
};

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

export function getHetznerApiKey(integration: Integration) {
  if (!integration.accessTokenEnc) {
    throw new Error("Hetzner Cloud API key is missing.");
  }

  return decryptSecret(integration.accessTokenEnc, integration.clerkOrgId);
}

export function createHetznerClient(
  apiKey: string,
  defaultDeps: HetznerClientDeps = {},
): HetznerClient {
  return {
    async get(path, deps = {}) {
      const signal = deps.signal ?? defaultDeps.signal;
      const timeout = withTimeout(signal);

      try {
        return await (deps.fetch ?? defaultDeps.fetch ?? fetch)(
          `${HETZNER_API_BASE_URL}${path}`,
          {
            headers: {
              authorization: `Bearer ${apiKey}`,
            },
            signal: timeout.signal,
          },
        );
      } finally {
        timeout.cleanup();
      }
    },
  };
}

export async function getHetznerClient(
  integration: Integration,
  deps: HetznerClientDeps = {},
): Promise<HetznerClient> {
  return createHetznerClient(getHetznerApiKey(integration), deps);
}
