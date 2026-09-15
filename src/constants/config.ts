import Constants from 'expo-constants';

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

/**
 * First publish: Store tab is Coming Soon. Flip this to true after Amazon
 * affiliate products are curated. Catalog JSON and URL builder stay in the repo.
 */
export const STORE_CATALOG_ENABLED = false;

/** Placeholder Associates tag — replace via EXPO_PUBLIC_AMAZON_ASSOCIATE_TAG. */
export const DEFAULT_AMAZON_ASSOCIATE_TAG = 'yourtag-20';

export function amazonAssociateTag(): string {
  const fromEnv = process.env.EXPO_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_AMAZON_ASSOCIATE_TAG;
}

export function isPlaceholderAssociateTag(tag = amazonAssociateTag()): boolean {
  return tag === DEFAULT_AMAZON_ASSOCIATE_TAG;
}

/** Intended GitHub Pages URL after Pages is enabled on this repo (docs/ folder). */
export const DEFAULT_PRIVACY_POLICY_URL = 'https://valrob0616.github.io/Compound-App/privacy.html';
export const DEFAULT_TERMS_OF_USE_URL = 'https://valrob0616.github.io/Compound-App/terms.html';
export const DEFAULT_PRIVACY_CONTACT_EMAIL = 'rob@imconintl.com';

type ExtraConfig = {
  privacyPolicyUrl?: string;
  termsOfUseUrl?: string;
  privacyContactEmail?: string;
};

function extra(): ExtraConfig {
  return (Constants.expoConfig?.extra ?? {}) as ExtraConfig;
}

export function privacyPolicyUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim();
  if (fromEnv) return fromEnv;
  const fromExtra = extra().privacyPolicyUrl?.trim();
  return fromExtra || DEFAULT_PRIVACY_POLICY_URL;
}

export function termsOfUseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_TERMS_OF_USE_URL?.trim();
  if (fromEnv) return fromEnv;
  const fromExtra = extra().termsOfUseUrl?.trim();
  return fromExtra || DEFAULT_TERMS_OF_USE_URL;
}

export function privacyContactEmail(): string {
  const fromEnv = process.env.EXPO_PUBLIC_PRIVACY_CONTACT_EMAIL?.trim();
  if (fromEnv) return fromEnv;
  const fromExtra = extra().privacyContactEmail?.trim();
  return fromExtra || DEFAULT_PRIVACY_CONTACT_EMAIL;
}
