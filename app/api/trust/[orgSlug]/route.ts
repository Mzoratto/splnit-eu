import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/db";
import { getPublicTrustCenter } from "@/lib/db/queries/trust-center";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import type { Locale } from "@/i18n/routing";
import {
  getPublicTrustCopy,
  getPublicTrustLocaleFromCookie,
} from "@/lib/trust-center/public-copy";
import { getTrustCenterSummary } from "@/lib/trust-center/renderer";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> },
) {
  const { orgSlug } = await params;
  const accessToken = new URL(request.url).searchParams.get("access");
  const locale = getPublicTrustLocaleFromCookie(request.headers.get("cookie"));
  const trustData = hasDatabaseUrl()
    ? await getPublicTrustCenter({ accessToken, orgSlug }).catch(() => null)
    : loadDemoTrustCenter(orgSlug, locale);
  const resolvedTrustData = trustData ?? loadDemoTrustCenter(orgSlug, locale);

  if (!resolvedTrustData) {
    return NextResponse.json({ error: "Trust Center not found" }, { status: 404 });
  }

  const visibleFrameworks = resolvedTrustData.accessGranted
    ? resolvedTrustData.frameworks
    : [];

  return NextResponse.json({
    accessGranted: resolvedTrustData.accessGranted,
    frameworks: visibleFrameworks,
    lastTestedAt: resolvedTrustData.lastTestedAt,
    ndaRequired: resolvedTrustData.ndaRequired,
    orgSlug,
    organisationName: resolvedTrustData.organisationName,
    summary: getTrustCenterSummary(visibleFrameworks),
  });
}

function loadDemoTrustCenter(orgSlug: string, locale: Locale) {
  if (orgSlug !== "demo") {
    return null;
  }

  const frameworks = FRAMEWORK_LIBRARY.slice(0, 3).map((framework, index) => ({
    framework,
    score: [72, 64, 81][index] ?? null,
    status: "active",
  }));

  return {
    accessGranted: true,
    frameworks,
    lastTestedAt: new Date(Date.now() - 11 * 60 * 1000),
    ndaRequired: false,
    organisationName: getPublicTrustCopy(locale).demoOrganisation,
  };
}
