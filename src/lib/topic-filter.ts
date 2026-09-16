import type { TopicFilter } from '../data/family-compound-topic.ts';

export type { TopicFilter };

/** Lowercase, strip punctuation, collapse hyphens/spaces so "multi-gen" matches "multi gen". */
export function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function containsPhrase(haystack: string, phrase: string): boolean {
  const hay = ` ${normalizeForMatch(haystack)} `;
  const needle = ` ${normalizeForMatch(phrase)} `;
  if (needle === '  ') return false;
  return hay.includes(needle);
}

export function matchesTopicFilter(text: string, filter?: TopicFilter): boolean {
  if (!filter) return true;
  if (filter.noneOf?.some((phrase) => containsPhrase(text, phrase))) return false;
  if (filter.anyOf?.length) {
    return filter.anyOf.some((phrase) => containsPhrase(text, phrase));
  }
  return true;
}

export type SourceMatchInput = {
  keywords?: string[];
  curatedFeed?: boolean;
};

export function itemMatchesSource(
  item: { title: string; description: string },
  source: SourceMatchInput,
  categoryFilter?: TopicFilter,
): boolean {
  const hay = `${item.title} ${item.description}`;
  if (source.keywords?.length && !source.keywords.some((word) => containsPhrase(hay, word))) {
    return false;
  }
  if (source.curatedFeed) return true;
  return matchesTopicFilter(hay, categoryFilter);
}
