import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function getBaseKey() {
  const raw = process.env.ENCRYPTION_KEY;

  if (!raw) {
    throw new Error("ENCRYPTION_KEY is required for integration token encryption.");
  }

  if (/^[0-9a-f]{64}$/i.test(raw)) {
    return Buffer.from(raw, "hex");
  }

  return createHash("sha256").update(raw).digest();
}

function deriveOrgKey(clerkOrgId: string) {
  return createHash("sha256").update(getBaseKey()).update(clerkOrgId).digest();
}

export function encryptSecret(plaintext: string, clerkOrgId: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, deriveOrgKey(clerkOrgId), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [iv, tag, ciphertext].map((part) => part.toString("base64url")).join(".");
}

export function decryptSecret(encrypted: string, clerkOrgId: string) {
  const [ivRaw, tagRaw, ciphertextRaw] = encrypted.split(".");

  if (!ivRaw || !tagRaw || !ciphertextRaw) {
    throw new Error("Invalid encrypted secret format.");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    deriveOrgKey(clerkOrgId),
    Buffer.from(ivRaw, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextRaw, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
