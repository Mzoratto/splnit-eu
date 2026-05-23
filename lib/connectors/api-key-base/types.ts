export type ConnectorPlatform = "hetzner" | "ovhcloud" | "abra-flexi" | "aws";

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

export type AbraFlexiCredentialInput = {
  baseUrl: string;
  companyName: string;
  password: string;
  username: string;
};

export type AwsCredentialInput = {
  accessKeyId: string;
  backupBucketName?: string | null;
  region: string;
  secretAccessKey: string;
};

export type ConnectorCredentialInput =
  | ({
      platform: "hetzner";
    } & HetznerCredentialInput)
  | ({
      platform: "ovhcloud";
    } & OVHcloudCredentialInput)
  | ({
      platform: "abra-flexi";
    } & AbraFlexiCredentialInput)
  | ({
      platform: "aws";
    } & AwsCredentialInput);

export type StoredConnectorCredential =
  | ({
      platform: "hetzner";
    } & HetznerCredentialInput)
  | ({
      platform: "ovhcloud";
    } & OVHcloudCredentialInput)
  | ({
      platform: "abra-flexi";
    } & AbraFlexiCredentialInput)
  | ({
      platform: "aws";
    } & AwsCredentialInput);

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
