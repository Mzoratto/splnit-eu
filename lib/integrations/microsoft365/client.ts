import { Client } from "@microsoft/microsoft-graph-client";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { updateMicrosoftIntegrationTokens } from "@/lib/db/queries/integrations";
import type { Integration } from "@/lib/db/schema";
import { refreshMicrosoftToken } from "./oauth";

const DEFAULT_REFRESH_SKEW_MS = 5 * 60 * 1000;

function microsoftTokenRefreshEnabled() {
  const value = process.env.ENABLE_MICROSOFT_TOKEN_REFRESH?.trim().toLowerCase();
  return value !== "disabled" && value !== "false" && value !== "0";
}

export async function getGraphClient(
  integration: Integration,
  options: { now?: Date; refreshSkewMs?: number } = {},
) {
  if (!integration.accessTokenEnc) {
    throw new Error("Microsoft 365 integration is missing an access token.");
  }

  let token = decryptSecret(integration.accessTokenEnc, integration.clerkOrgId);
  const now = options.now ?? new Date();
  const refreshSkewMs = options.refreshSkewMs ?? DEFAULT_REFRESH_SKEW_MS;
  const shouldRefresh = Boolean(
    microsoftTokenRefreshEnabled()
      && integration.tokenExpiresAt
      && integration.tokenExpiresAt.getTime() <= now.getTime() + refreshSkewMs,
  );

  if (shouldRefresh) {
    if (!integration.refreshTokenEnc) {
      throw new Error("Microsoft 365 integration is missing a refresh token.");
    }

    const refreshed = await refreshMicrosoftToken(
      decryptSecret(integration.refreshTokenEnc, integration.clerkOrgId),
    );
    token = refreshed.access_token;

    await updateMicrosoftIntegrationTokens({
      accessTokenEnc: encryptSecret(refreshed.access_token, integration.clerkOrgId),
      clerkOrgId: integration.clerkOrgId,
      integrationId: integration.id,
      refreshTokenEnc: refreshed.refresh_token
        ? encryptSecret(refreshed.refresh_token, integration.clerkOrgId)
        : undefined,
      tokenExpiresAt: new Date(now.getTime() + refreshed.expires_in * 1000),
    });
  }

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => token,
    },
  });
}
