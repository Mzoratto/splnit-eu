import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    checks: {
      databaseConfigured: hasDatabaseUrl(),
    },
    ok: true,
    readiness: "/api/readiness",
    service: "splnit.eu",
    timestamp: new Date().toISOString(),
  });
}
