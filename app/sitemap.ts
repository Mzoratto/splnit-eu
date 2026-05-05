import type { MetadataRoute } from "next";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { locales } from "@/i18n/routing";
import { frameworkCards } from "@/lib/marketing/frameworks";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://splnit.eu";

const staticRoutes = [
  "/",
  "/platform",
  "/predpisy",
  "/blog",
  "/early-access",
  "/about",
  "/security",
  "/status",
  "/cenik",
  "/pricing",
];

function buildRouteSet() {
  const paths = new Set<string>();

  for (const route of staticRoutes) {
    for (const locale of locales) {
      paths.add(getLocalizedMarketingPath(route, locale));
    }
  }

  for (const framework of frameworkCards.filter(
    (framework) => framework.status === "available",
  )) {
    for (const locale of locales) {
      paths.add(getLocalizedMarketingPath(`/predpisy/${framework.slug}`, locale));
    }
  }

  return Array.from(paths);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return buildRouteSet().map((route) => ({
    url: `${appUrl}${route === "/" ? "" : route}`,
    lastModified: now,
    changeFrequency:
      route.includes("/predpisy/") ||
      route.includes("/regulations/") ||
      route.includes("/normative/")
        ? "monthly"
        : "weekly",
    priority: route === "/" || route === "/en" || route === "/it" ? 1 : 0.8,
  }));
}
