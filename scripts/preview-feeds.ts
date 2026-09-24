/**
 * Print live RSS titles kept vs dropped by the Family Compound topic filter.
 * News uses the family-compounds sources only. Homesteading sources are still
 * listed, unfiltered, so we can confirm they parse — they are not shown in News.
 *
 *   npm run preview:feeds
 */
import { CATEGORY_TOPIC_FILTERS, RSS_SOURCES, type RssSource } from '../src/data/rss-sources.ts';
import { parseRssItems } from '../src/lib/rss-parse.ts';
import { itemMatchesSource } from '../src/lib/topic-filter.ts';

async function fetchXml(url: string, timeoutMs = 12000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function previewSource(source: RssSource, xml: string): void {
  const parsed = parseRssItems(xml);
  const categoryFilter = CATEGORY_TOPIC_FILTERS[source.category];
  const kept = parsed.filter((item) => itemMatchesSource(item, source, categoryFilter));
  const dropped = parsed.filter((item) => !itemMatchesSource(item, source, categoryFilter));

  console.log(`\n## ${source.category} · ${source.name} (${source.id})`);
  console.log(`   ${source.url}`);
  console.log(`   parsed ${parsed.length} · kept ${kept.length} · dropped ${dropped.length}`);
  for (const item of kept) {
    console.log(`   KEEP   ${item.title}`);
  }
  for (const item of dropped) {
    console.log(`   DROP   ${item.title}`);
  }
}

async function main(): Promise<void> {
  for (const source of RSS_SOURCES) {
    try {
      const xml = await fetchXml(source.url);
      previewSource(source, xml);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`\n## ${source.category} · ${source.name} FAILED: ${message}`);
    }
  }
}

void main();
