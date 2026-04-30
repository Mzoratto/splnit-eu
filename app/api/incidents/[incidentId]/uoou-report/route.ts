import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getIncidentForOrg } from "@/lib/db/queries/incidents";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { renderIncidentNotificationPdf } from "@/lib/pdf/incident-notification";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ incidentId: string }> },
) {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { incidentId } = await params;
  const [incident, organisation] = await Promise.all([
    getIncidentForOrg({ clerkOrgId: session.orgId, incidentId }),
    getOrganisationByClerkOrgId(session.orgId),
  ]);

  if (!incident || !organisation) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  }

  const pdf = await renderIncidentNotificationPdf({
    generatedAt: new Date(),
    incident,
    organisation,
    regulator: "uoou",
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Disposition": `attachment; filename="uoou-incident-${incident.id}.pdf"`,
      "Content-Type": "application/pdf",
    },
  });
}
