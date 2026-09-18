import assert from 'node:assert/strict';
import test from 'node:test';

import { FAMILY_COMPOUND_TOPIC } from '../data/family-compound-topic.ts';
import { containsPhrase, itemMatchesSource, matchesTopicFilter } from './topic-filter.ts';

test('phrase match is punctuation- and hyphen-aware', () => {
  assert.equal(containsPhrase('Multi-generational ADU on family land', 'multi generational'), true);
  assert.equal(containsPhrase('Graduation day on the homestead', 'adu'), false);
  assert.equal(containsPhrase('A detached ADU for grandparents', 'adu'), true);
  assert.equal(containsPhrase('How to finance a barndominium', 'barndominium'), true);
  assert.equal(containsPhrase('Backyard micro-farm on shared acreage', 'micro farm'), true);
});

test('family-compound filter keeps compound living and related topics, not only multi-gen', () => {
  const keep = [
    'Shared wells and septic: infrastructure before floorplans for a family compound',
    'ADUs and guest houses: a second household on family land',
    'Privacy between a detached ADU and main house',
    '10 critical conversations before going multi-generational',
    'It takes a village: raising children in an intentional community',
    'Agrivillage cohousing on conserved farmland',
    'Financing a family compound: land loans and construction-to-permanent',
    'How to finance a barndominium on rural land',
    'Barndominiums and shop-houses as compound building types',
    'Compound design: site plans before floor plans',
    'A micro farm on compound acreage',
    'The backyard micro-farm: small spaces, big harvests',
    'Best barndominium lenders in Tennessee',
  ];
  for (const title of keep) {
    assert.equal(matchesTopicFilter(title, FAMILY_COMPOUND_TOPIC), true, title);
  }

  const drop = [
    'Fall garden succession: what to sow after the last tomatoes',
    'The magic of hot composting',
    'The case for rewilding your backyard (and front yard too)',
    'Canning safety refresh: altitude, headspace, and tested recipes',
    'Fence first: predator-wise poultry yards on a budget',
    'Seed saving after harvest: dry, label, and store',
    'How compound interest builds a retirement nest egg',
    'The climate crisis and why your lawn must go',
    'Closing the loneliness gap: practical tech for aging adults',
    'Promoting community through climate activism and webinars',
  ];
  for (const title of drop) {
    assert.equal(matchesTopicFilter(title, FAMILY_COMPOUND_TOPIC), false, title);
  }
});

test('curated family-compound feeds skip the mixed-site topic gate', () => {
  const yurtDiary = { title: 'How We Fit 4 Kids in our Off-Grid Yurt', description: 'Life in 450 sqft.' };
  assert.equal(itemMatchesSource(yurtDiary, { curatedFeed: true }, FAMILY_COMPOUND_TOPIC), true);
  assert.equal(itemMatchesSource(yurtDiary, { curatedFeed: false }, FAMILY_COMPOUND_TOPIC), false);
});

test('per-source keywords still apply on curated feeds', () => {
  const item = { title: 'Oak floors in the mudroom', description: 'Refinish or replace.' };
  assert.equal(
    itemMatchesSource(item, { curatedFeed: true, keywords: ['adu', 'multi-gen'] }, FAMILY_COMPOUND_TOPIC),
    false,
  );
});
