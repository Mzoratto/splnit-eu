import { loadEnvConfig } from "@next/env";
import { existsSync, readFileSync } from "node:fs";
import { parse } from "dotenv";

loadEnvConfig(process.cwd());

function loadLocalEnvForMissingValues() {
  const envLocalPath = ".env.local";
  if (!existsSync(envLocalPath)) {
    return;
  }

  const parsed = parse(readFileSync(envLocalPath));
  for (const [key, value] of Object.entries(parsed)) {
    if (!process.env[key]?.trim() && value.trim()) {
      process.env[key] = value;
    }
  }
}

loadLocalEnvForMissingValues();

const baseUrl = process.env.AUTH_PRIMARY_FLOW_BASE_URL?.trim() || "https://splnit.eu";
const requiredEnv = [
  "DATABASE_URL",
  "BLOB_READ_WRITE_TOKEN",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "SMOKE_USER_EMAIL",
  "SMOKE_USER_PASSWORD",
] as const;
const optionalMailboxEnv = ["RESEND_API_KEY", "RESEND_FROM", "SMOKE_RECIPIENT_EMAIL"] as const;

function envStatus(name: string) {
  const value = process.env[name]?.trim();
  return value ? "present" : "missing";
}

function databaseHostStatus() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) {
    return { databaseHostClass: null, databaseIsLocal: null };
  }

  try {
    const parsed = new URL(value);
    const databaseIsLocal = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
    return { databaseHostClass: databaseIsLocal ? "local" : "non_local", databaseIsLocal };
  } catch {
    return { databaseHostClass: "invalid_url", databaseIsLocal: null };
  }
}

function classifyClerkKey(value: string | undefined, prefixes: { live: string; test: string }) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return "missing";
  }
  if (trimmed.startsWith(prefixes.live)) {
    return "live";
  }
  if (trimmed.startsWith(prefixes.test)) {
    return "test";
  }
  return "unknown";
}

function clerkTargetStatus() {
  const hostname = new URL(baseUrl).hostname;
  const target = hostname === "splnit.eu" || hostname.endsWith(".splnit.eu") ? "live" : "non_live";
  const publishableKeyClass = classifyClerkKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, {
    live: "pk_live_",
    test: "pk_test_",
  });
  const secretKeyClass = classifyClerkKey(process.env.CLERK_SECRET_KEY, {
    live: "sk_live_",
    test: "sk_test_",
  });
  const classesMatch =
    publishableKeyClass === secretKeyClass &&
    (publishableKeyClass === "live" || publishableKeyClass === "test");
  const compatibleWithTarget = target !== "live" || publishableKeyClass === "live";

  return {
    baseUrl,
    clerkBaseUrlTarget: target,
    clerkCredentialsCompatible: classesMatch && compatibleWithTarget,
    clerkPublishableKeyClass: publishableKeyClass,
    clerkSecretKeyClass: secretKeyClass,
  };
}

const required = Object.fromEntries(requiredEnv.map((name) => [name, envStatus(name)]));
const optionalMailbox = Object.fromEntries(optionalMailboxEnv.map((name) => [name, envStatus(name)]));
const missingRequired = requiredEnv.filter((name) => required[name] !== "present");
const missingMailbox = optionalMailboxEnv.filter((name) => optionalMailbox[name] !== "present");
const database = databaseHostStatus();
const clerk = clerkTargetStatus();
const readyForTenantSmoke =
  missingRequired.length === 0 &&
  database.databaseIsLocal !== true &&
  clerk.clerkCredentialsCompatible;
const readyForMailboxSendAttempt = readyForTenantSmoke && missingMailbox.length === 0;

console.log(
  JSON.stringify(
    {
      baseUrl: clerk.baseUrl,
      clerkBaseUrlTarget: clerk.clerkBaseUrlTarget,
      clerkCredentialsCompatible: clerk.clerkCredentialsCompatible,
      clerkPublishableKeyClass: clerk.clerkPublishableKeyClass,
      clerkSecretKeyClass: clerk.clerkSecretKeyClass,
      databaseHostClass: database.databaseHostClass,
      databaseIsLocal: database.databaseIsLocal,
      missingMailbox,
      missingRequired,
      optionalMailbox,
      readyForMailboxSendAttempt,
      readyForTenantSmoke,
      required,
    },
    null,
    2,
  ),
);

if (!readyForTenantSmoke) {
  process.exitCode = 1;
}
