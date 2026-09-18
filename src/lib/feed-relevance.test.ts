import assert from 'node:assert/strict';
import test from 'node:test';

import { FAMILY_COMPOUND_TOPIC } from '../data/family-compound-topic.ts';
import { RSS_SOURCES } from '../data/rss-sources.ts';
import { SEED_NEWS } from '../data/seed-news.ts';
import { CURATED_VIDEOS } from '../data/videos.ts';
import { matchesTopicFilter } from './topic-filter.ts';

test('homesteading RSS sources stay on the original homestead publishers', () => {
  const homestead = RSS_SOURCES.filter((source) => source.category === 'homesteading');
  assert.deepEqual(
    homestead.map((source) => source.id),
    ['hobby-farms', 'off-the-grid-news'],
  );
  assert.equal(
    homestead.every((source) => !source.keywords?.length && !source.curatedFeed),
    true,
  );
});

test('family-compound RSS widens past multi-gen-only blogs and still drops resilience.org', () => {
  const compound = RSS_SOURCES.filter((source) => source.category === 'family-compounds');
  const ids = compound.map((source) => source.id);
  assert.equal(ids.includes('resilience'), false);
  assert.equal(ids.includes('our-multi-gen-life'), false);
  assert.equal(ids.includes('four-gen-one-roof'), true);
  assert.equal(ids.includes('feels-like-homestead-multigen'), true);
  assert.equal(ids.includes('barndos'), true);
  assert.equal(ids.includes('buildmax'), true);
  assert.equal(ids.includes('locke-buildings'), true);
  assert.equal(ids.includes('homestead-org'), true);
  assert.equal(ids.includes('fic'), true);
  assert.equal(ids.includes('cohousing-alliance'), true);
  assert.equal(
    compound.some((source) => /resilience\.org/i.test(source.url)),
    false,
  );
  const curated = compound.filter((source) => source.curatedFeed).map((source) => source.id);
  assert.deepEqual(curated, ['four-gen-one-roof', 'feels-like-homestead-multigen', 'barndos']);
});

test('family-compound seed stories and videos match the compound topic bar', () => {
  const seeds = SEED_NEWS.filter((item) => item.category === 'family-compounds');
  assert.equal(seeds.length >= 6, true);
  const haystacks = seeds.map((item) => `${item.title} ${item.summary}`.toLowerCase());
  assert.equal(
    haystacks.some((hay) => hay.includes('financ')),
    true,
    'expected a financing seed',
  );
  assert.equal(
    haystacks.some((hay) => hay.includes('micro farm') || hay.includes('micro-farm')),
    true,
    'expected a micro-farm seed',
  );
  assert.equal(
    haystacks.some((hay) => hay.includes('barndominium')),
    true,
    'expected a barndominium seed',
  );
  assert.equal(
    haystacks.some((hay) => hay.includes('compound design') || hay.includes('site plan')),
    true,
    'expected a compound-design seed',
  );
  for (const item of seeds) {
    const hay = `${item.title} ${item.summary}`;
    assert.equal(matchesTopicFilter(hay, FAMILY_COMPOUND_TOPIC), true, item.title);
    assert.equal(/resilience\.org/i.test(item.url), false, item.title);
    assert.equal(/hot composting/i.test(item.title), false, item.title);
  }

  const videos = CURATED_VIDEOS.filter((item) => item.category === 'family-compounds');
  assert.equal(videos.length >= 4, true);
  for (const item of videos) {
    const hay = `${item.title} ${item.summary}`;
    assert.equal(matchesTopicFilter(hay, FAMILY_COMPOUND_TOPIC), true, item.title);
  }
});

test('homesteading seeds stay homesteading and do not need the compound topic bar', () => {
  const seeds = SEED_NEWS.filter((item) => item.category === 'homesteading');
  assert.equal(seeds.length >= 6, true);
  const genericGarden = seeds.find((item) => /garden succession/i.test(item.title));
  assert.ok(genericGarden);
  assert.equal(
    matchesTopicFilter(`${genericGarden.title} ${genericGarden.summary}`, FAMILY_COMPOUND_TOPIC),
    false,
  );
});
