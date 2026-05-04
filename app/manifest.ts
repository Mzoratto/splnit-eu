import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Splnit.eu",
    short_name: "Splnit",
    description:
      "Compliance dashboard for NIS2, EU AI Act, GDPR, ISO 27001 and CSRD.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#2563eb",
    categories: ["business", "productivity", "security"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Open the compliance dashboard.",
        url: "/dashboard",
      },
      {
        name: "Evidence vault",
        short_name: "Evidence",
        description: "Open compliance evidence.",
        url: "/evidence",
      },
    ],
  };
}
