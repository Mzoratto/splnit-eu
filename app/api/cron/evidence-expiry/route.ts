import { NextResponse } from "next/server";
import { sendEvidenceExpiryAlerts } from "@/lib/evidence/expiry-alerts";
import { getCronAuthError } from "@/lib/http/cron";

async function sendExpiryAlerts(request: Request) {
  const authError = getCronAuthError(request);
  if (authError) {
    return authError;
  }

  const result = await sendEvidenceExpiryAlerts();

  return NextResponse.json({
    ok: true,
    ...result,
  });
}

export async function GET(request: Request) {
  return sendExpiryAlerts(request);
}

export async function POST(request: Request) {
  return sendExpiryAlerts(request);
}
