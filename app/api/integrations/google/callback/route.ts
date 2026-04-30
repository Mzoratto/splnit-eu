import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "pending",
    note: "Google Workspace OAuth callback placeholder.",
  });
}
