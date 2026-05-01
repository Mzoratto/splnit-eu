import { auth } from "@clerk/nextjs/server";
import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getEvidenceForOrg } from "@/lib/db/queries/evidence";

function hasClerkConfig() {
  return (
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY)
  );
}

function getExtension(contentType: string) {
  const extensionByType: Record<string, string> = {
    "application/json": "json",
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "text/csv": "csv",
    "text/plain": "txt",
  };

  return extensionByType[contentType] ?? "bin";
}

function getSafeFilename(input: {
  contentType: string;
  description: string | null;
  evidenceId: string;
  source: string | null;
}) {
  const base =
    input.description?.trim() ||
    input.source?.trim() ||
    `evidence-${input.evidenceId.slice(0, 8)}`;
  const safeBase = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${safeBase || "evidence"}.${getExtension(input.contentType)}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ evidenceId: string }> },
) {
  if (!hasClerkConfig()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await auth();

  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { evidenceId } = await params;
  const evidence = await getEvidenceForOrg({
    clerkOrgId: session.orgId,
    evidenceId,
  });

  if (!evidence?.blobUrl) {
    return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
  }

  const blob = await get(evidence.blobUrl, { access: "private" });

  if (!blob || blob.statusCode !== 200) {
    return NextResponse.json({ error: "Evidence file not found" }, { status: 404 });
  }

  return new Response(blob.stream, {
    headers: {
      "Content-Disposition": `attachment; filename="${getSafeFilename({
        contentType: blob.blob.contentType,
        description: evidence.description,
        evidenceId: evidence.id,
        source: evidence.source,
      })}"`,
      "Content-Type": blob.blob.contentType,
    },
  });
}
