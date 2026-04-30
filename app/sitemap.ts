import type { MetadataRoute } from "next";
import { frameworkCards } from "@/lib/marketing/frameworks";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://splnit.eu";

const staticRoutes = [
  "",
  "/platform",
  "/predpisy",
  "/zakaznici",
  "/cenik",
  "/pricing",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: `${appUrl}${route}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...frameworkCards.map((framework) => ({
      url: `${appUrl}/predpisy/${framework.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
