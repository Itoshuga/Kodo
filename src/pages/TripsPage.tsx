import { Link } from 'react-router-dom';
import { Map, Plus } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { TripCard } from '../components/trips/TripCard';
import { EmptyState } from '../components/ui/EmptyState';
import { useTripsStore } from '../store/tripsStore';

export function TripsPage() {
  const { trips, loading } = useTripsStore();

  return (
    <PageLayout>
      <div className="flex min-h-screen flex-col lg:ml-72">
        <div className="page-container-centered">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-800">
                Mes trajets
              </h1>
              {trips.length > 0 && (
                <p className="mt-1 text-sm text-stone-500">
                  {trips.length} trajet{trips.length > 1 ? 's' : ''} enregistré{trips.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <Link
              to="/trips/new"
              className="btn-primary"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nouveau</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-teal-700 border-t-transparent" />
            </div>
          ) : trips.length === 0 ? (
            <EmptyState
              icon={<Map className="h-10 w-10" />}
              title="Aucun trajet"
              description="Commencez par créer votre premier trajet pour organiser votre voyage au Japon."
              action={
                <Link to="/trips/new" className="btn-primary">
                  <Plus className="h-4 w-4" />
                  Créer un trajet
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

