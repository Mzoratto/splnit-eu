import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { recordActivationEvent } from "@/lib/activation/events";
import { getAppUrl } from "@/lib/env";
import { getMicrosoft365AuthUrl } from "@/lib/integrations/microsoft365/oauth";

function hasMicrosoftOAuthConfig() {
  return Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!hasMicrosoftOAuthConfig()) {
    return NextResponse.json({ error: "Microsoft OAuth is not configured." }, { status: 503 });
  }

  const url = new URL(request.url);
  const redirectUri = `${getAppUrl()}/api/integrations/microsoft/callback`;
  const authUrl = getMicrosoft365AuthUrl(session.orgId, redirectUri);

  await recordActivationEvent({
    clerkOrgId: session.orgId,
    clerkUserId: session.userId,
    entityId: "microsoft365",
    entityType: "connector",
    metadata: {
      provider: "microsoft365",
      redirectUri,
    },
    name: "ConnectorOAuthStarted",
  });

  return NextResponse.redirect(new URL(authUrl, url.origin));
}
