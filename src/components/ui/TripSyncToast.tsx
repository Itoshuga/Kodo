import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import { useTripsStore } from '../../store/tripsStore';

const SUCCESS_AUTO_CLOSE_MS = 1800;
const ERROR_AUTO_CLOSE_MS = 6000;

export function TripSyncToast() {
  const syncStatus = useTripsStore((s) => s.syncStatus);
  const syncMessage = useTripsStore((s) => s.syncMessage);
  const syncError = useTripsStore((s) => s.syncError);
  const dismissSyncStatus = useTripsStore((s) => s.dismissSyncStatus);

  useEffect(() => {
    if (syncStatus === 'saved') {
      const timeoutId = window.setTimeout(() => dismissSyncStatus(), SUCCESS_AUTO_CLOSE_MS);
      return () => window.clearTimeout(timeoutId);
    }
    if (syncStatus === 'error') {
      const timeoutId = window.setTimeout(() => dismissSyncStatus(), ERROR_AUTO_CLOSE_MS);
      return () => window.clearTimeout(timeoutId);
    }
    return undefined;
  }, [syncStatus, dismissSyncStatus]);

  if (syncStatus === 'idle') return null;

  const cardTone =
    syncStatus === 'error'
      ? 'border-rose-200/80'
      : syncStatus === 'saved'
        ? 'border-emerald-200/80'
        : 'border-teal-200/80';

  const title =
    syncStatus === 'error'
      ? 'Echec de synchronisation'
      : syncStatus === 'saved'
        ? 'Sauvegarde reussie'
        : syncMessage || 'Synchronisation en cours...';

  const description =
    syncStatus === 'error'
      ? syncError || 'Une erreur est survenue pendant la synchronisation.'
      : syncStatus === 'saved'
        ? syncMessage || 'Vos modifications sont enregistrees.'
        : 'Vos modifications sont envoyees vers votre compte.';

  return (
    <div className="pointer-events-none fixed inset-x-4 top-20 z-[79] flex justify-center lg:inset-x-auto lg:right-6 lg:top-24">
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border bg-white/95 shadow-lg shadow-stone-900/5 backdrop-blur-sm ${cardTone}`}
      >
        <div className="flex items-start gap-3 px-4 py-3.5">
          <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-700">
            {syncStatus === 'syncing' ? (
              <Loader2 className="h-4 w-4 animate-spin text-teal-700" />
            ) : syncStatus === 'saved' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-stone-800">{title}</p>
            <p className="mt-0.5 text-xs text-stone-500">{description}</p>
          </div>
          {syncStatus !== 'syncing' && (
            <button
              type="button"
              onClick={dismissSyncStatus}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
              aria-label="Fermer la notification de synchronisation"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

