const DEFAULT_COVER =
  'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop';

const cache = new Map<string, string>();

function isValidImageUrl(url: string | undefined): url is string {
  if (!url) return false;
  const clean = url.split('?')[0];
  return /\.(jpg|jpeg|png|webp)$/i.test(clean);
}

async function fetchJson<T>(url: string, timeoutMs = 5000): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function searchWikipediaTitle(query: string, lang: 'fr' | 'en'): Promise<string | null> {
  const endpoint = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
    query
  )}&limit=1&namespace=0&format=json&origin=*`;
  const data = await fetchJson<[string, string[]]>(endpoint);
  const title = data?.[1]?.[0];
  return title || null;
}

interface WikiSummaryResponse {
  originalimage?: { source?: string };
  thumbnail?: { source?: string };
}

async function fetchWikipediaSummaryImage(title: string, lang: 'fr' | 'en'): Promise<string | null> {
  const endpoint = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    title
  )}`;
  const data = await fetchJson<WikiSummaryResponse>(endpoint);
  const image = data?.originalimage?.source || data?.thumbnail?.source;
  return isValidImageUrl(image) ? image : null;
}

async function fetchWikipediaImage(query: string): Promise<string | null> {
  for (const lang of ['fr', 'en'] as const) {
    const title = await searchWikipediaTitle(query, lang);
    if (!title) {
      // Fallback direct call if search does not return a page title.
      const direct = await fetchWikipediaSummaryImage(query, lang);
      if (direct) return direct;
      continue;
    }

    const image = await fetchWikipediaSummaryImage(title, lang);
    if (image) return image;
  }
  return null;
}

interface CommonsApiPage {
  imageinfo?: Array<{ url?: string }>;
}

interface CommonsApiResponse {
  query?: {
    pages?: Record<string, CommonsApiPage>;
  };
}

async function fetchCommonsImage(query: string): Promise<string | null> {
  const endpoint =
    `https://commons.wikimedia.org/w/api.php?action=query&generator=search` +
    `&gsrsearch=${encodeURIComponent(`${query} filetype:bitmap`)}` +
    `&gsrlimit=5&prop=imageinfo&iiprop=url&format=json&origin=*`;

  const data = await fetchJson<CommonsApiResponse>(endpoint);
  const pages = data?.query?.pages ? Object.values(data.query.pages) : [];
  for (const page of pages) {
    const image = page.imageinfo?.[0]?.url;
    if (isValidImageUrl(image)) return image;
  }
  return null;
}

export async function getCoverImageForTrip(query: string): Promise<string> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return DEFAULT_COVER;
  if (cache.has(normalized)) return cache.get(normalized)!;

  const wikiImage = await fetchWikipediaImage(query);
  if (wikiImage) {
    cache.set(normalized, wikiImage);
    return wikiImage;
  }

  const commonsImage = await fetchCommonsImage(query);
  if (commonsImage) {
    cache.set(normalized, commonsImage);
    return commonsImage;
  }

  cache.set(normalized, DEFAULT_COVER);
  return DEFAULT_COVER;
}
