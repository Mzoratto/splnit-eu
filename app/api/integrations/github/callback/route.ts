import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/db/queries/audit-logs";
import { upsertIntegrationConnection } from "@/lib/db/queries/integrations";
import {
  consumeGitHubInstallNonce,
  getGitHubInstallation,
  getGitHubInstallNonceFromState,
} from "@/lib/integrations/github/app";
import { verifyOAuthState } from "@/lib/integrations/oauth-state";

function hasClerkConfig() {
  return (
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY)
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const installationId = url.searchParams.get("installation_id");
  const state = url.searchParams.get("state");

  if (!installationId || !state) {
    return NextResponse.json(
      { error: "Missing installation_id or state." },
      { status: 400 },
    );
  }

  if (!hasClerkConfig()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const session = await auth();

  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!verifyOAuthState(state, { clerkOrgId: session.orgId, provider: "github" })) {
    return NextResponse.json(
      { error: "OAuth state does not match the active organisation." },
      { status: 403 },
    );
  }

  const nonce = getGitHubInstallNonceFromState(state);

  if (!nonce) {
    return NextResponse.json(
      { error: "Missing GitHub installation nonce." },
      { status: 400 },
    );
  }

  const nonceValid = await consumeGitHubInstallNonce(nonce, {
    clerkOrgId: session.orgId,
    clerkUserId: session.userId,
  });

  if (!nonceValid) {
    return NextResponse.json(
      { error: "GitHub installation nonce is invalid or expired." },
      { status: 400 },
    );
  }

  const installation = await getGitHubInstallation(installationId);

  const integration = await upsertIntegrationConnection({
    clerkOrgId: session.orgId,
    config: {
      accountType: installation.account?.type ?? null,
      installationId,
      owner: installation.account?.login ?? null,
    },
    provider: "github",
  });
  await createAuditLog({
    action: "integration.connected",
    clerkOrgId: session.orgId,
    entityId: integration.id,
    entityType: "integration",
    metadata: {
      installationId,
      owner: installation.account?.login ?? null,
      provider: "github",
    },
  });

  return NextResponse.redirect(new URL("/integrations/github", url.origin));
}
