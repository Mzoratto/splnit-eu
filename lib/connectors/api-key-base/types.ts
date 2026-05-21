export type ConnectorPlatform = "hetzner" | "ovhcloud";

export type HealthCheckResult =
  | "connected"
  | "invalid_key"
  | "insufficient_scope"
  | "unreachable";

export type ApiKeyConnectorState = "not_connected" | HealthCheckResult;

export type HetznerCredentialInput = {
  apiKey: string;
};

export type OVHcloudCredentialInput = {
  appKey: string;
  appSecret: string;
  consumerKey: string;
  serviceName?: string | null;
};

export type ConnectorCredentialInput =
  | ({
      platform: "hetzner";
    } & HetznerCredentialInput)
  | ({
      platform: "ovhcloud";
    } & OVHcloudCredentialInput);

export type StoredConnectorCredential =
  | ({
      platform: "hetzner";
    } & HetznerCredentialInput)
  | ({
      platform: "ovhcloud";
    } & OVHcloudCredentialInput);

export type ConnectorHealthProbe = (input: {
  credentials: StoredConnectorCredential;
  platform: ConnectorPlatform;
  signal?: AbortSignal;
}) => Promise<HealthCheckResult>;

export type ConnectorActionResult =
  | {
      ok: true;
      status: "connected";
    }
  | {
      error: Exclude<HealthCheckResult, "connected">;
      ok: false;
    };
