export type CategoryId = 'homesteading' | 'family-compounds';

export type PreferredCategory = CategoryId | 'both';

export type NewsItem = {
  kind: 'news';
  id: string;
  category: CategoryId;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  author?: string;
};

export type VideoItem = {
  kind: 'video';
  id: string;
  category: CategoryId;
  title: string;
  summary: string;
  youtubeId: string;
  publishedAt: string;
  channel: string;
  durationLabel?: string;
};

export type FeedItem = NewsItem | VideoItem;

export type ProductCategory = CategoryId | 'both';

export type Product = {
  id: string;
  asin: string;
  title: string;
  blurb: string;
  category: ProductCategory;
  tags: string[];
};

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  preferredCategory: PreferredCategory;
};

export type FavoriteKind = 'news' | 'video' | 'learn';

/** Saved with the account on the server. `savedAt` is set by the server. */
export type FavoriteItem = {
  id: string;
  kind: FavoriteKind;
  title: string;
  subtitle?: string;
  url?: string;
  youtubeId?: string;
  savedAt: string;
};

export type FavoriteDraft = {
  id: string;
  kind: FavoriteKind;
  title: string;
  subtitle?: string;
  url?: string;
  youtubeId?: string;
};

export type FeedLoadResult = {
  items: FeedItem[];
  newsSource: 'live' | 'seed' | 'mixed';
};
