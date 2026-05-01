import { NextResponse } from "next/server";
import { sendAccessReviewReminders } from "@/lib/access-reviews/reminders";
import { getCronAuthError } from "@/lib/http/cron";

async function sendReviewReminders(request: Request) {
  const authError = getCronAuthError(request);
  if (authError) {
    return authError;
  }

  const result = await sendAccessReviewReminders();

  return NextResponse.json({
    ok: true,
    ...result,
  });
}

export async function GET(request: Request) {
  return sendReviewReminders(request);
}

export async function POST(request: Request) {
  return sendReviewReminders(request);
}
