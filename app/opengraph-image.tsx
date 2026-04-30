import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Splnit.eu compliance automation";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#fafaf9",
          color: "#18181b",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          height: "100%",
          justifyContent: "center",
          padding: 72,
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1px solid #d4d4d8",
            borderRadius: 28,
            boxShadow: "0 32px 90px rgba(37, 99, 235, 0.16)",
            display: "flex",
            flexDirection: "column",
            gap: 34,
            padding: 56,
            width: "100%",
          }}
        >
          <div style={{ color: "#2563eb", fontSize: 34, fontWeight: 700 }}>
            Splnit.eu
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 78,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.03,
              maxWidth: 900,
            }}
          >
            <span>EU compliance.</span>
            <span style={{ color: "#71717a" }}>Automatically verified.</span>
          </div>
          <div
            style={{
              color: "#52525b",
              display: "flex",
              fontSize: 30,
              gap: 24,
            }}
          >
            <span>NIS2</span>
            <span>GDPR</span>
            <span>EU AI Act</span>
            <span>ISO 27001</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
