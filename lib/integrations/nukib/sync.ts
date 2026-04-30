import { getNukibFeedUrl } from "./client";

export async function syncNukibFeed() {
  const response = await fetch(getNukibFeedUrl(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`NÚKIB feed request failed: ${response.status}`);
  }

  return {
    sourceUrl: getNukibFeedUrl(),
    html: await response.text(),
  };
}
