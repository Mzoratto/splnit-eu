import { NextResponse } from "next/server";
import { getCronAuthError } from "@/lib/http/cron";
import { syncRegulationUpdateSources } from "@/lib/regulations/sync";

async function syncRegulationUpdates(request: Request) {
  const authError = getCronAuthError(request);
  if (authError) {
    return authError;
  }

  const result = await syncRegulationUpdateSources();

  return NextResponse.json({
    ok: true,
    ...result,
  });
}

export async function GET(request: Request) {
  return syncRegulationUpdates(request);
}

export async function POST(request: Request) {
  return syncRegulationUpdates(request);
}
