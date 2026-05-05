import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzleNeon<typeof schema>>;

let db: Database | null = null;

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl || databaseUrl === '""' || databaseUrl === "''") {
    return null;
  }

  try {
    const { protocol } = new URL(databaseUrl);
    return protocol === "postgres:" || protocol === "postgresql:"
      ? databaseUrl
      : null;
  } catch {
    return null;
  }
}

export function hasDatabaseUrl() {
  return Boolean(getDatabaseUrl());
}

export function getDb(): Database {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for database access.");
  }

  if (!db) {
    if (isLocalDatabaseUrl(databaseUrl)) {
      const localPool = new Pool({ connectionString: databaseUrl, max: 5 });
      db = drizzleNodePostgres(localPool, { schema }) as unknown as Database;
    } else {
      db = drizzleNeon(neon(databaseUrl), { schema });
    }
  }

  return db;
}

function isLocalDatabaseUrl(databaseUrl: string) {
  try {
    const { hostname } = new URL(databaseUrl);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}
