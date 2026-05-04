import { ImageResponse } from "next/og";
import { cookies } from "next/headers";
import { hasDatabaseUrl } from "@/lib/db";
import { getPublicTrustCenter } from "@/lib/db/queries/trust-center";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import type { Locale } from "@/i18n/routing";
import {
  getPublicTrustCopy,
  getPublicTrustLocaleFromCookie,
} from "@/lib/trust-center/public-copy";
import { getTrustCenterSummary } from "@/lib/trust-center/renderer";

export const alt = "Splnit.eu Trust Center";
export const contentType = "image/png";
export const runtime = "nodejs";
export const size = {
  height: 630,
  width: 1200,
};

export default async function Image({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const cookieStore = await cookies();
  const locale = getPublicTrustLocaleFromCookie(cookieStore.toString());
  const copy = getPublicTrustCopy(locale);
  const trustData = await loadTrustCenter(orgSlug, locale);
  const visibleFrameworks = trustData.ndaRequired ? [] : trustData.frameworks;
  const summary = getTrustCenterSummary(visibleFrameworks);

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#f6f8f4",
          color: "#14201a",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: 56,
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              color: trustData.accentColor,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 0,
            }}
          >
            Splnit.eu Trust Center
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.02 }}>
            {trustData.organisationName}
          </div>
          <div style={{ color: "#5d6b62", fontSize: 30 }}>
            {copy.verified} · {summary.frameworkCount} {copy.frameworkCount}
          </div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <Metric label={copy.averageScore} value={`${summary.averageScore ?? "-"}%`} />
          <Metric
            label={copy.ndaGate}
            value={trustData.ndaRequired ? copy.ndaRequired : copy.ndaNotRequired}
          />
          <Metric label={copy.frameworkCount} value={String(summary.frameworkCount)} />
        </div>
      </div>
    ),
    size,
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #dfe7df",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 24,
        width: 240,
      }}
    >
      <div style={{ color: "#66756b", fontSize: 24 }}>{label}</div>
      <div style={{ color: "#163b2b", fontSize: 52, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

async function loadTrustCenter(orgSlug: string, locale: Locale) {
  if (hasDatabaseUrl()) {
    const data = await getPublicTrustCenter({ orgSlug }).catch(() => null);

    if (data) {
      return data;
    }
  }

  return {
    accentColor: "#1b7f5a",
    frameworks: FRAMEWORK_LIBRARY.slice(0, 3).map((framework, index) => ({
      framework,
      score: [72, 64, 81][index] ?? null,
      status: "active",
    })),
    ndaRequired: false,
    organisationName:
      orgSlug === "demo" ? getPublicTrustCopy(locale).demoOrganisation : "Splnit.eu",
  };
}
