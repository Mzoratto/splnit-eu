export function getNukibFeedUrl() {
  return process.env.NUKIB_FEED_URL ?? "https://portal.nukib.gov.cz/rss.xml";
}
