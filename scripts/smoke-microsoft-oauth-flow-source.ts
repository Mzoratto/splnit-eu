import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getMicrosoft365AuthUrl } from "../lib/integrations/microsoft365/oauth";

process.env.MICROSOFT_CLIENT_ID = "376e342a-01c5-4307-abf6-175107f5ada2";

const authUrl = new URL(
  getMicrosoft365AuthUrl(
    "org_source_smoke",
    "https://splnit.eu/api/integrations/microsoft/callback",
  ),
);

assert.equal(
  authUrl.hostname,
  "login.microsoftonline.com",
  "Microsoft OAuth should use Microsoft identity host.",
);
assert.equal(
  authUrl.pathname,
  "/organizations/oauth2/v2.0/authorize",
  "Microsoft OAuth should use the org-only authority so Outlook/personal accounts cannot satisfy the request.",
);
assert.equal(
  authUrl.searchParams.get("prompt"),
  "select_account",
  "Microsoft OAuth should force explicit account selection for personal/work-school ambiguous emails.",
);

const scope = authUrl.searchParams.get("scope") ?? "";
for (const requiredScope of [
  "offline_access",
  "User.Read.All",
  "UserAuthenticationMethod.Read.All",
  "Policy.Read.All",
  "Directory.Read.All",
  "AuditLog.Read.All",
  "Reports.Read.All",
]) {
  assert.match(scope, new RegExp(`(^| )${requiredScope.replace(/\./g, "\\.")}( |$)`));
}

const callbackSource = readFileSync(
  "app/api/integrations/microsoft/callback/route.ts",
  "utf8",
);
assert.match(
  callbackSource,
  /searchParams\.get\(["']error["']\)/,
  "Microsoft callback should read Microsoft OAuth error responses explicitly.",
);
assert.match(
  callbackSource,
  /searchParams\.get\(["']error_description["']\)/,
  "Microsoft callback should read Microsoft OAuth error descriptions explicitly.",
);
assert.match(
  callbackSource,
  /searchParams\.set\(["']oauth_error["'],\s*["']microsoft_oauth_failed["']\)/,
  "Microsoft callback should redirect to the connector page with a stable OAuth error marker.",
);
assert.ok(
  callbackSource.indexOf("searchParams.get(\"error\")") >= 0 &&
    callbackSource.indexOf("searchParams.get(\"error\")") <
      callbackSource.indexOf("Missing code or state"),
  "Microsoft OAuth error handling should run before the generic missing-code/state guard.",
);

console.log("Microsoft OAuth flow source smoke passed");
