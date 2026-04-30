import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.text();

  return NextResponse.json({
    received: Boolean(body),
    note: "Stripe signature verification and plan sync are the next implementation step.",
  });
}
