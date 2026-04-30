import type { FrameworkSlug } from "@/lib/controls/library";
import { hasDatabaseUrl } from "@/lib/db";
import {
  upsertRegulationUpdates,
  type RegulationUpdateInput,
} from "@/lib/db/queries/regulation-updates";
import { sendRegulationUpdateAlerts } from "@/lib/regulations/alerts";
import {
  parseDigitalStrategyRelatedContent,
  parseSyndicationFeed,
  toRegulationUpdateInput,
  type RegulationSourceKey,
} from "@/lib/regulations/source-parsers";

type SourceConfig = {
  affectsPlans?: string[];
  fallbackFrameworkSlug: FrameworkSlug | null;
  includeKeywords?: string[];
  key: RegulationSourceKey;
  kind: "html" | "xml";
  name: string;
  urls: string[];
};

type SourceResult = {
  error?: string;
  fetched: number;
  skipped?: string;
  sourceUrl: string | null;
  sourceUrls?: string[];
};

const defaultPlans = ["free", "starter", "business", "consultant"];
const defaultEurlexFeedUrls = [
  "https://eur-lex.europa.eu/EN/display-feed.rss?rssId=162",
  "https://eur-lex.europa.eu/EN/display-feed.rss?rssId=161",
  "https://eur-lex.europa.eu/EN/display-feed.rss?rssId=222",
];
const eurlexKeywords = [
  "2016/679",
  "2022/2464",
  "2022/2554",
  "2022/2555",
  "2024/1689",
  "ai act",
  "artificial intelligence",
  "corporate sustainability",
  "cyber security",
  "cybersecurity",
  "data protection",
  "digital operational resilience",
  "dora",
  "esrs",
  "gdpr",
  "general-purpose ai",
  "high-risk ai",
  "network and information systems",
  "nis2",
  "personal data",
  "sustainability reporting",
];

function getOptionalUrls(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
}

function getSourceConfigs(): SourceConfig[] {
  const eurlexUrls = [
    ...defaultEurlexFeedUrls,
    ...getOptionalUrls(process.env.EURLEX_AMENDMENTS_FEED_URL),
  ];

  return [
    {
      affectsPlans: ["starter", "business", "consultant"],
      fallbackFrameworkSlug: "nis2",
      key: "nukib",
      kind: "xml",
      name: "NÚKIB",
      urls: [process.env.NUKIB_FEED_URL ?? "https://portal.nukib.gov.cz/rss.xml"],
    },
    {
      fallbackFrameworkSlug: "ai-act",
      includeKeywords: [
        "ai ",
        "artificial intelligence",
        "digitální služby",
        "digital services",
        "dsa",
        "umělá inteligence",
      ],
      key: "ctu",
      kind: "xml",
      name: "ČTÚ",
      urls: [
        process.env.CTU_FEED_URL ?? "https://ctu.gov.cz/rss/aktualni-informace",
      ],
    },
    {
      fallbackFrameworkSlug: "ai-act",
      key: "eu-ai-office",
      kind: "html",
      name: "EU AI Office",
      urls: [
        process.env.EU_AI_OFFICE_UPDATES_URL ??
          "https://digital-strategy.ec.europa.eu/en/related-content?topic=119",
      ],
    },
    {
      fallbackFrameworkSlug: null,
      includeKeywords: eurlexKeywords,
      key: "eurlex",
      kind: "xml",
      name: "EUR-Lex",
      urls: eurlexUrls,
    },
  ];
}

async function fetchSourceUrl(config: SourceConfig, url: string) {
  const response = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`${config.name} feed request failed: ${response.status}`);
  }

  const body = await response.text();
  const items =
    config.kind === "html"
      ? parseDigitalStrategyRelatedContent(body)
      : parseSyndicationFeed(body, config.key);
  const relevantItems = config.includeKeywords?.length
    ? items.filter((item) => {
        const text = item.text.toLowerCase();
        return config.includeKeywords?.some((keyword) => text.includes(keyword));
      })
    : items;

  return relevantItems.map((item) =>
    toRegulationUpdateInput(item, {
      affectsPlans: config.affectsPlans ?? defaultPlans,
      fallbackFrameworkSlug: config.fallbackFrameworkSlug,
      source: config.name,
      sourceKey: config.key,
    }),
  );
}

async function fetchSource(config: SourceConfig) {
  if (config.urls.length === 0) {
    return {
      result: {
        fetched: 0,
        skipped: `${config.name} feed URL is not configured.`,
        sourceUrl: null,
      },
      updates: [],
    };
  }

  const updates = (
    await Promise.all(config.urls.map((url) => fetchSourceUrl(config, url)))
  ).flat();

  return {
    result: {
      fetched: updates.length,
      sourceUrl: config.urls[0] ?? null,
      sourceUrls: config.urls,
    },
    updates,
  };
}

export async function collectRegulationUpdates(sourceKeys?: RegulationSourceKey[]) {
  const sourceFilter = sourceKeys ? new Set(sourceKeys) : null;
  const results: Record<string, SourceResult> = {};
  const updates: RegulationUpdateInput[] = [];

  for (const config of getSourceConfigs()) {
    if (sourceFilter && !sourceFilter.has(config.key)) {
      continue;
    }

    try {
      const { result, updates: sourceUpdates } = await fetchSource(config);
      results[config.key] = result;
      updates.push(...sourceUpdates);
    } catch (error) {
      results[config.key] = {
        error: error instanceof Error ? error.message : "Unknown feed error.",
        fetched: 0,
        sourceUrl: config.urls[0] ?? null,
        sourceUrls: config.urls,
      };
    }
  }

  return {
    results,
    updates,
  };
}

export async function syncRegulationUpdateSources(sourceKeys?: RegulationSourceKey[]) {
  const { results, updates } = await collectRegulationUpdates(sourceKeys);

  if (!hasDatabaseUrl()) {
    return {
      alerts: { emailsSent: 0, skipped: "DATABASE_URL is not configured.", updateCount: 0 },
      fetched: updates.length,
      inserted: 0,
      sources: results,
      updated: 0,
    };
  }

  const result = await upsertRegulationUpdates(updates);
  const alerts = await sendRegulationUpdateAlerts(result.actionRequiredUpdates);

  return {
    alerts,
    fetched: updates.length,
    inserted: result.inserted,
    sources: results,
    updated: result.updated,
  };
}
