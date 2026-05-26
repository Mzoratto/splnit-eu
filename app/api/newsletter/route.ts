import { NextResponse } from "next/server";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().email().max(254),
  source: z.string().trim().max(120).optional(),
});

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  if (!process.env.LOOPS_API_KEY) {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ ok: true, skipped: "provider_not_configured" });
    }

    return NextResponse.json(
      { error: "Newsletter provider is not configured." },
      { status: 503 },
    );
  }

  const loopsPayload: Record<string, unknown> = {
    email: parsed.data.email,
    source: parsed.data.source ?? "splnit.eu footer",
    subscribed: true,
  };

  if (process.env.LOOPS_NEWSLETTER_LIST_ID) {
    loopsPayload.mailingLists = {
      [process.env.LOOPS_NEWSLETTER_LIST_ID]: true,
    };
  }

  const response = await fetch("https://app.loops.so/api/v1/contacts/create", {
    body: JSON.stringify(loopsPayload),
    headers: {
      Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (response.ok || response.status === 409) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "Newsletter signup failed." },
    { status: 502 },
  );
}
