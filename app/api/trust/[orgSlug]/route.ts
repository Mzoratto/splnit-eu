import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/db";
import { getPublicTrustCenter } from "@/lib/db/queries/trust-center";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import { getTrustCenterSummary } from "@/lib/trust-center/renderer";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> },
) {
  const { orgSlug } = await params;
  const accessToken = new URL(request.url).searchParams.get("access");
  const trustData = hasDatabaseUrl()
    ? await getPublicTrustCenter({ accessToken, orgSlug }).catch(() => null)
    : loadDemoTrustCenter(orgSlug);

  if (!trustData) {
    return NextResponse.json({ error: "Trust Center not found" }, { status: 404 });
  }

  const visibleFrameworks = trustData.accessGranted ? trustData.frameworks : [];

  return NextResponse.json({
    accessGranted: trustData.accessGranted,
    frameworks: visibleFrameworks,
    lastTestedAt: trustData.lastTestedAt,
    ndaRequired: trustData.ndaRequired,
    orgSlug,
    organisationName: trustData.organisationName,
    summary: getTrustCenterSummary(visibleFrameworks),
  });
}

function loadDemoTrustCenter(orgSlug: string) {
  if (orgSlug !== "demo") {
    return null;
  }

  const frameworks = FRAMEWORK_LIBRARY.slice(0, 3).map((framework, index) => ({
    framework,
    score: [72, 64, 81][index] ?? null,
    status: "active",
  }));

  return {
    accessGranted: true,
    frameworks,
    lastTestedAt: new Date(Date.now() - 11 * 60 * 1000),
    ndaRequired: false,
    organisationName: "Demo organizace",
  };
}
