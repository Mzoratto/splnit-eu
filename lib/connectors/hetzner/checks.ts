import {
  mapHttpStatusToHealthCheck,
  registerConnectorHealthProbe,
} from "@/lib/connectors/api-key-base/health";
import type {
  ConnectorHealthProbe,
  HealthCheckResult,
  StoredConnectorCredential,
} from "@/lib/connectors/api-key-base/types";
import { createHetznerClient, type HetznerClientDeps } from "@/lib/integrations/hetzner/client";
import type { HetznerCheckResult } from "@/lib/workspaces/hetzner-checks";

const DEFAULT_SNAPSHOT_WINDOW_DAYS = 7;

type HetznerServer = {
  id?: number;
  status?: string;
};

type HetznerFirewall = {
  rules?: unknown[];
};

type HetznerImage = {
  created?: string;
  type?: string;
};

type CheckDeps = HetznerClientDeps;

async function getJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function createdWithinWindow(value: string | undefined, windowDays: number) {
  if (!value) {
    return false;
  }

  const createdAt = new Date(value).getTime();

  if (!Number.isFinite(createdAt)) {
    return false;
  }

  return Date.now() - createdAt <= windowDays * 24 * 60 * 60 * 1000;
}

export async function hetznerHealthProbe(input: {
  credentials: StoredConnectorCredential;
  signal?: AbortSignal;
}, deps: CheckDeps = {}): Promise<HealthCheckResult> {
  if (input.credentials.platform !== "hetzner") {
    return "invalid_key";
  }

  try {
    const response = await createHetznerClient(input.credentials.apiKey, {
      fetch: deps.fetch,
      signal: input.signal ?? deps.signal,
    }).get("/servers");

    return mapHttpStatusToHealthCheck(response.status);
  } catch {
    return "unreachable";
  }
}

export async function checkServerStatus(
  apiKey: string,
  serverId?: string,
): Promise<HetznerCheckResult>;
export async function checkServerStatus(
  apiKey: string,
  serverId: string | undefined,
  deps: CheckDeps,
): Promise<HetznerCheckResult>;
export async function checkServerStatus(
  apiKey: string,
  serverId?: string,
  deps: CheckDeps = {},
): Promise<HetznerCheckResult> {
  try {
    const path = serverId ? `/servers/${encodeURIComponent(serverId)}` : "/servers";
    const response = await createHetznerClient(apiKey, deps).get(path);

    if (!response.ok) {
      return "error";
    }

    const json = asRecord(await getJson(response));
    const servers = serverId
      ? [asRecord(json.server) as HetznerServer]
      : asArray<HetznerServer>(json.servers);

    // TODO: Allow users to mark production server IDs so demo/dev servers do not affect the result.
    return servers.some((server) => server.status === "running") ? "pass" : "gap";
  } catch {
    return "error";
  }
}

export async function checkFirewallPresent(
  apiKey: string,
): Promise<HetznerCheckResult>;
export async function checkFirewallPresent(
  apiKey: string,
  deps: CheckDeps,
): Promise<HetznerCheckResult>;
export async function checkFirewallPresent(
  apiKey: string,
  deps: CheckDeps = {},
): Promise<HetznerCheckResult> {
  try {
    const response = await createHetznerClient(apiKey, deps).get("/firewalls");

    if (!response.ok) {
      return "error";
    }

    const json = asRecord(await getJson(response));
    const firewalls = asArray<HetznerFirewall>(json.firewalls);
    const hasRules = firewalls.some((firewall) =>
      Array.isArray(firewall.rules) && firewall.rules.length > 0,
    );

    return hasRules ? "pass" : "gap";
  } catch {
    return "error";
  }
}

export async function checkSnapshotRecency(
  apiKey: string,
  windowDays?: number,
): Promise<HetznerCheckResult>;
export async function checkSnapshotRecency(
  apiKey: string,
  windowDays: number,
  deps: CheckDeps,
): Promise<HetznerCheckResult>;
export async function checkSnapshotRecency(
  apiKey: string,
  windowDays = DEFAULT_SNAPSHOT_WINDOW_DAYS,
  deps: CheckDeps = {},
): Promise<HetznerCheckResult> {
  try {
    const response = await createHetznerClient(apiKey, deps).get("/images?type=snapshot");

    if (!response.ok) {
      return "error";
    }

    const json = asRecord(await getJson(response));
    const images = asArray<HetznerImage>(json.images);
    const hasRecentSnapshot = images.some((image) =>
      createdWithinWindow(image.created, windowDays),
    );

    // TODO: Add volume-specific snapshot history once the exact authenticated
    // Hetzner endpoint is confirmed with a read-only test key.
    return hasRecentSnapshot ? "pass" : "gap";
  } catch {
    return "error";
  }
}

const connectorProbe: ConnectorHealthProbe = hetznerHealthProbe;
registerConnectorHealthProbe("hetzner", connectorProbe);
