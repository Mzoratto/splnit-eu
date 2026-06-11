import { auth } from "@clerk/nextjs/server";
import { get } from "@vercel/blob";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { getPrehledVersionForOrg } from "@/lib/db/queries/prehled";
import { getPrehledFilename } from "@/lib/export/prehled-pdf";
import { privateJson, withPrivateNoStore } from "@/lib/http/private-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ versionId: string }> },
) {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    return privateJson({ error: "Unauthorized" }, { status: 401 });
  }

  const organisation = await getOrganisationByClerkOrgId(session.orgId);

  if (organisation?.rezimPovinnosti !== "nizsi") {
    return privateJson({ error: "Not found" }, { status: 404 });
  }

  const { versionId } = await params;
  const version = await getPrehledVersionForOrg({
    clerkOrgId: session.orgId,
    versionId,
  });

  if (!version) {
    return privateJson({ error: "Not found" }, { status: 404 });
  }

  // Byte-identical by construction: the stored blob is streamed as-is,
  // the document is never re-rendered for downloads.
  const blob = await get(version.blobUrl, { access: "private" });

  if (!blob || blob.statusCode !== 200) {
    return privateJson({ error: "File not found" }, { status: 404 });
  }

  return new Response(blob.stream, {
    headers: withPrivateNoStore({
      "Content-Disposition": `attachment; filename="${getPrehledFilename(
        version.versionNumber,
        version.createdAt,
      )}"`,
      "Content-Type": "application/pdf",
    }),
  });
}
