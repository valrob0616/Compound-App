import assert from 'node:assert/strict';
import test from 'node:test';

import { YOUTUBE_THIRD_PARTY_DISCLAIMER, YOUTUBE_THIRD_PARTY_DISCLAIMER_TITLE } from '../content/youtube.ts';
import { FAMILY_COMPOUND_TOPIC } from '../data/family-compound-topic.ts';
import { CURATED_VIDEOS } from '../data/videos.ts';
import { matchesTopicFilter } from './topic-filter.ts';
import { videosForCategory } from './videos.ts';

const HOMESTEADING_HINTS = [
  'permaculture',
  'compost',
  'homestead',
  'garden',
  'soil',
  'water harvesting',
  'desert',
  'trees',
  'food producing',
  'food-producing',
];

test('featured videos exist for Homesteading and Family Compounds separately', () => {
  const homestead = videosForCategory('homesteading');
  const compound = videosForCategory('family-compounds');
  assert.equal(homestead.length >= 4, true);
  assert.equal(compound.length >= 4, true);
  assert.equal(
    homestead.every((item) => item.category === 'homesteading' && item.kind === 'video' && item.youtubeId.length > 0),
    true,
  );
  assert.equal(
    compound.every(
      (item) => item.category === 'family-compounds' && item.kind === 'video' && item.youtubeId.length > 0,
    ),
    true,
  );
  const homesteadIds = new Set(homestead.map((item) => item.id));
  assert.equal(
    compound.every((item) => !homesteadIds.has(item.id)),
    true,
  );
});

test('videosForCategory does not mix the other category into the list', () => {
  assert.equal(
    videosForCategory('homesteading').some((item) => item.category === 'family-compounds'),
    false,
  );
  assert.equal(
    videosForCategory('family-compounds').some((item) => item.category === 'homesteading'),
    false,
  );
  assert.equal(videosForCategory('homesteading').length + videosForCategory('family-compounds').length, CURATED_VIDEOS.length);
});

test('family-compound featured videos match the compound editorial bar', () => {
  const compound = videosForCategory('family-compounds');
  const haystacks = compound.map((item) => `${item.title} ${item.summary}`.toLowerCase());
  assert.equal(
    haystacks.some((hay) => hay.includes('barndominium')),
    true,
    'expected a barndominium clip',
  );
  assert.equal(
    haystacks.some((hay) => hay.includes('financ') || hay.includes('construction loan')),
    true,
    'expected a financing clip',
  );
  assert.equal(
    haystacks.some((hay) => hay.includes('micro farm') || hay.includes('micro-farm')),
    true,
    'expected a micro-farm clip',
  );
  assert.equal(
    haystacks.some((hay) => hay.includes('site plan') || hay.includes('compound design')),
    true,
    'expected a compound-design clip',
  );
  assert.equal(
    compound.some((item) => /tedx|four generations living together/i.test(item.title)),
    false,
    'de-emphasize TEDx / four-generation-only clips',
  );
  for (const item of compound) {
    const hay = `${item.title} ${item.summary}`;
    assert.equal(matchesTopicFilter(hay, FAMILY_COMPOUND_TOPIC), true, item.title);
  }
});

test('homesteading featured videos stay on homestead skills, not compound living', () => {
  const homestead = videosForCategory('homesteading');
  for (const item of homestead) {
    const hay = `${item.title} ${item.summary}`.toLowerCase();
    assert.equal(
      HOMESTEADING_HINTS.some((hint) => hay.includes(hint)),
      true,
      item.title,
    );
  }
  const genericGarden = homestead.find((item) => /compost|permaculture|desert/i.test(item.title));
  assert.ok(genericGarden);
  assert.equal(
    matchesTopicFilter(`${genericGarden.title} ${genericGarden.summary}`, FAMILY_COMPOUND_TOPIC),
    false,
  );
});

test('YouTube disclaimer states third-party ownership clearly', () => {
  const hay = `${YOUTUBE_THIRD_PARTY_DISCLAIMER_TITLE} ${YOUTUBE_THIRD_PARTY_DISCLAIMER}`.toLowerCase();
  assert.equal(hay.includes('third-party'), true);
  assert.equal(hay.includes('youtube'), true);
  assert.equal(hay.includes('not owned or created'), true);
  assert.equal(hay.includes('lfh inc'), true);
  assert.equal(hay.includes('family compound & homestead living'), true);
});
