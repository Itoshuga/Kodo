import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Clock3,
  ExternalLink,
  Info,
  Link2,
  MapPin,
  Pencil,
  Route,
  Trash2,
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { TransportIcon } from '../components/trips/TransportIcon';
import { useTripsStore } from '../store/tripsStore';
import { formatDuration, getTransportMeta } from '../utils/transport';
import { getTripDayOptions } from '../utils/tripSchedule';

function getLinkLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return url;
  }
}

export function StepDetailPage() {
  const { id, stepId } = useParams<{ id: string; stepId: string }>();
  const navigate = useNavigate();
  const trips = useTripsStore((s) => s.trips);
  const deleteStep = useTripsStore((s) => s.deleteStep);
  const trip = trips.find((t) => t.id === id);
  const step = trip?.steps.find((s) => s.id === stepId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (!trip || !step) {
    return (
      <PageLayout>
        <div className="flex min-h-screen flex-col lg:ml-72">
          <div className="page-container-centered">
            <EmptyState
              icon={<MapPin className="h-10 w-10" />}
              title="Étape introuvable"
              description="Cette étape n'existe pas ou a été supprimée."
              action={
                <Link to={trip ? `/trips/${trip.id}` : '/trips'} className="btn-primary">
                  Retour
                </Link>
              }
            />
          </div>
        </div>
      </PageLayout>
    );
  }

  const meta = getTransportMeta(step.type);
  const stepLink = step.link
    ? (/^[a-z][a-z0-9+.-]*:/i.test(step.link) ? step.link : `https://${step.link}`)
    : undefined;
  const durationLabel = step.estimatedDuration ? formatDuration(step.estimatedDuration) : undefined;
  const dayOptions = getTripDayOptions(trip);
  const dayLabel = dayOptions.find((d) => d.index === (step.dayIndex ?? 0))?.shortLabel || `Jour ${(step.dayIndex ?? 0) + 1}`;
  const fromLabel = step.from?.trim();
  const toLabel = step.to?.trim();
  const fullFromLabel = fromLabel || 'Point de départ';
  const fullToLabel = toLabel || 'Point d’arrivée';
  const infoRows = [
    step.departureTime ? { label: 'Départ', value: step.departureTime } : null,
    step.arrivalTime ? { label: 'Arrivée', value: step.arrivalTime } : null,
    step.estimatedDuration ? { label: 'Durée', value: formatDuration(step.estimatedDuration) } : null,
    step.lineName ? { label: 'Ligne', value: step.lineName } : null,
    step.platform ? { label: 'Quai / Sortie', value: step.platform } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  async function handleDelete() {
    setDeleteError('');
    try {
      await deleteStep(trip.id, step.id);
      navigate(`/trips/${trip.id}`);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Impossible de supprimer cette étape pour le moment.";
      setDeleteError(message);
      setShowDeleteModal(false);
    }
  }

  return (
    <PageLayout>
      <div className="flex min-h-screen flex-col lg:ml-72">
        <div className="page-container-centered lg:pb-10">
          <div className="mx-auto w-full max-w-3xl space-y-4">
            {deleteError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {deleteError}
              </div>
            )}
            <section className="rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Link
                    to={`/trips/${trip.id}`}
                    className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-800"
                    aria-label="Retour au trajet"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Étape {step.order + 1} / {trip.steps.length}
                    </p>
                    <h1 className="truncate text-xl font-bold text-stone-800 sm:text-2xl">
                      {step.title}
                    </h1>
                    <p className="mt-1.5 break-words text-sm font-medium leading-snug text-stone-600">
                      {fullFromLabel}
                      <span className="mx-1.5 text-stone-400">→</span>
                      {fullToLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/trips/${trip.id}/steps/${step.id}/edit`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 transition-colors hover:border-teal-300 hover:text-teal-700"
                    aria-label="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: `${meta.color}18`,
                    color: meta.color,
                  }}
                >
                  <TransportIcon type={step.type} size={14} />
                  {meta.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">
                  <Route className="h-3.5 w-3.5" />
                  Détail
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">
                  {dayLabel}
                </span>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200/80 bg-gradient-to-br from-white to-stone-50 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.45)]">
                <div className="grid grid-cols-2 gap-0">
                  <div className="relative p-4 sm:p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                      Départ
                    </p>
                    <p className="mt-2 font-brand text-2xl font-semibold tabular-nums text-stone-800 sm:text-[30px]">
                      {step.departureTime || '--:--'}
                    </p>
                    <p className="mt-1 break-words text-xs font-semibold leading-snug text-stone-600 sm:text-base">
                      {fullFromLabel}
                    </p>
                    <span className="mt-3 inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </div>

                  <div className="relative p-4 sm:p-5">
                    <span className="absolute left-0 top-4 bottom-4 w-px bg-stone-200" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                      Arrivée
                    </p>
                    <p className="mt-2 font-brand text-2xl font-semibold tabular-nums text-stone-800 sm:text-[30px]">
                      {step.arrivalTime || '--:--'}
                    </p>
                    <p className="mt-1 break-words text-xs font-semibold leading-snug text-stone-600 sm:text-base">
                      {fullToLabel}
                    </p>
                    <span className="mt-3 inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                  </div>
                </div>

                <div className="mx-4 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent sm:mx-5" />

                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs font-semibold text-stone-500 sm:px-5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-stone-200/80">
                    <ArrowRight className="h-3.5 w-3.5" />
                    Trajet
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {step.lineName && (
                      <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-stone-200/80">
                        {step.lineName}
                      </span>
                    )}
                    {durationLabel && (
                      <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-stone-200/80">
                        {durationLabel}
                      </span>
                    )}
                    {!step.lineName && !durationLabel && (
                      <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-stone-200/80">
                        {meta.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {infoRows.length > 0 && (
              <section className="rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Infos rapides</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {infoRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-2 rounded-xl border border-stone-200/80 bg-stone-50 px-3 py-2"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{row.label}</p>
                      <p
                        className={`text-sm font-semibold text-stone-700 ${
                          row.label === 'Départ' || row.label === 'Arrivée' ? 'font-sans tabular-nums text-base' : ''
                        }`}
                      >
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {step.note ? (
              <section className="rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Note</p>
                <div className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-stone-600">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" />
                  <p>{step.note}</p>
                </div>
              </section>
            ) : null}

            {stepLink && (
              <section className="rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Lien utile</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-stone-50 px-3 py-3">
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700">
                      <Link2 className="h-4 w-4 text-stone-400" />
                      {getLinkLabel(stepLink)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-stone-500">{stepLink}</p>
                  </div>
                  <a
                    href={stepLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-800"
                  >
                    Ouvrir
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-stone-500">
                {(step.departureTime || step.arrivalTime) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    Horaires
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {new Date(trip.updatedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </section>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="Supprimer cette étape ?"
        description="Cette action est irréversible. L'étape sera définitivement supprimée."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </PageLayout>
  );
}



