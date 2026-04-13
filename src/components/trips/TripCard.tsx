import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Clock, Route, Users } from 'lucide-react';
import type { Trip } from '../../types/trip';
import { TransportIcon } from './TransportIcon';
import { formatDuration, getTransportMeta } from '../../utils/transport';
import { useAuth } from '../../contexts/AuthContext';

interface TripCardProps {
  trip: Trip;
}

const defaultCover = 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop';

export function TripCard({ trip }: TripCardProps) {
  const { user } = useAuth();
  const totalDuration = trip.steps.reduce(
    (sum, s) => sum + (s.estimatedDuration || 0),
    0
  );
  const firstFrom = trip.steps[0]?.from;
  const lastTo = trip.steps[trip.steps.length - 1]?.to;
  const transportTypes = [...new Set(trip.steps.map((s) => s.type))];
  const coverUrl = trip.coverImage || defaultCover;
  const isShared = trip.ownerUid && user && trip.ownerUid !== user.uid;
  const hasCollabs = (trip.collaboratorUids?.length || 0) > 0;

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/80 transition-all duration-200 hover:shadow-lg hover:shadow-stone-200/50 hover:ring-stone-300/80 active:scale-[0.985]"
    >
      <div className="relative h-40 overflow-hidden sm:h-44">
        <img
          src={coverUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {trip.date && (
            <div className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-stone-700 shadow-sm backdrop-blur-sm">
              {new Date(trip.date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              })}
            </div>
          )}
          {(isShared || hasCollabs) && (
            <div className="flex items-center gap-1 rounded-lg bg-teal-600/90 px-2 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm">
              <Users className="h-3 w-3" />
              {isShared ? 'Partage' : 'Collaboratif'}
            </div>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold leading-tight text-white drop-shadow-sm">
            {trip.title}
          </h3>
        </div>
      </div>

      <div className="px-4 py-3.5">
        {firstFrom && lastTo && (
          <div className="flex items-center gap-2 text-[13px] text-stone-600">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-stone-400" />
            <span className="truncate">{firstFrom}</span>
            <ChevronRight className="h-3 w-3 flex-shrink-0 text-stone-300" />
            <span className="truncate">{lastTo}</span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {transportTypes.slice(0, 5).map((type) => {
              const meta = getTransportMeta(type);
              return (
                <span
                  key={type}
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${meta.color}12` }}
                >
                  <TransportIcon type={type} size={13} />
                </span>
              );
            })}
            {transportTypes.length > 5 && (
              <span className="ml-0.5 text-xs text-stone-400">
                +{transportTypes.length - 5}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-medium text-stone-500">
            <span className="flex items-center gap-1">
              <Route className="h-3 w-3" />
              {trip.steps.length}
            </span>
            {totalDuration > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(totalDuration)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
