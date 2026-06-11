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
            boxShadow: "0 32px 90px rgba(38, 131, 70, 0.16)",
            display: "flex",
            flexDirection: "column",
            gap: 34,
            padding: 56,
            width: "100%",
          }}
        >
          <div
            style={{
              alignItems: "center",
              color: "#268346",
              display: "flex",
              fontSize: 34,
              fontWeight: 700,
              gap: 14,
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40">
              <rect x="6" y="22" width="7" height="14" rx="1.5" fill="#1e3a6e" />
              <rect x="16.5" y="14" width="7" height="22" rx="1.5" fill="#1e3a6e" />
              <rect x="27" y="6" width="7" height="30" rx="1.5" fill="#3daa5c" />
            </svg>
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
            <span style={{ color: "#268346" }}>Automatically verified.</span>
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
