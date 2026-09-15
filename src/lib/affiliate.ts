const AMAZON_DP = 'https://www.amazon.com/dp';

export function amazonProductUrl(asin: string, tag: string): string {
  const cleanAsin = asin.trim().toUpperCase();
  const cleanTag = tag.trim();
  const url = new URL(`${AMAZON_DP}/${encodeURIComponent(cleanAsin)}`);
  if (cleanTag) {
    url.searchParams.set('tag', cleanTag);
  }
  return url.toString();
}

export function amazonImageUrl(asin: string): string {
  return `https://images-na.ssl-images-amazon.com/images/P/${asin.trim().toUpperCase()}.01._SCLZZZZZZZ_.jpg`;
}

export function youtubeWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(youtubeId)}`;
}

export function youtubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}?playsinline=1&rel=0`;
}

export function youtubeThumbUrl(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}
