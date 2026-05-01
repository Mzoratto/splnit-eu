import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "planned",
      message: "Google Workspace OAuth is not enabled in this release.",
    },
    { status: 501 },
  );
}
