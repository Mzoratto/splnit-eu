import { createOAuthState } from "@/lib/integrations/oauth-state";

const TENANT_ID = "common";
const SCOPES = [
  "User.Read.All",
  "UserAuthenticationMethod.Read.All",
  "Policy.Read.All",
  "Directory.Read.All",
  "AuditLog.Read.All",
  "Reports.Read.All",
].join(" ");

export function getMicrosoft365AuthUrl(clerkOrgId: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID ?? "",
    response_type: "code",
    redirect_uri: redirectUri,
    scope: `offline_access ${SCOPES}`,
    state: createOAuthState(clerkOrgId, "microsoft365"),
    response_mode: "query",
  });

  return `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?${params}`;
}

export async function exchangeMicrosoftCode(code: string, redirectUri: string) {
  const response = await fetch(
    `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID ?? "",
        client_secret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Microsoft OAuth exchange failed: ${response.status}`);
  }

  return response.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>;
}

export async function refreshMicrosoftToken(refreshToken: string) {
  const response = await fetch(
    `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
    {
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID ?? "",
        client_secret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        scope: `offline_access ${SCOPES}`,
      }),
      headers: { "content-type": "application/x-www-form-urlencoded" },
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(`Microsoft OAuth refresh failed: ${response.status}`);
  }

  return response.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  }>;
}
