import { NextResponse } from "next/server";
import { exchangeMicrosoftCode } from "@/lib/integrations/microsoft365/oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  const redirectUri = `${url.origin}/api/integrations/microsoft/callback`;
  const token = await exchangeMicrosoftCode(code, redirectUri);

  return NextResponse.json({
    clerkOrgId: state,
    expiresIn: token.expires_in,
    note: "Persist encrypted access and refresh tokens in integrations table next.",
  });
}
