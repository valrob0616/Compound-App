import type { RssSource } from '@/data/rss-sources';
import type { NewsItem } from '@/types';

import { parseRssItems, type ParsedRssItem } from './rss-parse';

export { parseRssItems } from './rss-parse';

function matchesKeywords(item: ParsedRssItem, keywords?: string[]): boolean {
  if (!keywords?.length) return true;
  const hay = `${item.title} ${item.description}`.toLowerCase();
  return keywords.some((word) => hay.includes(word.toLowerCase()));
}

function toNews(source: RssSource, item: ParsedRssItem, index: number): NewsItem {
  const published = item.pubDate ? new Date(item.pubDate) : new Date();
  return {
    kind: 'news',
    id: `rss-${source.id}-${index}-${hashId(item.link)}`,
    category: source.category,
    title: item.title,
    summary: item.description || `From ${source.name}.`,
    url: item.link,
    source: source.name,
    publishedAt: Number.isNaN(published.getTime()) ? new Date().toISOString() : published.toISOString(),
    imageUrl: item.imageUrl,
    author: item.author,
  };
}

function hashId(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export async function fetchRssSource(source: RssSource, timeoutMs = 8000): Promise<NewsItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
    });
    if (!response.ok) {
      throw new Error(`RSS ${source.id} HTTP ${response.status}`);
    }
    const xml = await response.text();
    return parseRssItems(xml)
      .filter((item) => matchesKeywords(item, source.keywords))
      .map((item, index) => toNews(source, item, index));
  } finally {
    clearTimeout(timer);
  }
}
