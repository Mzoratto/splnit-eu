/**
 * Typed, lazily-evaluated environment access.
 *
 * No module-scope validation: `next build` must succeed without runtime env
 * vars, so accessors validate on first use instead of at import time.
 */

const PRODUCTION_APP_URL = "https://splnit.eu";
const DEVELOPMENT_APP_URL = "http://localhost:3000";

export function readOptionalEnv(name: string): string | null {
  const value = process.env[name]?.trim();

  return value ? value : null;
}

export function readRequiredEnv(name: string, purpose?: string): string {
  const value = readOptionalEnv(name);

  if (!value) {
    throw new Error(
      purpose ? `${name} is required ${purpose}.` : `${name} is required.`,
    );
  }

  return value;
}

/**
 * Canonical application origin without a trailing slash, for OAuth redirect
 * URIs, outbound emails, and share links. Falls back to the production URL
 * when NODE_ENV is production so a missing NEXT_PUBLIC_APP_URL can never
 * point OAuth callbacks or email links at localhost.
 */
export function getAppUrl(): string {
  // Literal property access so Next.js can inline NEXT_PUBLIC_* at build time.
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  return process.env.NODE_ENV === "production"
    ? PRODUCTION_APP_URL
    : DEVELOPMENT_APP_URL;
}
