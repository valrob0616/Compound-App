import type { CategoryId, PreferredCategory } from '@/types';

export const APP_DISPLAY_NAME = 'Homestead Compound News';
export const BUNDLE_ID = 'com.imconintl.homesteadcompound';

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  homesteading: 'Homesteading',
  'family-compounds': 'Family Compounds',
};

export const CATEGORY_BLURBS: Record<CategoryId, string> = {
  homesteading:
    'Gardening, livestock, off-grid systems, DIY, and rural self-reliance.',
  'family-compounds':
    'Multi-household living, shared infrastructure, land stewardship, and compound planning.',
};

export const PREFERRED_LABELS: Record<PreferredCategory, string> = {
  homesteading: 'Homesteading',
  'family-compounds': 'Family Compounds',
  both: 'Both',
};

/** Placeholder Associates tag — replace via EXPO_PUBLIC_AMAZON_ASSOCIATE_TAG. */
export const DEFAULT_AMAZON_ASSOCIATE_TAG = 'yourtag-20';

export function amazonAssociateTag(): string {
  const fromEnv = process.env.EXPO_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_AMAZON_ASSOCIATE_TAG;
}

export function isPlaceholderAssociateTag(tag = amazonAssociateTag()): boolean {
  return tag === DEFAULT_AMAZON_ASSOCIATE_TAG;
}
