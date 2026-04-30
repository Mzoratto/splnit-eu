import { createHash } from "node:crypto";
import { XMLParser } from "fast-xml-parser";
import type { FrameworkSlug } from "@/lib/controls/library";
import type { RegulationUpdateInput } from "@/lib/db/queries/regulation-updates";

type FeedEntry = {
  description?: unknown;
  guid?: unknown;
  id?: unknown;
  link?: unknown;
  pubDate?: unknown;
  published?: unknown;
  summary?: unknown;
  title?: unknown;
  updated?: unknown;
};

type ParsedRegulationItem = {
  publishedAt: Date;
  sourceUrl: string | null;
  stableId: string;
  summary: string | null;
  text: string;
  title: string;
};

export type RegulationSourceKey =
  | "ctu"
  | "eu-ai-office"
  | "eurlex"
  | "nukib";

const parser = new XMLParser({
  attributeNamePrefix: "@_",
  ignoreAttributes: false,
  trimValues: true,
});

function asArray<T>(value: T | T[] | null | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function asText(value: unknown): string | null {
  if (typeof value === "string") {
    return value.trim() || null;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object" && "#text" in value) {
    return asText(value["#text" as keyof typeof value]);
  }

  return null;
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x20;/g, " ");
}

export function stripHtml(value: string | null) {
  if (!value) {
    return null;
  }

  return decodeHtml(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getLink(value: unknown) {
  if (typeof value === "string") {
    return value.trim() || null;
  }

  if (Array.isArray(value)) {
    const alternate = value.find(
      (item) =>
        item &&
        typeof item === "object" &&
        (!("@_rel" in item) || item["@_rel" as keyof typeof item] === "alternate"),
    );
    return getLink(alternate ?? value[0]);
  }

  if (value && typeof value === "object" && "@_href" in value) {
    return asText(value["@_href" as keyof typeof value]);
  }

  return null;
}

export function parseDate(value: string | null) {
  const date = value ? new Date(value) : new Date();

  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function getPublishedAt(entry: FeedEntry) {
  return parseDate(
    asText(entry.pubDate) ?? asText(entry.published) ?? asText(entry.updated),
  );
}

function getFeedEntries(parsed: Record<string, unknown>) {
  const rss = parsed.rss as { channel?: { item?: FeedEntry | FeedEntry[] } };
  const atom = parsed.feed as { entry?: FeedEntry | FeedEntry[] };

  return [...asArray(rss?.channel?.item), ...asArray(atom?.entry)];
}

function makeStableId(prefix: string, value: string) {
  return `${prefix}:${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

export function parseSyndicationFeed(xml: string, sourceKey: RegulationSourceKey) {
  const parsed = parser.parse(xml) as Record<string, unknown>;

  return getFeedEntries(parsed).flatMap((entry): ParsedRegulationItem[] => {
    const title = stripHtml(asText(entry.title));

    if (!title) {
      return [];
    }

    const summary = stripHtml(asText(entry.summary) ?? asText(entry.description));
    const sourceUrl = getLink(entry.link);
    const publishedAt = getPublishedAt(entry);
    const stableId =
      asText(entry.guid) ??
      asText(entry.id) ??
      sourceUrl ??
      makeStableId(sourceKey, `${title}:${publishedAt.toISOString()}`);

    return [
      {
        publishedAt,
        sourceUrl,
        stableId,
        summary,
        text: `${title} ${summary ?? ""}`,
        title,
      },
    ];
  });
}

function getAbsoluteDigitalStrategyUrl(href: string) {
  if (href.startsWith("http")) {
    return href;
  }

  return `https://digital-strategy.ec.europa.eu${href}`;
}

export function parseDigitalStrategyRelatedContent(html: string) {
  const articles = html.match(/<article\b[\s\S]*?<\/article>/g) ?? [];

  return articles.flatMap((article): ParsedRegulationItem[] => {
    const hrefMatch = article.match(/<a[^>]+href="([^"]+)"[^>]*data-ecl-title-link[\s\S]*?<span>([\s\S]*?)<\/span>/);
    const metaMatches = Array.from(
      article.matchAll(/ecl-content-block__primary-meta-item">([\s\S]*?)<\/li>/g),
    ).map((match) => stripHtml(match[1]) ?? "");
    const summaryMatch = article.match(/ecl-content-block__description[\s\S]*?<p>([\s\S]*?)<\/p>/);
    const title = stripHtml(hrefMatch?.[2] ?? null);
    const href = hrefMatch?.[1] ?? null;

    if (!title || !href) {
      return [];
    }

    const publishedAt = parseDate(metaMatches.find((item) => /\d{4}/.test(item)) ?? null);
    const summary = stripHtml(summaryMatch?.[1] ?? null);
    const sourceUrl = getAbsoluteDigitalStrategyUrl(href);

    return [
      {
        publishedAt,
        sourceUrl,
        stableId: sourceUrl,
        summary,
        text: `${title} ${summary ?? ""} ${metaMatches.join(" ")}`,
        title,
      },
    ];
  });
}

export function classifyFramework(
  item: ParsedRegulationItem,
  fallback: FrameworkSlug | null,
): FrameworkSlug | null {
  const text = item.text.toLowerCase();

  if (
    text.includes("csrd") ||
    text.includes("esrs") ||
    text.includes("sustainability") ||
    text.includes("esg")
  ) {
    return "csrd";
  }

  if (
    text.includes("ai act") ||
    text.includes("artificial intelligence") ||
    text.includes("ai office") ||
    text.includes("gpai")
  ) {
    return "ai-act";
  }

  if (
    text.includes("gdpr") ||
    text.includes("2016/679") ||
    text.includes("data protection") ||
    text.includes("personal data") ||
    text.includes("privacy")
  ) {
    return "gdpr";
  }

  if (text.includes("iso 27001") || text.includes("iso/iec 27001")) {
    return "iso27001";
  }

  if (
    text.includes("nis2") ||
    text.includes("cyber") ||
    text.includes("kyber") ||
    text.includes("cve-") ||
    text.includes("vulnerability") ||
    text.includes("zranitelnost")
  ) {
    return "nis2";
  }

  return fallback;
}

export function classifySeverity(item: ParsedRegulationItem) {
  const text = item.text.toLowerCase();

  if (
    /cve-\d{4}-\d{4,}/i.test(text) ||
    text.includes("critical") ||
    text.includes("kritick") ||
    text.includes("zero-day") ||
    text.includes("aktivně zneuž")
  ) {
    return "action_required";
  }

  if (
    text.includes("deadline") ||
    text.includes("consultation") ||
    text.includes("guidance") ||
    text.includes("code of practice") ||
    text.includes("varování") ||
    text.includes("hrozb") ||
    text.includes("upozorňuje") ||
    text.includes("incident")
  ) {
    return "warning";
  }

  return "info";
}

export function toRegulationUpdateInput(
  item: ParsedRegulationItem,
  options: {
    affectsPlans?: string[];
    fallbackFrameworkSlug: FrameworkSlug | null;
    source: string;
    sourceKey: RegulationSourceKey;
  },
): RegulationUpdateInput {
  return {
    affectsPlans: options.affectsPlans ?? [
      "free",
      "starter",
      "business",
      "consultant",
    ],
    externalId: `${options.sourceKey}:${item.stableId}`,
    frameworkSlug: classifyFramework(item, options.fallbackFrameworkSlug),
    publishedAt: item.publishedAt,
    severity: classifySeverity(item),
    source: options.source,
    sourceUrl: item.sourceUrl,
    summaryCs: item.summary,
    title: item.title,
  };
}
