import { getStoredConnectorCredential } from "./storage";
import type {
  ApiKeyConnectorState,
  ConnectorHealthProbe,
  ConnectorPlatform,
  HealthCheckResult,
  StoredConnectorCredential,
} from "./types";

const DEFAULT_HEALTH_TIMEOUT_MS = 10_000;

type HealthProbeRegistry = Partial<Record<ConnectorPlatform, ConnectorHealthProbe>>;

const healthProbes: HealthProbeRegistry = {};

export function registerConnectorHealthProbe(
  platform: ConnectorPlatform,
  probe: ConnectorHealthProbe,
) {
  healthProbes[platform] = probe;
}

export function mapHttpStatusToHealthCheck(status: number): HealthCheckResult {
  if (status >= 200 && status < 300) {
    return "connected";
  }

  if (status === 401) {
    return "invalid_key";
  }

  if (status === 403) {
    return "insufficient_scope";
  }

  return "unreachable";
}

async function getConnectorHealthProbe(platform: ConnectorPlatform) {
  if (healthProbes[platform]) {
    return healthProbes[platform];
  }

  if (platform === "hetzner") {
    const module = await import("@/lib/connectors/hetzner/checks");
    return module.hetznerHealthProbe;
  }

  // TODO: Return the OVHcloud probe once Phase 7 wires the three-part auth checks.
  return null;
}

export function isConnectorNetworkError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  if (error instanceof Error) {
    return [
      "AbortError",
      "ECONNRESET",
      "ENOTFOUND",
      "ETIMEDOUT",
      "EAI_AGAIN",
    ].some((token) => error.name.includes(token) || error.message.includes(token));
  }

  return false;
}

export async function runConnectorHealthProbe(
  input: {
    credentials: StoredConnectorCredential;
    platform: ConnectorPlatform;
  },
  deps: {
    probe?: ConnectorHealthProbe;
    timeoutMs?: number;
  } = {},
): Promise<HealthCheckResult> {
  const probe = deps.probe ?? await getConnectorHealthProbe(input.platform);

  if (!probe) {
    // TODO: Replace this fallback when the platform-specific connector registers
    // its probe. Phase 2 intentionally contains no Hetzner or OVHcloud API calls.
    return "unreachable";
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    deps.timeoutMs ?? DEFAULT_HEALTH_TIMEOUT_MS,
  );

  try {
    return await probe({
      credentials: input.credentials,
      platform: input.platform,
      signal: controller.signal,
    });
  } catch (error) {
    return isConnectorNetworkError(error) ? "unreachable" : "unreachable";
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkConnectorCredentialHealth(
  input: {
    credentials: StoredConnectorCredential;
    platform: ConnectorPlatform;
  },
  deps: {
    probe?: ConnectorHealthProbe;
    timeoutMs?: number;
  } = {},
): Promise<HealthCheckResult> {
  return runConnectorHealthProbe(input, deps);
}

export async function checkConnectorHealth(
  orgId: string,
  platform: ConnectorPlatform,
): Promise<HealthCheckResult> {
  const credentials = await getStoredConnectorCredential({
    clerkOrgId: orgId,
    platform,
  });

  if (!credentials) {
    return "invalid_key";
  }

  return checkConnectorCredentialHealth({
    credentials,
    platform,
  });
}

export async function getApiKeyConnectorState(
  orgId: string,
  platform: ConnectorPlatform,
): Promise<ApiKeyConnectorState> {
  const credentials = await getStoredConnectorCredential({
    clerkOrgId: orgId,
    platform,
  });

  if (!credentials) {
    return "not_connected";
  }

  return checkConnectorCredentialHealth({
    credentials,
    platform,
  });
}
