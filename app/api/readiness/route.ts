import { NextResponse } from "next/server";
import { getReadinessReport } from "@/lib/readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = getReadinessReport();
  const includeDetails = process.env.NODE_ENV !== "production";

  return NextResponse.json(
    {
      checks: report.checks.map((check) => ({
        configured: check.configured,
        level: check.level,
        missing: includeDetails ? check.missing : undefined,
        missingCount: check.missing.length,
        name: check.name,
        status: check.status,
      })),
      ok: report.ready,
      required: {
        configured: report.requiredConfigured,
        total: report.requiredTotal,
      },
      recommended: {
        configured: report.recommendedConfigured,
        total: report.recommendedTotal,
      },
      service: "splnit.eu",
      timestamp: new Date().toISOString(),
    },
    { status: report.ready ? 200 : 503 },
  );
}
