export type DatabaseUrlSafety = "local" | "nonlocal" | "invalid";

const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function databaseUrlSafety(databaseUrl: string | null | undefined): DatabaseUrlSafety {
  const value = databaseUrl?.trim();

  if (!value) {
    return "invalid";
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
      return "invalid";
    }

    return localHosts.has(parsed.hostname) ? "local" : "nonlocal";
  } catch {
    return "invalid";
  }
}

export function isLocalDatabaseUrl(databaseUrl: string | null | undefined) {
  return databaseUrlSafety(databaseUrl) === "local";
}

export function assertLocalDatabaseUrl(databaseUrl: string | null | undefined, context = "DB smoke") {
  const value = databaseUrl?.trim();

  if (!value) {
    throw new Error(`${context} requires DATABASE_URL.`);
  }

  const safety = databaseUrlSafety(value);
  if (safety !== "local") {
    throw new Error(
      `${context} requires a local/disposable DATABASE_URL. Refusing ${safety} target.`,
    );
  }

  return value;
}

export function normalizeDatabaseUrlForPg(databaseUrl: string) {
  const parsed = new URL(databaseUrl);

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    return databaseUrl;
  }

  if (localHosts.has(parsed.hostname)) {
    return databaseUrl;
  }

  parsed.searchParams.set("sslmode", "verify-full");

  return parsed.toString();
}
