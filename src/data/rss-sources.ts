import { FAMILY_COMPOUND_TOPIC, type TopicFilter } from './family-compound-topic.ts';
import type { CategoryId } from '../types/index.ts';

export type RssSource = {
  id: string;
  name: string;
  url: string;
  category: CategoryId;
  /** Optional keyword filter applied to title + summary (phrase-aware). */
  keywords?: string[];
  /**
   * When true, skip the category-wide topic filter. Use for feeds that are
   * already a dedicated Family Compound, barndominium, or compound-living
   * category — not a mixed site.
   */
  curatedFeed?: boolean;
};

/** Extra gate applied to live Family Compound RSS unless `curatedFeed` is true. */
export const CATEGORY_TOPIC_FILTERS: Partial<Record<CategoryId, TopicFilter>> = {
  'family-compounds': FAMILY_COMPOUND_TOPIC,
};

export const RSS_SOURCES: RssSource[] = [
  {
    id: 'hobby-farms',
    name: 'Hobby Farms',
    url: 'https://www.hobbyfarms.com/feed/',
    category: 'homesteading',
  },
  {
    id: 'off-the-grid-news',
    name: 'Off The Grid News',
    url: 'https://www.offthegridnews.com/feed/',
    category: 'homesteading',
  },
  {
    id: 'four-gen-one-roof',
    name: 'Four Generations One Roof',
    url: 'https://www.fourgenerationsoneroof.com/category/multigenerational-living/feed/',
    category: 'family-compounds',
    curatedFeed: true,
  },
  {
    id: 'feels-like-homestead-multigen',
    name: 'Feels Like Homestead',
    url: 'https://feelslikehomestead.com/category/multigenerational-living/feed/',
    category: 'family-compounds',
    curatedFeed: true,
  },
  {
    id: 'barndos',
    name: 'Barndos',
    url: 'https://barndos.com/feed',
    category: 'family-compounds',
    curatedFeed: true,
  },
  {
    id: 'buildmax',
    name: 'BuildMax',
    url: 'https://buildmax.com/feed',
    category: 'family-compounds',
  },
  {
    id: 'locke-buildings',
    name: 'Locke Buildings',
    url: 'https://lockebuildings.com/feed/',
    category: 'family-compounds',
  },
  {
    id: 'homestead-org',
    name: 'Homestead.org',
    url: 'https://www.homestead.org/feed/',
    category: 'family-compounds',
  },
  {
    id: 'fic',
    name: 'Foundation for Intentional Community',
    url: 'https://www.ic.org/feed/',
    category: 'family-compounds',
  },
  {
    id: 'cohousing-alliance',
    name: 'Cohousing Alliance',
    url: 'https://cohousingalliance.org/feed/',
    category: 'family-compounds',
  },
];
