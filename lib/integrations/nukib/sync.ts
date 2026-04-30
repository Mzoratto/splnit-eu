import { createHash } from "node:crypto";
import { XMLParser } from "fast-xml-parser";
import { hasDatabaseUrl } from "@/lib/db";
import {
  upsertRegulationUpdates,
  type RegulationUpdateInput,
} from "@/lib/db/queries/regulation-updates";
import { sendRegulationUpdateAlerts } from "@/lib/regulations/alerts";
import { getNukibFeedUrl } from "./client";

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

function stripHtml(value: string | null) {
  if (!value) {
    return null;
  }

  return value
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

function getPublishedAt(entry: FeedEntry) {
  const raw =
    asText(entry.pubDate) ??
    asText(entry.published) ??
    asText(entry.updated) ??
    new Date().toISOString();
  const date = new Date(raw);

  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function getExternalId(entry: FeedEntry, title: string, sourceUrl: string | null) {
  const searchable = `${title} ${stripHtml(asText(entry.summary)) ?? ""} ${
    stripHtml(asText(entry.description)) ?? ""
  }`;
  const cve = searchable.match(/CVE-\d{4}-\d{4,}/i)?.[0].toUpperCase();

  if (cve) {
    return `nukib:${cve}`;
  }

  const stableId = asText(entry.guid) ?? asText(entry.id) ?? sourceUrl;

  if (stableId) {
    return `nukib:${stableId}`;
  }

  return `nukib:${createHash("sha256")
    .update(`${title}:${getPublishedAt(entry).toISOString()}`)
    .digest("hex")
    .slice(0, 24)}`;
}

function classifySeverity(title: string, summary: string | null) {
  const text = `${title} ${summary ?? ""}`.toLowerCase();

  if (
    /cve-\d{4}-\d{4,}/i.test(text) ||
    text.includes("kritick") ||
    text.includes("varování") ||
    text.includes("bezprostřed")
  ) {
    return "action_required";
  }

  if (
    text.includes("hrozb") ||
    text.includes("zranitelnost") ||
    text.includes("upozorňuje") ||
    text.includes("incident")
  ) {
    return "warning";
  }

  return "info";
}

function getFeedEntries(parsed: Record<string, unknown>) {
  const rss = parsed.rss as { channel?: { item?: FeedEntry | FeedEntry[] } };
  const atom = parsed.feed as { entry?: FeedEntry | FeedEntry[] };

  return [...asArray(rss?.channel?.item), ...asArray(atom?.entry)];
}

function parseNukibFeed(xml: string) {
  const parsed = parser.parse(xml) as Record<string, unknown>;

  return getFeedEntries(parsed).flatMap((entry): RegulationUpdateInput[] => {
    const title = stripHtml(asText(entry.title));

    if (!title) {
      return [];
    }

    const summary = stripHtml(asText(entry.summary) ?? asText(entry.description));
    const sourceUrl = getLink(entry.link);
    const severity = classifySeverity(title, summary);

    return [
      {
        affectsPlans:
          severity === "action_required"
            ? ["starter", "business", "consultant"]
            : ["free", "starter", "business", "consultant"],
        externalId: getExternalId(entry, title, sourceUrl),
        frameworkSlug: "nis2",
        publishedAt: getPublishedAt(entry),
        severity,
        sourceUrl,
        summaryCs: summary,
        title,
      },
    ];
  });
}

export async function syncNukibFeed() {
  const sourceUrl = getNukibFeedUrl();
  const response = await fetch(sourceUrl, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`NÚKIB feed request failed: ${response.status}`);
  }

  const xml = await response.text();
  const updates = parseNukibFeed(xml);

  if (!hasDatabaseUrl()) {
    return {
      alerts: { emailsSent: 0, skipped: "DATABASE_URL is not configured." },
      fetched: updates.length,
      inserted: 0,
      sourceUrl,
      updated: 0,
    };
  }

  const result = await upsertRegulationUpdates(updates);
  const alerts = await sendRegulationUpdateAlerts(result.actionRequiredUpdates);

  return {
    alerts,
    fetched: updates.length,
    inserted: result.inserted,
    sourceUrl,
    updated: result.updated,
  };
}
