import type { CategoryId } from '@/types';

export type RssSource = {
  id: string;
  name: string;
  url: string;
  category: CategoryId;
  /** Optional keyword filter applied to title + summary (case-insensitive). */
  keywords?: string[];
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
    id: 'fic',
    name: 'Foundation for Intentional Community',
    url: 'https://www.ic.org/feed/',
    category: 'family-compounds',
  },
  {
    id: 'resilience',
    name: 'resilience.org',
    url: 'https://www.resilience.org/feed/',
    category: 'family-compounds',
    keywords: [
      'community',
      'land',
      'village',
      'homestead',
      'compound',
      'permaculture',
      'resilience',
      'garden',
      'compost',
      'farm',
      'cooperative',
      'intentional',
      'stewardship',
      'infrastructure',
      'neighbor',
      'soil',
      'food',
      'local',
    ],
  },
];
