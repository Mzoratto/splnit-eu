import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/trpc/",
        "/sign-in",
        "/sign-up",
        "/dashboard",
        "/onboarding",
        "/frameworks",
        "/controls",
        "/evidence",
        "/integrations",
        "/policies",
        "/vendors",
        "/questionnaires",
        "/trust-center",
        "/incidents",
        "/risks",
        "/team",
        "/settings",
        "/vendor-assessment/",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
