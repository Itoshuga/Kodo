import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Clock,
  MapPin,
  Trash2,
  Pencil,
  Route,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { StepTimeline } from '../components/trips/StepTimeline';
import { CollaboratorsPanel } from '../components/trips/CollaboratorsPanel';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useTripsStore } from '../store/tripsStore';
import { formatDuration } from '../utils/transport';
import { formatTripDateRange, getTripDayOptions } from '../utils/tripSchedule';

const defaultCover = 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop';

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trips = useTripsStore((s) => s.trips);
  const deleteTrip = useTripsStore((s) => s.deleteTrip);
  const loadTrips = useTripsStore((s) => s.loadTrips);
  const trip = trips.find((t) => t.id === id);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const dayScrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollDaysLeft, setCanScrollDaysLeft] = useState(false);
  const [canScrollDaysRight, setCanScrollDaysRight] = useState(false);

  if (!trip) {
    return (
      <PageLayout>
        <div className="flex min-h-screen flex-col lg:ml-72">
          <div className="page-container-centered">
            <EmptyState
              icon={<MapPin className="h-10 w-10" />}
              title="Trajet introuvable"
              description="Ce trajet n'existe pas ou a été supprimé."
              action={
                <Link to="/trips" className="btn-primary">
                  Retour aux trajets
                </Link>
              }
            />
          </div>
        </div>
      </PageLayout>
    );
  }

  const tripId = trip.id;
  const totalDuration = trip.steps.reduce((sum, s) => sum + (s.estimatedDuration || 0), 0);
  const firstPoint = trip.steps.find((s) => Boolean(s.from || s.to));
  const lastPoint = [...trip.steps].reverse().find((s) => Boolean(s.to || s.from));
  const firstFrom = firstPoint?.from || firstPoint?.to;
  const lastTo = lastPoint?.to || lastPoint?.from;
  const coverUrl = trip.coverImage || defaultCover;
  const dateRange = formatTripDateRange(trip);

  const dayOptions = getTripDayOptions(trip);
  const maxDayIndexInSteps = trip.steps.reduce((max, s) => Math.max(max, s.dayIndex ?? 0), 0);
  const allDayOptions = [...dayOptions];

  for (let i = dayOptions.length; i <= maxDayIndexInSteps; i += 1) {
    allDayOptions.push({
      index: i,
      shortLabel: `Jour ${i + 1}`,
      label: `Jour ${i + 1}`,
    });
  }

  const sortedSteps = [...trip.steps].sort((a, b) => a.order - b.order);
  const itineraryByDay = allDayOptions.map((day) => ({
    ...day,
    steps: sortedSteps.filter((s) => (s.dayIndex ?? 0) === day.index),
  }));
  const activeDay = itineraryByDay.find((d) => d.index === selectedDayIndex) ?? itineraryByDay[0];

  function updateDayScrollerState() {
    const node = dayScrollerRef.current;
    if (!node) return;
    const maxScrollLeft = node.scrollWidth - node.clientWidth;
    setCanScrollDaysLeft(node.scrollLeft > 4);
    setCanScrollDaysRight(node.scrollLeft < maxScrollLeft - 4);
  }

  function scrollDayCards(direction: 'left' | 'right') {
    const node = dayScrollerRef.current;
    if (!node) return;
    const amount = Math.max(180, Math.floor(node.clientWidth * 0.6));
    const next = direction === 'left' ? -amount : amount;
    node.scrollBy({ left: next, behavior: 'smooth' });
    window.setTimeout(updateDayScrollerState, 220);
  }

  function getDayCardParts(date?: string) {
    if (!date) return null;
    const value = new Date(`${date}T00:00:00`);
    if (Number.isNaN(value.getTime())) return null;

    return {
      weekday: value.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
      day: value.toLocaleDateString('fr-FR', { day: 'numeric' }),
      month: value.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
    };
  }

  async function handleDelete() {
    await deleteTrip(tripId);
    navigate('/trips');
  }

  useEffect(() => {
    const rafId = window.requestAnimationFrame(updateDayScrollerState);
    const onResize = () => updateDayScrollerState();
    window.addEventListener('resize', onResize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, [allDayOptions.length, selectedDayIndex]);

  return (
    <PageLayout>
      <div className="flex min-h-screen flex-col lg:ml-72">
        <div className="page-container-centered">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={coverUrl}
              alt=""
              className="h-48 w-full object-cover sm:h-56"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
              <Link
                to="/trips"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
                aria-label="Retour"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  to={`/trips/${tripId}/edit`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
                  aria-label="Modifier"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-red-500/80"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h1 className="text-2xl font-bold leading-tight text-white drop-shadow-md lg:text-3xl">
                {trip.title}
              </h1>
              {trip.description && (
                <p className="mt-1 text-sm text-white/80">{trip.description}</p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {dateRange && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-stone-600 shadow-sm ring-1 ring-stone-200/80">
                <Calendar className="h-3.5 w-3.5 text-stone-400" />
                {dateRange}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-stone-600 shadow-sm ring-1 ring-stone-200/80">
              <Calendar className="h-3.5 w-3.5 text-stone-400" />
              {allDayOptions.length} jour{allDayOptions.length > 1 ? 's' : ''}
            </span>
            {firstFrom && lastTo && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-stone-600 shadow-sm ring-1 ring-stone-200/80">
                <MapPin className="h-3.5 w-3.5 text-stone-400" />
                <span className="max-w-[120px] truncate">{firstFrom}</span>
                <span className="text-stone-300">&rarr;</span>
                <span className="max-w-[120px] truncate">{lastTo}</span>
              </span>
            )}
            {totalDuration > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-stone-600 shadow-sm ring-1 ring-stone-200/80">
                <Clock className="h-3.5 w-3.5 text-stone-400" />
                {formatDuration(totalDuration)}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-stone-600 shadow-sm ring-1 ring-stone-200/80">
              <Route className="h-3.5 w-3.5 text-stone-400" />
              {trip.steps.length} étape{trip.steps.length !== 1 ? 's' : ''}
            </span>
            <CollaboratorsPanel trip={trip} onTripUpdated={loadTrips} />
          </div>

          <div className="mt-8">
            {trip.steps.length === 0 ? (
              <EmptyState
                icon={<MapPin className="h-10 w-10" />}
                title="Aucune étape"
                description="Ajoutez des étapes pour détailler ce trajet."
                action={
                <Link
                    to={`/trips/${tripId}/steps/new?day=${selectedDayIndex}`}
                    className="btn-primary"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter une étape
                  </Link>
                }
              />
            ) : (
              <>
                <div className="mb-5">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Jour affiché
                  </label>
                  <div className="relative rounded-2xl border border-stone-200/80 bg-white p-2 shadow-sm">
                    {canScrollDaysLeft && (
                      <button
                        type="button"
                        onClick={() => scrollDayCards('left')}
                        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-stone-200 bg-white/95 p-1.5 text-stone-500 shadow-sm transition-colors hover:border-stone-300 hover:text-stone-700"
                        aria-label="Voir les jours précédents"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    )}
                    {canScrollDaysRight && (
                      <button
                        type="button"
                        onClick={() => scrollDayCards('right')}
                        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-stone-200 bg-white/95 p-1.5 text-stone-500 shadow-sm transition-colors hover:border-stone-300 hover:text-stone-700"
                        aria-label="Voir les jours suivants"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                    <div
                      ref={dayScrollerRef}
                      onScroll={updateDayScrollerState}
                      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
                    >
                      {allDayOptions.map((option) => {
                        const isActive = (activeDay?.index ?? 0) === option.index;
                        const parts = getDayCardParts(option.date);

                        return (
                          <button
                            key={option.index}
                            type="button"
                            onClick={() => setSelectedDayIndex(option.index)}
                            className={`group min-w-[112px] flex-shrink-0 rounded-xl border px-3 py-2.5 text-left transition-all duration-150 ${
                              isActive
                                ? 'border-teal-300 bg-teal-50 text-teal-800 shadow-sm'
                                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                            }`}
                            aria-label={option.label}
                            aria-pressed={isActive}
                          >
                            <p className={`text-[11px] font-semibold uppercase tracking-wider ${
                              isActive ? 'text-teal-600' : 'text-stone-400'
                            }`}>
                              {option.shortLabel}
                            </p>
                            {parts ? (
                              <>
                                <p className={`mt-1 text-[11px] uppercase tracking-wide ${
                                  isActive ? 'text-teal-700/90' : 'text-stone-400'
                                }`}>
                                  {parts.weekday}
                                </p>
                                <p className={`font-brand text-xl leading-tight ${
                                  isActive ? 'text-teal-800' : 'text-stone-800'
                                }`}>
                                  {parts.day}
                                </p>
                                <p className={`text-[11px] uppercase tracking-wide ${
                                  isActive ? 'text-teal-700/90' : 'text-stone-500'
                                }`}>
                                  {parts.month}
                                </p>
                              </>
                            ) : (
                              <p className="mt-2 text-xs font-medium text-stone-500">
                                Sans date
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {activeDay ? (
                  <section className="min-w-0 overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm sm:p-5">
                    <h3 className="font-brand text-xl font-bold text-stone-800">{activeDay.label}</h3>
                    {activeDay.steps.length === 0 ? (
                      <p className="mt-3 rounded-xl border border-dashed border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-500">
                        Aucune étape prévue pour ce jour.
                      </p>
                    ) : (
                      <div className="mt-4 min-w-0">
                        <StepTimeline steps={activeDay.steps} tripId={tripId} />
                      </div>
                    )}
                  </section>
                ) : null}

                <div className="mt-4 flex justify-center pb-4">
                  <Link
                    to={`/trips/${tripId}/steps/new?day=${activeDay?.index ?? selectedDayIndex}`}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-stone-200 px-5 py-3 text-sm font-semibold text-stone-500 transition-all duration-150 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter une étape
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="Supprimer ce trajet ?"
        description="Cette action est irréversible. Le trajet et toutes ses étapes seront définitivement supprimés."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </PageLayout>
  );
}

