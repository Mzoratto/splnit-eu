import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/db/queries/audit-logs";
import { upsertIntegrationConnection } from "@/lib/db/queries/integrations";
import { getGitHubInstallation } from "@/lib/integrations/github/app";

function hasClerkConfig() {
  return (
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY)
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const installationId = url.searchParams.get("installation_id");
  const clerkOrgId = url.searchParams.get("state");

  if (!installationId || !clerkOrgId) {
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

  if (session.orgId !== clerkOrgId) {
    return NextResponse.json(
      { error: "OAuth state does not match the active organisation." },
      { status: 403 },
    );
  }

  const installation = await getGitHubInstallation(installationId);

  const integration = await upsertIntegrationConnection({
    clerkOrgId,
    config: {
      accountType: installation.account?.type ?? null,
      installationId,
      owner: installation.account?.login ?? null,
    },
    provider: "github",
  });
  await createAuditLog({
    action: "integration.connected",
    clerkOrgId,
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
