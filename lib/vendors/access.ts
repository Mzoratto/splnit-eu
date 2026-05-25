import { createHmac, timingSafeEqual } from "node:crypto";

export function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;

  if (!key && process.env.NODE_ENV !== "test") {
    throw new Error(
      "ENCRYPTION_KEY must be set in production and " +
        "staging. Refusing to use insecure fallback secret.",
    );
  }

  if (!key) {
    console.warn("ENCRYPTION_KEY missing; using test-only vendor token secret.");
  }

  return key ?? "test-secret-do-not-use";
}

function signAssessment(input: {
  assessmentId: string;
  clerkOrgId: string;
  vendorId: string;
}) {
  return createHmac("sha256", getEncryptionKey())
    .update(input.assessmentId)
    .update(":")
    .update(input.clerkOrgId)
    .update(":")
    .update(input.vendorId)
    .digest("base64url");
}

export function createVendorAssessmentToken(input: {
  assessmentId: string;
  clerkOrgId: string;
  vendorId: string;
}) {
  return `${input.assessmentId}.${signAssessment(input)}`;
}

export function verifyVendorAssessmentToken(
  token: string,
  input: {
    assessmentId: string;
    clerkOrgId: string;
    vendorId: string;
  },
) {
  const [assessmentId, signature] = token.split(".");

  if (!assessmentId || !signature || assessmentId !== input.assessmentId) {
    return false;
  }

  const expected = signAssessment(input);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    signatureBuffer.length === expectedBuffer.length &&
    timingSafeEqual(signatureBuffer, expectedBuffer)
  );
}
