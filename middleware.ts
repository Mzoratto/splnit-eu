import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { localeCookieName, normalizeLocale, routing } from "./i18n/routing";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/frameworks(.*)",
  "/controls(.*)",
  "/evidence(.*)",
  "/integrations(.*)",
  "/policies(.*)",
  "/vendors(.*)",
  "/trust-center(.*)",
  "/incidents(.*)",
  "/risks(.*)",
  "/team(.*)",
  "/settings(.*)",
]);

const isApiRoute = createRouteMatcher(["/api(.*)", "/trpc(.*)"]);

function getPreferredLocale(request: NextRequest) {
  const cookieLocale = normalizeLocale(
    request.cookies.get(localeCookieName)?.value,
  );

  if (cookieLocale) {
    return cookieLocale;
  }

  const languages = request.headers
    .get("accept-language")
    ?.split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const language of languages ?? []) {
    const baseLanguage = language.split("-")[0];
    const locale = normalizeLocale(language) ?? normalizeLocale(baseLanguage);

    if (locale) {
      return locale;
    }
  }

  return routing.defaultLocale;
}

function applyLocale(request: NextRequest) {
  const locale = getPreferredLocale(request);
  const headers = new Headers(request.headers);
  headers.set("X-NEXT-INTL-LOCALE", locale);

  const response = NextResponse.next({
    request: {
      headers,
    },
  });

  if (request.cookies.get(localeCookieName)?.value !== locale) {
    response.cookies.set(localeCookieName, locale, {
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

function authConfigurationError() {
  return new NextResponse("Authentication is not configured.", {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
    status: 503,
  });
}

const clerk = clerkMiddleware(async (auth, request) => {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (clerkConfigured && isProtectedRoute(request)) {
    await auth.protect();
  }

  if (isApiRoute(request)) {
    return NextResponse.next();
  }

  return applyLocale(request);
});

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (!clerkConfigured) {
    if (process.env.NODE_ENV === "production" && isProtectedRoute(request)) {
      return authConfigurationError();
    }

    if (isApiRoute(request)) {
      return NextResponse.next();
    }

    return applyLocale(request);
  }

  return clerk(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|ttf|woff2?|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
