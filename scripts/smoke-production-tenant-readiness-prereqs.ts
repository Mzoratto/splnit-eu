const requiredEnv = [
  "DATABASE_URL",
  "BLOB_READ_WRITE_TOKEN",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
] as const;

const optionalMailboxEnv = ["RESEND_API_KEY", "RESEND_FROM", "SMOKE_RECIPIENT_EMAIL"] as const;

function envStatus(name: string) {
  const value = process.env[name]?.trim();
  return value ? "present" : "missing";
}

function databaseHostStatus() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) {
    return { databaseHost: null, databaseIsLocal: null };
  }

  try {
    const parsed = new URL(value);
    const databaseIsLocal = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
    return { databaseHost: parsed.hostname, databaseIsLocal };
  } catch {
    return { databaseHost: "invalid_url", databaseIsLocal: null };
  }
}

const required = Object.fromEntries(requiredEnv.map((name) => [name, envStatus(name)]));
const optionalMailbox = Object.fromEntries(optionalMailboxEnv.map((name) => [name, envStatus(name)]));
const missingRequired = requiredEnv.filter((name) => required[name] !== "present");
const missingMailbox = optionalMailboxEnv.filter((name) => optionalMailbox[name] !== "present");
const database = databaseHostStatus();
const readyForTenantSmoke = missingRequired.length === 0 && database.databaseIsLocal !== true;
const readyForMailboxSendAttempt = readyForTenantSmoke && missingMailbox.length === 0;

console.log(JSON.stringify({
  databaseHost: database.databaseHost,
  databaseIsLocal: database.databaseIsLocal,
  missingMailbox,
  missingRequired,
  optionalMailbox,
  readyForMailboxSendAttempt,
  readyForTenantSmoke,
  required,
}, null, 2));

if (!readyForTenantSmoke) {
  process.exitCode = 1;
}
