import { NextResponse } from "next/server";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import { getTrustCenterSummary } from "@/lib/trust-center/renderer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orgSlug: string }> },
) {
  const { orgSlug } = await params;

  if (orgSlug !== "demo") {
    return NextResponse.json({ error: "Trust Center not found" }, { status: 404 });
  }

  const frameworks = FRAMEWORK_LIBRARY.slice(0, 3).map((framework, index) => ({
    framework,
    score: [72, 64, 81][index] ?? null,
    status: "active",
  }));

  return NextResponse.json({
    orgSlug,
    summary: getTrustCenterSummary(frameworks),
    frameworks,
  });
}
