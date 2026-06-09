import {
  mapHttpStatusToHealthCheck,
  registerConnectorHealthProbe,
} from "@/lib/connectors/api-key-base/health";
import type {
  ConnectorHealthProbe,
  HealthCheckResult,
  StoredConnectorCredential,
} from "@/lib/connectors/api-key-base/types";
import {
  createOvhcloudClient,
  type OvhcloudClientDeps,
  type OVHcloudKeys,
} from "@/lib/integrations/ovhcloud/client";
import type { OVHcloudCheckResult } from "@/lib/workspaces/ovhcloud-checks";

export type { OVHcloudKeys } from "@/lib/integrations/ovhcloud/client";

type CheckDeps = OvhcloudClientDeps;

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
    const response = await createOvhcloudClient(keys, {
      fetch: deps.fetch,
      signal: input.signal ?? deps.signal,
    }).get(path);

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
    const response = await createOvhcloudClient(keys, deps).get(
      `/dedicated/server/${encodeURIComponent(serviceName)}`,
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
    const response = await createOvhcloudClient(keys, deps).get(
      `/dedicated/server/${encodeURIComponent(serviceName)}/firewall`,
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
    const response = await createOvhcloudClient(keys, deps).get(
      `/dedicated/server/${encodeURIComponent(serviceName)}/backupStorage`,
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
