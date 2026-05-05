import { handleIncidentReportRequest } from "@/lib/incidents/report-route";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ incidentId: string }> },
) {
  return handleIncidentReportRequest({
    params,
    track: "dataProtection",
  });
}
