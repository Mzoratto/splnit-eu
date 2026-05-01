import { auth } from "@clerk/nextjs/server";
import { listRiskItemsForOrg } from "@/lib/db/queries/risks";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { privateJson, withPrivateNoStore } from "@/lib/http/private-response";
import { renderRiskRegisterPdf } from "@/lib/pdf/risk-register";

export async function GET() {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    return privateJson({ error: "Unauthorized" }, { status: 401 });
  }

  const [organisation, risks] = await Promise.all([
    getOrganisationByClerkOrgId(session.orgId),
    listRiskItemsForOrg(session.orgId),
  ]);

  if (!organisation) {
    return privateJson({ error: "Organisation not found" }, { status: 404 });
  }

  const pdf = await renderRiskRegisterPdf({
    generatedAt: new Date(),
    organisationName: organisation.name,
    risks,
  });

  return new Response(new Uint8Array(pdf), {
    headers: withPrivateNoStore({
      "Content-Disposition": 'attachment; filename="risk-register.pdf"',
      "Content-Type": "application/pdf",
    }),
  });
}
