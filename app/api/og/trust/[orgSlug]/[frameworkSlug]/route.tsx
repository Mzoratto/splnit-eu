import { ImageResponse } from "next/og";
import { getPublicFrameworkDetailModel } from "@/lib/trust-center/public-model";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ frameworkSlug: string; orgSlug: string }>;
  },
) {
  const { frameworkSlug, orgSlug } = await params;
  const data = await getPublicFrameworkDetailModel({ frameworkSlug, orgSlug });

  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  const { framework, trustCenter } = data;

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
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ color: trustCenter.accentColor, fontSize: 26, fontWeight: 700 }}>
              Splnit.eu Trust Center
            </div>
            <div style={{ color: "#71717a", fontSize: 24 }}>
              {trustCenter.organisationName}
            </div>
          </div>
          <div
            style={{
              alignItems: "center",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 8,
              color: trustCenter.accentColor,
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              height: 52,
              padding: "0 18px",
            }}
          >
            Verified by Splnit.eu
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ color: "#71717a", fontSize: 28 }}>
            {framework.regulator} · {framework.law}
          </div>
          <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1 }}>
            {framework.framework.nameCs}
          </div>
        </div>

        <div style={{ display: "flex", gap: 18 }}>
          <Metric label="Score" value={`${framework.score ?? "-"}%`} />
          <Metric label="Verified" value={String(framework.verified)} />
          <Metric label="In progress" value={String(framework.inProgress)} />
          <Metric label="Not applicable" value={String(framework.notApplicable)} />
        </div>
      </div>
    ),
    {
      height: 630,
      width: 1200,
    },
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 22,
        width: 246,
      }}
    >
      <div style={{ color: "#71717a", fontSize: 22 }}>{label}</div>
      <div style={{ color: "#18181b", fontSize: 46, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
