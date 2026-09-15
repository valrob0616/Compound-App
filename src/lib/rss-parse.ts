export type ParsedRssItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  imageUrl?: string;
  author?: string;
};

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n: string) => String.fromCharCode(parseInt(n, 16)));
}

function stripHtml(value: string): string {
  return decodeEntities(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return match ? stripHtml(match[1]) : '';
}

function mediaUrl(block: string): string | undefined {
  const media = block.match(/<media:content[^>]*url=["']([^"']+)["']/i);
  if (media?.[1]) return decodeEntities(media[1]);
  const enclosure = block.match(/<enclosure[^>]*url=["']([^"']+)["']/i);
  if (enclosure?.[1]) return decodeEntities(enclosure[1]);
  const img = block.match(/<img[^>]*src=["']([^"']+)["']/i);
  if (img?.[1]) return decodeEntities(img[1]);
  return undefined;
}

export function parseRssItems(xml: string): ParsedRssItem[] {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  return blocks
    .map((block) => {
      const title = tag(block, 'title');
      const link = tag(block, 'link') || tag(block, 'guid');
      const description = tag(block, 'description') || tag(block, 'content:encoded');
      const pubDate = tag(block, 'pubDate') || tag(block, 'dc:date');
      const author = tag(block, 'dc:creator') || tag(block, 'author') || undefined;
      return {
        title,
        link,
        description: description.slice(0, 280),
        pubDate,
        imageUrl: mediaUrl(block),
        author,
      };
    })
    .filter((item) => item.title && item.link);
}
