export type AccentKey = 'sunset' | 'ocean' | 'forest' | 'midnight';
export type TravelStyle = 'slow' | 'food' | 'culture' | 'photo';
export type AppThemeClass = 'theme-sunset' | 'theme-ocean' | 'theme-garden' | 'theme-midnight';

export interface ProfilePreferences {
  city: string;
  bio: string;
  style: TravelStyle;
  accent: AccentKey;
}

export interface AccentOption {
  key: AccentKey;
  label: string;
  coverClass: string;
  chipClass: string;
  ringClass: string;
}

export const DEFAULT_PROFILE_PREFERENCES: ProfilePreferences = {
  city: 'Votre ville',
  bio: 'Je planifie mes trajets comme un carnet de voyage: simple, clair et précis.',
  style: 'culture',
  accent: 'forest',
};

export const ACCENT_OPTIONS: AccentOption[] = [
  {
    key: 'sunset',
    label: 'Sunset Loft',
    coverClass: 'from-rose-500 via-orange-500 to-amber-400',
    chipClass: 'bg-rose-100/95 text-rose-700',
    ringClass: 'ring-rose-200',
  },
  {
    key: 'ocean',
    label: 'Pacific Calm',
    coverClass: 'from-cyan-600 via-sky-600 to-blue-700',
    chipClass: 'bg-cyan-100/95 text-cyan-700',
    ringClass: 'ring-cyan-200',
  },
  {
    key: 'forest',
    label: 'Garden Breeze',
    coverClass: 'from-emerald-600 via-teal-600 to-green-700',
    chipClass: 'bg-emerald-100/95 text-emerald-700',
    ringClass: 'ring-emerald-200',
  },
  {
    key: 'midnight',
    label: 'Night Rail',
    coverClass: 'from-[#345f99] via-[#2a5186] to-[#1f3f6c]',
    chipClass: 'bg-[#dce7f7] text-[#2f5f9d]',
    ringClass: 'ring-[#b5c5da]',
  },
];

export const STYLE_LABELS: Record<TravelStyle, string> = {
  slow: 'Slow travel',
  food: 'Food spots',
  culture: 'Culture first',
  photo: 'Photo walk',
};

const THEME_CLASSES: readonly AppThemeClass[] = [
  'theme-sunset',
  'theme-ocean',
  'theme-garden',
  'theme-midnight',
];

const ACCENT_TO_THEME_CLASS: Record<AccentKey, AppThemeClass> = {
  sunset: 'theme-sunset',
  ocean: 'theme-ocean',
  forest: 'theme-garden',
  midnight: 'theme-midnight',
};

const THEME_META_COLORS: Record<AppThemeClass, string> = {
  'theme-sunset': '#f7f1ea',
  'theme-ocean': '#eef4f8',
  'theme-garden': '#f1f7f2',
  'theme-midnight': '#edf2f9',
};

function updateThemeMetaColor(color: string): void {
  if (typeof document === 'undefined') return;

  const tags = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
  tags.forEach((tag) => {
    tag.content = color;
  });
}

export function getThemeClassForAccent(accent: AccentKey): AppThemeClass {
  return ACCENT_TO_THEME_CLASS[accent] ?? 'theme-garden';
}

export function applyAppTheme(accent: AccentKey | null | undefined): void {
  if (typeof document === 'undefined') return;

  const safeAccent = accent ?? DEFAULT_PROFILE_PREFERENCES.accent;
  const themeClass = getThemeClassForAccent(safeAccent);
  const root = document.documentElement;

  THEME_CLASSES.forEach((className) => {
    root.classList.remove(className);
  });

  root.classList.add(themeClass);
  root.dataset.theme = safeAccent;

  updateThemeMetaColor(THEME_META_COLORS[themeClass]);
}

export function getProfilePreferencesStorageKey(uid: string): string {
  return `kodo_profile_preferences_${uid}`;
}

function parsePreferences(raw: string | null): Partial<ProfilePreferences> {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Partial<ProfilePreferences>;
    const safe: Partial<ProfilePreferences> = {};

    if (typeof parsed?.city === 'string') safe.city = parsed.city;
    if (typeof parsed?.bio === 'string') safe.bio = parsed.bio;
    if (typeof parsed?.style === 'string' && parsed.style in STYLE_LABELS) {
      safe.style = parsed.style as TravelStyle;
    }
    if (typeof parsed?.accent === 'string' && ACCENT_OPTIONS.some((option) => option.key === parsed.accent)) {
      safe.accent = parsed.accent as AccentKey;
    }

    return safe;
  } catch {
    return {};
  }
}

export function loadProfilePreferences(uid: string | null | undefined): ProfilePreferences {
  if (!uid) return DEFAULT_PROFILE_PREFERENCES;

  const storageKey = getProfilePreferencesStorageKey(uid);
  const stored = parsePreferences(localStorage.getItem(storageKey));

  return { ...DEFAULT_PROFILE_PREFERENCES, ...stored };
}

export function saveProfilePreferences(uid: string | null | undefined, prefs: ProfilePreferences): void {
  if (!uid) return;
  localStorage.setItem(getProfilePreferencesStorageKey(uid), JSON.stringify(prefs));
}

function getCachedUserUid(): string | null {
  try {
    const raw = localStorage.getItem('kodo_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { uid?: unknown };
    return typeof parsed?.uid === 'string' ? parsed.uid : null;
  } catch {
    return null;
  }
}

export function applyStoredThemePreference(): void {
  if (typeof window === 'undefined') return;
  const uid = getCachedUserUid();
  const prefs = loadProfilePreferences(uid);
  applyAppTheme(prefs.accent);
}
