import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

function safeEquals(expected: string, provided: string) {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export function getCronAuthError(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "CRON_SECRET is not configured." },
        { status: 503 },
      );
    }

    return null;
  }

  const authorization = request.headers.get("authorization") ?? "";

  if (!safeEquals(`Bearer ${cronSecret}`, authorization)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
