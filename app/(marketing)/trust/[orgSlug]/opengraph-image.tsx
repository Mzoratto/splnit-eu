import { ImageResponse } from "next/og";
import { getPublicTrustCenterModel } from "@/lib/trust-center/public-model";

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
  const trustCenter =
    (await getPublicTrustCenterModel({ orgSlug })) ??
    (await getPublicTrustCenterModel({ orgSlug: "demo" }));
  const frameworkCount = trustCenter?.frameworks.length ?? 0;
  const controlCount =
    trustCenter?.frameworks.reduce((total, item) => total + item.totalControls, 0) ??
    0;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#fafaf9",
          color: "#18181b",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Inter, Arial, sans-serif",
          height: "100%",
          justifyContent: "space-between",
          padding: 56,
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              color: trustCenter?.accentColor ?? "#1d4ed8",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            Splnit.eu Trust Center
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.02 }}>
            {trustCenter?.organisationName ?? "Trust Center"}
          </div>
          <div style={{ color: "#71717a", fontSize: 30 }}>
            Verified continuously · public security posture
          </div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <Metric label="Frameworks" value={String(frameworkCount)} />
          <Metric label="Controls" value={String(controlCount)} />
          <Metric label="Documents" value={String(trustCenter?.documents.length ?? 0)} />
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
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 24,
        width: 260,
      }}
    >
      <div style={{ color: "#71717a", fontSize: 24 }}>{label}</div>
      <div style={{ color: "#18181b", fontSize: 52, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
