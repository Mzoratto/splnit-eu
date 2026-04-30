import { syncRegulationUpdateSources } from "@/lib/regulations/sync";

export async function syncNukibFeed() {
  const result = await syncRegulationUpdateSources(["nukib"]);
  const nukib = result.sources.nukib;

  return {
    alerts: result.alerts,
    fetched: nukib?.fetched ?? result.fetched,
    inserted: result.inserted,
    sourceUrl: nukib?.sourceUrl ?? process.env.NUKIB_FEED_URL ?? null,
    updated: result.updated,
  };
}
