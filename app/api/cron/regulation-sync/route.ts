import { NextResponse } from "next/server";
import { syncNukibFeed } from "@/lib/integrations/nukib/sync";

export async function POST(request: Request) {
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
    sourceUrl: result.sourceUrl,
    bytes: result.html.length,
  });
}
