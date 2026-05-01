import { NextResponse } from "next/server";
import { getCronAuthError } from "@/lib/http/cron";
import { sendPolicyReviewReminders } from "@/lib/policies/review-reminders";

async function sendReviewReminders(request: Request) {
  const authError = getCronAuthError(request);
  if (authError) {
    return authError;
  }

  const result = await sendPolicyReviewReminders();

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
