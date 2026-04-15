import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export type AccentKey = 'sunset' | 'ocean' | 'forest' | 'midnight';
export type TravelStyle = 'slow' | 'food' | 'culture' | 'photo';
export type AppThemeClass = 'theme-sunset' | 'theme-ocean' | 'theme-garden' | 'theme-midnight';
export type PrivacyVisibility = 'private' | 'contacts' | 'public';

export interface ProfilePreferences {
  city: string;
  bio: string;
  style: TravelStyle;
  accent: AccentKey;
}

export interface PrivacySettings {
  visibility: PrivacyVisibility;
  allowInvitesByEmail: boolean;
  showEmailToCollaborators: boolean;
  showActivityStatus: boolean;
  searchableByEmail: boolean;
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

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  visibility: 'contacts',
  allowInvitesByEmail: true,
  showEmailToCollaborators: false,
  showActivityStatus: true,
  searchableByEmail: true,
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
    label: 'Lavender Metro',
    coverClass: 'from-[#8a63c3] via-[#744fb0] to-[#5a3d90]',
    chipClass: 'bg-[#e8dcf7] text-[#6b4aa0]',
    ringClass: 'ring-[#c9b5dc]',
  },
];

export const STYLE_LABELS: Record<TravelStyle, string> = {
  slow: 'Slow travel',
  food: 'Food spots',
  culture: 'Culture first',
  photo: 'Photo walk',
};

export const PRIVACY_VISIBILITY_LABELS: Record<PrivacyVisibility, string> = {
  private: 'Privé',
  contacts: 'Collaborateurs',
  public: 'Public',
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
  'theme-midnight': '#f5f0fa',
};

function updateThemeMetaColor(color: string): void {
  if (typeof document === 'undefined') return;

  const tags = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
  tags.forEach((tag) => {
    tag.content = color;
  });
}

function sanitizePreferences(source: Partial<ProfilePreferences> | null | undefined): Partial<ProfilePreferences> {
  const safe: Partial<ProfilePreferences> = {};

  if (!source || typeof source !== 'object') return safe;

  if (typeof source.city === 'string') safe.city = source.city;
  if (typeof source.bio === 'string') safe.bio = source.bio;
  if (typeof source.style === 'string' && source.style in STYLE_LABELS) {
    safe.style = source.style as TravelStyle;
  }
  if (typeof source.accent === 'string' && ACCENT_OPTIONS.some((option) => option.key === source.accent)) {
    safe.accent = source.accent as AccentKey;
  }

  return safe;
}

function sanitizePrivacySettings(source: Partial<PrivacySettings> | null | undefined): Partial<PrivacySettings> {
  const safe: Partial<PrivacySettings> = {};

  if (!source || typeof source !== 'object') return safe;

  if (
    typeof source.visibility === 'string' &&
    source.visibility in PRIVACY_VISIBILITY_LABELS
  ) {
    safe.visibility = source.visibility as PrivacyVisibility;
  }
  if (typeof source.allowInvitesByEmail === 'boolean') {
    safe.allowInvitesByEmail = source.allowInvitesByEmail;
  }
  if (typeof source.showEmailToCollaborators === 'boolean') {
    safe.showEmailToCollaborators = source.showEmailToCollaborators;
  }
  if (typeof source.showActivityStatus === 'boolean') {
    safe.showActivityStatus = source.showActivityStatus;
  }
  if (typeof source.searchableByEmail === 'boolean') {
    safe.searchableByEmail = source.searchableByEmail;
  }

  return safe;
}

function extractFirestorePreferences(data: Record<string, unknown>): Partial<ProfilePreferences> {
  const nested =
    data.profilePreferences && typeof data.profilePreferences === 'object'
      ? (data.profilePreferences as Partial<ProfilePreferences>)
      : {};

  const legacy = {
    city: data.city,
    bio: data.bio,
    style: data.style,
    accent: data.accent,
  } as Partial<ProfilePreferences>;

  const merged = {
    ...legacy,
    ...nested,
    accent: nested.accent ?? (typeof data.themeAccent === 'string' ? data.themeAccent : legacy.accent),
  };

  return sanitizePreferences(merged as Partial<ProfilePreferences>);
}

