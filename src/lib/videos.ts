import { CURATED_VIDEOS } from '../data/videos.ts';
import type { CategoryId, VideoItem } from '../types/index.ts';

function byDateDesc(a: { publishedAt: string }, b: { publishedAt: string }): number {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

export function videosForCategory(category: CategoryId): VideoItem[] {
  return CURATED_VIDEOS.filter((item) => item.category === category).sort(byDateDesc);
}
