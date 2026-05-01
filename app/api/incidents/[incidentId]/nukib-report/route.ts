import { auth } from "@clerk/nextjs/server";
import { getIncidentForOrg } from "@/lib/db/queries/incidents";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { privateJson, withPrivateNoStore } from "@/lib/http/private-response";
import { renderIncidentNotificationPdf } from "@/lib/pdf/incident-notification";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ incidentId: string }> },
) {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    return privateJson({ error: "Unauthorized" }, { status: 401 });
  }

  const { incidentId } = await params;
  const [incident, organisation] = await Promise.all([
    getIncidentForOrg({ clerkOrgId: session.orgId, incidentId }),
    getOrganisationByClerkOrgId(session.orgId),
  ]);

  if (!incident || !organisation) {
    return privateJson({ error: "Incident not found" }, { status: 404 });
  }

  const pdf = await renderIncidentNotificationPdf({
    generatedAt: new Date(),
    incident,
    organisation,
    regulator: "nukib",
  });

  return new Response(new Uint8Array(pdf), {
    headers: withPrivateNoStore({
      "Content-Disposition": `attachment; filename="nukib-incident-${incident.id}.pdf"`,
      "Content-Type": "application/pdf",
    }),
  });
}
