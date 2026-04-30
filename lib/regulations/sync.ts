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
  url: string | null;
};

type SourceResult = {
  error?: string;
  fetched: number;
  skipped?: string;
  sourceUrl: string | null;
};

const defaultPlans = ["free", "starter", "business", "consultant"];

function getSourceConfigs(): SourceConfig[] {
  return [
    {
      affectsPlans: ["starter", "business", "consultant"],
      fallbackFrameworkSlug: "nis2",
      key: "nukib",
      kind: "xml",
      name: "NÚKIB",
      url: process.env.NUKIB_FEED_URL ?? "https://portal.nukib.gov.cz/rss.xml",
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
      url: process.env.CTU_FEED_URL ?? "https://ctu.gov.cz/rss/aktualni-informace",
    },
    {
      fallbackFrameworkSlug: "ai-act",
      key: "eu-ai-office",
      kind: "html",
      name: "EU AI Office",
      url:
        process.env.EU_AI_OFFICE_UPDATES_URL ??
        "https://digital-strategy.ec.europa.eu/en/related-content?topic=119",
    },
    {
      fallbackFrameworkSlug: null,
      key: "eurlex",
      kind: "xml",
      name: "EUR-Lex",
      url: process.env.EURLEX_AMENDMENTS_FEED_URL ?? null,
    },
  ];
}

async function fetchSource(config: SourceConfig) {
  if (!config.url) {
    return {
      result: {
        fetched: 0,
        skipped: `${config.name} feed URL is not configured.`,
        sourceUrl: null,
      },
      updates: [],
    };
  }

  const response = await fetch(config.url, {
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
  const updates = relevantItems.map((item) =>
    toRegulationUpdateInput(item, {
      affectsPlans: config.affectsPlans ?? defaultPlans,
      fallbackFrameworkSlug: config.fallbackFrameworkSlug,
      source: config.name,
      sourceKey: config.key,
    }),
  );

  return {
    result: {
      fetched: updates.length,
      sourceUrl: config.url,
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
        sourceUrl: config.url,
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
