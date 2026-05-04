import { NextResponse } from "next/server";
import { getPublicTrustCenterModel } from "@/lib/trust-center/public-model";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> },
) {
  const { orgSlug } = await params;
  const accessToken = new URL(request.url).searchParams.get("access");
  const trustCenter = await getPublicTrustCenterModel({ accessToken, orgSlug });

  if (!trustCenter) {
    return NextResponse.json({ error: "Trust Center not found" }, { status: 404 });
  }

  return NextResponse.json({
    documents: trustCenter.documents.map((document) => ({
      id: document.id,
      isLocked: document.isLocked,
      title: document.title,
    })),
    frameworks: trustCenter.frameworks.map((framework) => ({
      categories: framework.categories.map((category) => ({
        category: category.category,
        inProgress: category.inProgress,
        notApplicable: category.notApplicable,
        status: category.status,
        total: category.total,
        verified: category.verified,
      })),
      inProgress: framework.inProgress,
      lastAssessedAt: framework.lastAssessedAt,
      notApplicable: framework.notApplicable,
      score: framework.score,
      slug: framework.framework.slug,
      status: framework.statusLabel,
      totalControls: framework.totalControls,
      verified: framework.verified,
    })),
    lastTestedAt: trustCenter.lastTestedAt,
    nextTestAt: trustCenter.nextTestAt,
    orgSlug: trustCenter.orgSlug,
    organisationName: trustCenter.organisationName,
    showFrameworkDrilldown: trustCenter.showFrameworkDrilldown,
    showFrameworkPercentages: trustCenter.showFrameworkPercentages,
    trustSignals: trustCenter.trustSignals,
  });
}
