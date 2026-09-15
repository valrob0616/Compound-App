import assert from 'node:assert/strict';
import test from 'node:test';

import { amazonProductUrl } from './affiliate.ts';

test('builds an Amazon dp URL with the associate tag', () => {
  const url = amazonProductUrl('B00006JSUA', 'yourtag-20');
  assert.equal(url, 'https://www.amazon.com/dp/B00006JSUA?tag=yourtag-20');
});

test('uppercases ASINs', () => {
  const url = amazonProductUrl('b00006jsua', 'demo-20');
  assert.equal(url.includes('/dp/B00006JSUA'), true);
  assert.equal(url.includes('tag=demo-20'), true);
});
