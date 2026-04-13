import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  ChevronRight,
  Earth,
  LogOut,
  MapPin,
  Route,
  Settings,
  Sparkles,
  Timer,
  UserRound,
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useAuth } from '../contexts/AuthContext';
import { useTripsStore } from '../store/tripsStore';
import { formatDuration, getTransportMeta } from '../utils/transport';
import {
  ACCENT_OPTIONS,
  DEFAULT_PROFILE_PREFERENCES,
  STYLE_LABELS,
  loadProfilePreferences,
  type ProfilePreferences,
} from '../utils/profilePreferences';
import type { TransportType } from '../types/trip';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const trips = useTripsStore((s) => s.trips);
  const [prefs, setPrefs] = useState<ProfilePreferences>(DEFAULT_PROFILE_PREFERENCES);

  useEffect(() => {
    setPrefs(loadProfilePreferences(user?.uid));
  }, [user?.uid]);

  const accent = useMemo(() => {
    return ACCENT_OPTIONS.find((item) => item.key === prefs.accent) ?? ACCENT_OPTIONS[0];
  }, [prefs.accent]);

  const displayName = user?.username?.trim() || 'Utilisateur';
  const email = user?.email || '-';
  const avatar = displayName.charAt(0).toUpperCase();

  const tripCount = trips.length;

  const stepCount = useMemo(
    () => trips.reduce((sum, trip) => sum + trip.steps.length, 0),
    [trips]
  );

  const totalMinutes = useMemo(
    () => trips.reduce((sum, trip) => sum + trip.steps.reduce((acc, step) => acc + (step.estimatedDuration || 0), 0), 0),
    [trips]
  );

  const placeCount = useMemo(() => {
    const places = new Set<string>();
    trips.forEach((trip) => {
      trip.steps.forEach((step) => {
        if (step.from.trim()) places.add(step.from.trim().toLowerCase());
        if (step.to.trim()) places.add(step.to.trim().toLowerCase());
      });
    });
    return places.size;
  }, [trips]);

  const recentTrips = useMemo(() => {
    return [...trips]
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
      .slice(0, 3);
  }, [trips]);

  const topTransports = useMemo(() => {
    const counts: Partial<Record<TransportType, number>> = {};

    trips.forEach((trip) => {
      trip.steps.forEach((step) => {
        counts[step.type] = (counts[step.type] || 0) + 1;
      });
    });

    return (Object.entries(counts) as Array<[TransportType, number]>)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => ({
        type,
        count,
        meta: getTransportMeta(type),
      }));
  }, [trips]);

  return (
    <PageLayout>
      <div className="flex min-h-screen flex-col lg:ml-72">
        <div className="page-container-centered">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-800">Profil</h1>
              <p className="mt-1 text-sm text-stone-500">Votre vitrine voyage, avec l'essentiel.</p>
            </div>
            <Link
              to="/settings"
              className="btn-ghost rounded-xl border border-stone-200 bg-white"
            >
              <Settings className="h-4 w-4" />
              Paramètres
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

          <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-stone-200/80 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Trajets</p>
              <p className="mt-1 text-2xl font-bold text-stone-800">{tripCount}</p>
            </div>
            <div className="rounded-2xl border border-stone-200/80 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Etapes</p>
              <p className="mt-1 text-2xl font-bold text-stone-800">{stepCount}</p>
            </div>
            <div className="rounded-2xl border border-stone-200/80 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Lieux</p>
              <p className="mt-1 text-2xl font-bold text-stone-800">{placeCount}</p>
            </div>
            <div className="rounded-2xl border border-stone-200/80 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Temps planifie</p>
              <p className="mt-1 text-2xl font-bold text-stone-800">{totalMinutes > 0 ? formatDuration(totalMinutes) : '0 min'}</p>
            </div>
          </section>

          <section className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-stone-800">Ambiance de trajet</h3>
              {topTransports.length === 0 ? (
                <p className="mt-2 text-sm text-stone-500">Ajoutez des etapes pour faire apparaitre vos modes de transport preferes.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {topTransports.map(({ type, count, meta }) => (
                    <div key={type} className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2">
                      <span className="text-sm font-medium text-stone-700">{meta.label}</span>
                      <span className="text-xs font-semibold text-stone-500">{count} etape{count > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-stone-800">Trajets recents</h3>
                  <Link to="/trips" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
                    Voir tout
                  </Link>
                </div>

                {recentTrips.length === 0 ? (
                  <Link to="/trips/new" className="group flex items-center justify-between rounded-2xl border border-dashed border-stone-300 px-4 py-3 text-sm font-medium text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-800">
                    Creer votre premier trajet
                    <ChevronRight className="h-4 w-4 text-stone-400 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <div className="space-y-2">
                    {recentTrips.map((trip) => (
                      <Link
                        key={trip.id}
                        to={`/trips/${trip.id}`}
                        className="group flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3 transition-colors hover:border-stone-300"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-stone-800">{trip.title}</p>
                          <p className="mt-0.5 text-xs text-stone-500">{trip.steps.length} etape{trip.steps.length > 1 ? 's' : ''}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-stone-400 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-stone-800">Compte</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-600">
                    <UserRound className="h-4 w-4 text-stone-500" />
                    <span className="truncate">{displayName}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-600">
                    <Earth className="h-4 w-4 text-stone-500" />
                    <span className="truncate">{email}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-600">
                    <Route className="h-4 w-4 text-stone-500" />
                    <span>{tripCount} trajet{tripCount > 1 ? 's' : ''} prepares</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-600">
                    <Timer className="h-4 w-4 text-stone-500" />
                    <span>{totalMinutes > 0 ? formatDuration(totalMinutes) : '0 min'} de planification</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
                >
                  <LogOut className="h-4 w-4" />
                  Se deconnecter
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
