import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_STATE_AGE_MS = 15 * 60 * 1000;

type OAuthProvider = "github" | "microsoft365";

function getStateSecret() {
  const secret = process.env.ENCRYPTION_KEY;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("ENCRYPTION_KEY is required for OAuth state signing.");
  }

  return "splnit-local-oauth-state-secret";
}

function sign(input: { clerkOrgId: string; provider: OAuthProvider; timestamp: number }) {
  return createHmac("sha256", getStateSecret())
    .update(`${input.provider}.${input.clerkOrgId}.${input.timestamp}`)
    .digest("base64url");
}

export function createOAuthState(clerkOrgId: string, provider: OAuthProvider) {
  const timestamp = Date.now();
  const signature = sign({ clerkOrgId, provider, timestamp });

  return `${provider}.${clerkOrgId}.${timestamp}.${signature}`;
}

export function verifyOAuthState(
  state: string | null | undefined,
  input: { clerkOrgId: string; provider: OAuthProvider },
) {
  const [provider, clerkOrgId, timestampValue, signature] = state?.split(".") ?? [];
  const timestamp = Number(timestampValue);

  if (
    provider !== input.provider ||
    clerkOrgId !== input.clerkOrgId ||
    !Number.isFinite(timestamp) ||
    !signature ||
    Date.now() - timestamp > MAX_STATE_AGE_MS
  ) {
    return false;
  }

  const expected = sign({ clerkOrgId, provider, timestamp });
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}
