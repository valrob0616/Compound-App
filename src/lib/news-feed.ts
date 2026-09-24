import { NEWS_CATEGORY } from '../data/rss-sources.ts';
import type { FeedLoadResult, NewsItem } from '../types/index.ts';

function byDateDesc(a: { publishedAt: string }, b: { publishedAt: string }): number {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * News articles only: Family Compound RSS hits, filled out with Family Compound
 * seed briefings when a host is down. Homesteading stories and videos are omitted.
 */
export function assembleNewsArticles(
  live: NewsItem[],
  seed: NewsItem[],
): { items: NewsItem[]; source: FeedLoadResult['newsSource'] } {
  const familyLive = live.filter((item) => item.category === NEWS_CATEGORY);
  const familySeed = seed.filter((item) => item.category === NEWS_CATEGORY);
  const seen = new Set<string>();
  const items: NewsItem[] = [];

  for (const item of [...familyLive, ...familySeed]) {
    const key = item.url || normalizeTitle(item.title);
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
  }

  items.sort(byDateDesc);
  if (familyLive.length === 0) return { items, source: 'seed' };
  if (familySeed.some((entry) => items.includes(entry))) return { items, source: 'mixed' };
  return { items, source: 'live' };
}
