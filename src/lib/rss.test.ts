import assert from 'node:assert/strict';
import test from 'node:test';

import { parseRssItems } from './rss-parse.ts';

const sample = `<?xml version="1.0"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <item>
      <title>Fence first on the homestead</title>
      <link>https://example.com/fence</link>
      <description><![CDATA[<p>Hardware cloth beats chicken wire.</p>]]></description>
      <pubDate>Mon, 08 Sep 2026 12:00:00 GMT</pubDate>
      <dc:creator>Editor</dc:creator>
      <media:content url="https://example.com/img.jpg" />
    </item>
  </channel>
</rss>`;

test('parses a WordPress-style RSS item', () => {
  const [item] = parseRssItems(sample);
  assert.equal(item.title, 'Fence first on the homestead');
  assert.equal(item.link, 'https://example.com/fence');
  assert.equal(item.description.includes('Hardware cloth'), true);
  assert.equal(item.author, 'Editor');
  assert.equal(item.imageUrl, 'https://example.com/img.jpg');
});
