import { createHash } from "node:crypto";
import {
  mapHttpStatusToHealthCheck,
  registerConnectorHealthProbe,
} from "@/lib/connectors/api-key-base/health";
import type {
  ConnectorHealthProbe,
  HealthCheckResult,
  StoredConnectorCredential,
} from "@/lib/connectors/api-key-base/types";
import type { OVHcloudCheckResult } from "@/lib/workspaces/ovhcloud-checks";

const OVHCLOUD_API_BASE_URL = "https://api.ovh.com/1.0";
const DEFAULT_TIMEOUT_MS = 10_000;

export interface OVHcloudKeys {
  appKey: string;
  appSecret: string;
  consumerKey: string;
}

type OVHcloudFetch = typeof fetch;

type CheckDeps = {
  fetch?: OVHcloudFetch;
  now?: () => number;
  signal?: AbortSignal;
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

async function ovhcloudGet(
  keys: OVHcloudKeys,
  path: string,
  deps: CheckDeps = {},
) {
  const url = `${OVHCLOUD_API_BASE_URL}${path}`;
  const timestamp = String(Math.floor((deps.now?.() ?? Date.now()) / 1000));
  const signature = createSignature({
    body: "",
    keys,
    method: "GET",
    timestamp,
    url,
  });
  const timeout = withTimeout(deps.signal);

  try {
    return await (deps.fetch ?? fetch)(url, {
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
}

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

export async function ovhcloudHealthProbe(input: {
  credentials: StoredConnectorCredential;
  signal?: AbortSignal;
}, deps: CheckDeps = {}): Promise<HealthCheckResult> {
  if (input.credentials.platform !== "ovhcloud") {
    return "invalid_key";
  }

  try {
    const keys: OVHcloudKeys = {
      appKey: input.credentials.appKey,
      appSecret: input.credentials.appSecret,
      consumerKey: input.credentials.consumerKey,
    };
    const serviceName = input.credentials.serviceName?.trim();
    const path = serviceName
      ? `/dedicated/server/${encodeURIComponent(serviceName)}`
      : "/dedicated/server";
    const response = await ovhcloudGet(keys, path, {
      fetch: deps.fetch,
      signal: input.signal ?? deps.signal,
    });

    return mapHttpStatusToHealthCheck(response.status);
  } catch {
    return "unreachable";
  }
}

export async function checkServerStatus(
  keys: OVHcloudKeys,
  serviceName: string,
): Promise<OVHcloudCheckResult>;
export async function checkServerStatus(
  keys: OVHcloudKeys,
  serviceName: string,
  deps: CheckDeps,
): Promise<OVHcloudCheckResult>;
export async function checkServerStatus(
  keys: OVHcloudKeys,
  serviceName: string,
  deps: CheckDeps = {},
): Promise<OVHcloudCheckResult> {
  try {
    const response = await ovhcloudGet(
      keys,
      `/dedicated/server/${encodeURIComponent(serviceName)}`,
      deps,
    );

    if (!response.ok) {
      return "error";
    }

    const json = asRecord(await getJson(response));
    return json.status === "operational" ? "pass" : "gap";
  } catch {
    return "error";
  }
}

export async function checkFirewallEnabled(
  keys: OVHcloudKeys,
  serviceName: string,
): Promise<OVHcloudCheckResult>;
export async function checkFirewallEnabled(
  keys: OVHcloudKeys,
  serviceName: string,
  deps: CheckDeps,
): Promise<OVHcloudCheckResult>;
export async function checkFirewallEnabled(
  keys: OVHcloudKeys,
  serviceName: string,
  deps: CheckDeps = {},
): Promise<OVHcloudCheckResult> {
  try {
    const response = await ovhcloudGet(
      keys,
      `/dedicated/server/${encodeURIComponent(serviceName)}/firewall`,
      deps,
    );

    if (!response.ok) {
      return "error";
    }

    const json = asRecord(await getJson(response));
    return json.enabled === true ? "pass" : "gap";
  } catch {
    return "error";
  }
}

export async function checkBackupPresent(
  keys: OVHcloudKeys,
  serviceName: string,
): Promise<OVHcloudCheckResult>;
export async function checkBackupPresent(
  keys: OVHcloudKeys,
  serviceName: string,
  deps: CheckDeps,
): Promise<OVHcloudCheckResult>;
export async function checkBackupPresent(
  keys: OVHcloudKeys,
  serviceName: string,
  deps: CheckDeps = {},
): Promise<OVHcloudCheckResult> {
  try {
    const response = await ovhcloudGet(
      keys,
      `/dedicated/server/${encodeURIComponent(serviceName)}/backupStorage`,
      deps,
    );

    if (response.status === 404) {
      return "gap";
    }

    if (!response.ok) {
      return "error";
    }

    const json = await getJson(response);
    return json ? "pass" : "gap";
  } catch {
    return "error";
  }
}

const connectorProbe: ConnectorHealthProbe = ovhcloudHealthProbe;
registerConnectorHealthProbe("ovhcloud", connectorProbe);
