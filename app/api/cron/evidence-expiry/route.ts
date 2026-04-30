import { NextResponse } from "next/server";
import { sendEvidenceExpiryAlerts } from "@/lib/evidence/expiry-alerts";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendEvidenceExpiryAlerts();

  return NextResponse.json({
    ok: true,
    ...result,
  });
}
