import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, MapPin, Save, Sparkles } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useAuth } from '../contexts/AuthContext';
import {
  ACCENT_OPTIONS,
  DEFAULT_PROFILE_PREFERENCES,
  STYLE_LABELS,
  loadProfilePreferences,
  saveProfilePreferences,
  type ProfilePreferences,
  type TravelStyle,
} from '../utils/profilePreferences';

export function SettingsPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<ProfilePreferences>(DEFAULT_PROFILE_PREFERENCES);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrefs(loadProfilePreferences(user?.uid));
    setSaved(false);
  }, [user?.uid]);

  const accent = useMemo(() => {
    return ACCENT_OPTIONS.find((item) => item.key === prefs.accent) ?? ACCENT_OPTIONS[0];
  }, [prefs.accent]);

  const displayName = user?.username?.trim() || 'Utilisateur';
  const avatar = displayName.charAt(0).toUpperCase();

  function updatePref<K extends keyof ProfilePreferences>(key: K, value: ProfilePreferences[K]) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    saveProfilePreferences(user?.uid, prefs);
    setSaved(true);
  }

  function handleReset() {
    setPrefs(DEFAULT_PROFILE_PREFERENCES);
    setSaved(false);
  }

  return (
    <PageLayout>
      <div className="flex min-h-screen flex-col lg:ml-72">
        <div className="page-container-centered">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-800">Paramètres</h1>
              <p className="mt-1 text-sm text-stone-500">Personnalisez votre ambiance profil et votre identité voyage.</p>
            </div>
            <Link
              to="/profile"
              className="btn-ghost rounded-xl border border-stone-200 bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </div>

          <section
            className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${accent.coverClass} p-6 text-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.55)] lg:p-8`}
          >
            <div className="pointer-events-none absolute -right-16 -top-14 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-black/10 blur-2xl" />

            <div className="relative flex flex-col gap-5">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
                <div
                  className={`flex h-16 w-16 shrink-0 aspect-square items-center justify-center rounded-2xl bg-white/90 p-0 text-2xl font-bold leading-none text-stone-700 ring-4 ${accent.ringClass}`}
                >
                  {avatar}
                </div>
                <div>
                  <h2 className="text-xl font-semibold leading-tight text-white sm:text-2xl">{displayName}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/90">{prefs.bio}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:justify-start">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 font-semibold text-white backdrop-blur-sm">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Vérifié
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${accent.chipClass}`}>
                  <MapPin className="h-3.5 w-3.5" />
                  {prefs.city}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 font-semibold text-white backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  {STYLE_LABELS[prefs.style]}
                </span>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-stone-800">Customisation profil</h3>
              {saved && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  Sauvegardé
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-400">Ville phare</label>
                  <input
                    type="text"
                    value={prefs.city}
                    onChange={(e) => updatePref('city', e.target.value)}
                    className="input-field"
                    placeholder="Votre ville"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-400">Style</label>
                  <select
                    value={prefs.style}
                    onChange={(e) => updatePref('style', e.target.value as TravelStyle)}
                    className="input-field"
                  >
                    <option value="slow">Slow travel</option>
                    <option value="food">Food spots</option>
                    <option value="culture">Culture first</option>
                    <option value="photo">Photo walk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-400">Bio</label>
                <textarea
                  rows={4}
                  value={prefs.bio}
                  onChange={(e) => updatePref('bio', e.target.value)}
                  className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 transition-colors focus:border-teal-600 focus:outline-none"
                  placeholder="Parlez de votre façon de voyager..."
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-400">Ambiance visuelle</label>
                <div className="grid grid-cols-2 gap-2">
                  {ACCENT_OPTIONS.map((option) => {
                    const selected = prefs.accent === option.key;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => updatePref('accent', option.key)}
                        className={`rounded-xl border px-3 py-2 text-left transition-all ${
                          selected
                            ? 'border-stone-800 bg-stone-50'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <span className={`mb-1 block h-4 w-full rounded-full bg-gradient-to-r ${option.coverClass}`} />
                        <span className="text-xs font-semibold text-stone-700">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  className="btn-primary"
                >
                  <Save className="h-4 w-4" />
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-ghost rounded-xl border border-stone-200 bg-white"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
