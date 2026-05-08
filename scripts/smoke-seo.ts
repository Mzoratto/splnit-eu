import sitemap from "../app/sitemap";
import robots from "../app/robots";
import { locales } from "../i18n/routing";
import { getLocalizedMarketingPath } from "../i18n/marketing-paths";
import { getBlogPosts } from "../lib/marketing/blog";
import { frameworkCards } from "../lib/marketing/frameworks";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function normalizeUrl(path: string) {
  return `https://splnit.eu${path === "/" ? "" : path}`;
}

const entries = sitemap();
const urls = new Set(entries.map((entry) => entry.url));

for (const locale of locales) {
  for (const post of getBlogPosts(locale)) {
    const path = getLocalizedMarketingPath(`/blog/${post.slug}`, locale);
    assert(
      urls.has(normalizeUrl(path)),
      `sitemap is missing localized blog post ${locale} ${path}`,
    );
  }

  for (const framework of frameworkCards.filter((item) => item.status === "available")) {
    const path = getLocalizedMarketingPath(`/predpisy/${framework.slug}`, locale);
    assert(
      urls.has(normalizeUrl(path)),
      `sitemap is missing localized framework detail ${locale} ${path}`,
    );
  }
}

assert(urls.has("https://splnit.eu/nastroje/nis2-scope"), "sitemap should include localized Czech tools URL /nastroje/nis2-scope");

for (const entry of entries) {
  assert(entry.url.startsWith("https://splnit.eu"), `sitemap URL should use production host: ${entry.url}`);
  assert(entry.alternates?.languages, `sitemap entry missing hreflang alternates: ${entry.url}`);
  assert(entry.alternates.languages["x-default"] === "https://splnit.eu", `sitemap entry missing x-default alternate: ${entry.url}`);
}

const robotsConfig = robots();
const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules : [robotsConfig.rules];
const disallow = rules.flatMap((rule) => rule.disallow ?? []);
for (const path of ["/api/", "/sign-in", "/sign-up", "/dashboard", "/evidence", "/questionnaires", "/vendor-assessment/"]) {
  assert(disallow.includes(path), `robots.txt should disallow ${path}`);
}

console.log(`SEO smoke passed with ${entries.length} sitemap entries.`);
