import { RSS_SOURCES } from '@/data/rss-sources';
import { SEED_NEWS } from '@/data/seed-news';
import { CURATED_VIDEOS } from '@/data/videos';
import type { CategoryId, FeedItem, FeedLoadResult, NewsItem, VideoItem } from '@/types';
import { fetchRssSource } from './rss';

function byDateDesc(a: { publishedAt: string }, b: { publishedAt: string }): number {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function mergeNews(live: NewsItem[], seed: NewsItem[]): { items: NewsItem[]; source: FeedLoadResult['newsSource'] } {
  const seen = new Set<string>();
  const items: NewsItem[] = [];
  for (const item of [...live, ...seed]) {
    const key = item.url || normalizeTitle(item.title);
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
  }
  items.sort(byDateDesc);
  if (live.length === 0) return { items, source: 'seed' };
  if (seed.some((s) => items.includes(s))) return { items, source: 'mixed' };
  return { items, source: 'live' };
}

export function interleaveFeed(news: NewsItem[], videos: VideoItem[]): FeedItem[] {
  const sortedNews = [...news].sort(byDateDesc);
  const sortedVideos = [...videos].sort(byDateDesc);
  const out: FeedItem[] = [];
  let videoIndex = 0;
  const cadence = sortedNews.length >= 6 ? 3 : 2;

  sortedNews.forEach((item, index) => {
    out.push(item);
    const shouldInsertVideo = (index + 1) % cadence === 0 || (index === 0 && sortedNews.length <= 2);
    if (shouldInsertVideo && videoIndex < sortedVideos.length) {
      out.push(sortedVideos[videoIndex]);
      videoIndex += 1;
    }
  });

  while (videoIndex < sortedVideos.length) {
    out.push(sortedVideos[videoIndex]);
    videoIndex += 1;
  }
  return out;
}

export async function loadCategoryFeed(category: CategoryId): Promise<FeedLoadResult> {
  const sources = RSS_SOURCES.filter((source) => source.category === category);
  const liveChunks = await Promise.all(
    sources.map(async (source) => {
      try {
        return await fetchRssSource(source);
      } catch {
        return [] as NewsItem[];
      }
    }),
  );
  const live = liveChunks.flat();
  const seed = SEED_NEWS.filter((item) => item.category === category);
  const merged = mergeNews(live, seed);
  const videos = CURATED_VIDEOS.filter((item) => item.category === category);
  return {
    items: interleaveFeed(merged.items, videos),
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
