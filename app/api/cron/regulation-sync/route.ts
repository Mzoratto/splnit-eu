import { NextResponse } from "next/server";
import { syncNukibFeed } from "@/lib/integrations/nukib/sync";

async function syncRegulationUpdates(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncNukibFeed();

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
