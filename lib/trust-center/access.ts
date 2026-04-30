import { createHmac, timingSafeEqual } from "node:crypto";

function getSigningSecret() {
  return process.env.ENCRYPTION_KEY ?? "splnit-local-trust-center-secret";
}

function signAccess(input: {
  clerkOrgId: string;
  expiresAt: Date;
  requestId: string;
}) {
  return createHmac("sha256", getSigningSecret())
    .update(input.requestId)
    .update(":")
    .update(input.clerkOrgId)
    .update(":")
    .update(input.expiresAt.toISOString())
    .digest("base64url");
}

export function createTrustCenterAccessToken(input: {
  clerkOrgId: string;
  expiresAt: Date;
  requestId: string;
}) {
  return `${input.requestId}.${signAccess(input)}`;
}

export function verifyTrustCenterAccessToken(
  token: string | null | undefined,
  input: {
    clerkOrgId: string;
    expiresAt: Date | null;
    requestId: string;
    status: string;
  },
) {
  if (!token || !input.expiresAt || input.status !== "approved") {
    return false;
  }

  if (input.expiresAt.getTime() <= Date.now()) {
    return false;
  }

  const [requestId, signature] = token.split(".");
  if (!requestId || !signature || requestId !== input.requestId) {
    return false;
  }

  const expected = signAccess({
    clerkOrgId: input.clerkOrgId,
    expiresAt: input.expiresAt,
    requestId: input.requestId,
  });
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    signatureBuffer.length === expectedBuffer.length &&
    timingSafeEqual(signatureBuffer, expectedBuffer)
  );
}
