import { auth } from "@clerk/nextjs/server";
import { hasDatabaseUrl } from "@/lib/db";
import { listEvidenceMetadataForExport } from "@/lib/db/queries/evidence";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { renderEvidenceMetadataCsv } from "@/lib/exports/evidence-metadata";
import { privateJson, withPrivateNoStore } from "@/lib/http/private-response";

export const dynamic = "force-dynamic";

function hasClerkConfig() {
  return (
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY)
  );
}

function getFilename() {
  const date = new Date().toISOString().slice(0, 10);
  return `evidence-metadata-${date}.csv`;
}

export async function GET() {
  if (!hasClerkConfig()) {
    return privateJson({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await auth();

  if (!session.userId || !session.orgId) {
    return privateJson({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasDatabaseUrl()) {
    return privateJson(
      { error: "DATABASE_URL is required." },
      { status: 503 },
    );
  }

  const organisation = await getOrganisationByClerkOrgId(session.orgId);

  if (!organisation) {
    return privateJson({ error: "Organisation not found." }, { status: 404 });
  }

  const rows = await listEvidenceMetadataForExport(session.orgId);

  return new Response(`${renderEvidenceMetadataCsv(rows)}\n`, {
    headers: withPrivateNoStore({
      "Content-Disposition": `attachment; filename="${getFilename()}"`,
      "Content-Type": "text/csv; charset=utf-8",
    }),
  });
}
