import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listRiskItemsForOrg } from "@/lib/db/queries/risks";
import { getOrganisationByClerkOrgId } from "@/lib/db/queries/organisations";
import { renderRiskRegisterPdf } from "@/lib/pdf/risk-register";

export async function GET() {
  const session = await auth();

  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [organisation, risks] = await Promise.all([
    getOrganisationByClerkOrgId(session.orgId),
    listRiskItemsForOrg(session.orgId),
  ]);

  if (!organisation) {
    return NextResponse.json({ error: "Organisation not found" }, { status: 404 });
  }

  const pdf = await renderRiskRegisterPdf({
    generatedAt: new Date(),
    organisationName: organisation.name,
    risks,
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Disposition": 'attachment; filename="risk-register.pdf"',
      "Content-Type": "application/pdf",
    },
  });
}
