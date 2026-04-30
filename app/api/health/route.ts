import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    checks: {
      databaseConfigured: hasDatabaseUrl(),
    },
    ok: true,
    service: "splnit.eu",
    timestamp: new Date().toISOString(),
  });
}
