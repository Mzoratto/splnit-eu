import {
  mapHttpStatusToHealthCheck,
  registerConnectorHealthProbe,
} from "@/lib/connectors/api-key-base/health";
import type {
  AbraFlexiCredentialInput,
  ConnectorHealthProbe,
  HealthCheckResult,
  StoredConnectorCredential,
} from "@/lib/connectors/api-key-base/types";
import { createAbraFlexiBasicAuthHeader } from "./auth";
import { buildAbraFlexiUrl } from "./url";
import type {
  AbraFlexiCheckResult,
  AbraFlexiListResponse,
  AbraFlexiSettings,
  AbraFlexiUser,
} from "./types";

const DEFAULT_TIMEOUT_MS = 10_000;

type AbraFlexiFetch = typeof fetch;

type CheckDeps = {
  fetch?: AbraFlexiFetch;
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

async function abraFlexiGet(
  credentials: AbraFlexiCredentialInput,
  path: string,
  deps: CheckDeps = {},
  params?: Record<string, string | number | boolean>,
) {
  const timeout = withTimeout(deps.signal);

  try {
    return await (deps.fetch ?? fetch)(buildAbraFlexiUrl(credentials, path, params), {
      headers: {
        accept: "application/json",
        authorization: createAbraFlexiBasicAuthHeader(credentials),
      },
      signal: timeout.signal,
    });
  } finally {
    timeout.cleanup();
  }
}

async function abraFlexiBackupProbe(
  credentials: AbraFlexiCredentialInput,
  deps: CheckDeps = {},
) {
  const timeout = withTimeout(deps.signal);

  try {
    return await (deps.fetch ?? fetch)(buildAbraFlexiUrl(credentials, "/backup"), {
      headers: {
        accept: "application/x-winstrom-backup, application/octet-stream",
        authorization: createAbraFlexiBasicAuthHeader(credentials),
        range: "bytes=0-0",
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

function recordsFromWinstrom<T extends Record<string, unknown>>(
  value: unknown,
  key: string,
): T[] {
  const response = value as AbraFlexiListResponse<T>;
  const records = response.winstrom?.[key];
  return Array.isArray(records) ? records as T[] : [];
}

function isUsableCredential(
  credentials: StoredConnectorCredential,
): credentials is StoredConnectorCredential & { platform: "abra-flexi" } {
  return credentials.platform === "abra-flexi" &&
    Boolean(credentials.baseUrl.trim()) &&
    Boolean(credentials.companyName.trim()) &&
    Boolean(credentials.username.trim()) &&
    Boolean(credentials.password);
}

export async function abraFlexiHealthProbe(input: {
  credentials: StoredConnectorCredential;
  signal?: AbortSignal;
}, deps: CheckDeps = {}): Promise<HealthCheckResult> {
  if (!isUsableCredential(input.credentials)) {
    return "invalid_key";
  }

  try {
    const response = await abraFlexiGet(
      input.credentials,
      "/uzivatel.json",
      {
        fetch: deps.fetch,
        signal: input.signal ?? deps.signal,
      },
      { limit: 1 },
    );

    return mapHttpStatusToHealthCheck(response.status);
  } catch {
    return "unreachable";
  }
}

export async function checkUserListAccessible(
  credentials: AbraFlexiCredentialInput,
  deps: CheckDeps = {},
): Promise<AbraFlexiCheckResult> {
  try {
    const response = await abraFlexiGet(
      credentials,
      "/uzivatel.json",
      deps,
      { detail: "custom:kod,role,zablokovan", limit: 100 },
    );

    if (!response.ok) {
      return "error";
    }

    const users = recordsFromWinstrom<AbraFlexiUser>(await getJson(response), "uzivatel");
    const activeUsers = users.filter((user) => {
      const blocked = user.zablokovan;
      return blocked !== true && blocked !== "true";
    });

    return activeUsers.length > 0 ? "pass" : "gap";
  } catch {
    return "error";
  }
}

export function checkHttpsTransport(credentials: AbraFlexiCredentialInput): AbraFlexiCheckResult {
  try {
    return new URL(credentials.baseUrl).protocol === "https:" ? "pass" : "gap";
  } catch {
    return "error";
  }
}

export async function checkBackupApiFallback(
  credentials: AbraFlexiCredentialInput,
  deps: CheckDeps = {},
): Promise<AbraFlexiCheckResult> {
  try {
    const response = await abraFlexiBackupProbe(credentials, deps);

    if (response.status === 404) {
      return "manual_review";
    }

    if (response.status === 401 || response.status === 403) {
      return "error";
    }

    if (!response.ok && response.status !== 206) {
      return "manual_review";
    }

    return "manual_review";
  } catch {
    return "manual_review";
  }
}

export async function checkConfigurationReadable(
  credentials: AbraFlexiCredentialInput,
  deps: CheckDeps = {},
): Promise<AbraFlexiCheckResult> {
  try {
    const response = await abraFlexiGet(
      credentials,
      "/nastaveni.json",
      deps,
      { detail: "custom:nazev", limit: 1 },
    );

    if (response.status === 404) {
      return "manual_review";
    }

    if (!response.ok) {
      return "error";
    }

    const records = recordsFromWinstrom<AbraFlexiSettings>(
      await getJson(response),
      "nastaveni",
    );
    const first = asRecord(records[0]);

    return Object.keys(first).length > 0 ? "pass" : "manual_review";
  } catch {
    return "error";
  }
}

const connectorProbe: ConnectorHealthProbe = abraFlexiHealthProbe;
registerConnectorHealthProbe("abra-flexi", connectorProbe);
