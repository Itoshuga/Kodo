import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Map,
  Plus,
  Footprints,
  TrainFront,
  Zap,
  Wifi,
  Smartphone,
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { TripCard } from '../components/trips/TripCard';
import { useTripsStore } from '../store/tripsStore';

export function HomePage() {
  const trips = useTripsStore((s) => s.trips);
  const recentTrips = trips.slice(0, 3);

  return (
    <PageLayout>
      <div className="flex min-h-screen flex-col lg:ml-72">
        <div className="page-container-centered">
          <div className="relative overflow-hidden rounded-2xl gradient-hero px-5 pb-10 pt-10 lg:px-10">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
            <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/5" />

            <div className="relative">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <span className="font-brand text-xl font-bold text-white">K</span>
                </div>
                <h1 className="font-brand text-3xl font-bold text-white lg:text-4xl">
                  Kodo
                </h1>
              </div>
              <p className="max-w-md text-base leading-relaxed text-teal-100 lg:text-lg">
                Planifiez chaque étape de vos trajets de voyage.
                Métro, train, marche à pied -- tout est là, même hors-ligne.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/trips"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-teal-800 shadow-lg shadow-black/10 transition-all duration-150 hover:bg-white/95 hover:shadow-xl active:scale-[0.97]"
                >
                  <Map className="h-4 w-4" />
                  Mes trajets
                  {trips.length > 0 && (
                    <span className="ml-1 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-700">
                      {trips.length}
                    </span>
                  )}
                </Link>
                <Link
                  to="/trips/new"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-150 hover:bg-white/20 active:scale-[0.97]"
                >
                  <Plus className="h-4 w-4" />
                  Nouveau trajet
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: Footprints, label: 'Marche', bg: 'bg-green-50', fg: 'text-green-600' },
              { icon: TrainFront, label: 'Train', bg: 'bg-orange-50', fg: 'text-orange-600' },
              { icon: Zap, label: 'Express', bg: 'bg-red-50', fg: 'text-red-600' },
            ].map(({ icon: Icon, label, bg, fg }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-stone-100 bg-white py-4 shadow-sm"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${fg}`} />
                </div>
                <span className="text-xs font-semibold text-stone-600">{label}</span>
              </div>
            ))}
          </div>

          {recentTrips.length > 0 && (
            <div className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-stone-800">Trajets récents</h2>
                <Link
                  to="/trips"
                  className="flex items-center gap-1 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-800"
                >
                  Tout voir
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {recentTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
            <div className="border-b border-stone-100 px-5 py-4">
              <h3 className="text-sm font-bold text-stone-800">Concu pour le voyage</h3>
            </div>
            <div className="divide-y divide-stone-100">
              {[
                {
                  icon: Wifi,
                  title: 'Fonctionne hors-ligne',
                  desc: 'Toutes vos données restent accessibles sans connexion.',
                },
                {
                  icon: Smartphone,
                  title: 'Installable sur mobile',
                  desc: 'Ajoutez Kodo à votre écran d\'accueil comme une app native.',
                },
                {
                  icon: Map,
                  title: 'Étape par étape',
                  desc: 'Chaque trajet détaillé : lignes, quais, horaires, notes.',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4 px-5 py-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-stone-50">
                    <Icon className="h-5 w-5 text-stone-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-stone-800">{title}</h4>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-stone-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}



