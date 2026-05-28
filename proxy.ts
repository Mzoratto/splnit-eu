import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { toInternalMarketingPath } from "./i18n/marketing-paths";
import { localeCookieName, routing } from "./i18n/routing";

const protectedRoutes = [
  "/agency(.*)",
  "/agency-client-invites(.*)",
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/frameworks(.*)",
  "/controls(.*)",
  "/evidence(.*)",
  "/integrations(.*)",
  "/policies(.*)",
  "/vendors(.*)",
  "/questionnaires(.*)",
  "/trust-center(.*)",
  "/incidents(.*)",
  "/risks(.*)",
  "/team(.*)",
  "/workspaces(.*)",
  "/settings(.*)",
];

const localizedProtectedRoutes = protectedRoutes.flatMap((route) => [
  `/en${route}`,
  `/it${route}`,
  `/cs${route}`,
]);

const isProtectedRoute = createRouteMatcher([
  ...protectedRoutes,
  ...localizedProtectedRoutes,
]);

const isPublicRoute = createRouteMatcher(["/demo(.*)"]);

const isApiRoute = createRouteMatcher(["/api(.*)", "/trpc(.*)"]);

function getPrefixedLocaleRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/it" || pathname.startsWith("/it/")) {
    return { locale: "it-IT" as const };
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return { locale: "en-EU" as const };
  }

  if (pathname === "/cs" || pathname.startsWith("/cs/")) {
    return { locale: "cs-CZ" as const };
  }

  return null;
}

function applyLocale(request: NextRequest) {
  const prefixedRoute = getPrefixedLocaleRoute(request);
  const locale = prefixedRoute?.locale ?? routing.defaultLocale;
  const headers = new Headers(request.headers);
  headers.set("X-NEXT-INTL-LOCALE", locale);
  headers.set("x-pathname", request.nextUrl.pathname);

  const internalPath = toInternalMarketingPath(request.nextUrl.pathname);
  const rewriteUrl =
    prefixedRoute || internalPath !== request.nextUrl.pathname
      ? new URL(internalPath, request.nextUrl)
      : null;

  if (rewriteUrl) {
    rewriteUrl.search = request.nextUrl.search;
  }

  const response = rewriteUrl
    ? NextResponse.rewrite(rewriteUrl, {
        request: {
          headers,
        },
      })
    : NextResponse.next({
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

function localDemoDataEnabled() {
  const testRoutesEnabled =
    process.env.ENABLE_TEST_ROUTES === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_TEST_ROUTES === "true";

  return (
    process.env.ENABLE_LOCAL_DEMO_DATA === "true" &&
    (process.env.NODE_ENV !== "production" || testRoutesEnabled)
  );
}

const clerk = clerkMiddleware(async (auth, request) => {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (clerkConfigured && isProtectedRoute(request) && !isPublicRoute(request)) {
    await auth.protect();
  }

  if (isApiRoute(request)) {
    return NextResponse.next();
  }

  return applyLocale(request);
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const clerkConfigured =
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY);

  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  if (!clerkConfigured) {
    if (
      process.env.NODE_ENV === "production" &&
      isProtectedRoute(request) &&
      !isPublicRoute(request) &&
      !localDemoDataEnabled()
    ) {
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
    "/((?!sentry-tunnel|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|ttf|woff2?|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
