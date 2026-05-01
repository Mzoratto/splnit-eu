import { auth } from "@clerk/nextjs/server";
import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getPolicyForOrg } from "@/lib/db/queries/policies";

function hasClerkConfig() {
  return (
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY)
  );
}

function getSafeFilename(title: string) {
  return `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)}.pdf`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ policyId: string }> },
) {
  if (!hasClerkConfig()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await auth();

  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { policyId } = await params;
  const policy = await getPolicyForOrg({
    clerkOrgId: session.orgId,
    policyId,
  });

  if (!policy?.blobUrl) {
    return NextResponse.json({ error: "Policy not found" }, { status: 404 });
  }

  const blob = await get(policy.blobUrl, { access: "private" });

  if (!blob || blob.statusCode !== 200) {
    return NextResponse.json({ error: "Policy file not found" }, { status: 404 });
  }

  return new Response(blob.stream, {
    headers: {
      "Content-Disposition": `attachment; filename="${getSafeFilename(
        policy.titleCs,
      )}"`,
      "Content-Type": blob.blob.contentType,
    },
  });
}
