import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "pending",
    note: "GitHub App callback will be implemented with installation metadata.",
  });
}
