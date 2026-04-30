import { NextResponse } from "next/server";
import { exchangeMicrosoftCode } from "@/lib/integrations/microsoft365/oauth";
import { encryptSecret } from "@/lib/crypto";
import { upsertIntegrationConnection } from "@/lib/db/queries/integrations";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  const redirectUri = `${url.origin}/api/integrations/microsoft/callback`;
  const token = await exchangeMicrosoftCode(code, redirectUri);
  const tokenExpiresAt = new Date(Date.now() + token.expires_in * 1000);

  await upsertIntegrationConnection({
    accessTokenEnc: encryptSecret(token.access_token, state),
    clerkOrgId: state,
    config: {
      redirectUri,
      tokenType: "oauth2",
    },
    provider: "microsoft365",
    refreshTokenEnc: encryptSecret(token.refresh_token, state),
    tokenExpiresAt,
  });

  return NextResponse.redirect(new URL("/integrations/microsoft365", url.origin));
}
