import { useState } from 'react';
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
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { StepTimeline } from '../components/trips/StepTimeline';
import { CollaboratorsPanel } from '../components/trips/CollaboratorsPanel';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useTripsStore } from '../store/tripsStore';
import { formatDuration } from '../utils/transport';

const defaultCover = 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop';

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trips = useTripsStore((s) => s.trips);
  const deleteTrip = useTripsStore((s) => s.deleteTrip);
  const loadTrips = useTripsStore((s) => s.loadTrips);
  const trip = trips.find((t) => t.id === id);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!trip) {
    return (
      <PageLayout>
        <div className="page-container">
          <EmptyState
            icon={<MapPin className="h-10 w-10" />}
            title="Trajet introuvable"
            description="Ce trajet n'existe pas ou a ete supprime."
            action={
              <Link to="/trips" className="btn-primary">
                Retour aux trajets
              </Link>
            }
          />
        </div>
      </PageLayout>
    );
  }

  const totalDuration = trip.steps.reduce(
    (sum, s) => sum + (s.estimatedDuration || 0),
    0
  );
  const firstFrom = trip.steps[0]?.from;
  const lastTo = trip.steps[trip.steps.length - 1]?.to;
  const coverUrl = trip.coverImage || defaultCover;

  async function handleDelete() {
    await deleteTrip(trip!.id);
    navigate('/trips');
  }

  return (
    <PageLayout>
      <div className="page-container">
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
                to={`/trips/${trip.id}/edit`}
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
          {trip.date && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-stone-600 shadow-sm ring-1 ring-stone-200/80">
              <Calendar className="h-3.5 w-3.5 text-stone-400" />
              {new Date(trip.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </span>
          )}
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
            {trip.steps.length} etape{trip.steps.length !== 1 ? 's' : ''}
          </span>
          <CollaboratorsPanel trip={trip} onTripUpdated={loadTrips} />
        </div>

        <div className="mt-8">
          {trip.steps.length === 0 ? (
            <EmptyState
              icon={<MapPin className="h-10 w-10" />}
              title="Aucune etape"
              description="Ajoutez des etapes pour detailler ce trajet."
              action={
                <Link
                  to={`/trips/${trip.id}/steps/new`}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une etape
                </Link>
              }
            />
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="section-title">Itineraire</h2>
              </div>
              <StepTimeline steps={trip.steps} tripId={trip.id} />
              <div className="mt-4 flex justify-center pb-4">
                <Link
                  to={`/trips/${trip.id}/steps/new`}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-stone-200 px-5 py-3 text-sm font-semibold text-stone-500 transition-all duration-150 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une etape
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="Supprimer ce trajet ?"
        description="Cette action est irreversible. Le trajet et toutes ses etapes seront definitivement supprimes."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </PageLayout>
  );
}
