import { auth } from "@clerk/nextjs/server";
import { getIncidentForOrg } from "@/lib/db/queries/incidents";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { privateJson, withPrivateNoStore } from "@/lib/http/private-response";
import {
  getIncidentReportProfile,
  type IncidentReportTrack,
} from "@/lib/incidents/reporting";
import { renderIncidentNotificationPdf } from "@/lib/pdf/incident-notification";

export async function handleIncidentReportRequest(input: {
  params: Promise<{ incidentId: string }>;
  track: IncidentReportTrack;
}) {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    return privateJson({ error: "Unauthorized" }, { status: 401 });
  }

  const { incidentId } = await input.params;
  const [incident, organisation] = await Promise.all([
    getIncidentForOrg({ clerkOrgId: session.orgId, incidentId }),
    getOrganisationByClerkOrgId(session.orgId),
  ]);

  if (!incident || !organisation) {
    return privateJson({ error: "Incident not found" }, { status: 404 });
  }

  const profile = getIncidentReportProfile({
    jurisdiction: organisation.primaryJurisdiction,
    locale: organisation.locale,
    track: input.track,
  });
  const pdf = await renderIncidentNotificationPdf({
    generatedAt: new Date(),
    incident,
    organisation,
    track: input.track,
  });

  return new Response(new Uint8Array(pdf), {
    headers: withPrivateNoStore({
      "Content-Disposition": `attachment; filename="${profile.filenamePrefix}-${incident.id}.pdf"`,
      "Content-Type": "application/pdf",
    }),
  });
}
