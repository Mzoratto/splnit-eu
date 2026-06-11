import { Client } from "@microsoft/microsoft-graph-client";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import {
  getIntegrationById,
  updateMicrosoftIntegrationTokens,
} from "@/lib/db/queries/integrations";
import type { Integration } from "@/lib/db/schema";
import { acquireMicrosoftTokenRefreshLock } from "@/lib/integrations/locks";
import { refreshMicrosoftToken } from "./oauth";

const DEFAULT_REFRESH_SKEW_MS = 5 * 60 * 1000;
const REFRESH_CONTENTION_WAIT_MS = 2000;

function microsoftTokenRefreshEnabled() {
  const value = process.env.ENABLE_MICROSOFT_TOKEN_REFRESH?.trim().toLowerCase();
  return value !== "disabled" && value !== "false" && value !== "0";
}

export function isMicrosoftTokenFresh(
  tokenExpiresAt: Date | null,
  now: Date,
  refreshSkewMs: number,
) {
  return Boolean(
    tokenExpiresAt && tokenExpiresAt.getTime() > now.getTime() + refreshSkewMs,
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveAccessToken(
  integration: Integration,
  now: Date,
  refreshSkewMs: number,
) {
  if (!integration.accessTokenEnc) {
    throw new Error("Microsoft 365 integration is missing an access token.");
  }

  if (
    !microsoftTokenRefreshEnabled() ||
    isMicrosoftTokenFresh(integration.tokenExpiresAt, now, refreshSkewMs)
  ) {
    return decryptSecret(integration.accessTokenEnc, integration.clerkOrgId);
  }

  // The caller may hold a stale in-memory row (the runner loads integrations
  // once per run) and another process may refresh concurrently. Re-read the
  // row before refreshing so we never burn a rotated refresh token twice.
  const latest = await getIntegrationById({
    clerkOrgId: integration.clerkOrgId,
    integrationId: integration.id,
  });
  const current = latest?.accessTokenEnc ? latest : integration;

  if (isMicrosoftTokenFresh(current.tokenExpiresAt, now, refreshSkewMs)) {
    return decryptSecret(current.accessTokenEnc!, current.clerkOrgId);
  }

  if (!current.refreshTokenEnc) {
    throw new Error("Microsoft 365 integration is missing a refresh token.");
  }

  const lock = await acquireMicrosoftTokenRefreshLock({
    clerkOrgId: integration.clerkOrgId,
    integrationId: integration.id,
  });

  if (!lock.acquired) {
    // Another process is refreshing right now. Give it a moment, then use
    // whatever token it persisted; the old token stays valid through the
    // refresh skew window, so falling back to it is safe.
    await wait(REFRESH_CONTENTION_WAIT_MS);
    const refreshedByOther = await getIntegrationById({
      clerkOrgId: integration.clerkOrgId,
      integrationId: integration.id,
    });
    const fallback = refreshedByOther?.accessTokenEnc ? refreshedByOther : current;

    return decryptSecret(fallback.accessTokenEnc!, fallback.clerkOrgId);
  }

  try {
    const refreshed = await refreshMicrosoftToken(
      decryptSecret(current.refreshTokenEnc, current.clerkOrgId),
    );

    await updateMicrosoftIntegrationTokens({
      accessTokenEnc: encryptSecret(refreshed.access_token, integration.clerkOrgId),
      clerkOrgId: integration.clerkOrgId,
      integrationId: integration.id,
      refreshTokenEnc: refreshed.refresh_token
        ? encryptSecret(refreshed.refresh_token, integration.clerkOrgId)
        : undefined,
      tokenExpiresAt: new Date(now.getTime() + refreshed.expires_in * 1000),
    });

    return refreshed.access_token;
  } finally {
    await lock.release();
  }
}

export async function getGraphClient(
  integration: Integration,
  options: { now?: Date; refreshSkewMs?: number } = {},
) {
  const now = options.now ?? new Date();
  const refreshSkewMs = options.refreshSkewMs ?? DEFAULT_REFRESH_SKEW_MS;
  const token = await resolveAccessToken(integration, now, refreshSkewMs);

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => token,
    },
  });
}