function extractFirestorePrivacySettings(data: Record<string, unknown>): Partial<PrivacySettings> {
  const nested =
    data.privacySettings && typeof data.privacySettings === 'object'
      ? (data.privacySettings as Partial<PrivacySettings>)
      : {};

  const legacy = {
    visibility: data.visibility,
    allowInvitesByEmail: data.allowInvitesByEmail,
    showEmailToCollaborators: data.showEmailToCollaborators,
    showActivityStatus: data.showActivityStatus,
    searchableByEmail: data.searchableByEmail,
  } as Partial<PrivacySettings>;

  return sanitizePrivacySettings({ ...legacy, ...nested });
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

export function getPrivacySettingsStorageKey(uid: string): string {
  return `kodo_privacy_settings_${uid}`;
}

function parsePreferences(raw: string | null): Partial<ProfilePreferences> {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Partial<ProfilePreferences>;
    return sanitizePreferences(parsed);
  } catch {
    return {};
  }
}

function parsePrivacySettings(raw: string | null): Partial<PrivacySettings> {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Partial<PrivacySettings>;
    return sanitizePrivacySettings(parsed);
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

export function loadPrivacySettings(uid: string | null | undefined): PrivacySettings {
  if (!uid) return DEFAULT_PRIVACY_SETTINGS;

  const storageKey = getPrivacySettingsStorageKey(uid);
  const stored = parsePrivacySettings(localStorage.getItem(storageKey));

  return { ...DEFAULT_PRIVACY_SETTINGS, ...stored };
}

export function savePrivacySettings(uid: string | null | undefined, settings: PrivacySettings): void {
  if (!uid) return;
  localStorage.setItem(getPrivacySettingsStorageKey(uid), JSON.stringify(settings));
}

export async function loadProfilePreferencesFromFirestore(
  uid: string | null | undefined
): Promise<Partial<ProfilePreferences>> {
  if (!uid) return {};

  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return {};
    const data = snap.data() as Record<string, unknown>;
    return extractFirestorePreferences(data);
  } catch {
    return {};
  }
}

export async function loadPrivacySettingsFromFirestore(
  uid: string | null | undefined
): Promise<Partial<PrivacySettings>> {
  if (!uid) return {};

  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return {};
    const data = snap.data() as Record<string, unknown>;
    return extractFirestorePrivacySettings(data);
  } catch {
    return {};
  }
}

export async function saveProfilePreferencesToFirestore(
  uid: string | null | undefined,
  prefs: ProfilePreferences
): Promise<void> {
  if (!uid) return;

  const sanitized = {
    ...DEFAULT_PROFILE_PREFERENCES,
    ...sanitizePreferences(prefs),
  };

  await setDoc(
    doc(db, 'users', uid),
    {
      profilePreferences: sanitized,
      themeAccent: sanitized.accent,
    },
    { merge: true }
  );
}

export async function savePrivacySettingsToFirestore(
  uid: string | null | undefined,
  settings: PrivacySettings
): Promise<void> {
  if (!uid) return;

  const sanitized = {
    ...DEFAULT_PRIVACY_SETTINGS,
    ...sanitizePrivacySettings(settings),
  };

  await setDoc(
    doc(db, 'users', uid),
    {
      privacySettings: sanitized,
    },
    { merge: true }
  );
}

export async function hydrateProfilePreferences(
  uid: string | null | undefined
): Promise<ProfilePreferences> {
  const local = loadProfilePreferences(uid);
  if (!uid) return local;

  const remote = await loadProfilePreferencesFromFirestore(uid);
  const hasRemote = Object.keys(remote).length > 0;

  if (!hasRemote) {
    try {
      await saveProfilePreferencesToFirestore(uid, local);
    } catch {
      // Best-effort backfill.
    }
    return local;
  }

  const merged: ProfilePreferences = {
    ...DEFAULT_PROFILE_PREFERENCES,
    ...local,
    ...remote,
  };

  saveProfilePreferences(uid, merged);
  return merged;
}

export async function hydratePrivacySettings(
  uid: string | null | undefined
): Promise<PrivacySettings> {
  const local = loadPrivacySettings(uid);
  if (!uid) return local;

  const remote = await loadPrivacySettingsFromFirestore(uid);
  const hasRemote = Object.keys(remote).length > 0;

  if (!hasRemote) {
    try {
      await savePrivacySettingsToFirestore(uid, local);
    } catch {
      // Best-effort backfill.
    }
    return local;
  }

  const merged: PrivacySettings = {
    ...DEFAULT_PRIVACY_SETTINGS,
    ...local,
    ...remote,
  };

  savePrivacySettings(uid, merged);
  return merged;
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
