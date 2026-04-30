import { NextResponse } from "next/server";
import { runTestsForOrg } from "@/lib/integrations/runner";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clerkOrgId } = await request.json().catch(() => ({ clerkOrgId: null }));

  if (!clerkOrgId) {
    return NextResponse.json({ error: "clerkOrgId is required" }, { status: 400 });
  }

  await runTestsForOrg(String(clerkOrgId));

  return NextResponse.json({ ok: true, clerkOrgId });
}
