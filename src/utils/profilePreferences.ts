export type AccentKey = 'sunset' | 'ocean' | 'forest' | 'midnight';
export type TravelStyle = 'slow' | 'food' | 'culture' | 'photo';

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
  city: 'Tokyo',
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
    label: 'Kyoto Garden',
    coverClass: 'from-emerald-600 via-teal-600 to-green-700',
    chipClass: 'bg-emerald-100/95 text-emerald-700',
    ringClass: 'ring-emerald-200',
  },
  {
    key: 'midnight',
    label: 'Night Rail',
    coverClass: 'from-slate-700 via-slate-800 to-slate-900',
    chipClass: 'bg-slate-100/95 text-slate-700',
    ringClass: 'ring-slate-200',
  },
];

export const STYLE_LABELS: Record<TravelStyle, string> = {
  slow: 'Slow travel',
  food: 'Food spots',
  culture: 'Culture first',
  photo: 'Photo walk',
};

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

