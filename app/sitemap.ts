import type { MetadataRoute } from "next";
import { getLocalizedMarketingPath } from "@/i18n/marketing-paths";
import { locales } from "@/i18n/routing";
import { getBlogPosts } from "@/lib/marketing/blog";
import { frameworkCards } from "@/lib/marketing/frameworks";
import { absoluteUrl, getMarketingAlternates } from "@/lib/seo/metadata";

const staticRoutes = [
  "/",
  "/platform",
  "/predpisy",
  "/nastroje/nis2-kalkulator",
  "/srovnani",
  "/partneri",
  "/blog",
  "/early-access",
  "/about",
  "/security",
  "/status",
  "/tools/nis2-scope",
  "/cenik",
  "/soukromi",
  "/podminky",
  "/cookies",
  "/dpa",
];

function buildRouteSet() {
  const paths = new Set<string>();
  const sourcePaths = new Map<string, string>();

  for (const route of staticRoutes) {
    for (const locale of locales) {
      const localizedPath = getLocalizedMarketingPath(route, locale);
      paths.add(localizedPath);
      sourcePaths.set(localizedPath, route);
    }
  }

  for (const framework of frameworkCards.filter(
    (framework) => framework.status === "available",
  )) {
    const route = `/predpisy/${framework.slug}`;
    for (const locale of locales) {
      const localizedPath = getLocalizedMarketingPath(route, locale);
      paths.add(localizedPath);
      sourcePaths.set(localizedPath, route);
    }
  }

  for (const locale of locales) {
    for (const post of getBlogPosts(locale)) {
      const route = `/blog/${post.slug}`;
      const localizedPath = getLocalizedMarketingPath(route, locale);
      paths.add(localizedPath);
      sourcePaths.set(localizedPath, route);
    }
  }

  return Array.from(paths).map((path) => ({
    path,
    sourcePath: sourcePaths.get(path) ?? path,
  }));
}

function getChangeFrequency(route: string): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (route.includes("/blog/") || route.includes("/predpisy/")) {
    return "monthly";
  }

  return "weekly";
}

function getPriority(route: string) {
  if (route === "/" || route === "/en" || route === "/it") {
    return 1;
  }

  if (route.includes("/blog/") || route.includes("/predpisy/")) {
    return 0.7;
  }

  return 0.8;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return buildRouteSet().map(({ path, sourcePath }) => ({
    alternates: {
      languages: getMarketingAlternates(sourcePath),
    },
    changeFrequency: getChangeFrequency(sourcePath),
    priority: getPriority(path),
    url: absoluteUrl(path),
  }));
}
