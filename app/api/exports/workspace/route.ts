import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/db";
import { getWorkspaceExport } from "@/lib/db/queries/workspace-export";

export const dynamic = "force-dynamic";

function hasClerkConfig() {
  return (
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY)
  );
}

function getFilename() {
  const date = new Date().toISOString().slice(0, 10);
  return `workspace-export-${date}.json`;
}

export async function GET() {
  if (!hasClerkConfig()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await auth();

  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      { error: "DATABASE_URL is required." },
      { status: 503 },
    );
  }

  const workspaceExport = await getWorkspaceExport(session.orgId);

  if (!workspaceExport) {
    return NextResponse.json({ error: "Organisation not found." }, { status: 404 });
  }

  return new Response(`${JSON.stringify(workspaceExport, null, 2)}\n`, {
    headers: {
      "Content-Disposition": `attachment; filename="${getFilename()}"`,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
