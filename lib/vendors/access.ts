import { createHmac, timingSafeEqual } from "node:crypto";

function getSigningSecret() {
  return process.env.ENCRYPTION_KEY ?? "splnit-local-vendor-secret";
}

function signAssessment(input: {
  assessmentId: string;
  clerkOrgId: string;
  vendorId: string;
}) {
  return createHmac("sha256", getSigningSecret())
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
