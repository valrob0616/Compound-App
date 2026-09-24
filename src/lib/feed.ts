import { sourcesForNews } from '@/data/rss-sources';
import { SEED_NEWS } from '@/data/seed-news';
import { CURATED_VIDEOS } from '@/data/videos';
import type { FeedItem, FeedLoadResult, NewsItem } from '@/types';
import { assembleNewsArticles } from './news-feed';
import { fetchRssSource } from './rss';

/** Family Compound RSS for the News tab. Videos stay on the Videos tab. */
export async function loadNewsFeed(): Promise<FeedLoadResult> {
  const sources = sourcesForNews();
  const liveChunks = await Promise.all(
    sources.map(async (source) => {
      try {
        return await fetchRssSource(source);
      } catch {
        return [] as NewsItem[];
      }
    }),
  );
  const merged = assembleNewsArticles(liveChunks.flat(), SEED_NEWS);
  return {
    items: merged.items,
    newsSource: merged.source,
  };
}

const memory = new Map<string, FeedItem>();

export function rememberFeedItems(items: FeedItem[]): void {
  for (const item of items) {
    memory.set(item.id, item);
  }
}

export function lookupFeedItem(id: string): FeedItem | undefined {
  if (memory.has(id)) return memory.get(id);
  const seed = SEED_NEWS.find((item) => item.id === id);
  if (seed) return seed;
  return CURATED_VIDEOS.find((item) => item.id === id);
}
