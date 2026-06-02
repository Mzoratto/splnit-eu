import type { Event } from "@sentry/nextjs";

const REDACTED = "[Filtered]";

const sensitiveKeyPattern =
  /^(?:api[_-]?key|apiKey|access[_-]?token|accessToken|auth[_-]?token|authToken|authorization|cookie|credential|database[_-]?url|databaseUrl|dsn|id[_-]?token|idToken|jwt|key|password|private[_-]?key|privateKey|refresh[_-]?token|refreshToken|secret|secret[_-]?key|secretKey|session|session[_-]?token|sessionToken|set[_-]?cookie|setCookie|token)$/i;

const sensitiveQueryKeyPattern =
  /^(access_token|accessToken|api_key|apiKey|auth|authToken|authorization|code|credential|idToken|key|password|refresh_token|refreshToken|secret|secretKey|session|sessionToken|token)$/i;

const bearerPattern = /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi;
const tokenAssignmentPattern =
  /\b(access_token|accessToken|api_key|apiKey|authorization|authToken|database_url|databaseUrl|dsn|idToken|jwt|password|private_key|privateKey|refresh_token|refreshToken|secret|secretKey|session|sessionToken|token)=([^\s&]+)/gi;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function scrubString(value: string) {
  const withoutAuthHeaders = value.replace(bearerPattern, `$1 ${REDACTED}`);
  const withoutAssignments = withoutAuthHeaders.replace(
    tokenAssignmentPattern,
    (_match, key: string) => `${key}=${REDACTED}`,
  );

  try {
    const parsed = new URL(withoutAssignments);
    let changed = false;

    for (const key of Array.from(parsed.searchParams.keys())) {
      if (sensitiveQueryKeyPattern.test(key)) {
        parsed.searchParams.set(key, REDACTED);
        changed = true;
      }
    }

    return changed ? parsed.toString() : withoutAssignments;
  } catch {
    return withoutAssignments;
  }
}

function scrubValue(value: unknown, parentKey?: string, seen = new WeakSet<object>()): unknown {
  if (parentKey && sensitiveKeyPattern.test(parentKey)) {
    return REDACTED;
  }

  if (typeof value === "string") {
    return scrubString(value);
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return REDACTED;
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((entry) => scrubValue(entry, undefined, seen));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, scrubValue(entry, key, seen)]),
  );
}

export function scrubSentryEvent<T extends Event>(event: T): T | null {
  return scrubValue(event) as T;
}

export function scrubSentryTransaction<T extends Event>(event: T): T | null {
  return scrubSentryEvent(event);
}

export const sentryPiiPolicy = {
  sendDefaultPii: false,
  redactedValue: REDACTED,
  sensitiveKeyPattern,
};
