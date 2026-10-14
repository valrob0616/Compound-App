import { CURATED_VIDEOS } from '../data/videos.ts';
import type { CategoryId, VideoItem } from '../types/index.ts';
import { comparePublishedDesc } from './format.ts';

export function videosForCategory(category: CategoryId): VideoItem[] {
  return CURATED_VIDEOS.filter((item) => item.category === category).sort(comparePublishedDesc);
}
