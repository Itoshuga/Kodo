const DEFAULT_COVER =
  'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined;
const UNSPLASH_API = 'https://api.unsplash.com';
const cache = new Map<string, string>();

interface UnsplashPhoto {
  id: string;
  width?: number;
  height?: number;
  urls?: {
    raw?: string;
    full?: string;
    regular?: string;
    small?: string;
  };
  links?: {
    download_location?: string;
  };
}

interface UnsplashSearchResponse {
  results?: UnsplashPhoto[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeQuery(rawQuery: string): string {
  return rawQuery.trim().replace(/\s+/g, ' ');
}

function getQueryCandidates(rawQuery: string): string[] {
  const base = normalizeQuery(rawQuery);
  if (!base) return [];

  const simplified = base
    .replace(/\b(voyage|trip|trajet|itineraire|itinéraire|roadtrip|sejour|séjour)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const candidates = [
    base,
    simplified,
    `${simplified || base} travel`,
  ].filter((item, index, list) => isNonEmptyString(item) && list.indexOf(item) === index);

  return candidates;
}

function optimizeUnsplashUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    parsed.searchParams.set('w', '1400');
    parsed.searchParams.set('q', '80');
    return parsed.toString();
  } catch {
    return url;
  }
}

function pickBestPhoto(photos: UnsplashPhoto[]): UnsplashPhoto | null {
  if (photos.length === 0) return null;

  const withUrl = photos.filter((photo) =>
    isNonEmptyString(photo.urls?.regular) ||
    isNonEmptyString(photo.urls?.full) ||
    isNonEmptyString(photo.urls?.raw) ||
    isNonEmptyString(photo.urls?.small)
  );

  if (withUrl.length === 0) return null;

  return withUrl.sort((a, b) => {
    const areaA = (a.width || 0) * (a.height || 0);
    const areaB = (b.width || 0) * (b.height || 0);
    return areaB - areaA;
  })[0];
}

async function fetchJson<T>(url: string, timeoutMs = 6000): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Version': 'v1',
      },
    });
    window.clearTimeout(timeoutId);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function trackUnsplashDownload(downloadLocation?: string): void {
  if (!UNSPLASH_ACCESS_KEY || !isNonEmptyString(downloadLocation)) return;

  const separator = downloadLocation.includes('?') ? '&' : '?';
  const url = `${downloadLocation}${separator}client_id=${encodeURIComponent(UNSPLASH_ACCESS_KEY)}`;

  fetch(url, {
    method: 'GET',
    headers: {
      'Accept-Version': 'v1',
    },
  }).catch(() => {
    // Best-effort analytics call required by Unsplash API guidelines.
  });
}

async function searchUnsplashImage(query: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) return null;

  const endpoint =
    `${UNSPLASH_API}/search/photos` +
    `?query=${encodeURIComponent(query)}` +
    '&orientation=landscape' +
    '&per_page=12' +
    '&content_filter=high' +
    '&order_by=relevant' +
    `&client_id=${encodeURIComponent(UNSPLASH_ACCESS_KEY)}`;

  const payload = await fetchJson<UnsplashSearchResponse>(endpoint);
  const results = payload?.results || [];
  const selected = pickBestPhoto(results);
  if (!selected) return null;

  const sourceUrl =
    selected.urls?.regular ||
    selected.urls?.full ||
    selected.urls?.raw ||
    selected.urls?.small;

  if (!isNonEmptyString(sourceUrl)) return null;

  trackUnsplashDownload(selected.links?.download_location);
  return optimizeUnsplashUrl(sourceUrl);
}

export async function getCoverImageForTrip(query: string): Promise<string> {
  const normalized = normalizeQuery(query).toLowerCase();
  if (!normalized) return DEFAULT_COVER;
  if (cache.has(normalized)) return cache.get(normalized)!;

  const candidates = getQueryCandidates(query);
  for (const candidate of candidates) {
    const image = await searchUnsplashImage(candidate);
    if (image) {
      cache.set(normalized, image);
      return image;
    }
  }

  cache.set(normalized, DEFAULT_COVER);
  return DEFAULT_COVER;
}

