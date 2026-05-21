const OVHCLOUD_API_BASE_URL = "https://api.ovh.com/1.0";

export type OVHcloudAccessRule = {
  method: "GET";
  path: string;
};

export type OVHcloudCredentialRequest = {
  accessRules?: OVHcloudAccessRule[];
  appKey: string;
  redirection: string;
};

export type OVHcloudCredentialResponse = {
  consumerKey: string;
  state: "pendingValidation" | string;
  validationUrl: string;
};

export const OVHCLOUD_READ_ONLY_ACCESS_RULES: OVHcloudAccessRule[] = [
  { method: "GET", path: "/dedicated/server/*" },
  { method: "GET", path: "/dedicated/server/*/firewall" },
  { method: "GET", path: "/dedicated/server/*/backupStorage" },
];

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export async function requestOVHcloudConsumerKey(
  input: OVHcloudCredentialRequest,
  deps: { fetch?: typeof fetch } = {},
): Promise<OVHcloudCredentialResponse> {
  const response = await (deps.fetch ?? fetch)(`${OVHCLOUD_API_BASE_URL}/auth/credential`, {
    body: JSON.stringify({
      accessRules: input.accessRules ?? OVHCLOUD_READ_ONLY_ACCESS_RULES,
      redirection: input.redirection,
    }),
    headers: {
      "content-type": "application/json",
      "x-ovh-application": input.appKey,
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`OVHcloud consumer key request failed: ${response.status}`);
  }

  const body = asRecord(await response.json());
  const consumerKey = body.consumerKey;
  const validationUrl = body.validationUrl;
  const state = body.state;

  if (
    typeof consumerKey !== "string" ||
    typeof validationUrl !== "string" ||
    typeof state !== "string"
  ) {
    throw new Error("OVHcloud consumer key response has an unexpected shape.");
  }

  return {
    consumerKey,
    state,
    validationUrl,
  };
}
