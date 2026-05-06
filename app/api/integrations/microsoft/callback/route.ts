import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { exchangeMicrosoftCode } from "@/lib/integrations/microsoft365/oauth";
import { encryptSecret } from "@/lib/crypto";
import { createAuditLog } from "@/lib/db/queries/audit-logs";
import { upsertIntegrationConnection } from "@/lib/db/queries/integrations";
import { verifyOAuthState } from "@/lib/integrations/oauth-state";

function hasClerkConfig() {
  return (
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY)
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  if (!hasClerkConfig()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const session = await auth();

  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!verifyOAuthState(state, { clerkOrgId: session.orgId, provider: "microsoft365" })) {
    return NextResponse.json(
      { error: "OAuth state does not match the active organisation." },
      { status: 403 },
    );
  }

  const redirectUri = `${url.origin}/api/integrations/microsoft/callback`;
  const token = await exchangeMicrosoftCode(code, redirectUri);
  const tokenExpiresAt = new Date(Date.now() + token.expires_in * 1000);

  const integration = await upsertIntegrationConnection({
    accessTokenEnc: encryptSecret(token.access_token, session.orgId),
    clerkOrgId: session.orgId,
    config: {
      redirectUri,
      tokenType: "oauth2",
    },
    provider: "microsoft365",
    refreshTokenEnc: encryptSecret(token.refresh_token, session.orgId),
    tokenExpiresAt,
  });
  await createAuditLog({
    action: "integration.connected",
    clerkOrgId: session.orgId,
    entityId: integration.id,
    entityType: "integration",
    metadata: {
      provider: "microsoft365",
      tokenType: "oauth2",
    },
  });

  return NextResponse.redirect(new URL("/integrations/microsoft365", url.origin));
}
