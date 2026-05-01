import { auth } from "@clerk/nextjs/server";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { listVendorsForOrg } from "@/lib/db/queries/vendors";
import { privateJson, withPrivateNoStore } from "@/lib/http/private-response";
import { renderVendorRiskReportPdf } from "@/lib/pdf/vendor-risk-report";

export async function GET() {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    return privateJson({ error: "Unauthorized" }, { status: 401 });
  }

  const [organisation, vendors] = await Promise.all([
    getOrganisationByClerkOrgId(session.orgId),
    listVendorsForOrg(session.orgId),
  ]);
  const pdf = await renderVendorRiskReportPdf({
    generatedAt: new Date(),
    organisationName: organisation?.name ?? "Organizace",
    vendors,
  });

  return new Response(new Uint8Array(pdf), {
    headers: withPrivateNoStore({
      "Content-Disposition": 'attachment; filename="nis2-supply-chain-report.pdf"',
      "Content-Type": "application/pdf",
    }),
  });
}
