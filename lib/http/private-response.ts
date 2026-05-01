import { NextResponse } from "next/server";

export function withPrivateNoStore(headers: HeadersInit = {}) {
  const nextHeaders = new Headers(headers);

  nextHeaders.set("Cache-Control", "no-store, max-age=0");
  nextHeaders.set("Pragma", "no-cache");

  return nextHeaders;
}

export function privateJson(
  body: Parameters<typeof NextResponse.json>[0],
  init: ResponseInit = {},
) {
  return NextResponse.json(body, {
    ...init,
    headers: withPrivateNoStore(init.headers),
  });
}
